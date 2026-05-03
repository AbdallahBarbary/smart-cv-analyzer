from pypdf import PdfReader
from docx import Document
import io
from PIL import Image
import pytesseract


async def parse_file(file) -> str:
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        return parse_pdf(content)
    elif filename.endswith(".docx"):
        return parse_docx(content)
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        from PIL import Image
        import pytesseract
        img = Image.open(io.BytesIO(content))
        return pytesseract.image_to_string(img).strip()
    else:
        raise ValueError("Unsupported file type. Use PDF, DOCX, PNG, JPG, or JPEG.")


def parse_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()


def parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    lines = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(lines)