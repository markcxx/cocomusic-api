# cocomusic-api Cloudflare 部署指南

这篇文档针对当前仓库 `cocomusic-api`，说明如何把它部署到 Cloudflare Workers，并解释为什么它的部署链路会比 Vercel 更复杂。

当前项目不是“直接把 Next.js 丢给 Cloudflare 就行”的模式，而是：

1. 先由 `next build --webpack` 生成 Next.js 产物
2. 再由 `opennextjs-cloudflare build` 把 Next.js 产物转换成 Cloudflare Workers 可运行的 `.open-next` 产物
3. 最后由 `opennextjs-cloudflare deploy` 或 `wrangler deploy` 发布

如果你跳过第 2 步，只跑 `next build`，部署时就会出现类似下面的错误：

```text
Could not find compiled Open Next config, did you run the build command?
```

这也是你这次在 Cloudflare 上遇到的核心问题。

## 1. 先理解这个仓库的部署结构

项目里和 Cloudflare 部署直接相关的文件有：

- `package.json`
- `next.config.ts`
- `open-next.config.ts`
- `wrangler.jsonc`
- `.dev.vars`
- `public/_headers`

当前关键配置如下：

### `package.json`

```json
{
  "scripts": {
    "build": "next build --webpack",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload"
  }
}
```

这里有两个很重要的点：

- `build` 只负责 Next.js 本身的构建
- 真正面向 Cloudflare 的构建命令是 `opennextjs-cloudflare build`

### `next.config.ts`

这个文件里已经调用了 `initOpenNextCloudflareForDev()`，用于本地开发时把 Next dev server 和 Cloudflare 适配器接起来。

### `open-next.config.ts`

这个文件定义 OpenNext 的 Cloudflare 适配配置。当前仓库使用的是默认配置，没有启用 R2 缓存。

### `wrangler.jsonc`

这个文件告诉 Cloudflare：

- Worker 入口在 `.open-next/worker.js`
- 静态资源目录在 `.open-next/assets`
- Worker 名称是 `cocomusic-api`
- 启用了 `nodejs_compat`

`name` 字段必须和 Cloudflare Dashboard 里的 Worker 名称一致，否则 Git 集成构建可能失败。

## 2. 这个项目需要哪些环境变量

当前仓库代码里实际读取到的服务端环境变量，核心是网易云 Cookie：

- `NETEASE_MUSIC_U`
- 或多个分片变量：`NETEASE_MUSIC_U_1`、`NETEASE_MUSIC_U_2`、`NETEASE_MUSIC_U_3` ...

代码位置见 [src/lib/env/netease-music-u.ts](D:\Code\cocomusic-api\src\lib\env\netease-music-u.ts)。

读取规则是：

- 如果存在 `NETEASE_MUSIC_U_1` 这种带序号的变量，就按序号排序后全部读取
- 如果没有带序号的变量，就退回到单个 `NETEASE_MUSIC_U`

建议优先使用分片写法：

```text
NETEASE_MUSIC_U_1=你的第一个 cookie
NETEASE_MUSIC_U_2=你的第二个 cookie
```

这样更容易管理，也更适合后续扩展。

本地开发还会用到 `.dev.vars`：

```text
NEXTJS_ENV=development
```

它的作用是告诉 OpenNext 本地开发时按什么环境去加载 Next.js 的 `.env` 文件。这个文件主要用于本地，不要把真正的线上敏感值写进去并提交。

## 3. 为什么 Cloudflare 部署比 Vercel 更复杂

简化理解：

- 在 Vercel 上，Next.js 是“原生平台”
- 在 Cloudflare 上，Next.js 是“通过适配层运行”

Vercel 复杂度低，是因为它本身就是 Next.js 的原生宿主，很多事情平台自动完成：

- 路由分发
- SSR 运行时
- 静态资源输出
- 图片优化
- ISR/缓存
- 环境变量注入

Cloudflare 这边多出来的是“适配层”：

1. Next.js 先正常构建
2. OpenNext 再把产物改写成 Workers 能跑的形态
3. Wrangler 再负责把 Worker、静态资源、绑定、Secrets 一起发布

所以你要同时理解三层：

- Next.js 自己怎么构建
- OpenNext 怎么转换产物
- Cloudflare Workers/Wrangler 怎么部署

这就是为什么 Cloudflare 方案灵活，但初次接触时明显比 Vercel 更绕。

## 4. GitHub 自动部署到 Cloudflare

这里说的不是 GitHub Actions，而是 Cloudflare Dashboard 里的 Workers Builds / Git 集成。

### 4.1 前置条件

你需要先确认：

