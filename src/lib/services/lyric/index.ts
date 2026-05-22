import type { LyricData, MusicPlatform } from "@/lib/models/music";
import { getNeteaseMusicUList } from "@/lib/env/netease-music-u";
import { NeteaseServicePool } from "@/lib/services/netease-service";
import { qqLyric } from "@/lib/services/platforms/qqmusic/module/lyric";

export const LYRIC_PLATFORMS: MusicPlatform[] = ["qq", "netease"];

export async function getLyricByPlatform(
  platform: MusicPlatform,
  songId: string
): Promise<LyricData> {
  const id = (songId || "").trim();
  if (!id) throw new Error("Invalid or missing id");

  if (platform === "qq") {
    return await qqLyric({ id });
  }

  if (platform === "netease") {
    const musicUList = getNeteaseMusicUList();
    if (musicUList.length === 0) throw new Error("Netease service not configured");

    const service = new NeteaseServicePool(musicUList);
    return await service.getLyric(id);
  }

  throw new Error("Unsupported platform for lyric");
}
