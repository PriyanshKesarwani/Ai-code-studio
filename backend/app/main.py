from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .config import settings
from .errors import register_error_handlers
from .schemas import ErrorResponse
from .routers import meta, code_tools, chat

app = FastAPI(
    title="CodePilot API",
    version="1.0.0",
    description="AI coding assistant backend: bug fixer, docstrings, tests, CLI helper, chat.",
    responses={c: {"model": ErrorResponse, "description": "Error"} for c in (404, 422, 429, 502, 504)},
)

app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list,
                   allow_methods=["*"], allow_headers=["*"])
register_error_handlers(app)

for r in (meta.router, code_tools.router, chat.router):
    app.include_router(r, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse("/docs")