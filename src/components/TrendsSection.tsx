import React, { useState, useEffect } from "react";
import { TrendTopic, OutfitFormula } from "../types";
import { Sparkles, Calendar, Bookmark, Flame, Sliders, Check, HelpCircle, Expand, Info } from "lucide-react";
import { motion } from "motion/react";
import { useFashionData } from "../hooks/useFashionData";

interface TrendsSectionProps {
  onSaveFormulaToMoodboard: (formula: OutfitFormula) => void;
  onSaveTrendToMoodboard: (trend: TrendTopic) => void;
  onConsultAI: (trend: TrendTopic) => void;
  savedItemIds: string[];
}

export default function TrendsSection({
  onSaveFormulaToMoodboard,
  onSaveTrendToMoodboard,
  onConsultAI,
  savedItemIds,
}: TrendsSectionProps) {
  const { data: weeklyTrends, loading: loadingTrends } = useFashionData<TrendTopic>("trends");
  const { data: outfitFormulas, loading: loadingFormulas } = useFashionData<OutfitFormula>("formulas");

  const [activeTrend, setActiveTrend] = useState<TrendTopic | null>(null);
  const [activeFormulas, setActiveFormulas] = useState<OutfitFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<OutfitFormula | null>(null);

  useEffect(() => {
    if (weeklyTrends.length > 0 && !activeTrend) {
      setActiveTrend(weeklyTrends[0]);
    }
  }, [weeklyTrends]);

  useEffect(() => {
    if (activeTrend && outfitFormulas.length > 0) {
      const filtered = outfitFormulas.filter(f => f.trendId === activeTrend.id);
      setActiveFormulas(filtered);
      if (filtered.length > 0 && !selectedFormula) {
        setSelectedFormula(filtered[0]);
      }
    }
  }, [activeTrend, outfitFormulas]);
  
  // Custom formula modifications (Interactive simulation)
  const [isBagIncluded, setIsBagIncluded] = useState(true);
  const [accentLevel, setAccentLevel] = useState(50); // slider for accent density
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleSaveModifiedFormula = () => {
    if (!selectedFormula) return;
    // Save formula with selected options
    const modifiedFormula: OutfitFormula = {
      ...selectedFormula,
      id: `${selectedFormula.id}-custom`,
      name: `${selectedFormula.name} (自定义配置版)`,
      pieces: selectedFormula.pieces.filter((p, index) => {
        // Exclude bag role if user untoggled it
        if (p.role.includes("Accessory") && !isBagIncluded) return false;
        return true;
      }),
      styleTips: [
        ...selectedFormula.styleTips,
        `本季搭配调色及力量平衡度个人设定值: ${accentLevel}%。`
      ]
    };
    onSaveFormulaToMoodboard(modifiedFormula);
  };

  if (loadingTrends || loadingFormulas || !activeTrend || !selectedFormula) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Editorial Header Hero Banner */}
      <div className="relative rounded-lg overflow-hidden h-80 border border-[#2A2B2A]/10 shadow-xs">
        <img
          src={activeTrend.bannerImage}
          alt={activeTrend.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2B2A]/30 via-transparent to-transparent p-6 sm:p-8 flex flex-col justify-end">
          <div className="flex items-center gap-x-6 text-[10px] tracking-[0.25em] font-sans mb-3 select-none">
            <span className="font-extrabold text-[#FAF9F6] drop-shadow-md">
              HOT TRENDS • {activeTrend.week}
            </span>
            <span className="text-[#FAF9F6]/40 font-extralight uppercase drop-shadow-md">
              EDITORIAL RECOMMEND
            </span>
          </div>
          <h2 className="font-serif font-normal text-white text-2xl sm:text-3xl md:text-4xl max-w-3xl tracking-tight leading-tight italic drop-shadow-sm">
            {activeTrend.name}
          </h2>
          <p className="text-[#FAF9F6]/85 text-xs sm:text-sm max-w-4xl mt-3 leading-relaxed font-sans font-light drop-shadow-xs">
            {activeTrend.comment}
          </p>
        </div>
      </div>

      {/* Main Grid: Left is Key Items, Runway Evidence. Right is Formulas Adjuster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column (Key Items & Runway Evidence dissolved) */}
        <div className="lg:col-span-5 space-y-12">
          {/* Key Items List (Fully dissolved card) */}
          <div className="p-1">
            <span className="text-[9px] font-mono tracking-widest text-[#2A2B2A]/45 block mb-1">KEY CRITERIA • 核心要义</span>
            <h3 className="font-serif font-normal text-sm text-[#2A2B2A] mb-5 uppercase italic">
              本期核定核心单品
            </h3>
            
            <div className="divide-y divide-[#2A2B2A]/10 border-b border-t border-[#2A2B2A]/10 mb-6">
              {activeTrend.keyItems.map((item, idx) => (
                <div
                  key={idx}
                  className="py-4 flex items-center justify-between"
                >
                  <span className="text-xs font-sans font-normal text-[#2A2B2A]/85 truncate pr-2">
                    {item}
                  </span>
                  <span className="text-[9px] font-mono shrink-0 text-[#2A2B2A]/40 font-extralight tracking-wider">
                    ITEM 0{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => onSaveTrendToMoodboard(activeTrend)}
                className="text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 flex-1 bg-transparent hover:bg-[#2A2B2A]/5 text-[#2A2B2A] border border-[#2A2B2A]/30 rounded-lg font-sans font-light transition-all focus:outline-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                id={`btn-save-trend`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#2A2B2A]/60" />
                <span>收藏此周趋势</span>
              </button>

              <button
                onClick={() => onConsultAI(activeTrend)}
                className="text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 flex-1 bg-transparent hover:bg-[#800020]/5 text-[#800020] border border-[#800020]/30 rounded-lg font-sans font-light transition-all focus:outline-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                id={`btn-chat-trend`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#800020]" />
                <span>探讨本期趋势</span>
              </button>
            </div>
          </div>

          {/* Runway Evidence Images (秀场实证 - Fully dissolved) */}
          <div className="p-1 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2B2A]/10 pb-3">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#2A2B2A]/45 block mb-1">VISUAL EVIDENCE • 秀场实证</span>
                <h3 className="font-serif font-normal text-sm text-[#2A2B2A] uppercase italic">
                  秀场实证研究资料
                </h3>
              </div>
              <span className="text-[9px] text-[#2A2B2A]/40 font-mono tracking-tight font-light bg-transparent px-2 py-0.5 border border-[#2A2B2A]/5 rounded">点击放大图片</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {activeTrend.evidenceImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setZoomImage(img.url)}
                  className="group relative cursor-zoom-in rounded overflow-hidden border border-[#2A2B2A]/10 h-36 bg-[#F6F4E8] shadow-xs"
                >
                  <img
                    src={img.url}
                    alt="Evident screenshot"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#2A2B2A]/80 p-2 text-[9px] text-white font-sans shrink-0 block leading-snug">
                    {img.caption.substring(0, 15)}...
                  </div>
                  <div className="absolute top-2 right-2 p-1 bg-[#2A2B2A]/55 hover:bg-[#2A2B2A]/75 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Expand className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Interactive Formulas Adjuster dissolved) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-1">
            {/* Tab buttons for different formula pre-configuration */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2B2A]/10 pb-4 mb-6">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-[#2A2B2A]/45 block mb-1">STYLING CONFIGURATOR • 搭配公式</span>
                <h3 className="font-serif font-normal text-sm text-[#2A2B2A] uppercase italic">
                  多路穿搭搭配公式智能配比系统
                </h3>
              </div>

              {/* Selector for formulas with pure letter-spaced horizontal breathing space */}
              <div className="flex items-center gap-x-10">
                {activeFormulas.map((f) => {
                  const isFormulaActive = selectedFormula.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFormula(f)}
                      className={`text-xs font-sans tracking-[0.2em] transition-all duration-300 focus:outline-none cursor-pointer relative pb-1 ${
                        isFormulaActive
                          ? "text-[#2A2B2A] font-black"
                          : "text-[#2A2B2A]/35 hover:text-[#2A2B2A] font-extralight"
                      }`}
                    >
                      {f.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formula Detail & Custom adjustment simulation */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="font-serif font-normal text-lg sm:text-xl text-[#2A2B2A] italic">
                  {selectedFormula.name}
                </h4>
                <p className="text-xs text-[#2A2B2A]/60 font-sans leading-relaxed text-justify font-light">
                  {selectedFormula.description}
                </p>
              </div>

              {/* Configuration panel (Fully dissolved / background removed) */}
              <div className="py-2 space-y-6">
                <h5 className="text-[9px] font-mono tracking-[0.2em] text-[#800020] uppercase font-bold">
                  美学力矩自定义调节板 (AESTHETIC LEVEL DIAL)
                </h5>

                {/* Accent Level Slider */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-light text-[#2A2B2A]/80 tracking-wide text-[11px] sm:text-xs">冷硬防护外壳 vs 绵密有机流动</span>
                    <span className="font-mono text-[#800020] font-normal text-[11px] sm:text-xs">[ {accentLevel}% 配比 (偏向大衣) ]</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={accentLevel}
                    onChange={(e) => setAccentLevel(Number(e.target.value))}
                    className="w-full h-[1px] bg-[#2A2B2A]/10 appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2A2B2A] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2A2B2A]"
                  />
                  <div className="flex justify-between text-[9px] text-[#2A2B2A]/40 font-mono tracking-wide">
                    <span>10% 流动解构占主导</span>
                    <span>90% 挺坚廓形占主导</span>
                  </div>
                </div>

                {/* Toggle accessory with subtle inline integration */}
                <div className="flex items-center justify-between text-xs pt-4 border-t border-[#2A2B2A]/10">
                  <div className="space-y-0.5">
                    <span className="font-sans font-light text-[#2A2B2A]/80 text-[11px] sm:text-xs uppercase tracking-wide">是否纳入【方尖碑折叠托特包】？</span>
                    <p className="text-[10px] text-[#2A2B2A]/40 font-sans font-light">移除配饰会简化下摆至大腿范围的几何转折度</p>
                  </div>
                  <button
                    onClick={() => setIsBagIncluded(!isBagIncluded)}
                    className="flex items-center gap-2 focus:outline-none cursor-pointer text-xs font-mono tracking-widest text-[#2A2B2A] transition-colors"
                    id="toggle-bag-inclusion"
                  >
                    <div className="w-3.5 h-3.5 rounded border border-[#2A2B2A]/30 flex items-center justify-center text-[10px] font-mono leading-none transition-all hover:border-[#2A2B2A]">
                      {isBagIncluded && <Check className="w-2.5 h-2.5 text-[#2A2B2A]" strokeWidth={3} />}
                    </div>
                    <span className="text-[10px] font-light text-[#2A2B2A]/70 uppercase">
                      {isBagIncluded ? "INCLUDED" : "EXCLUDED"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Composition Matrix List (No boxes, bare metadata, vertical line separators) */}
              <div className="space-y-4">
                <span className="text-[9px] font-mono tracking-[0.2em] text-[#2A2B2A]/45 uppercase font-semibold block border-b border-[#2A2B2A]/10 pb-1.5">
                  公式单品清单 (PIECES OF MATRIX)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedFormula.pieces.map((piece, idx) => {
                    const isAccessory = piece.role.includes("Accessory");
                    const isRemoved = isAccessory && !isBagIncluded;

                    return (
                      <div
                        key={idx}
                        className={`pl-3 border-l border-[#2A2B2A]/15 py-1 flex flex-col justify-between min-h-[50px] transition-opacity duration-300 ${
                          isRemoved ? "opacity-25" : "opacity-100"
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-[8.5px] font-mono uppercase tracking-[0.15em] text-[#800020] font-medium">
                            {piece.role.replace("Piece", "").replace("Accessory", "ACC").trim()}
                          </p>
                          <p className="font-sans text-[11px] text-[#2A2B2A] leading-tight font-medium">
                            {piece.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Style Tips */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[9px] font-mono tracking-widest text-[#2a2b2a]/45 uppercase font-semibold block border-b border-[#2a2b2a]/10 pb-1.5">
                  高级策展搭配法则
                </span>
                <ul className="space-y-2">
                  {selectedFormula.styleTips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#2a2b2a]/75 font-sans flex gap-2 items-start"
                    >
                      <Check className="w-3.5 h-3.5 text-[#800020] shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-light">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons (Delicate Curator Signature Alignment) */}
              <div className="flex justify-end pt-6 border-t border-[#2A2B2A]/10">
                <button
                  onClick={handleSaveModifiedFormula}
                  className="w-full sm:w-auto text-[10px] font-sans font-light tracking-[0.25em] uppercase px-6 py-2.5 bg-transparent border border-[#2A2B2A]/30 text-[#2A2B2A] rounded-lg hover:bg-[#2A2B2A] hover:text-[#F6F4E8] transition-all focus:outline-none flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  id="btn-save-customized-formula"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#2A2B2A]/50 group-hover:text-inherit" />
                  <span>保存此自定义配置至我的灵感板</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen Zoomable Modal */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 bg-neutral-950/90 z-[99] flex flex-col justify-center items-center p-4 cursor-zoom-out"
        >
          <img
            src={zoomImage}
            alt="Large view image"
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-neutral-800 animate-scale-in"
          />
          <p className="text-white font-sans text-xs mt-4 text-center select-none bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full shadow">
            秀场研究实证实物微观影像。点击任意空白处可关闭此视口。
          </p>
        </div>
      )}
    </div>
  );
}
