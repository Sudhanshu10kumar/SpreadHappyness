from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.user import User
from app.models.post import Post
from app.models.social import Like, Bookmark, Follow, Comment
from app.models.notification import Notification
from app.core.sanitizer import sanitize_html

class SocialService:
    @staticmethod
    def toggle_like(db: Session, user: User, post_id: str) -> Tuple[bool, int]:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        existing_like = db.query(Like).filter(Like.user_id == user.id, Like.post_id == post_id).first()
        if existing_like:
            db.delete(existing_like)
            post.likes_count = max(0, (post.likes_count or 1) - 1)
            liked = False
        else:
            new_like = Like(user_id=user.id, post_id=post_id)
            db.add(new_like)
            post.likes_count = (post.likes_count or 0) + 1
            liked = True

            # Send notification to post author if not liking own post
            if post.author_id != user.id:
                notif = Notification(
                    recipient_id=post.author_id,
                    actor_id=user.id,
                    type="like",
                    post_id=post.id
                )
                db.add(notif)

        db.commit()
        db.refresh(post)
        return liked, post.likes_count

    @staticmethod
    def toggle_bookmark(db: Session, user: User, post_id: str) -> Tuple[bool, int]:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        existing_bookmark = db.query(Bookmark).filter(Bookmark.user_id == user.id, Bookmark.post_id == post_id).first()
        if existing_bookmark:
            db.delete(existing_bookmark)
            post.bookmarks_count = max(0, (post.bookmarks_count or 1) - 1)
            bookmarked = False
        else:
            new_bookmark = Bookmark(user_id=user.id, post_id=post_id)
            db.add(new_bookmark)
            post.bookmarks_count = (post.bookmarks_count or 0) + 1
            bookmarked = True

        db.commit()
        db.refresh(post)
        return bookmarked, post.bookmarks_count

    @staticmethod
    def toggle_follow(db: Session, current_user: User, target_user_id: str) -> Tuple[bool, int]:
        if current_user.id == target_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot follow yourself.")

        target_user = db.query(User).filter(User.id == target_user_id).first()
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        existing_follow = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.following_id == target_user_id
        ).first()

        if existing_follow:
            db.delete(existing_follow)
            following = False
        else:
            new_follow = Follow(follower_id=current_user.id, following_id=target_user_id)
            db.add(new_follow)
            following = True

            # Create notification
            notif = Notification(
                recipient_id=target_user_id,
                actor_id=current_user.id,
                type="follow"
            )
            db.add(notif)

        db.commit()
        followers_count = db.query(Follow).filter(Follow.following_id == target_user_id).count()
        return following, followers_count

    @staticmethod
    def add_comment(db: Session, user: User, post_id: str, content: str) -> Comment:
        post = db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")

        clean_content = sanitize_html(content)
        if not clean_content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment content cannot be empty.")

        comment = Comment(
            post_id=post.id,
            author_id=user.id,
            content=clean_content
        )
        db.add(comment)
        post.comments_count = (post.comments_count or 0) + 1

        if post.author_id != user.id:
            notif = Notification(
                recipient_id=post.author_id,
                actor_id=user.id,
                type="comment",
                post_id=post.id
            )
            db.add(notif)

        db.commit()
        db.refresh(comment)
        return comment

    @staticmethod
    def get_comments(db: Session, post_id: str, page: int = 1, page_size: int = 50) -> List[Comment]:
        return db.query(Comment).filter(
            Comment.post_id == post_id
        ).order_by(desc(Comment.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    @staticmethod
    def get_user_bookmarks(db: Session, user: User, page: int = 1, page_size: int = 20) -> List[Post]:
        bookmarks = db.query(Bookmark).filter(Bookmark.user_id == user.id).order_by(desc(Bookmark.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        post_ids = [b.post_id for b in bookmarks]
        return db.query(Post).filter(Post.id.in_(post_ids)).all()

