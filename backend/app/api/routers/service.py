from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceRead

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
def read_services(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[ServiceRead]:
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


@router.get("/{id}", response_model=ServiceRead, status_code=status.HTTP_200_OK)
def read_service(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ServiceRead:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    service = db.query(Service).filter(Service.id == id).one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    return service


@router.put("/{id}", response_model=ServiceRead, status_code=status.HTTP_200_OK)
def update_service(id: int, payload: ServiceCreate, current_user: User = Depends(get_current_user),
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
    service = db.query(Service).filter(Service.id == id).one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    if service.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update this service",
        )

    service.title = payload.title
    service.description = payload.description
    service.price = payload.price
    service.is_active = True
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


# deve ser user profissional
# verificar se o serviço existe
# se existir pertence ao current user?
# quais dados poder ser atualizados, tem que criar schema para update Service

@router.delete("/{id}", response_model=ServiceRead)
# deletamos ou apenas tornamos inativo?
#
def delete_service(id: int, current_user: User = Depends(get_current_user),
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

    # e pertence a esse user?
    service = db.query(Service).filter(Service.id == id).one_or_none()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )
    if service.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to delete this service",
        )
    db.delete(service)
    db.commit()
    return None
