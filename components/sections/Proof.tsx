"use client";

import { useTranslations } from "next-intl";
import { MaskedText } from "@/components/primitives/MaskedText";

export function Proof() {
  const t = useTranslations("proof");
  return (
    <section className="relative py-32 px-6 md:px-16 overflow-hidden" data-theme="outcome">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-5xl mx-auto relative">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2rem,5vw,4rem)] leading-[1.1] font-medium tracking-tight max-w-4xl">
          <MaskedText text={t("title")} />
        </h2>
        <p
          className="mt-10 max-w-2xl text-xl leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          <MaskedText text={t("body")} stagger={0.02} />
        </p>
      </div>
    </section>
  );
}
