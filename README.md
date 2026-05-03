# 🧠 Smart CV Analyzer & Interview Simulator

An AI-powered career platform that analyzes CVs, simulates ATS systems, matches job descriptions, and runs mock interviews — with full Arabic (Egyptian dialect) and English support.

**Built by [Abdallah Elbarbary](https://www.linkedin.com/in/abdallah-elbarbary-a16440365/)**

---

## ✨ Features

- **CV Analyzer** — Upload a PDF/image or paste text to get an AI score (0–100), skill extraction, strengths, weaknesses, and actionable suggestions
- **ATS Resume Generator** — Generate a fully ATS-optimized resume and download it as a Word document
- **Job Match Engine** — Paste any job description and get a match percentage, missing keywords, and optimization tips
- **Live Job Search** — Automatically finds real, up-to-date jobs that match your skills
- **Interview Simulator** — Practice HR, Technical, or Mixed interviews with Relaxed, Timed, or Full Pressure modes
- **Progress Tracker** — Track your interview scores over time with visual charts
- **Bilingual** — Full Arabic (Egyptian dialect) and English support with RTL layout

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.12), SQLAlchemy |
| AI | Groq API (LLaMA 3.3 70B) |
| Database | PostgreSQL |
| File Parsing | pypdf, python-docx |

---

## 🚀 Local Setup

### Prerequisites
- Python 3.12
- Node.js 20+
- PostgreSQL 18

### Backend

```bash
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
GROQ_API_KEY=your_groq_key_here
DATABASE_URL=postgresql://cvuser:postgres123@localhost:5432/smart_cv_db
SECRET_KEY=any-random-string
DEBUG=True
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

- **Groq API** (free): [console.groq.com](https://console.groq.com) → API Keys → Create Key
- **PostgreSQL**: Install locally from [postgresql.org](https://postgresql.org/download/windows)

---

## 📁 Project Structure

```
smart-cv-analyzer/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/        # API route handlers
│   ├── services/       # AI, ATS engine, file parser
│   └── database/       # SQLAlchemy models
└── frontend/
    ├── app/            # Next.js app router
    ├── components/     # CV Analyzer, Job Match, Interview Sim...
    └── lib/            # API client
```

---

## 👤 Author

**Abdallah Elbarbary**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/abdallah-elbarbary-a16440365/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black)](https://github.com/AbdallahBarbary)
