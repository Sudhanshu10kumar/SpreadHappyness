from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserSummary

class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

class CommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    author_id: str
    author: UserSummary
    content: str
    created_at: datetime
    updated_at: datetime

class LikeResponse(BaseModel):
    post_id: str
    liked: bool
    likes_count: int

class BookmarkResponse(BaseModel):
    post_id: str
    bookmarked: bool
    bookmarks_count: int

class FollowResponse(BaseModel):
    target_user_id: str
    following: bool
    followers_count: int

