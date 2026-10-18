from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.moderation import ContentReportCreate, ContentReportResponse, ModerationActionCreate
from app.services.moderation_service import ModerationService
from app.api.deps import get_current_user, require_role
from app.models.user import User

router = APIRouter()

@router.post("/reports", response_model=ContentReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    data: ContentReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submits a content violation or harassment report."""
    report = ModerationService.create_report(db, current_user, data)
    return report

@router.get("/reports", response_model=List[ContentReportResponse])
def get_reports(
    status_filter: Optional[str] = Query(None, pattern="^(pending|reviewing|resolved|dismissed)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    """Admin dashboard: list content and user reports."""
    return ModerationService.get_reports(db, status_filter)

@router.post("/reports/{report_id}/resolve", response_model=ContentReportResponse)
def resolve_report(
    report_id: str,
    resolution: str = Query(..., pattern="^(resolved|dismissed)$"),
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    """Admin: resolve or dismiss a content report with notes and audit log."""
    return ModerationService.resolve_report(db, report_id, admin, resolution, notes)

@router.post("/actions")
def apply_moderation_action(
    data: ModerationActionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    """Admin: enforce moderation action (hide post, suspend user, warn) with immutable audit log."""
    action = ModerationService.apply_moderation_action(db, admin, data)
    return {"message": f"Action '{data.action}' successfully executed.", "action_id": action.id}

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    """Admin: view immutable security and moderation audit trail."""
    logs = ModerationService.get_audit_logs(db, limit)
    return logs
