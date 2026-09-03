import uuid
from fastapi import APIRouter, HTTPException
from typing import List

from app.models.schemas import Problem, ProblemCreate
from app.core.firebase import get_db

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("/", response_model=List[Problem])
def list_problems():
    db = get_db()
    docs = db.collection("problems").stream()
    out = []
    for d in docs:
        data = d.to_dict()
        data["id"] = d.id
        out.append(data)
    return out


@router.get("/{problem_id}", response_model=Problem)
def get_problem(problem_id: str):
    db = get_db()
    doc = db.collection("problems").document(problem_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Problem not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data


@router.post("/", response_model=Problem)
def create_problem(problem: ProblemCreate):
    db = get_db()
    problem_id = str(uuid.uuid4())
    db.collection("problems").document(problem_id).set(problem.model_dump())
    return Problem(id=problem_id, **problem.model_dump())


@router.delete("/{problem_id}")
def delete_problem(problem_id: str):
    db = get_db()
    ref = db.collection("problems").document(problem_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Problem not found")
    ref.delete()
    return {"deleted": problem_id}
