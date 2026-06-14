"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Method() {
  const t = useTranslations("method");
  const steps = t.raw("steps") as { n: string; title: string; body: string }[];
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const rows = ref.current!.querySelectorAll(".method-row");
      rows.forEach((row) => {
        gsap.from(row, {
          x: -60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const line = ref.current!.querySelector(".method-line") as HTMLElement;
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top",
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 60%",
              end: "bottom 80%",
              scrub: true,
            },
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="process" className="py-32 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h2 className="text-[clamp(2.25rem,5.5vw,4.5rem)] leading-[1.05] font-medium tracking-tight mb-20">
          {t("title")}
        </h2>

        <div className="relative pl-8 md:pl-16">
          <div className="method-line absolute top-0 bottom-0 left-0 md:left-4 w-px bg-[var(--color-accent)]" />
          {steps.map((step, i) => (
            <div key={i} className="method-row relative pb-16 last:pb-0">
              <div className="absolute -left-[1.65rem] md:-left-[1.65rem] top-1 w-3 h-3 rounded-full bg-[var(--color-accent)] glow-accent" />
              <div className="flex items-baseline gap-6 mb-3">
                <span className="nums-en text-sm font-mono text-[var(--color-fg-subtle)]">{step.n}</span>
                <h3 className="text-2xl md:text-3xl font-medium">{step.title}</h3>
              </div>
              <p className="text-[var(--color-fg-muted)] leading-relaxed max-w-2xl text-lg">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
