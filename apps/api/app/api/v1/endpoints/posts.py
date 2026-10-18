from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.post import PostCreate, PostUpdate, PostResponse, PostListResponse, PostVersionResponse
from app.services.post_service import PostService
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.post import PostVersion
from app.models.social import Like, Bookmark

router = APIRouter()

def _format_post_response(post, current_user: Optional[User] = None, is_liked: Optional[bool] = None, is_bookmarked: Optional[bool] = None) -> PostResponse:
    tags = [t.name for t in post.tags]
    return PostResponse(
        id=post.id,
        author_id=post.author_id,
        author=post.author,
        title=post.title,
        slug=post.slug,
        content=post.content,
        excerpt=post.excerpt,
        content_type=post.content_type,
        language=post.language,
        status=post.status,
        visibility=post.visibility,
        mood=post.mood,
        tags=tags,
        theme_settings=post.theme_settings or {},
        likes_count=post.likes_count,
        bookmarks_count=post.bookmarks_count,
        comments_count=post.comments_count,
        views_count=post.views_count,
        is_liked=is_liked if is_liked is not None else False,
        is_bookmarked=is_bookmarked if is_bookmarked is not None else False,
        published_at=post.published_at,
        created_at=post.created_at,
        updated_at=post.updated_at
    )

@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_draft(data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Creates a new writing entry (defaults to private draft)."""
    post = PostService.create_draft(db, current_user, data)
    return _format_post_response(post, current_user)

@router.get("/feed", response_model=PostListResponse)
def get_public_feed(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    sort: str = Query("latest", pattern="^(latest|popular|trending)$"),
    language: Optional[str] = None,
    content_type: Optional[str] = None,
    mood: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Public discovery feed.
    Strictly isolated: only returns status='published' and visibility='public'.
    """
    posts, total = PostService.get_public_feed(
        db=db,
        page=page,
        page_size=page_size,
        sort=sort,
        language=language,
        content_type=content_type,
        mood=mood,
        tag=tag,
        query=q,
        current_user=current_user
    )

    # Attach personalized like/bookmark state if authenticated
    user_likes = set()
    user_bookmarks = set()
    if current_user and posts:
        post_ids = [p.id for p in posts]
        user_likes = {
            l.post_id for l in db.query(Like.post_id).filter(
                Like.user_id == current_user.id,
                Like.post_id.in_(post_ids)
            ).all()
        }
        user_bookmarks = {
            b.post_id for b in db.query(Bookmark.post_id).filter(
                Bookmark.user_id == current_user.id,
                Bookmark.post_id.in_(post_ids)
            ).all()
        }

    formatted = [
        _format_post_response(
            p,
            current_user,
            is_liked=(p.id in user_likes),
            is_bookmarked=(p.id in user_bookmarks)
        )
        for p in posts
    ]

    has_more = (page * page_size) < total
    return PostListResponse(
        items=formatted,
        total=total,
        page=page,
        page_size=page_size,
        has_more=has_more
    )

@router.get("/drafts", response_model=PostListResponse)
def get_user_drafts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lists author's unpublished drafts."""
    posts, total = PostService.get_user_drafts(db, current_user, page, page_size)
    formatted = [_format_post_response(p, current_user) for p in posts]
    return PostListResponse(
        items=formatted,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total
    )

@router.get("/user/{author_id}", response_model=PostListResponse)
def get_author_published_works(
    author_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Lists published works of a user. If not owner, strictly public only."""
    is_owner = (current_user is not None and current_user.id == author_id)
    posts, total = PostService.get_user_published(db, author_id, is_owner, page, page_size)
    formatted = [_format_post_response(p, current_user) for p in posts]
    return PostListResponse(
        items=formatted,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total
    )

@router.get("/{identifier}", response_model=PostResponse)
def get_post(
    identifier: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Fetches post for reading.
    Enforces privacy: private posts are accessible only to the author or admin.
    """
    post, is_liked, is_bookmarked = PostService.get_post_detail(db, identifier, current_user)
    return _format_post_response(post, current_user, is_liked=is_liked, is_bookmarked=is_bookmarked)

@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates a post, handles publication status, visibility, or edits."""
    post = PostService.update_post(db, post_id, current_user, data)
    return _format_post_response(post, current_user)

@router.delete("/{post_id}")
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently deletes a post and associated versions/comments."""
    PostService.delete_post(db, post_id, current_user)
    return {"message": "Writing deleted successfully."}

@router.get("/{post_id}/versions", response_model=List[PostVersionResponse])
def get_post_versions(
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves revision history of a post for its author."""
    from app.models.post import Post
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    if post.author_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
    versions = db.query(PostVersion).filter(PostVersion.post_id == post_id).order_by(PostVersion.version_number.desc()).all()
    return versions
