from pydantic import BaseModel

class ServiceMini(BaseModel):
    id: int
    title: str
    class Config:
        from_attributes = True



class SearchResponse(BaseModel):
    id: int
    name: str
    role: str
    services: list[ServiceMini]
    class Config:
        from_attributes = True