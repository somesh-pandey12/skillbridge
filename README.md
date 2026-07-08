# SkillBridge

> AI-powered career copilot for students and professionals — parses resumes, semantically matches jobs, analyzes skill gaps, runs mock interviews, and drafts cover letters.

![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20Search-000000)
![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Job Matching Pipeline](#job-matching-pipeline)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Rate Limiting](#rate-limiting)
- [Roadmap](#roadmap)

---

## Overview

SkillBridge is a three-service application that helps candidates go from **resume → structured skill profile → matched jobs → gap analysis → interview prep → cover letter**, using an LLM (Groq/Llama 3.3) for language tasks and a vector database (Pinecone) for semantic job matching.

The client never talks to the AI service directly — every request is routed through the Node API, which owns auth, persistence, and rate limiting.

## Architecture

\`\`\`mermaid
flowchart LR
    subgraph Client [React Client]
        UI[Dashboard / Jobs / Interview / Cover Letter]
    end

    subgraph Node [Express API - port 5000]
        Auth[Auth: JWT + Google OAuth]
        ResumeAPI[Resume routes]
        JobsAPI[Jobs routes]
        ChatAPI[Chat and Interview routes]
        RateLimit[express-rate-limit]
    end

    subgraph Mongo [MongoDB]
        UserDB[(Users)]
        ResumeDB[(Resumes)]
        JobDB[(Jobs)]
    end

    subgraph AI [FastAPI AI Service - port 8000]
        ParseRouter[parse-resume and analyze-text]
        MatchRouter[match-jobs and index-jobs]
        SkillGapRouter[skill-gap]
        ChatRouter[chat, interview, cover-letter]
    end

    Groq[(Groq LLM)]
    Pinecone[(Pinecone Vector Index)]

    UI --> Node
    RateLimit -.-> Node
    Auth --> UserDB
    ResumeAPI --> ResumeDB
    JobsAPI --> JobDB

    ResumeAPI --> ParseRouter
    JobsAPI --> MatchRouter
    ResumeAPI --> SkillGapRouter
    ChatAPI --> ChatRouter

    ParseRouter --> Groq
    ParseRouter --> Pinecone
    MatchRouter --> Pinecone
    SkillGapRouter --> Groq
    ChatRouter --> Groq
\`\`\`

**Request flow, in one line:** client → Node (auth + persistence + rate limiting) → FastAPI (Groq for language tasks, Pinecone for semantic search) → back to Node → back to client.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| API Gateway | Node.js, Express 5, Mongoose |
| Auth | JWT, Passport (Google OAuth 2.0) |
| AI Service | FastAPI, Python 3.11+ |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dim) |
| Vector DB | Pinecone (serverless, cosine similarity) |
| Database | MongoDB |
| PDF Parsing | PyMuPDF (`fitz`) |
| Rate Limiting | `express-rate-limit` |

## Features

- 📄 **Resume parsing** — upload a PDF or paste/speak text; Groq extracts structured skills, experience, and education
- 🎯 **Semantic job matching** — candidate skills are embedded and matched against indexed jobs in Pinecone (not keyword matching)
- 📊 **Skill gap analysis** — compares candidate skills against a target role's requirements, returns missing skills, strong matches, and a hiring-probability estimate
- 🎤 **Mock interviews** — company- and level-specific question generation with AI feedback and scoring
- ✍️ **Cover letter generation** — tailored to company, role, skills, and experience
- 💬 **Somu chatbot** — a career-assistant chat companion with conversation history
- 🔒 **Auth** — email/password (JWT) and Google OAuth
- 🛡️ **Tiered rate limiting** — general, auth (brute-force protection), and AI-cost-aware limits

## Job Matching Pipeline

1. **Indexing** — `POST /api/jobs/seed` (Node) inserts jobs into MongoDB, then calls `POST /api/index-jobs` (AI service), which embeds each job's `required_skills` and upserts the vectors into Pinecone with `metadata.type = "job"`.
2. **Resume parsing** — `POST /api/resume/upload` forwards the PDF to the AI service, which extracts and structures the resume via Groq, embeds the candidate's skills, and immediately queries Pinecone (filtered to `type = "job"`) for the closest matches. Results are saved on the `Resume` document as `matchingJobs`.
3. **Live re-matching** — `GET /api/jobs/matched/:resumeId` re-queries the AI service live using the resume's stored skills (falling back to the cached `matchingJobs` if the AI service is unreachable), then hydrates each `jobId` against MongoDB to return full job details with a `matchScore`.

## Project Structure

\`\`\`
skillbridge/
├── ai-service/                 # FastAPI — LLM + vector search
│   ├── main.py
│   ├── models/schemas.py
│   ├── routers/
│   │   ├── matching.py         # skill-gap, interview, cover-letter, job matching
│   │   └── resume.py           # parse-resume, analyze-text
│   └── services/
│       ├── groq_service.py     # Groq LLM calls
│       ├── parser_service.py   # PDF text extraction
│       └── vector_service.py   # Pinecone embed/upsert/query
│
├── server/                     # Express — auth, persistence, gateway
│   └── src/
│       ├── config/              # db, passport
│       ├── controllers/         # auth, job, resume
│       ├── middleware/          # auth, upload, rateLimiter
│       ├── models/              # User, Resume, Job
│       ├── routes/              # auth, resume, jobs, chat
│       └── index.js
│
└── client/                     # React — UI
    └── src/
        ├── pages/                # Dashboard, Jobs, Interview, CoverLetter, ...
        ├── components/
        └── lib/api.js
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB (Atlas or local)
- [Groq API key](https://console.groq.com)
- [Pinecone API key](https://app.pinecone.io) — a `skillbridge-jobs` index (384 dims, cosine) is auto-created on first use

### 1. Clone and install

\`\`\`bash
git clone <repo-url>
cd skillbridge

# AI service
cd ai-service
pip install -e .          # or: uv sync

# Node API
cd ../server
npm install

# Client
cd ../client
npm install
\`\`\`

### 2. Configure environment variables

See [Environment Variables](#environment-variables) below — create `.env` files in `ai-service/`, `server/`, and `client/`.

### 3. Run all three services (separate terminals)

\`\`\`bash
# Terminal 1 — AI service
cd ai-service
uvicorn main:app --reload --port 8000

# Terminal 2 — Node API
cd server
npm run dev

# Terminal 3 — Client
cd client
npm run dev
\`\`\`

### 4. Seed jobs (also indexes them into Pinecone)

\`\`\`bash
curl -X POST http://localhost:5000/api/jobs/seed
\`\`\`

## Environment Variables

**`server/.env`**

\`\`\`env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=some-long-random-string
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
\`\`\`

**`ai-service/.env`**

\`\`\`env
GROQ_API_KEY=...
PINECONE_API_KEY=...
\`\`\`

**`client/.env`**

\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

## API Reference

### Auth (`/api/auth`)

| Method | Route | Description |
|---|---|---|
| POST | `/register` | Email/password signup |
| POST | `/login` | Email/password login |
| GET | `/google` | Start Google OAuth |
| GET | `/me` | Current user (auth required) |

### Resume (`/api/resume`)

| Method | Route | Description |
|---|---|---|
| POST | `/upload` | Upload resume PDF → parsed skills + matching jobs |
| POST | `/analyze-text` | Analyze pasted/voice-transcribed text |
| POST | `/skill-gap` | Compare candidate skills vs. a job's requirements |
| GET | `/` | List current user's resumes |
| GET | `/:id` | Get a single resume |

### Jobs (`/api/jobs`)

| Method | Route | Description |
|---|---|---|
| GET | `/` | List all jobs |
| GET | `/:id` | Get a single job |
| GET | `/matched/:resumeId` | Semantically matched jobs for a resume (Pinecone) |
| POST | `/seed` | Seed sample jobs + index them into Pinecone |

### Chat (`/api/chat`)

| Method | Route | Description |
|---|---|---|
| POST | `/somu` | Career-assistant chatbot |
| POST | `/interview-questions` | Generate mock interview questions |
| POST | `/interview-feedback` | Score and give feedback on an answer |
| POST | `/cover-letter` | Generate a tailored cover letter |

## Rate Limiting

All `/api/*` routes go through a tiered `express-rate-limit` setup (`server/src/middleware/rateLimiter.js`):

| Tier | Scope | Limit |
|---|---|---|
| General | Every `/api/*` request | 300 / 15 min per IP |
| Auth | `/api/auth/login`, `/api/auth/register` | 10 failed attempts / 15 min per IP |
| AI | Resume upload, skill-gap, chat, interview prep, cover letter, job matching | 10 / min per IP |

The AI tier is the strictest because each of those requests triggers a paid Groq and/or Pinecone call — it's the layer most worth protecting from abuse.

## Roadmap

- [ ] `slowapi` rate limiting on the AI service itself (defense in depth, in case it's ever exposed directly)
- [ ] Endpoint to index a single newly-created job outside the bulk `/jobs/seed` flow
- [ ] Automated tests for the matching pipeline
- [ ] Caching layer for repeated skill-gap queries
