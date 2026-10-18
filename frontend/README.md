# DevStudio AI: frontend

React 18 + Vite + Tailwind CSS client for the DevStudio FastAPI backend (API contract v1).

## Run it

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL if the API isn't on localhost:8000
npm run dev               # http://localhost:5173
npm run build             # production build in dist/
```

The backend needs CORS enabled for `http://localhost:5173`:

```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])
```

## What's new

- **Fullscreen editor.** The Fullscreen button in the editor header (Esc exits). Run output stays visible in a resizable strip underneath.
- **Everything resizes.** Drag the divider between assistant and editor, editor and dock, and message list and composer. Double-click a divider to reset it, or focus it and use the arrow keys. Sizes are remembered. On narrow screens the layout stacks.
- Line numbers, Tab indents, Ctrl/Cmd+Enter runs.

## Endpoint map

| UI | Endpoint |
|---|---|
| Status dot, dropdown options | `GET /health`, `GET /meta` |
| Bug Fixer (+ related files) | `POST /bugfix` |
| Docstrings | `POST /generate/docstrings` |
| Test Generator | `POST /generate/tests` |
| Terminal tab (risk banner) | `POST /cli` |
| Chat Buddy | `POST /chat`, `POST /chat/stream` (SSE; falls back to `/chat` on 404/405) |
| Reset session | `DELETE /chat/{session_id}` |

Errors use the contract format `{ error: { code, message } }` and are shown with a hint per code.
`api.getHistory()` exists for `GET /chat/{session_id}` but isn't wired to the UI yet.

## Structure

```
src/
  api/client.js            fetch wrapper, SSE reader, error mapping, /meta normaliser
  context/                 WorkspaceContext: all shared state and actions
  hooks/                   useCopy, useMediaQuery
  utils/                   Prism setup + highlight helper
  components/
    common/                SplitPane, CodeBlock, MarkdownContent, CopyButton, SelectControl, PanelHeader, Icons
    layout/                Header, ModeTabs, StatusIndicator
    assistant/             AssistantPanel, MessageList, MessageBubble, PromptInput, ExtraInputs, ContextFiles
    results/               BugfixResult, DocstringsResult, TestsResult, ErrorMessage, Section
    editor/                EditorPanel (fullscreen), CodeEditor
    dock/                  BottomDock, OutputTab, TerminalTab, CliResult, RiskBanner
```

## Notes

- `GET /meta` is assumed to return `{ skill_levels, languages, docstring_styles, test_frameworks }` as string arrays. Missing lists fall back to defaults in `src/constants.js`.
- **Run** executes JavaScript in the browser only. The API has no code-execution endpoint, so other languages show a notice instead of a fake "compiled successfully".
- Model replies are sanitised with DOMPurify before rendering.
