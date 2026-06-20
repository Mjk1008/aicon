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

const ACCENTS = ["#c8ff5f", "#768FFF", "#9ce8e0", "#ff8466"];

type Impact = { v: string; l: string };
type Case = {
  name: string;
  longName: string;
  tagline: string;
  problem: string;
  approach: string;
  tool: string;
  impact: Impact[];
};
type Item = {
  name: string;
  tagline: string;
  cases: Case[];
};

/**
 * Horizontal-scroll case studies. Each panel = one vertical (Marketing,
 * Sales, Ops, HR) with 1-2 case cards. Cards are fully self-contained
 * (no click-to-expand) so they always fit inside the panel viewport.
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
    const isMobile =
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
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
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section data-theme="diagnose" id="diagnose">
      <div ref={wrapRef} className="relative">
        {/* 3D mesh — untouched */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="sticky top-0 h-screen w-full">
            {mountMesh && <ReductionMesh />}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, color-mix(in srgb, var(--bg) 60%, transparent) 65%, color-mix(in srgb, var(--bg) 88%, transparent) 100%)",
              }}
            />
          </div>
        </div>

        {/* track — horizontal pin on desktop, vertical stack on mobile */}
        <div
          className="relative z-[1] md:h-screen md:w-screen md:overflow-hidden"
          style={{ direction: "ltr" }}
        >
          <div
            ref={trackRef}
            className="flex flex-col md:flex-row md:h-full"
            style={{
              direction: "ltr",
              ["--panel-count" as string]: items.length,
            }}
          >
            {items.map((it, pi) => {
              const accent = ACCENTS[pi];
              const panelCount = items.length;
              const single = it.cases.length === 1;
              return (
                <div
                  key={pi}
                  dir={dir}
                  className="w-full md:w-screen min-h-screen md:h-screen relative md:shrink-0 overflow-hidden px-5 sm:px-6 md:px-16 pt-24 md:pt-20 pb-16 md:pb-20 flex flex-col"
                  style={{
                    background: `linear-gradient(110deg, transparent 0%, color-mix(in srgb, ${accent} 5%, transparent) 100%)`,
                  }}
                >
                  {/* watermark number */}
                  <div
                    className="absolute pointer-events-none select-none nums-en font-medium leading-none tracking-tighter"
                    style={{
                      color: accent,
                      opacity: 0.05,
                      fontSize: "clamp(16rem, 42vw, 50rem)",
                      insetInlineEnd: "-4vw",
                      bottom: "-8vh",
                    }}
                  >
                    {String(pi + 1).padStart(2, "0")}
                  </div>

                  {/* Panel header */}
                  <div className="relative max-w-7xl mx-auto w-full">
                    <div
                      className="text-xs font-mono uppercase tracking-[0.2em] mb-4 nums-en flex items-center gap-3"
                      style={{ color: accent }}
                    >
                      <span>
                        {String(pi + 1).padStart(2, "0")} / 0{panelCount}
                      </span>
                      <span
                        className="h-px flex-1 max-w-24"
                        style={{
                          background: `color-mix(in srgb, ${accent} 40%, transparent)`,
                        }}
                      />
                      <span style={{ color: "var(--fg-muted)" }}>
                        {t("kicker")}
                      </span>
                    </div>

                    <h3 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[0.95] font-medium tracking-tight">
                      <MaskedText eager text={it.name} />
                    </h3>
                    <p
                      className="mt-3 text-base md:text-lg max-w-2xl"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {it.tagline}
                    </p>
                  </div>

                  {/* Case cards — all info visible, no expand */}
                  <div className="relative max-w-7xl mx-auto w-full mt-6 md:mt-10 flex-1 flex items-start">
                    <div
                      className={`w-full grid gap-4 md:gap-6 items-start ${
                        single
                          ? "grid-cols-1 max-w-3xl mx-auto"
                          : "grid-cols-1 md:grid-cols-2"
                      }`}
                    >
                      {it.cases.map((c, ci) => (
                        <CaseCard key={ci} c={c} accent={accent} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* top overlay — desktop-only */}
        <div className="hidden md:block absolute top-0 inset-x-0 z-10 pointer-events-none px-6 md:px-16 py-8">
          <div className="max-w-7xl mx-auto flex items-baseline justify-between gap-4">
            <p className="kicker shrink-0">{t("kicker")}</p>
            <p
              className="text-xs font-mono uppercase tracking-[0.18em] max-w-md text-end"
              style={{ color: "var(--fg-muted)" }}
            >
              <MaskedText text={t("title")} eager />
            </p>
          </div>
        </div>

        {/* bottom progress segments — desktop only */}
        <div className="hidden md:block absolute bottom-6 inset-x-0 z-10 px-6 md:px-16 pointer-events-none">
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

/**
 * Self-contained case card — name, tagline, hero metric prominent +
 * full 3-metric impact ledger. No click-to-expand state, fits inside
 * the panel viewport on every screen.
 */
function CaseCard({ c, accent }: { c: Case; accent: string }) {
  const [hover, setHover] = useState(false);
  const hero = c.impact[0];
  const rest = c.impact.slice(1);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative w-full overflow-hidden flex flex-col p-5 md:p-6"
      style={{
        background: hover
          ? `color-mix(in srgb, var(--bg) 80%, ${accent})`
          : `color-mix(in srgb, var(--bg) 92%, ${accent} 8%)`,
        boxShadow: hover
          ? `0 22px 60px -28px color-mix(in srgb, ${accent} 40%, transparent)`
          : "none",
        transition:
          "background 350ms var(--ease-house), box-shadow 400ms var(--ease-house)",
      }}
    >
      {/* Corner registration marks */}
      <CornerMark pos="tl" accent={accent} active={hover} />
      <CornerMark pos="tr" accent={accent} active={hover} />
      <CornerMark pos="bl" accent={accent} active={hover} />
      <CornerMark pos="br" accent={accent} active={hover} />

      {/* diagonal sheen */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(125deg, transparent 35%, color-mix(in srgb, ${accent} ${
            hover ? 7 : 3
          }%, transparent) 50%, transparent 65%)`,
          transition: "background 500ms var(--ease-house)",
        }}
      />

      {/* Tag bar */}
      <div className="relative flex items-center justify-between font-mono text-[10px] tracking-[0.22em] mb-3 md:mb-4">
        <span style={{ color: accent }} dir="ltr">
          [ {c.name.toUpperCase()} ]
        </span>
        <span
          aria-hidden
          className="inline-block text-base leading-none"
          style={{ color: accent }}
        >
          ↗
        </span>
      </div>

      {/* Product name */}
      <h4
        className="relative text-xl md:text-2xl leading-[1.1] font-medium tracking-tight"
        style={{ color: "var(--fg)" }}
      >
        {c.longName}
      </h4>

      {/* Tagline */}
      <p
        className="relative mt-1.5 text-[13px] md:text-sm leading-relaxed"
        style={{ color: "var(--fg-muted)" }}
      >
        {c.tagline}
      </p>

      {/* hairline */}
      <div
        className="relative my-4 md:my-5 h-px"
        style={{
          background: `linear-gradient(to right, color-mix(in srgb, ${accent} 30%, transparent), transparent)`,
        }}
      />

      {/* Hero metric + label, then 2 secondary metrics */}
      <div className="relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 items-end">
        <div
          className="text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[0.85] font-light tracking-[-0.04em] nums-en"
          style={{ color: accent }}
          dir="ltr"
        >
          {hero.v}
        </div>
        <div
          className="text-[10px] font-mono uppercase tracking-[0.22em] leading-tight max-w-[14ch] self-end pb-1"
          style={{ color: "var(--fg-muted)" }}
        >
          {hero.l}
        </div>

        {/* secondary metrics on a small grid below the hero */}
        <div
          className="col-span-2 mt-1 grid grid-cols-2 gap-3"
          style={{
            borderTop: `1px solid color-mix(in srgb, ${accent} 18%, transparent)`,
            paddingTop: "0.75rem",
          }}
        >
          {rest.map((m, i) => (
            <div key={i}>
              <div
                className="text-base md:text-lg font-medium tracking-tight nums-en leading-tight"
                style={{ color: "var(--fg)" }}
                dir="ltr"
              >
                {m.v}
              </div>
              <div
                className="text-[10px] uppercase tracking-[0.14em] mt-1 leading-tight"
                style={{ color: "var(--fg-muted)" }}
              >
                {m.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Corner registration mark — small L-shaped bracket at a card corner.
 */
function CornerMark({
  pos,
  accent,
  active,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  accent: string;
  active: boolean;
}) {
  const v = pos[0];
  const h = pos[1];
  const size = active ? 16 : 10;
  const style: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
    transition:
      "width 400ms var(--ease-house), height 400ms var(--ease-house), border-color 400ms var(--ease-house)",
    borderColor: `color-mix(in srgb, ${accent} ${active ? 80 : 45}%, transparent)`,
    borderStyle: "solid",
    borderWidth: 0,
  };
  if (v === "t") style.top = 0;
  else style.bottom = 0;
  if (h === "l") style.insetInlineStart = 0;
  else style.insetInlineEnd = 0;
  if (v === "t") style.borderTopWidth = 1;
  else style.borderBottomWidth = 1;
  if (h === "l") style.borderInlineStartWidth = 1;
  else style.borderInlineEndWidth = 1;
  return <span aria-hidden style={style} />;
}
