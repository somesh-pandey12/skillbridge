SkillBridge


AI-powered career copilot for students and professionals — parses resumes, semantically matches jobs, analyzes skill gaps, runs mock interviews, and drafts cover letters.



Show Image
Show Image
Show Image
Show Image
Show Image
Show Image

Overview

SkillBridge is a three-service application that helps candidates go from resume → structured skill profile → matched jobs → gap analysis → interview prep → cover letter, using an LLM (Groq/Llama 3.3) for language tasks and a vector database (Pinecone) for semantic job matching.

The client never talks to the AI service directly — every request is routed through the Node API, which owns auth, persistence, and rate limiting.

Architecture

#mermaid-r22k-r2 { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; fill: rgb(229, 229, 229); }
#mermaid-r22k-r2 .edge-animation-slow { stroke-dashoffset: 900; animation: 50s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r22k-r2 .edge-animation-fast { stroke-dashoffset: 900; animation: 20s linear 0s infinite normal none running dash; stroke-linecap: round; stroke-dasharray: 9, 5 !important; }
#mermaid-r22k-r2 .error-icon { fill: rgb(204, 120, 92); }
#mermaid-r22k-r2 .error-text { fill: rgb(51, 135, 163); stroke: rgb(51, 135, 163); }
#mermaid-r22k-r2 .edge-thickness-normal { stroke-width: 1px; }
#mermaid-r22k-r2 .edge-thickness-thick { stroke-width: 3.5px; }
#mermaid-r22k-r2 .edge-pattern-solid { stroke-dasharray: 0; }
#mermaid-r22k-r2 .edge-thickness-invisible { stroke-width: 0; fill: none; }
#mermaid-r22k-r2 .edge-pattern-dashed { stroke-dasharray: 3; }
#mermaid-r22k-r2 .edge-pattern-dotted { stroke-dasharray: 2; }
#mermaid-r22k-r2 .marker { fill: rgb(161, 161, 161); stroke: rgb(161, 161, 161); }
#mermaid-r22k-r2 .marker.cross { stroke: rgb(161, 161, 161); }
#mermaid-r22k-r2 svg { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 16px; }
#mermaid-r22k-r2 p { margin: 0px; }
#mermaid-r22k-r2 .label { font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: rgb(229, 229, 229); }
#mermaid-r22k-r2 .cluster-label text { fill: rgb(51, 135, 163); }
#mermaid-r22k-r2 .cluster-label span { color: rgb(51, 135, 163); }
#mermaid-r22k-r2 .cluster-label span p { background-color: transparent; }
#mermaid-r22k-r2 .label text, #mermaid-r22k-r2 span { fill: rgb(229, 229, 229); color: rgb(229, 229, 229); }
#mermaid-r22k-r2 .node rect, #mermaid-r22k-r2 .node circle, #mermaid-r22k-r2 .node ellipse, #mermaid-r22k-r2 .node polygon, #mermaid-r22k-r2 .node path { fill: transparent; stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r22k-r2 .rough-node .label text, #mermaid-r22k-r2 .node .label text, #mermaid-r22k-r2 .image-shape .label, #mermaid-r22k-r2 .icon-shape .label { text-anchor: middle; }
#mermaid-r22k-r2 .node .katex path { fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0); stroke-width: 1px; }
#mermaid-r22k-r2 .rough-node .label, #mermaid-r22k-r2 .node .label, #mermaid-r22k-r2 .image-shape .label, #mermaid-r22k-r2 .icon-shape .label { text-align: center; }
#mermaid-r22k-r2 .node.clickable { cursor: pointer; }
#mermaid-r22k-r2 .root .anchor path { stroke-width: 0; stroke: rgb(161, 161, 161); fill: rgb(161, 161, 161) !important; }
#mermaid-r22k-r2 .arrowheadPath { fill: rgb(11, 11, 11); }
#mermaid-r22k-r2 .edgePath .path { stroke: rgb(161, 161, 161); stroke-width: 1px; }
#mermaid-r22k-r2 .flowchart-link { stroke: rgb(161, 161, 161); fill: none; }
#mermaid-r22k-r2 .edgeLabel { background-color: transparent; text-align: center; }
#mermaid-r22k-r2 .edgeLabel p { background-color: transparent; }
#mermaid-r22k-r2 .edgeLabel rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r22k-r2 .labelBkg { background-color: rgba(0, 0, 0, 0.5); }
#mermaid-r22k-r2 .cluster rect { fill: rgb(204, 120, 92); stroke: rgb(138, 115, 107); stroke-width: 1px; }
#mermaid-r22k-r2 .cluster text { fill: rgb(51, 135, 163); }
#mermaid-r22k-r2 .cluster span { color: rgb(51, 135, 163); }
#mermaid-r22k-r2 div.mermaidTooltip { position: absolute; text-align: center; max-width: 200px; padding: 2px; font-family: "Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 12px; background: rgb(204, 120, 92); border: 1px solid rgb(138, 115, 107); border-radius: 2px; pointer-events: none; z-index: 100; }
#mermaid-r22k-r2 .flowchartTitleText { text-anchor: middle; font-size: 18px; fill: rgb(229, 229, 229); }
#mermaid-r22k-r2 rect.text { fill: none; stroke-width: 0; }
#mermaid-r22k-r2 .icon-shape, #mermaid-r22k-r2 .image-shape { background-color: transparent; text-align: center; }
#mermaid-r22k-r2 .icon-shape p, #mermaid-r22k-r2 .image-shape p { background-color: transparent; padding: 2px; }
#mermaid-r22k-r2 .icon-shape .label rect, #mermaid-r22k-r2 .image-shape .label rect { opacity: 0.5; background-color: transparent; fill: transparent; }
#mermaid-r22k-r2 .label-icon { display: inline-block; height: 1em; overflow: visible; vertical-align: -0.125em; }
#mermaid-r22k-r2 .node .label-icon path { fill: currentcolor; stroke: revert; stroke-width: revert; }
#mermaid-r22k-r2 .node .neo-node { stroke: rgb(161, 161, 161); }
#mermaid-r22k-r2 [data-look="neo"].node rect, #mermaid-r22k-r2 [data-look="neo"].cluster rect, #mermaid-r22k-r2 [data-look="neo"].node polygon { stroke: url("#mermaid-r22k-r2-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r22k-r2 [data-look="neo"].node path { stroke: url("#mermaid-r22k-r2-gradient"); stroke-width: 1px; }
#mermaid-r22k-r2 [data-look="neo"].node .outer-path { filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r22k-r2 [data-look="neo"].node .neo-line path { stroke: rgb(161, 161, 161); filter: none; }
#mermaid-r22k-r2 [data-look="neo"].node circle { stroke: url("#mermaid-r22k-r2-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r22k-r2 [data-look="neo"].node circle .state-start { fill: rgb(0, 0, 0); }
#mermaid-r22k-r2 [data-look="neo"].icon-shape .icon { fill: url("#mermaid-r22k-r2-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r22k-r2 [data-look="neo"].icon-shape .icon-neo path { stroke: url("#mermaid-r22k-r2-gradient"); filter: drop-shadow(rgb(185, 185, 185) 1px 2px 2px); }
#mermaid-r22k-r2 :root { --mermaid-font-family: "Anthropic Sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; }AI Service — FastAPI :8000MongoDBNode API — Express :5000Client — React + Vitemultipart PDFseed / reindexget matchesembed + upsertembed + queryHTTPS + JWTguardsDashboard / Jobs /Interview / Cover LetterAuthJWT + Google OAuthResume routesJobs routesChat / Interview routesexpress-rate-limitUsersResumesJobs/parse-resume/analyze-text/match-jobs/index-job(s)/skill-gap/chat/interview-*/cover-letterGroq LLMLlama 3.3 70BPineconevector index

