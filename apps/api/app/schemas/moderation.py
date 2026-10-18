from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserSummary

class ContentReportCreate(BaseModel):
    post_id: Optional[str] = None
    reported_user_id: Optional[str] = None
    reason: str = Field(..., min_length=3, max_length=100)
    details: Optional[str] = Field(None, max_length=1000)

class ContentReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    reporter_id: str
    reporter: Optional[UserSummary] = None
    post_id: Optional[str] = None
    reported_user_id: Optional[str] = None
    reason: str
    details: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

class ModerationActionCreate(BaseModel):
    target_type: str  # post, user
    target_id: str
    action: str       # hide_post, remove_post, suspend_user, warn_user
    reason: str = Field(..., min_length=3, max_length=500)