1. 仓库已经推到 GitHub
2. Cloudflare 账号已经开通 Workers
3. 你当前仓库根目录里已经有 `wrangler.jsonc`
4. `wrangler.jsonc` 里的 `name` 和 Cloudflare 里准备使用的 Worker 名称一致

当前仓库里是：

```json
{
  "name": "cocomusic-api"
}
```

### 4.2 在 Cloudflare Dashboard 中连接仓库

在 Cloudflare Dashboard 里：

1. 进入 `Workers & Pages`
2. 选择 `Create application`
3. 选择从 GitHub 导入仓库
4. 选中当前仓库
5. 配置构建和部署命令

### 4.3 这类项目的正确命令

不要把 Build command 配成 `npm run build`。

这是这个仓库最容易踩的坑，因为：

- `npm run build` 只会生成 `.next`
- Cloudflare/OpenNext 真正需要的是 `.open-next`

推荐配置如下：

```text
Install command: npm clean-install --progress=false
Build command: npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
Root directory: /
```

如果你更喜欢复用仓库脚本，也可以这样配：

```text
Build command: npm run deploy
Deploy command: 留空
```

但从可读性和排错角度，我更建议把 build 和 deploy 分开写，避免以后看日志时混淆。

### 4.4 Cloudflare Dashboard 里要配置的环境变量

Workers Builds 下，环境变量不要只配到运行时，还要配到构建配置里。

重点是：

- `NEXT_PUBLIC_*` 变量会影响前端构建
- 非 `NEXT_PUBLIC_*` 的服务端变量，也可能在 SSG/SSR 构建过程中被读取

对当前仓库，至少要检查：

- `NETEASE_MUSIC_U` 或 `NETEASE_MUSIC_U_1` 等

推荐在 Dashboard 的 `Build Variables and secrets` 中配置。

如果你没有配置，可能会出现：

- 构建期页面数据不完整
- 某些预渲染页面行为异常
- 运行期 API 直接返回 `Netease service not configured`

### 4.5 自定义域名

构建发布成功后，再去给这个 Worker 绑定：

- `*.workers.dev` 临时域名
- 或你自己的自定义域名，例如 `api.cocomusic.cn`

如果你已经绑了旧版本 Worker，记得确认新的部署是否已经被提升为当前生效版本。

### 4.6 适合 GitHub 自动部署的场景

适合：

- 日常主线发布
- 多人协作
- 合并到主分支自动上线
- 希望每次提交都有构建日志和预览版本

不太适合：

- 先在本地手动验证 Worker 运行时再发版
- 想快速试验配置或环境变量

## 5. 本地用 Wrangler / OpenNext 直接部署

这里的“Wrangler 本地直接部署”，推荐理解成：

- 本地登录 Cloudflare
- 本地先跑 OpenNext build
- 再由 OpenNext/Wrangler 推到 Cloudflare

虽然底层还是会调用 Wrangler，但这个项目不要直接从零手敲 `wrangler deploy` 起步。

### 5.1 安装依赖

```bash
npm clean-install
```

如果你要运行这个仓库里的 Python 相关代码，再额外安装：

```bash
pip install -r requirements.txt
```

但要说明一点：当前 Cloudflare 部署路径主要跑的是 Next.js + OpenNext，`backend/` 这套 Python 代码并不是当前 Worker 直接执行的主体。

### 5.2 登录 Cloudflare

```bash
npx wrangler login
```

登录后 Wrangler 会拿到你的 Cloudflare 账号授权。

### 5.3 本地预览 Worker 运行时

先不要急着部署，先预览：

```bash
npm run preview
```

这个命令会做三件事：

1. 运行 `next build --webpack`
2. 运行 `opennextjs-cloudflare build`
3. 用 Workers runtime 本地预览

它比单纯 `next dev` 更接近真实线上环境。

### 5.4 正式部署

推荐直接用仓库脚本：

```bash
npm run deploy
```

等价于：

