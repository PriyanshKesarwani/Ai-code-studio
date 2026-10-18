from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

from .config import settings

CODE_MAX = settings.max_code_chars


class SkillLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    expert = "expert"


class DocStyle(str, Enum):
    google = "google"
    numpy = "numpy"
    sphinx = "sphinx"


class TestFramework(str, Enum):
    pytest = "pytest"
    unittest = "unittest"
    jest = "jest"


class OSName(str, Enum):
    linux = "linux"
    macos = "macos"
    windows = "windows"


class Shell(str, Enum):
    bash = "bash"
    zsh = "zsh"
    powershell = "powershell"
    cmd = "cmd"


class CliMode(str, Enum):
    generate = "generate"
    explain = "explain"


class RiskLevel(str, Enum):
    safe = "safe"
    caution = "caution"
    dangerous = "dangerous"


class Common(BaseModel):
    skill_level: SkillLevel = SkillLevel.intermediate
    language: str = Field("python", max_length=30)


# ---------- bugfix ----------
class ContextFile(BaseModel):
    filename: str = Field(max_length=200)
    content: str = Field(max_length=CODE_MAX)


class BugfixRequest(Common):
    code: str = Field(min_length=1, max_length=CODE_MAX)
    error_message: Optional[str] = Field(None, max_length=8000)
    description: Optional[str] = Field(None, max_length=4000)
    context_files: list[ContextFile] = Field(default_factory=list, max_length=5)


class Change(BaseModel):
    line: Optional[int] = None
    before: str = ""
    after: str = ""
    reason: str = ""


class BugfixResponse(BaseModel):
    root_cause: str
    explanation: str
    fixed_code: str
    changes: list[Change] = Field(default_factory=list)
    prevention_tips: list[str] = Field(default_factory=list)


# ---------- docstrings ----------
class DocstringRequest(Common):
    code: str = Field(min_length=1, max_length=CODE_MAX)
    style: DocStyle = DocStyle.google


class DocstringItem(BaseModel):
    target: str
    docstring: str


class DocstringResponse(BaseModel):
    documented_code: str
    docstrings: list[DocstringItem] = Field(default_factory=list)


# ---------- tests ----------
class TestGenRequest(Common):
    code: str = Field(min_length=1, max_length=CODE_MAX)
    framework: TestFramework = TestFramework.pytest
    include_edge_cases: bool = True


class TestCase(BaseModel):
    name: str
    description: str = ""
    category: str = "happy_path"  # happy_path | edge_case | error_handling


class TestGenResponse(BaseModel):
    test_code: str
    test_cases: list[TestCase] = Field(default_factory=list)
    run_instructions: str = ""


# ---------- cli ----------
class CliRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)
    mode: CliMode = CliMode.generate
    os: OSName = OSName.linux
    shell: Shell = Shell.bash
    skill_level: SkillLevel = SkillLevel.intermediate


class BreakdownItem(BaseModel):
    part: str
    meaning: str


class CliResponse(BaseModel):
    command: str
    explanation: str
    breakdown: list[BreakdownItem] = Field(default_factory=list)
    risk_level: RiskLevel = RiskLevel.safe
    warning: Optional[str] = None
    alternatives: list[str] = Field(default_factory=list)


# ---------- chat ----------
class ChatRequest(Common):
    session_id: Optional[str] = None
    message: str = Field(min_length=1, max_length=8000)
    code_context: Optional[str] = Field(None, max_length=CODE_MAX)


class CodeBlock(BaseModel):
    language: str = ""
    code: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    code_blocks: list[CodeBlock] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatHistory(BaseModel):
    session_id: str
    messages: list[ChatMessage]
# ---------- errors (documented in OpenAPI so the frontend can type them) ----------
class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody