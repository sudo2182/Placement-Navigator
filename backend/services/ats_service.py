from typing import List, Dict, Set, Tuple, Optional
import re
from io import BytesIO

# PDF extraction
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except Exception:
    pdf_extract_text = None

# DOCX extraction
try:
    from docx import Document  # type: ignore
except Exception:
    Document = None  # type: ignore

# Fuzzy matching
try:
    from rapidfuzz import fuzz
except Exception:
    fuzz = None

_word_re = re.compile(r"[A-Za-z][A-Za-z0-9+.#-]*")

TECH_HINT = {
    "python","java","typescript","javascript","react","next.js","nextjs","node","node.js","aws","docker","kubernetes",
    "sql","postgres","postgresql","mongodb","ml","ai","nlp","data","django","flask","fastapi","azure","gcp","tailwind","ci","cd","ci/cd"
}

TITLE_TERMS = {"intern","engineer","developer","analyst","manager","scientist"}
EDU_TERMS = {"btech","b.e","be","bsc","m.tech","mtech","ms","bachelors","masters","degree","bachelor","master"}

DEFAULT_WEIGHTS = {
    "required": 0.55,
    "preferred": 0.25,
    "title": 0.10,
    "education": 0.10,
}

def normalize_text_to_tokens(text: str) -> List[str]:
    tokens = _word_re.findall(text.lower())
    return tokens

def expand_with_synonyms(keywords: List[str], synonyms: Optional[Dict[str, List[str]]]) -> Dict[str, Set[str]]:
    mapping: Dict[str, Set[str]] = {}
    for kw in keywords:
        base = kw.lower().strip()
        variants = {base}
        if synonyms and base in synonyms:
            variants.update({s.lower().strip() for s in synonyms[base]})
        # Common variants
        if base == "javascript":
            variants.update({"js"})
        if base == "node" or base == "node.js":
            variants.update({"nodejs","node"})
        if base == "postgres" or base == "postgresql":
            variants.update({"postgre","postgreSQL","postgresql"})
        mapping[base] = variants
    return mapping

def match_keywords_exact(tokens: Set[str], mapping: Dict[str, Set[str]]) -> Tuple[List[str], List[str]]:
    matched = []
    missing = []
    for base_kw, variants in mapping.items():
        if any(v in tokens for v in variants):
            matched.append(base_kw)
        else:
            missing.append(base_kw)
    return matched, missing

def match_keywords_fuzzy(tokens: Set[str], mapping: Dict[str, Set[str]], threshold: int = 90) -> Tuple[List[str], List[str]]:
    if fuzz is None:
        return match_keywords_exact(tokens, mapping)
    matched = []
    missing = []
    for base_kw, variants in mapping.items():
        found = False
        for t in tokens:
            for v in variants:
                if fuzz.partial_ratio(t, v) >= threshold:
                    found = True
                    break
            if found:
                break
        if found:
            matched.append(base_kw)
        else:
            missing.append(base_kw)
    return matched, missing

def extract_text_from_pdf_bytes(data: bytes) -> str:
    if pdf_extract_text is None:
        return ""
    try:
        bio = BytesIO(data)
        text = pdf_extract_text(bio) or ""
        return text
    except Exception:
        return ""

def extract_text_from_docx_bytes(data: bytes) -> str:
    if Document is None:
        return ""
    try:
        bio = BytesIO(data)
        doc = Document(bio)  # type: ignore
        paras = [p.text for p in doc.paragraphs]
        return "\n".join(paras)
    except Exception:
        return ""

def extract_text_from_unknown_bytes(data: bytes) -> str:
    # Try utf-8, then latin1 fallback
    try:
        return data.decode("utf-8")
    except Exception:
        try:
            return data.decode("latin1")
        except Exception:
            return ""

def derive_keywords_from_jd_tokens(jd_tokens: Set[str]) -> Tuple[List[str], List[str]]:
    auto_required = [t for t in jd_tokens if t in TECH_HINT]
    auto_preferred = [t for t in jd_tokens if len(t) >= 6 and t not in auto_required]
    return auto_required, auto_preferred

def score_and_suggest(
    resume_tokens: Set[str],
    jd_tokens: Set[str],
    required: List[str],
    preferred: List[str],
    synonyms: Optional[Dict[str, List[str]]] = None,
    weights: Dict[str, float] = DEFAULT_WEIGHTS,
) -> Tuple[float, Dict[str, float], List[str], List[str], List[str], List[str]]:
    required_map = expand_with_synonyms(required, synonyms)
    preferred_map = expand_with_synonyms(preferred, synonyms)

    matched_req, missing_req = match_keywords_fuzzy(resume_tokens, required_map)
    matched_pref, missing_pref = match_keywords_fuzzy(resume_tokens, preferred_map)

    title_match = 1.0 if any(t in jd_tokens and t in resume_tokens for t in TITLE_TERMS) else 0.0
    edu_match = 1.0 if any(t in resume_tokens for t in EDU_TERMS) else 0.0

    req_score = (len(matched_req) / max(len(required), 1)) if required else 0.0
    pref_score = (len(matched_pref) / max(len(preferred), 1)) if preferred else 0.0

    overall = 100.0 * (
        weights.get("required", 0.55) * req_score +
        weights.get("preferred", 0.25) * pref_score +
        weights.get("title", 0.10) * title_match +
        weights.get("education", 0.10) * edu_match
    )

    breakdown = {
        "required": round(req_score * 100, 1),
        "preferred": round(pref_score * 100, 1),
        "title_alignment": round(title_match * 100, 1),
        "education": round(edu_match * 100, 1)
    }

    suggestions: List[str] = []
    if missing_req:
        suggestions.append(f"Add or emphasize required keywords: {', '.join(sorted(missing_req))}")
    if missing_pref:
        suggestions.append(f"Consider including preferred keywords: {', '.join(sorted(missing_pref))}")

    matched_all = sorted(set(matched_req + matched_pref))

    return round(overall, 1), breakdown, matched_all, sorted(missing_req), sorted(missing_pref), suggestions

def extract_resume_text_from_uploadfile(filename: str, data: bytes) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf_bytes(data)
    if lower.endswith(".docx") or lower.endswith(".doc"):
        return extract_text_from_docx_bytes(data)
    # Fallback unknown to text
    return extract_text_from_unknown_bytes(data)