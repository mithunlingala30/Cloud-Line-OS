from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import execute, problems

app = FastAPI(
    title="LeetCode Clone Compiler API",
    description="Executes Python/C/C++/Java code and grades it against test cases stored in Firebase.",
    version="1.0.0",
)

# Allow your frontend (React/Vite/Next dev server, etc.) to call this API.
# Tighten this to your real frontend domain(s) before going to production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(execute.router)
app.include_router(problems.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "LeetCode compiler backend is running"}


@app.get("/languages")
def supported_languages():
    from app.core.languages import LANGUAGES
    return {
        lang_id: cfg.display_name
        for lang_id, cfg in LANGUAGES.items()
    }
