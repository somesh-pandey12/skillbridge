import os
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
model = SentenceTransformer('all-MiniLM-L6-v2')

INDEX_NAME = "skillbridge-jobs"


def get_index():
    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    return pc.Index(INDEX_NAME)


def embed_text(text: str) -> list:
    return model.encode(text).tolist()


# ─── Resume vectors ───

def upsert_resume(resume_id: str, skills_text: str):
    index = get_index()
    vector = embed_text(skills_text)
    index.upsert(vectors=[{
        "id": f"resume_{resume_id}",
        "values": vector,
        "metadata": {"type": "resume", "resumeId": resume_id}
    }])


# ─── Job vectors (NEW — this is what was missing) ───

def upsert_job(job_id: str, skills_text: str, metadata: dict | None = None) -> str:
    """
    Embeds a job's skills text and upserts it into Pinecone with type="job"
    so it becomes discoverable by find_matching_jobs().
    Returns the Pinecone vector id used.
    """
    if not skills_text.strip():
        raise ValueError("skills_text is empty — nothing to embed for this job")

    index = get_index()
    vector = embed_text(skills_text)
    vector_id = f"job_{job_id}"

    meta = {"type": "job", "jobId": job_id}
    if metadata:
        meta.update(metadata)

    index.upsert(vectors=[{
        "id": vector_id,
        "values": vector,
        "metadata": meta
    }])
    return vector_id


def upsert_jobs_bulk(jobs: list) -> int:
    """
    jobs: list of dicts like {"jobId": str, "skills_text": str, "metadata": dict}
    Batches the upsert in groups of 100 (Pinecone's recommended batch size).
    """
    index = get_index()
    vectors = []
    for job in jobs:
        skills_text = job.get("skills_text", "").strip()
        if not skills_text:
            continue
        meta = {"type": "job", "jobId": job["jobId"]}
        meta.update(job.get("metadata", {}))
        vectors.append({
            "id": f"job_{job['jobId']}",
            "values": embed_text(skills_text),
            "metadata": meta
        })

    for i in range(0, len(vectors), 100):
        batch = vectors[i:i + 100]
        if batch:
            index.upsert(vectors=batch)

    return len(vectors)


def delete_job(job_id: str):
    index = get_index()
    index.delete(ids=[f"job_{job_id}"])

def find_matching_jobs(skills_text: str, top_k: int = 5) -> list:
    index = get_index()
    query_vector = embed_text(skills_text)
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        filter={"type": "job"},
        include_metadata=True
    )
    return results.matches