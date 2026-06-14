"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Lenis + GSAP ticker integration.
 * Publishes --scroll-progress (0..1 over full doc) and --scroll-vel
 * (|wheelDelta| normalized) as CSS vars on documentElement so any
 * shader/element can react without subscribing.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let prevY = 0;
    let smoothedVel = 0;

    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      ScrollTrigger.update();
      const root = document.documentElement;
      const prog = e.limit > 0 ? e.scroll / e.limit : 0;
      const rawVel = Math.abs(e.scroll - prevY);
      smoothedVel += (Math.min(1, rawVel / 80) - smoothedVel) * 0.25;
      prevY = e.scroll;
      root.style.setProperty("--scroll-progress", prog.toFixed(4));
      root.style.setProperty("--scroll-vel", smoothedVel.toFixed(4));
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
      // velocity decay when no scroll input
      smoothedVel *= 0.95;
      document.documentElement.style.setProperty("--scroll-vel", smoothedVel.toFixed(4));
    });
    gsap.ticker.lagSmoothing(0);

    const id = window.setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      window.clearTimeout(id);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
