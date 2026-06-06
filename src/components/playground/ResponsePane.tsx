"use client";

import type { ChangeEvent, MouseEvent, RefObject } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";
import type { SearchSongItem } from "@/lib/services/search/types";
import SearchResultsTable from "@/components/playground/response/SearchResultsTable";
import LyricResponseCard from "@/components/playground/response/LyricResponseCard";
import SongResponseCard from "@/components/playground/response/SongResponseCard";
import type { RequestStatus, ResponseTab, VisualResponse } from "@/components/playground/types";

type Props = {
  status: RequestStatus;
  requestTime: number;
  displayUrl: string;
  response: string;
  responseTab: ResponseTab;
  copiedUrl: boolean;
  copiedJson: boolean;
  copiedSongId: string;
  visualResponse: VisualResponse;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  progressRef: RefObject<HTMLDivElement | null>;
  onCopyUrl: () => void;
  onCopyJson: () => void;
  onTabChange: (value: ResponseTab) => void;
  onCopySongId: (songId: string) => void;
  onUseSearchItem: (item: SearchSongItem, endpoint: "url" | "detail" | "lyric") => void;
  onProgressClick: (event: MouseEvent<HTMLDivElement>) => void;
  onPlayPause: () => void;
  onDownload: () => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  getPlatformLabel: (platform: SearchSongItem["platform"]) => string;
  formatTime: (seconds: number) => string;
  formatDuration: (ms: number | null | undefined) => string;
  highlightJson: (json: string) => string;
};

export default function ResponsePane({
  status,
  requestTime,
  displayUrl,
  response,
  responseTab,
  copiedUrl,
  copiedJson,
  copiedSongId,
  visualResponse,
  progress,
  currentTime,
  duration,
  volume,
  isPlaying,
  progressRef,
  onCopyUrl,
  onCopyJson,
  onTabChange,
  onCopySongId,
  onUseSearchItem,
  onProgressClick,
  onPlayPause,
  onDownload,
  onVolumeChange,
  getPlatformLabel,
  formatTime,
  formatDuration,
  highlightJson,
}: Props) {
  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden bg-zinc-50 lg:w-[60%] dark:bg-[#0a0a0c]">
      <div className="border-b border-zinc-200 bg-white/50 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/30">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {status === "loading" ? <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> : null}
          {status === "success" ? <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" /> : null}
          {status === "error" ? <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> : null}
          {status === "idle" ? <span className="h-2 w-2 rounded-full bg-zinc-400" /> : null}
          Request URL
          {requestTime > 0 ? <span className="ml-auto font-mono text-[10px] text-zinc-400">{requestTime}ms</span> : null}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800/80 dark:bg-black">
          <code className="truncate text-xs font-mono text-zinc-700 dark:text-zinc-300 md:text-sm">{displayUrl}</code>
          <button
            onClick={onCopyUrl}
            className="ml-4 shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
          >
            {copiedUrl ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {response && status !== "loading" ? (
        <div className="px-4 pb-0 pt-3">
          <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => onTabChange("card")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                responseTab === "card"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              可视化
            </button>
            <button
              onClick={() => onTabChange("json")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                responseTab === "json"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              JSON
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 overflow-hidden p-4 md:p-6">
        {status === "idle" && !response ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
            <Send className="mb-4 h-10 w-10 opacity-30" />
            <p className="text-sm">点击“发送请求”查看响应结果。</p>
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
            <Loader2 className="mb-4 h-8 w-8 animate-spin" />
            <p className="text-sm">正在请求后端 API...</p>
          </div>
        ) : null}

        {response && status !== "loading" && responseTab === "json" ? (
          <div className="group/json relative h-full min-h-0 overflow-hidden rounded-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                onClick={onCopyJson}
                aria-label={copiedJson ? "已复制 JSON" : "复制 JSON"}
                title={copiedJson ? "已复制 JSON" : "复制 JSON"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/92 text-zinc-500 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-150 group-hover/json:opacity-100 group-focus-within/json:opacity-100 hover:bg-zinc-100 hover:text-zinc-900 focus:opacity-100 focus:outline-none dark:bg-zinc-900/92 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {copiedJson ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="h-full min-h-0 overflow-auto overscroll-contain rounded-2xl">
              <pre
                className="font-mono text-xs leading-loose text-zinc-700 dark:text-zinc-300 md:text-[13px]"
                dangerouslySetInnerHTML={{ __html: highlightJson(response) }}
              />
            </div>
          </div>
        ) : null}

        {response && status !== "loading" && responseTab === "card" ? (
          <div className="h-full min-h-0 overflow-hidden overscroll-contain">
            {visualResponse.kind === "search" ? (
              <SearchResultsTable
                data={visualResponse.data}
                copiedSongId={copiedSongId}
                getPlatformLabel={getPlatformLabel}
                formatDuration={formatDuration}
                onCopySongId={onCopySongId}
                onUseSearchItem={onUseSearchItem}
              />
            ) : visualResponse.kind === "lyric" ? (
              <div className="h-full min-h-0 overflow-hidden">
                <LyricResponseCard data={visualResponse.data} getPlatformLabel={getPlatformLabel} />
              </div>
            ) : (
              <div className="h-full min-h-0 overflow-auto overscroll-contain">
                <div className="flex min-h-full items-center justify-center">
                  <SongResponseCard
                    endpoint={visualResponse.endpoint}
                    platform={visualResponse.platform}
                    songData={visualResponse.data}
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    volume={volume}
                    isPlaying={isPlaying}
                    progressRef={progressRef}
                    getPlatformLabel={getPlatformLabel}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                    onProgressClick={onProgressClick}
                    onPlayPause={onPlayPause}
                    onDownload={onDownload}
                    onVolumeChange={onVolumeChange}
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
