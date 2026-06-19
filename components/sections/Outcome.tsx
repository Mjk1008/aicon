"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";
import { CharSplit } from "@/components/primitives/CharSplit";
import { ChronoRing } from "@/components/primitives/ChronoRing";

export function Outcome() {
  const t = useTranslations("outcome");
  const items = t.raw("items") as { value: string; label: string }[];
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const cells = ref.current!.querySelectorAll(".metric-cell");
      cells.forEach((cell, i) => {
        gsap.from(cell, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: {
            trigger: cell,
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
      data-theme="outcome"
      className="relative py-32 md:py-44 px-6 md:px-16"
    >
      <div className="max-w-7xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-medium tracking-tight max-w-4xl mb-20">
          <MaskedText text={t("title")} />
        </h2>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="metric-cell p-8 md:p-12 relative"
              style={{ background: "var(--bg)" }}
            >
              {/* chrono ring sits top-right, ticks in on enter */}
              <div
                className="absolute top-6 end-6"
                style={{ color: "var(--accent)" }}
              >
                <ChronoRing size={28} strokeWidth={1.5} duration={1500} delay={i * 200 + 300} />
              </div>

              {/* char-split metric value — forced LTR so split spans don't
                  flip on RTL pages */}
              <div
                dir="ltr"
                className="text-[clamp(3.5rem,8vw,7rem)] leading-none font-medium tracking-tighter nums-en text-start"
                style={{ color: "var(--accent)" }}
              >
                <CharSplit text={it.value} stagger={0.05} duration={1.1} />
              </div>

              <p
                className="mt-6 text-sm md:text-base leading-relaxed"
                style={{ color: "var(--fg-muted)" }}
              >
                {it.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
