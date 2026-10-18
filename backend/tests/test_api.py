P = "/api/v1"


def test_health(client):
    assert client.get(f"{P}/health").json() == {"status": "ok"}


def test_meta(client):
    d = client.get(f"{P}/meta").json()
    assert d["skill_levels"] == ["beginner", "intermediate", "expert"]
    assert "pytest" in d["test_frameworks"]


def test_bugfix(client):
    r = client.post(f"{P}/bugfix", json={"code": "def total(xs): ...", "skill_level": "beginner"})
    assert r.status_code == 200
    d = r.json()
    assert d["fixed_code"] and d["changes"][0]["line"] == 3


def test_docstrings(client):
    r = client.post(f"{P}/generate/docstrings", json={"code": "def add(a,b): return a+b", "style": "numpy"})
    assert r.status_code == 200 and "documented_code" in r.json()


def test_tests(client):
    r = client.post(f"{P}/generate/tests", json={"code": "def add(a,b): return a+b", "framework": "pytest"})
    d = r.json()
    assert r.status_code == 200 and d["test_cases"] and d["run_instructions"]


def test_cli_safe_and_dangerous(client):
    ok = client.post(f"{P}/cli", json={"query": "find log files"}).json()
    assert ok["risk_level"] == "safe"
    bad = client.post(f"{P}/cli", json={"query": "rm -rf /", "mode": "explain"}).json()
    assert bad["risk_level"] == "dangerous" and bad["warning"]


def test_chat_session_flow(client):
    a = client.post(f"{P}/chat", json={"message": "hi", "code_context": "x = 1"}).json()
    sid = a["session_id"]
    assert a["code_blocks"][0]["language"] == "python"
    client.post(f"{P}/chat", json={"session_id": sid, "message": "again"})
    hist = client.get(f"{P}/chat/{sid}").json()["messages"]
    assert [m["role"] for m in hist] == ["user", "assistant", "user", "assistant"]
    assert client.delete(f"{P}/chat/{sid}").status_code == 204
    assert client.get(f"{P}/chat/{sid}").json()["error"]["code"] == "NOT_FOUND"


def test_chat_stream(client):
    with client.stream("POST", f"{P}/chat/stream", json={"message": "hello"}) as r:
        body = "".join(r.iter_text())
    assert "event: token" in body and "event: done" in body


def test_validation_error_format(client):
    r = client.post(f"{P}/bugfix", json={"code": ""})
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "VALIDATION_ERROR"
