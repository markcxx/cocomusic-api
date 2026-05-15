from __future__ import annotations

import re
from typing import Any
from urllib.parse import urlencode

import httpx

from app.models.music_dto import MiguQuality, MusicPlatform, PlayInfoData


class MiguService:
    def __init__(self, request_timeout_s: float = 15.0) -> None:
        self._timeout = request_timeout_s
        self._headers = {
            "accept": "application/json, text/plain, */*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "activityid": "v4_zt_2022_music",
            "appid": "ce",
            "channel": "014X031",
            "connection": "keep-alive",
            "deviceid": "E60C6B2F-7F11-4362-9FCE-6F1CC86E0F18",
            "host": "c.musicapp.migu.cn",
            "hwid": "",
            "imei": "",
            "h5page": "",
            "imsi": "",
            "location-info": "",
            "mgm-user-agent": "",
            "oaid": "",
            "uid": "",
            "location-data": "",
            "logid": "h5page[1808]",
            "mgm-network-operators": "02",
            "mgm-network-standard": "03",
            "mgm-network-type": "03",
            "origin": "https://y.migu.cn",
            "recommendstatus": "1",
            "referer": "https://y.migu.cn/app/v4/zt/2022/music/index.html",
            "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "subchannel": "014X031",
            "test": "00",
            "ua": "Android_migu",
            "version": "6.8.8",
            "user-agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/143.0.0.0 Safari/537.36"
            ),
        }
        self._music_qualities = {
            "LQ": "mp3",
            "PQ": "mp3",
            "HQ": "mp3",
            "SQ": "flac",
            "ZQ": "flac",
            "Z3D": "flac",
            "ZQ24": "flac",
            "ZQ32": "flac",
        }

    @property
    def provider_name(self) -> str:
        return "migu"

    def _parse_id(self, id_str: str) -> tuple[str, str]:
        value = (id_str or "").strip()
        if not value:
            raise ValueError("Invalid id")
        if "_" not in value:
            raise ValueError("Invalid id")
        parts = value.split("_", 1)
        content_id = parts[0].strip()
        copyright_id = parts[1].strip() if len(parts) > 1 else ""
        if not content_id or not copyright_id:
            raise ValueError("Invalid id")
        return content_id, copyright_id

    def _parse_size(self, value: Any) -> float:
        raw = str(value if value is not None else "").replace("MB", "").strip()
        if not raw:
            return 0.0
        try:
            return float(raw)
        except (ValueError, TypeError):
            return 0.0

    def _build_search_url(self, keyword: str, page_no: int = 1, page_size: int = 20) -> str:
        search_switch = "{'song': 1, 'album': 0, 'singer': 0, 'tagSong': 1, 'mvSong': 0, 'bestShow': 1}"
        params = {
            "text": keyword,
            "pageNo": str(page_no),
            "pageSize": str(page_size),
            "isCopyright": "1",
            "sort": "1",
            "searchSwitch": search_switch,
        }
        return f"https://c.musicapp.migu.cn/v1.0/content/search_all.do?{urlencode(params)}"

    def _build_listen_url(self, content_id: str, copyright_id: str, resource_type: str, tone_flag: str) -> str:
        return (
            "https://c.musicapp.migu.cn/MIGUM3.0/strategy/listen-url/v2.4"
            f"?resourceType={resource_type}"
            "&netType=01"
            "&scene="
            f"&toneFlag={tone_flag}"
            f"&contentId={content_id}"
            f"&copyrightId={copyright_id}"
            f"&lowerQualityContentId={content_id}"
        )

    def _fallback_url(self, content_id: str, copyright_id: str, tone_flag: str, resource_type: str) -> str:
        return (
            "https://app.pd.nf.migu.cn/MIGUM3.0/v1.0/content/sub/listenSong.do"
            f"?channel=mx&copyrightId={copyright_id}"
            f"&contentId={content_id}"
            f"&toneFlag={tone_flag}"
            f"&resourceType={resource_type}"
            "&userId=15548614588710179085069"
            "&netType=00"
        )

    def _safe_str(self, value: Any) -> str | None:
        if not isinstance(value, str):
            return None
        text = value.strip()
        if not text:
            return None
        return text

    def _extract_song_list(self, payload: Any) -> list[dict[str, Any]]:
        if not isinstance(payload, dict):
            return []
        song_result = payload.get("songResultData") or {}
        if not isinstance(song_result, dict):
            return []
        items = song_result.get("result") or []
        if not isinstance(items, list):
            return []
        return [item for item in items if isinstance(item, dict)]

    def _pick_song_for_meta(
        self, items: list[dict[str, Any]], content_id: str, copyright_id: str
    ) -> dict[str, Any] | None:
        for item in items:
            if item.get("contentId") == content_id and item.get("copyrightId") == copyright_id:
                return item
        for item in items:
            if item.get("contentId") == content_id:
                return item
        return None

    def _pick_song_for_rates(self, items: list[dict[str, Any]]) -> dict[str, Any] | None:
        for item in items:
            if item:
                return item
        return None

    def _extract_meta(self, song: dict[str, Any]) -> tuple[str | None, str | None, str | None, str | None]:
        title = self._safe_str(song.get("name"))
        singers = song.get("singers") or []
        artist_names: list[str] = []
        if isinstance(singers, list):
            for singer in singers:
                if not isinstance(singer, dict):
                    continue
                name = self._safe_str(singer.get("name"))
                if name:
                    artist_names.append(name)
        artist = ", ".join(artist_names) if artist_names else None
        albums = song.get("albums") or []
        album_names: list[str] = []
        if isinstance(albums, list):
            for album in albums:
                if not isinstance(album, dict):
                    continue
                name = self._safe_str(album.get("name"))
                if name:
                    album_names.append(name)
        album = ", ".join(album_names) if album_names else None
        cover = None
        img_items = song.get("imgItems") or []
        if isinstance(img_items, list) and img_items:
            last = img_items[-1] if isinstance(img_items[-1], dict) else None
            if isinstance(last, dict):
                cover = self._safe_str(last.get("img"))
        if cover and not cover.startswith("http"):
            cover = None
        return title, artist, album, cover

    def _extract_meta_from_listen_data(self, data: dict[str, Any]) -> tuple[str | None, str | None, str | None, str | None]:
        title = (
            self._safe_str(data.get("songName"))
            or self._safe_str(data.get("musicName"))
            or self._safe_str(data.get("name"))
            or self._safe_str(data.get("title"))
        )
        artist = (
            self._safe_str(data.get("singerName"))
            or self._safe_str(data.get("artist"))
            or self._safe_str(data.get("singer"))
        )
        album = self._safe_str(data.get("albumName")) or self._safe_str(data.get("album"))
        cover = (
            self._safe_str(data.get("img"))
            or self._safe_str(data.get("pic"))
            or self._safe_str(data.get("cover"))
            or self._safe_str(data.get("albumCover"))
        )
        if cover and not cover.startswith("http"):
            cover = None
        return title, artist, album, cover

    def _extract_rate_formats(self, song: dict[str, Any]) -> list[dict[str, Any]]:
        merged: list[Any] = []
        rate_formats = song.get("rateFormats") or []
        new_rate_formats = song.get("newRateFormats") or []
        if isinstance(rate_formats, list):
            merged.extend(rate_formats)
        if isinstance(new_rate_formats, list):
            merged.extend(new_rate_formats)
        result: list[dict[str, Any]] = []
        for item in merged:
            if not isinstance(item, dict):
                continue
            if not item.get("formatType") or not item.get("resourceType"):
                continue
            result.append(item)
        return result

    def _sorted_rate_formats(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return sorted(
            items,
            key=lambda r: self._parse_size(r.get("size") or r.get("iosSize") or r.get("androidSize")),
            reverse=True,
        )

    def _fix_url(self, url: str) -> str:
        value = (url or "").strip()
        if not value:
            return ""
        return re.sub(r"(?<=/)MP3_128_16_Stero(?=/)", "MP3_320_16_Stero", value)

    async def _get_json(self, client: httpx.AsyncClient, url: str) -> dict[str, Any]:
        response = await client.get(url, headers=self._headers, timeout=self._timeout)
        data: Any = response.json()
        if isinstance(data, dict):
            return data
        return {}

    async def get_play_info(self, id_str: str, *, quality: MiguQuality | None = None) -> PlayInfoData:
        content_id, copyright_id = self._parse_id(id_str)
        async with httpx.AsyncClient() as client:
            search_url = self._build_search_url(content_id, page_no=1, page_size=10)
            payload = await self._get_json(client, search_url)
            songs = self._extract_song_list(payload)
            song_for_meta = self._pick_song_for_meta(songs, content_id=content_id, copyright_id=copyright_id)
            song_for_rates = song_for_meta or self._pick_song_for_rates(songs)
            if not song_for_rates:
                raise ValueError("Song not found")

            if song_for_meta:
                name, artist, album, cover = self._extract_meta(song_for_meta)
            else:
                name, artist, album, cover = None, None, None, None
            rate_formats = self._sorted_rate_formats(self._extract_rate_formats(song_for_rates))
            if quality is not None:
                target = quality.value
                rate_formats = [item for item in rate_formats if item.get("formatType") == target]
                if not rate_formats:
                    raise ValueError("Unsupported quality")
            for rate in rate_formats:
                tone_flag = self._safe_str(rate.get("formatType"))
                resource_type = self._safe_str(rate.get("resourceType"))
                if not tone_flag or not resource_type:
                    continue
                url = self._build_listen_url(content_id, copyright_id, resource_type=resource_type, tone_flag=tone_flag)
                info = await self._get_json(client, url)
                url_from_api = None
                data = info.get("data") if isinstance(info, dict) else None
                if isinstance(data, dict):
                    listen_title, listen_artist, listen_album, listen_cover = self._extract_meta_from_listen_data(data)
                    if listen_title:
                        name = listen_title
                    if listen_artist:
                        artist = listen_artist
                    if listen_album:
                        album = listen_album
                    if listen_cover:
                        cover = listen_cover
                if isinstance(data, dict):
                    url_from_api = self._safe_str(data.get("url"))
                if not url_from_api:
                    url_from_api = self._fallback_url(
                        content_id, copyright_id, tone_flag=tone_flag, resource_type=resource_type
                    )
                fixed = self._fix_url(url_from_api)
                if not fixed.startswith("http"):
                    continue
                type_ = self._music_qualities.get(tone_flag, "mp3")
                return PlayInfoData(
                    songid=id_str.strip(),
                    name=name,
                    artist=artist,
                    album=album,
                    cover=cover,
                    lrc=None,
                    url=fixed,
                    link=url_from_api if url_from_api.startswith("http") else None,
                    type=type_,
                    quality=tone_flag,
                    platform=MusicPlatform.migu,
                )
        raise ValueError("Failed to get play url")
