import { NextRequest } from "next/server";
import type { ApiResponse, MusicPlatform } from "@/lib/models/music";
import { SERVICE_NAME } from "@/lib/models/music";
import { SEARCH_PLATFORMS, searchByPlatform } from "@/lib/services/search";
import type { SearchData } from "@/lib/services/search/types";

function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return Response.json(data, { status });
}

function errorResponse(code: number, message: string) {
  return jsonResponse<null>(
    { code, message, service: SERVICE_NAME, data: null },
    code
  );
}

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const platform = searchParams.get("platform") as MusicPlatform | null;
  const keyword = searchParams.get("q");
  const limit = parseIntParam(searchParams.get("limit"));
  const offset = parseIntParam(searchParams.get("offset"));

  if (!platform || !SEARCH_PLATFORMS.includes(platform)) {
    return errorResponse(400, "Invalid or unsupported platform for search");
  }

  const q = (keyword || "").trim();
  if (!q) {
    return errorResponse(400, "Invalid or missing q");
  }

  try {
    const data = await searchByPlatform(platform, q, limit, offset);
    return jsonResponse<SearchData>({
      code: 200,
      message: "ok",
      service: SERVICE_NAME,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";

    if (
      message === "Invalid or missing q" ||
      message === "Invalid or missing keyword" ||
      message === "Unsupported platform for search"
    ) {
      return errorResponse(400, message);
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

