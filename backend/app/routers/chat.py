import json
import re

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from .. import llm, prompts, sessions
from ..errors import AppError
from ..schemas import ChatRequest, ChatResponse, ChatHistory, ChatMessage, CodeBlock

router = APIRouter(tags=["chat"])
_FENCE = re.compile(r"```(\w*)\n(.*?)```", re.S)


def _blocks(reply: str) -> list[CodeBlock]:
    return [CodeBlock(language=lang, code=code.rstrip("\n")) for lang, code in _FENCE.findall(reply)]


def _prepare(req: ChatRequest) -> tuple[str, str, list[dict]]:
    sid = req.session_id or sessions.new_id()
    sessions.append(sid, "user", prompts.chat_user_message(req))
    return sid, prompts.chat_system(req), sessions.history(sid)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    sid, system, msgs = _prepare(req)
    reply = await llm.complete(system, msgs)
    sessions.append(sid, "assistant", reply)
    return ChatResponse(session_id=sid, reply=reply, code_blocks=_blocks(reply))


@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    sid, system, msgs = _prepare(req)

    async def events():
        full = []
        try:
            async for delta in llm.stream(system, msgs):
                full.append(delta)
                yield f"event: token\ndata: {json.dumps({'delta': delta})}\n\n"
        except AppError as e:
            yield f"event: error\ndata: {json.dumps({'error': {'code': e.code, 'message': e.message}})}\n\n"
            return
        sessions.append(sid, "assistant", "".join(full))
        yield f"event: done\ndata: {json.dumps({'session_id': sid})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/chat/{session_id}", response_model=ChatHistory)
async def get_history(session_id: str):
    if sessions.get(session_id) is None:
        raise AppError("NOT_FOUND", "Session not found", 404)
    return ChatHistory(session_id=session_id,
                       messages=[ChatMessage(**m) for m in sessions.history(session_id)])


@router.delete("/chat/{session_id}", status_code=204)
async def clear_history(session_id: str):
    if not sessions.delete(session_id):
        raise AppError("NOT_FOUND", "Session not found", 404)
