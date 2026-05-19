import { NextRequest } from "next/server";
import type { ApiResponse, MusicPlatform } from "@/lib/models/music";
import { SERVICE_NAME } from "@/lib/models/music";
import { DETAIL_PLATFORMS, getSongDetailByPlatform } from "@/lib/services/song-detail";
import type { SongDetailData } from "@/lib/services/song-detail/types";

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

  if (!platform || !DETAIL_PLATFORMS.includes(platform)) {
    return errorResponse(400, "Invalid or unsupported platform for song_detail");
  }

  const songId = (id || "").trim();
  if (!songId) {
    return errorResponse(400, "Invalid or missing id");
  }

  try {
    const data = await getSongDetailByPlatform(platform, songId);

    return jsonResponse<SongDetailData>({
      code: 200,
      message: "ok",
      service: SERVICE_NAME,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (
      message === "Invalid id" ||
      message === "Invalid song id" ||
      message === "Unsupported platform for song_detail"
    ) {
      return errorResponse(400, message);
    }
    if (message === "Song not found") {
      return errorResponse(404, message);
    }
    if (message === "Netease service not configured") {
      return errorResponse(500, message);
    }
    if (
      message.includes("fetch") ||
      message.includes("network") ||
      message.includes("abort") ||
      message.includes("timeout") ||
      message.includes("Upstream service unavailable")
    ) {
      return errorResponse(502, "Upstream service unavailable");
    }

    return errorResponse(500, message);
  }
}
