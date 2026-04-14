from datetime import date, datetime, time
from app.enums import AppointmentStatus
from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    """Pedido de agendamento (o cliente é sempre o utilizador autenticado)."""

    professional_id: int
    service_id: int
    appointment_date: date
    appointment_time: time
    notes: str | None = Field(default=None, max_length=2000)

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
    client_name: str
    professional_name: str
    service_title: str

    class Config:
        from_attributes = True
