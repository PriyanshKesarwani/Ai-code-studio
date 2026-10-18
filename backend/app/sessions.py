import uuid
from collections import OrderedDict

from .config import settings

MAX_SESSIONS = 1000  # evict oldest so the in-memory store can't grow forever
_store: "OrderedDict[str, list[dict]]" = OrderedDict()


def new_id() -> str:
    return str(uuid.uuid4())


def get(session_id: str) -> list[dict] | None:
    return _store.get(session_id)


def history(session_id: str) -> list[dict]:
    return list(_store.get(session_id, []))


def append(session_id: str, role: str, content: str) -> None:
    msgs = _store.setdefault(session_id, [])
    msgs.append({"role": role, "content": content})
    del msgs[:-settings.chat_max_messages]
    while msgs and msgs[0]["role"] != "user":  # history must start with a user turn
        msgs.pop(0)
    _store.move_to_end(session_id)
    while len(_store) > MAX_SESSIONS:
        _store.popitem(last=False)


def delete(session_id: str) -> bool:
    return _store.pop(session_id, None) is not None
