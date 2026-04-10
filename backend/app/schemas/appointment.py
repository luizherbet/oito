from datetime import datetime, time

from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    client_id: int
    professional_id: int
    service_id: int
    status: str
    notes: str
    date: datetime
    time: time


class AppointmentRead(BaseModel):
    id: int
    client_id: int
    professional_id: int
    service_id: int
    date: datetime
    time: time
    status: str
    notes: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True