import type { LyricData } from "@/lib/models/music";
import { qqSongMusicDetail } from "@/lib/services/platforms/qqmusic/module/song_music_detail";

interface QqLyricQuery {
  id?: string;
  mid?: string;
}

interface QqLyricResponse {
  code?: unknown;
  lyric?: unknown;
  trans?: unknown;
}

function looksLikeNumericId(value: string) {
  return /^\d+$/.test(value);
}

async function resolveSongMid(query: QqLyricQuery): Promise<string> {
  const directMid = (query.mid || "").trim();
  if (directMid) return directMid;

  const id = (query.id || "").trim();
  if (!id) throw new Error("Invalid or missing id");

  if (!looksLikeNumericId(id)) return id;

  const detail = await qqSongMusicDetail({ id });
  const song = detail.songs?.[0];
  const mid = song?.mid;
  if (typeof mid !== "string" || !mid) {
    throw new Error("Song not found");
  }
  return mid;
}

export async function qqLyric(query: QqLyricQuery): Promise<LyricData> {
  const songMid = await resolveSongMid(query);
  const url = new URL("https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg");
  url.searchParams.set("songmid", songMid);
  url.searchParams.set("g_tk", "5381");
  url.searchParams.set("format", "json");
  url.searchParams.set("inCharset", "utf8");
  url.searchParams.set("outCharset", "utf-8");
  url.searchParams.set("nobase64", "1");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        Referer: "https://y.qq.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Upstream service unavailable");
    }

    const data = (await response.json()) as QqLyricResponse;
    if (typeof data.code === "number" && data.code !== 0) {
      throw new Error("Lyric not found");
    }

    const lyric = typeof data.lyric === "string" ? data.lyric : "";
    const trans = typeof data.trans === "string" ? data.trans.replace(/\/\//g, "") : "";

    return {
      songid: songMid,
      platform: "qq",
      lrc: { version: 0, lyric },
      tlyric: trans ? { version: 0, lyric: trans } : null,
      klyric: null,
      romalrc: null,
      yrc: null,
      ytlrc: null,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
