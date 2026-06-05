import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, X, User, Heart, MessageSquare, Sliders, Play, CornerDownLeft, BookOpen, Link as LinkIcon, Database } from "lucide-react";
import { ArchiveItem, TrendTopic, Message } from "../types";

// Extended message type to include RAG sources
interface ExtendedMessage extends Message {
  retrievedDocs?: any[];
}

interface CuratorAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeGarment: ArchiveItem | null;
  activeTrend: TrendTopic | null;
  onClearActiveContext: () => void;
  onSaveSuggestionToMoodboard: (title: string, content: string) => void | Promise<void>;
}

export default function CuratorAssistant({
  isOpen,
  onClose,
  activeGarment,
  activeTrend,
  onClearActiveContext,
  onSaveSuggestionToMoodboard,
}: CuratorAssistantProps) {
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "您好，我是 FashionAtlas 数字化策展智能助手。我已经就绪，随时可以协助您探讨先锋品牌美学、解剖裁片版型、梳理时装周演变，或利用现存先锋档案构建一套精妙的穿搭公式。",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts based on situation
  const basePrompts = [
    "简述安特卫普六君子对解构时装的核心贡献",
    "如何用经典高定廓形调和街头主义风貌？",
    "推荐本年度最适合‘硬核褶皱’的配饰单品"
  ];

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(basePrompts);

  useEffect(() => {
    if (activeGarment) {
      setSuggestedPrompts([
        `分析 ${activeGarment.name} 的裁剪力矩学`,
        `针对 ${activeGarment.name} 推荐最搭鞋包配件`,
        "这件服装承载了哪些重要的时尚历史节点？"
      ]);
    } else if (activeTrend) {
      setSuggestedPrompts([
        `如何解构本周趋势主题：${activeTrend.name} ？`,
        `帮我用 ${activeTrend.keyItems[0]} 定制一套穿搭公式`,
        "这一波趋势会由于什么社会变因而演进？"
      ]);
    } else {
      setSuggestedPrompts(basePrompts);
    }
  }, [activeGarment, activeTrend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (!textToSend) setInput("");

    const userMsg: ExtendedMessage = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          contextGarment: activeGarment,
          contextTrend: activeTrend,
        }),
      });

      if (!response.ok) {
        throw new Error("API未响应");
      }

      const data = await response.json();
      
      const assistantMsg: ExtendedMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.text || "数据传输受阻，我的时尚资料库暂时无法建立连接。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrievedDocs: data.retrievedDocs || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ExtendedMessage = {
        id: Math.random().toString(),
        role: "assistant",
        content: `※ 时尚大模型连接发生阻碍 (${err?.message || "网络连接异常"})。暂时开启离线智控解答：在面料上引入不规则的重磅褶裥，搭配雕塑底盘厚鞋，是塑造现代先锋艺术感的黄金法则。已自动将此构思保存至左侧暂存板中，提供您在灵感看板使用。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSaveToMoodboard = async (messageContent: string) => {
    const defaultTitle = activeGarment 
      ? `关于【${activeGarment.name}】的AI灵感笔记` 
      : activeTrend 
      ? `关于【${activeTrend.name}】的AI灵感笔记` 
      : "AI时尚策展灵感札记";
    await onSaveSuggestionToMoodboard(defaultTitle, messageContent);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop on Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />

          {/* Assistant Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 180 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#E5E0D8] border-l border-[#121212]/15 text-[#2A2B2A] flex flex-col z-50 h-full shadow-[0_4px_30px_rgba(0,0,0,0.025)]"
          >
            {/* Header */}
            <div className="p-5 border-b border-[#121212]/10 flex items-center justify-between bg-[#E5E0D8]">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="p-1.5 bg-[#5C1D24]/10 border border-[#5C1D24]/20 rounded text-[#8C7255]">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#5C1D24]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm tracking-wide text-[#121212] flex items-center gap-1.5 italic">
                    时尚先锋数字策展大模型
                    <span className="text-[8px] font-mono bg-[#5C1D24] text-[#FAF9F6] border border-[#5C1D24]/20 px-1.5 py-0.5 rounded uppercase font-bold">RAG v2.0</span>
                  </h3>
                  <p className="text-[8px] text-[#121212]/45 font-mono tracking-widest uppercase">CURATOR ASSISTANT ENGINE</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#121212]/5 rounded text-[#121212]/40 hover:text-[#121212] transition-colors cursor-pointer focus:outline-none"
                id="btn-close-assistant"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5 stroke-[1]" />
              </button>
            </div>

            {/* Context Item Bar */}
            {(activeGarment || activeTrend) && (
              <div className="px-5 py-2.5 bg-[#FAF9F6] border-b border-[#121212]/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#8C7255]">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="font-sans truncate max-w-[280px] text-[11px] text-[#121212]/75">
                    已关联: <strong className="font-serif font-normal text-[#121212] italic">{activeGarment ? activeGarment.name : activeTrend?.name}</strong>
                  </span>
                </div>
                <button
                  onClick={onClearActiveContext}
                  className="text-[9px] text-[#8C7255] font-mono hover:text-[#5c1d24] underline decoration-dotted capitalize cursor-pointer focus:outline-none"
                >
                  清除绑定
                </button>
              </div>
            )}

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(100vh-230px)] scrollbar-thin">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant Icon */}
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded bg-[#FAF9F6] text-[#8C7255] flex items-center justify-center text-xs font-semibold shrink-0 select-none border border-[#121212]/10">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#121212] text-[#FAF9F6] font-light shadow-sm"
                          : "bg-white text-[#121212] border border-[#121212]/10"
                      }`}
                    >
                      <p className="whitespace-pre-line font-sans text-[11.5px] leading-relaxed">{m.content}</p>

                      {/* RAG Sources Display */}
                      {m.role === "assistant" && m.retrievedDocs && m.retrievedDocs.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#121212]/5 space-y-2">
                          <p className="text-[9px] font-mono font-bold text-[#8C7255] uppercase tracking-widest flex items-center gap-1.5">
                            <Database className="w-3 h-3" />
                            知识库引用来源 (CITED SOURCES)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {m.retrievedDocs.map((doc, idx) => (
                              <div
                                key={idx}
                                className="px-2 py-1 bg-[#F6F4E8] border border-[#121212]/5 rounded flex items-center gap-1.5 hover:border-[#8C7255]/30 transition-colors"
                              >
                                <BookOpen className="w-2.5 h-2.5 text-[#8C7255]" />
                                <span className="text-[9px] font-sans text-[#121212]/60 truncate max-w-[120px]">
                                  {doc.content.name || doc.content.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assistant special actions (Save suggested concepts) */}
                      {m.role === "assistant" && m.id !== "welcome" && (
                        <div className="mt-3 pt-2.5 border-t border-[#121212]/5 flex justify-end">
                          <button
                            onClick={() => handleSaveToMoodboard(m.content)}
                            className="text-[9.5px] text-[#8C7255] hover:text-[#5C1D24] flex items-center gap-1.5 focus:outline-none cursor-pointer font-sans"
                            title="保存此思考为灵感笔记"
                          >
                            <Heart className="w-3 h-3 fill-current text-[#5C1D24]" />
                            <span className="font-mono tracking-wider font-semibold">收藏至我的灵感板</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-[#121212]/35 font-mono mt-1 px-1 self-start">
                      {m.timestamp}
                    </span>
                  </div>

                  {/* User Icon */}
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded bg-[#FAF9F6] text-[#5C1D24] flex items-center justify-center text-xs font-semibold shrink-0 select-none border border-[#121212]/10">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded bg-white text-[#8C7255] flex items-center justify-center shrink-0 animate-pulse border border-[#121212]/10">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="bg-white/80 border border-[#121212]/10 p-3 rounded-lg flex items-center gap-2 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-[#8C7255] rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-[#8C7255] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-[#8C7255] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[8.5px] text-[#121212]/45 font-mono uppercase tracking-widest font-semibold">RAG KNOWLEDGE SEARCHING...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Panel */}
            <div className="px-5 py-3 border-t border-[#121212]/10 bg-[#FAF9F6]/50">
              <p className="text-[8.5px] text-[#121212]/45 font-mono mb-2 flex items-center gap-1.5 tracking-widest uppercase font-semibold">
                <MessageSquare className="w-3 h-3 text-[#8C7255]" />
                SUGGESTED DISCUSSIONS • 推荐研讨主题
              </p>
              <div className="flex flex-col gap-1.5">
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p)}
                    className="text-left text-[11px] font-sans text-[#2A2B2A]/85 hover:text-[#121212] hover:bg-white/60 p-2 rounded-lg border border-[#121212]/10 hover:border-[#121212]/20 transition-all leading-snug truncate cursor-pointer bg-white/30 font-light"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-5 border-t border-[#121212]/10 bg-[#FAF9F6] flex items-center gap-2">
              <div className="relative flex-1 bg-white border border-[#121212]/15 rounded-lg px-3 py-2.5 flex items-center focus-within:border-[#8C7255]/50 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={loading ? "时装学理档案归整中..." : "向策展人AI提问..."}
                  disabled={loading}
                  className="bg-transparent flex-1 focus:outline-none text-xs text-[#2A2B2A] placeholder-[#121212]/25 pr-6"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[8px] font-mono text-neutral-400 absolute right-3 pointer-events-none select-none">
                  <Play className="w-2 h-2 rotate-90 opacity-60" />
                  Enter
                </kbd>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-lg bg-[#121212] text-[#FAF9F6] hover:bg-[#5C1D24] hover:text-[#FAF9F6] disabled:bg-[#121212]/10 disabled:text-[#121212]/30 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                id="btn-send-chat"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
