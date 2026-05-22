"use client";

import type { ChangeEvent, MouseEvent, RefObject } from "react";
import { Download, Hash, Pause, Play, Volume2 } from "lucide-react";
import type { MusicPlatform } from "@/lib/models/music";
import type { EndpointId, SongData } from "@/components/playground/types";

type Props = {
  endpoint: Exclude<EndpointId, "search" | "lyric">;
  platform: MusicPlatform;
  songData: SongData | null;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  progressRef: RefObject<HTMLDivElement | null>;
  getPlatformLabel: (platform: MusicPlatform) => string;
  formatTime: (seconds: number) => string;
  formatDuration: (ms: number | null | undefined) => string;
  onProgressClick: (event: MouseEvent<HTMLDivElement>) => void;
  onPlayPause: () => void;
  onDownload: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function SongResponseCard({
  endpoint,
  platform,
  songData,
  progress,
  currentTime,
  duration,
  volume,
  isPlaying,
  progressRef,
  getPlatformLabel,
  formatTime,
  formatDuration,
  onProgressClick,
  onPlayPause,
  onDownload,
  onVolumeChange,
}: Props) {
  if (!songData) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
        <p className="text-sm">无法解析歌曲数据。</p>
      </div>
    );
  }

  if (endpoint === "detail") {
    return (
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-72 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {songData.cover ? (
            <img src={songData.cover} alt={songData.name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                <Volume2 className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 p-6">
          <div>
            <h3 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{songData.name}</h3>
            <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">{songData.artist}</p>
          </div>

          <div className="grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm dark:bg-zinc-950/70">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">歌曲 ID</span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">{songData.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">平台</span>
              <span className="text-zinc-900 dark:text-zinc-100">{getPlatformLabel(platform)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">专辑</span>
              <span className="truncate text-zinc-900 dark:text-zinc-100">{songData.album || "未知专辑"}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">时长</span>
              <span className="text-zinc-900 dark:text-zinc-100">{formatDuration(songData.duration)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 md:flex">
      <div className="relative h-72 bg-zinc-100 dark:bg-zinc-800 md:h-auto md:w-72">
        {songData.cover ? (
          <img src={songData.cover} alt={songData.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
              <Volume2 className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">Now Debugging</p>
          <h3 className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">{songData.name}</h3>
          <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">{songData.artist}</p>

          <div className="mt-5 grid gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span className="font-mono">{songData.id}</span>
            </div>
            <div>平台: {getPlatformLabel(platform)}</div>
            <div>专辑: {songData.album || "未知专辑"}</div>
          </div>
        </div>

        {songData.url ? (
          <div className="mt-8">
            <div
              ref={progressRef}
              onClick={onProgressClick}
              className="group relative h-1.5 w-full cursor-pointer rounded-full bg-zinc-200 dark:bg-zinc-700"
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-cyan-500 transition-all" style={{ width: `${progress * 100}%` }} />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-500 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
              />
            </div>

            <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onPlayPause}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 transition-colors hover:bg-cyan-600"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <button
                  onClick={onDownload}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={onVolumeChange}
                  className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-700
                    [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500
                    [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cyan-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            当前响应中没有可播放 URL。
          </div>
        )}
      </div>
    </div>
  );
}
