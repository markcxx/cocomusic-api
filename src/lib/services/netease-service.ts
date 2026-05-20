import type { MusicPlatform, PlayInfoData, NeteaseQuality } from "../models/music";
import { createHash, createCipheriv, createDecipheriv } from "crypto";

export class NeteaseCrypto {
  private static readonly EAPI_KEY = "e82ckenh8dichen8";

  static eapiEncrypt(uri: string, data: Record<string, unknown>): { params: string } {
    const text = JSON.stringify(data);
    const message = `nobody${uri}use${text}md5forencrypt`;
    const digest = createHash("md5").update(message, "utf-8").digest("hex");
    const dataStr = `${uri}-36cd479b6b5-${text}-36cd479b6b5-${digest}`;

    const cipher = createCipheriv("aes-128-ecb", Buffer.from(this.EAPI_KEY, "utf-8"), Buffer.alloc(0));
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([
      cipher.update(dataStr, "utf-8"),
      cipher.final()
    ]);

    return { params: encrypted.toString("hex").toUpperCase() };
  }

  static eapiResDecrypt(data: Buffer): Record<string, unknown> {
    const decipher = createDecipheriv("aes-128-ecb", Buffer.from(this.EAPI_KEY, "utf-8"), Buffer.alloc(0));
    decipher.setAutoPadding(true);
    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final()
    ]);
    const text = decrypted.toString("utf-8");
    return JSON.parse(text);
  }
}

export class NeteaseService {
  private static readonly API_DOMAIN = "https://interface.music.163.com";
  private static readonly DEFAULT_HEADER = {
    os: "pc",
    appver: "3.1.19.204510",
    requestId: "0",
    osver: "Microsoft-Windows-11-Home-China-build-22631-64bit"
  };
  private static readonly DEFAULT_UA = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteasyMusicDesktop/3.1.19.204510";

  private musicU: string;
  private deviceId: string;
  private timeout: number;

  constructor(musicU: string, requestTimeoutMs = 15000) {
    this.musicU = musicU;
    this.deviceId = this.generateDeviceId();
    this.timeout = requestTimeoutMs;
  }

