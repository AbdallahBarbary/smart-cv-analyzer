from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from services.ai_service import analyze_cv_with_ai, rewrite_cv_bullets, generate_ats_cv
from services.file_parser import parse_file
from database.db import get_db, CVAnalysis

router = APIRouter()


@router.post("/extract")
async def extract_cv_text(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    """Extract raw text from PDF or Word file without running AI analysis."""
    try:
        text = await parse_file(file)
        return {"text": text, "length": len(text)}
    except Exception as e:
        return {"text": "", "error": str(e)}


@router.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(None),
    cv_text: str = Form(None),
    language: str = Form("en"),
    db: Session = Depends(get_db)
):
    text = cv_text
    if file and file.filename:
        text = await parse_file(file)
    if not text:
        return {"error": "Please provide a CV file or paste CV text"}

    result = await analyze_cv_with_ai(text, language)

    try:
        db_record = CVAnalysis(
            cv_text=text[:5000],
            score=result.get("score"),
            skills_score=result.get("skills_score"),
            experience_score=result.get("experience_score"),
            education_score=result.get("education_score"),
            skills=result.get("skills"),
            strengths=result.get("strengths"),
            weaknesses=result.get("weaknesses"),
            language=language
        )
        db.add(db_record)
        db.commit()
    except Exception:
        pass

    return result


@router.post("/rewrite")
async def rewrite_cv(
    cv_text: str = Form(...),
    language: str = Form("en")
):
    return await rewrite_cv_bullets(cv_text, language)


@router.post("/generate")
async def generate_cv(
    cv_text: str = Form(...),
    job_description: str = Form(""),
    language: str = Form("en")
):
    return await generate_ats_cv(cv_text, job_description, language)