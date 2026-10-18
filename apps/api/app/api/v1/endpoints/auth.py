from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.user import UserCreate, UserLogin, UserSummary, Token
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, response: Response, request: Request, db: Session = Depends(get_db)):
    """Registers a new creator or reader account."""
    ip_address = request.client.host if request.client else None
    user = AuthService.register_user(db, user_in, ip_address=ip_address)
    access_token = create_access_token(subject=user.id, role=user.role)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key="verseora_session",
        value=access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return Token(access_token=access_token, user=user)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, response: Response, request: Request, db: Session = Depends(get_db)):
    """Authenticates with username/email and password."""
    ip_address = request.client.host if request.client else None
    user = AuthService.authenticate_user(db, login_data, ip_address=ip_address)
    access_token = create_access_token(subject=user.id, role=user.role)

    # Set secure HttpOnly session cookie
    response.set_cookie(
        key="verseora_session",
        value=access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return Token(access_token=access_token, user=user)

@router.post("/logout")
def logout(response: Response):
    """Clears authentication session cookie."""
    response.delete_cookie(key="verseora_session", httponly=True, samesite="lax")
    return {"message": "Successfully logged out."}

@router.get("/me", response_model=UserSummary)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's account info."""
    return current_user

