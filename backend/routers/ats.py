from fastapi import APIRouter, Form
from fastapi.responses import StreamingResponse
from services.ats_engine import run_ats_simulation, generate_ats_resume
from services.ai_service import analyze_cv_with_ai
from io import BytesIO

router = APIRouter()


@router.post("/simulate")
async def simulate_ats(
    cv_text: str = Form(...),
    job_description: str = Form("")
):
    return run_ats_simulation(cv_text, job_description)


@router.post("/generate-resume")
async def generate_resume(
    cv_text: str = Form(...),
    language: str = Form("en"),
    filename: str = Form("ATS_Resume.pdf")
):
    # Get AI analysis for skills etc.
    analysis = await analyze_cv_with_ai(cv_text, language)
    pdf_bytes = generate_ats_resume(analysis, cv_text, filename)
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
