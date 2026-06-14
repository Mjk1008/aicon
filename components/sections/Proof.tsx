"use client";

import { useTranslations } from "next-intl";

export function Proof() {
  const t = useTranslations("proof");

  return (
    <section className="py-32 px-6 md:px-16 border-t border-[var(--color-border)] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-accent-soft) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-5xl mx-auto relative">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2rem,5vw,4rem)] leading-[1.1] font-medium tracking-tight max-w-4xl">
          {t("title")}
        </h2>
        <p className="mt-10 max-w-2xl text-xl text-[var(--color-fg-muted)] leading-relaxed">
          {t("body")}
        </p>
      </div>
    </section>
  );
}
