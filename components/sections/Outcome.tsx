"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";

/** "The Outcome Stage" — 4 big metrics. */
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "color-mix(in srgb, var(--fg) 8%, transparent)" }}>
          {items.map((it, i) => (
            <div
              key={i}
              className="metric-cell p-8 md:p-12"
              style={{ background: "var(--bg)" }}
            >
              <div
                className="text-[clamp(3.5rem,8vw,7rem)] leading-none font-medium tracking-tighter nums-en"
                style={{ color: "var(--accent)" }}
              >
                {it.value}
              </div>
              <p className="mt-6 text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {it.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
