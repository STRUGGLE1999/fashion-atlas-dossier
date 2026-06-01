import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart, ChevronRight, Compass } from "lucide-react";
import { archiveItems } from "../data";
import { ArchiveItem } from "../types";

interface ArchiveSectionProps {
  onSaveToMoodboard: (item: ArchiveItem) => void;
  onConsultAI: (item: ArchiveItem) => void;
  savedItemIds: string[];
}

export default function ArchiveSection({
  onSaveToMoodboard,
  onConsultAI,
  savedItemIds,
}: ArchiveSectionProps) {
  const [selectedItem, setSelectedItem] = useState<ArchiveItem>(archiveItems[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* List of digitized items (Left list) */}
      <div className="lg:col-span-5 flex flex-col justify-start">
        {/* Knife-edge precise X-axis left alignment with items */}
        <div className="border-b border-[#2A2B2A]/[0.06] pb-4 mb-5">
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#121212]/50 block mb-1">DIGITIZED ARCHIVES • 藏品清单</span>
          <h2 className="font-serif font-normal text-2xl text-[#121212] italic">学术探针与馆藏物理档案</h2>
        </div>

        {/* Level split via a subtle 1px gray border, removing all enclosing white card containers */}
        <div className="divide-y divide-[#2A2B2A]/[0.06] border-b border-[#2A2B2A]/[0.06]">
          {archiveItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            const isSaved = savedItemIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative py-5 cursor-pointer pl-0 pr-2 group/item transition-all duration-300"
              >
                <div className="flex gap-4 items-center w-full">
                  {/* Digitalized preview Cover with micro hover scaling and dynamic selections opacity */}
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className={`w-14 h-14 rounded-[4px] object-cover shrink-0 border border-[#121212]/5 transition-all duration-500 ${
                      isSelected 
                        ? "opacity-100 scale-102" 
                        : "opacity-45 group-hover/item:opacity-80"
                    }`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8.5px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                        isSelected ? "text-[#8C7255] font-semibold" : "text-[#121212]/30 font-light"
                      }`}>
                        {item.category}
                      </span>
                      {isSaved && (
                        <span className="text-[#5C1D24] text-[8.5px] font-mono select-none opacity-80">
                          • [已存灵感]
                        </span>
                      )}
                    </div>

                    {/* Bold Heavy ink transition when active, paired with a custom Burgundy 4-point star icon anchor */}
                    <h3 className={`font-serif tracking-tight leading-snug truncate flex items-center transition-all duration-300 ${
                      isSelected 
                        ? "font-black text-[#121212] text-sm sm:text-base" 
                        : "font-extralight text-[#121212]/35 text-xs sm:text-sm"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 fill-[#5C1D24] text-[#5C1D24] shrink-0 mr-1.5 animate-pulse" viewBox="0 0 24 24">
                          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" />
                        </svg>
                      )}
                      {item.name}
                    </h3>
                    
                    <p className={`text-[10px] font-mono mt-0.5 transition-colors duration-300 ${
                      isSelected ? "text-[#121212]/60 font-medium" : "text-[#121212]/25 font-light"
                    }`}>
                      {item.designer}
                    </p>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "text-[#5C1D24] rotate-90" : "text-[#121212]/15 sm:group-hover/item:text-[#121212]/30"}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Curatorial Memo Box without containing boxes, only a physical burgundy lines emphasis */}
        <div className="p-0 pl-5 pr-2 bg-transparent border-l-[3px] border-[#5C1D24] text-xs leading-relaxed font-sans mt-10 md:mt-12 animate-fade-in">
          <p className="font-semibold mb-1.5 tracking-wider uppercase font-mono text-[9px] text-[#5C1D24] opacity-85">🎞️ CURATORIAL MEMO • 策展便签</p>
          <p className="font-light text-[#121212]/75">
            您的每次点击，右侧便会如卷轴一般，为你详尽解构所选馆藏的裁切机理、历史经纬与设计特征。在下方轻击 “探讨本件工艺” 即可令智能对谈助手介入，进行深度、专属时装社会学探讨。
          </p>
        </div>
      </div>

      {/* Item details Panel (Right detail) - flat parchment, no enclosing containers */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col h-full bg-transparent p-0"
          >
            {/* Visual Hero Header Section with 8-pointed design, directly exposed on background */}
            <div className="relative rounded overflow-hidden h-72 sm:h-80 mb-6 border border-[#121212]/10 group">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-[#121212]/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-[9px] font-mono tracking-[0.25em] text-[#FAF9F6]/65 uppercase font-bold">ACTIVE ARCHIVE PIECE • 当前索引藏品</span>
                <h3 className="font-serif font-normal text-white text-2xl sm:text-3xl mt-1 tracking-tight italic">
                  {selectedItem.name}
                </h3>
                <p className="text-[#FAF9F6]/75 text-[10px] font-mono mt-1 tracking-wider">
                  DESIGNED BY • {selectedItem.designer}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons - Ghost Buttons, Transparent, Expanded Tracking, Thin Borders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 pb-8 border-b border-[#2A2B2A]/[0.06] w-full">
              <button
                onClick={() => onSaveToMoodboard(selectedItem)}
                className={`text-[10px] sm:text-xs px-4 py-3 rounded-[8px] font-sans tracking-[0.18em] flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none cursor-pointer border ${
                  savedItemIds.includes(selectedItem.id)
                    ? "bg-transparent text-[#5C1D24] border-[#5C1D24]/40 font-medium"
                    : "bg-transparent text-[#121212]/80 border border-[#121212]/15 font-light hover:border-[#121212]/40 hover:bg-[#121212]/[0.02] active:scale-97"
                }`}
                id={`btn-save-archive-${selectedItem.id}`}
              >
                <Heart className={`w-3.5 h-3.5 ${savedItemIds.includes(selectedItem.id) ? "fill-current text-[#5C1D24]" : ""}`} />
                <span>{savedItemIds.includes(selectedItem.id) ? "已存灵感" : "保存至灵感板"}</span>
              </button>

              <button
                onClick={() => onConsultAI(selectedItem)}
                className="text-[10px] sm:text-xs px-4 py-3 rounded-[8px] font-sans font-light tracking-[0.18em] bg-transparent text-[#121212]/80 border border-[#121212]/15 hover:border-[#121212]/40 hover:bg-[#121212]/[0.02] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none active:scale-97 cursor-pointer"
                id={`btn-consult-archive-${selectedItem.id}`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#5C1D24]" />
                <span>探讨本件工艺</span>
              </button>

              <a
                href={`#/resource/${selectedItem.id}`}
                className="text-[10px] sm:text-xs px-4 py-3 rounded-[8px] font-sans font-light tracking-[0.18em] bg-transparent text-[#121212]/80 border border-[#121212]/15 hover:border-[#121212]/40 hover:bg-[#121212]/[0.02] transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none active:scale-97 cursor-pointer text-center"
                id={`btn-details-archive-${selectedItem.id}`}
              >
                <Compass className="w-3.5 h-3.5 text-[#8C7255]" />
                <span>查看馆藏详情 ↗</span>
              </a>
            </div>

            {/* Meta Attributes Grid - Flat transparent double columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6 text-justify">
              <div>
                <dt className="text-[9.5px] font-mono text-[#5C1D24] uppercase tracking-widest mb-2.5 font-bold">[设计理念 & 构造]</dt>
                <dd className="text-[#121212]/75 leading-relaxed font-sans">{selectedItem.description}</dd>
              </div>
              <div>
                <dt className="text-[9.5px] font-mono text-[#5C1D24] uppercase tracking-widest mb-2.5 font-bold">[时尚社会学背景 & 沿革]</dt>
                <dd className="text-[#121212]/75 leading-relaxed font-sans">{selectedItem.history}</dd>
              </div>
            </div>

            {/* Material & Details Section - Ledgers lines and attributes list */}
            <div className="mt-6 space-y-6">
              {/* Ledger Lines layout enclosing the materials details */}
              <div className="border-t border-b border-[#2A2B2A]/[0.04] py-4 flex flex-col sm:flex-row sm:items-baseline gap-x-2.5 text-xs">
                <span className="font-mono font-bold text-[#5C1D24] tracking-wider uppercase mb-1.5 sm:mb-0 shrink-0">[工艺用料 / Materials]：</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 sm:mt-0">
                  {selectedItem.materials.split(/[、]/).map((material, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-[#5C1D24]/30 font-light text-[10px] select-none">//</span>}
                      <span className="text-xs text-[#121212]/80 font-mono tracking-wide">
                        {material.trim()}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Core Attributes features details */}
              <div>
                <p className="text-[9px] font-mono text-[#121212]/50 uppercase tracking-widest mb-3.5 font-bold">核心版型剖面特征 (CORE ATTRIBUTES)</p>
                <div className="space-y-3">
                  {selectedItem.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="border-b border-[#2A2B2A]/[0.06] pb-2.5 last:border-0 text-xs text-[#121212]/80 flex gap-3.5 items-start"
                    >
                      <span className="font-mono text-[#8C7255] tracking-widest text-[9.5px] mt-0.5 select-none font-semibold">[0{idx + 1}]</span>
                      <p className="font-sans leading-relaxed text-left">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
