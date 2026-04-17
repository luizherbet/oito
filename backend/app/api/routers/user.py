from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_


from app.api.deps import get_current_user, get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate, UserRead

from app.models.service import Service

router = APIRouter(prefix="/users", tags=["users"])


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
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
def read_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user


@router.get("/{user_id}", response_model=UserRead, status_code=status.HTTP_200_OK)
def get_user(user_id: int, db: Session = Depends(get_db)) -> UserRead:
    user = db.query(User).filter(User.id == user_id).one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
        )
    return user