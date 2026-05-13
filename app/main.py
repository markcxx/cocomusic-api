from __future__ import annotations

import os
import sys

if __package__ is None or __package__ == "":
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi import FastAPI

from app.exception_handlers import register_exception_handlers
from app.routers.music_router import router as music_router
from app.routers.pages_router import router as pages_router


def create_app() -> FastAPI:
    app = FastAPI(title="CocoMusic API", docs_url="/api/docs", redoc_url="/api/redoc")
    app.include_router(pages_router)
    app.include_router(music_router)
    register_exception_handlers(app)
    return app


app = create_app()


def main() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    main()
