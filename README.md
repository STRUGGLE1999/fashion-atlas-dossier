# FashionAtlas • 数字化时尚学术馆藏与智慧策展系统

> **FashionAtlas** 是一款面向先锋剪裁、经典廓型与流线织物的**馆藏级数字化学术档案与个人灵感策展系统**。它将传统的实体时装馆藏与先锋人工智能底盘结合，提供沉浸式的学术检索、工艺分解及人机对谈策展体验。

**线上体验地址**：[https://fashion-atlas-dossier.vercel.app](https://fashion-atlas-dossier.vercel.app)

<img width="2548" height="1328" alt="image" src="https://github.com/user-attachments/assets/371e723f-6f59-4f37-84e0-64ee7738891d" />


---

## 🎨 网页设计风格剖析 (Aesthetic & Editorial Design Philosophy)

FashionAtlas 抛弃了当下千篇一律的 SaaS 模块化控制面板样式（SaaS-ification），转而向**先锋学术期刊**与**古典物理印刷文献**致敬。其核心视觉语言可以概括为：**纸本重力 (Tactile Ink)、边框溶解 (Borderless Liberation) 进阶与网格纪律 (The Grid Discipine)**。

### 1. 呼吸感色彩与纸张肌理 (Parchment & Crimson Colorway)
- **大面基底**：全站采用雅致的 `#F6F4E8` 羊皮纸暖调灰（Warm Off-White）作为画布背景。这种低对比度、对视力极其友好的暖调，还原了物理书籍和羊皮纸文献的粗粝与真实感。
- **高定点缀色**：采用深沉克制的**勃艮第红 / 沉寂红 (`#5C1D24` / `#800020`)** 作为学术重点色、星芒图标与微弱交互引导色，搭配深色炭灰 (`#121212`)，洗脱了商业科技刺眼的霓虹饱和度，传递出历史学者般的睿智底蕴。

### 2. 边框溶解与通透材质 (Borderless Liberation)
- **彻底消融实体盒子**：在馆藏详情区等核心区块，我们主动对冗余的半透明卡片圆角白底盒进行了强力“减法”。
- **视差流动感**：文字和高保真大图毫无遮挡地直接平铺于羊皮纸底色之上。当滚动页面时，无卡片框束缚的正文呈现出极度通透、清脆的视觉反馈，并平滑地掠过拥有毛玻璃（backdrop-blur）效果的固定顶部学术导航栏。

<img width="2488" height="1312" alt="image" src="https://github.com/user-attachments/assets/b4c74212-74ce-40b6-b07b-5f9ca9ee763c" />


### 3. 古老印刷术的字重与符号秩序 (Classical Typographic Discipline)
- **字重去重化**：文章主干正文大面积调用最纤细的 `Light (font-light)` 或 `Regular` 字重（font-sans / font-serif 混合配置），绝不在非标题处滥用大面积粗体，让字里行间透出纸面呼吸，还原细腻的手工金属排版印刷质感。
<img width="2356" height="1286" alt="image" src="https://github.com/user-attachments/assets/04ae0840-6aff-453d-bb19-92c8fd566ed6" />

- **罗马数字纪律**：在关键工艺解析、学习价值等清单处，消除刺眼的“网页引导式”粗体阿拉伯数字，全部重构为古董印刷文献专用的中括号罗马数字（如 `[ I ]`、`[ II ]`、`[ III ]`），以最尊贵的斜体衬线体静静安放。
<img width="2440" height="1320" alt="image" src="https://github.com/user-attachments/assets/9f0fc4c5-1903-47c5-a622-ca93aaaaa026" />

- **元数据微型化**：分类标签、系统标示处（如 `// MUSEUM REFERENCE CLASSIFIED`），通过无衬线字母全大写、超宽字间距（`tracking-[0.25em]`）进行视觉降级。去除一切彩色货架 Emoji，以前置极细单色几何双斜线（`//`）指引，树立严苛的高定工艺标本仪式感。

<img width="2374" height="1264" alt="image" src="https://github.com/user-attachments/assets/cb048cfe-8b4f-4307-9bda-1e268973da19" />


### 4. 考据文献五线谱网格 (The Grid Lines)
- 摒弃了各种厚重突兀的纯色圆角容器。模块间的空间区隔与逻辑拆分，统一使用全站最高规格的**极细丝线** `1px solid rgba(42, 43, 42, 0.06)` 横贯整个版面，如同一根根纤细的蚕丝线把学术框架有条不紊地悬挂在半空，形成了诗意盎然、有迹可循的视觉轨道。

<img width="2314" height="1244" alt="image" src="https://github.com/user-attachments/assets/f4dc179d-f517-43fc-a39e-70905297b28d" />


---

## 🏛️ 系统核心功能 (Key Architectural Features)

1. **灵感探索面板 (Discover Layout)**
   - 包含趋势演变话题轮播、学术多维矩阵、和专为先锋学者设立的时装演化三维交互坐标系。
<img width="2140" height="1216" alt="image" src="https://github.com/user-attachments/assets/7015cf21-01e9-4348-a02c-06a1825075dd" />

2. **数字化学术馆藏 (The Vault - Digital Archives)**
   - 深度收录**【解构剪裁 (Deconstructive Tailoring)】**、**【参数化编织 (Parametric Knitting)】**与**【黄金时代廓形 (Hourglass of Golden Age)】**等殿堂级服装结构。
   - 每项馆藏均配备了详尽的**历史美学叙事**、**版型材料特征**、以及**[ I ] [ II ] [ III ] 古董工艺纪律**的学术价值清单。
<img width="2424" height="1292" alt="image" src="https://github.com/user-attachments/assets/f7413842-8862-4d3a-9a29-4f77c46c7086" />

3. **智慧对谈策展人 (Curator AI Assistant)**
   - 右下角神秘红星芒常驻。自主开发了基于 Gitee Qwen3-32B 深度学术大模型的对话引擎；在外部网络波动或接口超时的情况下，配置了毫秒级的**馆藏策展导师兜底逻辑**，智能适配当前正在阅览的工艺文献。
   - 对话生成的每一个高阶美学见解均支持**“一键保存至面板”**，自动同步生成对应的精美学术笔记档案卡片。
<img width="758" height="1322" alt="image" src="https://github.com/user-attachments/assets/c5a95969-f4ff-4993-b0ca-d8551f6ba24d" />

4. **个人策展灵感看板 (Personal Moodboard & Notebook)**
   - 清晰展现自主撰写的手记与一键归档的数理公式。
   - 内置强大的 **Dossier（数字灵感报告）** 平行导出协议，让您一键打包所有灵感存档。
<img width="2260" height="1258" alt="image" src="https://github.com/user-attachments/assets/fd3dd39c-6ef6-4557-b871-273d3d19bd0f" />

---

## 🛠️ 技术底盘与部署信息 (Technology Stack)

- **前端架构**：React 18 + Vite
- **动效处理**：`motion` (import from `motion/react`)
- **交互图标**：`lucide-react`
- **样式系统**：Tailwind CSS (Vite 4 代原生编译规范，`@import "tailwindcss";` 高定层级整合)
- **后端中间件**：基于 Express.ts 的 Vite 中间件，自动融合生产环境 esbuild CommonJS 单文件分发与跨域 API 代理
- **容灾设计**：`/api/chat` 自带零阻塞 Gitee Timeout Failover 熔断架构，最大程度确保学术交流顺畅
