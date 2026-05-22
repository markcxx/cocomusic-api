import type { MusicPlatform } from "@/lib/models/music";
import type { LyricData } from "@/lib/models/music";
import type { SearchData } from "@/lib/services/search/types";

export type EndpointId = "url" | "detail" | "lyric" | "search";
export type RequestStatus = "idle" | "loading" | "success" | "error";
export type ResponseTab = "card" | "json";

export type SongData = {
  name: string;
  artist: string;
  cover: string;
  id: string;
  url: string;
  album: string;
  duration: number | null;
};

export type EndpointConfig = {
  id: EndpointId;
  label: string;
  desc: string;
  available: boolean;
};

export type PlatformOption = {
  id: MusicPlatform;
  label: string;
};

export type SearchState = {
  keyword: string;
  limit: string;
  offset: string;
};

export type SongRequestState = {
  songId: string;
  platform: MusicPlatform;
  miguQuality: string;
  neteaseQuality: string;
};

export type VisualResponse =
  | {
      kind: "search";
      data: SearchData | null;
    }
  | {
      kind: "lyric";
      data: LyricData | null;
      platform: MusicPlatform;
    }
  | {
      kind: "song";
      data: SongData | null;
      platform: MusicPlatform;
      endpoint: Exclude<EndpointId, "search" | "lyric">;
    };
