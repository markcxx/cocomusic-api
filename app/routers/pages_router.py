from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse, RedirectResponse


router = APIRouter(include_in_schema=False)

_WEB_DIR = Path(__file__).resolve().parent.parent / "web"


def _html(path: Path) -> FileResponse:
    return FileResponse(path=path, media_type="text/html; charset=utf-8")


@router.get("/")
async def home() -> FileResponse:
    return _html(_WEB_DIR / "home.html")


@router.get("/docs")
async def docs() -> FileResponse:
    return _html(_WEB_DIR / "docs.html")


@router.get("/playground")
async def playground() -> FileResponse:
    return _html(_WEB_DIR / "playground.html")


@router.get("/doc")
async def doc_legacy() -> RedirectResponse:
    return RedirectResponse(url="/docs", status_code=307)


@router.get("/sandbox")
async def sandbox_legacy() -> RedirectResponse:
    return RedirectResponse(url="/playground", status_code=307)
