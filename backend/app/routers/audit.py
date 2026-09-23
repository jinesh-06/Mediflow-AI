from typing import List, Optional
from fastapi import APIRouter
from app.models.audit import AuditEvent
from app.db.repository import repo

router = APIRouter(prefix="/api/audit", tags=["Append-Only Audit Trail"])

@router.get("", response_model=List[AuditEvent])
def get_audit_trail(limit: int = 100):
    return repo.get_audit_trail(limit=limit)
