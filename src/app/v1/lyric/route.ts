import { NextRequest } from "next/server";
import type { ApiResponse, LyricData, MusicPlatform } from "@/lib/models/music";
import { SERVICE_NAME } from "@/lib/models/music";
import { getLyricByPlatform, LYRIC_PLATFORMS } from "@/lib/services/lyric";

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

  if (!platform || !LYRIC_PLATFORMS.includes(platform)) {
    return errorResponse(400, "Invalid or unsupported platform for lyric");
  }

  const songId = (id || "").trim();
  if (!songId) {
    return errorResponse(400, "Invalid or missing id");
  }

  try {
    const data = await getLyricByPlatform(platform, songId);

    return jsonResponse<LyricData>({
      code: 200,
      message: "ok",
      service: SERVICE_NAME,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (
      message === "Invalid id" ||
      message === "Invalid or missing id" ||
      message === "Invalid song id" ||
      message === "Unsupported platform for lyric"
    ) {
      return errorResponse(400, message);
    }
    if (message === "Song not found" || message === "Lyric not found") {
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
