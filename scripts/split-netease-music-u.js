#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const KEY = "NETEASE_MUSIC_U";
const INDEXED_KEY_PATTERN = /^NETEASE_MUSIC_U_\d+$/;

function splitCookies(rawValue) {
  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitEnvLine(line) {
  const index = line.indexOf("=");
  if (index === -1) {
    return null;
  }
  return {
    key: line.slice(0, index).trim(),
    value: line.slice(index + 1),
  };
}

function run() {
  const targetArg = process.argv[2] || ".env.local";
  const targetPath = path.resolve(process.cwd(), targetArg);

  if (!fs.existsSync(targetPath)) {
    throw new Error(`File not found: ${targetPath}`);
  }

  const content = fs.readFileSync(targetPath, "utf-8");
  const hasCrLf = content.includes("\r\n");
  const lineBreak = hasCrLf ? "\r\n" : "\n";

  const lines = content.split(/\r?\n/);

  let legacyRawValue = null;
  const preservedLines = [];

  for (const line of lines) {
    const parsed = splitEnvLine(line);
    if (!parsed) {
      preservedLines.push(line);
      continue;
    }

    if (parsed.key === KEY) {
      legacyRawValue = parsed.value.trim();
      continue;
    }

    if (INDEXED_KEY_PATTERN.test(parsed.key)) {
      continue;
    }

    preservedLines.push(line);
  }

  if (!legacyRawValue) {
    throw new Error(`Missing ${KEY} in ${targetArg}`);
  }

  const cookies = splitCookies(legacyRawValue);
  if (cookies.length === 0) {
    throw new Error(`${KEY} does not contain valid cookie values`);
  }

  const indexedLines = cookies.map((cookie, index) => `${KEY}_${index + 1}=${cookie}`);
  const outputLines = [...preservedLines, ...indexedLines];

  const output = outputLines.join(lineBreak);
  fs.writeFileSync(targetPath, output, "utf-8");

  console.log(`Split ${KEY} into ${cookies.length} variables in ${targetArg}`);
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}

