import { setRequestLocale } from "next-intl/server";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/sections/Hero";
import { Crisis } from "@/components/sections/Crisis";
import { Stats } from "@/components/sections/Stats";
import { Pillars } from "@/components/sections/Pillars";
import { Method } from "@/components/sections/Method";
import { Proof } from "@/components/sections/Proof";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export default async function Page(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <Nav />
      <Hero />
      <Crisis />
      <Stats />
      <Pillars />
      <Method />
      <Proof />
      <CTA />
      <Footer />
    </main>
  );
}
