import os
from groq import Groq
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

RESUME_PARSE_PROMPT = """
You are an expert resume parser. Extract structured information from the resume text below.
Return ONLY valid JSON with this exact structure:
{
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "...", "company": "...", "duration": "..."}],
  "education": [{"degree": "...", "institution": "..."}],
  "summary": "brief professional summary"
}
"""

async def parse_resume_with_ai(resume_text: str) -> dict:
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": RESUME_PARSE_PROMPT},
            {"role": "user", "content": f"Resume:\n{resume_text}"}
        ],
        temperature=0.1,
        max_tokens=2000
    )
    return json.loads(completion.choices[0].message.content)


async def analyze_skill_gap(candidate_skills: list, job_requirements: dict) -> dict:
    prompt = f"""
You are a senior technical recruiter. Analyze the skill gap between:

CANDIDATE SKILLS: {', '.join(candidate_skills)}

JOB REQUIREMENTS:
Company: {job_requirements['company']}
Role: {job_requirements['role']}
Required skills: {', '.join(job_requirements['required_skills'])}

Return ONLY valid JSON:
{{
  "match_score": 85,
  "missing_skills": ["skill1", "skill2"],
  "strong_matches": ["skill3"],
  "recommendations": [
    {{"skill": "Docker", "resource": "Docker official docs", "priority": "high"}},
    {{"skill": "System Design", "resource": "Grokking System Design", "priority": "medium"}}
  ],
  "leetcode_topics": ["Binary Search", "Dynamic Programming"],
  "hiring_probability": "High"
}}
"""
    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=1500
    )
    return json.loads(completion.choices[0].message.content)