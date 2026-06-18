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

        {/* track */}
        <div
          className="relative z-[1] h-screen w-screen overflow-hidden"
          style={{ direction: "ltr" }}
        >
          <div
            ref={trackRef}
            className="flex h-full"
            style={{ direction: "ltr", width: `${items.length * 100}vw` }}
          >
            {items.map((it, pi) => {
              const accent = ACCENTS[pi];
              const panelCount = items.length;
              const single = it.cases.length === 1;
              return (
                <div
                  key={pi}
                  dir={dir}
                  className="w-screen h-screen relative shrink-0 px-6 md:px-16 py-12 md:py-20 flex flex-col"
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

        {/* top overlay */}
        <div className="absolute top-0 inset-x-0 z-10 pointer-events-none px-6 md:px-16 py-8">
          <div className="max-w-7xl mx-auto flex items-baseline justify-between">
            <p className="kicker">{t("kicker")}</p>
            <p
              className="text-xs font-mono uppercase tracking-[0.18em] max-w-md text-end"
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
      className={`group relative block text-start w-full overflow-hidden rounded-2xl cursor-pointer ${
        isDimmed ? "opacity-50 scale-[0.985]" : "opacity-100"
      }`}
      style={{
        background: solid
          ? `color-mix(in srgb, var(--bg) 82%, ${accent})`
          : `color-mix(in srgb, var(--bg) 90%, ${accent} 10%)`,
        border: `1px solid color-mix(in srgb, ${accent} ${
          isFocused ? 60 : hover ? 42 : 24
        }%, transparent)`,
        boxShadow: isFocused
          ? `0 30px 80px -24px color-mix(in srgb, ${accent} 45%, transparent), 0 0 0 1px color-mix(in srgb, ${accent} 25%, transparent) inset`
          : hover
          ? `0 14px 50px -28px color-mix(in srgb, ${accent} 35%, transparent)`
          : "none",
        transition:
          "transform 500ms var(--ease-house), opacity 400ms var(--ease-house), background 350ms var(--ease-house), border-color 350ms var(--ease-house), box-shadow 400ms var(--ease-house)",
      }}
    >
      {/* COMPACT BLOCK — always visible */}
      <div className="p-5 md:p-6">
        <div className="flex items-baseline justify-between gap-3 mb-2.5">
          <h4 className="text-xl md:text-2xl font-medium tracking-tight">
            <span style={{ color: accent }}>{c.name}</span>
            {c.longName && c.longName !== c.name && (
              <span
                className="text-sm font-mono ms-2"
                style={{ color: "var(--fg-muted)" }}
              >
                · {c.longName}
              </span>
            )}
          </h4>
          <span
            aria-hidden
            className="text-xs font-mono opacity-60 group-hover:opacity-100 transition-opacity nums-en flex items-center gap-1.5"
            style={{ color: accent }}
          >
            <span className="hidden md:inline" style={{ color: "var(--fg-muted)" }}>
              {isFocused ? "esc" : labels.tapToFocus}
            </span>
            <span className="text-base leading-none">
              {isFocused ? "−" : "+"}
            </span>
          </span>
        </div>

        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: "var(--fg)" }}
        >
          {c.tagline}
        </p>

        {/* HERO METRIC — the one big number */}
        <div className="mt-4 md:mt-5 flex items-end gap-3">
          <div
            className="text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[0.9] font-medium tracking-tighter nums-en"
            style={{ color: accent }}
          >
            {hero.v}
          </div>
          <div
            className="pb-1.5 text-[11px] uppercase tracking-[0.16em] leading-tight max-w-[14ch]"
            style={{ color: "var(--fg-muted)" }}
          >
            {hero.l}
          </div>
        </div>
      </div>

      {/* EXPANDABLE DETAIL */}
      {isFocused && (
        <div
          className="px-5 md:px-6 pb-5 md:pb-6 pt-4 max-h-[52vh] overflow-y-auto animate-[reveal_400ms_var(--ease-house)]"
          style={{
            borderTop: `1px dashed color-mix(in srgb, ${accent} 28%, transparent)`,
            scrollbarWidth: "thin",
            scrollbarColor: `color-mix(in srgb, ${accent} 40%, transparent) transparent`,
          }}
        >
          <div
            className="space-y-3 text-[13px] md:text-sm leading-[1.6] mt-3"
            style={{ color: "var(--fg)" }}
          >
            <DetailRow label={labels.problem} accent={accent}>
              {c.problem}
            </DetailRow>
            <DetailRow label={labels.approach} accent={accent}>
              {c.approach}
            </DetailRow>
            <DetailRow label={labels.tool} accent={accent}>
              {c.tool}
            </DetailRow>
          </div>

          <div
            className="mt-4 pt-4"
            style={{
              borderTop: `1px solid color-mix(in srgb, ${accent} 18%, transparent)`,
            }}
          >
            <div
              className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2"
              style={{ color: accent }}
            >
              {labels.impact}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {c.impact.map((m, mi) => (
                <div key={mi}>
                  <div
                    className="text-base md:text-lg font-medium tracking-tight nums-en leading-tight"
                    style={{ color: "var(--fg)" }}
                  >
                    {m.v}
                  </div>
                  <div
                    className="text-[10px] uppercase tracking-[0.12em] mt-0.5 leading-tight"
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

function DetailRow({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div style={{ color: "var(--fg)" }}>{children}</div>
    </div>
  );
}
