from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.search import ProfessionalHit, SearchResponse, ServiceHit

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
def search_handler(
    q: str = Query(..., min_length=2, description="Termo (profissional ou serviço)"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> SearchResponse:
    pattern = f"%{q}%"

    professionals = (
        db.query(User)
        .filter(User.is_professional.is_(True))
        .filter(User.name.ilike(pattern))
        .limit(limit)
        .all()
    )

    services_rows = (
        db.query(Service, User)
        .join(User, Service.professional_id == User.id)
        .filter(Service.is_active.is_(True))
        .filter(
            or_(
                Service.title.ilike(pattern),
                Service.description.ilike(pattern),
            )
        )
        .limit(limit)
        .all()
    )

    results: list[ProfessionalHit | ServiceHit] = [
        ProfessionalHit(id=u.id, name=u.name, email=u.email, role = u.role) for u in professionals
    ]

    for svc, prof in services_rows:
        results.append(
            ServiceHit(
                id=svc.id,
                title=svc.title,
                description=svc.description,
                price=str(svc.price),
                professional_id=prof.id,
                professional_name=prof.name,
            )
        )

    return SearchResponse(query=q, results=results)