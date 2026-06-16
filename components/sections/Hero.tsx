"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCanvasGate } from "@/lib/useCanvasGate";

const PixelOrb = dynamic(() => import("@/components/scenes/PixelOrb").then((m) => m.PixelOrb), {
  ssr: false,
});

export function Hero() {
  const t = useTranslations("hero");
  const mountOrb = useCanvasGate();

  return (
    <section data-theme="arrival" className="relative min-h-screen w-full overflow-hidden grid-bg">
      <div className="absolute inset-0 z-0">
        {mountOrb ? (
          <PixelOrb />
        ) : (
          /* CSS-only placeholder so LCP paints instantly and the section
             doesn't go pitch-black on mobile / reduced-motion users. */
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 55%)",
            }}
          />
        )}
      </div>
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, transparent 60%, var(--bg) 100%)",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center gap-6 px-6 md:px-16 text-center pt-[14vh]">
        <img
          src="/brand.svg"
          alt="AIcon"
          className="w-20 h-20 md:w-24 md:h-24"
        />
        <h1 className="font-mono text-[clamp(2.5rem,6vw,5rem)] leading-none tracking-tight">
          AIcon<span style={{ color: "#c8ff5f" }}>.</span>
        </h1>
        <p className="kicker">{t("kicker")}</p>
      </div>

      <div
        className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 text-xs uppercase tracking-widest z-10"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>{t("scrollCue")}</span>
        <div
          className="w-px h-12"
          style={{ background: "linear-gradient(to bottom, var(--fg-muted), transparent)" }}
        />
      </div>
    </section>
  );
}
