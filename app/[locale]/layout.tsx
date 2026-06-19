import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GradientBlobs } from "@/components/primitives/GradientBlobs";
import { ThemeArc } from "@/components/primitives/ThemeArc";
import { Cursor } from "@/components/primitives/Cursor";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL("https://aicon.dev"),
    title,
    description,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: "AIcon",
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
      images: [{ url: "/og.svg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.svg"],
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fa: "/fa",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body data-theme="arrival">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Cursor />
          <GradientBlobs />
          <ThemeArc />
          <SmoothScroll>{props.children}</SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
