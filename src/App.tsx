import React, { useState, useEffect, useRef } from "react";
import HomeSection from "./components/HomeSection";
import ArchiveSection from "./components/ArchiveSection";
import AestheticSection from "./components/AestheticSection";
import TrendsSection from "./components/TrendsSection";
import MoodboardSection from "./components/MoodboardSection";
import CuratorAssistant from "./components/CuratorAssistant";
import ResourceDetailView from "./components/ResourceDetailView";
import {
  ArchiveItem,
  TrendTopic,
  OutfitFormula,
  MoodboardItem,
  FashionMovie,
  FashionBook,
  RunwayShow,
} from "./types";
import {
  Sparkles,
  Layers,
  BookOpen,
  Flame,
  Heart,
  Compass,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookMarked,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "archive" | "trends" | "aesthetic" | "moodboard"
  >("home");
  const [aestheticActiveSubTab, setAestheticActiveSubTab] = useState<
    "guides" | "bookshelf" | "runways"
  >("guides");
  const [homeInteractiveMode, setHomeInteractiveMode] = useState<
    "none" | "translator" | "structures" | "scenarios"
  >("none");

  // Track hash-based navigation for resource details (#/resource/:id)
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Hover state configuration for drop-downs
  const [activeDropdown, setActiveDropdown] = useState<
    "discover" | "archive" | null
  >(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  // State for user moodboard collection (persists in backend)
  // Use null as initial state to distinguish from empty array []
  const [moodboard, setMoodboard] = useState<MoodboardItem[] | null>(null);

  // Fetch moodboard on mount
  useEffect(() => {
    async function fetchMoodboard() {
      try {
        const response = await fetch("/api/moodboard");
        if (response.ok) {
          const data = await response.json();
          // Ensure we always have an array
          setMoodboard(Array.isArray(data) ? data : []);
        } else {
          setMoodboard([]); // Fallback to empty if server fails
        }
      } catch (e) {
        console.error("Backend moodboard fetch error:", e);
        setMoodboard([]);
      }
    }
    fetchMoodboard();
  }, []);

  // Save moodboard to backend whenever it changes
  useEffect(() => {
    // CRITICAL: Only save if moodboard is no longer null (meaning it has been loaded)
    if (moodboard === null) return;

    const saveMoodboard = async () => {
      try {
        await fetch("/api/moodboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moodboard),
        });
      } catch (e) {
        console.error("Backend moodboard save error:", e);
      }
    };

    saveMoodboard();
  }, [moodboard]);

  // Track context for the AI Curator
  const [aiContextGarment, setAiContextGarment] = useState<ArchiveItem | null>(
    null,
  );
  const [aiContextTrend, setAiContextTrend] = useState<TrendTopic | null>(null);
  const [isAiCuratorOpen, setIsAiCuratorOpen] = useState(false);

  // Dynamic float alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dropdown hover helpers
  const handleMouseEnter = (menu: "discover" | "archive") => {
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 200); // slight grace period
  };

  // Dropdown click toggle for mobile
  const toggleDropdown = (menu: "discover" | "archive") => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const clearDropdown = () => {
    if (dropdownTimeoutRef.current) {
      window.clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(null);
  };

  // Redirection dispatcher from menu items
  const handleNavigate = (
    tab: "home" | "archive" | "trends" | "aesthetic" | "moodboard",
    subTab?: any,
    interactiveMode?: any,
  ) => {
    // Clear hash first to exit resource detail route if visible
    window.location.hash = "";

    setActiveTab(tab);
    if (subTab) {
      setAestheticActiveSubTab(subTab);
    }
    if (interactiveMode) {
      setHomeInteractiveMode(interactiveMode);
    } else if (tab === "home") {
      setHomeInteractiveMode("none");
    }
    clearDropdown();
  };

  // Home Style & Scenarios cards save handler
  const handleSaveStyleFromHome = (
    title: string,
    summary: string,
    tags: string[],
  ) => {
    const id = "home-style-" + Date.now();
    const newItem: MoodboardItem = {
      id,
      title,
      type: "note",
      savedAt: new Date().toLocaleDateString(),
      tags: tags || ["风格解构"],
      notes: summary,
    };
    setMoodboard((prev) => [...prev, newItem]);
    showToast("✨ 成功记录审美机制卡片于您的灵感板！");
  };

  // Digitized archives save details
  const handleSaveGarment = (garment: ArchiveItem) => {
    if (!moodboard) return;
    if (moodboard.some((item) => item.id === garment.id)) {
      showToast(`《${garment.name}》已在您的暂存看板中。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: garment.id,
      title: garment.name,
      image: garment.image,
      type: "garment",
      savedAt: new Date().toLocaleDateString(),
      tags: [garment.category.split(" / ")[0], "馆藏"],
      notes: `${garment.description}\n\n主导工艺物料: ${garment.materials}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 归档入 🏛️《${garment.name}》 物理特征至灵感板！`);
  };

  // Curated list / Guide save details
  const handleSaveGuide = (title: string, summary: string) => {
    const id = "guide-" + Date.now();
    const newItem: MoodboardItem = {
      id,
      title,
      type: "note",
      savedAt: new Date().toLocaleDateString(),
      tags: ["阅读摘要", "学术理论"],
      notes: `【学术美学大盘点心得】\n${summary}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast("✨ 成功归档阅读摘要心得！");
  };

  // Movie classic save details
  const handleSaveMovie = (movie: FashionMovie) => {
    if (!moodboard) return;
    if (moodboard.some((item) => item.id === movie.id)) {
      showToast(`《${movie.name}》已在您的灵感板中。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: movie.id,
      title: `《${movie.name}》观影灵感笔记`,
      image: movie.image,
      type: "note",
      savedAt: new Date().toLocaleDateString(),
      tags: ["电影经典", `${movie.year}`],
      notes: `影片信息: ${movie.director} 导演作品 • 评分: ${movie.rating}分\n\n核心灵感看点:\n${movie.recommendationReason}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 成功记录电影经典《${movie.name}》的美学看点！`);
  };

  // Book classic save details
  const handleSaveBook = (book: FashionBook) => {
    if (!moodboard) return;
    if (moodboard.some((item) => item.id === book.id)) {
      showToast(`该精选书籍《${book.name}》已在灵感板中。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: book.id,
      title: `《${book.name}》读书札记`,
      image: book.image,
      type: "note",
      savedAt: new Date().toLocaleDateString(),
      tags: ["精选书架", book.category],
      notes: `英文原著: ${book.originalName}\n作者: ${book.author} / 出版年份: ${book.year}\n评分: ${book.rating}\n\n主编推荐阅读线索:\n${book.recommendationReason}\n\n借阅与阅读途径参考: ${book.availabilityNote}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 成功记录推荐著作《${book.name}》的检索卡！`);
  };

  // Runway classic show path save details
  const handleSaveRunway = (runway: RunwayShow) => {
    if (!moodboard) return;
    if (moodboard.some((item) => item.id === runway.id)) {
      showToast(`大秀笔记《${runway.brand}》已在您的灵感板。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: runway.id,
      title: `【秀场学习路径】${runway.brand} - ${runway.season}`,
      image: runway.image,
      type: "garment",
      savedAt: new Date().toLocaleDateString(),
      tags: ["经典秀场", runway.season],
      notes: `历史美学地位：${runway.importance}\n\n主编看点建议：\n${runway.whatToWatch}\n\n放映参考: ${runway.videoRefer}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 重磅收藏经典大秀《${runway.brand}》的分析要点！`);
  };

  // Weekly Trend save details
  const handleSaveTrend = (trend: TrendTopic) => {
    if (!moodboard) return;
    if (moodboard.some((item) => item.id === trend.id)) {
      showToast(`当前趋势话题已在您的灵感盒中。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: trend.id,
      title: trend.name,
      image: trend.bannerImage,
      type: "trend",
      savedAt: new Date().toLocaleDateString(),
      tags: ["周趋势", "W43"],
      notes: trend.comment,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 已收藏趋势：${trend.name}`);
  };

  // Outfit Formula save details
  const handleSaveFormula = (formula: OutfitFormula) => {
    if (!moodboard) return;
    const isCustom = formula.id.includes("custom");
    const uniqueId = isCustom ? `${formula.id}-${Date.now()}` : formula.id;

    if (!isCustom && moodboard.some((item) => item.id === formula.id)) {
      showToast(`该搭配公式已添加过了。`);
      return;
    }

    const newItem: MoodboardItem = {
      id: uniqueId,
      title: formula.name,
      type: "formula",
      savedAt: new Date().toLocaleDateString(),
      tags: ["穿搭公式", "实操"],
      notes: `${formula.description}\n\n建议单品组配：\n${formula.pieces
        .map((p) => `• [${p.role}] : ${p.name}`)
        .join("\n")}\n\n策展穿搭细节技巧：\n${formula.styleTips.join("\n")}`,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast(`✨ 成功将公式【${formula.name}】录入您的档案夹！`);
  };

  const handleAddCustomNote = (title: string, notes: string) => {
    const id = "custom-note-" + Date.now();
    const newItem: MoodboardItem = {
      id,
      title,
      type: "note",
      savedAt: new Date().toLocaleDateString(),
      tags: ["独立见解", "策展心得"],
      notes,
    };

    setMoodboard((prev) => [...prev, newItem]);
    showToast("✍️ 成功添加了一篇新的学术策展笔记！");
  };

  const handleSaveAiInsight = async (title: string, content: string) => {
    try {
      const response = await fetch("/api/moodboard/curate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          contextGarment: aiContextGarment,
          contextTrend: aiContextTrend,
        }),
      });

      if (!response.ok) throw new Error("Insight curation failed");
      const data = await response.json();
      if (!data.item) throw new Error("Insight curation returned no item");

      setMoodboard((prev) => [...prev, data.item]);
      showToast("✨ AI回答已整理为结构化灵感资产！");
    } catch {
      handleAddCustomNote(title, content);
      showToast("✨ 已保存AI回答，结构化整理暂时使用原文兜底。");
    }
  };

  const handleRemoveMoodboardItem = (id: string) => {
    setMoodboard((prev) => prev.filter((item) => item.id !== id));
    showToast("已安全从您的灵感板中移出此张卡片。");
  };

  // AI Consult trigger mappings
  const handleTriggerConsultGarment = (garment: ArchiveItem) => {
    setAiContextGarment(garment);
    setAiContextTrend(null);
    setIsAiCuratorOpen(true);
    showToast(`🤖 已成功将 [${garment.name}] 物理细节绑定至AI星芒大模型！`);
  };

  const handleTriggerConsultTrend = (trend: TrendTopic) => {
    setAiContextTrend(trend);
    setAiContextGarment(null);
    setIsAiCuratorOpen(true);
    showToast(`🤖 已将本周前沿趋势绑定至策展对谈中心！`);
  };

  // Detect route resource matches
  const isResourceDetailVisible = currentHash.startsWith("#/resource/");
  const activeResourceId = isResourceDetailVisible
    ? currentHash.replace("#/resource/", "")
    : "";

  return (
    <div className="min-h-screen bg-[#F6F4E8] text-[#2A2B2A] font-sans flex flex-col justify-between selection:bg-[#2A2B2A] selection:text-[#FAF9F6] transition-colors">
      {/* Floating Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -45, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3.5 bg-[#2A2B2A] border-l-4 border-[#800020] text-[#FAF9F6] text-xs font-sans rounded-r-xl shadow-2xl flex items-center gap-2.5 font-medium min-w-[280px] justify-center"
          >
            <Compass className="w-4 h-4 text-[#8C7255] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled Stacked Centered Header */}
      <header
        className="sticky top-0 z-30 pt-12 pb-16 px-4 sm:px-8 backdrop-blur-md transition-all duration-300"
        style={{
          backgroundColor: "rgba(246, 244, 232, 0.70)",
          borderBottom: "1px solid rgba(42, 43, 42, 0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative">
          {/* FASHION ATLAS Logo & Icon */}
          <button
            onClick={() => handleNavigate("home")}
            className="group flex flex-col items-center text-center cursor-pointer focus:outline-none tracking-normal mb-5"
            title="返回时装主控面板"
            id="header-logo-anchor"
          >
            {/* FA 线稿图标: 精准抽离透明通道，裸露浮现在 #F6F4E8 暖灰背景上 */}
            <div className="mb-6 flex justify-center text-[#2A2B2A] group-hover:scale-[1.03] transition-transform duration-300">
              <svg
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[66px] h-[66px] sm:w-[72px] sm:h-[72px] text-[#2A2B2A] transition-all duration-300"
              >
                {/* Soft outer grid border */}
                <rect
                  x="35"
                  y="35"
                  width="430"
                  height="430"
                  rx="80"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.25"
                />

                {/* Blueprint thin grid lines */}
                <line
                  x1="35"
                  y1="115"
                  x2="465"
                  y2="115"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="35"
                  y1="180"
                  x2="465"
                  y2="180"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="35"
                  y1="250"
                  x2="465"
                  y2="250"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="35"
                  y1="320"
                  x2="465"
                  y2="320"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="35"
                  y1="385"
                  x2="465"
                  y2="385"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />

                <line
                  x1="115"
                  y1="35"
                  x2="115"
                  y2="465"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="180"
                  y1="35"
                  x2="180"
                  y2="465"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="250"
                  y1="35"
                  x2="250"
                  y2="465"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.3"
                />
                <line
                  x1="320"
                  y1="35"
                  x2="320"
                  y2="465"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />
                <line
                  x1="385"
                  y1="35"
                  x2="385"
                  y2="465"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.15"
                />

                {/* Diagonals */}
                <line
                  x1="250"
                  y1="180"
                  x2="115"
                  y2="415"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.2"
                />
                <line
                  x1="250"
                  y1="180"
                  x2="385"
                  y2="415"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.2"
                />
                <line
                  x1="250"
                  y1="180"
                  x2="250"
                  y2="415"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.2"
                />

                {/* Horizontal Shading Lines (Drafting/grid details) */}
                <line
                  x1="115"
                  y1="260"
                  x2="180"
                  y2="260"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="115"
                  y1="270"
                  x2="180"
                  y2="270"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="115"
                  y1="280"
                  x2="180"
                  y2="280"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="115"
                  y1="290"
                  x2="180"
                  y2="290"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="115"
                  y1="300"
                  x2="180"
                  y2="300"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="115"
                  y1="310"
                  x2="180"
                  y2="310"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />

                <line
                  x1="320"
                  y1="260"
                  x2="385"
                  y2="260"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="320"
                  y1="270"
                  x2="385"
                  y2="270"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="320"
                  y1="280"
                  x2="385"
                  y2="280"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="320"
                  y1="290"
                  x2="385"
                  y2="290"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="320"
                  y1="300"
                  x2="385"
                  y2="300"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <line
                  x1="320"
                  y1="310"
                  x2="385"
                  y2="310"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.25"
                />

                <line
                  x1="180"
                  y1="350"
                  x2="320"
                  y2="350"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="360"
                  x2="320"
                  y2="360"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="370"
                  x2="320"
                  y2="370"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="380"
                  x2="320"
                  y2="380"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="390"
                  x2="320"
                  y2="390"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="400"
                  x2="320"
                  y2="400"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <line
                  x1="180"
                  y1="410"
                  x2="320"
                  y2="410"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />

                {/* F & G Outer bold monogram frame */}
                <path
                  d="M 115,415 L 115,145 C 115,115 140,90 170,90 L 375,90 C 395,90 410,105 410,125 L 410,165"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  fill="none"
                />
                <path
                  d="M 115,220 L 210,220"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinecap="square"
                  fill="none"
                />
                {/* Central triangle "A" */}
                <path
                  d="M 250,180 L 105,420"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinecap="square"
                  fill="none"
                />
                <path
                  d="M 250,180 L 395,420"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinecap="square"
                  fill="none"
                />
                <path
                  d="M 180,315 L 320,315"
                  stroke="currentColor"
                  strokeWidth="32"
                  strokeLinecap="square"
                  fill="none"
                />
              </svg>
            </div>

            <h1 className="font-sans font-black text-2.5xl sm:text-4xl tracking-[0.25em] text-[#121212] flex items-center leading-none justify-center">
              FASHION{" "}
              <span className="font-serif italic font-light ml-2.5 text-[#800020] group-hover:opacity-85 transition-opacity">
                ATLAS
              </span>
            </h1>
            <p className="text-[9.5px] text-[#2A2B2A]/45 font-mono tracking-[0.35em] uppercase mt-2 leading-none transition-all duration-300">
              时装先锋数字档案与智能映射系统
            </p>
          </button>

          {/* Layer 2: The Curator's Menu */}
          <div className="w-full flex justify-center">
            <nav className="flex items-center gap-8 md:gap-14 text-xs font-sans font-light uppercase select-none tracking-[0.25em] text-neutral-800">
              {/* Menu 1: DISCOVER (灵感) */}
              <div
                className="relative py-1 flex items-center"
                onMouseEnter={() => handleMouseEnter("discover")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleNavigate("aesthetic", "guides")}
                  className={`hover:text-[#800020] transition-colors focus:outline-none flex items-center gap-1 font-bold text-[11px] cursor-pointer ${
                    activeTab === "trends" ||
                    (activeTab === "aesthetic" &&
                      aestheticActiveSubTab !== "runways")
                      ? "text-[#800020]"
                      : ""
                  }`}
                  id="nav-discover"
                >
                  <span>灵感</span>
                  <span className="font-sans font-semibold tracking-normal text-[8px] opacity-75 text-neutral-500">
                    Discover
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("discover");
                  }}
                  className="p-1 -mr-1 ml-0.5 focus:outline-none cursor-pointer text-[#121212]/45 hover:text-[#800020] transition-colors"
                  aria-label="Toggle Discover Menu"
                >
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === "discover" ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Discover Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "discover" && (
                    <>
                      {/* Invisible overlay to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={clearDropdown}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-64 bg-[#E5E0D8] border border-[#121212]/15 rounded-lg shadow-xl py-3 z-50 text-left cursor-default tracking-normal uppercase"
                      >
                        <div className="px-5 pb-2 mb-1.5 border-b border-[#121212]/10 text-[8.5px] font-mono font-bold text-[#800020] select-none tracking-widest text-[#800020]">
                          先锋美学灵感发现
                        </div>
                        <button
                          onClick={() =>
                            handleNavigate("aesthetic", "bookshelf")
                          }
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            推荐清单
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            史诗著作与先锋影像精选集
                          </div>
                        </button>
                        <button
                          onClick={() => handleNavigate("trends")}
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            趋势期刊
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            周度数字先锋大片与穿搭解构
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("home", null, "structures")
                          }
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            风格研究页
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            20类面料解剖与日常转译指引
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Menu 2: ARCHIVE (档案) */}
              <div
                className="relative py-1 flex items-center"
                onMouseEnter={() => handleMouseEnter("archive")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => handleNavigate("archive")}
                  className={`hover:text-[#800020] transition-colors focus:outline-none flex items-center gap-1 font-bold text-[11px] cursor-pointer ${
                    activeTab === "archive" ||
                    (activeTab === "aesthetic" &&
                      (aestheticActiveSubTab === "runways" ||
                        aestheticActiveSubTab === "bookshelf"))
                      ? "text-[#800020]"
                      : ""
                  }`}
                  id="nav-archive"
                >
                  <span>档案</span>
                  <span className="font-sans font-semibold tracking-normal text-[8px] opacity-75 text-neutral-500">
                    Archive
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown("archive");
                  }}
                  className="p-1 -mr-1 ml-0.5 focus:outline-none cursor-pointer text-[#121212]/45 hover:text-[#800020] transition-colors"
                  aria-label="Toggle Archive Menu"
                >
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === "archive" ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Archive Dropdown */}
                <AnimatePresence>
                  {activeDropdown === "archive" && (
                    <>
                      {/* Invisible overlay to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={clearDropdown}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-64 bg-[#E5E0D8] border border-[#121212]/15 rounded-lg shadow-xl py-3 z-50 text-left cursor-default tracking-normal uppercase"
                      >
                        <div className="px-5 pb-2 mb-1.5 border-b border-[#121212]/10 text-[8.5px] font-mono font-bold text-[#800020] select-none tracking-widest">
                          理性数字学术历史
                        </div>
                        <button
                          onClick={() => handleNavigate("archive")}
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight font-sans">
                            资源库 (The Vault)
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light font-sans text-[9px]">
                            物理馆藏珍宝强力多维检索
                          </div>
                        </button>
                        <button
                          onClick={() => handleNavigate("aesthetic", "runways")}
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            秀场学习路径
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            30场经典至高秀场演变解码
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            handleNavigate("aesthetic", "bookshelf")
                          }
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            时尚书架
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            50本殿堂级必读著作指南
                          </div>
                        </button>
                        <button
                          onClick={() => handleNavigate("aesthetic", "guides")}
                          className="w-full px-5 py-2.5 hover:bg-white/60 text-left text-xs font-sans text-neutral-850 hover:text-[#800020] transition-colors block cursor-pointer transition-all duration-150"
                        >
                          <div className="font-semibold text-[11px] leading-tight">
                            学习路径页
                          </div>
                          <div className="text-[9px] text-[#2A2B2A]/60 mt-1 leading-normal capitalize font-light">
                            系统化学术知识构建框架
                          </div>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Menu 3: SPACE (我的) —— 点击直接降落个人看板页 */}
              <button
                type="button"
                onClick={() => {
                  clearDropdown();
                  handleNavigate("moodboard");
                }}
                className={`hover:text-[#800020] transition-colors focus:outline-none flex items-center gap-1 font-bold text-[11px] cursor-pointer ${
                  activeTab === "moodboard" ? "text-[#800020]" : ""
                }`}
                id="nav-space"
              >
                <span>我的</span>
                <span className="font-sans font-semibold tracking-normal text-[8px] opacity-75 text-neutral-500">
                  Space
                </span>
                {moodboard && moodboard.length > 0 && (
                  <span className="text-[10px] font-mono font-medium text-neutral-400 tracking-normal ml-1">
                    [ {moodboard.length} ]
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Render Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Check whether we are currently displaying the custom Secret detail page */}
          {isResourceDetailVisible ? (
            <motion.div
              key={`resource-${activeResourceId}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22 }}
            >
              <ResourceDetailView
                resourceId={activeResourceId}
                onBack={() => {
                  window.location.hash = "";
                  setActiveTab("archive");
                }}
                onConsultAI={(item) => handleTriggerConsultGarment(item)}
                onSaveToMoodboard={(item) => handleSaveGarment(item)}
                savedItemIds={moodboard ? moodboard.map((item) => item.id) : []}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === "home" && (
                <HomeSection
                  onSaveStyleToMoodboard={handleSaveStyleFromHome}
                  savedItemIds={
                    moodboard ? moodboard.map((item) => item.id) : []
                  }
                  interactiveMode={homeInteractiveMode}
                  onInteractiveModeChange={setHomeInteractiveMode}
                />
              )}

              {activeTab === "archive" && (
                <ArchiveSection
                  onSaveToMoodboard={handleSaveGarment}
                  onConsultAI={handleTriggerConsultGarment}
                  savedItemIds={
                    moodboard ? moodboard.map((item) => item.id) : []
                  }
                />
              )}

              {activeTab === "aesthetic" && (
                <AestheticSection
                  onSaveGuideToMoodboard={handleSaveGuide}
                  onSaveMovieToMoodboard={handleSaveMovie}
                  onSaveBookToMoodboard={handleSaveBook}
                  onSaveRunwayToMoodboard={handleSaveRunway}
                  savedItemIds={
                    moodboard ? moodboard.map((item) => item.id) : []
                  }
                  activeSubTab={aestheticActiveSubTab}
                  onActiveSubTabChange={setAestheticActiveSubTab}
                />
              )}

              {activeTab === "trends" && (
                <TrendsSection
                  onSaveFormulaToMoodboard={handleSaveFormula}
                  onSaveTrendToMoodboard={handleSaveTrend}
                  onConsultAI={handleTriggerConsultTrend}
                  savedItemIds={
                    moodboard ? moodboard.map((item) => item.id) : []
                  }
                />
              )}

              {activeTab === "moodboard" && (
                <MoodboardSection
                  items={moodboard || []}
                  onRemoveItem={handleRemoveMoodboardItem}
                  onAddNote={handleAddCustomNote}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Exquisite Footer */}
      <footer className="bg-[#F6F4E8] border-t border-[#121212]/10 py-8 px-4 md:px-8 mt-20 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-left">
            <span className="font-mono text-[#2A2B2A]/40 tracking-widest uppercase block mb-1">
              DESIGN FOR SHARP INTELLECTUAL SILHOUETTE
            </span>
            <p className="text-[10.5px] text-[#2A2B2A]/60 font-sans leading-relaxed">
              FashionAtlas 时尚之镜 • 先锋馆藏级别数字资源档案 &
              结构主义双面裁剪生成映射系统。
            </p>
          </div>
          <p className="text-[10px] text-[#2A2B2A]/40 font-mono">
            &copy; {new Date().getFullYear()} FASHION ATLAS CO. REALTIME
            CURATION. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* Drawer-based Assistant */}
      <CuratorAssistant
        isOpen={isAiCuratorOpen}
        onClose={() => setIsAiCuratorOpen(false)}
        activeGarment={aiContextGarment}
        activeTrend={aiContextTrend}
        onClearActiveContext={() => {
          setAiContextGarment(null);
          setAiContextTrend(null);
          showToast("🤖 已重置关联上下文，对谈回归通用时尚探索。");
        }}
        onSaveSuggestionToMoodboard={handleSaveAiInsight}
      />

      {/* Geometric Floating AI trigger with extreme aesthetic restraint */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3.5 group pointer-events-none">
        {/* Invisible Curation Prompt / Gentle Tooltip */}
        <span className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-[10.5px] font-sans font-extralight tracking-[0.3em] text-[#800020] select-none bg-[#E5E0D8]/40 px-3 py-1.5 rounded-sm backdrop-blur-xs font-medium">
          CURATOR AI
        </span>

        {/* Pure geometric black circle */}
        <button
          onClick={() => setIsAiCuratorOpen(!isAiCuratorOpen)}
          className="w-12 h-12 rounded-full bg-[#121212] text-[#FAF9F6] shadow-xl hover:shadow-[0_0_18px_rgba(128,0,32,0.25)] border border-transparent hover:border-[#800020]/25 active:scale-95 transition-all duration-500 flex items-center justify-center pointer-events-auto focus:outline-none cursor-pointer"
          id="btn-trigger-ai-assistant"
        >
          <span className="text-base font-serif font-bold text-[#FAF9F6] group-hover:text-[#800020] group-hover:rotate-180 transition-all duration-500 block leading-none select-none">
            ✱
          </span>
        </button>
      </div>
    </div>
  );
}
