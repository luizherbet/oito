from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.user import User
from app.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Compatível com registos antigos que usavam "hashed:" + senha em texto
LEGACY_HASH_PREFIX = "hashed:"


def verify_password(plain: str, hashed: str) -> bool:
    if hashed.startswith(LEGACY_HASH_PREFIX):
        return hashed == LEGACY_HASH_PREFIX + plain
    return pwd_context.verify(plain, hashed)


def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)


def create_access_token(subject: str | int, extra: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode: dict[str, Any] = {"sub": str(subject), "exp": expire}
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).one_or_none()
    if user is None:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user