"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";
import { useCanvasGate } from "@/lib/useCanvasGate";

const ReductionMesh = dynamic(
  () => import("@/components/scenes/ReductionMesh").then((m) => m.ReductionMesh),
  { ssr: false }
);

const THEMES = ["diagnose", "reason", "outcome", "method"] as const;
const ACCENTS = ["#c8ff5f", "#768FFF", "#9ce8e0", "#ff8466"];

type Item = {
  name: string;
  metric: string;
  body: string;
  keywords: string[];
};

/**
 * Horizontal-scroll chapters. Each vertical is a full-viewport panel with its
 * own accent + bg tint. GSAP ScrollTrigger pins the section and converts
 * vertical scroll into horizontal pan across the 4 panels.
 *
 * Track direction forced LTR so the panel order (01→04) is stable in both
 * Persian and English; the text inside each panel still respects locale dir.
 */
export function Verticals() {
  const t = useTranslations("verticals");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const items = t.raw("items") as Item[];
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const canvasOk = useCanvasGate();
  const mountMesh = nearViewport && canvasOk;

  // Wait until the section is within one viewport of the user before paying
  // for a second WebGL context. Capability gating happens in useCanvasGate.
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearViewport(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!wrapRef.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      // explicit initial: track aligned to start (panel 01 visible)
      gsap.set(trackRef.current!, { x: 0 });

      const distance = () =>
        (trackRef.current?.scrollWidth ?? 0) - window.innerWidth;

      gsap.to(trackRef.current!, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current!,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (st) => {
            document.documentElement.style.setProperty(
              "--reduction-progress",
              st.progress.toFixed(4)
            );
          },
        },
      });

      // recompute after fonts / R3F mount affect layout
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section data-theme="diagnose" id="diagnose">
      <div ref={wrapRef} className="relative">
        {/* fixed 3D mesh behind the track — driven by --reduction-progress */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="sticky top-0 h-screen w-full">
            {mountMesh && <ReductionMesh />}
            {/* radial vignette so panel content stays readable over bright lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, color-mix(in srgb, var(--bg) 55%, transparent) 65%, color-mix(in srgb, var(--bg) 85%, transparent) 100%)",
              }}
            />
          </div>
        </div>

        {/* track */}
        <div className="relative z-[1] h-screen w-screen overflow-hidden" style={{ direction: "ltr" }}>
          <div
            ref={trackRef}
            className="flex h-full"
            style={{ direction: "ltr", width: `${items.length * 100}vw` }}
          >
            {items.map((it, i) => (
              <div
                key={i}
                dir={dir}
                className="w-screen h-screen relative shrink-0 px-6 md:px-16 py-12 md:py-20 flex items-center"
                style={{
                  background: `linear-gradient(110deg, transparent 0%, color-mix(in srgb, ${ACCENTS[i]} 5%, transparent) 100%)`,
                }}
              >
                {/* huge watermark number */}
                <div
                  className="absolute pointer-events-none select-none nums-en font-medium leading-none tracking-tighter"
                  style={{
                    color: ACCENTS[i],
                    opacity: 0.07,
                    fontSize: "clamp(20rem, 50vw, 60rem)",
                    insetInlineEnd: "-4vw",
                    bottom: "-8vh",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="relative max-w-7xl mx-auto w-full grid md:grid-cols-[1.4fr_1fr] gap-12 items-center">
                  <div>
                    {/* chapter index */}
                    <div
                      className="text-xs font-mono uppercase tracking-[0.2em] mb-8 nums-en flex items-center gap-3"
                      style={{ color: ACCENTS[i] }}
                    >
                      <span>{String(i + 1).padStart(2, "0")} / 04</span>
                      <span
                        className="h-px flex-1 max-w-24"
                        style={{
                          background: `color-mix(in srgb, ${ACCENTS[i]} 40%, transparent)`,
                        }}
                      />
                      <span style={{ color: "var(--fg-muted)" }}>{t("kicker")}</span>
                    </div>

                    {/* name */}
                    <h3 className="text-[clamp(3rem,8vw,7rem)] leading-[0.92] font-medium tracking-tight mb-10">
                      <MaskedText eager text={it.name} />
                    </h3>

                    {/* body */}
                    <p
                      className="text-base md:text-lg leading-relaxed max-w-xl mb-10"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {it.body}
                    </p>

                    {/* keyword chips */}
                    <ul className="flex flex-wrap gap-2 max-w-2xl">
                      {it.keywords.map((k, ki) => (
                        <li
                          key={ki}
                          className="px-3 py-1.5 rounded-full text-xs"
                          style={{
                            background: `color-mix(in srgb, ${ACCENTS[i]} 10%, transparent)`,
                            color: "var(--fg)",
                            border: `1px solid color-mix(in srgb, ${ACCENTS[i]} 28%, transparent)`,
                          }}
                        >
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* right column: just the metric, styled large */}
                  <div className="hidden md:flex flex-col items-end justify-center text-end">
                    <div className="text-xs font-mono uppercase tracking-[0.18em] mb-4" style={{ color: "var(--fg-muted)" }}>
                      metric
                    </div>
                    <div
                      className="text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.95] tracking-tighter nums-en"
                      style={{ color: ACCENTS[i] }}
                    >
                      <MaskedText eager text={it.metric} stagger={0.05} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* fixed section intro + progress (in viewport overlay, doesn't move with track) */}
        <div className="absolute top-0 inset-x-0 z-10 pointer-events-none px-6 md:px-16 py-8">
          <div className="max-w-7xl mx-auto flex items-baseline justify-between">
            <p className="kicker">{t("kicker")}</p>
            <p
              className="text-xs font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--fg-muted)" }}
            >
              <MaskedText text={t("title")} eager />
            </p>
          </div>
        </div>

        {/* bottom progress segments */}
        <div className="absolute bottom-6 inset-x-0 z-10 px-6 md:px-16 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {items.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-px transition-opacity duration-500"
                style={{
                  background: `color-mix(in srgb, ${ACCENTS[i]} 60%, transparent)`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