```bash
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

如果你要先上传版本、再手动做渐进发布，可以用：

```bash
npm run upload
```

### 5.5 什么情况下可以手动敲 `wrangler deploy`

只有当你已经先完成了：

```bash
npx opennextjs-cloudflare build
```

并且 `.open-next` 目录已经正确生成时，`npx wrangler deploy` 才有意义。

否则你会遇到：

```text
Could not find compiled Open Next config, did you run the build command?
```

这不是 Wrangler 坏了，而是因为：

- Wrangler 只负责“发”
- OpenNext 才负责“把 Next.js 产物转换成可发的 Worker 产物”

## 6. 本地和线上应该怎么放环境变量

### 6.1 本地开发

推荐：

- `.env.local` 放 Next.js 本地变量
- `.dev.vars` 放本地 Cloudflare/OpenNext 开发环境变量

当前项目里的 `.dev.vars` 至少应保留：

```text
NEXTJS_ENV=development
```

### 6.2 本地命令行部署

敏感变量优先放在 Cloudflare Secrets，而不是硬编码到仓库文件。

例如：

```bash
npx wrangler secret put NETEASE_MUSIC_U_1
```

执行后按提示输入值。

如果你有多个账号：

```bash
npx wrangler secret put NETEASE_MUSIC_U_2
```

### 6.3 GitHub 自动部署

不要依赖本地 `.env.local`。

Cloudflare 的 Git 构建环境是干净的远程环境，它不会读取你电脑上的本地文件。你需要在 Dashboard 里配置：

- Build Variables and secrets
- Worker runtime secrets

最稳妥的做法是两边都明确检查一遍。

## 7. 这几个配置为什么要这样写

### 为什么 `build` 要写成 `next build --webpack`

这次你的仓库已经验证过，直接使用默认构建产物会和 Cloudflare/OpenNext 运行时出现兼容性问题。当前项目改成：

```json
"build": "next build --webpack"
```

是为了让 OpenNext 处理稳定的 Webpack 产物，而不是默认的另一套构建输出。

### 为什么 `wrangler.jsonc` 里的 `main` 不能随便改

因为 Worker 实际入口就是：

```json
"main": ".open-next/worker.js"
```

这个文件不是你手写的业务入口，而是 OpenNext 生成的最终 Worker。

### 为什么 `assets.directory` 指向 `.open-next/assets`

因为静态资源在 OpenNext 构建后会被重新整理到这个目录，Cloudflare 需要从这里读取并托管静态资源。

### 为什么 `nodejs_compat` 必须开

因为 Next.js 服务端运行时会用到一部分 Node.js API，Cloudflare 官方和 OpenNext 官方文档都要求启用这个兼容标志。

## 8. 常见故障排查

### 构建成功，但部署时报 `Could not find compiled Open Next config`

原因：

- 你只跑了 `next build`
- 没跑 `opennextjs-cloudflare build`

修复：

```bash
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

或直接：

```bash
npm run deploy
```

### 页面访问 500，日志里有 `ComponentMod.handler is not a function`

这类问题通常不是页面文件本身有 `handler`，而是构建产物和运行时适配层不兼容。当前仓库已经通过把生产构建切到 Webpack 规避了这个问题。

先检查：

- `package.json` 的 `build` 是否仍然是 `next build --webpack`
- 部署的是否是最新 commit

### API 返回 `Netease service not configured`

原因：

- Cloudflare 上没有配置 `NETEASE_MUSIC_U`
- 或没有配置 `NETEASE_MUSIC_U_1` 等分片变量

修复：

- 在 Dashboard Secrets 里补上
- 或本地用 `wrangler secret put` 写入

### Git 集成构建失败，但本地部署成功

优先检查：

1. Worker 名称是否和 `wrangler.jsonc` 的 `name` 一致
2. Build command 是否误写成了 `npm run build`
3. Cloudflare Dashboard 里是否补齐了构建期变量

## 9. 推荐的实际使用方式

如果你是一个人维护这个项目，我建议这样分工：

### 日常开发

```bash
npm run dev
```

### 上线前验证

```bash
npm run preview
```

### 本地手动发版

```bash
npm run deploy
```

### 生产主线

把仓库接到 Cloudflare Workers Builds，用 GitHub 自动部署。

这样你能同时保留：

- 本地可控验证
- 线上自动发布
- Dashboard 构建日志

## 10. 一份可直接照抄的配置建议

### Cloudflare Dashboard

```text
Framework preset: None / Custom
Install command: npm clean-install --progress=false
Build command: npx opennextjs-cloudflare build
Deploy command: npx opennextjs-cloudflare deploy
Root directory: /
```

### 本地命令

```bash
npm clean-install
npx wrangler login
npm run preview
npm run deploy
```

### Secrets

```bash
npx wrangler secret put NETEASE_MUSIC_U_1
npx wrangler secret put NETEASE_MUSIC_U_2
```

## 11. 参考资料

以下是这篇文档主要参考的官方文档：

- OpenNext Cloudflare Get Started: https://opennext.js.org/cloudflare/get-started
- OpenNext Cloudflare CLI: https://opennext.js.org/cloudflare/cli
- Cloudflare Workers Next.js Guide: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Workers Builds: https://developers.cloudflare.com/workers/ci-cd/builds/
- Wrangler Commands: https://developers.cloudflare.com/workers/wrangler/commands/