  private generateDeviceId(): string {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private buildCookieHeader(): string {
    const cookieDict: Record<string, string> = {
      ...NeteaseService.DEFAULT_HEADER,
      deviceId: this.deviceId,
      MUSIC_U: this.musicU
    };

    const cookies: string[] = [];
    for (const [key, value] of Object.entries(cookieDict)) {
      if (value) {
        cookies.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return cookies.join("; ");
  }

  private buildRequestHeader(): Record<string, unknown> {
    return {
      ...NeteaseService.DEFAULT_HEADER,
      deviceId: this.deviceId,
      MUSIC_U: this.musicU
    };
  }

  private async makeRequest(uri: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const url = `${NeteaseService.API_DOMAIN}/eapi${uri.slice(4)}`;

    const headers = {
      "User-Agent": NeteaseService.DEFAULT_UA,
      "Cookie": this.buildCookieHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    };

    const requestHeader = this.buildRequestHeader();
    const eapiData = {
      header: requestHeader,
      e_r: true,
      ...data
    };

    const encrypted = NeteaseCrypto.eapiEncrypt(uri, eapiData);
    const body = new URLSearchParams(encrypted).toString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal
      });

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        return await response.json();
      }

      const buffer = await response.arrayBuffer();
      return NeteaseCrypto.eapiResDecrypt(Buffer.from(buffer));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  async getSongDetail(songIds: number[]): Promise<Record<string, unknown>> {
    const data = {
      c: JSON.stringify(songIds.map(id => ({ id })))
    };

    const url = `https://music.163.com/api/v3/song/detail`;
    const headers = {
      "User-Agent": NeteaseService.DEFAULT_UA,
      "Cookie": this.buildCookieHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: new URLSearchParams(data).toString(),
        signal: controller.signal
      });

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async searchSongs(
    keywords: string,
    limit = 20,
    offset = 0
  ): Promise<Record<string, unknown>> {
    const data = {
      s: keywords,
      type: 1,
      limit,
      offset,
      total: true,
    };

    return await this.makeRequest("/api/cloudsearch/pc", data);
  }

  async getSongUrl(
    songIds: number[],
    level: NeteaseQuality = "exhigh",
    encodeType: string = "flac"
  ): Promise<Record<string, unknown>> {
    const data = {
      ids: songIds,
      level,
      encodeType
    };

    return await this.makeRequest("/api/song/enhance/player/url/v1", data);
  }

  async getPlayInfo(
    songId: string,
    level?: NeteaseQuality | null
  ): Promise<PlayInfoData> {
    const id = parseInt(songId, 10);
    if (isNaN(id)) {
      throw new Error("Invalid id");
    }

    const quality = level || "exhigh";
    const encodeType = ["exhigh", "lossless", "hires"].includes(quality) ? "flac" : "mp3";

    // 并行请求歌曲详情和播放链接
    const [detailResult, urlResult] = await Promise.all([
      this.getSongDetail([id]),
      this.getSongUrl([id], quality, encodeType)
    ]);

    // 解析歌曲详情
    let name: string | null = null;
    let artist: string | null = null;
    let album: string | null = null;
    let cover: string | null = null;
    let duration: number | null = null;

    const songs = detailResult.songs;
    if (Array.isArray(songs) && songs.length > 0) {
      const song = songs[0] as Record<string, unknown>;

      // 歌曲名称
      name = song.name as string || null;

      // 歌手
      const ar = song.ar;
      if (Array.isArray(ar) && ar.length > 0) {
        const artists = ar.map((a: any) => a.name).filter(Boolean);
        artist = artists.join(", ") || null;
      }

      // 专辑
      const al = song.al;
      if (al && typeof al === "object") {
        const albumObj = al as Record<string, unknown>;
        album = albumObj.name as string || null;
        cover = albumObj.picUrl as string || null;
      }

      // 时长（毫秒）
      duration = song.dt as number || null;
    }

    // 解析播放链接
    const data = urlResult.data;
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Song not found");
    }

    const songData = data[0] as Record<string, unknown>;
    const url = songData.url as string | null;

    if (!url || !url.startsWith("http")) {
      throw new Error("Failed to get play url");
    }

    const type = songData.type as string || encodeType;
    const size = songData.size as number | undefined;
    const br = songData.br as number | undefined;

    return {
      songid: songId,
      name,
      artist,
      album,
      cover,
      lrc: null,
      url,
      link: url,
      type,
      quality: level || null,
      platform: "netease" as MusicPlatform,
      size: size || null,
      bitrate: br || null
    };
  }
}

export class NeteaseServicePool {
  private musicUList: string[];

  constructor(musicUList: string[]) {
    if (!musicUList || musicUList.length === 0) {
      throw new Error("No MUSIC_U accounts configured");
    }
    this.musicUList = musicUList;
  }

  private getRandomMusicU(): { cookie: string; index: number; suffix: string } {
    const randomIndex = Math.floor(Math.random() * this.musicUList.length);
    const cookie = this.musicUList[randomIndex];
    const suffix = cookie.slice(-8); // 取最后8位
    return { cookie, index: randomIndex, suffix };
  }

  async getSongDetail(songIds: number[]): Promise<Record<string, unknown>> {
    const { cookie, index, suffix } = this.getRandomMusicU();
    console.log(`[Netease] 使用账号 [${index}] (后缀: ...${suffix}) 请求歌曲详情`);

    const service = new NeteaseService(cookie);
    return await service.getSongDetail(songIds);
  }

  async getPlayInfo(
    songId: string,
    level?: NeteaseQuality | null
  ): Promise<PlayInfoData> {
    const { cookie, index, suffix } = this.getRandomMusicU();
    console.log(`[Netease] 使用账号 [${index}] (后缀: ...${suffix}) 请求歌曲 ${songId}`);

    const service = new NeteaseService(cookie);
    const result = await service.getPlayInfo(songId, level);

    console.log(`[Netease] 账号 [${index}] 请求成功`);
    return result;
  }

  async searchSongs(
    keywords: string,
    limit = 20,
    offset = 0
  ): Promise<Record<string, unknown>> {
    const { cookie, index, suffix } = this.getRandomMusicU();
    console.log(`[Netease] 使用账号 [${index}] (后缀: ...${suffix}) 请求搜索 ${keywords}`);

    const service = new NeteaseService(cookie);
    return await service.searchSongs(keywords, limit, offset);
  }
}
