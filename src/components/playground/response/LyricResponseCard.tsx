"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Music2 } from "lucide-react";
import type { LyricBlock, LyricData, MusicPlatform } from "@/lib/models/music";

type Props = {
  data: LyricData | null;
  getPlatformLabel: (platform: MusicPlatform) => string;
};

type AuxMode = "none" | "tlyric" | "romalrc";

type TimedLyricLine = {
  id: string;
  time: number | null;
  text: string;
};

const META_TAG_RE = /^\[(ar|ti|al|by|offset|length|tool|re|ve):.*\]$/i;
const TIME_TAG_RE = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

function parseTime(minute: string, second: string, fraction = "0") {
  const base = (Number.parseInt(minute, 10) * 60 + Number.parseInt(second, 10)) * 1000;
  const ms =
    fraction.length === 1
      ? Number.parseInt(fraction, 10) * 100
      : fraction.length === 2
        ? Number.parseInt(fraction, 10) * 10
        : Number.parseInt(fraction.padEnd(3, "0").slice(0, 3), 10);
  return base + ms;
}

function parseTimedLrc(raw: string): TimedLyricLine[] {
  const lines: TimedLyricLine[] = [];

  raw.split(/\r?\n/).forEach((line, lineIndex) => {
    const trimmed = line.trim();
    if (!trimmed || META_TAG_RE.test(trimmed)) return;

    const matches = [...trimmed.matchAll(TIME_TAG_RE)];
    const text = trimmed.replace(TIME_TAG_RE, "").trim();
    if (!text) return;

    if (matches.length === 0) {
      lines.push({ id: `${lineIndex}-plain`, time: null, text });
      return;
    }

    matches.forEach((match, matchIndex) => {
      lines.push({
        id: `${lineIndex}-${matchIndex}`,
        time: parseTime(match[1], match[2], match[3]),
        text,
      });
    });
  });

  return lines.sort((a, b) => {
    if (a.time === null && b.time === null) return 0;
    if (a.time === null) return 1;
    if (b.time === null) return -1;
    return a.time - b.time;
  });
}

function buildAuxMap(block: LyricBlock | null | undefined) {
  const map = new Map<number, string>();
  parseTimedLrc(block?.lyric || "").forEach((line) => {
    if (line.time !== null && line.text) {
      map.set(line.time, line.text);
    }
  });
  return map;
}

function hasLyric(block: LyricBlock | null | undefined) {
  return Boolean(block?.lyric?.trim());
}

export default function LyricResponseCard({ data, getPlatformLabel }: Props) {
  const [auxMode, setAuxMode] = useState<AuxMode>("none");
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);

  const rawLyric = data?.lrc?.lyric || "";
  const lines = useMemo(() => parseTimedLrc(rawLyric), [rawLyric]);
  const tlyricMap = useMemo(() => buildAuxMap(data?.tlyric), [data?.tlyric]);
  const romalrcMap = useMemo(() => buildAuxMap(data?.romalrc), [data?.romalrc]);
  const canUseTlyric = hasLyric(data?.tlyric);
  const canUseRomalrc = hasLyric(data?.romalrc);

  useEffect(() => {
    if (auxMode === "tlyric" && !canUseTlyric) setAuxMode("none");
    if (auxMode === "romalrc" && !canUseRomalrc) setAuxMode("none");
  }, [auxMode, canUseRomalrc, canUseTlyric]);

  useEffect(() => {
    setActiveIndex(0);
    viewportRef.current?.scrollTo({ top: 0 });
  }, [rawLyric]);

  function updateActiveLine() {
    const viewport = viewportRef.current;
    if (!viewport || lineRefs.current.length === 0) return;

    const viewportRect = viewport.getBoundingClientRect();
    const center = viewportRect.top + viewportRect.height / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    lineRefs.current.forEach((node, index) => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  }

  function getAuxText(line: TimedLyricLine) {
    if (line.time === null || auxMode === "none") return "";
    if (auxMode === "tlyric") return tlyricMap.get(line.time) || "";
    return romalrcMap.get(line.time) || "";
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-600">
        <p className="text-sm">无法解析歌词数据。</p>
      </div>
    );
  }

  return (
    <div className="grid h-full max-h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_14rem] gap-4 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(360px,42%)] lg:grid-rows-1">
      <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="shrink-0 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Music2 className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
                Lyric
              </p>
              <h3 className="truncate font-mono text-lg font-bold text-zinc-950 dark:text-zinc-50">
                {data.songid}
              </h3>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 lg:ml-auto">
              {getPlatformLabel(data.platform)}
            </span>
          </div>

          <div className="mt-4 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950/70">
            <button
              type="button"
              onClick={() => setAuxMode("none")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                auxMode === "none"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              仅原文
            </button>
            <button
              type="button"
              disabled={!canUseTlyric}
              onClick={() => setAuxMode("tlyric")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                auxMode === "tlyric"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              原文 + 翻译
            </button>
            <button
              type="button"
              disabled={!canUseRomalrc}
              onClick={() => setAuxMode("romalrc")}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                auxMode === "romalrc"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:bg-white hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              }`}
            >
              原文 + 罗马音
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          onScroll={updateActiveLine}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6"
        >
          <div className="pointer-events-none sticky top-1/2 z-0 h-px -translate-y-1/2 bg-cyan-400/40" />
          {lines.length > 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-[34vh] text-center">
              {lines.map((line, index) => {
                const active = index === activeIndex;
                const auxText = getAuxText(line);

                return (
                  <div
                    key={line.id}
                    ref={(node) => {
                      lineRefs.current[index] = node;
                    }}
                    className={`w-full transition-all duration-200 ${
                      active ? "scale-105 opacity-100" : "scale-100 opacity-45"
                    }`}
                  >
                    <p
                      className={`font-semibold leading-9 transition-all duration-200 ${
                        active
                          ? "text-2xl text-zinc-950 dark:text-zinc-50"
                          : "text-lg text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {line.text}
                    </p>
                    {auxText ? (
                      <p
                        className={`mt-1 leading-6 transition-all duration-200 ${
                          active
                            ? "text-base font-medium text-cyan-700 dark:text-cyan-300"
                            : "text-sm text-zinc-400 dark:text-zinc-500"
                        }`}
                      >
                        {auxText}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-600">
              当前歌曲没有返回可展示的歌词。
            </div>
          )}
        </div>
      </section>

      <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 shadow-sm dark:border-zinc-800">
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-5 py-4">
          <FileText className="h-4 w-4 text-cyan-400" />
          <h4 className="text-sm font-semibold text-zinc-100">LRC 源文件</h4>
          <span className="ml-auto text-xs text-zinc-500">version {data.lrc?.version ?? 0}</span>
        </div>
        <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-5 font-mono text-xs leading-6 text-zinc-300">
          {rawLyric || "当前响应中没有 lrc.lyric 内容。"}
        </pre>
      </section>
    </div>
  );
}
