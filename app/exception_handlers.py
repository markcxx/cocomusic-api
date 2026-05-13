from __future__ import annotations

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.models.music_dto import SERVICE_NAME


def _json_error(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"code": status_code, "message": message, "service": SERVICE_NAME, "data": None},
    )


async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return _json_error(status_code=400, message=str(exc) or "Bad request")


async def httpx_error_handler(request: Request, exc: httpx.RequestError) -> JSONResponse:
    return _json_error(status_code=502, message="Upstream request failed")


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    message = "Internal server error"
    if isinstance(exc, httpx.RequestError):
        return await httpx_error_handler(request, exc)
    if isinstance(exc, ValueError):
        return await value_error_handler(request, exc)
    return _json_error(status_code=500, message=message)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ValueError, value_error_handler)
    app.add_exception_handler(httpx.RequestError, httpx_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
