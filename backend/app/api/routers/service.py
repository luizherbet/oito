from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceRead

from app.models.service import Service

router = APIRouter(prefix="/services", tags=["services"])


@router.post("/", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
def create_service(payload: ServiceCreate, current_user: User = Depends(get_current_user),
                   db: Session = Depends(get_db)) -> ServiceRead:
    if not current_user.is_professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a professional user",
        )
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )

    service = Service(
        professional_id=current_user.id,
        title=payload.title,
        description=payload.description,
        price=payload.price,
        is_active=True,
    )
    db.add(service)
    db.commit()
    db.refresh(service)

    return service


@router.get("/me", response_model=list[ServiceRead], status_code=status.HTTP_200_OK)
def read_services(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ServiceRead:
    if not current_user.is_professional:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not a professional user",
        )
    return (
        db.query(Service)
        .filter(Service.professional_id == current_user.id)
        .order_by(Service.id)
        .all()
    )
# se for profissional

# @router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
# def get_user(user_id: int, db: Session = Depends(get_db)) -> UserRead:
#     user = db.query(User).filter(User.id == user_id).one_or_none()
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#         )
#     return user
