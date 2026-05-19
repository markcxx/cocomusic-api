import { decryptResponse, encryptRequest, zzcSign } from "./crypto";

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "text/plain",
  Accept: "application/octet-stream",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  Referer: "https://y.qq.com/",
};

interface RequestOptions {
  uin?: number;
  qm_keyst?: string;
  g_tk?: number;
  ip?: string;
  timeout?: number;
}

interface RequestResponse {
  status: number;
  body: Record<string, unknown>;
}

export async function createRequest(
  moduleName: string,
  method: string,
  data: Record<string, unknown>,
  options: RequestOptions = {}
): Promise<RequestResponse> {
  const requestData = {
    comm: {
      cv: 4747474,
      ct: 24,
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "yqq.json",
      needNewCode: 1,
      uin: Number(options.uin) || 0,
      g_tk_new_20200303: options.g_tk || 1083888122,
      g_tk: options.g_tk || 1083888122,
    },
    req_0: {
      module: moduleName,
      method,
      param: data,
    },
  };

  const jsonData = JSON.stringify(requestData);
  const encrypted = encryptRequest(requestData);
  const signature = zzcSign(jsonData);
  const url = `https://u6.y.qq.com/cgi-bin/musics.fcg?_=${Date.now()}&encoding=ag-1&sign=${signature}`;

  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  if (options.uin && options.qm_keyst) {
    headers.Cookie = `qm_keyst=${options.qm_keyst}; uin=${options.uin}`;
  }
  if (options.ip) {
    headers["X-Real-IP"] = options.ip;
    headers["X-Forwarded-For"] = options.ip;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout || 30000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: encrypted,
      signal: controller.signal,
    });
    const buffer = await res.arrayBuffer();
    const result = JSON.parse(decryptResponse(buffer)) as Record<string, unknown>;

    const answer: RequestResponse = { status: 200, body: result };
    if (typeof result.code === "number" && result.code !== 0) {
      answer.status = 400;
    }
    const req0 = result.req_0 as Record<string, unknown> | undefined;
    if (req0 && req0.data && typeof req0.data === "object") {
      answer.body = req0.data as Record<string, unknown>;
    }

    if (answer.status !== 200) {
      throw new Error("QQMusic API returned error");
    }
    return answer;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
