const INDEXED_KEY_PATTERN = /^NETEASE_MUSIC_U_(\d+)$/;

function parseLegacyCookies(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseIndexedCookies(): string[] {
  const indexedPairs: Array<{ index: number; value: string }> = [];

  for (const [key, rawValue] of Object.entries(process.env)) {
    const matched = key.match(INDEXED_KEY_PATTERN);
    if (!matched) {
      continue;
    }

    const value = (rawValue || "").trim();
    if (!value) {
      continue;
    }

    const index = Number.parseInt(matched[1], 10);
    if (Number.isNaN(index)) {
      continue;
    }

    indexedPairs.push({ index, value });
  }

  indexedPairs.sort((a, b) => a.index - b.index);
  return indexedPairs.map((item) => item.value);
}

export function getNeteaseMusicUList(): string[] {
  const indexed = parseIndexedCookies();
  if (indexed.length > 0) {
    return indexed;
  }

  const legacy = (process.env.NETEASE_MUSIC_U || "").trim();
  if (!legacy) {
    return [];
  }

  return parseLegacyCookies(legacy);
}

