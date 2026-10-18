import re
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.post import Post, Tag, PostVersion
from app.models.social import Like, Bookmark
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.core.sanitizer import sanitize_html, strip_tags

def generate_slug(title: str) -> str:
    # Transliterate or clean title to lowercase alphanumeric slug + 6 random chars
    clean = re.sub(r'[^\w\s-]', '', title.lower()).strip()
    clean = re.sub(r'[-\s]+', '-', clean)[:50]
    if not clean:
        clean = "verse"
    short_uuid = uuid.uuid4().hex[:6]
    return f"{clean}-{short_uuid}"

class PostService:
    @staticmethod
    def create_draft(db: Session, author: User, data: PostCreate) -> Post:
        sanitized_content = sanitize_html(data.content)
        plain_text = strip_tags(sanitized_content)
        excerpt = plain_text[:200] + ("..." if len(plain_text) > 200 else "")
        slug = generate_slug(data.title)

        post = Post(
            author_id=author.id,
            title=data.title.strip(),
            slug=slug,
            content=sanitized_content,
            excerpt=excerpt,
            content_type=data.content_type,
            language=data.language,
            status="draft",         # Strict default: draft
            visibility="private",   # Strict default: private
            mood=data.mood,
            theme_settings=data.theme_settings or {},
        )

        # Handle tags
        if data.tags:
            for tag_name in set(data.tags):
                clean_name = tag_name.strip().lower()
                if clean_name:
                    tag = db.query(Tag).filter(Tag.name == clean_name).first()
                    if not tag:
                        tag = Tag(name=clean_name, slug=clean_name.replace(" ", "-"))
                        db.add(tag)
                    post.tags.append(tag)

        db.add(post)
        db.flush()

        # Create initial version
        version = PostVersion(
            post_id=post.id,
            title=post.title,
            content=post.content,
            version_number=1
        )
        db.add(version)
        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def update_post(db: Session, post_id: str, author: User, data: PostUpdate) -> Post:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
        
        # IDOR check: author or admin only
        if post.author_id != author.id and author.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this post.")

        content_changed = False
        if data.title is not None and data.title.strip() != post.title:
            post.title = data.title.strip()
            content_changed = True

        if data.content is not None:
            sanitized = sanitize_html(data.content)
            if sanitized != post.content:
                post.content = sanitized
                plain_text = strip_tags(sanitized)
                post.excerpt = plain_text[:200] + ("..." if len(plain_text) > 200 else "")
                content_changed = True

        if data.content_type is not None:
            post.content_type = data.content_type
        if data.language is not None:
            post.language = data.language
        if data.mood is not None:
            post.mood = data.mood
        if data.theme_settings is not None:
            post.theme_settings = data.theme_settings

        # Explicit status changes
        if data.status is not None:
            post.status = data.status
            if data.status == "published" and not post.published_at:
                post.published_at = datetime.now(timezone.utc)
        
        # Explicit visibility changes
        if data.visibility is not None:
            post.visibility = data.visibility

        # Handle tags update
        if data.tags is not None:
            post.tags.clear()
            for tag_name in set(data.tags):
                clean_name = tag_name.strip().lower()
                if clean_name:
                    tag = db.query(Tag).filter(Tag.name == clean_name).first()
                    if not tag:
                        tag = Tag(name=clean_name, slug=clean_name.replace(" ", "-"))
                        db.add(tag)
                    post.tags.append(tag)

        # Create new version if substantial content changed
        if content_changed:
            current_count = db.query(func.count(PostVersion.id)).filter(PostVersion.post_id == post.id).scalar() or 0
            version = PostVersion(
                post_id=post.id,
                title=post.title,
                content=post.content,
                version_number=current_count + 1
            )
            db.add(version)

        db.commit()
        db.refresh(post)
        return post

    @staticmethod
    def delete_post(db: Session, post_id: str, author: User) -> None:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
        
        if post.author_id != author.id and author.role != UserRole.ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post.")

        db.delete(post)
        db.commit()

    @staticmethod
    def get_post_detail(db: Session, identifier: str, current_user: Optional[User] = None) -> Tuple[Post, bool, bool]:
        """
        Retrieves post by id or slug with strict visibility enforcement.
        Returns: (post, is_liked, is_bookmarked)
        """
        post = db.query(Post).filter(
            or_(Post.id == identifier, Post.slug == identifier)
        ).first()

        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Writing not found.")

        # Check visibility
        if post.visibility == "private":
            if not current_user or (post.author_id != current_user.id and current_user.role != UserRole.ADMIN):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Writing not found.")
        elif post.status != "published":
            # Draft or archived
            if not current_user or (post.author_id != current_user.id and current_user.role != UserRole.ADMIN):
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Writing not found.")

        # Check like and bookmark for current user
        is_liked = False
        is_bookmarked = False
        if current_user:
            is_liked = db.query(Like).filter(Like.post_id == post.id, Like.user_id == current_user.id).first() is not None
            is_bookmarked = db.query(Bookmark).filter(Bookmark.post_id == post.id, Bookmark.user_id == current_user.id).first() is not None

        # Increment view count safely
        post.views_count = (post.views_count or 0) + 1
        db.commit()

        return post, is_liked, is_bookmarked

    @staticmethod
    def get_public_feed(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        sort: str = "latest",  # latest, popular, trending
        language: Optional[str] = None,
        content_type: Optional[str] = None,
        mood: Optional[str] = None,
        tag: Optional[str] = None,
        query: Optional[str] = None,
        current_user: Optional[User] = None,
    ) -> Tuple[List[Post], int]:
        """
        Strict public feed: ONLY status='published' AND visibility='public'.
        Guaranteed never to leak private or unlisted content.
        """
        stmt = db.query(Post).filter(
            Post.status == "published",
            Post.visibility == "public"
        )

        if language:
            stmt = stmt.filter(Post.language == language.lower())
        if content_type:
            stmt = stmt.filter(Post.content_type == content_type.lower())
        if mood:
            stmt = stmt.filter(Post.mood == mood.lower())
        if tag:
            stmt = stmt.join(Post.tags).filter(Tag.name == tag.lower())
        if query:
            search_term = f"%{query.strip()}%"
            stmt = stmt.filter(or_(
                Post.title.ilike(search_term),
                Post.excerpt.ilike(search_term),
                Post.content.ilike(search_term)
            ))

        total = stmt.count()

        if sort == "popular":
            stmt = stmt.order_by(desc(Post.likes_count), desc(Post.published_at))
        elif sort == "trending":
            stmt = stmt.order_by(desc(Post.likes_count + Post.comments_count * 2), desc(Post.published_at))
        else:
            # latest
            stmt = stmt.order_by(desc(Post.published_at))

        offset = (page - 1) * page_size
        items = stmt.offset(offset).limit(page_size).all()
        return items, total

    @staticmethod
    def get_user_drafts(db: Session, author: User, page: int = 1, page_size: int = 20) -> Tuple[List[Post], int]:
        """Gets author's private and draft works."""
        stmt = db.query(Post).filter(
            Post.author_id == author.id,
            Post.status == "draft"
        ).order_by(desc(Post.updated_at))
        total = stmt.count()
        items = stmt.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    @staticmethod
    def get_user_published(db: Session, author_id: str, is_owner: bool = False, page: int = 1, page_size: int = 20) -> Tuple[List[Post], int]:
        """Gets published works. If not owner, strictly public only."""
        stmt = db.query(Post).filter(
            Post.author_id == author_id,
            Post.status == "published"
        )
        if not is_owner:
            stmt = stmt.filter(Post.visibility == "public")
        stmt = stmt.order_by(desc(Post.published_at))
        total = stmt.count()
        items = stmt.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

