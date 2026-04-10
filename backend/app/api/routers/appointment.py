# app/api/routers/appointment.py
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
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
    appointment_time, schedules: list[Schedule]
) -> bool:
    """True se o horário cai em [start_time, end_time) de algum intervalo."""
    for s in schedules:
        if s.start_time <= appointment_time < s.end_time:
            return True
    return False


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
        raise HTTPException(status_code=404, detail="Services not found")

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
        payload.appointment_time, day_schedules
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
        status=payload.status,
        notes=payload.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return appointment