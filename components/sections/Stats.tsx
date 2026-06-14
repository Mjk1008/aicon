"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const StatScene = dynamic(() => import("@/components/scenes/StatScene").then((m) => m.StatScene), {
  ssr: false,
});

const variants = ["wave", "glow", "dissolve", "collapse"] as const;

function StatRow({
  index,
  value,
  label,
  source,
}: {
  index: number;
  value: string;
  label: string;
  source: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const reverse = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center py-24 md:py-32 ${
        reverse ? "md:[direction:rtl]" : ""
      }`}
    >
      <div className="md:[direction:ltr] h-[360px] md:h-[480px] w-full">
        <StatScene variant={variants[index]} />
      </div>
      <div className="md:[direction:ltr]">
        <div data-reveal className="text-[clamp(5rem,14vw,12rem)] leading-none font-medium tracking-tighter nums-en text-[var(--color-fg)]">
          {value}
        </div>
        <p data-reveal className="mt-6 text-xl md:text-2xl text-[var(--color-fg-muted)] leading-relaxed max-w-md">
          {label}
        </p>
        <p data-reveal className="mt-4 text-xs text-[var(--color-fg-subtle)] font-mono">
          {source}
        </p>
      </div>
    </div>
  );
}

export function Stats() {
  const t = useTranslations("stats");
  const items = t.raw("items") as { value: string; label: string; source: string }[];

  return (
    <section id="method" className="py-24 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="kicker mb-6">{t("kicker")}</p>
          <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-medium tracking-tight max-w-3xl">
            {t("title")}
          </h2>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {items.map((item, i) => (
            <StatRow key={i} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
