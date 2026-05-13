from __future__ import annotations

from fastapi import APIRouter

from app.models.music_dto import ApiResponse, PlayInfoData, PlayInfoRequest, SERVICE_NAME
from app.services.jianbin_service import JianbinService


router = APIRouter(prefix="/v1/music", tags=["music"])


@router.post(
    "/play-info",
    response_model=ApiResponse[PlayInfoData],
)
async def get_play_info(request: PlayInfoRequest) -> ApiResponse[PlayInfoData]:
    service = JianbinService()
    data = await service.get_play_info(platform=request.platform, id_str=request.id)
    return ApiResponse(code=200, message="ok", service=SERVICE_NAME, data=data)
