from typing import Literal

from pydantic import BaseModel, Field


class ProfessionalHit(BaseModel):
    type: Literal["professional"] = "professional"
    id: int
    name: str
    email: str
    role: str


class ServiceHit(BaseModel):
    type: Literal["service"] = "service"
    id: int
    title: str
    description: str | None
    price: str
    professional_id: int
    professional_name: str


class SearchResponse(BaseModel):
    query: str
    results: list[ProfessionalHit | ServiceHit] = Field(default_factory=list)