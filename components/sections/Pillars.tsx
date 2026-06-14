"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Pillars() {
  const t = useTranslations("pillars");
  const items = t.raw("items") as { title: string; body: string }[];
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const cards = ref.current!.querySelectorAll(".pillar-card");
      gsap.from(cards, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="py-32 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-medium tracking-tight max-w-3xl mb-20">
          {t("title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="pillar-card relative p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] hover:border-[var(--color-border-strong)] transition group"
            >
              <div className="absolute top-6 right-6 nums-en text-xs font-mono text-[var(--color-fg-subtle)] group-hover:text-[var(--color-accent)] transition">
                0{i + 1}
              </div>
              <h3 className="text-2xl md:text-3xl font-medium mb-5 leading-tight">{item.title}</h3>
              <p className="text-[var(--color-fg-muted)] leading-relaxed">{item.body}</p>
              <div className="mt-8 h-px w-12 bg-[var(--color-accent)] group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
