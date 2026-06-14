"use client";

import { useEffect, useRef, useState } from "react";
import { graphemes } from "@/lib/text";

type Props = {
  text: string;
  className?: string;
  /** Stagger per char in seconds. Default 0.022. */
  stagger?: number;
  /** Total duration of each char's tween. Default 0.9s. */
  duration?: number;
  /** Threshold for IO trigger. */
  threshold?: number;
  /** Reveal immediately. */
  eager?: boolean;
  locale?: string;
};

/**
 * Char-split chaos → ordered reveal. Each char starts at a random
 * (y, rotate, scale) offset with opacity 0, then transitions to identity.
 * Survives Persian via grapheme segmentation.
 */
export function CharSplit({
  text,
  className = "",
  stagger = 0.022,
  duration = 0.9,
  threshold = 0.3,
  eager = false,
  locale,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setRevealed(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager, threshold]);

  const chars = graphemes(text, locale);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {chars.map((ch, i) => {
        const isSpace = /\s/.test(ch);
        // deterministic-ish per index "chaos" offsets
        const seed = (i * 17.31 + 3.7) % 1;
        const offY = (seed - 0.5) * 80;
        const offX = ((seed * 7.13) % 1 - 0.5) * 60;
        const rot = ((seed * 13.9) % 1 - 0.5) * 40;
        const sc = 0.4 + (seed * 11.3) % 1 * 0.4;
        return (
          <span
            key={i}
            aria-hidden
            style={{
              display: "inline-block",
              whiteSpace: isSpace ? "pre" : "normal",
              transform: revealed ? "translate(0,0) rotate(0deg) scale(1)" : `translate(${offX}px, ${offY}px) rotate(${rot}deg) scale(${sc})`,
              opacity: revealed ? 1 : 0,
              transition: `transform ${duration}s var(--ease-house), opacity ${duration}s var(--ease-house)`,
              transitionDelay: `${i * stagger}s`,
              willChange: "transform, opacity",
            }}
          >
            {isSpace ? " " : ch}
          </span>
        );
      })}
    </span>
  );
}
