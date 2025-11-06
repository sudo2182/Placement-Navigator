import re
import time
import os
from typing import Dict, Any, List, Tuple

from .pdf_extractor import pdf_extractor

COMMON_SECTIONS = [
    "experience", "work experience", "professional experience",
    "education", "skills", "projects", "certifications",
    "summary", "objective", "achievements", "publications",
]

# Simple skills catalog (extendable)
SKILL_CATALOG = [
    # Languages & Frameworks
    "python", "java", "c++", "javascript", "typescript", "go", "rust",
    "react", "next.js", "node", "fastapi", "django", "flask", "spring",
    # Databases & DevOps
    "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws", "gcp", "azure",
    # Data/ML
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "nlp",
    # Tools
    "git", "github", "ci/cd", "linux"
]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\-\s()]{7,}\d)")
YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")
URL_RE = re.compile(r"https?://[^\s]+")
NAME_LINE_RE = re.compile(r"^[A-Z][A-Za-z\-'.]+(\s+[A-Z][A-Za-z\-'.]+)+$")

class ATSService:
    """Local ATS analysis with optional LLM enhancement if API key is present."""

    def __init__(self) -> None:
        self.ai_available = bool(os.getenv("OPENAI_API_KEY"))

    def analyze_text(self, text: str) -> Dict[str, Any]:
        start = time.time()
        clean = text.strip()

        # Basic extractions
        emails = EMAIL_RE.findall(clean)
        phones = PHONE_RE.findall(clean)
        urls = URL_RE.findall(clean)
        years = YEAR_RE.findall(clean)

        # Guess name from first 5 lines
        name = None
        for line in clean.splitlines()[:5]:
            line = line.strip()
            if 2 <= len(line.split()) <= 5 and NAME_LINE_RE.match(line):
                name = line
                break

        # Section detection
        sections_found = []
        lower = clean.lower()
        for sec in COMMON_SECTIONS:
            if sec in lower:
                sections_found.append(sec)

        # Skills extraction (catalog-based)
        skills_found: List[str] = []
        tokens = set(re.findall(r"[a-zA-Z0-9+.#/-]+", lower))
        for sk in SKILL_CATALOG:
            if sk in tokens:
                skills_found.append(sk)

        # ATS scoring (0-100)
        score = 0.0
        # Sections
        score += min(5, len(sections_found)) * 10  # up to 50
        # Bullets / structure
        if "\n- " in clean or "\n•" in clean or "\n* " in clean:
            score += 10
        # Contact info
        if emails:
            score += 10
        if phones:
            score += 5
        # Dates present
        if len(years) >= 2:
            score += 10
        # Penalize excessive special chars
        special_chars = len(re.findall(r"[^\w\s\-\.@()/*]", clean))
        if special_chars > 40:
            score -= 5

        score = max(0, min(100, int(round(score))))

        # Recommendations
        recs: List[str] = []
        if not emails:
            recs.append("Add a professional email in the header.")
        if not phones:
            recs.append("Add a reachable phone number.")
        if len(sections_found) < 4:
            recs.append("Include standard sections: Summary, Skills, Experience, Education.")
        if "\n- " not in clean and "\n•" not in clean and "\n* " not in clean:
            recs.append("Use bullet points for readability and ATS parsing.")
        if len(skills_found) < 5:
            recs.append("Add a focused skills section with relevant keywords.")
        if special_chars > 40:
            recs.append("Reduce non-standard symbols that may confuse ATS.")

        analysis_time = round(time.time() - start, 3)

        return {
            "score": score,
            "analysis_ms": int(analysis_time * 1000),
            "sections_found": sections_found,
            "contact": {
                "name": name or "",
                "emails": emails[:2],
                "phones": phones[:2],
                "urls": urls[:3],
            },
            "skills": skills_found,
            "stats": {
                "chars": len(clean),
                "lines": len(clean.splitlines()),
            },
            "recommendations": recs,
        }

    def analyze_pdf_bytes(self, pdf_bytes: bytes) -> Dict[str, Any]:
        text, chars, pages = pdf_extractor.extract_text(pdf_bytes)
        result = self.analyze_text(text or "")
        result["pages"] = pages
        result["chars"] = chars
        return result

ats_service = ATSService()
