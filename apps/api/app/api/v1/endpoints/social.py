from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.social import LikeResponse, BookmarkResponse, FollowResponse, CommentCreate, CommentResponse
from app.schemas.post import PostResponse
from app.services.social_service import SocialService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/posts/{post_id}/like", response_model=LikeResponse)
def toggle_like(post_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Toggles liking a poem with atomic counter update and duplicate prevention."""
    liked, count = SocialService.toggle_like(db, current_user, post_id)
    return LikeResponse(post_id=post_id, liked=liked, likes_count=count)

@router.post("/posts/{post_id}/bookmark", response_model=BookmarkResponse)
def toggle_bookmark(post_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Toggles bookmarking a post to private bookmarks."""
    bookmarked, count = SocialService.toggle_bookmark(db, current_user, post_id)
    return BookmarkResponse(post_id=post_id, bookmarked=bookmarked, bookmarks_count=count)

@router.post("/users/{user_id}/follow", response_model=FollowResponse)
def toggle_follow(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Follows or unfollows a poet."""
    following, followers_count = SocialService.toggle_follow(db, current_user, user_id)
    return FollowResponse(target_user_id=user_id, following=following, followers_count=followers_count)

@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(post_id: str, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Adds a sanitized discussion comment on a poem."""
    comment = SocialService.add_comment(db, current_user, post_id, data.content)
    return comment

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: str, db: Session = Depends(get_db)):
    """Retrieves discussion comments for a poem."""
    return SocialService.get_comments(db, post_id)

@router.get("/bookmarks", response_model=List[PostResponse])
def get_my_bookmarks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Lists posts bookmarked by the authenticated user."""
    posts = SocialService.get_user_bookmarks(db, current_user)
    from app.api.v1.endpoints.posts import _format_post_response
    return [_format_post_response(p, current_user, is_bookmarked=True) for p in posts]

