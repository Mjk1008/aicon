"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/scenes/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
});

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen w-full overflow-hidden grid-bg">
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg)]" />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h1 className="text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-medium tracking-tight max-w-4xl">
          {t("title")}{" "}
          <span className="italic font-light text-[var(--color-accent)]">{t("titleHighlight")}</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg md:text-xl text-[var(--color-fg-muted)] leading-relaxed">
          {t("subtitle")}
        </p>
        <div className="mt-12 flex items-center gap-4">
          <a
            href="#contact"
            className="px-7 py-3.5 bg-[var(--color-accent)] text-black rounded-full font-medium hover:opacity-90 transition"
          >
            {t("cta")}
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 text-[var(--color-fg-muted)] text-xs uppercase tracking-widest z-10">
        <span>{t("scrollCue")}</span>
        <div className="w-px h-12 bg-gradient-to-b from-[var(--color-fg-muted)] to-transparent" />
      </div>
    </section>
  );
}
