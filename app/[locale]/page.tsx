import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Crisis } from "@/components/sections/Crisis";
import { Verticals } from "@/components/sections/Verticals";
import { Reasoning } from "@/components/sections/Reasoning";
import { Outcome } from "@/components/sections/Outcome";
import { Method } from "@/components/sections/Method";
import { Proof } from "@/components/sections/Proof";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default async function Page(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="relative isolate">
      <Nav />
      <Hero />
      <Crisis />
      <Verticals />
      <Reasoning />
      <Outcome />
      <Method />
      <Proof />
      <CTA />
      <Footer />
    </main>
  );
}
