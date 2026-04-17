from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.enums import AppointmentStatus
from app.models.appointment import Appointment
from app.models.schedule import Schedule
from app.models.service import Service
from app.models.user import User
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentReschedule,
)
from app.services.email import (
    send_appointment_cancelled_email,
    send_appointment_confirmed_email,
    send_appointment_created_email,
    send_appointment_rescheduled_email,
)

router = APIRouter(prefix="/appointments", tags=["appointments"])

def _queue_appointment_emails(background_tasks: BackgroundTasks, appointment: Appointment, email_sender) -> None:
    appointment_date = str(appointment.appointment_date)
    appointment_time = str(appointment.appointment_time)

    background_tasks.add_task(
        email_sender,
        appointment.client.email,
        appointment.client.name,
        appointment.professional.name,
        appointment.service.title,
        appointment_date,
        appointment_time,
    )

    background_tasks.add_task(
        email_sender,
        appointment.professional.email,
        appointment.professional.name,
        appointment.client.name,
        appointment.service.title,
        appointment_date,
        appointment_time,
    )


def _day_of_week_sunday_zero(d: date) -> int:
    """Alinha com Schedule: 0=domingo … 6=sábado."""
    return (d.weekday() + 1) % 7


def _time_in_any_schedule_window(
    appointment_time,
    schedules: list[Schedule],
) -> bool:
    """True se o horário cai em [start_time, end_time) de algum intervalo."""
    for s in schedules:
        if s.start_time <= appointment_time < s.end_time:
            return True
    return False


#AGENDAMENTOS FEITOS COMO CLIENTE
@router.get("/me", response_model=list[AppointmentRead])
def list_my_appointments_as_client(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AppointmentRead]:

    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    appointments = (
        db.query(Appointment)
            .options(
                joinedload(Appointment.client),
                joinedload(Appointment.professional),
                joinedload(Appointment.service),
            )
            .filter(Appointment.client_id == current_user.id)
            .order_by(
                Appointment.appointment_date.desc(),
                Appointment.appointment_time.desc(),
            )
            .all()
    )
    return appointments

#AGENDAMENTOS RECEBIDOS COMO PROFISSIONAL
@router.get("/incoming", response_model=list[AppointmentRead])
def list_incoming_appointments_as_professional(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AppointmentRead]:
    if not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    if not current_user.is_professional:
        raise HTTPException(
            status_code=403,
            detail="Only professionals can view incoming appointments",
        )
    appoiments = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.client),
            joinedload(Appointment.professional),
            joinedload(Appointment.service),
        )
        .filter(Appointment.professional_id == current_user.id)
        .order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc(),
        )
        .all()
    )
    return appoiments


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    appointment = db.query(Appointment).get(appointment_id)
    if appointment.client_id != current_user.id and appointment.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to view this appointment")
    return appointment


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    if payload.professional_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can't book an appointment with yourself",
        )

    service = (
        db.query(Service)
        .filter(Service.id == payload.service_id)
        .filter(Service.professional_id == payload.professional_id)
        .filter(Service.is_active.is_(True))
        .first()
    )
    if service is None:
        raise HTTPException(status_code=404, detail="Service not found")

    dow = _day_of_week_sunday_zero(payload.appointment_date)
    day_schedules = (
        db.query(Schedule)
        .filter(Schedule.professional_id == payload.professional_id)
        .filter(Schedule.day_of_week == dow)
        .filter(Schedule.is_active.is_(True))
        .all()
    )
    if not day_schedules:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Professional has no schedule for this weekday",
        )

    if not _time_in_any_schedule_window(
        payload.appointment_time,
        day_schedules,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time is outside professional schedule for this day",
        )

    conflict = (
        db.query(Appointment)
        .filter(Appointment.professional_id == payload.professional_id)
        .filter(Appointment.appointment_date == payload.appointment_date)
        .filter(Appointment.appointment_time == payload.appointment_time)
        .first()
    )
    if conflict is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Appointment already exists for this date and time",
        )

    appointment = Appointment(
        client_id=current_user.id,
        professional_id=payload.professional_id,
        service_id=payload.service_id,
        appointment_date=payload.appointment_date,
        appointment_time=payload.appointment_time,
        status=AppointmentStatus.pending,
        notes=payload.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    _queue_appointment_emails(background_tasks, appointment, send_appointment_created_email)

    return appointment

@router.patch("/{appointment_id}/confirm", response_model=AppointmentRead)
def confirm_appointment(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active or not current_user.is_professional:
        raise HTTPException(status_code=403, detail="User not allowed")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this appointment")

    if appointment.status != AppointmentStatus.pending:
        raise HTTPException(
            status_code=409,
            detail="Only pending appointments can be confirmed"
        )

    appointment.status = AppointmentStatus.confirmed
    db.commit()
    db.refresh(appointment)

    _queue_appointment_emails(background_tasks, appointment, send_appointment_confirmed_email)

    return appointment


@router.patch("/{appointment_id}/cancel", response_model=AppointmentRead)
def cancel_appointment(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active or not current_user.is_professional:
        raise HTTPException(status_code=403, detail="User not allowed")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this appointment")

    if appointment.status != AppointmentStatus.pending:
        raise HTTPException(
            status_code=409,
            detail="Only pending appointments can be cancelled"
        )

    appointment.status = AppointmentStatus.cancelled
    db.commit()
    db.refresh(appointment)

    _queue_appointment_emails(background_tasks, appointment, send_appointment_cancelled_email)

    return appointment

@router.patch("/{appointment_id}/reschedule", response_model=AppointmentRead)
def reschedule_appointment(
    appointment_id: int,
    payload: AppointmentReschedule,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active or not current_user.is_professional:
        raise HTTPException(status_code=403, detail="User not allowed")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to modify this appointment")

    if appointment.status != AppointmentStatus.pending:
        raise HTTPException(
            status_code=409,
            detail="Only pending appointments can be rescheduled"
        )

    appointment.appointment_date = payload.appointment_date
    appointment.appointment_time = payload.appointment_time
    appointment.notes = payload.notes
    appointment.status = AppointmentStatus.rescheduled

    db.commit()
    db.refresh(appointment)

    _queue_appointment_emails(
        background_tasks,
        appointment,
        send_appointment_rescheduled_email,
    )

    return appointment
#deve ser profissional ok
#id do prof do agendamento == current user
#se o status atual for pendente
#confirma