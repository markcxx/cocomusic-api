import { getNeteaseMusicUList } from "@/lib/env/netease-music-u";
import { NeteaseServicePool } from "@/lib/services/netease-service";

export async function neteaseSongMusicDetail(id: string): Promise<Record<string, unknown>> {
  const musicUList = getNeteaseMusicUList();
  if (musicUList.length === 0) throw new Error("Netease service not configured");

  const songIdNum = parseInt(id, 10);
  if (isNaN(songIdNum)) throw new Error("Invalid song id");

  const service = new NeteaseServicePool(musicUList);
  return await service.getSongDetail([songIdNum]);
}
