# COCO Music API

一个开源、无鉴权的音乐聚合接口项目。当前阶段主要提供“获取可播放直链”的免费解析能力（非官方接口），后续会逐步补齐各平台更多能力。

## 免责声明

- 本项目不提供任何账号登录、Cookie 托管、VIP 账号代充/共享等能力
- 当前已实现的直链解析属于“非官方/免费解析”能力，稳定性与可用性取决于上游策略与风控
- 请仅用于学习、个人研究与合法合规场景

## 基础信息

- Base URL：`{BASE_URL}`
- 统一返回结构：

```json
{
  "code": 200,
  "message": "ok",
  "service": "coco音乐",
  "data": {}
}
```

## 错误码

| code | 含义 |
| --- | --- |
| 200 | 成功 |
| 400 | 参数错误（例如 id 为空、migu 的 id 格式不正确、migu 不支持指定的音质） |
| 502 | 上游请求失败 |
| 500 | 服务器内部错误 |

## API 列表

| Method | Path | 描述 |
| --- | --- | --- |
| GET | `/v1/music/song_url` | 获取歌曲播放直链（免费解析/非官方） |

---

# GET /v1/music/song_url

获取歌曲播放直链，并返回可用于前端播放的 URL 与基础元信息。

## Query 参数

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `platform` | `qq \| kugou \| kuwo \| migu` | 是 | 平台类型 |
| `id` | `string` | 是 | 歌曲 ID（不同平台含义不同，见下方说明） |
| `quality` | `LQ \| PQ \| HQ \| SQ \| ZQ \| Z3D \| ZQ24 \| ZQ32` | 否 | 音质（仅 `platform=migu` 生效；不传则自动选择可用的最高音质） |

## 返回 data 字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `songid` | `string` | 原样返回请求的 `id` |
| `name` / `artist` / `album` | `string \| null` | 元信息（上游可提供则返回） |
| `cover` | `string \| null` | 封面图 URL（上游可提供则返回） |
| `lrc` | `string \| null` | 歌词 URL（当前可能为空） |
| `url` | `string` | 最终可播放直链 |
| `link` | `string \| null` | 上游返回的原始链接（可能用于排查/对照） |
| `type` | `string` | 文件扩展名（如 `mp3` / `flac`） |
| `quality` | `string \| null` | 音质标识（当前仅 `migu` 会返回，如 `SQ` / `ZQ24`） |
| `platform` | `qq \| kugou \| kuwo \| migu` | 平台类型 |

## 平台 ID 说明

### qq / kugou / kuwo

- `id`：通常为平台歌曲 ID、hash、或可被上游识别的资源标识（具体由解析源决定）
- 当前这些平台通过同一个免费解析源获取直链，暂不支持“指定音质”

### migu

- `id`：固定为 `contentId_copyrightId`（下划线分隔）
- `quality`：可选，支持按音质请求
- 如果指定音质不可用，会返回 `400 Unsupported quality`

## 请求示例

### 酷狗（示例）

```bash
curl "{BASE_URL}/v1/music/song_url?platform=kugou&id=E5715D67DB3B804F127C3CD9198F2F22"
```

### 咪咕（自动最高音质）

```bash
curl "{BASE_URL}/v1/music/song_url?platform=migu&id=CONTENTID_COPYRIGHTID"
```

### 咪咕（指定音质 SQ）

```bash
curl "{BASE_URL}/v1/music/song_url?platform=migu&id=CONTENTID_COPYRIGHTID&quality=SQ"
```

## 响应示例

```json
{
  "code": 200,
  "message": "ok",
  "service": "coco音乐",
  "data": {
    "songid": "CONTENTID_COPYRIGHTID",
    "name": "示例歌曲",
    "artist": "示例歌手",
    "album": "示例专辑",
    "cover": "https://example.com/cover.jpg",
    "lrc": null,
    "url": "https://example.com/play.flac",
    "link": "https://example.com/origin.flac",
    "type": "flac",
    "quality": "SQ",
    "platform": "migu"
  }
}
```

---

# Roadmap

- 免费解析能力（当前）：以“可播放直链”为目标，尽可能输出封面/歌词/官方页等基础信息
- 官方能力（规划中）：通过用户自行配置的 VIP 账号/Token 获取官方播放链接与更多音质选择
- 平台能力扩展（规划中）：搜索、歌单、专辑、歌手、排行榜等聚合接口
