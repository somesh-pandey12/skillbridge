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

def upsert_resume(resume_id: str, skills_text: str):
    index = get_index()
    vector = embed_text(skills_text)
    index.upsert(vectors=[{"id": resume_id, "values": vector, "metadata": {"type": "resume"}}])

def find_matching_jobs(skills_text: str, top_k: int = 5) -> list:
    index = get_index()
    query_vector = embed_text(skills_text)
    results = index.query(vector=query_vector, top_k=top_k, filter={"type": "job"}, include_metadata=True)
    return results.matches