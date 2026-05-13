from __future__ import annotations

from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel, Field, HttpUrl

SERVICE_NAME = "coco音乐"

T = TypeVar("T")


class MusicPlatform(str, Enum):
    qq = "qq"
    kugou = "kugou"
    kuwo = "kuwo"


class PlayInfoRequest(BaseModel):
    platform: MusicPlatform = Field(..., description="音乐平台/音源类型")
    id: str = Field(..., min_length=1, description="歌曲ID（通常为 URL 编码后的下载链接）")


class PlayInfoData(BaseModel):
    songid: str = Field(..., min_length=1, description="歌曲ID（请求入参原样返回）")
    name: str | None = Field(default=None, description="歌曲名称")
    artist: str | None = Field(default=None, description="歌手")
    album: str | None = Field(default=None, description="专辑")
    cover: HttpUrl | None = Field(default=None, description="封面图")
    lrc: HttpUrl | None = Field(default=None, description="歌词链接（如有）")
    url: HttpUrl
    link: HttpUrl | None = Field(default=None, description="原始下载链接（重定向前）")
    type: str = Field(..., min_length=1)
    platform: MusicPlatform


class ApiResponse(BaseModel, Generic[T]):
    code: int = Field(..., description="业务码（默认与 HTTP 状态码一致）")
    message: str = Field(..., min_length=1)
    service: str = Field(default=SERVICE_NAME, min_length=1, description="API 服务提供方")
    data: T | None = None
