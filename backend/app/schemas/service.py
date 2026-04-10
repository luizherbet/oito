from datetime import datetime

from pydantic import BaseModel

class ServiceCreate(BaseModel):
    title: str
    description: str
    price: float

class ServiceRead(BaseModel):
    id: int
    professional_id: int
    title: str
    description: str
    price: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True