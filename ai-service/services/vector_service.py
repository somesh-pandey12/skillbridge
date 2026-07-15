import os
from pinecone import Pinecone, ServerlessSpec

VECTOR_MATCHING_ENABLED = os.getenv("ENABLE_VECTOR_MATCHING", "false").lower() == "true"

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY")) if VECTOR_MATCHING_ENABLED else None

INDEX_NAME = "skillbridge-jobs"

_model = None


def get_model():
    if not VECTOR_MATCHING_ENABLED:
        raise RuntimeError("Vector matching is disabled on this deployment (free tier memory limit).")
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model


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
    return get_model().encode(text).tolist()


def upsert_resume(resume_id: str, skills_text: str):
    if not VECTOR_MATCHING_ENABLED:
        return None
    index = get_index()
    vector = embed_text(skills_text)
    vector_id = f"resume_{resume_id}"
    index.upsert(vectors=[{
        "id": vector_id,
        "values": vector,
        "metadata": {"type": "resume", "resumeId": resume_id}
    }])
    return vector_id


def upsert_job(job_id: str, skills_text: str, metadata: dict | None = None):
    if not VECTOR_MATCHING_ENABLED:
        raise RuntimeError("Vector matching is disabled on this deployment.")
    index = get_index()
    vector = embed_text(skills_text)
    vector_id = f"job_{job_id}"
    meta = {"type": "job", "jobId": job_id}
    if metadata:
        meta.update(metadata)
    index.upsert(vectors=[{"id": vector_id, "values": vector, "metadata": meta}])
    return vector_id


def upsert_jobs_bulk(payload: list) -> int:
    if not VECTOR_MATCHING_ENABLED:
        raise RuntimeError("Vector matching is disabled on this deployment.")
    index = get_index()
    vectors = []
    for job in payload:
        vector = embed_text(job["skills_text"])
        meta = {"type": "job", "jobId": job["jobId"]}
        if job.get("metadata"):
            meta.update(job["metadata"])
        vectors.append({"id": f"job_{job['jobId']}", "values": vector, "metadata": meta})

    if not vectors:
        return 0

    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors=vectors[i:i + batch_size])
    return len(vectors)


def find_matching_jobs(skills_text: str, top_k: int = 5) -> list:
    if not VECTOR_MATCHING_ENABLED:
        return []
    index = get_index()
    query_vector = embed_text(skills_text)
    results = index.query(vector=query_vector, top_k=top_k, filter={"type": "job"}, include_metadata=True)
    return results.matches