import type { ReactNode } from "react";
import type { DailyCuration, DailyCurationItem } from "../types";

function formatPublishedAt(publishedAt: string | null) {
  if (!publishedAt) return null;
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function BriefingLink({
  item,
  className,
  children,
}: {
  item: DailyCurationItem;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export function HomeBriefingRest({ curation }: { curation: DailyCuration }) {
  const moreItems = curation.items.slice(1);
  if (moreItems.length === 0) return null;

  return (
    <section id="home-briefing-rest" aria-labelledby="home-briefing-rest-title" className="space-y-5 pt-2">
      <div className="border-b border-[#121212]/10 pb-3">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#800020] font-bold block mb-1">
          Today&apos;s briefing · 其余条目
        </span>
        <h3
          id="home-briefing-rest-title"
          className="font-serif text-lg sm:text-xl text-[#121212] tracking-tight"
        >
          {curation.title}
        </h3>
        <p className="text-xs text-[#121212]/65 mt-1.5 max-w-3xl font-sans leading-relaxed">
          {curation.summary}
        </p>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {moreItems.map((item, index) => {
          const published = formatPublishedAt(item.publishedAt);
          return (
            <li key={item.url} className="flex flex-col border-t border-[#121212]/10 pt-4">
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#121212]/40 mb-2">
                {String(index + 2).padStart(2, "0")}
              </span>
              {item.imageUrl ? (
                <BriefingLink item={item} className="block mb-3 overflow-hidden rounded-lg aspect-[16/9] border border-[#121212]/5">
                  <img
                    src={item.imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </BriefingLink>
              ) : null}
              <p className="text-[9.5px] font-mono uppercase tracking-wider text-[#121212]/50 mb-1.5">
                {item.sourceName}
                {published ? ` · ${published}` : ""}
              </p>
              <BriefingLink
                item={item}
                className="font-sans font-semibold text-sm text-[#121212] leading-snug hover:text-[#800020] transition-colors"
              >
                {item.title}
              </BriefingLink>
              <p className="text-[11.5px] text-[#121212]/70 font-sans leading-relaxed mt-2">
                {item.summary}
              </p>
              <BriefingLink
                item={item}
                className="mt-3 text-[10.5px] font-sans text-[#800020] hover:text-[#5C1D24] border-b border-[#800020]/20 hover:border-[#5C1D24]/40 w-fit"
              >
                阅读原链接 ↗
              </BriefingLink>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function TrendsBriefingStrip({
  curation,
  unpublished,
}: {
  curation: DailyCuration | null;
  unpublished: boolean;
}) {
  if (unpublished) {
    return (
      <section
        id="trends-briefing-strip"
        aria-label="今日简报"
        className="border border-[#2A2B2A]/12 rounded-lg px-5 py-4 bg-[#E5E0D8]/40"
      >
        <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-[#800020] font-bold">
          Live briefing
        </span>
        <p className="text-xs text-[#2A2B2A]/70 font-sans mt-1.5 leading-relaxed">
          今日资讯尚未发布。下方仍是冻结的教学周报样本，不是本周直播趋势。
        </p>
      </section>
    );
  }

  if (!curation) return null;

  return (
    <section
      id="trends-briefing-strip"
      aria-labelledby="trends-briefing-title"
      className="border border-[#2A2B2A]/12 rounded-lg px-5 py-5 bg-[#E5E0D8]/50 space-y-4"
    >
      <div>
        <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-[#800020] font-bold">
          今日简报 · {curation.date}
        </span>
        <h3
          id="trends-briefing-title"
          className="font-serif text-lg text-[#2A2B2A] tracking-tight mt-1"
        >
          {curation.title}
        </h3>
        <p className="text-xs text-[#2A2B2A]/70 font-sans mt-1.5 leading-relaxed max-w-3xl">
          {curation.summary}
        </p>
      </div>

      <ol className="divide-y divide-[#2A2B2A]/10 border-t border-b border-[#2A2B2A]/10">
        {curation.items.map((item, index) => (
          <li key={item.url} className="py-3 flex items-start gap-3">
            <span className="text-[9px] font-mono text-[#2A2B2A]/35 mt-0.5 w-5 shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans font-semibold text-[13px] text-[#2A2B2A] hover:text-[#800020] transition-colors leading-snug"
              >
                {item.title}
              </a>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#2A2B2A]/45 mt-1">
                {item.sourceName}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-[10px] font-mono tracking-widest uppercase text-[#2A2B2A]/40">
        Same briefing as homepage · teaching sample below is unchanged
      </p>
    </section>
  );
}
