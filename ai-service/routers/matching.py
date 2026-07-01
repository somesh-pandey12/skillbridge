from fastapi import APIRouter, HTTPException
from services.groq_service import analyze_skill_gap
import os
from groq import Groq

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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