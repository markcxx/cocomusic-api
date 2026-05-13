from __future__ import annotations

from urllib.parse import urlparse

import asgi
from workers import Response, WorkerEntrypoint

from app.main import create_app

_app = create_app(include_pages=False)


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        url = urlparse(request.url)
        if request.method == "GET":
            if url.path == "/":
                return await self.env.ASSETS.fetch("https://assets.local/home.html")
            if url.path == "/docs":
                return await self.env.ASSETS.fetch("https://assets.local/docs.html")
            if url.path == "/playground":
                return await self.env.ASSETS.fetch("https://assets.local/playground.html")
            if url.path == "/doc":
                return Response("", status=307, headers={"Location": "/docs"})
            if url.path == "/sandbox":
                return Response("", status=307, headers={"Location": "/playground"})
        request_obj = getattr(request, "js_object", request)
        return await asgi.fetch(_app, request_obj, self.env)
