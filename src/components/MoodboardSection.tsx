import React, { useState } from "react";
import { MoodboardItem } from "../types";
import { Trash2, FileText, Heart, Calendar, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MoodboardSectionProps {
  items: MoodboardItem[];
  onRemoveItem: (id: string) => void;
  onAddNote: (title: string, notes: string) => void;
}

export default function MoodboardSection({
  items,
  onRemoveItem,
  onAddNote,
}: MoodboardSectionProps) {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  // Multi-input focus states for ledger-lines animation
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    onAddNote(
      noteTitle.trim() || `我的策展笔记 - ${new Date().toLocaleDateString()}`,
      noteContent.trim()
    );
    noteTitle && setNoteTitle("");
    setNoteContent("");
  };

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const triggerExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await fetch("/api/moodboard/export");
      if (!response.ok) throw new Error("PDF export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = response.headers
        .get("content-disposition")
        ?.match(/filename="([^"]+)"/)?.[1] || "FashionAtlas-Dossier.pdf";
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Dossier export error:", error);
      alert("私人特刊生成暂时受阻，请稍后再试。");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Header with Export text action link instead of solid block */}
      <div className="border-b border-[#2A2B2A]/[0.06] pb-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#121212]/50 block mb-1">PERSONAL MOODBOARD • 灵感手记</span>
          <h2 className="font-serif font-normal text-2xl text-[#121212] md:text-3xl italic">
            我的时尚灵感看板与数字化档案夹
          </h2>
          <p className="text-xs text-[#121212]/55 mt-1 font-sans">
            在这里汇总和审视您保存的先锋剪裁、经典廓形、流线公式，并可以撰写您特有的策展见解或导出设计简稿。
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={triggerExport}
            disabled={exporting}
            className="text-[10px] tracking-[0.18em] font-sans font-light uppercase text-[#121212]/75 hover:text-[#5C1D24] transition-colors focus:outline-none cursor-pointer flex items-center gap-1.5 self-start md:self-auto py-1.5"
            id="btn-export-dossier"
          >
            {exporting ? "生成私人特刊中..." : "导出灵感报告 (Dossier) ↗"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create form directly floating, without backgrounds/borders or rounded boxes */}
        <div className="lg:col-span-4 bg-transparent p-0 border-0">
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#5C1D24]/85 block mb-1">CREATIVE STUDIO • 制作实验室</span>
          <h3 className="font-serif font-normal text-sm text-[#121212] mb-6 uppercase flex items-center gap-2 italic">
            <FileText className="w-4 h-4 text-[#8C7255]" />
            撰写独立策展心得
          </h3>

          <form onSubmit={handleSubmitNote} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-[#121212]/50 uppercase tracking-widest font-semibold block">
                主题 / 灵感名称
              </label>
              {/* De-signed horizontal ledger lines bottom line only! */}
              <div className="relative">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  placeholder="例如：对不规则裁剪的力矩反思"
                  className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-[#2A2B2A]/10 py-2.5 text-xs text-[#121212] placeholder-[#121212]/30 focus:outline-none focus:ring-0 transition-all font-sans"
                />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2A2B2A]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: titleFocused ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-[#121212]/50 uppercase tracking-widest font-semibold block">
                构思见解
              </label>
              {/* De-signed horizontal ledger lines bottom line only! */}
              <div className="relative">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onFocus={() => setContentFocused(true)}
                  onBlur={() => setContentFocused(false)}
                  placeholder="在此写下对工艺、材料组合或某场秀的深入体会。例如：将硬性装甲外套内搭蚕丝针织，可以让现代都市穿着富有神圣的诗意..."
                  rows={4}
                  className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-[#2A2B2A]/10 py-2.5 text-xs text-[#121212] placeholder-[#121212]/30 focus:outline-none focus:ring-0 transition-all font-sans resize-none"
                />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#2A2B2A]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: contentFocused ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            </div>

            {/* Ghost Button + 添加灵感卡片 with 8-pointed corner properties */}
            <button
              type="submit"
              disabled={!noteContent.trim()}
              className="w-full text-[10px] uppercase font-sans tracking-[0.18em] py-3 bg-transparent text-[#121212]/80 border border-[#121212]/15 hover:border-[#121212]/40 hover:bg-[#121212]/[0.02] rounded-[8px] focus:outline-none transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer font-light active:scale-98"
            >
              <Plus className="w-3.5 h-3.5 text-[#5C1D24]" />
              <span>添加灵感卡片</span>
            </button>
          </form>

          {/* AI Helper banner without backgrounds, just physical burgundy lines emphasis */}
          <div className="mt-8 p-0 pl-5 pr-2 bg-transparent border-l-[3px] border-[#5C1D24] text-xs font-sans text-[#121212]/75 leading-relaxed">
            <span className="font-semibold text-[#5C1D24] block mb-1.5 flex items-center gap-1.5 tracking-wider uppercase font-mono text-[9px] opacity-85">
              <Sparkles className="w-3 h-3" /> Curate with Gemini
            </span>
            <p className="font-light">
              您可以通过页面右下方神秘星芒呼唤的 <strong>“对谈策展人 AI”</strong> 获得专业 analysis 方案。专家提供的建议支持 <strong>“保存到面板”</strong> ，能瞬间在此转化生成对应的精美文献笔记卡片！
            </p>
          </div>
        </div>

        {/* Right Side: Saved Items Wall */}
        <div className="lg:col-span-8 space-y-5">
          {/* Tabs header: complete anti-SaaS compliance, no separators, heavy titles */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#2A2B2A]/[0.06] pb-3 mb-6">
            {[
              { id: "all", label: "全部灵感" },
              { id: "garment", label: "数字馆藏" },
              { id: "trend", label: "趋势话题" },
              { id: "formula", label: "穿搭公式" },
              { id: "note", label: "策展笔记" }
            ].map((tab) => {
              const isActive = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`text-xs font-sans tracking-widest transition-all focus:outline-none cursor-pointer pb-2 relative ${
                    isActive
                      ? "text-[#121212] font-black"
                      : "text-[#121212]/35 hover:text-[#121212]/75 font-light"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="moodboardActiveLine"
                      className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-[#5C1D24]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-transparent border border-dashed border-[#2A2B2A]/10 p-12 text-center rounded-[8px] flex flex-col justify-center items-center"
              >
                <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-[#8C7255] mb-3 border border-[#2A2B2A]/10">
                  <Heart className="w-5 h-5 mx-auto" />
                </div>
                <h4 className="font-serif font-bold text-base text-[#121212]/85 italic">您的灵感板空无一物</h4>
                <p className="text-xs text-[#121212]/50 leading-relaxed max-w-sm mt-1">
                  前往【资源库】或【每周趋势】探索先锋工艺、时装和搭配，将喜爱的项目一键添加到灵感看板中！
                </p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="space-y-[120px] pt-4 max-w-2xl mx-auto"
              >
                {filteredItems.map((item) => (
                  <motion.div
                    layout
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col space-y-6 pb-12 border-b border-[#2A2B2A]/[0.06] last:border-0 group/card relative"
                  >
                    <div>
                      {/* Naked classification labels header without gray/rounded background capsules */}
                      <div className="flex items-center justify-between mb-4 text-[9px] font-mono">
                        <span className="text-[#121212]/80 uppercase tracking-[0.2em] font-bold flex items-center">
                          <span className="text-[#5C1D24] text-[10px] mr-1.5 select-none">//</span>
                          {item.type === "garment" && "DIGITIZED ARCHIVE • 数字化馆藏"}
                          {item.type === "trend" && "TREND INDEX • 趋势话题"}
                          {item.type === "formula" && "STYLING FORMULA • 搭配公式"}
                          {item.type === "note" && "CURATORIAL NOTES • 策展笔记"}
                        </span>
                        <span className="text-[#121212]/35 flex items-center gap-1 font-mono uppercase tracking-[0.15em] text-[9px]">
                          <Calendar className="w-3.5 h-3.5 text-[#8C7255]/70" />
                          {item.savedAt}
                        </span>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-4">
                        {item.image && (
                          <div className="w-full aspect-[16/10] sm:aspect-[21/9] rounded-[4px] overflow-hidden border border-[#2A2B2A]/[0.05] bg-[#EAE8DD] group/img">
                            <img
                              src={item.image}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-102"
                            />
                          </div>
                        )}
                        <h4 className="font-serif font-normal text-lg sm:text-xl text-[#121212] leading-tight italic tracking-tight">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#121212]/75 font-sans leading-relaxed whitespace-pre-wrap text-justify">
                          {item.notes}
                        </p>
                      </div>
                    </div>

                    {/* Footer tags / actions block with pure footprints tags and hover deletion controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#2A2B2A]/[0.04]">
                      {/* Pure inline flat footprints tags, separated only with breath gap instead of capsules */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {item.tags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9.5px] font-mono tracking-wider text-[#121212]/45 capitalize select-none"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>

                      {/* Deletion Bin controller set to opacity-0 initially, smooth reveals on card hover */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 bg-transparent text-[#121212]/20 hover:text-[#5C1D24]/90 rounded transition-all duration-300 focus:outline-none cursor-pointer border border-transparent opacity-0 group-hover/card:opacity-100"
                        title="自灵感板移除"
                        id={`btn-remove-moodboard-item-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
