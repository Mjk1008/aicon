"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after it's safe to mount a WebGL canvas:
 * - viewport is wide enough (desktop/tablet)
 * - user hasn't asked for reduced motion
 * - the main thread is idle (idle-callback, with timeout fallback)
 *
 * Pass `eager` to skip the idle wait (use for the first/hero canvas where the
 * visual IS the page; pair with a CSS placeholder so LCP still paints fast).
 */
export function useCanvasGate({ eager = false }: { eager?: boolean } = {}) {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const narrow = window.innerWidth < 768;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slowCPU = (navigator.hardwareConcurrency ?? 4) < 4;
    if (narrow || reduced || slowCPU) return;

    let id: number | undefined;
    const fire = () => setOk(true);

    if (eager) {
      fire();
      return;
    }

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (w.requestIdleCallback) {
      id = w.requestIdleCallback(fire, { timeout: 600 });
    } else {
      id = window.setTimeout(fire, 200);
    }

    return () => {
      if (id === undefined) return;
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [eager]);

  return ok;
}
