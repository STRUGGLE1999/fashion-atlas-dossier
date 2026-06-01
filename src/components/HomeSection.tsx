import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Compass, 
  Bookmark, 
  CheckCircle, 
  BookOpen, 
  User, 
  Calendar, 
  Tag, 
  CloudRain, 
  AlertTriangle,
  FolderPlus,
  HelpCircle
} from "lucide-react";
import { styleEntries, archiveItems, runwayShows } from "../data";
import { StyleEntry, MoodboardItem } from "../types";

interface HomeSectionProps {
  onSaveStyleToMoodboard: (title: string, summary: string, tags: string[]) => void;
  savedItemIds: string[];
  interactiveMode?: "none" | "translator" | "structures" | "scenarios";
  onInteractiveModeChange?: (mode: "none" | "translator" | "structures" | "scenarios") => void;
}

export default function HomeSection({
  onSaveStyleToMoodboard,
  savedItemIds,
  interactiveMode,
  onInteractiveModeChange,
}: HomeSectionProps) {
  const [localInteractiveMode, setLocalInteractiveMode] = useState<"none" | "translator" | "structures" | "scenarios">("none");
  const activeInteractiveMode = interactiveMode !== undefined ? interactiveMode : localInteractiveMode;
  const setActiveInteractiveMode = onInteractiveModeChange !== undefined ? onInteractiveModeChange : setLocalInteractiveMode;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeScenario, setActiveScenario] = useState<"office" | "date" | "resort" | "interview">("office");

  // Selection state for style details inside structure map
  const [selectedStyleId, setSelectedStyleId] = useState<string>("quiet-luxury");

  // Filtered styles based on user query
  const filteredStyles = styleEntries.filter(
    (style) =>
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.enName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.vibeWords.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedStyle = styleEntries.find((s) => s.id === selectedStyleId) || styleEntries[0];

  // Scenarios data
  const scenariosData = {
    office: {
      title: "严密精英通勤面法则 (Intellectual Commute)",
      vibe: "智性、节制、低反差、冷调力量",
      keyFormula: "写字楼塞壬 / 经典极简：一刀切高腰西裤 + 微开扣真丝衬衫 + 细金框架眼镜",
      avoid: "大面积明艳亮色、臃肿的卫衣、过度褶皱或大面积软透雪纺裙。",
      mainColors: ["#121212 / 深炭黑", "#FAF9F6 / 纸张白", "#4A3B32 / 焦糖棕", "#CBD5E1 / 雾中蓝"],
      tip: "通过精巧的袖口金属反扣、平滑哑光的胎牛皮大包袋，锁定大方沉静的学术与气场感。"
    },
    date: {
      title: "高定微醺约会夜法则 (Chamber Date Night)",
      vibe: "古典浪漫、明暗对比、戏剧折边、微露性感",
      keyFormula: "黄金时代廓形 / 哥特暗黑：不对称一字肩悬挂针织衫 + 暗提花重真丝半裙 + 手折麂皮包",
      avoid: "高能荧光机能涂层面料、厚重大多口袋户外工装、死板正装西服。",
      mainColors: ["#5C1D24 / 勃艮第红", "#121212 / 漆黑", "#E5E1D8 / 燕麦白", "#A21CAF / 暗紫罗兰"],
      tip: "在领口、手腕处加入微透荷叶折边作呼吸感过渡，利用昏暗光线形成斑驳细腻的戏剧感影深。"
    },
    resort: {
      title: "自由艺术旅居流浪法则 (Resort Wanderer)",
      vibe: "随性慵懒、天然纹理、手织提花、巨大空间感",
      keyFormula: "自由波西米亚 / 田园牧歌：泡泡袖高抽褶棉麻罩衫 + 提花磨毛围裙裙摆 + 舒适软木套靴",
      avoid: "带硬性强反光拉链的城市机能服装、高度勒紧的塑形包裙、死板一步铅笔裙。",
      mainColors: ["#825032 / 麂皮草褐", "#FAF0E6 / 浅杏粉", "#2B3E2F / 苔原绿", "#EAB308 / 阳光浅黄"],
      tip: "利用天然木质扣具、手编原绳以及超大容量藤篮，强调彻底卸下数字劳动的牧歌美感。"
    },
    interview: {
      title: "常春藤学者气场会晤法则 (Scholarly Curation)",
      vibe: "书香信誉、克制对称、学术质感、无侵略性高贵",
      keyFormula: "常春藤运动风 / 暗黑学院风：平驳领落肩西服 + 板球绞针V领羊毛针织 + 英伦牛津鞋",
      avoid: "邋遢不羁西雅图垃圾撕烂装、超低腰Y2K露腹裤、过分尖锐的厚重哥特外露皮质长袍。",
      mainColors: ["#1E3A8A / 经典牛津蓝", "#800020 / 学府红", "#FAF9F6 / 象牙白", "#747875 / 水泥灰"],
      tip: "将头发梳理干练，配饰使用暗哑无反光的木质、纯皮材质，在考究的对称美中呈现饱满信赖阶层感。"
    }
  };

  const handleCollectStyle = (style: StyleEntry) => {
    const summary = `【${style.name} (${style.enName})】
简介：${style.definition}
版型特征：${style.keySilhouette}
物料选择：${style.keyMaterials}
穿搭法则：${style.dailyWearTip}
避坑指南：${style.commonPitfall}`;
    onSaveStyleToMoodboard(`《${style.name}》风格解构卡片`, summary, ["风格解构", ...style.vibeWords]);
  };

  const handleCollectScenario = (scenarioKey: string) => {
    const data = scenariosData[scenarioKey as keyof typeof scenariosData];
    const summary = `【${data.title}】
核心气场：${data.vibe}
推荐穿衣公式：${data.keyFormula}
绝对避坑禁忌：${data.avoid}
专业搭配建议：${data.tip}`;
    onSaveStyleToMoodboard(data.title, summary, ["场景应用", "穿衣法则"]);
  };

  return (
    <div className="space-y-12 select-none animate-fade-in">
      
      {/* 2.1 Editorial Top Header */}
      <div className="border-b border-[#121212]/10 pb-6 flex flex-col md:flex-row items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#800020] uppercase font-bold block mb-1">MUSEUM ANCHOR DIRECTORY</span>
          <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#121212] tracking-tight">
            全球时尚先锋策展与审美降噪
          </h2>
          <p className="text-xs text-[#121212]/60 mt-1 max-w-2xl font-sans">
            将全网零散的时装周秀场、经典高定文献、时尚书架，转化为普通人可执行的穿衣哲学。无对谈完成一次审美启动。
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#121212]/40 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>CURATOR ONLINE (MUSEUM PRO ENGINE)</span>
        </div>
      </div>

      {/* 7:3 Asymmetric Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
       {/* Left 70%: Today's Focus (今日焦点) */}
        <div className="lg:col-span-8 flex flex-col justify-between group">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#800020] font-bold">
                今日焦点 • Today's Focus
              </span>
              <span className="text-[10px] font-mono text-[#121212]/40 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#121212]/55" /> {new Date().toLocaleDateString()} / EDITION #01
              </span>
            </div>

            {/* Impressive Large Image with 8px curves */}
            <div className="relative rounded-lg overflow-hidden aspect-[16/9] md:aspect-[21/9] border border-[#121212]/5 shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200"
                alt="Margiela Playground Debut 1989"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
              />
            </div>

            {/* Image Headline & Metadata moved out & below for absolute typography contrast */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[9.5px] font-mono tracking-[0.25em] text-[#800020] uppercase font-bold">SEMINAL CHRONICLE MOUNT</span>
                <span className="text-[#121212]/20 text-[9px] font-mono select-none">|</span>
                <span className="text-[9.5px] font-mono tracking-wider text-[#121212]/50 uppercase font-bold">PARIS DEBUT 1989</span>
              </div>
              <h3 className="font-sans font-bold text-[#121212] text-xl sm:text-2.5xl tracking-tight leading-tight">
                马吉拉 1989 儿童操场大秀：给虚伪时装秩序的废墟之吻
              </h3>
            </div>

            {/* Editorial Intros / Quotes of the Editor with hanging punctuation for perfect vertical alignment */}
            <p className="font-serif italic text-[#121212]/85 text-sm leading-relaxed border-l-2 border-[#800020] pl-3.5 text-justify max-w-3xl pt-1">
              <span className="inline-block -ml-1.5 text-[#800020] font-sans font-bold pr-0.5 select-none text-[15px] leading-none">“</span>1989年的巴黎市郊，没有传统秀场的长笛与香槟，马吉拉让一众平民孩子挂在模特的毛边报纸碎衣角上共同奔跑。这场大秀像一粒巨无霸炸弹撞碎了法国资产阶级传统的假模假样，正式开创了解构主义服饰的百年圣殿。”
            </p>

            <div className="text-xs text-[#121212]/70 leading-relaxed font-sans text-justify space-y-2">
              <p>
                这场秀证明了：时装不仅仅是消费和炫耀，它是关于重力、废墟纹理、社会冲突以及穿着者如何建立精神护盾的流动戏剧。这也是为什么 FashionAtlas 在今日首推
                <strong>「安特卫普先锋与解构」</strong> 作为大家对抗都市焦虑、获得穿衣底气的起点。
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-[#121212]/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-[9px] font-mono text-[#121212]/60 tracking-wider hover:text-[#800020] transition-colors">#安特卫普六君子</span>
              <span className="text-[#121212]/15 text-[10px] select-none">•</span>
              <span className="text-[9px] font-mono text-[#121212]/60 tracking-wider hover:text-[#800020] transition-colors">#解构圣殿</span>
              <span className="text-[#121212]/15 text-[10px] select-none">•</span>
              <span className="text-[9px] font-mono text-[#121212]/60 tracking-wider hover:text-[#800020] transition-colors">#废墟反抗</span>
              
              <span className="w-1.5 h-1.5 bg-[#121212]/10 rounded-full mx-1"></span>

              <a
                href="#/resource/deconstructed-tailoring"
                className="text-[10.5px] font-sans font-medium text-[#800020] hover:text-[#5C1D24] flex items-center gap-1.5 bg-transparent hover:bg-[#121212]/5 border-b border-[#800020]/20 hover:border-[#5C1D24]/40 py-0.5 px-0 transition-all font-medium"
                id="btn-spotlight-deeplink"
              >
                <span>立即剖析解构力量馆藏 ↗</span>
              </a>
            </div>
            
            <p className="text-[10px] text-[#121212]/40 font-mono tracking-widest uppercase">
              Curation Drafts Checked • No.13 Approved
            </p>
          </div>
        </div>

        {/* Right 30%: 5-Minute Aesthetic Starter Area (5分钟审美启动区) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="border-b border-[#121212]/10 pb-2">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#121212]/50 uppercase font-semibold block mb-1">CURATOR ACTION KIT</span>
            <h3 className="font-serif font-bold text-sm text-[#121212] uppercase flex items-center gap-1 italic">
              <Sparkles className="w-4 h-4 text-[#800020] animate-pulse" />
              5分钟审美物理启动区
            </h3>
          </div>

          {[
            {
              id: "translator",
              title: "趋势行业翻译机",
              desc: "一秒解密网络最难懂的时尚词汇（Quiet Luxury, Office Siren 等）为可调度的物理指标。",
              vibe: "translator",
              icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={props.className}>
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <rect x="9.5" y="9.5" width="5" height="5" className="fill-[#E5E0D8] stroke-[#121212]" strokeWidth="1.25" />
                </svg>
              )
            },
            {
              id: "structures",
              title: "先锋风格结构图",
              desc: "解锁包含20个风格细分模型的审美辞典，细分其廓形、用料和避坑禁忌并一键收藏。",
              vibe: "structures",
              icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={props.className}>
                  <path d="M4 6h16M4 12h16M4 18h16" />
                  <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2" />
                  <polygon points="12,8 15,12 12,16 9,12" className="fill-[#121212]/20" strokeWidth="1" />
                </svg>
              )
            },
            {
              id: "scenarios",
              title: "场景搭配实战则",
              desc: "最真实的四大日常情境（通勤、约会、旅居等）的专属公式配置以及禁忌排雷。",
              vibe: "scenarios",
              icon: (props: React.SVGProps<SVGSVGElement>) => (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className={props.className}>
                  <circle cx="12" cy="12" r="8" strokeDasharray="3 2" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <circle cx="12" cy="12" r="2.5" className="fill-[#121212]" />
                </svg>
              )
            }
          ].map((card) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                key={card.id}
                onClick={() => setActiveInteractiveMode(card.vibe as any)}
                className={`bg-[#E5E0D8]/40 hover:bg-[#E5E0D8]/70 border border-[#121212]/10 p-5 rounded-lg text-left cursor-pointer transition-all flex flex-col justify-between h-36 ${
                  activeInteractiveMode === card.vibe ? "bg-[#d9d2c6] border-[#121212] shadow-xs ring-1 ring-[#121212]" : ""
                }`}
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#121212] flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CardIcon className="w-4 h-4 text-[#121212]/75" />
                      <span>{card.title}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#121212]/45 stroke-2" />
                  </h4>
                  <p className="text-[11px] text-[#121212]/70 font-sans mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <span className="text-[9px] font-mono tracking-widest text-[#121212]/50 uppercase mt-2 block self-end font-medium">
                  LAUNCH CURATOR UNIT →
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Embedded Dynamic Curation Modules Panel */}
      <AnimatePresence mode="wait">
        {activeInteractiveMode !== "none" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border border-[#121212]/15 rounded-lg p-6 sm:p-8 shadow-sm relative bg-[#E5E0D8]"
          >
            {/* Close Button simplified to a pure wire-thin ✕ with no background */}
            <button
              onClick={() => setActiveInteractiveMode("none")}
              className="absolute top-5 right-5 text-[#121212]/50 hover:text-[#800020] transition-colors focus:outline-none cursor-pointer z-30"
              id="btn-close-interactive-module"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* CASE 1: TREND TRANS JARGON TRANSLATOR */}
            {activeInteractiveMode === "translator" && (
              <div className="space-y-6">
                <div className="border-b border-[#121212]/10 pb-3">
                  <span className="text-[9px] font-mono text-[#800020] uppercase font-bold tracking-widest block mb-1">TOOL INTERACTION A</span>
                  <h3 className="font-sans font-black tracking-widest text-[#121212] text-xl sm:text-2xl uppercase">
                    趋势流行词解密翻解机 <span className="font-serif italic text-[#800020] lowercase tracking-normal font-normal text-lg sm:text-xl ml-2 font-medium">Stealth Luxury Decrypt</span>
                  </h3>
                  <p className="font-serif italic text-xs text-[#121212]/75 mt-2 max-w-3xl leading-relaxed text-justify">
                    这里拒绝抽象堆砌。我们直接将碎片化平台上那些复杂的概念，拆解成您可以物理购买或缝配的实干指标：
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 border-t border-b border-[#DCD6CC] divide-y divide-[#DCD6CC] md:divide-y-0">
                  {[
                    {
                      buzz: "静奢风 (Stealth Wealth / Quiet Luxury)",
                      mean: "无标志极高品质基础款。",
                      trans: "去LOGO化、羊绒、中性大地色、不贴身落肩裁剪，模拟不需要依靠标签证明价值的笃定感。"
                    },
                    {
                      buzz: "写字楼塞壬 (Office Siren)",
                      mean: "冷静禁欲与侵略性女性张力的完美博弈。",
                      trans: "金属窄边框架眼镜、贴身收腰白衬套、紧身铅笔一步裙。让办公室传统呆板西服沦为性感的舞台反衬。"
                    },
                    {
                      buzz: "山系机能 (Gorpcore / GORE-TEX)",
                      mean: "逃避都市劳作、崇拜重型科技防护的机能美学。",
                      trans: "大立体带拉松口袋工装裤、高领拉至下颌的防水压胶冲锋大衣、厚底越野防滑大底鞋。"
                    },
                    {
                      buzz: "芭蕾少女风 (Balletcore)",
                      mean: "将排练动作下汗水身体控制与极浪漫交织。",
                      trans: "真丝交叉绑带暖脚套、一字肩锁骨露大棉背白衫、平底芭蕾一字扣单鞋、蓬蓬双层网纱裙遮边。"
                    },
                    {
                      buzz: "安特卫普主义 (Deconstruction)",
                      mean: "解构时装、呈现物理骨骼破烂美学的圣地哲学。",
                      trans: "非对称毛边走线、露在西装外边的针脚棉布里、拼贴不规则大下摆。抗拒完美机械，留存手工反叛线。"
                    },
                    {
                      buzz: "暗黑学院风 (Dark Academia)",
                      mean: "古典图书馆对死亡、纸张与古典人文浪漫的淡淡抑郁。",
                      trans: "重磅Harris苏格双面花呢、做旧粗绞针麻花V领、擦色棕色乐福皮鞋、细人字纹小金扣外套。"
                    }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-6 sm:p-8 flex flex-col justify-between border-[#DCD6CC] ${
                        idx < 5 ? "border-b" : "border-b-0"
                      } md:border-b-0 ${
                        idx % 2 === 0 ? "md:border-r" : ""
                      } ${
                        idx < 4 ? "md:border-b" : ""
                      }`}
                    >
                      <div>
                        <span className="text-base font-serif font-black text-[#121212] tracking-tight block mb-2 hover:text-[#800020] transition-colors">
                          {item.buzz}
                        </span>
                        <p className="text-[12px] font-sans font-semibold text-[#121212]/85">
                          世俗大白话：{item.mean}
                        </p>
                        <p className="text-[11.5px] font-sans text-[#121212]/70 mt-2.5 leading-relaxed text-justify">
                          时装翻译学指标：{item.trans}
                        </p>
                      </div>
                      <span className="text-[7.5px] font-mono mt-4 text-[#121212]/30 uppercase tracking-[0.25em] select-none block">
                        PRO DECANT MODULE // ARCHIVE-REF-${idx + 101}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE 2: STYLE STRUCTURES (20 styles!) */}
            {activeInteractiveMode === "structures" && (
              <div className="space-y-6">
                <div className="border-b border-[#121212]/10 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-[#800020] uppercase font-bold tracking-widest block mb-1">TOOL INTERACTION B</span>
                    <h3 className="font-sans font-black tracking-widest text-[#121212] text-xl sm:text-2xl uppercase">
                      先锋时尚风格解构辞典 <span className="font-serif italic text-[#800020] lowercase tracking-normal font-normal text-lg sm:text-xl ml-2 font-medium">20-Entry Curation Atlas</span>
                    </h3>
                    <p className="font-serif italic text-xs text-[#121212]/75 mt-2 max-w-3xl leading-relaxed text-justify">
                      精选20个极具代表性的殿堂级时装与穿衣美学模型，深究其骨骼、物料、大秀并可一键收藏心得。
                    </p>
                  </div>
                  
                  {/* Miniature search box */}
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="搜索风格、词条或氛围词..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF9F6]/40 hover:bg-[#FAF9F6]/70 border border-[#121212]/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#121212] focus:outline-none focus:border-[#800020]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#121212]/35 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left checklist of style entries with subtle ink active-state */}
                  <div className="md:col-span-4 max-h-[460px] overflow-y-auto pr-3 scrollbar-thin space-y-1.5 focus:outline-none">
                    {filteredStyles.map((style) => {
                      const isActive = selectedStyleId === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyleId(style.id)}
                          className={`w-full text-left py-2.5 px-3 transition-all font-sans flex items-center justify-between border-b border-[#121212]/5 group focus:outline-none focus:ring-0 ${
                            isActive
                              ? "text-[#121212] font-semibold"
                              : "text-[#121212]/45 hover:text-[#121212]/80 hover:bg-[#121212]/5 font-light"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className={`font-serif block ${isActive ? "font-black text-sm text-[#121212]" : "font-normal text-[13px] text-[#121212]/85"}`}>{style.name}</span>
                            <span className="text-[9px] font-mono text-neutral-450 block mt-0.5 opacity-60 truncate">{style.enName}</span>
                          </div>
                          {isActive && (
                            <span className="text-[#800020] font-serif font-bold text-sm select-none animate-pulse">✱</span>
                          )}
                        </button>
                      );
                    })}
                    {filteredStyles.length === 0 && (
                      <p className="text-center text-xs text-[#121212]/40 py-6 font-sans">未查到关联美学模型</p>
                    )}
                  </div>

                  {/* Right Style Detail Card - Nested Box dissolved */}
                  <div className="md:col-span-8 space-y-6 md:pl-6 border-t md:border-t-0 md:border-l border-[#121212]/10 pt-6 md:pt-0 pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#121212]/10 pb-3.5">
                      <div>
                        <h4 className="font-serif text-lg text-[#121212] font-semibold flex items-center gap-2">
                          {selectedStyle.name}
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#800020]/10 text-[#800020]">#{selectedStyle.id}</span>
                        </h4>
                        <span className="text-[10px] font-mono text-[#121212]/50 uppercase">{selectedStyle.enName}</span>
                      </div>

                      <button
                        onClick={() => handleCollectStyle(selectedStyle)}
                        className={`text-[10.5px] tracking-[0.2em] uppercase px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer font-sans border ${
                          savedItemIds.includes(`style-collect-${selectedStyle.id}`)
                            ? "bg-[#800020]/10 text-[#800020] border-[#800020]/30 font-semibold"
                            : "bg-transparent border-[#121212]/15 hover:border-[#121212]/40 text-[#121212]/75 hover:text-[#121212]"
                        }`}
                      >
                        <FolderPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>一键收藏此风格</span>
                      </button>
                    </div>

                    <p className="text-[13px] text-[#121212]/90 text-justify leading-relaxed font-sans max-w-2xl pl-1">
                      <strong>核心定义 // </strong>{selectedStyle.definition}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-2">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#121212]/50 block border-b border-[#121212]/10 pb-1 font-semibold">📐 先锋剪裁骨骼 SILHOUETTE</span>
                        <p className="text-[#121212]/80 leading-relaxed text-justify font-sans text-[12.5px] pl-1">{selectedStyle.keySilhouette}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#121212]/50 block border-b border-[#121212]/10 pb-1 font-semibold">🧶 经典主物料 MATERIALS</span>
                        <p className="text-[#121212]/80 leading-relaxed text-justify font-sans text-[12.5px] pl-1">{selectedStyle.keyMaterials}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#121212]/50 block border-b border-[#121212]/10 pb-1 font-semibold">💡 推荐穿搭法则 STYLING LAW</span>
                        <p className="text-[#121212]/80 leading-relaxed text-justify font-sans text-[12.5px] pl-1">{selectedStyle.dailyWearTip}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-[#121212]/50 block border-b border-[#121212]/10 pb-1 font-semibold">✕ 绝对避坑指南 PITFALL</span>
                        <p className="text-[#121212]/90 leading-relaxed text-justify font-sans text-[12.5px] pl-1 flex items-start gap-1">
                          <span className="text-[#800020] font-sans font-bold select-none shrink-0">✕</span>
                          <span>{selectedStyle.commonPitfall}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#121212]/10 flex flex-wrap items-center justify-between text-xs gap-4 mt-2">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {selectedStyle.vibeWords.map((v, i) => (
                          <span key={i} className="text-[10px] font-sans text-[#121212]/60 hover:text-[#800020] transition-colors">#{v}</span>
                        ))}
                      </div>
                      <div className="text-[10.5px] font-sans text-[#121212]/50 tracking-wide font-light">
                        档案出处 // <span className="font-medium text-[#121212]/80">{selectedStyle.representativeRunway}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* CASE 3: SCENARIOS (四大经典生活情境) */}
            {activeInteractiveMode === "scenarios" && (
              <div className="space-y-6">
                <div className="border-b border-[#121212]/10 pb-3">
                  <span className="text-[9px] font-mono text-[#800020] uppercase font-bold tracking-widest block mb-1">TOOL INTERACTION C</span>
                  <h3 className="font-sans font-black tracking-widest text-[#121212] text-xl sm:text-2xl uppercase">
                    场景化穿搭应用法则 <span className="font-serif italic text-[#800020] lowercase tracking-normal font-normal text-lg sm:text-xl ml-2 font-medium">Scenario Curation Guide</span>
                  </h3>
                  <p className="font-serif italic text-xs text-[#121212]/75 mt-2 max-w-3xl leading-relaxed text-justify">
                    真实通勤、浪漫约会、松弛旅居与学者会晤。我们拒绝无脑种草，只用结构公式帮您搞定每一次出场。
                  </p>
                </div>

                {/* Scenario tabs with absolute minimal typography and line highlights */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#121212]/10 pb-4">
                  {[
                    { id: "office", label: "高级职场通勤" },
                    { id: "date", label: "高定微醺约会" },
                    { id: "resort", label: "自由艺术旅居" },
                    { id: "interview", label: "常春藤学者会晤" }
                  ].map((tab, idx) => (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => setActiveScenario(tab.id as any)}
                        className={`text-xs text-left tracking-[0.15em] font-sans transition-all focus:outline-none cursor-pointer relative pb-1.5 ${
                          activeScenario === tab.id
                            ? "text-[#121212] font-semibold"
                            : "text-[#121212]/55 hover:text-[#121212] font-light"
                        }`}
                      >
                        {tab.label}
                        {activeScenario === tab.id && (
                          <motion.div
                            layoutId="activeScenarioLine"
                            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#800020]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </button>
                      {idx < 3 && (
                        <span className="text-[#121212]/15 text-[10px] font-light ml-6 select-none font-sans">|</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#121212]/10 pb-3">
                    <h4 className="font-serif font-bold text-base text-[#121212] flex items-center gap-2">
                       {scenariosData[activeScenario].title}
                    </h4>
                    <button
                      onClick={() => handleCollectScenario(activeScenario)}
                      className="text-[10px] tracking-[0.2em] uppercase px-4 py-1.5 bg-transparent border border-[#121212]/15 hover:border-[#121212]/40 text-[#121212]/80 hover:text-[#121212] rounded-lg transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer font-sans"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-[#121212]/60" strokeWidth={1.5} />
                      <span>收藏此法则制案</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div className="md:col-span-2 space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#121212]/45 block border-b border-[#121212]/10 pb-1 font-semibold">💡 推荐核心穿衣公式 CORE FORMULA</span>
                        <p className="text-[#121212]/90 leading-relaxed font-sans text-[13px] font-semibold pl-1">{scenariosData[activeScenario].keyFormula}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#121212]/45 block border-b border-[#121212]/10 pb-1 font-semibold">🎭 气场与核心情绪 ATMOSPHERE TONE</span>
                        <p className="text-[#121212]/75 leading-relaxed font-sans italic pl-1 text-[12.5px]">{scenariosData[activeScenario].vibe}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#121212]/45 block border-b border-[#121212]/10 pb-1 font-semibold">🧠 专属细节建议 CURATOR DETAIL</span>
                        <p className="text-[#121212]/75 leading-relaxed font-sans text-justify pl-1 leading-relaxed text-[12.5px]">{scenariosData[activeScenario].tip}</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#121212]/45 block border-b border-[#121212]/10 pb-1 font-semibold">⚠️ 绝对红线禁忌 AVOID TRAPS</span>
                        <p className="text-[#121212]/90 font-sans leading-relaxed text-justify flex gap-1.5 items-start pl-1 text-[12.5px]">
                          <span className="text-[#800020] font-sans font-bold select-none shrink-0">✕</span>
                          <span>{scenariosData[activeScenario].avoid}</span>
                        </p>
                      </div>

                      <div className="relative">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-[#121212]/45 block mb-2 font-semibold">🎨 核心配色彩盘 COLOR SPECIMENS</span>
                        
                        <div className="flex items-center h-12">
                          <div className="flex rounded-md overflow-hidden border border-[#121212]/15 shadow-xs bg-[#FAF9F6]">
                            {scenariosData[activeScenario].mainColors.map((colorStr, idx) => {
                              const hex = colorStr.split(" / ")[0];
                              const colorName = colorStr.split(" / ")[1];
                              return (
                                <div
                                  key={idx}
                                  className="group relative w-10 h-10 cursor-crosshair transition-transform hover:scale-105 hover:z-10"
                                >
                                  {/* Pure color chip */}
                                  <div
                                    className="w-full h-full"
                                    style={{ backgroundColor: hex }}
                                  />
                                  
                                  {/* Tooltip on top */}
                                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#121212] text-[#FAF9F6] text-[8.5px] font-mono py-1 px-2 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 shadow-md">
                                    {colorName}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
