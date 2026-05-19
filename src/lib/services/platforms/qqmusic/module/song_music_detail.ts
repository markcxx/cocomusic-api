import { qqSongDetail } from "@/lib/services/platforms/qqmusic/module/song_detail";

interface QqMusicDetailQuery {
  mid?: string;
  id?: string;
  uin?: number;
  qm_keyst?: string;
}

export async function qqSongMusicDetail(query: QqMusicDetailQuery) {
  if (query.mid) {
    const infoUrl = `https://music-dl.sayqz.com/api/?type=info&source=qq&id=${encodeURIComponent(query.mid)}`;
    const response = await fetch(infoUrl);
    if (!response.ok) {
      throw new Error("Invalid response from sayqz api");
    }
    const raw = (await response.json()) as { data?: Record<string, unknown> };
    const d = raw.data;
    if (!d) throw new Error("Invalid response from sayqz api");

    return {
      songs: [
        {
          id: null,
          mid: query.mid,
          name: d.name,
          ar: [{ id: null, name: d.artist }],
          al: { id: 0, name: d.album, picUrl: d.pic },
          dt: 0,
          mv: 0,
          fee: 0,
          alia: [],
          platform: "qqmusic",
          lrc: d.lrc,
        },
      ],
      count: 1,
    };
  }

  return qqSongDetail({
    id: query.id,
    uin: query.uin,
    qm_keyst: query.qm_keyst,
  });
}
