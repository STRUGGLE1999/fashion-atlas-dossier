import { useEffect, useState } from "react";
import type { DailyCuration } from "../types";

export type DailyCurationState = "loading" | "live" | "unpublished";

export function useDailyCuration() {
  const [dailyCuration, setDailyCuration] = useState<DailyCuration | null>(null);
  const [state, setState] = useState<DailyCurationState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function fetchDailyCuration() {
      try {
        const response = await fetch("/api/daily-curation");
        if (!response.ok) {
          if (!cancelled) {
            setDailyCuration(null);
            setState("unpublished");
          }
          return;
        }

        const data = await response.json();
        if (cancelled) return;

        if (
          data.curation &&
          Array.isArray(data.curation.items) &&
          data.curation.items.length > 0 &&
          !data.fallback
        ) {
          setDailyCuration(data.curation);
          setState("live");
          return;
        }

        setDailyCuration(null);
        setState("unpublished");
      } catch {
        if (!cancelled) {
          setDailyCuration(null);
          setState("unpublished");
        }
      }
    }

    fetchDailyCuration();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLive = state === "live" && Boolean(dailyCuration?.items?.[0]);

  return { dailyCuration, state, isLive };
}
