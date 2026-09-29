# eFootball 抽卡模拟器

一个 eFootball 风格的「球王传承」连锁礼包抽卡模拟器，使用 Vue 3 + TypeScript + Vite 开发，并通过 Electron 打包为免安装的 Windows 桌面程序。

## 功能特性

- **连锁礼包**：01~07 共 7 个礼包，按顺序解锁，购买后自动解锁下一个礼包。
- **横向轮播**：中央大卡片为真实横向 Carousel，支持鼠标 / 触摸拖拽切换礼包。
- **概率抽卡**：
  - 01 包：10% 概率抽中包内任一球员，90% 不出；
  - 02 包：30% 概率抽中包内任一球员，70% 不出；
  - 03~07 包：100% 必出包内任一球员。
  - 01、02 每个面板抽取 2 次（包名后标注 `x2`），一次购买可能抽到 0~2 名球员。
- **概率详情**：点击卡片右下角小礼包，弹出可抽出球员列表，并显示每名球员的独立概率（出包概率 ÷ 池内球员数）。
- **抽卡结果页**：展示本次抽到的球员，未出货时提示未抽中。
- **交互音效**：购买、查看详情、切换礼包等点击操作播放「点击音效」；重置、关闭弹窗等操作播放「重置」音效；拖拽不播放。
- **其他**：右上角活动倒计时、右上角重置按钮（一键恢复初始进度）。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3（`<script setup>`） |
| 语言 | TypeScript |
| 构建 | Vite 7 |
| 桌面端 | Electron + electron-builder（免安装 `dir` 产物） |
| 样式 | 原生 CSS（组件内 `<style scoped>`） |

## 目录结构

```
FootballSimulator/
├─ electron/
│  └─ main.cjs              # Electron 主进程，加载 dist/index.html
├─ packaging/
│  └─ 启动游戏.bat           # 免安装启动脚本（打包时复制到产物根目录）
├─ public/                  # 静态资源（构建时原样拷贝）
│  ├─ assets/
│  │  ├─ backgrounds/       # 主背景图
│  │  ├─ cards/             # 球员卡 01~39
│  │  ├─ characters/        # 左右人物立绘
│  │  ├─ packs/             # 小礼包缩略图（10% / 30% / 100%）
│  │  └─ thumbs/
│  └─ sound/                # 点击 / 重置音效（mp3）
├─ src/
│  ├─ components/           # 页面组件（头部、轮播、卡片、弹窗等）
│  ├─ composables/          # 逻辑复用：useGacha / useCarousel / useSound
│  ├─ data/packages.ts      # 球员池与礼包定义（由 GIFT.json 整理而来）
│  ├─ types/package.ts      # 类型定义
│  ├─ App.vue               # 页面装配与状态管理
│  ├─ main.ts
│  └─ style.css
├─ Example/                 # 参考效果图
├─ Picture/                 # 球员原始素材
├─ Sound/                   # 音效原始素材（wma）
├─ GIFT.json                # 球员池与礼包配置源
├─ index.html
├─ vite.config.ts
├─ wrangler.jsonc           # Cloudflare Workers 部署配置
├─ tsconfig*.json
└─ package.json
```

## 快速开始

环境要求：Node.js ≥ 20，npm ≥ 10。

```bash
# 安装依赖
npm install

# 开发模式（浏览器中运行，默认 http://localhost:5173）
npm run dev

# 构建前端产物（输出到 dist/）
npm run build

# 本地预览构建产物
npm run preview

# 在 Electron 中运行已构建的 dist/（需先执行 npm run build）
npm run electron

# 一键构建并打包 Windows 免安装程序（输出到 release-out/win-unpacked/）
npm run dist

# 本地以 Cloudflare Workers 运行时预览（构建并启动 wrangler dev）
npm run cf:preview

# 构建并部署到 Cloudflare Workers
npm run deploy
```

打包完成后，进入 `release-out/win-unpacked/`，双击 `启动游戏.bat` 或 `FootballPackSimulator.exe` 即可运行，无需安装任何环境。

> 说明：Windows 产物使用相对路径加载资源（`vite.config.ts` 中 `base: './'`），因此可以脱离安装目录以 `file://` 方式直接运行。

## 部署到 Cloudflare Workers

项目使用新版 Workers 的静态资源配置方式部署，无需单独编写 Worker 脚本：[wrangler.jsonc](file:///h:/tools/FootballSimulator/wrangler.jsonc) 中通过 `assets.directory` 将 `npm run build` 产出的 `dist/` 作为静态资源直接发布，并设置 `not_found_handling: "single-page-application"` 以支持单页应用回退。

前置条件：拥有 Cloudflare 账号（首次部署时 `wrangler` 会引导登录授权）。

```bash
# 一键构建并部署（等效于 npm run build && wrangler deploy）
npm run deploy

# 本地以 Workers 运行时预览构建产物（等效于 npm run build && wrangler dev）
npm run cf:preview
```

也可以使用 Wrangler CLI 单独执行：

```bash
npx wrangler login      # 登录 Cloudflare 账号（仅首次）
npx wrangler deploy     # 部署 dist/ 静态资源
npx wrangler dev        # 本地预览
```

部署完成后，Wrangler 会在输出中给出线上访问地址（形如 `https://efootball-simulator.<你的子域>.workers.dev`）。

## 礼包与概率

球员池共 3 个（定义见 `GIFT.json` 与 `src/data/packages.ts`）：

| 球员池 | 名称 | 球员数 |
| --- | --- | --- |
| A | 绿茵明星 | 24 |
| B | 群英荟萃 | 20 |
| C | 名将列传 | 15 |

礼包定义：

| 礼包 | 使用球员池 | 价格 | 单次抽中任一球员概率 | 抽取次数 |
| --- | --- | --- | --- | --- |
| 01 | A | 1680 | 10% | 2 |
| 02 | A | 4400 | 30% | 2 |
| 03 | A | 6800 | 100% | 1 |
| 04 | B | 6800 | 100% | 1 |
| 05 | A + B | 11800 | 100% | 1 |
| 06 | A + C | 9800 | 100% | 1 |
| 07 | C + A | 8800 | 100% | 1 |

每名球员的单次中奖概率 = 该面板出包概率 ÷ 池内球员数，详情弹窗中会逐名列出。

## 素材说明

- 球员卡与背景等资源由 `Picture/` 中的原始素材整理后放入 `public/assets/`，构建时随 `public/` 原样拷贝到 `dist/`。
- 音效原始文件为 `Sound/*.wma`，因 Electron / Chromium 无法解码 WMA，已转换为 mp3 存放在 `public/sound/`（`click.mp3`、`reset.mp3`）。

## 免责声明

本项目仅用于前端技术与交互效果的学习与交流，与任何游戏官方无关。
