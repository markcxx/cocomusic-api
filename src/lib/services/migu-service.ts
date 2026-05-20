import type { MiguQuality, MusicPlatform, PlayInfoData } from "../models/music";

interface MiguSearchSong {
  id: string;
  name: string | null;
  artist: string | null;
  album: string | null;
  cover: string | null;
  duration: number | null;
}

interface MiguSearchResult {
  songs: MiguSearchSong[];
  total: number;
  hasMore: boolean;
}

export class MiguService {
  private timeout: number;
  private headers: Record<string, string>;
  private musicQualities: Record<string, string>;

  constructor(requestTimeoutMs = 15000) {
    this.timeout = requestTimeoutMs;
    this.headers = {
      accept: "application/json, text/plain, */*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      activityid: "v4_zt_2022_music",
      appid: "ce",
      channel: "014X031",
      connection: "keep-alive",
      deviceid: "E60C6B2F-7F11-4362-9FCE-6F1CC86E0F18",
      host: "c.musicapp.migu.cn",
      hwid: "",
      imei: "",
      h5page: "",
      imsi: "",
      "location-info": "",
      "mgm-user-agent": "",
      oaid: "",
      uid: "",
      "location-data": "",
      logid: "h5page[1808]",
      "mgm-network-operators": "02",
      "mgm-network-standard": "03",
      "mgm-network-type": "03",
      origin: "https://y.migu.cn",
      recommendstatus: "1",
      referer: "https://y.migu.cn/app/v4/zt/2022/music/index.html",
      "sec-ch-ua":
        '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      subchannel: "014X031",
      test: "00",
      ua: "Android_migu",
      version: "6.8.8",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    };
    this.musicQualities = {
      LQ: "mp3",
      PQ: "mp3",
      HQ: "mp3",
      SQ: "flac",
      ZQ: "flac",
      Z3D: "flac",
      ZQ24: "flac",
      ZQ32: "flac",
    };
  }

  private parseId(idStr: string): [string, string] {
    const value = (idStr || "").trim();
    if (!value || !value.includes("_")) {
      throw new Error("Invalid id");
    }
    const idx = value.indexOf("_");
    const contentId = value.slice(0, idx).trim();
    const copyrightId = value.slice(idx + 1).trim();
    if (!contentId || !copyrightId) {
      throw new Error("Invalid id");
    }
    return [contentId, copyrightId];
  }

  private parseSize(value: unknown): number {
    const raw = String(value ?? "")
      .replace("MB", "")
      .trim();
    if (!raw) return 0;
    const num = parseFloat(raw);
    return isNaN(num) ? 0 : num;
  }

  private buildSearchUrl(
    keyword: string,
    pageNo = 1,
    pageSize = 20
  ): string {
    const searchSwitch =
      "{'song': 1, 'album': 0, 'singer': 0, 'tagSong': 1, 'mvSong': 0, 'bestShow': 1}";
    const params = new URLSearchParams({
      text: keyword,
      pageNo: String(pageNo),
      pageSize: String(pageSize),
      isCopyright: "1",
      sort: "1",
      searchSwitch,
    });
    return `https://c.musicapp.migu.cn/v1.0/content/search_all.do?${params}`;
  }

  private parseDuration(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value !== "string") return null;

    const text = value.trim();
    if (!text) return null;

    if (/^\d+$/.test(text)) {
      const num = parseInt(text, 10);
      return Number.isFinite(num) && num > 0 ? num : null;
    }

    const parts = text.split(":").map((part) => parseInt(part, 10));
    if (parts.some((part) => Number.isNaN(part) || part < 0)) {
      return null;
    }

