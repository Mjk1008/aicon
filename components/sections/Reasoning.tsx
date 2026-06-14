"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { MaskedText } from "@/components/primitives/MaskedText";

const NeuralMesh = dynamic(() => import("@/components/scenes/NeuralMesh").then((m) => m.NeuralMesh), {
  ssr: false,
});

/** "The Reasoning Engine" — pinned chapter with particle cloud reorganising. */
export function Reasoning() {
  const t = useTranslations("reasoning");
  return (
    <section data-theme="reason" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <NeuralMesh />
      </div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <p className="kicker mb-6">{t("kicker")}</p>
        <h2 className="text-[clamp(2rem,6vw,5rem)] font-medium tracking-tight max-w-3xl leading-[1.05]">
          <MaskedText text={t("title")} />
        </h2>
        <p className="mt-8 max-w-xl leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          <MaskedText text={t("body")} stagger={0.02} />
        </p>
      </div>
    </section>
  );
}
