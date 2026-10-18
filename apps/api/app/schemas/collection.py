from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.post import PostResponse

class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_public: bool = False

class CollectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_public: Optional[bool] = None

class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_public: bool
    items_count: int = 0
    created_at: datetime
    updated_at: datetime

class CollectionDetailResponse(CollectionResponse):
    posts: List[PostResponse] = []

