import re

POWER_VERBS = [
    "led", "managed", "developed", "built", "improved", "increased",
    "reduced", "delivered", "designed", "implemented", "optimized",
    "created", "launched", "achieved", "coordinated", "mentored",
    "automated", "streamlined", "generated", "spearheaded",
]


def run_ats_simulation(cv_text: str, job_description: str = "") -> dict:
    text_lower = cv_text.lower()
    words = re.findall(r"\b\w+\b", text_lower)
    word_count = len(words)

    has_experience = bool(re.search(r"\b(experience|employment|work history)\b", text_lower))
    has_education  = bool(re.search(r"\b(education|degree|university|bachelor|master)\b", text_lower))
    has_skills     = bool(re.search(r"\b(skills|technologies|tools|competencies)\b", text_lower))
    has_contact    = bool(re.search(r"\b(email|phone|linkedin|github)\b", text_lower))
    has_dates      = len(re.findall(r"\b(20\d{2}|19\d{2})\b", cv_text)) >= 2

    section_score = (has_experience + has_education + has_skills + has_contact) / 4 * 100
    power_hits = sum(1 for w in words if w in POWER_VERBS)
    keyword_density = min(100, int((power_hits / max(word_count, 1)) * 1000))
    formatting_score = 90 if has_dates else 55
    ats_score = int(section_score * 0.5 + keyword_density * 0.3 + formatting_score * 0.2)

    flags = []
    if not has_skills:       flags.append("No dedicated Skills section found")
    if not has_dates:        flags.append("Employment dates missing or unclear")
    if keyword_density < 15: flags.append("Low action verb density — add stronger verbs")
    if not has_contact:      flags.append("Contact information not clearly structured")
    if word_count < 200:     flags.append("CV too short — ATS may filter it automatically")

    return {
        "verdict": "LIKELY PASS" if ats_score >= 65 else "LIKELY REJECT",
        "score": ats_score,
        "section_scores": {
            "keyword_density": keyword_density,
            "formatting": formatting_score,
            "section_headers": int(section_score),
            "dates_timeline": 90 if has_dates else 40,
        },
        "flags": flags if flags else ["No major ATS issues detected!"]
    }

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
import re

def generate_ats_resume(cv_data: dict, cv_text: str, filename: str = "ATS_Resume.pdf") -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=0.5*inch, leftMargin=0.5*inch, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, spaceAfter=20, alignment=TA_CENTER, textColor=colors.black)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=14, spaceBefore=12, spaceAfter=6, fontWeight='bold')
    normal_style = ParagraphStyle('CustomNormal', parent=styles['Normal'], fontSize=10, spaceAfter=6, leftIndent=0)
    
    story = []
    
    try:
        # Header - Better name extraction
        name_match = re.search(r'^([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)', cv_text, re.MULTILINE)
        name = name_match.group(1).strip() if name_match else cv_data.get('name', 'Your Name')
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', cv_text)
        email = email_match.group() if email_match else "email@example.com"
        
        story.append(Paragraph(f"<b>{name}</b>", title_style))
        story.append(Paragraph(email, normal_style))
        story.append(Spacer(1, 12))
        
        # Skills as list
        story.append(Paragraph("SKILLS", heading_style))
        skills = cv_data.get('skills', [])[:10]
        if skills:
            skills_flow = ListFlowable([
                Paragraph(f"• {skill}", normal_style) for skill in skills
            ], bulletFontName='Helvetica', bulletFontSize=10, spaceBefore=6)
            story.append(skills_flow)
        story.append(Spacer(1, 12))
        
        # Experience
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
        lines = cv_text.split('\n')
        exp_bullets = [line.strip() for line in lines if len(line.strip()) > 20 and any(word in line.lower() for word in ['worked', 'developed', 'led', 'managed', 'experience'])][:5]
        if not exp_bullets:
            exp_bullets = ["• Professional experience extracted from your CV.", "• ATS-optimized format for maximum compatibility."]
        
        for bullet in exp_bullets:
            story.append(Paragraph(bullet, normal_style))
        story.append(Spacer(1, 12))
        
        # Education
        story.append(Paragraph("EDUCATION", heading_style))
        edu_patterns = r'(education|degree|university|college|.*bachelor|.*master|.*phd).*?'
        edu_text = re.search(edu_patterns, cv_text, re.IGNORECASE | re.DOTALL)
        edu = edu_text.group().strip() if edu_text else "Bachelor's Degree | University Name"
        story.append(Paragraph(f"• {edu}", normal_style))
        
        doc.build(story)
    except Exception as e:
        # Fallback simple PDF
        story = [Paragraph("ATS Resume Generated", title_style), Paragraph(f"Error: {str(e)}", normal_style)]
        doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
