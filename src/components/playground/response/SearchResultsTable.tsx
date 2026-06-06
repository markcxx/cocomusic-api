"use client";

import type { ReactNode } from "react";
import { Copy, FileText, Link2, Music2, Volume2 } from "lucide-react";
import { lyricPlatforms } from "@/components/playground/constants";
import type { SearchData, SearchSongItem } from "@/lib/services/search/types";

type Props = {
  data: SearchData | null;
  copiedSongId: string;
  getPlatformLabel: (platform: SearchSongItem["platform"]) => string;
  formatDuration: (ms: number | null | undefined) => string;
  onCopySongId: (songId: string) => void;
  onUseSearchItem: (item: SearchSongItem, endpoint: "url" | "detail" | "lyric") => void;
};

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/action relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-transparent text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
    >
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 opacity-0 shadow-md transition-opacity duration-150 group-hover/action:opacity-100 dark:bg-zinc-900 dark:text-zinc-200">
        {label}
      </span>
    </button>
  );
}

export default function SearchResultsTable({
  data,
  copiedSongId,
  getPlatformLabel,
  formatDuration,
  onCopySongId,
  onUseSearchItem,
}: Props) {
  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
        <p className="text-sm">无法解析搜索结果。</p>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
              Search List
            </p>
            <h3 className="mt-2 text-xl font-bold text-zinc-950 dark:text-zinc-50">{data.keyword}</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {getPlatformLabel(data.platform)} · 共 {data.total} 首 · 当前 {data.items.length} 条 · Offset {data.offset}
            </p>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.hasMore ? "还有更多结果" : "当前已到最后一页"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[72px_minmax(220px,2.2fr)_minmax(140px,1.2fr)_minmax(170px,1.4fr)_80px_168px] gap-3 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div>封面</div>
        <div>歌曲名</div>
        <div>歌手</div>
        <div>专辑</div>
        <div>时长</div>
        <div>操作</div>
      </div>

      <div className="min-h-0 overflow-y-auto overscroll-contain">
        {data.items.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-sm text-zinc-500 dark:text-zinc-400">
            没有搜索到歌曲。
          </div>
        ) : (
          data.items.map((item, index) => (
            <div
              key={`${item.platform}-${item.songid}-${index}`}
              className="group grid grid-cols-[72px_minmax(220px,2.2fr)_minmax(140px,1.2fr)_minmax(170px,1.4fr)_80px_168px] items-center gap-3 border-b border-zinc-100 px-5 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950/60"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  {item.cover ? (
                    <img src={item.cover} alt={item.name ?? "song cover"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Volume2 className="h-5 w-5 text-zinc-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="truncate font-medium text-zinc-950 dark:text-zinc-50">{item.name ?? "未知歌曲"}</div>
                <div className="truncate text-xs text-zinc-400">
                  {item.platform === "qq" && item.mid ? `mid: ${item.mid}` : `id: ${item.songid}`}
                </div>
              </div>

              <div className="truncate text-sm text-zinc-600 dark:text-zinc-300">{item.artist ?? "未知歌手"}</div>
              <div className="truncate text-sm text-zinc-500 dark:text-zinc-400">{item.album ?? "未知专辑"}</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">{formatDuration(item.duration)}</div>

              <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                <ActionButton
                  icon={<Link2 className="h-4 w-4" />}
                  label="原链解析"
                  onClick={() => onUseSearchItem(item, "url")}
                />
                <ActionButton
                  icon={<FileText className="h-4 w-4" />}
                  label="歌曲详情"
                  onClick={() => onUseSearchItem(item, "detail")}
                />
                {lyricPlatforms.includes(item.platform) ? (
                  <ActionButton
                    icon={<Music2 className="h-4 w-4" />}
                    label="歌词获取"
                    onClick={() => onUseSearchItem(item, "lyric")}
                  />
                ) : null}
                <ActionButton
                  icon={<Copy className="h-4 w-4" />}
                  label={copiedSongId === item.songid ? "已复制" : "复制 ID"}
                  onClick={() => onCopySongId(item.songid)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