    if (parts.length === 2) {
      return (parts[0] * 60 + parts[1]) * 1000;
    }
    if (parts.length === 3) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }

    return null;
  }

  private buildListenUrl(
    contentId: string,
    copyrightId: string,
    resourceType: string,
    toneFlag: string
  ): string {
    return (
      "https://c.musicapp.migu.cn/MIGUM3.0/strategy/listen-url/v2.4" +
      `?resourceType=${resourceType}` +
      "&netType=01" +
      "&scene=" +
      `&toneFlag=${toneFlag}` +
      `&contentId=${contentId}` +
      `&copyrightId=${copyrightId}` +
      `&lowerQualityContentId=${contentId}`
    );
  }

  private fallbackUrl(
    contentId: string,
    copyrightId: string,
    toneFlag: string,
    resourceType: string
  ): string {
    return (
      "https://app.pd.nf.migu.cn/MIGUM3.0/v1.0/content/sub/listenSong.do" +
      `?channel=mx&copyrightId=${copyrightId}` +
      `&contentId=${contentId}` +
      `&toneFlag=${toneFlag}` +
      `&resourceType=${resourceType}` +
      "&userId=15548614588710179085069" +
      "&netType=00"
    );
  }

  private safeStr(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const text = value.trim();
    return text || null;
  }

  private extractSongList(payload: unknown): Record<string, unknown>[] {
    if (!payload || typeof payload !== "object") return [];
    const p = payload as Record<string, unknown>;
    const songResult = p.songResultData;
    if (!songResult || typeof songResult !== "object") return [];
    const sr = songResult as Record<string, unknown>;
    const items = sr.result;
    if (!Array.isArray(items)) return [];
    return items.filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === "object"
    );
  }

  private extractTotal(payload: unknown, fallback: number): number {
    if (!payload || typeof payload !== "object") return fallback;
    const songResult = (payload as Record<string, unknown>).songResultData;
    if (!songResult || typeof songResult !== "object") return fallback;

    const candidates = [
      (songResult as Record<string, unknown>).totalCount,
      (songResult as Record<string, unknown>).total,
      (songResult as Record<string, unknown>).count,
      (songResult as Record<string, unknown>).resultCount,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return candidate;
      }
      if (typeof candidate === "string" && /^\d+$/.test(candidate.trim())) {
        return parseInt(candidate, 10);
      }
    }

    return fallback;
  }

  private pickSongForMeta(
    items: Record<string, unknown>[],
    contentId: string,
    copyrightId: string
  ): Record<string, unknown> | null {
    for (const item of items) {
      if (
        item.contentId === contentId &&
        item.copyrightId === copyrightId
      ) {
        return item;
      }
    }
    for (const item of items) {
      if (item.contentId === contentId) {
        return item;
      }
    }
    return null;
  }

  private pickSongForRates(
    items: Record<string, unknown>[]
  ): Record<string, unknown> | null {
    for (const item of items) {
      if (item) return item;
    }
    return null;
  }

  private extractMeta(
    song: Record<string, unknown>
  ): [string | null, string | null, string | null, string | null] {
    const title = this.safeStr(song.name);

    const singers = song.singers;
    const artistNames: string[] = [];
    if (Array.isArray(singers)) {
      for (const singer of singers) {
        if (!singer || typeof singer !== "object") continue;
        const name = this.safeStr((singer as Record<string, unknown>).name);
        if (name) artistNames.push(name);
      }
    }
    const artist = artistNames.length > 0 ? artistNames.join(", ") : null;

    const albums = song.albums;
    const albumNames: string[] = [];
    if (Array.isArray(albums)) {
      for (const album of albums) {
        if (!album || typeof album !== "object") continue;
        const name = this.safeStr((album as Record<string, unknown>).name);
        if (name) albumNames.push(name);
      }
    }
    const album = albumNames.length > 0 ? albumNames.join(", ") : null;

    let cover: string | null = null;
    const imgItems = song.imgItems;
    if (Array.isArray(imgItems) && imgItems.length > 0) {
      const last = imgItems[imgItems.length - 1];
      if (last && typeof last === "object") {
        cover = this.safeStr((last as Record<string, unknown>).img);
      }
    }
    if (cover && !cover.startsWith("http")) {
      cover = null;
    }

    return [title, artist, album, cover];
  }

  private buildSongId(song: Record<string, unknown>): string {
    const contentId = this.safeStr(song.contentId);
    const copyrightId = this.safeStr(song.copyrightId);
    if (!contentId || !copyrightId) return "";
    return `${contentId}_${copyrightId}`;
  }

  private mapSearchSong(song: Record<string, unknown>): MiguSearchSong | null {
    const id = this.buildSongId(song);
    if (!id) return null;

    const [name, artist, album, cover] = this.extractMeta(song);

    return {
      id,
      name,
      artist,
      album,
      cover,
      duration:
        this.parseDuration(song.duration) ??
        this.parseDuration(song.length) ??
        this.parseDuration(song.songLength),
    };
  }

  private extractMetaFromListenData(
    data: Record<string, unknown>
  ): [string | null, string | null, string | null, string | null] {
    const title =
      this.safeStr(data.songName) ||
      this.safeStr(data.musicName) ||
      this.safeStr(data.name) ||
      this.safeStr(data.title);
    const artist =
      this.safeStr(data.singerName) ||
      this.safeStr(data.artist) ||
      this.safeStr(data.singer);
    const album =
      this.safeStr(data.albumName) || this.safeStr(data.album);
    let cover =
      this.safeStr(data.img) ||
      this.safeStr(data.pic) ||
      this.safeStr(data.cover) ||
      this.safeStr(data.albumCover);
    if (cover && !cover.startsWith("http")) {
      cover = null;
    }
    return [title, artist, album, cover];
  }

  private extractRateFormats(
    song: Record<string, unknown>
  ): Record<string, unknown>[] {
    const merged: unknown[] = [];
    const rateFormats = song.rateFormats;
    const newRateFormats = song.newRateFormats;
    if (Array.isArray(rateFormats)) merged.push(...rateFormats);
    if (Array.isArray(newRateFormats)) merged.push(...newRateFormats);

    const result: Record<string, unknown>[] = [];
    for (const item of merged) {
      if (!item || typeof item !== "object") continue;
      const r = item as Record<string, unknown>;
      if (!r.formatType || !r.resourceType) continue;
      result.push(r);
    }
    return result;
  }

  private sortedRateFormats(
    items: Record<string, unknown>[]
  ): Record<string, unknown>[] {
    return [...items].sort((a, b) => {
      const sizeA = this.parseSize(a.size || a.iosSize || a.androidSize);
      const sizeB = this.parseSize(b.size || b.iosSize || b.androidSize);
      return sizeB - sizeA;
    });
  }

  private fixUrl(url: string): string {
    const value = (url || "").trim();
    if (!value) return "";
    return value.replace(/(?<=\/)MP3_128_16_Stero(?=\/)/, "MP3_320_16_Stero");
  }

  private async getJson(url: string): Promise<Record<string, unknown>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        headers: this.headers,
        signal: controller.signal,
      });
      const data = await response.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return data as Record<string, unknown>;
      }
      return {};
    } finally {
      clearTimeout(timer);
    }
  }

  async searchSongs(
    keywords: string,
    limit?: number,
    offset?: number
  ): Promise<MiguSearchResult> {
    const q = (keywords || "").trim();
    if (!q) {
      throw new Error("Invalid or missing keyword");
    }

    const normalizedLimit = !Number.isFinite(limit)
      ? 20
      : Math.min(Math.max(Math.floor(limit as number), 1), 50);
    const normalizedOffset = !Number.isFinite(offset)
      ? 0
      : Math.max(Math.floor(offset as number), 0);

    const pageNo = Math.floor(normalizedOffset / normalizedLimit) + 1;
    const pageOffset = normalizedOffset % normalizedLimit;
    const requestSize = Math.min(normalizedLimit + pageOffset, 50);

    const payload = await this.getJson(
      this.buildSearchUrl(q, pageNo, requestSize)
    );
    const rawSongs = this.extractSongList(payload);
    const total = this.extractTotal(payload, rawSongs.length);

    const songs = rawSongs
      .slice(pageOffset, pageOffset + normalizedLimit)
      .map((song) => this.mapSearchSong(song))
      .filter((song): song is MiguSearchSong => song !== null);

    return {
      songs,
      total,
      hasMore: normalizedOffset + songs.length < total,
    };
  }

  async getPlayInfo(
    idStr: string,
    quality?: MiguQuality | null
  ): Promise<PlayInfoData> {
    const [contentId, copyrightId] = this.parseId(idStr);

    const searchUrl = this.buildSearchUrl(contentId, 1, 10);
    const payload = await this.getJson(searchUrl);
    const songs = this.extractSongList(payload);
    const songForMeta = this.pickSongForMeta(songs, contentId, copyrightId);
    const songForRates = songForMeta || this.pickSongForRates(songs);

    if (!songForRates) {
      throw new Error("Song not found");
    }

    let [name, artist, album, cover] = songForMeta
      ? this.extractMeta(songForMeta)
      : [null, null, null, null];

    let rateFormats = this.sortedRateFormats(
      this.extractRateFormats(songForRates)
    );

    if (quality) {
      rateFormats = rateFormats.filter(
        (item) => item.formatType === quality
      );
      if (rateFormats.length === 0) {
        throw new Error("Unsupported quality");
      }
    }

    for (const rate of rateFormats) {
      const toneFlag = this.safeStr(rate.formatType);
      const resourceType = this.safeStr(rate.resourceType);
      if (!toneFlag || !resourceType) continue;

      const listenUrl = this.buildListenUrl(
        contentId,
        copyrightId,
        resourceType,
        toneFlag
      );
      const info = await this.getJson(listenUrl);

      let urlFromApi: string | null = null;
      const data = info.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const d = data as Record<string, unknown>;
        const [listenTitle, listenArtist, listenAlbum, listenCover] =
          this.extractMetaFromListenData(d);
        if (listenTitle) name = listenTitle;
        if (listenArtist) artist = listenArtist;
        if (listenAlbum) album = listenAlbum;
        if (listenCover) cover = listenCover;
        urlFromApi = this.safeStr(d.url);
      }

      if (!urlFromApi) {
        urlFromApi = this.fallbackUrl(
          contentId,
          copyrightId,
          toneFlag,
          resourceType
        );
      }

      const fixed = this.fixUrl(urlFromApi);
      if (!fixed.startsWith("http")) continue;

      const type = this.musicQualities[toneFlag] || "mp3";
      return {
        songid: idStr.trim(),
        name,
        artist,
        album,
        cover,
        lrc: null,
        url: fixed,
        link: urlFromApi.startsWith("http") ? urlFromApi : null,
        type,
        quality: toneFlag,
        platform: "migu" as MusicPlatform,
      };
    }

    throw new Error("Failed to get play url");
  }
}
