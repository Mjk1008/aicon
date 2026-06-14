"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="py-10 px-6 md:px-16 border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-fg-muted)]">
        <div className="font-mono">
          AIcon<span className="text-[var(--color-accent)]">.</span>
        </div>
        <div>{t("tagline")}</div>
        <div className="nums-en">{t("copyright")}</div>
      </div>
    </footer>
  );
}
