from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CVAnalysis(Base):
    __tablename__ = "cv_analyses"
    id = Column(Integer, primary_key=True, index=True)
    cv_text = Column(Text)
    score = Column(Integer)
    skills_score = Column(Integer)
    experience_score = Column(Integer)
    education_score = Column(Integer)
    skills = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(255))
    interview_type = Column(String(50))
    pressure_mode = Column(String(50))
    overall_score = Column(Integer)
    confidence_score = Column(Integer)
    clarity_score = Column(Integer)
    feedback = Column(Text)
    qa_history = Column(JSON)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()