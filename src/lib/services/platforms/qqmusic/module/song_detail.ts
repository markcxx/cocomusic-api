import { createRequest } from "@/lib/services/platforms/qqmusic/util/request";

interface QqSongDetailQuery {
  id?: string;
  ids?: string | string[];
  uin?: number;
  qm_keyst?: string;
}

interface QqSongLike {
  id?: unknown;
  mid?: unknown;
  name?: unknown;
  title?: unknown;
  singer?: Array<{ mid?: unknown; name?: unknown }>;
  album?: { id?: unknown; name?: unknown; mid?: unknown };
  interval?: unknown;
  mv?: { vid?: unknown };
  pay?: { pay_play?: unknown };
  subtitle?: unknown;
}

function formatSongs(tracks: QqSongLike[]) {
  return {
    songs: tracks.map((track) => ({
      id: track.id ?? null,
      mid: track.mid ?? null,
      name:
        (typeof track.name === "string" && track.name) ||
        (typeof track.title === "string" && track.title) ||
        null,
      ar: Array.isArray(track.singer)
        ? track.singer.map((s) => ({
            id: s.mid ?? null,
            name: (typeof s.name === "string" && s.name) || null,
          }))
        : [],
      al: {
        id: track.album?.id ?? 0,
        name: (typeof track.album?.name === "string" && track.album.name) || "",
        picUrl:
          typeof track.album?.mid === "string" && track.album.mid
            ? `https://y.gtimg.cn/music/photo_new/T002R300x300M000${track.album.mid}.jpg`
            : "",
      },
      dt: typeof track.interval === "number" ? track.interval * 1000 : 0,
      mv: track.mv?.vid ?? 0,
      fee: track.pay?.pay_play ?? 0,
      alia: [track.subtitle ?? ""],
      platform: "qqmusic",
    })),
    count: tracks.length,
  };
}

export async function qqSongDetail(query: QqSongDetailQuery) {
  const songIds = query.ids
    ? Array.isArray(query.ids)
      ? query.ids.map((id) => parseInt(id, 10))
      : query.ids.split(",").map((id) => parseInt(id, 10))
    : [parseInt(query.id || "", 10)];

  if (!songIds.length || songIds.some((n) => Number.isNaN(n))) {
    throw new Error("Invalid song id");
  }

  const data = {
    ids: songIds,
    types: songIds.map(() => 0),
  };

  const response = await createRequest(
    "music.trackInfo.UniformRuleCtrl",
    "CgiGetTrackInfo",
    data,
    {
      uin: query.uin || 0,
      qm_keyst: query.qm_keyst || "",
    }
  );

  const tracks = (response.body.tracks as QqSongLike[] | undefined) || [];
  if (!tracks.length) {
    throw new Error("No song data found");
  }
  return formatSongs(tracks);
}
