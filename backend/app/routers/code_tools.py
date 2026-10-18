from fastapi import APIRouter

from .. import llm, prompts
from ..schemas import (BugfixRequest, BugfixResponse, DocstringRequest, DocstringResponse,
                       TestGenRequest, TestGenResponse, CliRequest, CliResponse)

router = APIRouter()


@router.post("/bugfix", response_model=BugfixResponse, tags=["code"])
async def bugfix(req: BugfixRequest):
    system, user = prompts.bugfix(req)
    return await llm.generate_json(system, user, BugfixResponse)


@router.post("/generate/docstrings", response_model=DocstringResponse, tags=["code"])
async def docstrings(req: DocstringRequest):
    system, user = prompts.docstrings(req)
    return await llm.generate_json(system, user, DocstringResponse)


@router.post("/generate/tests", response_model=TestGenResponse, tags=["code"])
async def tests(req: TestGenRequest):
    system, user = prompts.tests(req)
    return await llm.generate_json(system, user, TestGenResponse)


@router.post("/cli", response_model=CliResponse, tags=["cli"])
async def cli(req: CliRequest):
    system, user = prompts.cli(req)
    return await llm.generate_json(system, user, CliResponse)
