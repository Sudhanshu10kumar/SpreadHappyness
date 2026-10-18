import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Table, JSON, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

# Association table for Post-Tag many-to-many
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", String(36), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, index=True, nullable=False)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    posts = relationship("Post", secondary=post_tags, back_populates="tags")

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(280), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    content_type = Column(String(30), default="poem", nullable=False)  # thought, shayari, poem, quote, story, reflection
    language = Column(String(30), default="hindi", nullable=False)      # hindi, english, hinglish, urdu, other
    status = Column(String(20), default="draft", nullable=False, index=True)  # draft, published, archived
    visibility = Column(String(20), default="private", nullable=False, index=True)  # private, unlisted, public
    mood = Column(String(50), nullable=True, index=True)  # love, heartbreak, hope, life, silence, motivation
    theme_settings = Column(JSON, default=dict, nullable=False)
    
    # Engagement counters (denormalized for high read performance, updated safely via transactions)
    likes_count = Column(Integer, default=0, nullable=False)
    bookmarks_count = Column(Integer, default=0, nullable=False)
    comments_count = Column(Integer, default=0, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)

    published_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    author = relationship("User", back_populates="posts")
    tags = relationship("Tag", secondary=post_tags, back_populates="posts")
    versions = relationship("PostVersion", back_populates="post", cascade="all, delete-orphan", order_by="desc(PostVersion.version_number)")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="post", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_posts_public_feed", "status", "visibility", "published_at"),
        Index("idx_posts_author_status", "author_id", "status"),
    )

class PostVersion(Base):
    __tablename__ = "post_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    post_id = Column(String(36), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    version_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    post = relationship("Post", back_populates="versions")

