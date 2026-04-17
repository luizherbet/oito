from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.search import SearchResponse

router = APIRouter()


@router.get("/search", response_model=list[SearchResponse])
def search_handler(
        q: str = Query(..., min_length=2, description="Termo (profissional ou serviço)"),
        limit: int = Query(20, ge=1, le=50),
        db: Session = Depends(get_db),
) -> list[SearchResponse]:
    pattern = f"%{q}%"


    search = (
        db.query(User)
        .filter(User.is_professional.is_(True))
        .options(joinedload(User.services))
        .outerjoin(User.services)
        .filter(
            or_(
                User.name.ilike(pattern),
                Service.title.ilike(pattern),
                Service.description.ilike(pattern),
            )
        )
        .distinct()
        .limit(limit)
        .all()
    )
    return search