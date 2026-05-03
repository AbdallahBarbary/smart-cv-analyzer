from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from services.ai_service import evaluate_full_interview
from database.db import get_db, InterviewSession

router = APIRouter()


class QA(BaseModel):
    q: str
    a: str


class EvaluateRequest(BaseModel):
    history: List[QA]
    language: str = "en"


@router.post("/evaluate")
async def evaluate_interview(
    request: EvaluateRequest,
    db: Session = Depends(get_db)
):
    history_dicts = [{"q": h.q, "a": h.a} for h in request.history]
    result = await evaluate_full_interview(history_dicts, request.language)

    session = InterviewSession(
        overall_score=result.get("score"),
        confidence_score=result.get("confidence"),
        clarity_score=result.get("clarity"),
        feedback=result.get("feedback"),
        qa_history=history_dicts,
        language=request.language
    )
    db.add(session)
    db.commit()
    return result


@router.get("/sessions")
async def get_sessions(db: Session = Depends(get_db)):
    sessions = db.query(InterviewSession).order_by(
        InterviewSession.created_at.desc()
    ).limit(20).all()
    return [
        {
            "id": s.id,
            "score": s.overall_score,
            "confidence": s.confidence_score,
            "clarity": s.clarity_score,
            "created_at": str(s.created_at)
        }
        for s in sessions
    ]