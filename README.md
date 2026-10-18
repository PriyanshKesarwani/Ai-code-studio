# CodePilot: AI Coding Assistant (Backend)

A FastAPI backend powered by **Gemma 4** that helps developers fix bugs, document and test code, work in the terminal, and chat about programming. Every response adapts to the user's **skill level**, so beginners get simple, standard-library solutions and experts get idiomatic, trade-off-aware ones.

## Features

| Feature | Endpoint | What it does |
|---|---|---|
| Bug Fixer & Explainer | `POST /api/v1/bugfix` | Finds the root cause, returns fixed code, a line-by-line change list and prevention tips |
| Docstring Generator | `POST /api/v1/generate/docstrings` | Adds Google / NumPy / Sphinx docstrings without changing logic |
| Test Generator | `POST /api/v1/generate/tests` | Writes pytest / unittest / jest tests, with optional edge cases |
| Terminal / CLI Assistant | `POST /api/v1/cli` | Natural language to shell command, or explains a command, with a risk level (`safe` / `caution` / `dangerous`) |
| AI Chatbot | `POST /api/v1/chat` | Multi-turn coding chat with session memory (full response) |
| Streaming Chat | `POST /api/v1/chat/stream` | Same as chat, streamed token by token over SSE |
| Skill Levels | all AI endpoints | `beginner`, `intermediate` or `expert` changes the depth and style of every answer |

Helper endpoints: `GET /api/v1/health`, `GET /api/v1/meta` (dropdown options for the UI), `GET /api/v1/chat/{session_id}` (history), `DELETE /api/v1/chat/{session_id}` (clear).

## Tech Stack
- **Python 3.12+**, **FastAPI**, **Pydantic v2**
- **httpx** for async calls to the model
- **Gemma 4** via the Gemini API (Google AI Studio)
- **pytest** for tests, **Docker**-ready

## Project Structure
```
backend/
├── app/
│   ├── main.py          # App setup, CORS, router registration
│   ├── config.py        # Settings loaded from .env
│   ├── schemas.py       # All request/response models (the API contract)
│   ├── prompts.py       # Skill-level rules and per-feature prompts
│   ├── llm.py           # The single gateway to the model (retries, JSON validation, streaming)
│   ├── mock.py          # Canned responses for running without an API key
│   ├── sessions.py      # In-memory chat history
│   ├── errors.py        # Unified error format
│   └── routers/
│       ├── meta.py      # /health, /meta
│       ├── code_tools.py# /bugfix, /generate/*, /cli
│       └── chat.py      # /chat, /chat/stream, history
├── tests/               # Endpoint tests (run against the mock LLM)
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── Procfile
└── .env.example
```

## Getting Started

### 1. Install
```bash
git clone <your-repo-url>
cd <repo>/backend

python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install -r requirements-dev.txt
```

### 2. Configure
```bash
cp .env.example .env        # Windows: copy .env.example .env
```
Edit `.env`:

| Variable | Description | Default |
|---|---|---|
| `LLM_PROVIDER` | `google` (Gemma via Gemini API), `openai` (any OpenAI-compatible server) or `mock` (no API calls) | `mock` |
| `LLM_API_KEY` | Your API key from [Google AI Studio](https://aistudio.google.com/apikey) | none |
| `LLM_MODEL` | Model id, e.g. `gemma-4-26b-a4b-it` | `gemma-4` |
| `LLM_BASE_URL` | Optional custom API
