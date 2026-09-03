from pydantic import BaseModel, Field
from typing import List, Optional, Literal


LanguageId = Literal["python", "c", "cpp", "java", "javascript"]


class TestCase(BaseModel):
    input: str = ""
    expected_output: str = ""


class RunRequest(BaseModel):
    language: LanguageId
    source_code: str
    stdin: str = ""


class RunResponse(BaseModel):
    status: str
    stdout: str
    stderr: str
    exit_code: Optional[int] = None
    time_ms: Optional[int] = None
    error_line: Optional[int] = None   # line number where the error occurred (1-indexed)


class SubmitRequest(BaseModel):
    problem_id: str
    language: LanguageId
    source_code: str
    user_id: Optional[str] = None   # Firebase Auth uid, if authenticated


class TestCaseResult(BaseModel):
    input: str
    expected_output: str
    actual_output: str
    passed: bool
    status: str
    time_ms: Optional[int] = None
    stderr: Optional[str] = None
    error_line: Optional[int] = None   # line number where the error occurred (1-indexed)


class SubmitResponse(BaseModel):
    submission_id: str
    problem_id: str
    language: LanguageId
    verdict: str          # "Accepted" | "Wrong Answer" | "Compile Error" | "Runtime Error" | "Time Limit Exceeded"
    total_testcases: int
    passed_testcases: int
    results: List[TestCaseResult]
    runtime_ms: Optional[int] = None


class ProblemCreate(BaseModel):
    title: str
    slug: str
    difficulty: Literal["Easy", "Medium", "Hard"]
    description: str
    starter_code: dict = Field(default_factory=dict)   # {"python": "...", "cpp": "...", ...}
    testcases: List[TestCase] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class Problem(ProblemCreate):
    id: str
