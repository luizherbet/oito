from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.enums import AppointmentStatus
from app.models.appointment import Appointment
from app.models.schedule import Schedule
from app.models.service import Service
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentRead

router = APIRouter(prefix="/appointments", tags=["appointments"])


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


def _to_read(a: Appointment) -> AppointmentRead:
    return AppointmentRead(
        id=a.id,
        client_id=a.client_id,
        professional_id=a.professional_id,
        service_id=a.service_id,
        appointment_date=a.appointment_date,
        appointment_time=a.appointment_time,
        status=a.status,
        notes=a.notes,
        created_at=a.created_at,
        updated_at=a.updated_at,
        client_name=a.client.name,
        professional_name=a.professional.name,
        service_title=a.service.title,
    )


def _load_appointment_graph(db: Session, appt_id: int) -> Appointment:
    row = (
        db.query(Appointment)
        .options(
            joinedload(Appointment.client),
            joinedload(Appointment.professional),
            joinedload(Appointment.service),
        )
        .filter(Appointment.id == appt_id)
        .one_or_none()
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return row


@router.get("/me", response_model=list[AppointmentRead])
def list_my_appointments_as_client(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AppointmentRead]:
    if not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    rows = (
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
    return [_to_read(a) for a in rows]


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
    rows = (
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
    return [_to_read(a) for a in rows]


@router.get("/{appointment_id}", response_model=AppointmentRead)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AppointmentRead:
    if not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    a = _load_appointment_graph(db, appointment_id)
    if a.client_id != current_user.id and a.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to view this appointment")
    return _to_read(a)


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
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

    loaded = _load_appointment_graph(db, appointment.id)
    return _to_read(loaded)

@router.patch("/{appointment_id}/confirm", response_model=AppointmentRead)
def confirm_appointment(appointment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db))-> AppointmentRead:
    if not current_user.is_active or not current_user.is_professional:
        raise HTTPException(status_code=401, detail="Inactive user")

    appointment = _load_appointment_graph(db, appointment_id)
    if appointment.professional_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed to view this appointment")
    if appointment.status != AppointmentStatus.pending:
        raise HTTPException(status_code=409, detail="Only pending appointments can be confirmed")
    appointment.status = AppointmentStatus.confirmed
    db.commit()
    loaded = _load_appointment_graph(db, appointment.id)
    return _to_read(loaded)

#deve ser profissional ok
#id do prof do agendamento == current user
#se o status atual for pendente
#confirma