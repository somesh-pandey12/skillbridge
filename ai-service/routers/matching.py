from fastapi import APIRouter, HTTPException
from services.groq_service import analyze_skill_gap
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