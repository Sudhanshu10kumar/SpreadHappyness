import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(30), nullable=False)  # like, comment, follow, system
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="notifications")
    actor = relationship("User", foreign_keys=[actor_id])
    post = relationship("Post")

