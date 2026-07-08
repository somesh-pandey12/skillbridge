from fastapi import APIRouter, HTTPException
from services.groq_service import analyze_skill_gap
from services.vector_service import upsert_job, upsert_jobs_bulk, find_matching_jobs
import os
from groq import Groq

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@router.post("/interview-questions")
async def get_interview_questions(data: dict):
    try:
        company = data.get("company", "Google")
        level = data.get("level", "Junior")

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Generate 8 technical interview questions for {company} at {level} level.
Mix of: DSA, System Design, and {company}-specific questions.
Return ONLY a JSON array like: {{"questions": ["Q1", "Q2", "Q3"]}}
No markdown, no explanation."""
            }],
            temperature=0.7,
            max_tokens=800
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        raw = raw.strip()

        import json
        return json.loads(raw)

    except Exception as e:
        return {"questions": [
            f"Tell me about yourself and why you want to join {company}?",
            "Explain time complexity of common sorting algorithms.",
            "Design a URL shortener system.",
            "What is the difference between SQL and NoSQL?",
            "Explain SOLID principles.",
            "How does garbage collection work?",
            "What are microservices?",
            "How would you optimize a slow database query?"
        ]}


@router.post("/interview-feedback")
async def get_interview_feedback(data: dict):
    try:
        question = data.get("question", "")
        answer = data.get("answer", "")
        company = data.get("company", "")

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""You are a {company} interviewer. Give constructive feedback on this answer.

Question: {question}
Candidate's Answer: {answer}

Provide:
1. What was good
2. What was missing
3. How to improve
4. Score out of 10

Be specific and helpful. Keep it under 150 words."""
            }],
            temperature=0.5,
            max_tokens=400
        )

        return {"feedback": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cover-letter")
async def generate_cover_letter(data: dict):
    try:
        company = data.get("company", "")
        role = data.get("role", "")
        skills = data.get("skills", "")
        experience = data.get("experience", "")

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Write a professional cover letter for:
Company: {company}
Role: {role}
Skills: {skills}
Experience: {experience}

Make it compelling, professional, and personalized.
3 paragraphs. No placeholders. Ready to send."""
            }],
            temperature=0.7,
            max_tokens=600
        )

        return {"letter": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skill-gap")
async def get_skill_gap(data: dict):
    try:
        if "candidateSkills" not in data or "jobRequirements" not in data:
            raise HTTPException(
                status_code=400,
                detail="candidateSkills aur jobRequirements dono required hain"
            )
        analysis = await analyze_skill_gap(
            data["candidateSkills"],
            data["jobRequirements"]
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def get_jobs():
    return {
        "jobs": [
            {
                "id": "1",
                "company": "Google",
                "role": "Software Engineer",
                "required_skills": ["Python", "System Design", "DSA", "Go", "Kubernetes"],
                "location": "Bangalore",
                "type": "Full-time"
            },
            {
                "id": "2",
                "company": "Microsoft",
                "role": "SDE-2",
                "required_skills": ["C++", "Azure", "System Design", "React", "TypeScript"],
                "location": "Hyderabad",
                "type": "Full-time"
            },
            {
                "id": "3",
                "company": "Amazon",
                "role": "Backend Engineer",
                "required_skills": ["Java", "AWS", "Microservices", "DynamoDB", "Spring Boot"],
                "location": "Remote",
                "type": "Full-time"
            }
        ]
    }


@router.post("/chat")
async def somu_chat(data: dict):
    try:
        message = data.get("message", "")
        history = data.get("history", [])

        messages = [
            {
                "role": "system",
                "content": """You are Somu, a friendly and expert AI career assistant for CareerLens AI platform.
You help students and professionals with:
- Resume improvement tips
- Company-specific interview preparation (Google, Microsoft, Amazon, Flipkart etc.)
- LeetCode and DSA topic recommendations  
- Skill gap analysis and career guidance
- Internship and job search strategies in India

Be concise, friendly, and practical. Use emojis occasionally.
Format responses with bullet points when listing items.
Keep responses under 150 words unless detailed explanation is needed."""
            }
        ]

        for h in history[-6:]:
            if h.get("role") in ["user", "assistant"]:
                messages.append({
                    "role": h["role"], 
                    "content": h["content"]
                })

        messages.append({"role": "user", "content": message})

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        return {"reply": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# NEW: Pinecone job-matching endpoints (this was the missing 20%)
# ─────────────────────────────────────────────────────────────

@router.post("/index-job")
async def index_job(data: dict):
    """
    Call this once per job whenever a job is created/seeded on the Node side.
    Embeds required_skills into Pinecone with type="job" so it becomes
    discoverable by /match-jobs.
    """
    try:
        job_id = data.get("jobId")
        skills = data.get("skills", [])
        if not job_id:
            raise HTTPException(status_code=400, detail="jobId is required")
        if not skills:
            raise HTTPException(status_code=400, detail="skills list is required")

        # NOTE: "type" is reserved for the Pinecone filter ("job" vs "resume").
        # The job's own type (Full-time/Internship/etc) is stored as "jobType" instead.
        metadata = {
            "company": data.get("company", ""),
            "role": data.get("role", ""),
            "location": data.get("location", ""),
            "jobType": data.get("jobType", "")
        }

        vector_id = upsert_job(job_id, " ".join(skills), metadata)
        return {"status": "indexed", "jobId": job_id, "vectorId": vector_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index-jobs")
async def index_jobs_bulk(data: dict):
    """
    Bulk version — pass {"jobs": [{jobId, skills, company, role, location, jobType}, ...]}
    Used for re-indexing everything at once (e.g. after a fresh /jobs/seed).
    """
    try:
        jobs = data.get("jobs", [])
        if not jobs:
            raise HTTPException(status_code=400, detail="jobs list is required")

        payload = []
        for j in jobs:
            if not j.get("jobId") or not j.get("skills"):
                continue
            payload.append({
                "jobId": j["jobId"],
                "skills_text": " ".join(j["skills"]),
                "metadata": {
                    "company": j.get("company", ""),
                    "role": j.get("role", ""),
                    "location": j.get("location", ""),
                    "jobType": j.get("jobType", "")
                }
            })

        indexed_count = upsert_jobs_bulk(payload)
        return {"status": "indexed", "count": indexed_count}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/match-jobs")
async def match_jobs(data: dict):
    """
    Given a candidate's skills, returns the top-k semantically closest jobs
    from Pinecone (jobId + similarity score + light metadata).
    Node then hydrates these jobIds against MongoDB for full job details.
    """
    try:
        skills = data.get("skills", [])
        top_k = int(data.get("top_k", 5))
        if not skills:
            raise HTTPException(status_code=400, detail="skills list is required")

        matches = find_matching_jobs(" ".join(skills), top_k=top_k)

        return {
            "matches": [
                {
                    "jobId": m.metadata.get("jobId") if m.metadata else m.id.replace("job_", ""),
                    "score": round(float(m.score), 4),
                    "company": (m.metadata or {}).get("company", ""),
                    "role": (m.metadata or {}).get("role", "")
                }
                for m in matches
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))