Request flow, in one line: client → Node (auth + persistence + rate limiting) → FastAPI (Groq for language tasks, Pinecone for semantic search) → back to Node → back to client.

Tech Stack

LayerTechnologyFrontendReact 18, Vite, Tailwind CSSAPI GatewayNode.js, Express 5, MongooseAuthJWT, Passport (Google OAuth 2.0)AI ServiceFastAPI, Python 3.11+LLMGroq — llama-3.3-70b-versatileEmbeddingssentence-transformers (all-MiniLM-L6-v2, 384-dim)Vector DBPinecone (serverless, cosine similarity)DatabaseMongoDBPDF ParsingPyMuPDF (fitz)Rate Limitingexpress-rate-limit

Features


📄 Resume parsing — upload a PDF or paste/speak text; Groq extracts structured skills, experience, and education
🎯 Semantic job matching — candidate skills are embedded and matched against indexed jobs in Pinecone (not keyword matching)
📊 Skill gap analysis — compares candidate skills against a target role's requirements, returns missing skills, strong matches, and a hiring-probability estimate
🎤 Mock interviews — company- and level-specific question generation with AI feedback and scoring
✍️ Cover letter generation — tailored to company, role, skills, and experience
💬 Somu chatbot — a career-assistant chat companion with conversation history
🔒 Auth — email/password (JWT) and Google OAuth
🛡️ Tiered rate limiting — general, auth (brute-force protection), and AI-cost-aware limits

Project Structure

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

        Getting Started

Prerequisites


Node.js 18+
Python 3.11+
MongoDB (Atlas or local)
Groq API key
Pinecone API key — a skillbridge-jobs index (384 dims, cosine) is auto-created on first use

Environment Variables

server/.env

envPORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=some-long-random-string
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

ai-service/.env

envGROQ_API_KEY=...
PINECONE_API_KEY=...

client/.env

envVITE_API_URL=http://localhost:5000/api


Rate Limiting

All /api/* routes go through a tiered express-rate-limit setup (server/src/middleware/rateLimiter.js):

TierScopeLimitGeneralEvery /api/* request300 / 15 min per IPAuth/api/auth/login, /api/auth/register10 failed attempts / 15 min per IPAIResume upload, skill-gap, chat, interview prep, cover letter, job matching10 / min per IP

The AI tier is the strictest because each of those requests triggers a paid Groq and/or Pinecone call — it's the layer most worth protecting from abuse.
