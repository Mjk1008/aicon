"use client";

import { useEffect } from "react";

/**
 * Three blurred radial gradients fixed behind the whole page.
 * One drifts toward the cursor (--mx / --my from 0..1), others have parallax.
 * Uses CSS vars set on documentElement.
 */
export function GradientBlobs() {
  useEffect(() => {
    let raf = 0;
    let tx = 0.5, ty = 0.5;
    let cx = 0.5, cy = 0.5;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const root = document.documentElement;
      root.style.setProperty("--mx", (cx * 2 - 1).toFixed(3));
      root.style.setProperty("--my", (cy * 2 - 1).toFixed(3));
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="blobs" aria-hidden>
      <div className="blob blob--1" />
      <div className="blob blob--2" />
      <div className="blob blob--3" />
    </div>
  );
}
