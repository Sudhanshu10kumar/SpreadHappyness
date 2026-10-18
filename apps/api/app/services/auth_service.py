from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Profile, UserRole
from app.models.moderation import AuditLog
from app.schemas.user import UserCreate, UserLogin, ProfileUpdate, PasswordChange
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate, ip_address: Optional[str] = None) -> User:
        # Check existing username
        if db.query(User).filter(User.username == user_in.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already registered."
            )
        
        # Check existing email
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already in use."
            )
        
        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            role=UserRole.USER,
            is_active=True,
            is_verified=False
        )
        db.add(db_user)
        db.flush()

        # Create initial profile
        profile = Profile(
            user_id=db_user.id,
            pen_name=db_user.full_name,
            theme_preference="midnight"
        )
        db.add(profile)

        # Audit log
        audit = AuditLog(
            user_id=db_user.id,
            action="user_registered",
            resource_type="user",
            resource_id=db_user.id,
            ip_address=ip_address,
            details={"username": db_user.username}
        )
        db.add(audit)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin, ip_address: Optional[str] = None) -> User:
        # Allow sign in with either username or email
        user = db.query(User).filter(
            (User.username == login_data.login) | (User.email == login_data.login)
        ).first()

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password."
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is suspended or deactivated. Contact support."
            )

        # Audit log for login
        audit = AuditLog(
            user_id=user.id,
            action="user_login",
            resource_type="user",
            resource_id=user.id,
            ip_address=ip_address,
            details={}
        )
        db.add(audit)
        db.commit()

        return user

    @staticmethod
    def change_password(db: Session, user: User, data: PasswordChange) -> None:
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect."
            )
        user.hashed_password = get_password_hash(data.new_password)
        db.commit()

    @staticmethod
    def update_profile(db: Session, user: User, data: ProfileUpdate) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.bio is not None:
            user.bio = data.bio
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url

        if not user.profile:
            user.profile = Profile(user_id=user.id)
            db.add(user.profile)

        if data.website is not None:
            user.profile.website = data.website
        if data.pen_name is not None:
            user.profile.pen_name = data.pen_name
        if data.theme_preference is not None:
            user.profile.theme_preference = data.theme_preference
        if data.is_private_account is not None:
            user.profile.is_private_account = data.is_private_account
        if data.allow_comments is not None:
            user.profile.allow_comments = data.allow_comments

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_account(db: Session, user: User, confirmation_password: str) -> None:
        if not verify_password(confirmation_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password confirmation failed."
            )
        db.delete(user)
        db.commit()

