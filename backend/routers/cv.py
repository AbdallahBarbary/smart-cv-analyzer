from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from services.ai_service import analyze_cv_with_ai, rewrite_cv_bullets, generate_ats_cv
from services.cv_export import export_cv, build_export_filename
from services.file_parser import parse_file
from database.db import get_db, CVAnalysis
import io

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

    try:
        result = await analyze_cv_with_ai(text, language)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="CV analysis failed")

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


@router.post("/export")
async def export_generated_cv(
    cv_text: str = Form(...),
    export_format: str = Form("pdf")
):
    if not cv_text or not cv_text.strip():
        raise HTTPException(status_code=400, detail="cv_text is required")

    fmt = export_format.lower().strip()
    if fmt not in {"pdf", "docx"}:
        raise HTTPException(status_code=400, detail="export_format must be 'pdf' or 'docx'")

    try:
        content = export_cv(cv_text, fmt)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to export CV file")

    mime_type = (
        "application/pdf"
        if fmt == "pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    filename = build_export_filename(cv_text, fmt)
    return StreamingResponse(
        io.BytesIO(content),
        media_type=mime_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )