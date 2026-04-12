from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import time

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleRead

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("/me", response_model=list[ScheduleRead])
def list_my_schedules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ScheduleRead]:
    if not current_user.is_professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a professional user",
        )
    rows = (
        db.query(Schedule)
        .filter(Schedule.professional_id == current_user.id)
        .order_by(Schedule.day_of_week, Schedule.start_time)
        .all()
    )
    return rows


@router.post("/", response_model=ScheduleRead, status_code=status.HTTP_201_CREATED)
def create_schedule(payload: ScheduleCreate, current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)) -> ScheduleRead:
    if not current_user.is_professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a professional user",
        )
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    if payload.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="professional_id must match the authenticated user",
        )

    # dias 0 1 2 3 4 5 6
    if not (payload.day_of_week >= 0 and payload.day_of_week <= 6):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    if not payload.start_time < payload.end_time:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Inactive user", )
    open_hour = time(7, 0)
    close_hour = time(22, 0)

    if not (payload.start_time >= open_hour ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Inactive user", )

    if not (payload.end_time <= close_hour ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Inactive user", )


    # hora 08:00
    # dia-hora 0-08:00

    schedule = Schedule(
        professional_id=payload.professional_id,
        day_of_week=payload.day_of_week,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_active=True,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return schedule