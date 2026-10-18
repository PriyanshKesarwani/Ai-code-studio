"""Single gateway to the LLM. Every endpoint goes through complete() / generate_json() / stream()."""
import json
import re
from typing import AsyncIterator, Type, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from .config import settings
from .errors import AppError

T = TypeVar("T", bound=BaseModel)
GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta"


# ------------------------------------------------------------------ helpers
def extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise


def _http_error(resp: httpx.Response) -> AppError:
    if resp.status_code == 429:
        return AppError("RATE_LIMITED", "LLM rate limit hit, retry in a moment", 429)
    return AppError("LLM_UPSTREAM_ERROR", f"LLM provider returned {resp.status_code}: {resp.text[:200]}", 502)


def _google_url(stream: bool) -> str:
    base = settings.llm_base_url or GOOGLE_BASE
    action = "streamGenerateContent?alt=sse" if stream else "generateContent"
    return f"{base}/models/{settings.llm_model}:{action}"


def _google_payload(system: str, messages: list[dict], temperature: float) -> dict:
    # Gemma on the Gemini API does not accept a separate system instruction,
    # so the system prompt is folded into the first user turn.
    contents = []
    for i, m in enumerate(messages):
        text = f"{system}\n\n---\n\n{m['content']}" if i == 0 and system else m["content"]
        contents.append({"role": "model" if m["role"] == "assistant" else "user",
                         "parts": [{"text": text}]})
    return {"contents": contents, "generationConfig": {"temperature": temperature}}


def _google_text(data: dict) -> str:
    try:
        parts = data["candidates"][0]["content"]["parts"]
        non_thought = [p.get("text", "") for p in parts if not p.get("thought")]
        if non_thought:
            return "".join(non_thought)
        return "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError, TypeError):
        raise AppError("LLM_BAD_OUTPUT", "Model returned an empty or blocked response", 502)


def _openai_url() -> str:
    return (settings.llm_base_url or "https://api.openai.com/v1") + "/chat/completions"


def _openai_payload(system: str, messages: list[dict], temperature: float, stream: bool) -> dict:
    msgs = ([{"role": "system", "content": system}] if system else []) + messages
    return {"model": settings.llm_model, "messages": msgs, "temperature": temperature, "stream": stream}


def _headers() -> dict:
    if settings.llm_provider == "google":
        return {"x-goog-api-key": settings.llm_api_key, "Content-Type": "application/json"}
    return {"Authorization": f"Bearer {settings.llm_api_key}", "Content-Type": "application/json"}


# ------------------------------------------------------------------ core calls
async def complete(system: str, messages: list[dict], temperature: float | None = None) -> str:
    temp = settings.llm_temperature if temperature is None else temperature
    provider = settings.llm_provider
    if provider == "mock":
        from . import mock
        return mock.reply(system, messages)

    if provider == "google":
        url, payload = _google_url(False), _google_payload(system, messages, temp)
    elif provider == "openai":
        url, payload = _openai_url(), _openai_payload(system, messages, temp, False)
    else:
        raise AppError("INTERNAL_ERROR", f"Unknown LLM_PROVIDER '{provider}'", 500)

    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            resp = await client.post(url, headers=_headers(), json=payload)
    except httpx.TimeoutException:
        raise AppError("LLM_TIMEOUT", "Model took too long to respond", 504)
    except httpx.HTTPError as e:
        raise AppError("LLM_UPSTREAM_ERROR", f"Could not reach LLM provider: {e}", 502)

    if resp.status_code != 200:
        raise _http_error(resp)
    data = resp.json()
    if provider == "google":
        return _google_text(data)
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise AppError("LLM_BAD_OUTPUT", "Unexpected response shape from provider", 502)


async def generate_json(system: str, user: str, model: Type[T]) -> T:
    """Prompt for JSON, validate with Pydantic, retry once on failure."""
    schema = json.dumps(model.model_json_schema(), indent=1)
    system_full = (f"{system}\n\nRespond with ONLY a single valid JSON object matching this JSON Schema. "
                   f"No markdown fences, no commentary.\n{schema}")
    messages = [{"role": "user", "content": user}]
    if settings.llm_provider == "mock":
        messages[0]["content"] = f"[[SCHEMA:{model.__name__}]]\n{user}"

    last_err = ""
    for attempt in range(2):
        raw = await complete(system_full, messages, temperature=0.1)
        try:
            return model.model_validate(extract_json(raw))
        except (json.JSONDecodeError, ValidationError) as e:
            last_err = str(e)[:300]
            messages = [
                messages[0],
                {"role": "assistant", "content": raw},
                {"role": "user", "content": f"That was not valid. Error: {last_err}\n"
                                            "Return ONLY the corrected JSON object."},
            ]
    raise AppError("LLM_BAD_OUTPUT", "Model returned malformed output twice", 502)


async def stream(system: str, messages: list[dict]) -> AsyncIterator[str]:
    provider = settings.llm_provider
    if provider == "mock":
        from . import mock
        for word in mock.reply(system, messages).split(" "):
            yield word + " "
        return

    temp = settings.llm_temperature
    if provider == "google":
        url, payload = _google_url(True), _google_payload(system, messages, temp)
    else:
        url, payload = _openai_url(), _openai_payload(system, messages, temp, True)

    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            async with client.stream("POST", url, headers=_headers(), json=payload) as resp:
                if resp.status_code != 200:
                    await resp.aread()
                    raise _http_error(resp)
                async for line in resp.aiter_lines():
                    if not line.startswith("data:"):
                        continue
                    chunk = line[5:].strip()
                    if chunk in ("", "[DONE]"):
                        continue
                    data = json.loads(chunk)
                    if provider == "google":
                        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                        yield "".join(p.get("text", "") for p in parts if not p.get("thought"))
                    else:
                        yield data["choices"][0].get("delta", {}).get("content") or ""
    except httpx.TimeoutException:
        raise AppError("LLM_TIMEOUT", "Model took too long to respond", 504)
    except httpx.HTTPError as e:
        raise AppError("LLM_UPSTREAM_ERROR", f"Could not reach LLM provider: {e}", 502)
