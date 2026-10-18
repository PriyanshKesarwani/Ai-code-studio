from .schemas import (BugfixRequest, DocstringRequest, TestGenRequest, CliRequest,
                      ChatRequest, SkillLevel)

LEVEL_RULES = {
    SkillLevel.beginner: (
        "The user is a BEGINNER. Use only the standard library unless a third-party "
        "package is truly unavoidable. Prefer simple, readable patterns over clever ones. "
        "Explain any jargon in plain words, use friendly step-by-step explanations, and "
        "comment the code generously."
    ),
    SkillLevel.intermediate: (
        "The user is INTERMEDIATE. Common, well-known libraries are fine. Keep "
        "explanations brief and practical."
    ),
    SkillLevel.expert: (
        "The user is an EXPERT. Idiomatic or advanced solutions are welcome. Be terse, "
        "skip basics, and mention trade-offs and edge cases where relevant."
    ),
}

BASE = "You are CodePilot, an expert AI coding assistant. {level}\n"


def _sys(level: SkillLevel, extra: str) -> str:
    return BASE.format(level=LEVEL_RULES[level]) + extra


def bugfix(r: BugfixRequest) -> tuple[str, str]:
    system = _sys(r.skill_level, f"Task: find and fix the bug in the user's {r.language} code and explain it.")
    parts = [f"Language: {r.language}", f"Code:\n```\n{r.code}\n```"]
    if r.error_message:
        parts.append(f"Error message / stack trace:\n{r.error_message}")
    if r.description:
        parts.append(f"Expected behaviour:\n{r.description}")
    for f in r.context_files:
        parts.append(f"Related file `{f.filename}`:\n```\n{f.content}\n```")
    parts.append("In `changes`, list each edited line with its line number, before, after and reason. "
                 "`fixed_code` must be the complete corrected code.")
    return system, "\n\n".join(parts)


def docstrings(r: DocstringRequest) -> tuple[str, str]:
    system = _sys(r.skill_level, f"Task: add {r.style.value}-style docstrings/doc comments to every "
                  "function, class and method. Do NOT change any logic.")
    return system, f"Language: {r.language}\n\nCode:\n```\n{r.code}\n```"


def tests(r: TestGenRequest) -> tuple[str, str]:
    edge = "Include edge cases (empty, None/null, boundaries, invalid input)." if r.include_edge_cases \
        else "Focus on the main happy paths only."
    system = _sys(r.skill_level, f"Task: write {r.framework.value} tests for the user's {r.language} code. {edge}")
    return system, (f"Code under test:\n```\n{r.code}\n```\n\n"
                    "`category` must be one of: happy_path, edge_case, error_handling. "
                    "`run_instructions` is the shell command to run the tests.")


def cli(r: CliRequest) -> tuple[str, str]:
    if r.mode.value == "generate":
        task = "Turn the user's request into ONE shell command."
    else:
        task = "Explain the shell command the user gives you. Put it unchanged in `command`."
    system = _sys(r.skill_level, f"Task: {task} Target: {r.os.value}, shell: {r.shell.value}. "
                  "Set risk_level to 'dangerous' for destructive or irreversible commands "
                  "(rm -rf, format, dd, chmod -R 777 /, DROP TABLE...), 'caution' for commands that "
                  "modify or delete data or need sudo, otherwise 'safe'. Give a `warning` when not safe.")
    return system, f"Request: {r.query}"


def chat_system(r: ChatRequest) -> str:
    return _sys(r.skill_level, f"You are chatting about programming (default language: {r.language}). "
                "Reply in Markdown and put code in fenced code blocks.")


def chat_user_message(r: ChatRequest) -> str:
    if r.code_context:
        return f"{r.message}\n\nCode context:\n```{r.language}\n{r.code_context}\n```"
    return r.message
