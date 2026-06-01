import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gitee OpenAI-compatible client with correct authorization configuration
const giteeClient = new OpenAI({
  baseURL: "https://ai.gitee.com/v1",
  apiKey: "HHKM7PMBA4SKWMRZFQMLGZL73IMSUH8PVKF3FT1M",
  defaultHeaders: {
    "X-Failover-Enabled": "true"
  }
});

// Cache Gitee status state to allow sub-millisecond offline fallback on subsequent queries
let isGiteeOffline = false;

// Preset smart fallback responses if Gemini/Gitee is offline/unconfigured to keep the user experience seamless
const fallbackAnswers = [
  "作为 FashionAtlas 专属策展AI，我建议您关注当前的解构主义搭配。利用坚挺笔挺的廓形，配合下半身灵动微创意的褶边大裙或修长垂裤，能轻易在视觉层面完成力量感与艺术性的巧妙平衡。",
  "从时尚历史的积淀来考量，解构版型与非对称重塑是大名鼎鼎的安特卫普六君子及川玩雅等大师最擅长的叙事手法。而在当今的街头与秀场转换中，它更加充满机动功能性与硬核机甲力量美学。"
];

// Helper to get random fallback if needed
function getRandomFallback() {
  return fallbackAnswers[Math.floor(Math.random() * fallbackAnswers.length)];
}

