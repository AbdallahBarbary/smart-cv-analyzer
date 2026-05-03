from fastapi import APIRouter, Form
from services.ai_service import match_job_with_ai, search_jobs_with_ai

router = APIRouter()


@router.post("/match")
async def match_job(
    cv_text: str = Form(...),
    job_description: str = Form(...),
    language: str = Form("en")
):
    return await match_job_with_ai(cv_text, job_description, language)


@router.post("/search")
async def search_jobs(
    cv_text: str = Form(...),
    language: str = Form("en")
):
    return await search_jobs_with_ai(cv_text, language)