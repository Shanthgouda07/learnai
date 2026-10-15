"""
Auth router: login endpoint returns JWT + user info, me endpoint with consent status.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.models.database import get_db
from app.models.models import User, Consent
from app.schemas.schemas import LoginRequest, TokenResponse
import hmac
from app.services.auth import create_access_token, get_current_user

router = APIRouter(tags=["auth"])


@router.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.anon_id == req.anon_id).first()
    if not user or not hmac.compare_digest(str(user.password), str(req.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        anon_id=user.anon_id,
        name=user.name,
        user_id=user.id,
    )


@router.get("/api/auth/me")
@router.get("/api/me")
def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    has_consented = True
    if current_user.role == "student":
        c = (
            db.query(Consent)
            .filter(Consent.user_id == current_user.id, Consent.version == settings.consent_version)
            .first()
        )
        has_consented = bool(c)

    return {
        "id": current_user.id,
        "role": current_user.role,
        "anon_id": current_user.anon_id,
        "name": current_user.name,
        "has_consented": has_consented,
        "consent_version": settings.consent_version,
    }
