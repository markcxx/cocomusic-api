import { getNeteaseMusicUList } from "@/lib/env/netease-music-u";
import { NeteaseServicePool } from "@/lib/services/netease-service";

interface NeteaseSearchSong {
  id?: unknown;
  name?: unknown;
  ar?: Array<{ name?: unknown }>;
  artists?: Array<{ name?: unknown }>;
  al?: { name?: unknown; picUrl?: unknown };
  album?: { name?: unknown; picUrl?: unknown };
  dt?: unknown;
  duration?: unknown;
}

interface NeteaseSearchResult {
  songs: Array<{
    id: string;
    name: string | null;
    artist: string | null;
    album: string | null;
    cover: string | null;
    duration: number | null;
  }>;
  total: number;
  hasMore: boolean;
}

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return 20;
  return Math.min(Math.max(Math.floor(limit as number), 1), 50);
}

function normalizeOffset(offset?: number): number {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(Math.floor(offset as number), 0);
}

export async function neteaseSearchSongs(
  keywords: string,
  limit?: number,
  offset?: number
): Promise<NeteaseSearchResult> {
  const q = (keywords || "").trim();
  if (!q) throw new Error("Invalid or missing keyword");

  const musicUList = getNeteaseMusicUList();
  if (musicUList.length === 0) throw new Error("Netease service not configured");

  const l = normalizeLimit(limit);
  const o = normalizeOffset(offset);

  const service = new NeteaseServicePool(musicUList);
  const raw = await service.searchSongs(q, l, o);
  const result = raw.result as Record<string, unknown> | undefined;
  const list = Array.isArray(result?.songs) ? (result?.songs as NeteaseSearchSong[]) : [];
  const totalRaw = result?.songCount;
  const total = typeof totalRaw === "number" ? totalRaw : list.length;

  const songs = list.map((song) => {
    const artists = Array.isArray(song.ar) ? song.ar : Array.isArray(song.artists) ? song.artists : [];
    const artist = artists
      .map((x) => x?.name)
      .filter((x): x is string => typeof x === "string" && !!x)
      .join(", ");
    const albumObj =
      song.al && typeof song.al === "object"
        ? song.al
        : song.album && typeof song.album === "object"
          ? song.album
          : null;

    return {
      id: typeof song.id === "number" || typeof song.id === "string" ? String(song.id) : "",
      name: typeof song.name === "string" ? song.name : null,
      artist: artist || null,
      album: albumObj && typeof albumObj.name === "string" ? albumObj.name : null,
      cover: albumObj && typeof albumObj.picUrl === "string" ? albumObj.picUrl : null,
      duration:
        typeof song.dt === "number"
          ? song.dt
          : typeof song.duration === "number"
            ? song.duration
            : null,
    };
  });

  return {
    songs: songs.filter((x) => !!x.id),
    total,
    hasMore: o + songs.length < total,
  };
}

