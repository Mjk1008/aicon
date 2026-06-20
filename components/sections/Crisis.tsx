"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";
import { localizeDigits } from "@/lib/text";

export function Crisis() {
  const t = useTranslations("crisis");
  const locale = useLocale();
  const ref = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const title = t("title");

  // pull leading number (95) out of the title; use the rest as the rest of the headline
  const m = title.match(/(\d+%|۹۵٪|95%)/);
  const numStr = m ? m[0] : "95%";
  const tail = title.replace(numStr, "").trim().replace(/^[.,،]/, "").trim();
  // Show the percent glyph that matches the locale.
  const percent = locale === "fa" ? "٪" : "%";

  useEffect(() => {
    if (!ref.current || !numRef.current) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: 95,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 70%", toggleActions: "play none none reverse" },
      onUpdate: () => {
        if (numRef.current)
          numRef.current.textContent = localizeDigits(Math.round(obj.val), locale);
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [locale]);

  return (
    <section
      ref={ref}
      data-theme="symptom"
      id="crisis"
      className="relative py-24 md:py-48 px-5 sm:px-6 md:px-16"
    >
      <div className="max-w-6xl mx-auto relative">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] leading-[1] font-medium tracking-tight max-w-5xl">
          <span
            className="inline-block"
            style={{ color: "var(--signal)" }}
            dir="ltr"
          >
            <span ref={numRef}>{localizeDigits(0, locale)}</span>{percent}
          </span>{" "}
          <MaskedText as="span" text={tail} stagger={0.04} />
        </h2>
        <p
          className="mt-10 max-w-2xl text-xl leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          <MaskedText text={t("body")} stagger={0.02} />
        </p>
        <p className="mt-6 text-xs font-mono" style={{ color: "var(--fg-subtle, #5a5a68)" }}>
          {t("source")}
        </p>
      </div>
    </section>
  );
}
