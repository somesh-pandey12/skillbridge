from fastapi import APIRouter, HTTPException
from services.groq_service import analyze_skill_gap

router = APIRouter()

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
                "required_skills": ["Python", "System Design", "DSA", "Go"],
                "location": "Bangalore",
                "type": "Full-time"
            },
            {
                "id": "2",
                "company": "Microsoft",
                "role": "SDE-2",
                "required_skills": ["C++", "Azure", "System Design", "React"],
                "location": "Hyderabad",
                "type": "Full-time"
            },
            {
                "id": "3",
                "company": "Amazon",
                "role": "Backend Engineer",
                "required_skills": ["Java", "AWS", "Microservices", "DynamoDB"],
                "location": "Remote",
                "type": "Full-time"
            }
        ]
    }