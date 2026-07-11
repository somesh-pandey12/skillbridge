from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, matching

app = FastAPI(title="SkillBridge AI Service", version="1.0.0")

allowed_origin = os.getenv("SERVER_ORIGIN", "http://localhost:5000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(matching.router, prefix="/api", tags=["Matching"])

@app.get("/health")
def health(): return {"status": "ok"}