from typing import List, Optional
from fastapi import APIRouter, HTTPException
from app.models.redistribution import RedistributionRecommendation, ApprovalActionRequest, TransferRecord
from app.services.optimizer_service import optimizer_service
from app.services.approval_service import approval_service
from app.db.repository import repo

router = APIRouter(prefix="/api", tags=["Resource Redistribution & Governance"])

@router.post("/redistribution/recommend", response_model=List[RedistributionRecommendation])
def trigger_optimizer():
    """
    Executes the multi-factor optimization engine to generate redistribution recommendations.
    """
    return optimizer_service.generate_recommendations()

@router.get("/recommendations", response_model=List[RedistributionRecommendation])
def get_recommendations(status: Optional[str] = None):
    # If no recommendations yet, generate baseline
    recs = repo.get_recommendations(status=status)
    if not recs and not status:
        recs = optimizer_service.generate_recommendations()
    return recs

@router.get("/recommendations/{rec_id}", response_model=RedistributionRecommendation)
def get_recommendation(rec_id: str):
    rec = repo.get_recommendation(rec_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return rec

@router.post("/recommendations/{rec_id}/approve")
def approve_recommendation(rec_id: str, req: ApprovalActionRequest):
    try:
        return approval_service.process_action(
            recommendation_id=rec_id,
            action="APPROVE",
            reviewer_id=req.reviewer_id,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recommendations/{rec_id}/modify")
def modify_recommendation(rec_id: str, req: ApprovalActionRequest):
    try:
        return approval_service.process_action(
            recommendation_id=rec_id,
            action="MODIFY",
            reviewer_id=req.reviewer_id,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            modified_quantity=req.modified_quantity,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recommendations/{rec_id}/reject")
def reject_recommendation(rec_id: str, req: ApprovalActionRequest):
    try:
        return approval_service.process_action(
            recommendation_id=rec_id,
            action="REJECT",
            reviewer_id=req.reviewer_id,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recommendations/{rec_id}/escalate")
def escalate_recommendation(rec_id: str, req: ApprovalActionRequest):
    try:
        return approval_service.process_action(
            recommendation_id=rec_id,
            action="ESCALATE",
            reviewer_id=req.reviewer_id,
            reviewer_name=req.reviewer_name,
            reviewer_role=req.reviewer_role,
            reason=req.reason
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transfers", response_model=List[TransferRecord])
def get_transfers():
    return repo.get_transfers()
