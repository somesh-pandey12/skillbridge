from pydantic import BaseModel, Field
from typing import List, Optional


# ─── Shared sub-models ───

class Experience(BaseModel):
    title: str = ""
    company: str = ""
    duration: str = ""


class Education(BaseModel):
    degree: str = ""
    institution: str = ""


class Recommendation(BaseModel):
    skill: str
    resource: str
    priority: str


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


# ─── /api/parse-resume & /api/analyze-text ───

class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Raw resume/voice text to analyze")


class ResumeParseResponse(BaseModel):
    resumeId: str
    originalText: str
    parsedSkills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    vectorId: str = ""
    matchingJobs: List[dict] = []


# ─── /api/skill-gap ───

class JobRequirements(BaseModel):
    company: str = ""
    role: str = ""
    required_skills: List[str] = []


class SkillGapRequest(BaseModel):
    candidateSkills: List[str]
    jobRequirements: JobRequirements


class SkillGapResponse(BaseModel):
    match_score: int = 0
    missing_skills: List[str] = []
    strong_matches: List[str] = []
    recommendations: List[Recommendation] = []
    leetcode_topics: List[str] = []
    hiring_probability: str = "Unknown"


# ─── /api/interview-questions ───

class InterviewQuestionsRequest(BaseModel):
    company: str = "Google"
    level: str = "Junior"


class InterviewQuestionsResponse(BaseModel):
    questions: List[str]


# ─── /api/interview-feedback ───

class InterviewFeedbackRequest(BaseModel):
    question: str
    answer: str
    company: str = ""


class InterviewFeedbackResponse(BaseModel):
    feedback: str


# ─── /api/cover-letter ───

class CoverLetterRequest(BaseModel):
    company: str
    role: str
    skills: str = ""
    experience: str = ""


class CoverLetterResponse(BaseModel):
    letter: str


# ─── /api/chat ───

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


# ─── /api/jobs ───

class JobItem(BaseModel):
    id: str
    company: str
    role: str
    required_skills: List[str] = []
    location: str = ""
    type: str = ""


class JobsResponse(BaseModel):
    jobs: List[JobItem]