import type { MusicPlatform } from "@/lib/models/music";
import { neteaseSearchSongs } from "@/lib/services/platforms/netease/module/search";
import { qqSearchSongs } from "@/lib/services/platforms/qqmusic/module/search";
import type { SearchData, SearchSongItem } from "@/lib/services/search/types";

export const SEARCH_PLATFORMS: MusicPlatform[] = ["qq", "netease"];

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return 20;
  return Math.min(Math.max(Math.floor(limit as number), 1), 50);
}

function normalizeOffset(offset?: number): number {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(Math.floor(offset as number), 0);
}

function normalizeItems(
  songs: Array<{
    id: string;
    mid?: string | null;
    name: string | null;
    artist: string | null;
    album: string | null;
    cover: string | null;
    duration: number | null;
  }>,
  platform: MusicPlatform
): SearchSongItem[] {
  return songs.map((song) => ({
    songid: song.id,
    mid: song.mid ?? null,
    name: song.name,
    artist: song.artist,
    album: song.album,
    cover: song.cover,
    duration: song.duration,
    platform,
  }));
}

export async function searchByPlatform(
  platform: MusicPlatform,
  keyword: string,
  limit?: number,
  offset?: number
): Promise<SearchData> {
  const q = (keyword || "").trim();
  if (!q) throw new Error("Invalid or missing keyword");

  const l = normalizeLimit(limit);
  const o = normalizeOffset(offset);

  if (platform === "qq") {
    const result = await qqSearchSongs({ keywords: q, limit: l, offset: o });
    return {
      keyword: q,
      platform,
      total: result.total,
      limit: l,
      offset: o,
      hasMore: result.hasMore,
      items: normalizeItems(result.songs, platform),
    };
  }

  if (platform === "netease") {
    const result = await neteaseSearchSongs(q, l, o);
    return {
      keyword: q,
      platform,
      total: result.total,
      limit: l,
      offset: o,
      hasMore: result.hasMore,
      items: normalizeItems(result.songs, platform),
    };
  }

  throw new Error("Unsupported platform for search");
}
