"use client";

import { Search } from "lucide-react";
import type { MusicPlatform } from "@/lib/models/music";
import { platforms, searchPlatforms } from "@/components/playground/constants";
import PlatformDropdown from "@/components/playground/PlatformDropdown";

type Props = {
  platform: MusicPlatform;
  keyword: string;
  limit: string;
  offset: string;
  onPlatformChange: (value: MusicPlatform) => void;
  onKeywordChange: (value: string) => void;
  onLimitChange: (value: string) => void;
  onOffsetChange: (value: string) => void;
};

export default function SearchEndpointPanel({
  platform,
  keyword,
  limit,
  offset,
  onPlatformChange,
  onKeywordChange,
  onLimitChange,
  onOffsetChange,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          搜索关键词 <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">当前已接入 QQ 音乐和网易云音乐的歌曲搜索。</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="输入歌曲名、歌手名或关键词..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Limit</label>
          <input
            type="number"
            min="1"
            max="30"
            value={limit}
            onChange={(event) => onLimitChange(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Offset</label>
          <input
            type="number"
            min="0"
            value={offset}
            onChange={(event) => onOffsetChange(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition-all focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <PlatformDropdown
        label="目标平台"
        value={platform}
        options={platforms}
        onChange={onPlatformChange}
        isDisabled={(value) => !searchPlatforms.includes(value)}
        helperText="搜索结果支持直接回填到原链解析或歌曲详情。"
      />
    </>
  );
}