// Low-latency, curator-grade offline backup generator
function getSmartCurationFallback(
  messages: any[],
  contextGarment: any,
  contextTrend: any
): string {
  const latestMessage = messages[messages.length - 1]?.content || "";
  const query = latestMessage.toLowerCase();

  // 1. If active garment is set
  if (contextGarment) {
    if (query.includes("裁剪") || query.includes("版型") || query.includes("廓形") || query.includes("工艺") || query.includes("力矩")) {
      return `【学理裁决】针对数字化馆藏「${contextGarment.name}」的版型与裁剪力矩：
      
其独特的先锋立裁工艺并非单纯的平面对冲，而是运用了解构学说中的「非对称力学纠偏」。${contextGarment.designer} 在设计中注入了标志性的肩袖支撑或褶裥转换，通过高精纺的（${contextGarment.materials}）产生挺括与重力的平衡。
在人体步履移动的力学变化中，衣服的轮廓随着重心转移而产生极其克制却诗意的褶裥流线。这种「冷硬硬核物理」与「有温度的人体起伏」交织，正是现代解构美学的巅峰。`;
    }
    if (query.includes("鞋") || query.includes("包") || query.includes("搭配") || query.includes("配饰") || query.includes("配件") || query.includes("公式")) {
      return `【策展级配对】关于「${contextGarment.name}」的鞋包器皿配对：
      
这件极富建筑学线条的馆藏，在视觉力矩上属于「重骨架/硬质廓形」。
1. **鞋履选择**：建议搭配一款带有「雕塑性底盘」的重皮大鞋或厚底切尔西靴。坚实的物理底部能够稳固上身的漂移剪裁，构成极富秩序感的“方尖碑”视觉基底。
2. **包袋与微配饰**：可配以冷峻几何线条的皮革手袋（如方尖碑托特包）。包袋提手随手侧折，与大衣边缘形成几何层级的交叉呼应。极细克制的硬币或暗哑银圈，是衬托高精纺（${contextGarment.materials}）肌理的黄金法则。`;
    }
    if (query.includes("历史") || query.includes("故事") || query.includes("节点") || query.includes("作者") || query.includes("设计")) {
      return `【历史镜像】透视「${contextGarment.name}」背后的时代波澜：
      
「${contextGarment.name}」不仅是一件时装，更是 ${contextGarment.designer} 对客观物理边界与主观情感宣泄的精妙缝合。
其设计灵感植根于：${contextGarment.history || "二十世纪末先锋剪裁浪潮（Avant-Garde Movement）"}。在这个阶段，大师们开始反思机器工业对纯粹自然的生硬侵蚀，通过生边缘处理、面料剥蚀、解构口袋和不规则拉链，模拟自然侵蚀的痕迹。其所用（${contextGarment.materials}）也是实验性研究的重要材料，是对古典奢华（Luxury）的一种革命性解构反叛。`;
    }
    // Default reply when garment is selected
    return `关于数字化馆藏「${contextGarment.name}」，其在先锋语境下被赋予了极其崇高的物理表达：
    
1. **先锋廓形**：由大师 ${contextGarment.designer} 执掌设计，具备极为高冷的艺术质感。
2. **工艺本质**：在用料上选取精贵的 ${contextGarment.materials}，完美塑造其「${contextGarment.description}」。
3. **搭配指南**：鉴于其具有「${contextGarment.details?.join("、") || "建筑感褶皱与挺阔结构"}」的力学深度，您可以将此单品置于【搭配公式】的‘核心主骨骼（CORE OUTERWEAR）’中。

有什么具体到这款馆藏的剪裁细节、历史流变或力学配比疑惑，我可以为您进一步深度解剖。`;
  }

  // 2. If active trend is set
  if (contextTrend) {
    if (query.includes("公式") || query.includes("搭配") || query.includes("推荐") || query.includes("怎么搭")) {
      return `【配比推荐】本周焦点趋势「${contextTrend.name}」的流线配比法则：
      
在本次趋势大片中，左侧推荐的代表单品（如：${contextTrend.keyItems?.join("、") || "本期核定单品"}）具有强烈的「功能性外壳与流线型褶皱的共存主义」。
1. **硬质外壳**：作为搭配的上半身主骨架（CORE OUTERWEAR），以重构肩膀与极简无门襟设计来锚定视线。
2. **中轴线流动**：下半身采用具有极佳弹性与摆动力的不对称重磅褶裥半裙或宽管马甲长裤，形成气流起落的生动错觉。
3. **点缀法典**：去除所有实心装饰块。首尾相接，将手袋及雕塑感后跟鞋作为流线折射点，达成物理标本般的严谨高冷。`;
    }
    if (query.includes("变因") || query.includes("社会") || query.includes("趋势") || query.includes("解构")) {
      return `【大变局剖析】关于「${contextTrend.name}」的深层社会变因：
      
正如策展人手记（${contextTrend.comment}）所述，这一波趋势并非凭空出世的审美，它在服装史中象征着「后工业时代的反防护叙事」。
在当前充满不确定性的社会语境中，大众对服饰的诉求产生了分化：一方面极度依赖如“装甲”般坚硬、能将身体妥妥包裹并保护盾化的大衣外壳；另一方面，又极度渴求溪流般的柔软与诗性。
通过不规则重磅折裥等工艺将两者巧妙杂糅，这设计本身就是对现代都市焦虑与浪漫情怀的视觉缝合。`;
    }
    return `【策展札记】深入本期《${contextTrend.week} 版型趋势 • ${contextTrend.name}》：
    
根据我们的秀场微缩研究，这一主题在当前引起了强烈的解构共鸣：
- **核心态度**：其折射的是「${contextTrend.comment}」。
- **标志配置**：本周核定的三大单品为 ${contextTrend.keyItems?.join("、") || "方尖碑折叠手袋等"}。它们之间以极细墨迹水平线切割，浮于高纯度羊皮纸底色中。
- **推荐策略**：高纯度的羊皮纸色（#F6F4E8）或炭灰能成为该趋势最完美的背景。`;
  }

  // 3. Generic avant-garde questions (e.g., Antwerp Six, silhouttes, etc.)
  if (query.includes("安特卫普") || query.includes("贡献") || query.includes("六君子")) {
    return `【先锋编年史】安特卫普六君子（Antwerp Six）的不朽传奇与裁剪革命：
    
在20世纪80年代（1986年伦敦时装周），六位毕业于安特卫普皇家艺术学院的年轻人（Dries Van Noten, Ann Demeulemeester, Walter Van Beirendonck, Dirk Bikkembergs, Dirk Van Saene, Marina Yee）在一辆租来的旧卡车里发表了震撼时装界的无名群秀。

他们的核心历史贡献，可以完美归纳为：
1. **打破古典严正的对称法度**：他们撕碎了法式高定一成不变的沙漏廓形与极致对称。将生边缘（Raw Edges）、拼贴、水洗、以及故意洗缩变形的织物带入神圣秀场。
重构性别的物理符号，Ann Demeulemeester 笔下的中性诗人、Walter 极富反叛性的波普亚文化，颠覆了男女装之间不可逾越的鸿沟。
2. **时尚平权哲学**：主笔低调诗意的褶折和折叠，将边缘文化与对宏大叙事的嘲弄注入衣片缝纫，奠定了现代「解构主义时尚」的骨核。`;
  }

  if (query.includes("不规则") || query.includes("褶皱") || query.includes("褶裥") || query.includes("鞋") || query.includes("黄金法则")) {
    return `【工艺黄金法则】在面料上引入不规则的重磅褶裥，搭配雕塑底盘厚鞋，是塑造现代先锋艺术感的黄金法则：
    
1. **视觉波形**：重磅羊毛或特殊热定形面料在经过不规则折叠压裥后，每一步行进都会形成物理重力引发的光影切片，呈现出有厚度的空间阴影。
2. **基底压制**：如果搭配轻薄的单鞋，很容易显得上重下轻，流于浮躁。必须依靠一双大体量、拥有重型“雕塑底盘”的手工粗皮厚鞋或硬朗短靴进行“地球重力锚定”。
3. **视觉张力**：上身的灵动气流起落与下层厚鞋沉实的几何直线碰撞，会在人腿中段形成奇妙的横切比例，流露出高冷深沉、不发一言的馆藏级别艺术张力。`;
  }

  if (query.includes("搭配") || query.includes("高定") || query.includes("廓形") || query.includes("街头")) {
    return `【美学调和公式】如何用经典高级定制廓形，精妙调和当代街头主义的狂放？
    
这是一个极其高级的比例游戏。我们可以提炼成以下两个核心步骤：
1. **「骨架置换」**：将硬朗高定的核心结构单品（如：带有大垫肩的立裁西装或沙漏大衣）作为主要的「核心外壳 (CORE OUTERWEAR)」；但在内搭上反其道而行，剥离传统对称，引入带有一点脏污破坏边缘、或者不对称重压折叠高定流线。
2. **「下层溃散」**：保持上身的皇室般庄严克制，下半身裤腿却向下摆动悬垂，呈现出一种坠落的重力物理学（Drop-silhouette）。
3. **美学逻辑**：高级时装的「庄严骨骼」与街头服饰的「疲惫和收缩感」重合，创造出最摄人心魄的力量张力。`;
  }

  // Fallback to random fallback answers
  return `【FashionAtlas 智能策展专员解答】
  
${getRandomFallback()}

您可以选择点击界面左侧的「具体数字化馆藏（ARCHIVE IMAGES）」或「周趋势（TREND TOPICS）」绑定上下文，问我更具工艺针对性的美学解剖！`;
}

