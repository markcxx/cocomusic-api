import type { MusicPlatform } from "@/lib/models/music";

export interface SearchSongItem {
  songid: string;
  mid: string | null;
  name: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  duration: number | null;
  platform: MusicPlatform;
}

export interface SearchData {
  keyword: string;
  platform: MusicPlatform;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  items: SearchSongItem[];
}
