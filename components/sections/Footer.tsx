"use client";

import { useTranslations } from "next-intl";
import { ScrambleText } from "@/components/primitives/ScrambleText";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer
      className="py-10 px-6 md:px-16"
      style={{ borderTop: "1px solid color-mix(in srgb, var(--fg) 8%, transparent)" }}
    >
      <div
        className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
        style={{ color: "var(--fg-muted)" }}
      >
        <div className="font-mono">
          <ScrambleText text="AIcon" loop loopInterval={8000} />
          <span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div>{t("tagline")}</div>
        <div className="nums-en">{t("copyright")}</div>
      </div>
    </footer>
  );
}
