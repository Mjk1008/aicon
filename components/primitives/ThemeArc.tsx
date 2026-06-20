"use client";

import { useEffect } from "react";

/**
 * Observes every <section data-theme="..."> and swaps the html[data-theme]
 * attribute to whichever section's midpoint is closest to viewport center.
 * Combined with CSS transitions on --bg/--fg/--accent (defined in globals.css),
 * this drives the per-chapter palette arc with zero JS tween library.
 */
export function ThemeArc() {
  useEffect(() => {
    let raf = 0;
    let current = "arrival";

    const update = () => {
      // Only real chapter <section> nodes — exclude body which carries
      // a static data-theme="arrival" used as the initial seed.
      const sections = document.querySelectorAll<HTMLElement>(
        "section[data-theme]"
      );
      if (!sections.length) return;
      const center = window.innerHeight * 0.45;
      let best: { theme: string; dist: number } | null = null;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(mid - center);
        if (!best || dist < best.dist) {
          best = { theme: s.dataset.theme || "arrival", dist };
        }
      });
      if (best && (best as { theme: string }).theme !== current) {
        current = (best as { theme: string }).theme;
        // Body carries the static seed and wins over html in the cascade,
        // so update both — body for the actual override, html so any
        // selector keyed on `html[data-theme]` still works.
        document.body.setAttribute("data-theme", current);
        document.documentElement.setAttribute("data-theme", current);
      }
    };

    const loop = () => {
      update();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
