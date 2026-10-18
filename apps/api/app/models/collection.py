import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Collection(Base):
    __tablename__ = "collections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="collections")
    items = relationship("CollectionItem", back_populates="collection", cascade="all, delete-orphan")

class CollectionItem(Base):
    __tablename__ = "collection_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    collection_id = Column(String(36), ForeignKey("collections.id", ondelete="CASCADE"), nullable=False, index=True)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    collection = relationship("Collection", back_populates="items")
    post = relationship("Post")

    __table_args__ = (
        UniqueConstraint("collection_id", "post_id", name="uq_collection_item"),
    )

