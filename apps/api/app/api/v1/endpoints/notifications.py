from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.schemas.notification import NotificationResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves notifications for the current user."""
    notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(50).all()

    return [
        NotificationResponse(
            id=n.id,
            recipient_id=n.recipient_id,
            actor=n.actor,
            type=n.type,
            post_id=n.post_id,
            post_title=n.post.title if n.post else None,
            is_read=n.is_read,
            created_at=n.created_at
        )
        for n in notifications
    ]

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read."}

@router.post("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks all user notifications as read."""
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

