import { NextRequest } from "next/server";
import type {
  ApiResponse,
  MiguQuality,
  MusicPlatform,
  NeteaseQuality,
  PlayInfoData,
} from "@/lib/models/music";
import { SERVICE_NAME } from "@/lib/models/music";
import { MiguService } from "@/lib/services/migu-service";
import { JianbinService } from "@/lib/services/jianbin-service";
import { NeteaseServicePool } from "@/lib/services/netease-service";

const VALID_PLATFORMS: MusicPlatform[] = ["qq", "kugou", "kuwo", "migu", "netease"];
const VALID_MIGU_QUALITIES: MiguQuality[] = [
  "LQ",
  "PQ",
  "HQ",
  "SQ",
  "ZQ",
];
const VALID_NETEASE_QUALITIES: NeteaseQuality[] = [
  "standard",
  "higher",
  "exhigh",
  "lossless",
  "hires",
];

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
  const quality = searchParams.get("quality");

  if (!platform || !VALID_PLATFORMS.includes(platform)) {
    return errorResponse(400, "Invalid or missing platform");
  }

  const songId = (id || "").trim();
  if (!songId) {
    return errorResponse(400, "Invalid or missing id");
  }

  if (platform === "migu" && quality && !VALID_MIGU_QUALITIES.includes(quality as MiguQuality)) {
    return errorResponse(400, "Invalid quality for migu");
  }

  if (platform === "netease" && quality && !VALID_NETEASE_QUALITIES.includes(quality as NeteaseQuality)) {
    return errorResponse(400, "Invalid quality for netease");
  }

  try {
    let data: PlayInfoData;

    if (platform === "migu") {
      const service = new MiguService();
      data = await service.getPlayInfo(songId, quality as MiguQuality | null);
    } else if (platform === "netease") {
      const musicUList = (process.env.NETEASE_MUSIC_U || "").split(",").map(s => s.trim()).filter(Boolean);
      if (musicUList.length === 0) {
        return errorResponse(500, "Netease service not configured");
      }
      const service = new NeteaseServicePool(musicUList);
      data = await service.getPlayInfo(songId, quality as NeteaseQuality | null);
    } else {
      const service = new JianbinService();
      data = await service.getPlayInfo(platform, songId);
    }

    return jsonResponse<PlayInfoData>({
      code: 200,
      message: "ok",
      service: SERVICE_NAME,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (message === "Invalid id" || message === "Unsupported quality" || message === "No MUSIC_U accounts configured") {
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
