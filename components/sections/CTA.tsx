"use client";

import { useTranslations } from "next-intl";

export function CTA() {
  const t = useTranslations("cta");

  return (
    <section id="contact" className="py-40 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-5xl mx-auto text-center">
        <p className="kicker mb-8">{t("kicker")}</p>
        <h2 className="text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] font-medium tracking-tight max-w-4xl mx-auto">
          {t("title")}
        </h2>
        <p className="mt-10 max-w-xl mx-auto text-lg text-[var(--color-fg-muted)] leading-relaxed">
          {t("body")}
        </p>
        <div className="mt-14 flex flex-col items-center gap-6">
          <a
            href={`mailto:${t("email")}`}
            className="inline-block px-10 py-5 bg-[var(--color-accent)] text-black rounded-full font-medium text-lg hover:scale-[1.02] transition"
          >
            {t("button")}
          </a>
          <a
            href={`mailto:${t("email")}`}
            className="text-sm text-[var(--color-fg-muted)] font-mono hover:text-[var(--color-fg)] transition nums-en"
          >
            {t("email")}
          </a>
        </div>
      </div>
    </section>
  );
}
