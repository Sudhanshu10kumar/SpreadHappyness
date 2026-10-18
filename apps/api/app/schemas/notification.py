from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserSummary

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    recipient_id: str
    actor: UserSummary
    type: str  # like, comment, follow, system
    post_id: Optional[str] = None
    post_title: Optional[str] = None
    is_read: bool
    created_at: datetime

