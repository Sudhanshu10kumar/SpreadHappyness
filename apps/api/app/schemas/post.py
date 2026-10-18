from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserSummary

class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    content_type: str = Field(default="poem")  # thought, shayari, poem, quote, story, reflection
    language: str = Field(default="hindi")      # hindi, english, hinglish, urdu, other
    visibility: str = Field(default="private")  # private, unlisted, public
    mood: Optional[str] = Field(default=None)   # love, heartbreak, hope, life, silence, motivation
    tags: List[str] = Field(default_factory=list)
    theme_settings: Dict[str, Any] = Field(default_factory=dict)

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    content_type: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None      # draft, published, archived
    visibility: Optional[str] = None  # private, unlisted, public
    mood: Optional[str] = None
    tags: Optional[List[str]] = None
    theme_settings: Optional[Dict[str, Any]] = None

class PostVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    post_id: str
    title: str
    content: str
    version_number: int
    created_at: datetime

class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    author_id: str
    author: UserSummary
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    content_type: str
    language: str
    status: str
    visibility: str
    mood: Optional[str] = None
    tags: List[str] = []
    theme_settings: Dict[str, Any] = {}
    likes_count: int = 0
    bookmarks_count: int = 0
    comments_count: int = 0
    views_count: int = 0
    is_liked: Optional[bool] = False
    is_bookmarked: Optional[bool] = False
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class PostListResponse(BaseModel):
    items: List[PostResponse]
    total: int
    page: int
    page_size: int
    has_more: bool

