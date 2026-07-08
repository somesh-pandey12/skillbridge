from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser_service import extract_text_from_pdf
from services.groq_service import parse_resume_with_ai
from services.vector_service import upsert_resume, find_matching_jobs
import uuid

router = APIRouter()


def _get_matching_jobs(skills: list, top_k: int = 5) -> list:
    """Non-fatal helper: if Pinecone/matching fails, return [] instead of breaking resume parsing."""
    if not skills:
        return []
    try:
        matches = find_matching_jobs(" ".join(skills), top_k=top_k)
        return [
            {
                "jobId": m.metadata.get("jobId") if m.metadata else m.id.replace("job_", ""),
                "score": round(float(m.score), 4),
                "company": (m.metadata or {}).get("company", ""),
                "role": (m.metadata or {}).get("role", "")
            }
            for m in matches
        ]
    except Exception as e:
        print(f"Job matching error (non-fatal): {e}")
        return []


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        print(f"File received: {file.filename}, type: {file.content_type}")

        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files accepted")

        content = await file.read()
        print(f"File size: {len(content)} bytes")

        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file received")

        raw_text = extract_text_from_pdf(content)
        print(f"Extracted text length: {len(raw_text)}")
        print(f"First 200 chars: {raw_text[:200]}")

        if len(raw_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. Your PDF might be scanned or image-based. Please use a text-based PDF."
            )

        parsed = await parse_resume_with_ai(raw_text)
        print(f"Parsed skills: {parsed.get('skills', [])}")

        resume_id = str(uuid.uuid4())
        skills = parsed.get("skills", [])
        skills_text = " ".join(skills)

        try:
            upsert_resume(resume_id, skills_text)
        except Exception as e:
            print(f"Pinecone error (non-fatal): {e}")

        matching_jobs = _get_matching_jobs(skills)

        return {
            "resumeId": resume_id,
            "originalText": raw_text[:500],
            "parsedSkills": skills,
            "experience": parsed.get("experience", []),
            "education": parsed.get("education", []),
            "vectorId": resume_id,
            "matchingJobs": matching_jobs
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-text")
async def analyze_text(data: dict):
    try:
        text = data.get("text", "")
        if len(text) < 30:
            raise HTTPException(status_code=400, detail="Text too short")

        parsed = await parse_resume_with_ai(text)
        resume_id = str(uuid.uuid4())
        skills = parsed.get("skills", [])

        try:
            upsert_resume(resume_id, " ".join(skills))
        except Exception as e:
            print(f"Pinecone error (non-fatal): {e}")

        matching_jobs = _get_matching_jobs(skills)

        return {
            "resumeId": resume_id,
            "originalText": text[:500],
            "parsedSkills": skills,
            "experience": parsed.get("experience", []),
            "education": parsed.get("education", []),
            "vectorId": resume_id,
            "matchingJobs": matching_jobs
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Analyze text error: {e}")
        raise HTTPException(status_code=500, detail=str(e))