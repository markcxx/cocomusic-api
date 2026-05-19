import type { MusicPlatform } from "@/lib/models/music";

export interface SongDetailData {
  songid: string;
  name: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  duration: number | null;
  platform: MusicPlatform;
}
