"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";

const ReductionMesh = dynamic(
  () => import("@/components/scenes/ReductionMesh").then((m) => m.ReductionMesh),
  { ssr: false }
);

/**
 * Reduction chapter — AIcon's brand thesis as scroll.
 *
 * Pinned 200vh. Drives --reduction-progress (0..1) on documentElement so
 * ReductionMesh can cull lines smoothly. Four phase headlines crossfade
 * across the scroll range; camera and palette are intentionally still.
 */
export function Reduction() {
  const t = useTranslations("reduction");
  const wrapRef = useRef<HTMLDivElement>(null);
  const p1 = useRef<HTMLDivElement>(null);
  const p2 = useRef<HTMLDivElement>(null);
  const p3 = useRef<HTMLDivElement>(null);
  const p4 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapRef.current!,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (st) => {
          const p = st.progress;
          document.documentElement.style.setProperty("--reduction-progress", p.toFixed(4));

          const a = clamp01(1 - smoothstep(0.18, 0.32, p));
          const b = clamp01(smoothstep(0.24, 0.38, p) - smoothstep(0.50, 0.62, p));
          const c = clamp01(smoothstep(0.52, 0.66, p) - smoothstep(0.78, 0.90, p));
          const d = clamp01(smoothstep(0.82, 0.94, p));

          if (p1.current) p1.current.style.opacity = a.toFixed(3);
          if (p2.current) p2.current.style.opacity = b.toFixed(3);
          if (p3.current) p3.current.style.opacity = c.toFixed(3);
          if (p4.current) p4.current.style.opacity = d.toFixed(3);
        },
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section data-theme="arrival" id="reduction" className="relative">
      <div ref={wrapRef} className="h-[300vh] relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <ReductionMesh />
          </div>

          {/* radial mask so headline stays readable over bright lines */}
          <div
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, color-mix(in srgb, var(--bg) 65%, transparent) 70%, var(--bg) 100%)",
            }}
          />

          <div className="absolute top-[8vh] inset-x-0 z-10 px-6 md:px-16 pointer-events-none">
            <div className="max-w-7xl mx-auto">
              <p className="kicker">{t("kicker")}</p>
            </div>
          </div>

          {/* 4 phase headlines stacked, crossfade via opacity */}
          {([p1, p2, p3, p4] as const).map((ref, i) => (
            <div
              key={i}
              ref={ref}
              className="absolute inset-0 z-10 flex items-end justify-center pb-[18vh] px-6 text-center pointer-events-none"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <h2 className="text-[clamp(1.6rem,4vw,3.4rem)] font-medium tracking-tight max-w-3xl leading-[1.18]">
                <MaskedText eager text={t(`phase${i + 1}`)} />
              </h2>
            </div>
          ))}

          {/* phase indicator */}
          <div className="absolute bottom-6 inset-x-0 z-10 px-6 md:px-16 pointer-events-none">
            <div className="max-w-md mx-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--fg-muted)" }}>
              <span>noise</span>
              <span className="h-px flex-1" style={{ background: "color-mix(in srgb, var(--fg) 14%, transparent)" }} />
              <span>signal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}
function smoothstep(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
