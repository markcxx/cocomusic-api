export const SERVICE_NAME = "coco音乐";

export type MusicPlatform = "qq" | "kugou" | "kuwo" | "migu";

export type MiguQuality =
  | "LQ"
  | "PQ"
  | "HQ"
  | "SQ"
  | "ZQ"

export interface PlayInfoData {
  songid: string;
  name: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  lrc: string | null;
  url: string;
  link: string | null;
  type: string;
  quality?: string | null;
  platform: MusicPlatform;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  service: string;
  data: T | null;
}
