"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MaskedText } from "@/components/primitives/MaskedText";

export function Crisis() {
  const t = useTranslations("crisis");
  const ref = useRef<HTMLElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const title = t("title");

  // pull leading number (95) out of the title; use the rest as the rest of the headline
  const m = title.match(/(\d+%|۹۵٪|95%)/);
  const numStr = m ? m[0] : "95%";
  const tail = title.replace(numStr, "").trim().replace(/^[.,،]/, "").trim();

  useEffect(() => {
    if (!ref.current || !numRef.current) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: 95,
      duration: 1.6,
      ease: "power3.out",
      scrollTrigger: { trigger: ref.current, start: "top 70%", toggleActions: "play none none reverse" },
      onUpdate: () => { if (numRef.current) numRef.current.textContent = Math.round(obj.val).toString(); },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return (
    <section
      ref={ref}
      data-theme="symptom"
      id="crisis"
      className="relative py-32 md:py-48 px-6 md:px-16"
    >
      <div className="max-w-6xl mx-auto relative">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2.5rem,7vw,6rem)] leading-[1] font-medium tracking-tight max-w-5xl">
          <span
            className="nums-en inline-block"
            style={{ color: "var(--signal)" }}
          >
            <span ref={numRef}>0</span>%
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
