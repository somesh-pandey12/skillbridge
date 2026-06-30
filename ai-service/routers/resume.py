from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser_service import extract_text_from_pdf
from services.groq_service import parse_resume_with_ai, analyze_skill_gap
from services.vector_service import upsert_resume, find_matching_jobs
import uuid

router = APIRouter()

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files accepted")

    content = await file.read()
    raw_text = extract_text_from_pdf(content)

    if len(raw_text) < 100:
        raise HTTPException(400, "Could not extract text from PDF")

    parsed = await parse_resume_with_ai(raw_text)

    resume_id = str(uuid.uuid4())
    skills_text = " ".join(parsed.get("skills", []))
    upsert_resume(resume_id, skills_text)

    matching_jobs = find_matching_jobs(skills_text)

    return {
        "resumeId": resume_id,
        "originalText": raw_text[:500],
        "parsedSkills": parsed.get("skills", []),
        "experience": parsed.get("experience", []),
        "education": parsed.get("education", []),
        "vectorId": resume_id,
        "matchingJobs": [m.metadata for m in matching_jobs]
    }

@router.post("/skill-gap")
async def get_skill_gap(data: dict):
    analysis = await analyze_skill_gap(
        data["candidateSkills"],
        data["jobRequirements"]
    )
    return analysis