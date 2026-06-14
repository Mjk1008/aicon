# AIcon

AI transformation infrastructure for businesses — bilingual (Persian/English) landing page.

3D scroll experience built on:

- **Next.js 16** App Router + TypeScript
- **React Three Fiber** + **drei** (3D scenes)
- **GSAP ScrollTrigger** + **Lenis** (smooth scroll choreography)
- **Tailwind CSS v4**
- **next-intl** (fa / en, RTL/LTR)
- **Vazirmatn** + **Inter** (variable fonts)

## Dev

```bash
npm install
npm run dev
```

Opens at <http://localhost:3000>. `/fa` for Persian (RTL), `/en` for English.

## Structure

```
app/[locale]/          # i18n routes
components/
  scenes/              # R3F canvases (Hero orb, Stats variants)
  sections/            # Hero / Crisis / Stats / Pillars / Method / Proof / CTA / Footer
  Nav.tsx
  SmoothScroll.tsx     # Lenis + GSAP wiring
i18n/                  # next-intl routing + request config
messages/{fa,en}.json  # all copy
proxy.ts               # next-intl middleware (renamed from middleware.ts in Next 16)
```

## Content

All copy lives in `messages/fa.json` and `messages/en.json`. Stats backed by verified research:

- McKinsey State of AI 2025
- S&P Global VotE AI&ML 2025
- MIT NANDA GenAI Divide
- HBR/Profisee 2025

## Deploy

Vercel-ready. `vercel` or `npm run build`.
