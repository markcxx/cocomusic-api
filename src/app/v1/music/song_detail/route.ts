import { NextRequest } from "next/server";
import type { ApiResponse, MusicPlatform } from "@/lib/models/music";
import { SERVICE_NAME } from "@/lib/models/music";
import { NeteaseServicePool } from "@/lib/services/netease-service";
import { getNeteaseMusicUList } from "@/lib/env/netease-music-u";

interface SongDetail {
  songid: string;
  name: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  duration: number | null;
  platform: MusicPlatform;
}

function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return Response.json(data, { status });
}

function errorResponse(code: number, message: string) {
  return jsonResponse<null>(
    { code, message, service: SERVICE_NAME, data: null },
    code
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const platform = searchParams.get("platform") as MusicPlatform | null;
  const id = searchParams.get("id");

  if (!platform || platform !== "netease") {
    return errorResponse(400, "Only netease platform is supported");
  }

  const songId = (id || "").trim();
  if (!songId) {
    return errorResponse(400, "Invalid or missing id");
  }

  try {
    const musicUList = getNeteaseMusicUList();

    if (musicUList.length === 0) {
      return errorResponse(500, "Netease service not configured");
    }

    const service = new NeteaseServicePool(musicUList);
    const songIdNum = parseInt(songId, 10);

    if (isNaN(songIdNum)) {
      return errorResponse(400, "Invalid song id");
    }

    // 获取歌曲详情
    const detailResult = await service.getSongDetail([songIdNum]);

    const songs = detailResult.songs;
    if (!Array.isArray(songs) || songs.length === 0) {
      return errorResponse(404, "Song not found");
    }

    const song = songs[0] as Record<string, unknown>;

    // 解析歌曲信息
    let name: string | null = song.name as string || null;
    let artist: string | null = null;
    let album: string | null = null;
    let cover: string | null = null;
    let duration: number | null = song.dt as number || null;

    // 歌手
    const ar = song.ar;
    if (Array.isArray(ar) && ar.length > 0) {
      const artists = ar.map((a: any) => a.name).filter(Boolean);
      artist = artists.join(", ") || null;
    }

    // 专辑
    const al = song.al;
    if (al && typeof al === "object") {
      const albumObj = al as Record<string, unknown>;
      album = albumObj.name as string || null;
      cover = albumObj.picUrl as string || null;
    }

    const data: SongDetail = {
      songid: songId,
      name,
      artist,
      album,
      cover,
      duration,
      platform: "netease",
    };

    return jsonResponse<SongDetail>({
      code: 200,
      message: "ok",
      service: SERVICE_NAME,
      data,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";

    if (message === "Invalid id" || message === "No MUSIC_U accounts configured") {
      return errorResponse(400, message);
    }
    if (message === "Song not found") {
      return errorResponse(404, message);
    }
    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("abort") ||
      message.includes("timeout")
    ) {
      return errorResponse(502, "Upstream service unavailable");
    }

    return errorResponse(500, message);
  }
}
