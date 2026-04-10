from datetime import datetime, time

from pydantic import BaseModel

class ScheduleCreate(BaseModel):
    professional_id: int
    day_of_week: int
    start_time: time
    end_time: time
    is_active: bool


class ScheduleRead(BaseModel):
    id: int
    professional_id: int
    day_of_week: int
    start_time: time
    end_time: time
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True