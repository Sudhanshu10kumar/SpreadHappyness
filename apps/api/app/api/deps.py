from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

security_scheme = HTTPBearer(auto_error=False)

def get_token_from_request(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> Optional[str]:
    """Retrieves the JWT token from the Authorization header or session cookie."""
    if auth_header and auth_header.credentials:
        return auth_header.credentials
    # Fallback to HttpOnly cookie
    cookie_token = request.cookies.get("verseora_session")
    if cookie_token:
        return cookie_token
    return None

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request)
) -> User:
    """Authenticates the user from token. Raises 401 if invalid or missing."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(get_token_from_request)
) -> Optional[User]:
    """Optional authentication for public feeds to populate personalized bookmarks/likes."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    user_id = payload["sub"]
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()

def require_role(required_role: str):
    """Enforces role-based access control (RBAC)."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this administrative action"
            )
        return current_user
    return role_checker

