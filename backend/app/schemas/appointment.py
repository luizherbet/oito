from datetime import date, datetime, time
from app.enums import AppointmentStatus
from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    professional_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    notes: str | None = Field(default=None, max_length=2000)

class AppointmentReschedule(BaseModel):
    appointment_date: date
    appointment_time: time
    notes: str | None = Field(default=None, max_length=2000)

class UserMini(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class ServiceMini(BaseModel):
    id: int
    title: str
    class Config:
        from_attributes = True

class AppointmentRead(BaseModel):
    id: int
    client_id: int
    professional_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    status: AppointmentStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime
    client: UserMini
    professional: UserMini
    service: ServiceMini
    class Config:
        from_attributes = True