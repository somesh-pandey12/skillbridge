import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

RESUME_PARSE_PROMPT = """You are an expert resume parser. Extract structured information from the resume text.
Return ONLY a valid JSON object with NO markdown, NO backticks, NO explanation.
Just raw JSON like this:
{"skills": ["Python", "React"], "experience": [{"title": "Developer", "company": "ABC", "duration": "2 years"}], "education": [{"degree": "B.Tech", "institution": "XYZ University"}], "summary": "Brief summary"}

If you cannot find information for a field, use an empty array [].
IMPORTANT: Return ONLY the JSON object, nothing else."""

async def parse_resume_with_ai(resume_text: str) -> dict:
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": RESUME_PARSE_PROMPT},
                {"role": "user", "content": f"Parse this resume:\n\n{resume_text[:3000]}"}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        raw = completion.choices[0].message.content.strip()
        print(f"Raw AI response: {raw[:200]}")
        
        # Clean up response — remove markdown if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        
        return json.loads(raw)
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}, raw: {raw[:500]}")
        # Return basic structure if parsing fails
        return {
            "skills": [],
            "experience": [],
            "education": [],
            "summary": "Could not parse resume"
        }
    except Exception as e:
        print(f"Groq error: {e}")
        return {
            "skills": [],
            "experience": [],
            "education": [],
            "summary": "Error processing resume"
        }


async def analyze_skill_gap(candidate_skills: list, job_requirements: dict) -> dict:
    prompt = f"""You are a senior technical recruiter. Analyze the skill gap.
RETURN ONLY RAW JSON, no markdown, no backticks.

CANDIDATE SKILLS: {', '.join(candidate_skills)}
COMPANY: {job_requirements.get('company', '')}
ROLE: {job_requirements.get('role', '')}
REQUIRED SKILLS: {', '.join(job_requirements.get('required_skills', []))}

Return exactly this JSON structure:
{{"match_score": 75, "missing_skills": ["skill1"], "strong_matches": ["skill2"], "recommendations": [{{"skill": "Docker", "resource": "Docker docs", "priority": "high"}}], "leetcode_topics": ["Arrays", "DP"], "hiring_probability": "Medium"}}"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1000
        )
        
        raw = completion.choices[0].message.content.strip()
        
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        
        return json.loads(raw)
        
    except Exception as e:
        print(f"Skill gap error: {e}")
        return {
            "match_score": 0,
            "missing_skills": [],
            "strong_matches": candidate_skills[:3],
            "recommendations": [],
            "leetcode_topics": [],
            "hiring_probability": "Unknown"
        }