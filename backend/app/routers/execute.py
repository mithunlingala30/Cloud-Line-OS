import time
import uuid
from fastapi import APIRouter, HTTPException
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

from app.models.schemas import (
    RunRequest, RunResponse,
    SubmitRequest, SubmitResponse, TestCaseResult,
)
from app.core.executor import execute_code, run_against_testcases
from app.core.firebase import get_db

router = APIRouter(tags=["execution"])


@router.post("/run", response_model=RunResponse)
def run_code(req: RunRequest):
    """Runs code once against custom stdin (like clicking 'Run' on LeetCode
    with a single example) — no test case grading, no DB write."""
    result = execute_code(req.language, req.source_code, stdin_data=req.stdin)
    if result.status == "internal_error":
        raise HTTPException(status_code=500, detail=result.stderr)
    return RunResponse(
        status=result.status,
        stdout=result.stdout,
        stderr=result.stderr,
        exit_code=result.exit_code,
        time_ms=result.time_ms,
        error_line=result.error_line,
    )


@router.post("/submit", response_model=SubmitResponse)
def submit_code(req: SubmitRequest):
    """Runs code against ALL stored test cases for a problem (like clicking
    'Submit' on LeetCode), computes a verdict, and stores the submission
    in Firestore."""
    db = get_db()

    problem_ref = db.collection("problems").document(req.problem_id)
    problem_snap = problem_ref.get()
    if not problem_snap.exists:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem = problem_snap.to_dict()
    testcases = problem.get("testcases", [])
    if not testcases:
        raise HTTPException(status_code=400, detail="Problem has no test cases")

    run_results = run_against_testcases(req.language, req.source_code, testcases)

    tc_results = []
    passed_count = 0
    verdict = "Accepted"
    total_time = 0

    for tc, res in zip(testcases, run_results):
        if res.time_ms:
            total_time += res.time_ms
        if res.passed:
            passed_count += 1
        else:
            if verdict == "Accepted":  # set verdict to first failure type found
                if res.status == "compile_error":
                    verdict = "Compile Error"
                elif res.status == "timeout":
                    verdict = "Time Limit Exceeded"
                elif res.status == "runtime_error":
                    verdict = "Runtime Error"
                else:
                    verdict = "Wrong Answer"

        tc_results.append(TestCaseResult(
            input=tc.get("input", ""),
            expected_output=tc.get("expected_output", ""),
            actual_output=res.stdout,
            passed=bool(res.passed),
            status=res.status,
            time_ms=res.time_ms,
            stderr=res.stderr if res.status != "success" else None,
            error_line=res.error_line if res.status != "success" else None,
        ))

    submission_id = str(uuid.uuid4())
    submission_doc = {
        "problem_id": req.problem_id,
        "user_id": req.user_id,
        "language": req.language,
        "source_code": req.source_code,
        "verdict": verdict,
        "passed_testcases": passed_count,
        "total_testcases": len(testcases),
        "runtime_ms": total_time,
        "created_at": SERVER_TIMESTAMP,
    }
    db.collection("submissions").document(submission_id).set(submission_doc)

    return SubmitResponse(
        submission_id=submission_id,
        problem_id=req.problem_id,
        language=req.language,
        verdict=verdict,
        total_testcases=len(testcases),
        passed_testcases=passed_count,
        results=tc_results,
        runtime_ms=total_time,
    )
