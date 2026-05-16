from __future__ import annotations

from fastapi import APIRouter, Query

from backend.models.music_dto import ApiResponse, MiguQuality, MusicPlatform, PlayInfoData, SERVICE_NAME
from backend.services.jianbin_service import JianbinService
from backend.services.migu_service import MiguService


router = APIRouter(prefix="/v1/music", tags=["music"])


@router.get(
    "/song_url",
    response_model=ApiResponse[PlayInfoData],
)
async def get_song_url(
    platform: MusicPlatform = Query(..., description="平台类型"),
    id: str = Query(..., min_length=1, description="歌曲ID（migu 为 contentId_copyrightId）"),
    quality: MiguQuality | None = Query(default=None, description="音质（仅 migu 生效）"),
) -> ApiResponse[PlayInfoData]:
    song_id = (id or "").strip()
    if not song_id:
        raise ValueError("Invalid id")
    if platform == MusicPlatform.migu:
        service = MiguService()
        data = await service.get_play_info(id_str=song_id, quality=quality)
        return ApiResponse(code=200, message="ok", service=SERVICE_NAME, data=data)
    service = JianbinService()
    data = await service.get_play_info(platform=platform, id_str=song_id)
    return ApiResponse(code=200, message="ok", service=SERVICE_NAME, data=data)
