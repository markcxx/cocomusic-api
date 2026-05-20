interface QqSearchQuery {
  keywords: string;
  limit?: number;
  offset?: number;
}

interface QqSearchSongLike {
  id?: unknown;
  mid?: unknown;
  name?: unknown;
  singer?: Array<{ name?: unknown }>;
  album?: { name?: unknown; mid?: unknown };
  interval?: unknown;
}

interface QqSearchResult {
  songs: Array<{
    id: string;
    mid: string | null;
    name: string | null;
    artist: string | null;
    album: string | null;
    cover: string | null;
    duration: number | null;
  }>;
  total: number;
  hasMore: boolean;
}

const SEARCH_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/131.0.0.0",
};

function normalizeLimit(limit?: number): number {
  if (!Number.isFinite(limit)) return 20;
  return Math.min(Math.max(Math.floor(limit as number), 1), 30);
}

function normalizeOffset(offset?: number): number {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(Math.floor(offset as number), 0);
}

function mapSongs(list: QqSearchSongLike[]) {
  return list
    .map((song) => {
      const artist = Array.isArray(song.singer)
        ? song.singer
            .map((item) => item?.name)
            .filter((item): item is string => typeof item === "string" && item.length > 0)
            .join(", ")
        : "";

      const albumMid = typeof song.album?.mid === "string" ? song.album.mid : "";

      return {
        id: typeof song.id === "number" || typeof song.id === "string" ? String(song.id) : "",
        mid: typeof song.mid === "string" ? song.mid : null,
        name: typeof song.name === "string" ? song.name : null,
        artist: artist || null,
        album: typeof song.album?.name === "string" ? song.album.name : null,
        cover: albumMid ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg` : null,
        duration: typeof song.interval === "number" ? song.interval * 1000 : null,
      };
    })
    .filter((song) => song.id);
}

export async function qqSearchSongs(query: QqSearchQuery): Promise<QqSearchResult> {
  const keywords = (query.keywords || "").trim();
  if (!keywords) {
    throw new Error("Invalid or missing keyword");
  }

  const limit = normalizeLimit(query.limit);
  const offset = normalizeOffset(query.offset);
  const pageNum = Math.floor(offset / limit) + 1;

  const payload = {
    comm: {
      ct: "19",
      cv: "1859",
      uin: "0",
    },
    req_1: {
      method: "DoSearchForQQMusicDesktop",
      module: "music.search.SearchCgiService",
      param: {
        grp: 1,
        num_per_page: limit,
        page_num: pageNum,
        query: keywords,
        search_type: 0,
      },
    },
  };

  const response = await fetch("http://u6.y.qq.com/cgi-bin/musicu.fcg", {
    method: "POST",
    headers: SEARCH_HEADERS,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Upstream service unavailable");
  }

  const raw = (await response.json()) as {
    code?: unknown;
    message?: unknown;
    req_1?: {
      data?: {
        body?: {
          song?: {
            list?: QqSearchSongLike[];
            totalnum?: unknown;
          };
        };
        meta?: {
          nextpage?: unknown;
        };
      };
    };
  };

  if (raw.code !== 0) {
    throw new Error(typeof raw.message === "string" ? raw.message : "Search failed");
  }

  const songNode = raw.req_1?.data?.body?.song;
  const list = Array.isArray(songNode?.list) ? songNode.list : [];
  const total = typeof songNode?.totalnum === "number" ? songNode.totalnum : list.length;
  const nextPage = raw.req_1?.data?.meta?.nextpage;
  const hasMore = (typeof nextPage === "number" && nextPage > 0) || offset + list.length < total;

  return {
    songs: mapSongs(list),
    total,
    hasMore,
  };
}
