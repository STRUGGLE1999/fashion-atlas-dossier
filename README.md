# FashionAtlas • 时装数字档案与策展原型

> **FashionAtlas** 把先锋剪裁、风格辞典和私人灵感板放进同一个阅读界面，并用 Gemini 兼容接口做有边界的策展对谈：只基于当前条目和站内文献回答，再把回答沉淀成可导出的 Dossier。

**线上体验**：[https://fashion-atlas-dossier.vercel.app](https://fashion-atlas-dossier.vercel.app)

<img width="2548" height="1328" alt="image" src="https://github.com/user-attachments/assets/371e723f-6f59-4f37-84e0-64ee7738891d" />

当前是一份可演示的产品原型，不是完整博物馆。第一用户是国内非科班的时尚爱好者：想看国外秀场和品牌动态，但经常碰到语言、付费墙和来源分散。知识库体量为：**20 条风格辞典、12 本书、14 场秀、10 件馆藏示意、1 篇美学大纲、1 条教学趋势样本、1 条穿搭公式、1 部电影**。配图为教学示意，不是馆藏原件扫描。

资讯策略是「公开外刊 RSS → 中文简报 → 保留原始链接」，不是转载全文，也不是全网热搜聚合。当日简报未写入时，首页会明确写尚未发布。

---

## 网页设计风格

FashionAtlas 不用常规 SaaS 控制台，而向学术期刊和印刷文献靠近：羊皮纸底 `#F6F4E8`、勃艮第红点缀、细线网格、罗马数字清单、宽字距元数据。详细视觉说明见历史 README 截图。

---

## 现在实际能做什么

1. **灵感与风格辞典**  
   20 条风格条目（廓形、材料、避坑）、场景公式，以及趋势/书架/秀场列表。

2. **数字档案 The Vault**  
   10 件教学用馆藏卡（Margiela Tabi、YSL Le Smoking、McQueen 犰狳鞋等），可绑定给 AI 对谈或存入灵感板。

3. **策展助手 Curator AI**  
   右下角入口。服务端走 Gemini 兼容协议（默认中转 `https://api.aicodemirror.ai/api/gemini`）。模型名和 API Key 写在本地 `.env`。无 Key、超时或接口失败时，回落到站内文献兜底，不假装模型在线。

4. **灵感板与 Dossier**  
   保存馆藏、笔记和 AI 整理后的灵感卡，可导出 PDF。身份为匿名 Cookie，不是账号系统。

5. **每日资讯**  
   每天北京时间 8:00 由 GitHub Actions 起草简报，自动合并写入 `data/daily_curation.json`。若当日文件未发布，首页会明确写「今日资讯尚未发布」，并展示馆藏教学样本。趋势手记是 2024 W43 教学样本，不是本周直播。

---

## 技术栈与本地配置

- 前端：React 19 + Vite + Tailwind CSS 4 + Motion
- 本地服务：Express（`tsx server.ts`）
- 生产：Vercel SPA + `api/*` Functions
- 模型：Google GenAI SDK，Base URL / Model / Key 全部来自环境变量
- 数据：`data/*.json` 知识库；可选 Neon Postgres 持久化灵感板和每日简报

在项目根目录复制并编辑 `.env`：

```
GEMINI_BASE_URL="https://api.aicodemirror.ai/api/gemini"
GEMINI_API_KEY="你的中转站 Key"
GEMINI_MODEL="gemini-3.7-flash"
AI_REQUEST_TIMEOUT_MS="30000"
```

`GEMINI_MODEL` 必须改成该中转站控制台里真实列出的模型 ID。SDK 会在 Base URL 后拼接 `/v1beta/models/{模型}:generateContent`。

```bash
npm install
npm run dev
```

生产环境需要在 Vercel 项目设置里配置同样的变量，`.env` 只作用于本地。

## 首页每日焦点（GitHub Actions）

每天北京时间 8:00（UTC 00:00）由 GitHub Actions 跑策展 Agent，合格则打开 PR 并自动合并，随后 Vercel 更新生产站首页「今日焦点」。仓库 Secrets 需配置 `GEMINI_API_KEY`、`GEMINI_BASE_URL`、`GEMINI_MODEL`。也可在 Actions 页手动 Run workflow。

## 黄金问题评测

人口读清单见 [`data/eval/golden-questions.md`](data/eval/golden-questions.md)。机器用 `data/eval/golden.json`。先开 `npm run dev`，再跑 `npm run eval:golden`。结果写到 gitignore 的 `data/eval/last-run.json`。脚本只做词面和 URL 检查，对错仍以你抽读为准。

