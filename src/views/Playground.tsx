"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { Loader2, Send } from "lucide-react";
import type { ApiResponse, LyricData, MusicPlatform } from "@/lib/models/music";
import type { SearchData, SearchSongItem } from "@/lib/services/search/types";
import { detailPlatforms, endpointConfigs, lyricPlatforms, searchPlatforms } from "@/components/playground/constants";
import EndpointSidebar from "@/components/playground/EndpointSidebar";
import UrlEndpointPanel from "@/components/playground/forms/UrlEndpointPanel";
import DetailEndpointPanel from "@/components/playground/forms/DetailEndpointPanel";
import LyricEndpointPanel from "@/components/playground/forms/LyricEndpointPanel";
import SearchEndpointPanel from "@/components/playground/forms/SearchEndpointPanel";
import ResponsePane from "@/components/playground/ResponsePane";
import type { EndpointId, RequestStatus, ResponseTab, SongData, VisualResponse } from "@/components/playground/types";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(ms: number | null | undefined) {
  if (!ms || !Number.isFinite(ms)) return "--:--";
  return formatTime(ms / 1000);
}

function parseApiResponse(raw: string): ApiResponse<unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiResponse<unknown>;
  } catch {
    return null;
  }
}

function extractSongData(data: unknown, fallbackId: string): SongData | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  return {
    name: typeof record.name === "string" ? record.name : typeof record.songName === "string" ? record.songName : "未知歌曲",
    artist: typeof record.artist === "string" ? record.artist : typeof record.singer === "string" ? record.singer : "未知歌手",
    cover:
      typeof record.cover === "string"
        ? record.cover
        : typeof record.pic === "string"
          ? record.pic
          : typeof record.album === "object" &&
              record.album &&
              typeof (record.album as Record<string, unknown>).picUrl === "string"
            ? ((record.album as Record<string, unknown>).picUrl as string)
            : "",
    id:
      typeof record.songid === "string"
        ? record.songid
        : typeof record.id === "string"
          ? record.id
          : fallbackId,
    url: typeof record.url === "string" ? record.url : typeof record.playUrl === "string" ? record.playUrl : "",
    album: typeof record.album === "string" ? record.album : "",
    duration: typeof record.duration === "number" ? record.duration : null,
  };
}

function extractSearchData(data: unknown): SearchData | null {
  if (!data || typeof data !== "object") return null;
  const record = data as SearchData;
  return Array.isArray(record.items) ? record : null;
}

function extractLyricData(data: unknown): LyricData | null {
  if (!data || typeof data !== "object") return null;
  const record = data as LyricData;
  return record.lrc && typeof record.lrc.lyric === "string" ? record : null;
}

