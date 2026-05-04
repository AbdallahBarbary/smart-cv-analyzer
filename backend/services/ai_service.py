from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()
_client = None


def get_client() -> Groq:
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Add it to backend/.env to enable AI features."
        )

    _client = Groq(api_key=api_key)
    return _client


def clean_json(text: str) -> dict:
    clean = text.replace("```json", "").replace("```", "").strip()
    # Find first { or [ 
    start = -1
    for i, c in enumerate(clean):
        if c in "{[":
            start = i
            break
    if start > 0:
        clean = clean[start:]
    return json.loads(clean)


def ask_ai(prompt: str, max_tokens: int = 1500) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


async def analyze_cv_with_ai(cv_text: str, language: str = "en") -> dict:
    lang_note = "Respond entirely in Egyptian Arabic (عامية مصرية)" if language == "ar" else "Respond in English"

    prompt = f"""You are an expert CV analyzer. {lang_note}.
Analyze the CV and return ONLY valid JSON, no other text, no markdown:
{{
  "score": <0-100>,
  "skills_score": <0-100>,
  "experience_score": <0-100>,
  "education_score": <0-100>,
  "formatting_score": <0-100>,
  "skills": [<8-12 skill strings>],
  "strengths": [<exactly 3 strings>],
  "weaknesses": [<exactly 3 strings>],
  "impact_suggestion": "<one actionable sentence>",
  "years_experience": <number or 0>,
  "seniority_level": "<Junior|Mid|Senior|Lead>"
}}

CV:
{cv_text[:3000]}"""

    return clean_json(ask_ai(prompt))


async def match_job_with_ai(cv_text: str, job_desc: str, language: str = "en") -> dict:
    lang_note = "Respond in Egyptian Arabic" if language == "ar" else "Respond in English"

    prompt = f"""You are a job-matching expert. {lang_note}.
Compare the CV to the job description. Return ONLY valid JSON, no markdown:
{{
  "match_percent": <0-100>,
  "missing_keywords": [<5-8 strings>],
  "strong_matches": <number>,
  "suggestions": [<3 strings>],
  "verdict": "<one sentence verdict>"
}}

CV: {cv_text[:2000]}

Job Description: {job_desc[:2000]}"""

    return clean_json(ask_ai(prompt))


async def rewrite_cv_bullets(cv_text: str, language: str = "en") -> dict:
    lang_note = "Write in Egyptian Arabic" if language == "ar" else "Write in English"

    prompt = f"""You are an expert CV writer. {lang_note}.
Find 3 weak bullet points and rewrite them stronger with metrics/impact.
Return ONLY valid JSON, no markdown:
{{"bullets": [{{"original": "...", "improved": "..."}}]}}

CV: {cv_text[:3000]}"""

    return clean_json(ask_ai(prompt))


async def generate_ats_cv(cv_text: str, job_description: str = "", language: str = "en") -> dict:
    lang_note = "Write in Egyptian Arabic" if language == "ar" else "Write in English"
    job_context = f"\nOptimize it for this job:\n{job_description[:1000]}" if job_description else ""

    prompt = f"""You are a professional CV writer and ATS expert. {lang_note}.
Take this CV and rewrite it as a fully optimized, ATS-friendly CV.{job_context}

Rules:
- Use clean formatting with clear section headers
- Add strong action verbs to all bullet points
- Quantify achievements where possible
- Include relevant keywords naturally
- Keep it professional and compelling

Return ONLY valid JSON, no markdown:
{{
  "cv_text": "<the full rewritten CV as plain text with newlines>",
  "improvements": [<list of 4-5 key improvements made as strings>],
  "ats_score_estimate": <estimated ATS score 0-100>,
  "keywords_added": [<list of 4-6 keywords that were added>]
}}

Original CV:
{cv_text[:3000]}"""

    return clean_json(ask_ai(prompt, max_tokens=2000))


async def search_jobs_with_ai(cv_text: str, language: str = "en") -> dict:
    lang_note = "Respond in Egyptian Arabic" if language == "ar" else "Respond in English"

    prompt = f"""You are a career advisor and job market expert. {lang_note}.
Based on this CV, generate realistic job recommendations.

Return ONLY valid JSON, no markdown:
{{
  "profile_summary": "<2 sentence summary of the candidate>",
  "best_titles": [<4-5 job title strings that match their profile>],
  "jobs": [
    {{
      "title": "<job title>",
      "company": "<realistic company name>",
      "location": "<city, country>",
      "type": "<Full-time|Remote|Hybrid>",
      "salary_range": "<e.g. $60k-$80k or EGP 15k-25k>",
      "match_percent": <60-99>,
      "why_match": "<one sentence>",
      "apply_url": "<https://linkedin.com/jobs or https://wuzzuf.net or https://indeed.com>",
      "skills_needed": [<3-4 skill strings>]
    }}
  ],
  "search_keywords": [<5 keywords to search on job sites>],
  "top_platforms": [<3 job platform names relevant to their profile>]
}}

Generate exactly 6 jobs in the list. Make them realistic for the candidate's level and skills.

CV:
{cv_text[:2500]}"""

    return clean_json(ask_ai(prompt, max_tokens=2000))


async def evaluate_full_interview(history: list, language: str = "en") -> dict:
    lang_note = "Respond in Egyptian Arabic" if language == "ar" else "Respond in English"

    qa_text = "\n\n".join([
        f"Q{i+1}: {h['q']}\nAnswer: {h['a']}"
        for i, h in enumerate(history)
    ])

    prompt = f"""You are a professional interview evaluator. {lang_note}.
Evaluate this interview transcript. Return ONLY valid JSON, no markdown:
{{
  "score": <0-100>,
  "confidence": <0-100>,
  "clarity": <0-100>,
  "feedback": "<2-3 sentences of actionable feedback>",
  "strengths": [<2 interview strengths>],
  "improvements": [<2 areas to improve>]
}}

Interview:
{qa_text}"""

    return clean_json(ask_ai(prompt))