"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { MaskedText } from "@/components/primitives/MaskedText";

const PixelOrb = dynamic(() => import("@/components/scenes/PixelOrb").then((m) => m.PixelOrb), {
  ssr: false,
});

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section data-theme="arrival" className="relative min-h-screen w-full overflow-hidden grid-bg">
      <div className="absolute inset-0 z-0">
        <PixelOrb />
      </div>
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 60%, var(--bg) 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-16 max-w-7xl mx-auto">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h1 className="text-[clamp(3rem,9vw,8rem)] leading-[0.95] font-medium tracking-tight max-w-4xl">
          <MaskedText eager text={t("title") + " "} />
          <MaskedText
            eager
            as="span"
            text={t("titleHighlight")}
            className="italic font-light"
            stagger={0.05}
          />
        </h1>
        <p
          className="mt-8 max-w-xl text-lg md:text-xl leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          <MaskedText eager text={t("subtitle")} stagger={0.02} />
        </p>
        <div className="mt-12 flex items-center gap-4">
          <a
            href="#contact"
            className="px-7 py-3.5 rounded-full font-medium hover:opacity-90 transition"
            style={{ background: "var(--accent)", color: "var(--bg)" }}
          >
            {t("cta")}
          </a>
        </div>
      </div>

      <div
        className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 text-xs uppercase tracking-widest z-10"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>{t("scrollCue")}</span>
        <div
          className="w-px h-12"
          style={{ background: "linear-gradient(to bottom, var(--fg-muted), transparent)" }}
        />
      </div>
    </section>
  );
}
