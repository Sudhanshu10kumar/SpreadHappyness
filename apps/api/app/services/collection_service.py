from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.user import User
from app.models.post import Post
from app.models.collection import Collection, CollectionItem
from app.schemas.collection import CollectionCreate, CollectionUpdate

class CollectionService:
    @staticmethod
    def create_collection(db: Session, user: User, data: CollectionCreate) -> Collection:
        collection = Collection(
            user_id=user.id,
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            is_public=data.is_public
        )
        db.add(collection)
        db.commit()
        db.refresh(collection)
        return collection

    @staticmethod
    def get_user_collections(db: Session, user_id: str, current_user: Optional[User] = None) -> List[Collection]:
        stmt = db.query(Collection).filter(Collection.user_id == user_id)
        if not current_user or current_user.id != user_id:
            # Only public collections visible to other users
            stmt = stmt.filter(Collection.is_public == True)
        return stmt.order_by(desc(Collection.created_at)).all()

    @staticmethod
    def get_collection_detail(db: Session, collection_id: str, current_user: Optional[User] = None) -> Tuple[Collection, List[Post]]:
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        # Privacy check
        if not collection.is_public:
            if not current_user or current_user.id != collection.user_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")

        items = db.query(CollectionItem).filter(CollectionItem.collection_id == collection.id).order_by(desc(CollectionItem.created_at)).all()
        post_ids = [item.post_id for item in items]
        posts = db.query(Post).filter(Post.id.in_(post_ids)).all() if post_ids else []
        return collection, posts

    @staticmethod
    def add_to_collection(db: Session, user: User, collection_id: str, post_id: str) -> None:
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")
        if collection.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this collection.")

        existing = db.query(CollectionItem).filter(
            CollectionItem.collection_id == collection_id,
            CollectionItem.post_id == post_id
        ).first()

        if not existing:
            item = CollectionItem(collection_id=collection_id, post_id=post_id)
            db.add(item)
            db.commit()

    @staticmethod
    def remove_from_collection(db: Session, user: User, collection_id: str, post_id: str) -> None:
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection or collection.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

        item = db.query(CollectionItem).filter(
            CollectionItem.collection_id == collection_id,
            CollectionItem.post_id == post_id
        ).first()
        if item:
            db.delete(item)
            db.commit()

    @staticmethod
    def delete_collection(db: Session, user: User, collection_id: str) -> None:
        collection = db.query(Collection).filter(Collection.id == collection_id).first()
        if not collection:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found.")
        if collection.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")
        db.delete(collection)
        db.commit()