// REST API for chatbot interaction (using Gitee Qwen3-32B via OpenAI client)
app.post("/api/chat", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const body = req?.body || {};
    const messages = body.messages;
    const contextGarment = body.contextGarment || null;
    const contextTrend = body.contextTrend || null;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid parameters. 'messages' must be an array." });
      return;
    }

    // Fast-failover: if Gitee has already timed out or failed previously, return fallback immediately
    if (isGiteeOffline) {
      const fallbackReply = getSmartCurationFallback(messages, contextGarment, contextTrend);
      res.json({
        text: fallbackReply,
        simulated: true,
        isFastFallback: true
      });
      return;
    }

    // Inject active garment or trend context on top of user query to make AI highly aware
    let systemInstruction = `You are "FashionAtlas 智能时尚策展专家", an elite digital fashion curator and stylistic consultant with deep knowledge of fashion history, material developments, haute couture, avant-garde design (e.g., Margiela, Yohji, Issey, McQueen), and contemporary styling formula.
    
Coordinate your speech in professional, inspiring, elegant, yet objective Chinese (简体中文). Avoid generic talk, provide structured analysis, cite styling coordinates or historical silhouettes. Do not use verbose phrases or markdown text() method syntax inside API responses.`;

    if (contextGarment) {
      systemInstruction += `\n\n[Active Context Item: ${contextGarment.name} (${contextGarment.designer})]\nDescription: ${contextGarment.description}\nHistory: ${contextGarment.history}\nMaterial: ${contextGarment.materials}. Discuss this piece thoroughly if relevant to user input.`;
    }
    if (contextTrend) {
      systemInstruction += `\n\n[Active Topic: Weekly Trend ${contextTrend.name}]\nEditorial Comment: ${contextTrend.comment}\nKey Elements: ${contextTrend.keyItems?.join(', ') || ''}. Connect this with user coordinates if they ask for advice.`;
    }

    // Build OpenAI Format Messages List
    const formatMessages: any[] = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    // Call Gitee AI chat completion with a low-latency 1.8s timeout to remain ultra-responsive
    const response = await giteeClient.chat.completions.create({
      model: "Qwen3-32B",
      messages: formatMessages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.7
    }, {
      timeout: 1800 // Give Gitee 1.8 seconds to reply; if unreachable, gracefully switch to fast curation engine
    });

    const replyText = response.choices?.[0]?.message?.content || "抱歉，我的时尚先锋数据层暂未响应，请稍后再试。";
    res.json({ text: replyText, simulated: false });

  } catch (error: any) {
    console.warn("API Gitee completed or timed out, executing ultra-polished curator fallback model:", error);
    
    // Set status to true so future calls don't block the UI thread waiting for the remote Gitee timeout
    isGiteeOffline = true;

    // Graceously provide a high-end customized fallback directly so user experiences zero friction
    const body = req?.body || {};
    const msgs = body.messages || [];
    const contextGarment = body.contextGarment || null;
    const contextTrend = body.contextTrend || null;

    const fallbackReply = getSmartCurationFallback(msgs, contextGarment, contextTrend);
    res.json({
      text: fallbackReply,
      simulated: true,
      errorDetail: error?.message || (error ? String(error) : "Connection Timeout")
    });
  }
});

// Configure Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production builds serve statically
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FashionAtlas Full-Stack App Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
