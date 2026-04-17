from typing import List

from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    zipcode: str
    city: str
    address: str
    phone: str
    password: str
    is_professional: bool = False
    role: str

class ServiceMini(BaseModel):
    id: int
    title: str
    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    zipcode: str
    address: str
    city: str
    phone: str
    is_professional: bool
    role: str
    services: List[ServiceMini]

    class Config:
        from_attributes = True