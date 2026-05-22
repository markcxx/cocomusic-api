export const SERVICE_NAME = "coco音乐";

export type MusicPlatform = "qq" | "kugou" | "kuwo" | "migu" | "netease";

export type MiguQuality =
  | "LQ"
  | "PQ"
  | "HQ"
  | "SQ"
  | "ZQ"

export type NeteaseQuality =
  | "standard"
  | "higher"
  | "exhigh"
  | "lossless"
  | "hires"

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
  size?: number | null;
  bitrate?: number | null;
}

export interface LyricBlock {
  version: number;
  lyric: string;
}

export interface LyricData {
  songid: string;
  platform: MusicPlatform;
  lrc: LyricBlock;
  tlyric?: LyricBlock | null;
  klyric?: LyricBlock | null;
  romalrc?: LyricBlock | null;
  yrc?: LyricBlock | null;
  ytlrc?: LyricBlock | null;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  service: string;
  data: T | null;
}
