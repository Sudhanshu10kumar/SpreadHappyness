from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserProfileResponse, ProfileUpdate, PasswordChange, UserSummary
from app.services.auth_service import AuthService
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User, Profile
from app.models.post import Post
from app.models.social import Follow

router = APIRouter()

@router.get("/{username}", response_model=UserProfileResponse)
def get_user_profile(username: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user_optional)):
    """Retrieves public profile information and statistics for a given username."""
    user = db.query(User).filter(User.username == username.lower()).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Counters
    posts_count = db.query(Post).filter(
        Post.author_id == user.id,
        Post.status == "published",
        Post.visibility == "public"
    ).count()

    followers_count = db.query(Follow).filter(Follow.following_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()

    is_following = False
    if current_user:
        is_following = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.following_id == user.id
        ).first() is not None

    profile_obj = user.profile

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        role=user.role,
        is_verified=user.is_verified,
        created_at=user.created_at,
        email=user.email if (current_user and current_user.id == user.id) else None,
        website=profile_obj.website if profile_obj else None,
        pen_name=profile_obj.pen_name if profile_obj else user.full_name,
        theme_preference=profile_obj.theme_preference if profile_obj else "midnight",
        posts_count=posts_count,
        followers_count=followers_count,
        following_count=following_count,
        is_following=is_following
    )

@router.put("/profile/me", response_model=UserSummary)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Updates the authenticated user's profile details."""
    updated = AuthService.update_profile(db, current_user, data)
    return updated

@router.post("/profile/change-password")
def change_password(data: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Changes password after verifying existing password."""
    AuthService.change_password(db, current_user, data)
    return {"message": "Password changed successfully."}

@router.delete("/profile/delete-account")
def delete_account(confirmation: PasswordChange, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permanently deletes the user account and associated personal data."""
    AuthService.delete_account(db, current_user, confirmation.current_password)
    return {"message": "Account successfully deleted."}

