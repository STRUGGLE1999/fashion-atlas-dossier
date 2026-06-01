import React from "react";
import { motion } from "motion/react";
import { archiveItems } from "../data";
import { ArchiveItem } from "../types";
import { 
  ArrowLeft, 
  Compass, 
  Sparkles, 
  Heart, 
  ExternalLink, 
  AlertCircle, 
  BookOpen, 
  Hash, 
  Layers, 
  BookmarkCheck,
  Award
} from "lucide-react";

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
  // Find the requested item
  const item = archiveItems.find((x) => x.id === resourceId) || archiveItems[0];
  const isSaved = savedItemIds.includes(item.id);

  // Filter out current item for "related resources"
  const relatedItems = archiveItems.filter((x) => x.id !== item.id);

  // Generate mock / highly-styled museum info based on ID
  const museumReferences: Record<string, {
    officialGate: string;
    gateName: string;
    copyrightDetail: string;
    scholarlyValue: string[];
    importanceIndex: string;
  }> = {
    "deconstructed-tailoring": {
      officialGate: "https://www.vam.ac.uk/collections/fashion",
      gateName: "V&A 维多利亚与阿尔伯特博物馆 🏛️ 时装数字特藏馆",
      copyrightDetail: "本先锋档案由 FASHION ATLAS 学术团队整理。本条目内展示的高精视觉素材与文本结构遵循 Creative Commons 署名-非商业性使用 4.0 国际许可 (CC BY-NC 4.0)，图源 Unsplash 先锋艺术公开库，相关解构裁片设计权归其创始品牌共同所有。",
      scholarlyValue: [
        "**解开服装的物质神圣感：** 深度探索去衬里、外露衬料和未加锁边处理的设计，分析如何通过破坏完美对称展现社会政治情绪。",
        "**力矩与失衡的几何解析：** 研究由于不对称拼贴下摆、重叠驳领带来的肩头张力与服装坠力转移机能，重构时装的力学平衡分布。",
        "**日常通勤层叠实操方案：** 先锋的未完成时装并不等同于邋遢，本条目将解构如何运用内搭考究真丝、外部套穿毛边西装，产生极富教养的大胆博弈感。"
      ],
      importanceIndex: "先锋殿堂级（10/10）"
    },
    "parametric-knitting": {
      officialGate: "https://www.metmuseum.org/about-the-met/curatorial-departments/the-costume-institute",
      gateName: "纽约大都会艺术博物馆 🏛️ 大都会服装研究学会中心",
      copyrightDetail: "数字化先锋算法机理条目。设计及3D网格计算由 Fashion Atlas 数字时尚实验室基于当代先锋编织模型归纳。物理制样与照片媒介版权受博特家族研究托管。严禁非法商业仿造。",
      scholarlyValue: [
        "**算法对于纤维应力的重新映射：** 体验如何通过多孔式杜邦尼龙与热定型美丽诺羊毛混缩，在完全不打破整块材料的闭环结构下创造自主高耸的温差气泡和螺旋流体层叠。",
        "**材料的三维生物质感：** 该技术彻底颠覆了‘裁剪’概念，衣服不再是由二维板片拼接而成，而是像三维生物有机外皮一样根据人体凹凸动态算力隆起，实现无缝全身贴合。",
        "**现代科技感降噪实战：** 参数化起伏具有极强的视觉雕塑性，在实际穿搭中需要通过哑光、单色调的平整阔腿长裤来压制其视疲劳感，展现高净中性的学者姿态。"
      ],
      importanceIndex: "未来科技风潮级（9.5/10）"
    },
    "golden-age-silhouette": {
      officialGate: "https://www.palaisgalliera.paris.fr/",
      gateName: "巴黎加列拉宫 🏛️ 巴黎市立时装博物馆典藏中心",
      copyrightDetail: "重现高级定制黄金年代（1940s-1950s）之美学遗留。根据克里斯汀·迪奥 1947 年 New Look 图案物理复刻。版权归原巴黎高级定制工会所有，该条目仅作教育和史论分析参考，合理合理使用 (Fair Use)。",
      scholarlyValue: [
        "**鱼骨压制下的人体比例博弈：** 细致解剖内嵌的 12 根弹力合金与马毛衬里，推演高耸垫肩与收缩细腰形成的超常戏剧张力是如何建立战后女性重塑精神领地、掌控世界自信的物理媒介。",
        "**斜裁物理（Bias Cut）的流动理性：** 与普通的纵向或横向排版不同，斜裁让布料完全顺着纤细的侧腰肌肉流动坠下，使得极为紧实的衣服依然保有无声、高贵的呼吸感与弹性裕量。",
        "**复古经典复兴与现代解压：** 复古沙漏高定不可堆砌假金碎钻。本条目教会学生如何用当代一件粗犷的廓形中性皮夹克打破其过剩的宫廷娇娆度，形成冲突美学（The Aesthetics of Friction）。"
      ],
      importanceIndex: "古典秩序级（10/10）"
    }
  };

  const refInfo = museumReferences[item.id] || museumReferences["deconstructed-tailoring"];

  React.useEffect(() => {
    // Scroll to top on route switch
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [resourceId]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in py-4 select-none">
      
      {/* Editorial Back Header */}
      <div className="flex items-center justify-between border-b border-[#121212]/10 pb-4">
        <button
          onClick={onBack}
          className="group text-xs font-sans font-medium flex items-center gap-1.5 text-[#121212]/60 hover:text-[#121212] transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>返回馆藏中心列表</span>
        </button>

        <span className="text-[10px] font-mono text-[#121212]/40 tracking-widest uppercase bg-[#121212]/5 px-2.5 py-1 rounded">
          DEEP RESOLUTION RESOURCE ATTACHMENT
        </span>
      </div>

      {/* Main Structural Design Panel */}
      <div className="bg-[#FAF9F6] border border-[#121212]/15 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Side: Editorial Large Image */}
        <div className="md:col-span-5 h-[340px] md:h-auto min-h-[460px] relative bg-neutral-900 border-r border-[#121212]/10">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-6">
            <span className="text-[9px] font-mono tracking-widest text-[#8C7255] uppercase block mb-1">METADATA IDENTIFIER #{item.id}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6]/20 border border-white/20 text-[#FAF9F6] w-fit font-bold mb-2">
              {item.category}
            </span>
            <h2 className="font-serif font-normal text-2xl lg:text-3xl text-white tracking-tight leading-tight italic">
              {item.name}
            </h2>
            <p className="text-white/50 text-[11px] font-mono mt-1.5 uppercase tracking-wider">
              CURATED BY {item.designer}
            </p>
          </div>
        </div>

        {/* Right Side: Deep scholarly files */}
        <div className="md:col-span-7 p-6 sm:p-9 space-y-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#121212]/10 pb-4 mb-5">
              <div>
                <span className="text-[9px] font-mono text-[#800020] uppercase font-bold block mb-0.5">MUSEUM REFERENCE CLASSIFIED</span>
                <h3 className="font-serif font-bold text-sm text-[#121212] uppercase tracking-wide">
                  本馆独立研究论证与工艺分解
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#5C1D24]" />
                <span className="text-[10px] font-mono text-[#121212]/60 bg-[#FAF9F6] px-2 py-0.5 border border-[#121212]/5 rounded">
                  美学重要度: {refInfo.importanceIndex}
                </span>
              </div>
            </div>

            {/* General Description */}
            <div className="space-y-4">
              <div className="text-xs text-justify text-[#121212]/80 leading-relaxed font-sans space-y-3 bg-[#FAF9F6] p-4 rounded-lg border border-[#121212]/5">
                <p>
                  <strong>历史美学叙事：</strong> {item.history}
                </p>
                <p className="border-t border-[#121212]/5 pt-3">
                  <strong>版型材料特征：</strong> {item.description}
                </p>
              </div>

              {/* Learning values (学习价值) */}
              <div className="space-y-3.5 pt-4">
                <span className="text-[10px] font-mono tracking-widest text-[#121212]/50 uppercase font-semibold block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C7255]" />
                  🎓 学术与穿搭学习价值 (Learning & Study Value)
                </span>

                <div className="space-y-3.5 text-xs text-justify">
                  {refInfo.scholarlyValue.map((val, idx) => {
                    const parts = val.split("：");
                    return (
                      <div key={idx} className="flex gap-2 items-start pl-1">
                        <span className="text-[#800020] font-mono font-bold mt-0.5">0{idx + 1}.</span>
                        <div className="leading-relaxed text-[#121212]/75 font-sans">
                          {parts[0] ? <strong className="text-neutral-900 font-semibold">{parts[0]}：</strong> : ""}
                          {parts[1] || ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Core action block */}
          <div className="pt-6 border-t border-[#121212]/10 flex flex-wrap gap-3">
            <button
              onClick={() => onSaveToMoodboard(item)}
              className={`text-xs px-4 py-3 flex-1 rounded-lg font-sans font-medium flex items-center justify-center gap-2 transition-all focus:outline-none ${
                isSaved
                  ? "bg-[#5C1D24]/10 text-[#5C1D24] border border-[#5C1D24]/20"
                  : "bg-[#121212] text-[#FAF9F6] hover:bg-neutral-800 active:scale-95 text-center"
              }`}
              id={`detail-save-${item.id}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "已成功储藏在灵感板" : "归档至我的灵感板"}</span>
            </button>

            <button
              onClick={() => onConsultAI(item)}
              className="text-xs px-4 py-3 flex-1 rounded-lg font-sans font-medium bg-[#5C1D24] text-[#FAF9F6] border border-[#5C1D24] hover:bg-[#72272e] transition-all flex items-center justify-center gap-2 focus:outline-none active:scale-95"
              id={`detail-ai-${item.id}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FAF9F6]" />
              <span>对话AI导师剖析本工艺</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meta Gateways & Intellectual Protection (官方入口 & 版权说明) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* official index portal */}
        <div className="bg-[#FAF9F6] border border-[#121212]/15 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#121212]/40 block mb-1">MUSEUM ANCHOR PORTAL</span>
            <h4 className="font-serif font-bold text-sm text-[#121212] mb-3 uppercase italic">
              官方合规研究索引入口 (Official Gateway)
            </h4>
            <p className="text-xs text-[#121212]/60 leading-relaxed text-justify mb-4 font-sans">
              FashionAtlas 系统秉持开放研究精神。本物理裁片与工艺流均可通过世界各大最权威学术时装博物馆数字底盘进行官方注册号回溯、比照获取：
            </p>
          </div>

          <a
            href={refInfo.officialGate}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-xs font-sans font-medium px-4 py-3 bg-[#E5E0D8]/45 hover:bg-[#E5E0D8]/70 text-[#800020] border border-[#121212]/10 rounded-lg flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-[#800020]"
          >
            <span className="truncate pr-2 font-mono font-bold text-[11px] text-neutral-800">{refInfo.gateName}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        {/* copyright instructions card */}
        <div className="bg-[#FAF9F6] border border-[#121212]/15 p-5 rounded-lg">
          <span className="text-[9px] font-mono tracking-widest text-[#121212]/40 block mb-1">COPYRIGHT DISCLOSURE</span>
          <h4 className="font-serif font-bold text-sm text-[#121212] mb-3 uppercase italic flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#8C7255]" />
            知识产权与合理使用说明 (Copyright Info)
          </h4>
          <p className="text-xs text-[#121212]/60 leading-relaxed text-justify font-sans">
            {refInfo.copyrightDetail}
          </p>
        </div>

      </div>

      {/* Related Resources (相关学术资源) */}
      <div className="space-y-4">
        <div className="border-b border-[#121212]/15 pb-2">
          <span className="text-[9px] font-mono tracking-widest uppercase text-[#800020] block mb-0.5">ACADEMIC INTERCONNECTION</span>
          <h4 className="font-serif font-bold text-sm text-[#121212]">
            相关研读学者资源 (Related Academic Resources)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedItems.map((rel) => (
            <a
              href={`#/resource/${rel.id}`}
              key={rel.id}
              className="bg-[#FAF9F6] border border-[#121212]/10 hover:border-[#121212]/30 p-4 rounded-lg flex gap-4 transition-all items-center group"
            >
              <img
                src={rel.image}
                alt={rel.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded object-cover shrink-0 border border-[#121212]/5"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[8.5px] font-mono tracking-wider bg-[#121212]/5 text-[#121212]/60 px-2 py-0.5 rounded uppercase font-bold mb-1 inline-block">
                  {rel.category}
                </span>
                <h5 className="font-serif font-bold text-xs text-[#121212] group-hover:text-[#800020] transition-colors truncate">
                  {rel.name}
                </h5>
                <p className="text-[10px] font-mono text-[#121212]/45 truncate mt-0.5">
                  主导匠人：{rel.designer}
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-[#121212]/30 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
          ))}
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
