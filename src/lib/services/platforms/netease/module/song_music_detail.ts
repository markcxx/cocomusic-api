import { NeteaseService } from "@/lib/services/netease-service";

export async function neteaseSongMusicDetail(id: string): Promise<Record<string, unknown>> {
  const songIdNum = parseInt(id, 10);
  if (isNaN(songIdNum)) throw new Error("Invalid song id");

  const service = new NeteaseService("");
  return await service.getSongDetail([songIdNum]);
}
