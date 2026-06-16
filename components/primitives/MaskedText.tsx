"use client";

import { useEffect, useRef, useState, ElementType, ReactNode } from "react";
import { tokensWithSpaces } from "@/lib/text";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** Trigger reveal immediately on mount instead of waiting for IntersectionObserver. */
  eager?: boolean;
  /** % of element that must be visible to fire. 0–1, default 0.2. */
  threshold?: number;
  /** Per-word stagger in seconds. Default 0.04. */
  stagger?: number;
  /** Render children inline after the text (e.g. a highlight word). */
  trailing?: ReactNode;
};

/**
 * CSS-only mask reveal. Each word lives inside an overflow:hidden span,
 * its inner span starts at translateY(110%) and slides to 0 with the
 * house easing. Persian-safe (word-level, not char-level).
 */
export function MaskedText({
  text,
  as: As = "span",
  className = "",
  eager = false,
  threshold = 0.2,
  stagger = 0.04,
  trailing,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setRevealed(true);
            obs.disconnect();
          }
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager, threshold]);

  const tokens = tokensWithSpaces(text);
  let i = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = As as any;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      data-revealed={revealed ? "true" : "false"}
    >
      {tokens.map((tok, k) => {
        if (/^\s+$/.test(tok)) {
          return <span key={k}>{tok}</span>;
        }
        const style = { "--i": i } as React.CSSProperties;
        i += 1;
        return (
          <span
            key={k}
            className="reveal-line"
            style={{ ...style, transitionDelay: `calc(${i - 1} * ${stagger * 1000}ms)` }}
          >
            <span className="reveal-inner">{tok}</span>
          </span>
        );
      })}
      {trailing}
    </Tag>
  );
}
