# Smart CV Analyzer - BUG FIXES TODO

## Previous Features
✅ All core features implemented!

## Current BUG FIXES (to be checked off)

1. [ ] Fix backend/services/ats_engine.py - PDF generation crash (missing story elements in reportlab)
2. [ ] Fix backend/services/ai_service.py - Add error handling, make async, fix bare except
3. [ ] Fix backend/routers/cv.py - Ensure CV analysis endpoint works (read file first)
4. [ ] Fix backend/routers/jobs.py - Fix auto job search endpoint (read file first)
5. [ ] Fix frontend/app/layout.tsx + globals.css - Footer hiding Arabic language switch
6. [ ] Fix frontend/components/JobMatch.tsx - Auto job search integration
7. [ ] Test: cd backend && uvicorn main:app --reload | cd frontend && npm run dev
8. [ ] COMPLETE - All bugs fixed!

**Notes**: 
- Test CV upload → analysis → ATS resume download → job search.
- Arabic language switch visible.
- User-reported: "CANT ANALYSE CV", "GENERATE ATS RESUME AINT WORKING", "AUTO JOB SEARCH TOO".
