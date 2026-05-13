from __future__ import annotations

import json
from typing import Any
from urllib.parse import unquote, urljoin, urlparse

import httpx

from app.models.music_dto import MusicPlatform, PlayInfoData


class JianbinService:
    def __init__(self, base_url: str = "https://www.jbsou.cn/", request_timeout_s: float = 30.0) -> None:
        self._base_url = base_url
        self._timeout = request_timeout_s
        self._headers = {
            "user-agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/144.0.0.0 Safari/537.36"
            ),
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "origin": "https://www.jbsou.cn",
            "x-requested-with": "XMLHttpRequest",
            "referer": "https://www.jbsou.cn/",
        }

    @property
    def provider_name(self) -> str:
        return "jianbin"

    def _to_absolute_url(self, value: str) -> str:
        if not value:
            return ""
        try:
            return urljoin(self._base_url, value)
        except Exception:
            return value

    def _normalize_optional_url(self, value: Any) -> str | None:
        if not isinstance(value, str) or not value:
            return None
        absolute = self._to_absolute_url(value)
        if absolute.startswith("http"):
            return absolute
        return None

    def _extract_ext(self, url: str) -> str:
        if not url:
            return "mp3"
        parsed = urlparse(url)
        filename = (parsed.path or "").rsplit("/", 1)[-1]
        if "." in filename:
            ext = filename.rsplit(".", 1)[-1]
            if ext:
                return ext
        return "mp3"

    def _safe_decode(self, value: str) -> str:
        if not value:
            return ""
        try:
            return unquote(value)
        except Exception:
            return value

    def _normalize_id_to_url(self, id_str: str) -> str:
        value = (id_str or "").strip()
        if not value:
            return ""
        decoded_once = self._safe_decode(value) if "%" in value else value
        decoded = self._safe_decode(decoded_once) if "%" in decoded_once else decoded_once
        if decoded.startswith("http"):
            return decoded
        return ""

    async def _resolve_final_url(self, client: httpx.AsyncClient, url: str) -> str:
        if not url:
            return ""
        try:
            response = await client.head(
                url,
                headers={"user-agent": self._headers["user-agent"]},
                timeout=self._timeout,
                follow_redirects=True,
            )
            if response.status_code == 405:
                response = await client.get(
                    url,
                    headers={"user-agent": self._headers["user-agent"]},
                    timeout=self._timeout,
                    follow_redirects=True,
                )
            final_url = str(response.url)
            if final_url.startswith("http"):
                return final_url
            return url
        except httpx.RequestError:
            return url

    async def _search(self, client: httpx.AsyncClient, query: str, filter_: str, platform: MusicPlatform) -> list[dict[str, Any]]:
        value = (query or "").strip()
        if not value:
            return []
        params = {
            "input": value,
            "filter": filter_,
            "type": platform.value,
            "page": "1",
        }
        response = await client.post(self._base_url, data=params, headers=self._headers, timeout=self._timeout)
        data: Any = response.json()
        payload = self.normalize_search_response(data)
        items = payload.get("data") or []
        if not isinstance(items, list):
            return []
        return [item for item in items if isinstance(item, dict)]

    def _pick_first_download_url(self, items: list[dict[str, Any]]) -> str:
        for item in items:
            raw_url = item.get("url")
            if not isinstance(raw_url, str) or not raw_url:
                continue
            return self._to_absolute_url(raw_url)
        return ""

    def _pick_first_item(self, items: list[dict[str, Any]]) -> dict[str, Any] | None:
        for item in items:
            if isinstance(item, dict) and item:
                return item
        return None

    async def get_play_info(self, platform: MusicPlatform, id_str: str) -> PlayInfoData:
        query = (id_str or "").strip()
        if not query:
            raise ValueError("Invalid id")
        async with httpx.AsyncClient() as client:
            normalized_url = self._normalize_id_to_url(query)
            if normalized_url:
                url = normalized_url
                item = None
            else:
                items = await self._search(client, query=query, filter_="id", platform=platform)
                item = self._pick_first_item(items)
                url = self._pick_first_download_url(items)
            if not url:
                raise ValueError("Song not found")
            final_url = await self._resolve_final_url(client, url)
            cover = None
            lrc = None
            link = None
            songid = query
            if isinstance(item, dict):
                songid_value = item.get("songid")
                if isinstance(songid_value, str) and songid_value:
                    songid = songid_value
                cover_url = self._normalize_optional_url(item.get("cover"))
                if cover_url:
                    cover = await self._resolve_final_url(client, cover_url)
                lrc = self._normalize_optional_url(item.get("lrc"))
                link = self._normalize_optional_url(item.get("link"))
        if not final_url.startswith("http"):
            raise ValueError("Invalid play url")
        name = item.get("name") if isinstance(item, dict) else None
        artist = item.get("artist") if isinstance(item, dict) else None
        album = item.get("album") if isinstance(item, dict) else None
        if not isinstance(name, str) or not name:
            name = None
        if not isinstance(artist, str) or not artist:
            artist = None
        if not isinstance(album, str) or not album:
            album = None
        return PlayInfoData(
            songid=songid,
            name=name,
            artist=artist,
            album=album,
            cover=cover,
            lrc=lrc,
            url=final_url,
            link=link,
            type=self._extract_ext(final_url),
            platform=platform,
        )

    def normalize_search_response(self, payload: Any) -> dict[str, Any]:
        if not payload:
            return {}
        if isinstance(payload, str):
            try:
                return json.loads(payload)
            except Exception:
                return {}
        if isinstance(payload, dict):
            return payload
        return {}
