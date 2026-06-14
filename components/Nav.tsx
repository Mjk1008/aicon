"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const t = useTranslations("nav");
  const tLang = useTranslations("lang");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fa" ? "en" : "fa";
  const switchHref = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-5 flex items-center justify-between backdrop-blur-md bg-black/30 border-b border-white/5">
      <Link href={`/${locale}`} className="font-mono text-base tracking-tight text-white">
        AIcon<span className="text-[var(--color-accent)]">.</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
        <a href="#crisis" className="hover:text-white transition">{t("stats")}</a>
        <a href="#method" className="hover:text-white transition">{t("method")}</a>
        <a href="#process" className="hover:text-white transition">{t("process")}</a>
        <a href="#contact" className="hover:text-white transition">{t("contact")}</a>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <Link href={switchHref} className="px-3 py-1.5 border border-white/20 rounded-full text-white/80 hover:border-white/60 hover:text-white transition">
          {tLang("switchTo")}
        </Link>
        <a
          href="#contact"
          className="hidden md:inline-block px-4 py-2 bg-[var(--color-accent)] text-black rounded-full font-medium hover:opacity-90 transition"
        >
          {t("cta")}
        </a>
      </div>
    </nav>
  );
}
