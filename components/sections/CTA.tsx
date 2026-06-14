"use client";

import { useTranslations } from "next-intl";
import { MaskedText } from "@/components/primitives/MaskedText";

export function CTA() {
  const t = useTranslations("cta");
  return (
    <section
      data-theme="cta"
      id="contact"
      className="relative py-40 px-6 md:px-16"
    >
      <div className="max-w-5xl mx-auto text-center">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] font-medium tracking-tight max-w-4xl mx-auto">
          <MaskedText text={t("title")} />
        </h2>
        <p className="mt-10 max-w-xl mx-auto text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <MaskedText text={t("body")} stagger={0.02} />
        </p>
        <div className="mt-14 flex flex-col items-center gap-6">
          <a
            href={`mailto:${t("email")}`}
            className="inline-block px-10 py-5 rounded-full font-medium text-lg hover:scale-[1.02] transition"
            style={{
              background: "var(--accent)",
              color: "var(--bg)",
              boxShadow: "0 0 80px color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            {t("button")}
          </a>
          <a
            href={`mailto:${t("email")}`}
            className="text-sm font-mono nums-en hover:opacity-80 transition"
            style={{ color: "var(--fg-muted)" }}
          >
            {t("email")}
          </a>
        </div>
      </div>
    </section>
  );
}
