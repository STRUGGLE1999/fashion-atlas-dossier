import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArchiveItem } from "../types";
import { 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  BookmarkCheck,
  Compass,
  Layers,
  BookOpen
} from "lucide-react";
import { useFashionData } from "../hooks/useFashionData";

interface ResourceDetailViewProps {
  resourceId: string;
  onBack: () => void;
  onConsultAI: (item: ArchiveItem) => void;
  onSaveToMoodboard: (item: ArchiveItem) => void;
  savedItemIds: string[];
}

export default function ResourceDetailView({
  resourceId,
  onBack,
  onConsultAI,
  onSaveToMoodboard,
  savedItemIds,
}: ResourceDetailViewProps) {
  const { data: archiveItems, loading } = useFashionData<ArchiveItem>("archives");
  const [item, setItem] = useState<ArchiveItem | null>(null);

  useEffect(() => {
    if (archiveItems.length > 0) {
      const found = archiveItems.find((x) => x.id === resourceId) || archiveItems[0];
      setItem(found);
    }
  }, [archiveItems, resourceId]);

  if (loading || !item) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
      </div>
    );
  }

  const isSaved = savedItemIds.includes(item.id);

  // Filter out current item for "related resources"
  const relatedItems = archiveItems.filter((x) => x.id !== item.id);

  // Museum references database
  const museumReferences: Record<string, {
    officialGate: string;
    gateName: string;
    copyrightDetail: string;
    scholarlyValue: string[];
    importanceIndex: string;
  }> = {
    "deconstructed-tailoring": {
      officialGate: "https://www.vam.ac.uk/collections/fashion",
      gateName: "V&A 维多利亚与阿尔伯特博物馆 时装数字特藏馆",
      copyrightDetail: "本先锋档案由 FASHION ATLAS 学术团队整理。本条目内展示的高精视觉素材与文本结构遵循 Creative Commons 署名-非商业性使用 4.0 国际许可 (CC BY-NC 4.0)，图源 Unsplash 先锋艺术公开库，相关解构裁片设计权归其创始品牌共同所有。",
      scholarlyValue: [
        "解开服装的物质神圣感：深度探索去衬里、外露衬料和未加锁边处理的设计，分析如何通过破坏完美对称展现社会政治情绪。",
        "力矩与失衡的几何解析：研究由于不对称拼贴下摆、重叠驳领带来的肩头张力与服装坠力转移机能，重构时装的力学平衡分布。",
        "日常通勤层叠实操方案：先锋的未完成时装并不等同于邋遢，本条目将解构如何运用内搭考究真丝、外部套穿毛边西装，产生极富教养的大胆博弈感。"
      ],
      importanceIndex: "先锋殿堂级 (10/10)"
    },
    "parametric-knitting": {
      officialGate: "https://www.metmuseum.org/about-the-met/curatorial-departments/the-costume-institute",
      gateName: "纽约大都会艺术博物馆 大都会服装研究学会中心",
      copyrightDetail: "数字化先锋算法机理条目。设计及3D网格计算由 Fashion Atlas 数字时尚实验室基于当代先锋编织模型归纳。物理制样与照片媒介版权受博特家族研究托管。严禁非法商业仿造。",
      scholarlyValue: [
        "算法对于纤维应力的重新映射：体验如何通过多孔式杜邦尼龙与热定型美丽诺羊毛混缩，在完全不打破整块材料的闭环结构下创造自主高耸的温差气泡和螺旋流体层叠。",
        "材料的三维生物质感：该技术彻底颠覆了‘裁剪’概念，衣服不再是由二维板片拼接而成，而是像三维生物有机外皮一样根据人体凹凸动态算力隆起，实现无缝全身贴合。",
        "现代科技降噪实操战：参数化起伏具有极强的视觉雕塑性，在实际穿搭中需要通过哑光、单色调的平整阔腿长裤来压制其视觉疲劳感，展现高净中性的学者姿态。"
      ],
      importanceIndex: "未来科技风潮级 (9.5/10)"
    },
    "golden-age-silhouette": {
      officialGate: "https://www.metmuseum.org/art/online-features/met-fashion",
      gateName: "大都会艺术博物馆 经典服装珍品室",
      copyrightDetail: "由于New Look沙漏底盘涉及精密古典多骨重力系统，版权及实物保管及测量底图由世界大都会经典珍宝团队联合提供，由Fashion Atlas数字学术团队承制线上数字化剖析。",
      scholarlyValue: [
        "鱼骨压制下的人体比例博弈：细致解剖内嵌的 12 根弹力合金与马毛衬里，推演高耸垫肩与收缩细腰形成的超常戏剧张力是如何建立战后女性重塑精神领地、掌控世界自信的物理媒介。",
        "斜裁物理 (Bias Cut) 的流动理性：与普通的纵向或横向排版不同，斜裁让布料完全顺着纤细的侧腰肌肉流动坠下，使得极为紧实的衣服依然保有无声、高贵的呼吸感与弹性裕量。",
        "复古经典复兴与现代解压：复古沙漏高定不可堆砌假金碎钻。本条目教会学生如何用当代一件粗犷的廓形中性皮夹克打破其过剩的宫廷娇娆度，形成冲突美学 (The Aesthetics of Friction)。"
      ],
      importanceIndex: "至高古典级 (10/10)"
    }
  };

  const refInfo = museumReferences[item.id] || museumReferences["deconstructed-tailoring"];

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in py-4 select-none">
      
      {/* Editorial Back Header */}
      <div className="flex items-center justify-between border-b border-[#2A2B2A]/[0.1] pb-4">
        <button
          onClick={onBack}
          className="group text-xs font-sans font-medium flex items-center gap-1.5 text-[#121212]/60 hover:text-[#121212] transition-colors focus:outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>返回馆藏中心列表</span>
        </button>

        <span className="text-[9px] font-mono text-[#121212]/35 tracking-[0.25em] uppercase">
          DEEP RESOLUTION RESOURCE ATTACHMENT
        </span>
      </div>

      {/* Main Structural Design Panel (Dissolved Right Box) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start bg-transparent">
        
        {/* Left Side: Editorial Large Image */}
        <div className="md:col-span-5 h-[400px] md:h-auto min-h-[500px] rounded-[8.5px] overflow-hidden border border-[#2A2B2A]/10 bg-neutral-900 md:sticky md:top-24 shadow-sm relative group/img">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-750 group-hover/img:scale-101"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/20 to-transparent flex flex-col justify-end p-6">
            <span className="text-[9px] font-mono tracking-[0.2em] text-[#EAE8DD]/60 uppercase block mb-1">METADATA IDENTIFIER #{item.id}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white w-fit font-bold mb-2 uppercase tracking-widest text-[9px]">
              {item.category}
            </span>
            <h2 className="font-serif font-normal text-2xl text-white tracking-tight leading-tight italic">
              {item.name}
            </h2>
            <p className="text-white/55 text-[10px] font-mono mt-1.5 uppercase tracking-widest font-light">
              CURATED BY {item.designer}
            </p>
          </div>
        </div>

        {/* Right Side: Deep scholarly files directly rooted on the parchment base */}
        <div className="md:col-span-7 space-y-8 py-2">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-y-2 border-b border-[#2A2B2A]/[0.06] pb-4 mb-5">
              <div>
                <span className="text-[9.5px] font-mono text-[#5C1D24]/85 uppercase tracking-[0.2em] font-semibold block mb-0.5">// MUSEUM REFERENCE CLASSIFIED</span>
                <h3 className="font-serif font-normal text-lg sm:text-xl text-[#121212] italic">
                  本馆独立研究论证与工艺分解
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#121212]/45 font-semibold">
                  美学重要度:
                </span>
                <span className="text-[10px] font-mono text-[#5C1D24] font-bold bg-[#5C1D24]/5 px-2 py-0.5 rounded-[4px] border border-[#5C1D24]/10">
                  {refInfo.importanceIndex.replace(/（.*）/g, "").replace(/🏛️/g, "").trim()}
                </span>
              </div>
            </div>

            {/* General Description in Light font-weight on bare parchment */}
            <div className="space-y-6">
              <div className="text-[13px] text-justify text-[#121212]/75 leading-relaxed font-sans space-y-6 bg-transparent py-2">
                <p className="font-light">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-[#5C1D24]/85 mr-2 uppercase block sm:inline-block mb-1 sm:mb-0">[ 历史美学叙事 ]</span>
                  {item.history}
                </p>
                <p className="border-t border-[#2A2B2A]/[0.05] pt-5 font-light">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-[#5C1D24]/85 mr-2 uppercase block sm:inline-block mb-1 sm:mb-0">[ 版型材料特征 ]</span>
                  {item.description}
                </p>
              </div>

              {/* Learning values (学习价值) with Classical Roman Numerals [ I. II. III. ] */}
              <div className="space-y-4 pt-4">
                <span className="text-[9px] font-mono tracking-[0.2em] text-[#121212]/50 uppercase font-semibold block flex items-center gap-1.5 select-none">
                  学术与穿搭学习价值 (LEARNING & STUDY VALUE)
                </span>

                <div className="space-y-4 text-xs text-justify">
                  {refInfo.scholarlyValue.map((val, idx) => {
                    const parts = val.split("：");
                    const title = parts[0] ? parts[0].replace(/\*\*/g, "").trim() : "";
                    const desc = parts[1] ? parts[1].replace(/\*\*/g, "").trim() : "";
                    const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
                    const romanIdx = romanNumerals[idx] || (idx + 1).toString();

                    return (
                      <div key={idx} className="flex gap-3 items-start pl-0.5">
                        <span className="text-[#5C1D24] font-serif italic text-[11px] mt-[2.5px] font-semibold select-none shrink-0 min-w-[24.5px]">
                          [{romanIdx}]
                        </span>
                        <div className="leading-relaxed text-[#121212]/70 font-sans font-light">
                          {title ? <span className="font-sans font-medium text-[#121212]/95">{title}：</span> : ""}
                          {desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Core action block - Transformed into ghost buttons */}
          <div className="pt-6 border-t border-[#2A2B2A]/[0.06] flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onSaveToMoodboard(item)}
              className={`text-[9.5px] tracking-[0.2em] font-sans font-light uppercase py-3.5 px-6 flex-1 rounded-[8px] border transition-all duration-300 focus:outline-none flex items-center justify-center gap-2 cursor-pointer ${
                isSaved
                  ? "border-[#5C1D24]/40 text-[#5C1D24] hover:bg-[#5C1D24]/[0.02]"
                  : "border-[#2A2B2A]/15 text-[#2A2B2A]/85 hover:border-[#2A2B2A]/40 hover:bg-[#2A2B2A]/[0.02]"
              }`}
              id={`detail-save-${item.id}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "已储藏至灵感板" : "归档至我的灵感板"}</span>
            </button>

            <button
              onClick={() => onConsultAI(item)}
              className="text-[9.5px] tracking-[0.2em] font-sans font-light uppercase py-3.5 px-6 flex-1 rounded-[8px] border border-[#5C1D24]/35 text-[#5C1D24]/85 hover:border-[#5C1D24]/60 hover:bg-[#5C1D24]/[0.02] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
              id={`detail-ai-${item.id}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>对话AI导师剖析本工艺</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Metadata Mashup Grid - No boxes or card borders, separated by ledger lines */}
      <div className="border-t border-[#2A2B2A]/[0.06] pt-8 mt-12 space-y-8">
        {/* Official portal index flat */}
        <div className="space-y-3">
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#5C1D24]/85 font-bold uppercase block flex items-center select-none">
            <span className="text-[#5C1D24] text-[10px] mr-1.5">//</span>
            MUSEUM ANCHOR PORTAL • 官方合规研究索引入口
          </span>
          <p className="text-xs text-[#121212]/60 leading-relaxed text-justify font-sans font-light">
            FashionAtlas 系统秉持开放研究精神。本物理制图与工艺细节均可通过世界各大最权威学术时装博物馆数字底盘进行官方注册号回溯、比照获取：
          </p>
          <div className="pt-1.5">
            <a
              href={refInfo.officialGate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#5C1D24] hover:text-[#5C1D24]/80 transition-colors uppercase font-mono tracking-wider font-light"
            >
              <span className="underline underline-offset-4">{refInfo.gateName.replace(/🏛️|💻|🎓/g, "").trim()} ↗</span>
            </a>
          </div>
        </div>

        {/* intellectual disclaimer */}
        <div className="pt-6 border-t border-[#2A2B2A]/[0.06] space-y-3">
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#5C1D24]/85 font-bold uppercase block flex items-center select-none">
            <span className="text-[#5C1D24] text-[10px] mr-1.5">//</span>
            COPYRIGHT DISCLOSURE • 知识产权与合理使用说明
          </span>
          <p className="text-xs text-[#121212]/55 leading-relaxed text-justify font-sans font-light">
            {refInfo.copyrightDetail.replace(/🏛️|💻|🎓/g, "").trim()}
          </p>
        </div>

        {/* related recommendations */}
        <div className="pt-6 border-t border-[#2A2B2A]/[0.06] space-y-4">
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#5C1D24]/85 font-bold uppercase block flex items-center select-none">
            <span className="text-[#5C1D24] text-[10px] mr-1.5">//</span>
            ACADEMIC INTERCONNECTION • 相关研读学者资源
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 pt-2">
            {relatedItems.map((rel) => (
              <a
                href={`#/resource/${rel.id}`}
                key={rel.id}
                className="flex gap-4 items-center group bg-transparent border-0 p-0 hover:no-underline"
              >
                <img
                  src={rel.image}
                  alt={rel.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-[3px] object-cover shrink-0 border border-[#2A2B2A]/10 transition-transform duration-300 group-hover:scale-97"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="text-[8px] font-mono tracking-[0.15em] text-[#5C1D24]/75 uppercase block font-semibold">
                    {rel.category}
                  </span>
                  <h5 className="font-serif font-normal text-xs text-[#121212] group-hover:text-[#5C1D24] transition-colors truncate italic">
                    {rel.name}
                  </h5>
                  <p className="text-[9.5px] font-sans text-[#121212]/45 truncate font-light leading-none">
                    主导匠人：{rel.designer}
                  </p>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-[#2A2B2A]/30 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// Simple internal helper component
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
