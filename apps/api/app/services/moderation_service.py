from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.post import Post
from app.models.moderation import ContentReport, ModerationAction, AuditLog
from app.schemas.moderation import ContentReportCreate, ModerationActionCreate

class ModerationService:
    @staticmethod
    def create_report(db: Session, reporter: User, data: ContentReportCreate) -> ContentReport:
        report = ContentReport(
            reporter_id=reporter.id,
            post_id=data.post_id,
            reported_user_id=data.reported_user_id,
            reason=data.reason,
            details=data.details,
            status="pending"
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def get_reports(db: Session, status_filter: Optional[str] = None) -> List[ContentReport]:
        stmt = db.query(ContentReport)
        if status_filter:
            stmt = stmt.filter(ContentReport.status == status_filter)
        return stmt.order_by(desc(ContentReport.created_at)).all()

    @staticmethod
    def resolve_report(db: Session, report_id: str, admin: User, resolution: str, notes: Optional[str] = None) -> ContentReport:
        report = db.query(ContentReport).filter(ContentReport.id == report_id).first()
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

        report.status = resolution  # resolved or dismissed
        report.resolved_by = admin.id
        report.resolution_notes = notes
        report.resolved_at = datetime.now(timezone.utc)

        audit = AuditLog(
            user_id=admin.id,
            action=f"report_{resolution}",
            resource_type="content_report",
            resource_id=report.id,
            details={"resolution_notes": notes}
        )
        db.add(audit)
        db.commit()
        db.refresh(report)
        return report

    @staticmethod
    def apply_moderation_action(db: Session, admin: User, data: ModerationActionCreate) -> ModerationAction:
        if data.target_type == "post":
            post = db.query(Post).filter(Post.id == data.target_id).first()
            if not post:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target post not found.")
            if data.action == "hide_post":
                post.visibility = "private"
            elif data.action == "remove_post":
                post.status = "archived"
                post.visibility = "private"

        elif data.target_type == "user":
            user = db.query(User).filter(User.id == data.target_id).first()
            if not user:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")
            if data.action in ["suspend_user", "ban_user"]:
                user.is_active = False

        action_record = ModerationAction(
            moderator_id=admin.id,
            target_type=data.target_type,
            target_id=data.target_id,
            action=data.action,
            reason=data.reason
        )
        db.add(action_record)

        audit = AuditLog(
            user_id=admin.id,
            action=f"moderation_{data.action}",
            resource_type=data.target_type,
            resource_id=data.target_id,
            details={"reason": data.reason}
        )
        db.add(audit)
        db.commit()
        db.refresh(action_record)
        return action_record

    @staticmethod
    def get_audit_logs(db: Session, limit: int = 50) -> List[AuditLog]:
        return db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()

