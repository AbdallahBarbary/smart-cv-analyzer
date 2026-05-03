from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cv, jobs, interview, ats
from database.db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart CV Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv.router,        prefix="/api/cv",        tags=["CV"])
app.include_router(jobs.router,      prefix="/api/jobs",      tags=["Jobs"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(ats.router,       prefix="/api/ats",       tags=["ATS"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}