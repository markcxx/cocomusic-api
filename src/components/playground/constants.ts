import type { MusicPlatform } from "@/lib/models/music";
import type { EndpointConfig, PlatformOption } from "@/components/playground/types";

export const endpointConfigs: EndpointConfig[] = [
  {
    id: "url",
    label: "原链解析",
    desc: "获取真实音频播放地址，并支持试听与下载。",
    available: true,
  },
  {
    id: "detail",
    label: "歌曲详情",
    desc: "获取歌曲名称、歌手、封面、专辑与时长等信息。",
    available: true,
  },
  {
    id: "search",
    label: "综合搜索",
    desc: "按平台搜索歌曲，并在调试台中直接浏览标准音乐列表。",
    available: true,
  },
];

export const extensionEndpoints = [
  { id: "playlist", label: "歌单详情" },
  { id: "album", label: "专辑信息" },
  { id: "artist", label: "歌手详情" },
  { id: "comments", label: "歌曲评论" },
];

export const platforms: PlatformOption[] = [
  { id: "qq", label: "QQ 音乐" },
  { id: "kugou", label: "酷狗音乐" },
  { id: "kuwo", label: "酷我音乐" },
  { id: "migu", label: "咪咕音乐" },
  { id: "netease", label: "网易云音乐" },
];

export const detailPlatforms: MusicPlatform[] = ["qq", "netease"];
export const searchPlatforms: MusicPlatform[] = ["qq", "netease"];

export const miguQualities = [
  { value: "LQ", label: "LQ 标准音质" },
  { value: "PQ", label: "PQ 较高音质" },
  { value: "HQ", label: "HQ 高音质" },
  { value: "SQ", label: "SQ 无损 FLAC" },
  { value: "ZQ", label: "ZQ 臻品音质" },
] as const;

export const neteaseQualities = [
  { value: "standard", label: "Standard 128k" },
  { value: "higher", label: "Higher 192k" },
  { value: "exhigh", label: "Exhigh 320k" },
  { value: "lossless", label: "Lossless FLAC" },
  { value: "hires", label: "Hi-Res" },
] as const;
