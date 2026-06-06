# cocomusic-api

一个基于 Next.js 16 App Router 的音乐聚合 API 项目，提供搜索、歌曲详情、歌词和播放直链能力，并带有可直接访问的文档页与在线调试页。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markcxx/cocomusic-api&project-name=cocomusic-api&repository-name=cocomusic-api&env=NETEASE_MUSIC_U,NETEASE_MUSIC_U_1,NETEASE_MUSIC_U_2&envDescription=%E5%8F%AA%E5%9C%A8%E4%BD%BF%E7%94%A8%E7%BD%91%E6%98%93%E4%BA%91%E7%9B%B8%E5%85%B3%E8%83%BD%E5%8A%9B%E6%97%B6%E9%9C%80%E8%A6%81)

当前仓库已经具备两类部署基础：

- Cloudflare Workers：通过 `@opennextjs/cloudflare` + `wrangler` 部署
- Vercel：作为标准 Next.js 应用部署

## 功能概览

- 多平台音乐搜索
- 歌曲详情查询
- 歌词获取
- 音频播放直链解析
- 浏览器内 API Playground
- Cloudflare Workers 产物构建与发布

## 页面与路由

### 页面

- `/`：项目首页
- `/docs`：文档页
- `/playground`：在线调试页
- `/dashboard`：控制台风格展示页

### API

| Method | Path | 说明 | 支持平台 |
| --- | --- | --- | --- |
| `GET` | `/v1/search` | 关键词搜索 | `qq` `netease` `migu` |
| `GET` | `/v1/music/song_url` | 获取歌曲播放直链 | `qq` `kugou` `kuwo` `migu` `netease` |
| `GET` | `/v1/music/song_detail` | 获取歌曲详情 | `qq` `netease` |
| `GET` | `/v1/lyric` | 获取歌词 | `qq` `netease` |
| `GET` | `/api/proxy` | 代理远程音频资源 | 内部工具路由 |

## 项目结构

```text
.
├─ docs/
│  ├─ api-docs.md
│  └─ cloudflare-deploy.md
├─ public/
├─ scripts/
├─ src/
│  ├─ app/
│  │  ├─ api/proxy/
│  │  ├─ docs/
│  │  ├─ dashboard/
│  │  ├─ playground/
│  │  └─ v1/
│  ├─ components/
│  ├─ lib/
│  │  ├─ env/
│  │  ├─ models/
│  │  └─ services/
│  └─ views/
├─ next.config.ts
├─ open-next.config.ts
├─ wrangler.jsonc
└─ package.json
```

## 本地开发

### 1. 安装依赖

```bash
npm clean-install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认访问：

- `http://localhost:3000`
- `http://localhost:3000/playground`

## 环境变量

当前服务端最关键的变量是网易云 `MUSIC_U` Cookie。

支持两种写法：

```bash
NETEASE_MUSIC_U=your_cookie
```

或分片写法：

```bash
NETEASE_MUSIC_U_1=your_cookie_1
NETEASE_MUSIC_U_2=your_cookie_2
```

项目会优先读取 `NETEASE_MUSIC_U_1`、`NETEASE_MUSIC_U_2` 这类分片变量；如果不存在，再回退到 `NETEASE_MUSIC_U`。

本地 Cloudflare/OpenNext 调试还会使用 `.dev.vars`，当前示例里包含：

```bash
NEXTJS_ENV=development
```

## 常用脚本

| 脚本 | 说明 |
| --- | --- |
| `npm run dev` | 本地开发 |
| `npm run build` | Next.js 生产构建 |
| `npm run start` | 启动生产服务 |
| `npm run lint` | 运行 ESLint |
| `npm run preview` | 生成 OpenNext 产物并本地预览 Cloudflare Worker |
| `npm run deploy` | 生成 OpenNext 产物并部署到 Cloudflare |
| `npm run upload` | 生成 OpenNext 产物并上传版本 |
| `npm run cf-typegen` | 生成 Cloudflare 环境类型 |
| `npm run split:musicu` | 分割网易云 Cookie 辅助脚本 |

## 部署

### Cloudflare Workers / Wrangler

当前仓库已经为 Cloudflare 路径配置好了这些文件：

- `next.config.ts`
- `open-next.config.ts`
- `wrangler.jsonc`

推荐流程：

```bash
npm run preview
npm run deploy
```

补充说明：

- `wrangler.jsonc` 的入口是 `.open-next/worker.js`
- 静态资源目录是 `.open-next/assets`
- `npm run build` 只构建 Next.js
- 真正面向 Cloudflare 的构建在 `npm run preview` / `npm run deploy` 中完成

更完整的 Cloudflare 部署说明见 [docs/cloudflare-deploy.md](docs/cloudflare-deploy.md)。

### Vercel

这个项目的业务代码当前没有直接依赖 Cloudflare 专属运行时 API，主体仍然是标准 Next.js App Router 应用，因此可以作为普通 Next.js 项目部署到 Vercel。

仓库内已经提供 `vercel.json`，用于明确告诉 Vercel 按 Next.js 项目处理，避免被误识别成其他框架。

建议的配置：

- Framework Preset：`Next.js`
- Install Command：`npm clean-install`
- Build Command：`npm run build`
- Output Directory：保持默认
- Node 版本：使用与 Next.js 16 兼容的版本

如果你之前已经在 Vercel 后台把这个项目错误创建成了 `FastAPI`，仅推送代码不一定能修正已有项目设置。需要同时检查一次 Vercel Project Settings：

- `Framework Preset` 改成 `Next.js`
- `Root Directory` 保持仓库根目录
- `Build Command` 为 `npm run build`
- `Install Command` 为 `npm clean-install`

如果后台项目类型已经锁死成错误配置，最省事的做法是删掉这个 Vercel 项目后，用上面的按钮重新导入一次。

如果使用了网易云相关能力，需要在 Vercel 项目里补充：

- `NETEASE_MUSIC_U`
- 或 `NETEASE_MUSIC_U_1`、`NETEASE_MUSIC_U_2` 等

## 文档

- API 说明：[docs/api-docs.md](docs/api-docs.md)
- Cloudflare 部署：[docs/cloudflare-deploy.md](docs/cloudflare-deploy.md)

## 双平台说明

- `Vercel` 走标准 Next.js 构建，使用 `vercel.json`
- `Cloudflare Workers` 走 `OpenNext + Wrangler`
- 业务代码继续保持平台无关，平台差异只放在根目录配置文件中
