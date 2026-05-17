import type { MusicPlatform, PlayInfoData } from "../models/music";

export class JianbinService {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(
    baseUrl = "https://www.jbsou.cn/",
    requestTimeoutMs = 30000
  ) {
    this.baseUrl = baseUrl;
    this.timeout = requestTimeoutMs;
    this.headers = {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      origin: "https://www.jbsou.cn",
      "x-requested-with": "XMLHttpRequest",
      referer: "https://www.jbsou.cn/",
    };
  }

  private toAbsoluteUrl(value: string): string {
    if (!value) return "";
    try {
      return new URL(value, this.baseUrl).toString();
    } catch {
      return value;
    }
  }

  private normalizeOptionalUrl(value: unknown): string | null {
    if (typeof value !== "string" || !value) return null;
    const absolute = this.toAbsoluteUrl(value);
    return absolute.startsWith("http") ? absolute : null;
  }

  private extractExt(url: string): string {
    if (!url) return "mp3";
    try {
      const parsed = new URL(url);
      const filename = parsed.pathname.split("/").pop() || "";
      if (filename.includes(".")) {
        const ext = filename.split(".").pop();
        if (ext) return ext;
      }
    } catch {}
    return "mp3";
  }

  private safeDecode(value: string): string {
    if (!value) return "";
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private normalizeIdToUrl(idStr: string): string {
    const value = (idStr || "").trim();
    if (!value) return "";
    const decodedOnce = value.includes("%") ? this.safeDecode(value) : value;
    const decoded = decodedOnce.includes("%")
      ? this.safeDecode(decodedOnce)
      : decodedOnce;
    return decoded.startsWith("http") ? decoded : "";
  }

  private async resolveFinalUrl(url: string): Promise<string> {
    if (!url) return "";
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      let response = await fetch(url, {
        method: "HEAD",
        headers: { "user-agent": this.headers["user-agent"] },
        redirect: "follow",
        signal: controller.signal,
      });
      if (response.status === 405) {
        clearTimeout(timer);
        const timer2 = setTimeout(() => controller.abort(), this.timeout);
        response = await fetch(url, {
          method: "GET",
          headers: { "user-agent": this.headers["user-agent"] },
          redirect: "follow",
          signal: controller.signal,
        });
        clearTimeout(timer2);
      }
      const finalUrl = response.url;
      return finalUrl.startsWith("http") ? finalUrl : url;
    } catch {
      return url;
    } finally {
      clearTimeout(timer);
    }
  }

  private async search(
    query: string,
    filter: string,
    platform: MusicPlatform
  ): Promise<Record<string, unknown>[]> {
    const value = (query || "").trim();
    if (!value) return [];

    const body = new URLSearchParams({
      input: value,
      filter,
      type: platform,
      page: "1",
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          ...this.headers,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        signal: controller.signal,
      });
      const raw = await response.json();
      const payload = this.normalizeSearchResponse(raw);
      const items = payload.data;
      if (!Array.isArray(items)) return [];
      return items.filter(
        (item): item is Record<string, unknown> =>
          item !== null && typeof item === "object"
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private pickFirstDownloadUrl(items: Record<string, unknown>[]): string {
    for (const item of items) {
      const rawUrl = item.url;
      if (typeof rawUrl !== "string" || !rawUrl) continue;
      return this.toAbsoluteUrl(rawUrl);
    }
    return "";
  }

  private pickFirstItem(
    items: Record<string, unknown>[]
  ): Record<string, unknown> | null {
    for (const item of items) {
      if (item && typeof item === "object") return item;
    }
    return null;
  }

  private normalizeSearchResponse(
    payload: unknown
  ): Record<string, unknown> {
    if (!payload) return {};
    if (typeof payload === "string") {
      try {
        return JSON.parse(payload);
      } catch {
        return {};
      }
    }
    if (typeof payload === "object" && !Array.isArray(payload)) {
      return payload as Record<string, unknown>;
    }
    return {};
  }

  async getPlayInfo(
    platform: MusicPlatform,
    idStr: string
  ): Promise<PlayInfoData> {
    const query = (idStr || "").trim();
    if (!query) throw new Error("Invalid id");

    const normalizedUrl = this.normalizeIdToUrl(query);
    let url: string;
    let item: Record<string, unknown> | null = null;

    if (normalizedUrl) {
      url = normalizedUrl;
    } else {
      const items = await this.search(query, "id", platform);
      item = this.pickFirstItem(items);
      url = this.pickFirstDownloadUrl(items);
    }

    if (!url) throw new Error("Song not found");

    const finalUrl = await this.resolveFinalUrl(url);

    let cover: string | null = null;
    let lrc: string | null = null;
    let link: string | null = null;
    let songid = query;

    if (item) {
      const songidValue = item.songid;
      if (typeof songidValue === "string" && songidValue) {
        songid = songidValue;
      }
      const coverUrl = this.normalizeOptionalUrl(item.cover);
      if (coverUrl) {
        cover = await this.resolveFinalUrl(coverUrl);
      }
      lrc = this.normalizeOptionalUrl(item.lrc);
      link = this.normalizeOptionalUrl(item.link);
    }

    if (!finalUrl.startsWith("http")) {
      throw new Error("Invalid play url");
    }

    let name: string | null = item?.name as string | null ?? null;
    let artist: string | null = item?.artist as string | null ?? null;
    let album: string | null = item?.album as string | null ?? null;
    if (typeof name !== "string" || !name) name = null;
    if (typeof artist !== "string" || !artist) artist = null;
    if (typeof album !== "string" || !album) album = null;

    return {
      songid,
      name,
      artist,
      album,
      cover,
      lrc,
      url: finalUrl,
      link,
      type: this.extractExt(finalUrl),
      platform,
    };
  }
}
