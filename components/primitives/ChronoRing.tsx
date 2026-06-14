"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Diameter in px. Default 48. */
  size?: number;
  /** Stroke width. Default 2. */
  strokeWidth?: number;
  /** ms to complete the sweep. Default 1800. */
  duration?: number;
  /** ms delay before sweep starts. Default 400. */
  delay?: number;
  className?: string;
};

/**
 * SVG stroke-dashoffset ring. Animates 0% → 100% on enter view, with a
 * final blink. Used as a "trust beat" next to metrics.
 */
export function ChronoRing({
  size = 48,
  strokeWidth = 2,
  duration = 1800,
  delay = 400,
  className = "",
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setActive(true); obs.disconnect(); }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: "block" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={c}
        strokeDashoffset={active ? 0 : c}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: `stroke-dashoffset ${duration}ms var(--ease-house) ${delay}ms`,
          animation: active ? `chrono-blink 0.18s linear ${delay + duration}ms 2` : undefined,
        }}
      />
      <style jsx>{`
        @keyframes chrono-blink {
          50% { opacity: 0.3; }
        }
      `}</style>
    </svg>
  );
}
