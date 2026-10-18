from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.export import UserDataExport
from app.schemas.user import UserSummary
from app.api.deps import get_current_user
from app.models.user import User
from app.models.post import Post
from app.models.collection import Collection
from app.api.v1.endpoints.posts import _format_post_response
from app.schemas.collection import CollectionResponse

router = APIRouter()

@router.get("/my-data", response_model=UserDataExport)
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exports full personal account archive (all posts, drafts, collections, and profile data)
    in structured JSON format for user data portability.
    """
    user_posts = db.query(Post).filter(Post.author_id == current_user.id).all()
    user_collections = db.query(Collection).filter(Collection.user_id == current_user.id).all()

    profile_dict = {
        "website": current_user.profile.website if current_user.profile else None,
        "pen_name": current_user.profile.pen_name if current_user.profile else current_user.full_name,
        "theme_preference": current_user.profile.theme_preference if current_user.profile else "midnight",
        "is_private_account": current_user.profile.is_private_account if current_user.profile else False,
    }

    formatted_posts = [_format_post_response(p, current_user) for p in user_posts]
    formatted_collections = [
        CollectionResponse(
            id=c.id,
            user_id=c.user_id,
            name=c.name,
            description=c.description,
            is_public=c.is_public,
            items_count=len(c.items),
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in user_collections
    ]

    return UserDataExport(
        user=current_user,
        profile=profile_dict,
        posts=formatted_posts,
        collections=formatted_collections,
        exported_at=datetime.now(timezone.utc)
    )

