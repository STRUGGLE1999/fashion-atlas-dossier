import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Film, 
  BookText, 
  Star, 
  ArrowRight, 
  RefreshCw, 
  Layers, 
  Search, 
  Heart, 
  Clock, 
  Sliders, 
  Compass, 
  Check, 
  Play, 
  CheckCircle2,
  Bookmark,
  Calendar,
  Hash
} from "lucide-react";
import { AestheticGuide, FashionMovie, FashionBook, RunwayShow } from "../types";
import { useFashionData } from "../hooks/useFashionData";

interface AestheticSectionProps {
  onSaveGuideToMoodboard: (title: string, summary: string) => void;
  onSaveMovieToMoodboard: (movie: FashionMovie) => void;
  onSaveBookToMoodboard: (book: FashionBook) => void;
  onSaveRunwayToMoodboard: (runway: RunwayShow) => void;
  savedItemIds: string[];
  activeSubTab?: "guides" | "bookshelf" | "runways";
  onActiveSubTabChange?: (tab: "guides" | "bookshelf" | "runways") => void;
}

export default function AestheticSection({
  onSaveGuideToMoodboard,
  onSaveMovieToMoodboard,
  onSaveBookToMoodboard,
  onSaveRunwayToMoodboard,
  savedItemIds,
  activeSubTab,
  onActiveSubTabChange,
}: AestheticSectionProps) {
  const { data: aestheticGuides, loading: loadingGuides } = useFashionData<AestheticGuide>("aesthetic_guides");
  const { data: fashionMovies, loading: loadingMovies } = useFashionData<FashionMovie>("movies");
  const { data: fashionBooks, loading: loadingBooks } = useFashionData<FashionBook>("books");
  const { data: runwayShows, loading: loadingRunways } = useFashionData<RunwayShow>("runways");

  const [localAestheticSubTab, setLocalAestheticSubTab] = useState<"guides" | "bookshelf" | "runways">("guides");
  const aestheticSubTab = activeSubTab !== undefined ? activeSubTab : localAestheticSubTab;
  const setAestheticSubTab = onActiveSubTabChange !== undefined ? onActiveSubTabChange : setLocalAestheticSubTab;

  const [activeGuide, setActiveGuide] = useState<AestheticGuide | null>(null);

  useEffect(() => {
    if (aestheticGuides.length > 0 && !activeGuide) {
      setActiveGuide(aestheticGuides[0]);
    }
  }, [aestheticGuides]);

  const [paperMode, setPaperMode] = useState(false); // Parchment eye-care reading mode!

  // Bookshelf filters & search
  const [bookCategory, setBookCategory] = useState<"全部" | "入门" | "进阶" | "视觉" | "专业">("全部");
  const [bookSearch, setBookSearch] = useState("");

  // Runway filters & search
  const [runwaySearch, setRunwaySearch] = useState("");

  if (loadingGuides || loadingMovies || loadingBooks || loadingRunways) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]"></div>
      </div>
    );
  }

  // Filtering books
  const filteredBooks = fashionBooks.filter((book) => {
    const matchesCategory = bookCategory === "全部" || book.category === bookCategory;
    const matchesSearch = 
      book.name.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.originalName.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.recommendationReason.toLowerCase().includes(bookSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtering runways
  const filteredRunways = runwayShows.filter((show) => {
    const query = runwaySearch.toLowerCase();
    return (
      show.brand.toLowerCase().includes(query) ||
      show.title.toLowerCase().includes(query) ||
      show.season.toLowerCase().includes(query) ||
      show.whatToWatch.toLowerCase().includes(query) ||
      show.importance.toLowerCase().includes(query) ||
      show.associatedStyles.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Aesthetics Top Banner */}
      <div className="border-b border-[#2A2B2A]/10 pb-5">
        <span className="text-[9px] font-mono tracking-[0.25em] text-[#800020] block mb-1">AESTHETIC & SCHOLASTIC INTELLIGENCE</span>
        <h2 className="font-serif font-normal text-2xl text-[#2A2B2A] md:text-3xl italic">时装美学引导与馆藏文字放映室</h2>
        <p className="text-xs text-[#2A2B2A]/60 mt-1 max-w-2xl font-sans font-light">
          穿搭与裁剪背后的精神文献。我们在此为您展开结构美学引导大纲、50本常青时尚书研析以及30场殿堂级里程碑秀场路线，帮助您训练出策展人般高亢的鉴赏双眼。
        </p>
      </div>

      {/* Internal Menu Selector with no emojis and high-letter-spaced selector */}
      <div className="flex border-b border-[#2A2B2A]/5 pb-0 gap-x-8">
        {[
          { id: "guides", label: "结构美学大纲", count: aestheticGuides.length },
          { id: "bookshelf", label: "时尚精选书架", count: fashionBooks.length },
          { id: "runways", label: "30场经典秀场路径", count: runwayShows.length },
        ].map((tab) => {
          const isActive = aestheticSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAestheticSubTab(tab.id as any)}
              className={`text-xs pb-3 tracking-[0.16em] font-sans transition-all focus:outline-none cursor-pointer relative ${
                isActive
                  ? "text-[#800020] font-black"
                  : "text-[#2A2B2A]/40 hover:text-[#2A2B2A]/70 font-light"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`inline-block font-sans font-light text-[9.5px] tracking-normal ml-2 ${isActive ? "text-[#2A2B2A]/50" : "text-[#2A2B2A]/30"}`}>
                [ {tab.count} ]
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: AESTHETIC GUIDES & CINEMAS (Original and enhanced) */}
        {aestheticSubTab === "guides" && (
          <motion.div
            key="guides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
          >
            {/* Guides (Left section) */}
            <div className="xl:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2B2A]/5 pb-4">
                {/* Minimalist guide options with horizontal/vertical flow */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {aestheticGuides.map((guide, idx) => {
                    const isGuideActive = activeGuide?.id === guide.id;
                    return (
                      <div key={guide.id} className="flex items-center">
                        <button
                          onClick={() => setActiveGuide(guide)}
                          className={`text-xs text-left tracking-[0.2em] font-sans transition-all focus:outline-none cursor-pointer relative pb-1 ${
                            isGuideActive
                              ? "text-[#2A2B2A] font-black"
                              : "text-[#2A2B2A]/40 hover:text-[#2A2B2A] font-extralight"
                          }`}
                        >
                          {guide.title.split("：")[0]}
                        </button>
                        {idx < aestheticGuides.length - 1 && (
                          <span className="text-[#2A2B2A]/10 text-[10px] font-thin ml-6 select-none font-sans">|</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Parchment eye-saving display mode toggle - Ghost link */}
                <button
                  onClick={() => setPaperMode(!paperMode)}
                  className="text-[9px] sm:text-[11px] tracking-[0.18em] font-sans font-light text-[#2A2B2A]/50 hover:text-[#2A2B2A] focus:outline-none transition-colors duration-300 cursor-pointer bg-transparent border-0 p-0"
                  title={paperMode ? "切换到默认现代视窗" : "切换到纸质高对比阅读"}
                >
                  {paperMode ? "默认现代视窗 ↗" : "模拟纸质高对比阅读 ↗"}
                </button>
              </div>

              {activeGuide && (
                <motion.div
                  key={activeGuide.id + "-" + paperMode}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  className={`transition-all duration-300 ${
                    paperMode
                      ? "rounded-lg p-6 sm:p-8 border bg-[#FAF6EC] border-[#E6DFD3] text-[#2F1F17] font-serif shadow-sm"
                      : "text-[#2A2B2A] font-sans py-4"
                  }`}
                >
                  <span className={`text-[9px] font-mono uppercase tracking-widest block mb-1.5 ${paperMode ? "text-[#8C7255]/90 font-semibold" : "text-[#2A2B2A]/40"}`}>
                    MUST-READ AESTHETIC BLUEPRINT
                  </span>
                  <h3 className={`font-serif font-bold text-lg sm:text-xl tracking-tight mb-3 ${paperMode ? "text-[#2F1F17]" : "text-[#2A2B2A]"}`}>
                    {activeGuide.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 italic border-l-2 pl-4 ${paperMode ? "border-[#E6DFD3] text-[#2F1F17]/80" : "border-[#2A2B2A]/20 text-[#2A2B2A]/60"}`}>
                    “{activeGuide.introduction}”
                  </p>

                  <div className="space-y-6">
                    {activeGuide.sections.map((sect, idx) => {
                      const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
                      const roman = romanNumerals[idx] || (idx + 1).toString();
                      return (
                        <div key={idx} className="space-y-2">
                          <h4 className="flex items-baseline gap-2 select-none">
                            <span className="font-serif italic text-xs text-[#800020] mr-1">
                              [ {roman} ]
                            </span>
                            <span className={`text-sm sm:text-base font-semibold ${paperMode ? "font-serif text-[#2F1F17]" : "font-sans text-[#2A2B2A]"}`}>
                              {sect.subtitle.replace(/^\d+\.\s*/, "")}
                            </span>
                          </h4>
                          <p className={`text-xs sm:text-sm leading-relaxed font-light text-justify ${
                            paperMode ? "font-serif text-[#2F1F17]/90" : "font-sans text-[#2A2B2A]/80"
                          }`}>
                            {sect.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Curatorial Summary (De-SaaSed) */}
                  <div
                    className="mt-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{
                      borderTop: "1px solid rgba(42, 43, 42, 0.06)",
                      borderBottom: "1px solid rgba(42, 43, 42, 0.06)"
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <BookText className="w-5 h-5 shrink-0 text-[#8C7255] mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-mono text-[#2A2B2A]/40 uppercase tracking-widest font-semibold">策展人小结</p>
                        <p className={`text-xs ${paperMode ? "text-[#2F1F17] font-serif" : "text-[#2A2B2A]/80 font-sans"} font-medium`}>{activeGuide.summary}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSaveGuideToMoodboard(activeGuide.title, activeGuide.summary)}
                      className="text-[11px] shrink-0 font-sans font-light uppercase tracking-[0.15em] px-4 py-2 rounded-lg border border-[#2A2B2A] bg-transparent text-[#2A2B2A] hover:bg-[#2A2B2A] hover:text-[#F6F4E8] transition-all duration-300 focus:outline-none self-end sm:self-auto cursor-pointer active:scale-95"
                    >
                      保存摘要至暂存板
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggested Movies (Right section) */}
            <div className="xl:col-span-4 space-y-6">
              <div className="border-b border-b-[#2A2B2A]/10 pb-3">
                <span className="text-[9px] font-mono tracking-[0.2em] text-[#800020] block mb-1">CINEMATIC DICTIONARY</span>
                <h3 className="font-serif font-bold text-sm text-[#2A2B2A] uppercase flex items-center gap-2 italic">
                  <span className="w-1.5 h-1.5 bg-[#800020] inline-block"></span>
                  核心时尚电影清单
                </h3>
              </div>

              <div className="space-y-12">
                {fashionMovies.map((movie) => {
                  const isSaved = savedItemIds.includes(movie.id);

                  return (
                    <div
                      key={movie.id}
                      className="flex flex-col space-y-3 pb-8 border-b border-[#2A2B2A]/10 last:border-0"
                    >
                      <img
                        src={movie.image}
                        alt={movie.name}
                        referrerPolicy="no-referrer"
                        className="w-full max-w-xs aspect-[4/5] object-cover rounded-lg bg-[#FAF9F6] border border-[#2A2B2A]/5"
                      />
                      <div className="min-w-0 flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#2A2B2A]/45">{movie.year} / {movie.director}</span>
                          <span className="text-[#2A2B2A]/20 font-mono select-none text-[9px]">•</span>
                          <div className="flex items-center text-[#8C7255] gap-0.5">
                            <Star className="w-3 h-3 fill-current text-amber-500" />
                            <span className="text-[10px] font-mono font-bold text-amber-600">{movie.rating}</span>
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-[#2A2B2A] leading-tight">
                          {movie.name}
                        </h4>
                        
                        <p className="text-[11px] text-[#2A2B2A]/65 font-sans leading-relaxed text-justify font-light">
                          {movie.recommendationReason}
                        </p>

                        <div className="flex justify-start pt-1">
                          <button
                            onClick={() => onSaveMovieToMoodboard(movie)}
                            className={`text-[10px] uppercase tracking-[0.12em] font-sans font-light px-4 py-1.5 rounded-lg border transition-all duration-300 focus:outline-none cursor-pointer ${
                              isSaved
                                ? "bg-[#5C1D24]/10 border-[#5C1D24]/30 text-[#5C1D24]"
                                : "bg-transparent border-[#2A2B2A]/30 text-[#2A2B2A] hover:bg-[#2A2B2A] hover:text-[#F6F4E8] hover:border-[#2A2B2A]"
                            }`}
                            id={`btn-save-movie-${movie.id}`}
                          >
                            <span>{isSaved ? "已存灵感板" : "保存灵感"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: FASHION BOOKSHELF (50 peer-reviewed curated books) */}
        {aestheticSubTab === "bookshelf" && (
          <motion.div
            key="bookshelf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Books control header */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 border-b border-[#2A2B2A]/10 pb-4">
              {/* Category tabs list with clean typographic lines */}
              <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
                {["全部", "入门", "进阶", "视觉", "专业"].map((cat) => {
                  const isCatActive = bookCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setBookCategory(cat as any)}
                      className={`text-xs text-left tracking-[0.2em] font-sans transition-all duration-300 focus:outline-none cursor-pointer relative pb-1 ${
                        isCatActive
                          ? "text-[#2A2B2A] font-black"
                          : "text-[#2A2B2A]/35 hover:text-[#2A2B2A] font-extralight"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search bar with low profile border */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="检索书籍名称、作者、或推荐线索..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#2A2B2A]/10 hover:border-[#2A2B2A]/20 focus:border-[#800020]/40 rounded-none text-xs text-[#2A2B2A] pl-5 pr-4 py-1.5 focus:outline-none transition-colors placeholder:text-[#2A2B2A]/35 placeholder:font-light"
                />
                <Search className="w-3.5 h-3.5 text-[#2A2B2A]/35 absolute left-0 bottom-2" />
              </div>
            </div>

            {/* Books Single Column Waterfall (Single-column Feed aligned strictly on the left) */}
            <div className="space-y-[120px] sm:space-y-[140px] pt-8 max-w-2xl">
              {filteredBooks.map((book) => {
                const isSaved = savedItemIds.includes(book.id);

                return (
                  <div
                    key={book.id}
                    className="flex flex-col space-y-6 pb-12 border-b border-[#2A2B2A]/10 last:border-0"
                  >
                    {/* Large Book Banner Image stretching across the feed */}
                    <div className="relative rounded-lg overflow-hidden w-full aspect-[16/10] sm:aspect-[21/9] border border-[#2A2B2A]/10 bg-neutral-900 group">
                      <img
                        src={book.image}
                        alt={book.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      />
                      <span className="absolute top-3 left-3 text-[9px] font-mono tracking-widest uppercase bg-[#800020] text-[#FAF9F6] px-2.5 py-1 rounded font-bold">
                        {book.category} // CLASSIC LEVEL
                      </span>
                    </div>

                    <div className="space-y-4 w-full">
                      {/* Metadatas */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#2A2B2A]/45">
                        <span>{book.year} • {book.author}</span>
                        <span>•</span>
                        <div className="flex items-center text-amber-600 gap-0.5 font-bold">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          <span>{book.rating}</span>
                        </div>
                      </div>

                      {/* Header left-aligned */}
                      <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#2A2B2A] leading-tight italic tracking-tight">
                        {book.name}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] font-mono text-[#2A2B2A]/45 block uppercase tracking-wide">
                        {book.originalName}
                      </span>

                      {/* Descriptive contents */}
                      <p className="text-xs sm:text-sm text-[#2A2B2A]/75 font-sans leading-relaxed text-justify">
                        {book.recommendationReason}
                      </p>

                      {/* Procurement advice */}
                      <div className="text-xs font-mono text-[#2A2B2A]/55 italic bg-[#E5E0D8]/40 border border-[#2A2B2A]/10 p-3 rounded-lg leading-relaxed text-justify">
                        <strong>经典物理参考书目：</strong>{book.availabilityNote}
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-4 border-t border-[#2A2B2A]/5 flex items-center justify-between gap-4">
                        {book.availLink ? (
                          <a
                            href={book.availLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-[#8C7255] hover:text-[#5C1D24] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>WorldCat 官方典藏回溯索引 ↗</span>
                          </a>
                        ) : (
                          <span className="text-[9.5px] font-mono text-[#2A2B2A]/35 uppercase">ACADEMIC RESOURCE</span>
                        )}

                        <button
                          onClick={() => onSaveBookToMoodboard(book)}
                          className={`text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-lg border transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 font-sans font-light hover:bg-[#2A2B2A] hover:text-[#F6F4E8] ${
                            isSaved
                              ? "bg-[#5C1D24]/10 border-[#5C1D24]/30 text-[#5C1D24]"
                              : "bg-transparent border-[#2A2B2A]/30 text-[#2A2B2A]"
                          }`}
                          id={`btn-save-book-${book.id}`}
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#5C1D24]" />
                              <span>已放入研习单</span>
                            </>
                          ) : (
                            <span>收藏本书籍</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredBooks.length === 0 && (
                <div className="col-span-full py-12 text-center text-xs text-[#2A2B2A]/45 font-sans">
                   没有检索到匹配馆藏精选书籍
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: RUNWAY SHOWN CLIPS CHRONOLOGY (30 iconic runways) */}
        {aestheticSubTab === "runways" && (
          <motion.div
            key="runways"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Runways timeline search controls */}
            <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 border-b border-[#2A2B2A]/10 pb-4">
              <div>
                <span className="text-[9px] font-mono text-[#800020] uppercase font-bold tracking-widest block mb-1">MUSEUM HISTORY SCAPE</span>
                <h3 className="font-serif font-normal text-xl text-[#2A2B2A] italic">二十世纪至现代先锋秀场三十脉络</h3>
              </div>

              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="搜索品牌(McQueen, Margiela等)、细节或看点..."
                  value={runwaySearch}
                  onChange={(e) => setRunwaySearch(e.target.value)}
                  className="w-full bg-transparent border-t-0 border-x-0 border-b border-[#2A2B2A]/10 hover:border-[#2A2B2A]/20 focus:border-[#800020]/40 rounded-none text-xs text-[#2A2B2A] pl-5 pr-4 py-1.5 focus:outline-none transition-colors placeholder:text-[#2A2B2A]/35 placeholder:font-light"
                />
                <Search className="w-3.5 h-3.5 text-[#2A2B2A]/35 absolute left-0 bottom-2" />
              </div>
            </div>

            {/* Runways Single Column Waterfall Chronology (Single-column Feed aligned strictly on the left) */}
            <div className="space-y-[120px] sm:space-y-[140px] pt-8 max-w-2xl">
              {filteredRunways.map((show, idx) => {
                const isSaved = savedItemIds.includes(show.id);

                return (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col space-y-6 pb-12 border-b border-[#2A2B2A]/10 last:border-0"
                  >
                    {/* Big poster image spanning 80-100% width */}
                    <div className="relative rounded-lg overflow-hidden w-full aspect-[16/10] sm:aspect-[21/9] border border-[#2A2B2A]/10 bg-neutral-900 group">
                      <img
                        src={show.image}
                        alt={show.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-mono tracking-wider px-2.5 py-1 bg-[#800020] text-[#FAF9F6] rounded font-bold">
                        {show.season}
                      </span>
                    </div>

                    {/* Left aligned metadata chronology */}
                    <div className="space-y-4 w-full">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#2A2B2A]/45">
                        <span className="font-bold text-[#800020] uppercase font-semibold">CHRONOLOGY MATRIX #{idx+1}</span>
                        <span>•</span>
                        <span>放映参考来源: {show.videoRefer}</span>
                      </div>

                      {/* Header block */}
                      <h4 className="font-serif font-normal text-xl sm:text-2xl text-[#2A2B2A] tracking-tight leading-none italic flex flex-wrap items-baseline gap-2">
                        <span className="text-[#800020] font-bold">{show.brand}</span>
                        <span className="font-sans font-light text-[#2A2B2A]/80 text-lg">— {show.title}</span>
                      </h4>

                      {/* Curated Academic info */}
                      <div className="space-y-4 text-xs text-justify leading-relaxed">
                        <div>
                          <span className="text-[9.5px] font-mono tracking-widest text-[#800020] uppercase font-bold block mb-1">🏛️ 历史学术影响 (Historical Importance)</span>
                          <p className="text-[#2A2B2A]/85 font-medium leading-relaxed">{show.importance}</p>
                        </div>

                        <div>
                          <span className="text-[9.5px] font-mono tracking-widest text-[#2A2B2A]/40 block mb-1">👁️ 大秀学术看点建议 (What to Watch)</span>
                          <p className="text-[#2A2B2A]/70 leading-relaxed font-sans">{show.whatToWatch}</p>
                        </div>
                      </div>

                      {/* Badges and action bar aligned */}
                      <div className="pt-4 border-t border-[#2A2B2A]/5 flex flex-wrap items-center justify-between text-[11px] gap-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {show.associatedStyles.map((style, i) => (
                            <span
                              key={i}
                              className="text-[9.5px] font-mono px-2 py-0.5 bg-[#E5E0D8]/40 border border-[#2A2B2A]/15 rounded text-[#2A2B2A]/70"
                            >
                              #{style}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => onSaveRunwayToMoodboard(show)}
                          className={`text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-lg border transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 font-sans font-light hover:bg-[#2A2B2A] hover:text-[#F6F4E8] ${
                            isSaved
                              ? "bg-[#5C1D24]/10 border-[#5C1D24]/30 text-[#5C1D24]"
                              : "bg-transparent border-[#2A2B2A]/30 text-[#2A2B2A]"
                          }`}
                          id={`btn-save-runway-${show.id}`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current text-[#5C1D24]" : ""}`} />
                          <span>{isSaved ? "已存灵感板" : "收藏本场大秀"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredRunways.length === 0 && (
                <div className="py-12 text-center text-xs text-[#2A2B2A]/40 font-sans">
                  没有检索到匹配的时装秀路径
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
