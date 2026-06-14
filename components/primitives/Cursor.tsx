"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor: a small filled dot + a lerping outline ring.
 * Reads data-cursor="<label>" from any element to display a contextual label.
 * Hides on touch devices.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // disable on touch
    const isTouch = matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;
    setEnabled(true);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let label = "";
    let scale = 1;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const target = e.target as HTMLElement;
      const labelEl = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const newLabel = labelEl?.dataset.cursor ?? "";
      const newScale = labelEl ? 2.2 : 1;
      if (newLabel !== label && labelRef.current) {
        label = newLabel;
        labelRef.current.textContent = label;
      }
      scale = newScale;
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0) scale(${scale})`;
        ringRef.current.style.opacity = label ? "1" : "0.6";
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 99999,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid var(--accent)",
          pointerEvents: "none",
          zIndex: 99998,
          willChange: "transform, opacity",
          transition: "opacity 0.3s var(--ease-house), border-color 0.3s var(--ease-house)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--accent)",
        }}
      >
        <span ref={labelRef} />
      </div>
    </>
  );
}
