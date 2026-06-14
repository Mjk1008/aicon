"use client";

import { useEffect, useRef, useState } from "react";
import { graphemes } from "@/lib/text";

type Props = {
  text: string;
  className?: string;
  /** ms between each char locking to its final value. Default 35. */
  step?: number;
  /** how many random cycles per char before locking. Default 6. */
  cycles?: number;
  /** trigger when in view (default) or eagerly on mount */
  eager?: boolean;
  /** loop forever (for live timecode style) */
  loop?: boolean;
  loopInterval?: number;
};

const POOL_EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&*!?";
const POOL_FA = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی۰۱۲۳۴۵۶۷۸۹";
const detectFa = (s: string) => /[؀-ۿ]/.test(s);

export function ScrambleText({
  text,
  className = "",
  step = 35,
  cycles = 6,
  eager = true,
  loop = false,
  loopInterval = 4000,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(eager ? "" : text);
  const [active, setActive] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setActive(true); obs.disconnect(); }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const run = () => {
      const target = graphemes(text);
      const pool = detectFa(text) ? POOL_FA : POOL_EN;
      const poolArr = Array.from(pool);
      const result = target.map(() => poolArr[Math.floor((target.length * 7) % poolArr.length)]);
      let cursor = 0;

      const tick = (cyclesLeft: number) => {
        if (cancelled) return;
        if (cursor >= target.length) {
          setDisplay(target.join(""));
          if (loop) setTimeout(run, loopInterval);
          return;
        }
        for (let i = cursor; i < target.length; i++) {
          if (/\s/.test(target[i])) {
            result[i] = target[i];
            continue;
          }
          result[i] = poolArr[Math.floor((Math.sin((Date.now() + i * 1337) * 0.001) * 0.5 + 0.5) * poolArr.length) % poolArr.length];
        }
        setDisplay(result.join(""));
        if (cyclesLeft <= 0) {
          result[cursor] = target[cursor];
          setDisplay(result.join(""));
          cursor += 1;
          setTimeout(() => tick(cycles), step);
        } else {
          setTimeout(() => tick(cyclesLeft - 1), step / 2);
        }
      };
      tick(cycles);
    };

    run();
    return () => { cancelled = true; };
  }, [text, active, step, cycles, loop, loopInterval]);

  return <span ref={ref} className={className}>{display || " "}</span>;
}
