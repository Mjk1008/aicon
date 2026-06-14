"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";
import { ScrambleText } from "@/components/primitives/ScrambleText";

/** The "Diagnosis Lab" — 4 verticals as floating panels, staggered scroll reveal. */
export function Verticals() {
  const t = useTranslations("verticals");
  const items = t.raw("items") as { name: string; metric: string; body: string }[];
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const cards = ref.current!.querySelectorAll(".vertical-card");
      cards.forEach((card, i) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: i * 0.08,
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      data-theme="diagnose"
      id="diagnose"
      className="relative py-32 md:py-40 px-6 md:px-16"
    >
      <div className="max-w-7xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-medium tracking-tight max-w-3xl mb-20">
          <MaskedText text={t("title")} />
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {items.map((it, i) => (
            <div
              key={i}
              className="vertical-card group relative p-8 md:p-10 rounded-3xl overflow-hidden"
              style={{
                background: "color-mix(in srgb, var(--fg) 4%, transparent)",
                border: "1px solid color-mix(in srgb, var(--fg) 8%, transparent)",
              }}
            >
              <div
                className="absolute top-6 right-6 text-xs font-mono tracking-widest"
                style={{ color: "var(--fg-muted)" }}
              >
                <ScrambleText text={`0${i + 1}`} loop loopInterval={6000 + i * 800} />
              </div>
              <div
                className="text-xs font-mono uppercase tracking-[0.2em] mb-6"
                style={{ color: "var(--accent)" }}
              >
                {it.name}
              </div>
              <div className="text-[clamp(2rem,4vw,3.5rem)] font-medium leading-none mb-6 nums-en">
                {it.metric}
              </div>
              <p style={{ color: "var(--fg-muted)" }} className="leading-relaxed">
                {it.body}
              </p>
              <div
                className="mt-8 h-px w-12 transition-all duration-700 group-hover:w-full"
                style={{ background: "var(--accent)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
