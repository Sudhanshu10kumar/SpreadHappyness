import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class ContentReport(Base):
    __tablename__ = "content_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=True)
    reported_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(30), default="pending", nullable=False)  # pending, reviewing, resolved, dismissed
    resolved_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id])
    post = relationship("Post", foreign_keys=[post_id])
    reported_user = relationship("User", foreign_keys=[reported_user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])

class ModerationAction(Base):
    __tablename__ = "moderation_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    moderator_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = Column(String(30), nullable=False)  # post, user
    target_id = Column(String(36), nullable=False)
    action = Column(String(50), nullable=False)  # hide_post, remove_post, suspend_user, warn_user
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    moderator = relationship("User", foreign_keys=[moderator_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(36), nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

