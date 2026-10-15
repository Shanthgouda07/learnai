"""
Auth utilities: JWT creation and verification, simple role guard, and server-side consent enforcement.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import get_db
from app.models.models import User, Consent

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8   # 8-hour tokens for demo

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def decode_token(token: str) -> dict:
    """Decode and verify a JWT access token."""
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # JWT spec requires 'sub' to be a string
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)



def get_current_user(
    request: Request = None,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        user_id = int(sub)  # sub is stored as string per JWT spec
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    # Enforce SERVER-SIDE consent: a student without a valid consent record gets 403
    # on every endpoint except /api/consent, /api/privacy/consent, /api/me, /api/auth/*
    if user.role == "student" and request is not None:
        path = getattr(request.url, "path", "")
        exempt_paths = {
            "/api/consent",
            "/api/privacy/consent",
            "/api/me",
            "/api/auth/me",
            "/docs",
            "/openapi.json",
            "/redoc",
        }
        is_exempt = path in exempt_paths or path.startswith("/api/auth/")
        if not is_exempt:
            consent = (
                db.query(Consent)
                .filter(Consent.user_id == user.id, Consent.version == settings.consent_version)
                .first()
            )
            if not consent:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Consent required: Student must accept the current privacy consent agreement before accessing this endpoint.",
                )

    return user


def require_role(role: str):
    """Dependency factory – raises 403 if the current user's role doesn't match."""
    def _guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action requires '{role}' role",
            )
        return current_user
    return _guard
