"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Crisis() {
  const t = useTranslations("crisis");
  const ref = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current || !numRef.current) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: 95,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 70%",
        toggleActions: "play none none reverse",
      },
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = Math.round(obj.val).toString();
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section ref={ref} id="crisis" className="relative py-32 md:py-48 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] leading-[1] font-medium tracking-tight max-w-5xl">
          <span ref={numRef} className="text-[var(--color-danger)] nums-en">0</span>
          <span className="text-[var(--color-danger)] nums-en">%</span>{" "}
          <span className="text-[var(--color-fg)]">{t("title").replace(/[0-9۹۵٪%]/g, "").trim().replace(/^[.]/, "")}</span>
        </h2>
        <p className="mt-10 max-w-2xl text-xl text-[var(--color-fg-muted)] leading-relaxed">
          {t("body")}
        </p>
        <p className="mt-6 text-xs text-[var(--color-fg-subtle)] font-mono">{t("source")}</p>
      </div>
    </section>
  );
}
