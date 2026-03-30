from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


def hash_password(pw: str) -> str:
    # MVP: depois troque por passlib/bcrypt de verdade
    # Não use isso em produção.
    return "hashed:" + pw


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    existing = db.query(User).filter(User.email == payload.email).one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        zipcode=payload.zipcode,
        city=payload.city,
        address=payload.address,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        is_professional=payload.is_professional,
        role=payload.role,
        is_active= True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user