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
 * Sales, Ops, HR) with 1-2 case cards. Compact cards show a hero metric;
 * click reveals full Problem → Approach → Tool → Impact detail.
 */
export function Verticals() {
  const t = useTranslations("verticals");
  const locale = useLocale();
  const dir = locale === "fa" ? "rtl" : "ltr";
  const items = t.raw("items") as Item[];
  const labels = {
    problem: t("labels.problem"),
    approach: t("labels.approach"),
    tool: t("labels.tool"),
    impact: t("labels.impact"),
    tapToFocus: t("labels.tapToFocus"),
  };

  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const [focused, setFocused] = useState<{ p: number; c: number } | null>(null);
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
    // Skip horizontal-pin scroll on mobile / touch devices — native vertical
    // stack is far more usable there. The JSX below also drops the
    // viewport-width sizing on small screens.
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocused(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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

                  {/* Case cards */}
                  <div className="relative max-w-7xl mx-auto w-full mt-8 md:mt-10 flex-1 flex items-start">
                    <div
                      className={`w-full grid gap-5 md:gap-6 items-start ${
                        single
                          ? "grid-cols-1 max-w-3xl mx-auto"
                          : "grid-cols-1 md:grid-cols-2"
                      }`}
                    >
                      {it.cases.map((c, ci) => {
                        const isFocused =
                          focused?.p === pi && focused?.c === ci;
                        const isDimmed = focused !== null && !isFocused;
                        return (
                          <CaseCard
                            key={ci}
                            c={c}
                            accent={accent}
                            isFocused={isFocused}
                            isDimmed={isDimmed}
                            onToggle={() =>
                              setFocused(isFocused ? null : { p: pi, c: ci })
                            }
                            labels={labels}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* top overlay — desktop-only (panels stack vertically on mobile
            and each panel has its own header, so a sticky overlay would
            overlap content there). */}
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

        {/* bottom progress segments — only meaningful in the horizontal pin */}
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

function CaseCard({
  c,
  accent,
  isFocused,
  isDimmed,
  onToggle,
  labels,
}: {
  c: Case;
  accent: string;
  isFocused: boolean;
  isDimmed: boolean;
  onToggle: () => void;
  labels: { problem: string; approach: string; tool: string; impact: string; tapToFocus: string };
}) {
  const [hover, setHover] = useState(false);
  const solid = isFocused || hover;
  const hero = c.impact[0];
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-expanded={isFocused}
      className={`group relative block text-start w-full overflow-hidden cursor-pointer ${
        isDimmed ? "opacity-40" : "opacity-100"
      }`}
      style={{
        background: solid
          ? `color-mix(in srgb, var(--bg) 78%, ${accent})`
          : `color-mix(in srgb, var(--bg) 92%, ${accent} 8%)`,
        boxShadow: isFocused
          ? `0 40px 90px -28px color-mix(in srgb, ${accent} 45%, transparent)`
          : hover
          ? `0 18px 50px -28px color-mix(in srgb, ${accent} 32%, transparent)`
          : "none",
        transition:
          "transform 500ms var(--ease-house), opacity 400ms var(--ease-house), background 350ms var(--ease-house), box-shadow 400ms var(--ease-house)",
      }}
    >
      {/* Corner registration marks (4× absolute brackets) */}
      <CornerMark pos="tl" accent={accent} active={solid} />
      <CornerMark pos="tr" accent={accent} active={solid} />
      <CornerMark pos="bl" accent={accent} active={solid} />
      <CornerMark pos="br" accent={accent} active={solid} />

      {/* Diagonal accent sheen — subtle */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(125deg, transparent 35%, color-mix(in srgb, ${accent} ${
            solid ? 7 : 3
          }%, transparent) 50%, transparent 65%)`,
          transition: "background 500ms var(--ease-house)",
        }}
      />

      {/* COMPACT BLOCK */}
      <div className="relative p-5 md:p-7">
        {/* Top tag bar — like a stamped serial */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] mb-5 md:mb-6">
          <span style={{ color: accent }} dir="ltr">
            [ {c.name.toUpperCase()} ]
          </span>
          <span
            aria-hidden
            className="inline-block transition-transform duration-500 text-base leading-none"
            style={{
              color: accent,
              transform: isFocused ? "rotate(225deg)" : "rotate(0deg)",
            }}
          >
            ↗
          </span>
        </div>

        {/* Product name (long) */}
        <h4
          className="text-2xl md:text-[1.75rem] leading-[1.05] font-medium tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          {c.longName}
        </h4>

        {/* Tagline */}
        <p
          className="mt-2 text-sm md:text-[15px] leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          {c.tagline}
        </p>

        {/* Hairline divider */}
        <div
          className="my-5 md:my-6 h-px"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${accent} 30%, transparent), transparent)`,
          }}
        />

        {/* HERO METRIC — large + label */}
        <div className="flex items-baseline justify-between gap-3">
          <div
            className="text-[clamp(2.5rem,5vw,3.75rem)] leading-[0.85] font-light tracking-[-0.04em] nums-en"
            style={{ color: accent }}
            dir="ltr"
          >
            {hero.v}
          </div>
          <div
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-end max-w-[12ch] leading-tight pb-1"
            style={{ color: "var(--fg-muted)" }}
          >
            {hero.l}
          </div>
        </div>
      </div>

      {/* EXPANDABLE DETAIL */}
      {isFocused && (
        <div
          className="relative px-5 md:px-7 pb-5 md:pb-7 max-h-[48vh] overflow-y-auto animate-[reveal_400ms_var(--ease-house)]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `color-mix(in srgb, ${accent} 40%, transparent) transparent`,
          }}
        >
          {/* divider above detail */}
          <div
            className="h-px mb-5"
            style={{
              background: `repeating-linear-gradient(to right, color-mix(in srgb, ${accent} 50%, transparent) 0 6px, transparent 6px 12px)`,
            }}
          />

          <DetailBlock label={labels.problem} accent={accent}>
            {c.problem}
          </DetailBlock>
          <DetailBlock label={labels.approach} accent={accent}>
            {c.approach}
          </DetailBlock>

          {/* Tool — framed chip */}
          <div className="mt-5">
            <SpecLabel accent={accent}>{labels.tool}</SpecLabel>
            <div
              className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 text-[13px] md:text-sm"
              dir="ltr"
              style={{
                border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
                color: "var(--fg)",
              }}
            >
              <span
                aria-hidden
                style={{ color: accent }}
                className="font-mono text-[10px]"
              >
                ▸
              </span>
              {c.tool}
            </div>
          </div>

          {/* Impact ledger — gridded with internal borders */}
          <div className="mt-6">
            <SpecLabel accent={accent}>{labels.impact}</SpecLabel>
            <div
              className="mt-3 grid grid-cols-3"
              style={{
                border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
              }}
            >
              {c.impact.map((m, mi) => (
                <div
                  key={mi}
                  className="p-3"
                  style={{
                    borderInlineEnd:
                      mi < c.impact.length - 1
                        ? `1px solid color-mix(in srgb, ${accent} 22%, transparent)`
                        : "none",
                  }}
                >
                  <div
                    className="text-base md:text-lg font-medium tracking-tight nums-en leading-tight"
                    style={{ color: "var(--fg)" }}
                    dir="ltr"
                  >
                    {m.v}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.14em] mt-1.5 leading-tight"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {m.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

function SpecLabel({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="font-mono text-[10px] uppercase tracking-[0.24em] flex items-center gap-2"
      style={{ color: accent }}
    >
      <span
        aria-hidden
        className="inline-block h-px w-3"
        style={{ background: accent }}
      />
      <span>{children}</span>
    </div>
  );
}

function DetailBlock({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <SpecLabel accent={accent}>{label}</SpecLabel>
      <div
        className="mt-2 text-[13px] md:text-sm leading-[1.7]"
        style={{ color: "var(--fg)" }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Corner registration mark — small L-shaped bracket at a card corner.
 * On focus/hover the mark grows; gives the card a stamped / blueprint feel.
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
  const v = pos[0]; // 't' | 'b'
  const h = pos[1]; // 'l' | 'r'  (logical left/right inside card)
  const size = active ? 18 : 11;
  const style: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
    transition:
      "width 400ms var(--ease-house), height 400ms var(--ease-house), border-color 400ms var(--ease-house)",
    borderColor: `color-mix(in srgb, ${accent} ${active ? 90 : 55}%, transparent)`,
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
