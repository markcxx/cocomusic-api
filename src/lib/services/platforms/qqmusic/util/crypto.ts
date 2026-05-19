import { createCipheriv, createHash, randomBytes } from "crypto";

const REQUEST_KEY_HEX = "bd305f10d0ff74b6ef54dab835b5e1cf";
const RESPONSE_KEY_HEX = "7a3f8c1d5e9b2f0a6c4d7e8b1f3a5c9d0e2b6f4a81";
const REQUEST_KEY = Buffer.from(REQUEST_KEY_HEX, "hex");
const RESPONSE_KEY = Buffer.from(RESPONSE_KEY_HEX, "hex");

const IV_LEN = 12;
const TAG_LEN = 16;

function xorCycle(dataBuf: Buffer, keyBuf: Buffer): Buffer {
  const out = Buffer.allocUnsafe(dataBuf.length);
  for (let i = 0; i < dataBuf.length; i++) {
    out[i] = dataBuf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out;
}

export function encryptRequest(plaintext: unknown): string {
  const iv = randomBytes(IV_LEN);
  const pt = Buffer.from(JSON.stringify(plaintext), "utf8");
  const cipher = createCipheriv("aes-128-gcm", REQUEST_KEY, iv, {
    authTagLength: TAG_LEN,
  });
  const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, ct, tag]).toString("base64");
}

export function decryptResponse(input: ArrayBuffer): string {
  const buf = Buffer.from(input);
  const pt = xorCycle(buf, RESPONSE_KEY);
  return pt.toString("utf8");
}

export function zzcSign(payload: string): string {
  const hash = createHash("sha1").update(payload).digest("hex").toUpperCase();

  const part1Indexes = [23, 14, 6, 36, 16, 40, 7, 19];
  let part1 = "";
  for (const i of part1Indexes) {
    if (i < 40) part1 += hash[i];
  }

  const part2Indexes = [16, 1, 32, 12, 19, 27, 8, 5];
  let part2 = "";
  for (const i of part2Indexes) {
    part2 += hash[i];
  }

  const scrambleValues = [
    89, 39, 179, 150, 218, 82, 58, 252, 177, 52,
    186, 123, 120, 64, 242, 133, 143, 161, 121, 179,
  ];
  const part3Array = new Uint8Array(scrambleValues.length);
  for (let i = 0; i < scrambleValues.length; i++) {
    const hashPart = hash.slice(i * 2, i * 2 + 2);
    const hashValue = parseInt(hashPart, 16);
    part3Array[i] = scrambleValues[i] ^ hashValue;
  }

  let b64Part = Buffer.from(part3Array).toString("base64");
  b64Part = b64Part.replace(/[\/+=]/g, "");

  return `zzc${part1}${b64Part}${part2}`.toLowerCase();
}
