"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrambleText } from "@/components/primitives/ScrambleText";

export function Nav() {
  const t = useTranslations("nav");
  const tLang = useTranslations("lang");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fa" ? "en" : "fa";
  const switchHref = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between nav-blend">
      <Link href={`/${locale}`} className="font-mono text-base tracking-tight">
        <ScrambleText text="AIcon" />
        <span style={{ color: "#c8ff5f" }}>.</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-[0.16em]">
        <a href="#crisis" className="opacity-70 hover:opacity-100 transition">
          <ScrambleText text={t("stats")} eager={false} />
        </a>
        <a href="#diagnose" className="opacity-70 hover:opacity-100 transition">
          <ScrambleText text={t("method")} eager={false} />
        </a>
        <a href="#process" className="opacity-70 hover:opacity-100 transition">
          <ScrambleText text={t("process")} eager={false} />
        </a>
        <a href="#contact" className="opacity-70 hover:opacity-100 transition">
          <ScrambleText text={t("contact")} eager={false} />
        </a>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href={switchHref}
          className="px-3 py-1.5 border rounded-full transition opacity-80 hover:opacity-100"
          style={{ borderColor: "currentColor" }}
        >
          {tLang("switchTo")}
        </Link>
      </div>
    </nav>
  );
}
