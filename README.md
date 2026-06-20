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
  sections/            # Hero / Crisis / Verticals / Reasoning / Outcome / Method / CTA / Footer
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

## Deploy — Liara

Production lives at <https://aicon.liara.run>.

The project ships as a **static export** (`output: "export"` in `next.config.ts`)
deployed to Liara's `static` platform from inside the build output (`out/`).

### One-off local deploy

```bash
liara login                  # one-time, opens browser
./scripts/deploy.sh          # builds, then deploys
SKIP_BUILD=1 ./scripts/deploy.sh   # skip rebuild, ship current out/
```

Override the target app, region, or platform via env:

```bash
APP=aicon LOCATION=iran PLATFORM=static ./scripts/deploy.sh
```

### CI deploy

`.github/workflows/deploy.yml` runs on every push to `main`. To enable:

1. Get an API token: <https://console.liara.ir/profile/api-tokens>
2. Repo → Settings → Secrets and variables → Actions → **New secret**:
   - `LIARA_API_TOKEN`
3. (Optional) Add **variables** to override the app or region:
   - `LIARA_APP`
   - `LIARA_LOCATION`

The workflow runs `next build`, deploys `out/` via the Liara CLI, then
smoke-tests `/`, `/fa/`, and `/en/` for `HTTP 200`.

### Static-export limitations (read before adding features)

`output: "export"` means **no SSR, no middleware, no API routes, no ISR**.
The whole site is prerendered to plain HTML/JS/CSS at build time.

If a future feature needs a server runtime (contact form, auth, dynamic
data), the deploy target should move to a container platform (Arvan PaaS,
Liara, Vercel) and `output: "export"` should be removed.
