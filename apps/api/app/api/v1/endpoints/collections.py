from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.collection import CollectionCreate, CollectionUpdate, CollectionResponse, CollectionDetailResponse
from app.services.collection_service import CollectionService
from app.api.deps import get_current_user, get_current_user_optional
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Creates a private or public collection."""
    collection = CollectionService.create_collection(db, current_user, data)
    return CollectionResponse(
        id=collection.id,
        user_id=collection.user_id,
        name=collection.name,
        description=collection.description,
        is_public=collection.is_public,
        items_count=len(collection.items),
        created_at=collection.created_at,
        updated_at=collection.updated_at
    )

@router.get("/", response_model=List[CollectionResponse])
def get_collections(
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Lists collections.
    If no user_id given, returns the current authenticated user's collections.
    If viewing another user's collections, strictly filters to public collections.
    """
    target_user_id = user_id or (current_user.id if current_user else None)
    if not target_user_id:
        return []

    collections = CollectionService.get_user_collections(db, target_user_id, current_user)
    return [
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
        for c in collections
    ]

@router.get("/{collection_id}", response_model=CollectionDetailResponse)
def get_collection(
    collection_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retrieves collection details and items.
    Enforces privacy: unauthorized requests to private collections return 404.
    """
    collection, posts = CollectionService.get_collection_detail(db, collection_id, current_user)
    from app.api.v1.endpoints.posts import _format_post_response
    formatted_posts = [_format_post_response(p, current_user) for p in posts]

    return CollectionDetailResponse(
        id=collection.id,
        user_id=collection.user_id,
        name=collection.name,
        description=collection.description,
        is_public=collection.is_public,
        items_count=len(posts),
        created_at=collection.created_at,
        updated_at=collection.updated_at,
        posts=formatted_posts
    )

@router.post("/{collection_id}/items/{post_id}")
def add_to_collection(
    collection_id: str,
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Adds a poem to a user's collection."""
    CollectionService.add_to_collection(db, current_user, collection_id, post_id)
    return {"message": "Poem added to collection."}

@router.delete("/{collection_id}/items/{post_id}")
def remove_from_collection(
    collection_id: str,
    post_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Removes a poem from a collection."""
    CollectionService.remove_from_collection(db, current_user, collection_id, post_id)
    return {"message": "Poem removed from collection."}

@router.delete("/{collection_id}")
def delete_collection(
    collection_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes an entire collection."""
    CollectionService.delete_collection(db, current_user, collection_id)
    return {"message": "Collection deleted."}

