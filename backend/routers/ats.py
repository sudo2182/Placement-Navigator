from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Set
import re
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from typing import List, Optional, Dict, Any, Set
from backend.auth import require_role
from shared.models import get_db, User
from sqlalchemy.orm import Session
from backend.services.ats_service import (
    normalize_text_to_tokens,
    derive_keywords_from_jd_tokens,
    score_and_suggest,
    extract_resume_text_from_uploadfile,
)

router = APIRouter(prefix="/ats", tags=["ATS Scanner"]) 

class ScanRequest(BaseModel):
    resume_text: Optional[str] = None
    job_description: str
    required_keywords: Optional[List[str]] = None
    preferred_keywords: Optional[List[str]] = None
    synonyms: Optional[Dict[str, List[str]]] = None

class ScanResult(BaseModel):
    overall_score: float
    breakdown: Dict[str, float]
    matched_keywords: List[str]
    missing_required: List[str]
    missing_preferred: List[str]
    suggestions: List[str]

_word_re = re.compile(r"[A-Za-z][A-Za-z0-9+.#-]*")

def normalize_text(text: str) -> List[str]:
    tokens = _word_re.findall(text.lower())
    return tokens

def expand_with_synonyms(keywords: List[str], synonyms: Optional[Dict[str, List[str]]]) -> Dict[str, Set[str]]:
    mapping: Dict[str, Set[str]] = {}
    for kw in keywords:
        base = kw.lower().strip()
        mapping[base] = {base}
        if synonyms and base in synonyms:
            mapping[base].update({s.lower().strip() for s in synonyms[base]})
    return mapping

def match_keywords(tokens: Set[str], mapping: Dict[str, Set[str]]) -> (List[str], List[str]):
    matched = []
    missing = []
    for base_kw, variants in mapping.items():
        if any(v in tokens for v in variants):
            matched.append(base_kw)
        else:
            missing.append(base_kw)
    return matched, missing

@router.post("/scan", response_model=ScanResult)
async def scan_resume(req: ScanRequest, current_user: User = Depends(require_role(["student"])), db: Session = Depends(get_db)) -> Any:
    if not req.resume_text:
        # For MVP, require resume_text. File-based extraction can be added later.
        raise HTTPException(status_code=400, detail="resume_text is required in MVP. File upload support coming next.")

    resume_tokens = set(normalize_text(req.resume_text))
    jd_tokens = set(normalize_text(req.job_description))

    # Derive keywords from JD if none provided
    auto_required: List[str] = []
    auto_preferred: List[str] = []
    if not req.required_keywords and not req.preferred_keywords:
        # Simple heuristic: take frequent tech/tool terms as required; others as preferred
        tech_hint = {"python","java","typescript","javascript","react","node","aws","docker","kubernetes","sql","postgresql","mongodb","ml","ai","nlp","data","django","flask","fastapi","azure","gcp"}
        auto_required = [t for t in jd_tokens if t in tech_hint]
        # Preferred: take longer tokens likely to be domain-specific
        auto_preferred = [t for t in jd_tokens if len(t) >= 6 and t not in auto_required]

    required = req.required_keywords or auto_required
    preferred = req.preferred_keywords or auto_preferred

    # Synonyms expansion
    required_map = expand_with_synonyms(required, req.synonyms)
    preferred_map = expand_with_synonyms(preferred, req.synonyms)

    matched_req, missing_req = match_keywords(resume_tokens, required_map)
    matched_pref, missing_pref = match_keywords(resume_tokens, preferred_map)

    # Title alignment check (basic)
    title_terms = {"intern","engineer","developer","analyst","manager","scientist"}
    title_match = 1.0 if any(t in jd_tokens and t in resume_tokens for t in title_terms) else 0.0

    # Education check (basic presence of degree keywords)
    edu_terms = {"btech","b.e","bsc","m.tech","mtech","ms","bachelors","masters","degree"}
    edu_match = 1.0 if any(t in resume_tokens for t in edu_terms) else 0.0

    # Scoring weights
    w_required = 0.55
    w_preferred = 0.25
    w_title = 0.10
    w_education = 0.10

    req_score = (len(matched_req) / max(len(required), 1)) if required else 0.0
    pref_score = (len(matched_pref) / max(len(preferred), 1)) if preferred else 0.0

    overall = 100.0 * (w_required * req_score + w_preferred * pref_score + w_title * title_match + w_education * edu_match)

    # Suggestions
    suggestions: List[str] = []
    if missing_req:
        suggestions.append(f"Add or emphasize required keywords: {', '.join(sorted(missing_req))}")
    if missing_pref:
        suggestions.append(f"Consider including preferred keywords: {', '.join(sorted(missing_pref))}")
    # Section checks
    def has_section(name: str) -> bool:
        return name in req.resume_text.lower() if req.resume_text else False
    if not (has_section("projects") or has_section("experience")):
        suggestions.append("Add a Projects or Experience section with quantified impact.")
    if not has_section("skills"):
        suggestions.append("Include a Skills section with technologies and tools from the JD.")
    if not has_section("education"):
        suggestions.append("Add an Education section with degree, university, and graduation date.")

    breakdown = {
        "required": round(req_score * 100, 1),
        "preferred": round(pref_score * 100, 1),
        "title_alignment": round(title_match * 100, 1),
        "education": round(edu_match * 100, 1)
    }

    return ScanResult(
        overall_score=round(overall, 1),
        breakdown=breakdown,
        matched_keywords=sorted(set(matched_req + matched_pref)),
        missing_required=sorted(missing_req),
        missing_preferred=sorted(missing_pref),
        suggestions=suggestions
    )

@router.post("/scan-upload", response_model=ScanResult)
async def scan_resume_upload(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...),
    required_keywords: Optional[str] = Form(None),
    preferred_keywords: Optional[str] = Form(None),
    current_user: User = Depends(require_role(["student"])),
    db: Session = Depends(get_db)
) -> Any:
    try:
        data = await resume_file.read()
        resume_text = extract_resume_text_from_uploadfile(resume_file.filename or "resume.pdf", data)
        if not resume_text:
            raise HTTPException(status_code=400, detail="Could not extract text from uploaded file. Please upload PDF or DOCX.")

        resume_tokens = set(normalize_text_to_tokens(resume_text))
        jd_tokens = set(normalize_text_to_tokens(job_description))

        req_list = [k.strip() for k in (required_keywords or "").split(",") if k.strip()] if required_keywords else None
        pref_list = [k.strip() for k in (preferred_keywords or "").split(",") if k.strip()] if preferred_keywords else None
        auto_required, auto_preferred = derive_keywords_from_jd_tokens(jd_tokens)

        required = req_list or auto_required
        preferred = pref_list or auto_preferred

        overall, breakdown, matched_all, missing_req, missing_pref, suggestions = score_and_suggest(
            resume_tokens, jd_tokens, required, preferred, synonyms=None
        )

        return ScanResult(
            overall_score=overall,
            breakdown=breakdown,
            matched_keywords=matched_all,
            missing_required=missing_req,
            missing_preferred=missing_pref,
            suggestions=suggestions
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.get("/ping")
async def ping() -> Dict[str, Any]:
    return {"status": "ok"}