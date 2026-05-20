"use client";

import { Hash } from "lucide-react";
import type { MusicPlatform } from "@/lib/models/music";
import { detailPlatforms, platforms } from "@/components/playground/constants";
import PlatformDropdown from "@/components/playground/PlatformDropdown";

type Props = {
  platform: MusicPlatform;
  songId: string;
  onPlatformChange: (value: MusicPlatform) => void;
  onSongIdChange: (value: string) => void;
};

export default function DetailEndpointPanel({
  platform,
  songId,
  onPlatformChange,
  onSongIdChange,
}: Props) {
  const platformRuleText =
    platform === "qq"
      ? "当前平台为 QQ 音乐，歌曲详情这里请使用数字歌曲 ID，不是 `mid`。"
      : "当前平台为网易云音乐，请输入数字歌曲 ID。";

  return (
    <>
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          歌曲 ID <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{platformRuleText}</p>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={songId}
            onChange={(event) => onSongIdChange(event.target.value)}
            placeholder="输入歌曲 ID..."
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 font-mono text-sm text-zinc-900 shadow-sm outline-none transition-all placeholder:text-zinc-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      <PlatformDropdown
        label="目标平台"
        value={platform}
        options={platforms}
        onChange={onPlatformChange}
        isDisabled={(value) => !detailPlatforms.includes(value)}
        helperText="歌曲详情当前只开放 QQ 音乐与网易云音乐。"
      />
    </>
  );
}
