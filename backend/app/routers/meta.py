from fastapi import APIRouter

from ..schemas import SkillLevel, DocStyle, TestFramework, OSName, Shell

router = APIRouter()


@router.get("/health", tags=["meta"])
async def health():
    return {"status": "ok"}


@router.get("/meta", tags=["meta"])
async def meta():
    return {
        "skill_levels": [e.value for e in SkillLevel],
        "languages": ["python", "javascript", "typescript", "java", "c", "cpp", "go", "rust", "bash"],
        "docstring_styles": [e.value for e in DocStyle],
        "test_frameworks": [e.value for e in TestFramework],
        "operating_systems": [e.value for e in OSName],
        "shells": [e.value for e in Shell],
        "cli_modes": ["generate", "explain"],
    }
