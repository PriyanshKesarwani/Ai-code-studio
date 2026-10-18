"""Canned responses so the API runs end-to-end with no API key (LLM_PROVIDER=mock)."""
import json
import re

FIXTURES = {
    "BugfixResponse": {
        "root_cause": "Off-by-one error: range() stops before the last index.",
        "explanation": "[mock] The loop skips the final element because range(len(x) - 1) excludes it.",
        "fixed_code": "def total(xs):\n    s = 0\n    for i in range(len(xs)):\n        s += xs[i]\n    return s\n",
        "changes": [{"line": 3, "before": "for i in range(len(xs) - 1):",
                     "after": "for i in range(len(xs)):", "reason": "Include the last element"}],
        "prevention_tips": ["Iterate directly over the list: `for x in xs`", "Add a test with 1 element"],
    },
    "DocstringResponse": {
        "documented_code": 'def add(a, b):\n    """Add two numbers.\n\n    Args:\n        a: First number.\n        b: Second number.\n\n    Returns:\n        The sum of a and b.\n    """\n    return a + b\n',
        "docstrings": [{"target": "add", "docstring": "Add two numbers."}],
    },
    "TestGenResponse": {
        "test_code": "from solution import add\n\n\ndef test_add_basic():\n    assert add(1, 2) == 3\n\n\ndef test_add_negative():\n    assert add(-1, 1) == 0\n",
        "test_cases": [
            {"name": "test_add_basic", "description": "Adds two positives", "category": "happy_path"},
            {"name": "test_add_negative", "description": "Handles negatives", "category": "edge_case"},
        ],
        "run_instructions": "pytest test_solution.py",
    },
    "CliResponse": {
        "command": "find . -name '*.log' -type f",
        "explanation": "[mock] Lists every .log file under the current directory.",
        "breakdown": [{"part": "find .", "meaning": "Search from the current directory"},
                      {"part": "-name '*.log'", "meaning": "Match files ending in .log"},
                      {"part": "-type f", "meaning": "Only regular files"}],
        "risk_level": "safe",
        "warning": None,
        "alternatives": ["ls **/*.log"],
    },
}


def reply(system: str, messages: list[dict]) -> str:
    last = messages[-1]["content"]
    m = re.match(r"\[\[SCHEMA:(\w+)\]\]", last)
    if m and m.group(1) in FIXTURES:
        data = dict(FIXTURES[m.group(1)])
        # let tests exercise the risk banner
        if m.group(1) == "CliResponse" and "rm -rf" in last:
            data.update(command="rm -rf /", risk_level="dangerous", warning="Deletes everything. Do not run.")
        return json.dumps(data)
    snippet = last.strip().splitlines()[0][:80] if last.strip() else ""
    return (f"[mock reply] You asked: \"{snippet}\"\n\n```python\nprint('hello from mock')\n```\n")
