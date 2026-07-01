from fastapi import APIRouter, UploadFile, File, HTTPException
from services.parser_service import extract_text_from_pdf
from services.groq_service import parse_resume_with_ai
from services.vector_service import upsert_resume, find_matching_jobs
import uuid

router = APIRouter()

@router.post("/analyze-text")
async def analyze_text(data: dict):
    try:
        text = data.get("text", "")
        if len(text) < 30:
            raise HTTPException(400, "Text too short")

        parsed = await parse_resume_with_ai(text)
        resume_id = str(uuid.uuid4())

        return {
            "resumeId": resume_id,
            "originalText": text[:500],
            "parsedSkills": parsed.get("skills", []),
            "experience": parsed.get("experience", []),
            "education": parsed.get("education", []),
            "vectorId": resume_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        print(f"File received: {file.filename}, type: {file.content_type}")
        
        # Accept any file that looks like PDF
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(400, "Only PDF files accepted")

        content = await file.read()
        print(f"File size: {len(content)} bytes")
        
        if len(content) == 0:
            raise HTTPException(400, "Empty file received")

        raw_text = extract_text_from_pdf(content)
        print(f"Extracted text length: {len(raw_text)}")
        print(f"First 200 chars: {raw_text[:200]}")

        if len(raw_text.strip()) < 50:
            raise HTTPException(400, f"Could not extract text from PDF. Extracted: '{raw_text[:100]}'")

        parsed = await parse_resume_with_ai(raw_text)
        print(f"Parsed skills: {parsed.get('skills', [])}")

        resume_id = str(uuid.uuid4())
        skills_text = " ".join(parsed.get("skills", []))
        
        try:
            upsert_resume(resume_id, skills_text)
        except Exception as e:
            print(f"Pinecone error (non-fatal): {e}")

        return {
            "resumeId": resume_id,
            "originalText": raw_text[:500],
            "parsedSkills": parsed.get("skills", []),
            "experience": parsed.get("experience", []),
            "education": parsed.get("education", []),
            "vectorId": resume_id,
            "matchingJobs": []
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))