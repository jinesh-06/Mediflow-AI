from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/api/gemini", tags=["Google Gemini Integration & Copilot"])

class ExplainRequest(BaseModel):
    recommendation_id: str
    language: str = "en"

class CopilotQueryRequest(BaseModel):
    query: str
    language: str = "en"

@router.post("/explain")
def explain_recommendation(req: ExplainRequest):
    try:
        return gemini_service.explain_recommendation(
            recommendation_id=req.recommendation_id,
            language=req.language
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/copilot")
def operations_copilot(req: CopilotQueryRequest):
    return gemini_service.answer_operations_query(
        query=req.query,
        language=req.language
    )

@router.get("/emergency-summary")
def get_emergency_summary(language: str = "en"):
    return gemini_service.summarize_emergency_situation(language=language)
