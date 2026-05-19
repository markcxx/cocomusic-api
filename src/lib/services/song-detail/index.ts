import type { MusicPlatform } from "@/lib/models/music";
import { neteaseSongMusicDetail } from "@/lib/services/platforms/netease/module/song_music_detail";
import { qqSongMusicDetail } from "@/lib/services/platforms/qqmusic/module/song_music_detail";
import type { SongDetailData } from "@/lib/services/song-detail/types";

export const DETAIL_PLATFORMS: MusicPlatform[] = ["qq", "netease"];

export async function getSongDetailByPlatform(
  platform: MusicPlatform,
  songId: string
): Promise<SongDetailData> {
  if (platform === "qq") {
    const result = await qqSongMusicDetail({ id: songId });
    const song = result.songs?.[0];
    if (!song) throw new Error("Song not found");

    return {
      songid: songId,
      name: typeof song.name === "string" ? song.name : null,
      artist:
        Array.isArray(song.ar) && song.ar.length > 0
          ? song.ar
              .map((x) => x?.name)
              .filter((x): x is string => typeof x === "string" && !!x)
              .join(", ") || null
          : null,
      album: song.al && typeof song.al.name === "string" ? song.al.name : null,
      cover: song.al && typeof song.al.picUrl === "string" ? song.al.picUrl : null,
      duration: typeof song.dt === "number" ? song.dt : null,
      platform: "qq",
    };
  }

  if (platform === "netease") {
    const detail = await neteaseSongMusicDetail(songId);
    const songs = detail.songs;
    if (!Array.isArray(songs) || songs.length === 0) throw new Error("Song not found");
    const song = songs[0] as Record<string, unknown>;
    const ar = song.ar;
    const al = song.al;
    const albumObj = al && typeof al === "object" ? (al as Record<string, unknown>) : null;

    return {
      songid: songId,
      name: typeof song.name === "string" ? song.name : null,
      artist: Array.isArray(ar)
        ? ar
            .map((a) => (a as Record<string, unknown>).name)
            .filter((name): name is string => typeof name === "string" && !!name)
            .join(", ") || null
        : null,
      album: albumObj && typeof albumObj.name === "string" ? albumObj.name : null,
      cover: albumObj && typeof albumObj.picUrl === "string" ? albumObj.picUrl : null,
      duration: typeof song.dt === "number" ? song.dt : null,
      platform: "netease",
    };
  }

  throw new Error("Unsupported platform for song_detail");
}