function highlightJson(json: string) {
  return json
    .replace(/"(.*?)"(?=\s*:)/g, '<span class="font-medium text-pink-600 dark:text-pink-400">"$1"</span>')
    .replace(/:\s*"(.*?)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
    .replace(/:\s*(\d+)/g, ': <span class="text-blue-600 dark:text-blue-400">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="italic text-zinc-400">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>');
}

export default function Playground() {
  const [endpoint, setEndpoint] = useState<EndpointId>("url");
  const [platform, setPlatform] = useState<MusicPlatform>("qq");
  const [songId, setSongId] = useState("001yS0N33yPm1B");
  const [keyword, setKeyword] = useState("周杰伦");
  const [limit, setLimit] = useState("12");
  const [offset, setOffset] = useState("0");
  const [miguQuality, setMiguQuality] = useState("SQ");
  const [neteaseQuality, setNeteaseQuality] = useState("exhigh");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [requestTime, setRequestTime] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSongId, setCopiedSongId] = useState("");
  const [responseTab, setResponseTab] = useState<ResponseTab>("card");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const progressRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentEndpoint = endpointConfigs.find((item) => item.id === endpoint) ?? endpointConfigs[0];
  const parsedResponse = parseApiResponse(response);
  const visualResponse: VisualResponse =
    endpoint === "search"
      ? {
          kind: "search",
          data: parsedResponse?.code === 200 ? extractSearchData(parsedResponse.data) : null,
        }
      : endpoint === "lyric"
        ? {
            kind: "lyric",
            data: parsedResponse?.code === 200 ? extractLyricData(parsedResponse.data) : null,
            platform,
          }
      : {
          kind: "song",
          data: parsedResponse?.code === 200 ? extractSongData(parsedResponse.data, songId) : null,
          endpoint,
          platform,
        };

  useEffect(() => {
    if (endpoint === "detail" && !detailPlatforms.includes(platform)) {
      setPlatform("qq");
    }
    if (endpoint === "lyric" && !lyricPlatforms.includes(platform)) {
      setPlatform("qq");
    }
    if (endpoint === "search" && !searchPlatforms.includes(platform)) {
      setPlatform("qq");
    }
  }, [endpoint, platform]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = "";
    audioRef.current = null;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [response, platform, endpoint]);

  function getPlatformLabel(value: MusicPlatform) {
    if (value === "qq") return "QQ 音乐";
    if (value === "kugou") return "酷狗音乐";
    if (value === "kuwo") return "酷我音乐";
    if (value === "migu") return "咪咕音乐";
    if (value === "netease") return "网易云音乐";
    return value;
  }

  function getRequestUrl() {
    if (endpoint === "url") {
      let url = `/v1/music/song_url?platform=${platform}&id=${encodeURIComponent(songId.trim())}`;
      if (platform === "migu") {
        url += `&quality=${miguQuality}`;
      } else if (platform === "netease") {
        url += `&quality=${neteaseQuality}`;
      }
      return url;
    }

    if (endpoint === "detail") {
      return `/v1/music/song_detail?platform=${platform}&id=${encodeURIComponent(songId.trim())}`;
    }

    if (endpoint === "lyric") {
      return `/v1/lyric?platform=${platform}&id=${encodeURIComponent(songId.trim())}`;
    }

    return `/v1/search?platform=${platform}&q=${encodeURIComponent(keyword.trim())}&limit=${encodeURIComponent(limit || "12")}&offset=${encodeURIComponent(offset || "0")}`;
  }

  function canSubmit() {
    if (endpoint === "detail") {
      return songId.trim().length > 0 && detailPlatforms.includes(platform);
    }
    if (endpoint === "search") {
      return keyword.trim().length > 0 && searchPlatforms.includes(platform);
    }
    if (endpoint === "lyric") {
      return songId.trim().length > 0 && lyricPlatforms.includes(platform);
    }
    return songId.trim().length > 0;
  }

  async function handleSendRequest() {
    if (!canSubmit()) return;

    setStatus("loading");
    setResponse("");
    setResponseTab("card");

    const startedAt = Date.now();
    try {
      const res = await fetch(getRequestUrl());
      const data = (await res.json()) as ApiResponse<unknown>;
      setRequestTime(Date.now() - startedAt);
      setResponse(JSON.stringify(data, null, 2));
      setStatus(data.code === 200 ? "success" : "error");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setRequestTime(Date.now() - startedAt);
      setResponse(
        JSON.stringify(
          {
            code: 500,
            message: `请求失败: ${message}`,
            service: "frontend",
            data: null,
          },
          null,
          2
        )
      );
      setStatus("error");
    }
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(getRequestUrl());
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2000);
  }

  function handleCopyJson() {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopiedJson(true);
    window.setTimeout(() => setCopiedJson(false), 2000);
  }

  function handleCopySongId(nextSongId: string) {
    navigator.clipboard.writeText(nextSongId);
    setCopiedSongId(nextSongId);
    window.setTimeout(() => setCopiedSongId(""), 2000);
  }

  function handleUseSearchItem(item: SearchSongItem, nextEndpoint: "url" | "detail" | "lyric") {
    setPlatform(item.platform);
    const nextSongId =
      (nextEndpoint === "url" || nextEndpoint === "lyric") && item.platform === "qq" && item.mid
        ? item.mid
        : item.songid;
    setSongId(nextSongId);
    setEndpoint(nextEndpoint);
    setResponseTab("card");
  }

  function getAudioUrl() {
    if (visualResponse.kind !== "song" || !visualResponse.data?.url) return "";
    return platform === "netease"
      ? `/api/proxy?url=${encodeURIComponent(visualResponse.data.url)}`
      : visualResponse.data.url;
  }

  function handlePlayPause() {
    if (visualResponse.kind !== "song" || !visualResponse.data) return;

    const audioUrl = getAudioUrl();
    if (!audioUrl) return;

    const canReuseAudio =
      audioRef.current &&
      ((platform === "netease" && audioRef.current.src.includes("/api/proxy")) ||
        (platform !== "netease" && audioRef.current.src === audioUrl));

    if (!canReuseAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(audioUrl);
      audio.preload = "metadata";
      audio.volume = volume;

      audio.addEventListener("loadedmetadata", () => {
        if (audioRef.current === audio) {
          setDuration(audio.duration);
        }
      });
      audio.addEventListener("timeupdate", () => {
        if (audioRef.current === audio && Number.isFinite(audio.duration) && audio.duration > 0) {
          setCurrentTime(audio.currentTime);
          setProgress(audio.currentTime / audio.duration);
        }
      });
      audio.addEventListener("ended", () => {
        if (audioRef.current === audio) {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }
      });
      audio.addEventListener("error", () => {
        if (audioRef.current === audio) {
          setIsPlaying(false);
        }
      });

      audioRef.current = audio;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    if (isPlaying) {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;
      currentAudio.pause();
      setIsPlaying(false);
      return;
    }

    const currentAudio = audioRef.current;
    if (!currentAudio) return;
    currentAudio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }

  function handleProgressClick(event: MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !progressRef.current || !Number.isFinite(audioRef.current.duration) || audioRef.current.duration === 0) {
      return;
    }

    const rect = progressRef.current.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
    setProgress(percentage);
    setCurrentTime(audioRef.current.currentTime);
  }

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = Number.parseFloat(event.target.value);
    setVolume(nextValue);
    if (audioRef.current) {
      audioRef.current.volume = nextValue;
    }
  }

  function handleDownload() {
    if (visualResponse.kind !== "song" || !visualResponse.data?.url) return;

    if (platform === "netease") {
      window.open(visualResponse.data.url, "_blank", "noopener,noreferrer");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = visualResponse.data.url;
    anchor.download = `${visualResponse.data.name} - ${visualResponse.data.artist}.mp3`;
    anchor.target = "_blank";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  return (
    <div className="flex h-[calc(100dvh-80px)] max-h-[calc(100dvh-80px)] flex-1 overflow-hidden bg-white dark:bg-zinc-950">
      <EndpointSidebar endpoint={endpoint} onChange={setEndpoint} />

      <main className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-row">
        <div className="h-full min-h-0 w-full overflow-y-auto border-r border-zinc-200 bg-white lg:w-[40%] dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-8 p-6 md:p-8">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">{currentEndpoint.label}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{currentEndpoint.desc}</p>
            </div>

            <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800/50" />

            {endpoint === "url" ? (
              <UrlEndpointPanel
                platform={platform}
                songId={songId}
                miguQuality={miguQuality}
                neteaseQuality={neteaseQuality}
                onPlatformChange={setPlatform}
                onSongIdChange={setSongId}
                onMiguQualityChange={setMiguQuality}
                onNeteaseQualityChange={setNeteaseQuality}
              />
            ) : null}

            {endpoint === "detail" ? (
              <DetailEndpointPanel
                platform={platform}
                songId={songId}
                onPlatformChange={setPlatform}
                onSongIdChange={setSongId}
              />
            ) : null}

            {endpoint === "search" ? (
              <SearchEndpointPanel
                platform={platform}
                keyword={keyword}
                limit={limit}
                offset={offset}
                onPlatformChange={setPlatform}
                onKeywordChange={setKeyword}
                onLimitChange={setLimit}
                onOffsetChange={setOffset}
              />
            ) : null}

            {endpoint === "lyric" ? (
              <LyricEndpointPanel
                platform={platform}
                songId={songId}
                onPlatformChange={setPlatform}
                onSongIdChange={setSongId}
              />
            ) : null}

            <div className="pt-8">
              <button
                onClick={handleSendRequest}
                disabled={!canSubmit() || status === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:bg-cyan-500 dark:hover:bg-cyan-400"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    请求中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    发送请求
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <ResponsePane
          status={status}
          requestTime={requestTime}
          displayUrl={`GET ${getRequestUrl()}`}
          response={response}
          responseTab={responseTab}
          copiedUrl={copiedUrl}
          copiedJson={copiedJson}
          copiedSongId={copiedSongId}
          visualResponse={visualResponse}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isPlaying={isPlaying}
          progressRef={progressRef}
          onCopyUrl={handleCopyUrl}
          onCopyJson={handleCopyJson}
          onTabChange={setResponseTab}
          onCopySongId={handleCopySongId}
          onUseSearchItem={handleUseSearchItem}
          onProgressClick={handleProgressClick}
          onPlayPause={handlePlayPause}
          onDownload={handleDownload}
          onVolumeChange={handleVolumeChange}
          getPlatformLabel={getPlatformLabel}
          formatTime={formatTime}
          formatDuration={formatDuration}
          highlightJson={highlightJson}
        />
      </main>
    </div>
  );
}
