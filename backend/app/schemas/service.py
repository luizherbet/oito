from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ServiceDurationMinutes = Literal[30, 60, 90, 120]


class ServiceCreate(BaseModel):
    title: str
    description: str
    price: float
    estimated_minutes: ServiceDurationMinutes


class ServiceRead(BaseModel):
    id: int
    professional_id: int
    title: str
    description: str | None
    price: float
    estimated_minutes: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True