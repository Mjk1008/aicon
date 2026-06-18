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

## Deploy — Arvan Object Storage

Production lives at <https://aicon-landing.s3-website.ir-thr-at1.arvanstorage.ir>.

The project ships as a **static export** (`output: "export"` in `next.config.ts`),
so any static host works. The pipeline below targets Arvan's S3-compatible
Object Storage with the right MIME types and cache headers per asset class.

### One-off local deploy

```bash
cp .env.example .env.local
# fill in AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY from
# https://panel.arvancloud.ir/storage/access-management
set -a && source .env.local && set +a
./scripts/deploy.sh
```

`scripts/deploy.sh` runs `next build`, then uploads `out/` to the bucket with:

- `_next/static/*` (js / css / woff2) → `Cache-Control: public, max-age=31536000, immutable`
- `*.html` → `public, max-age=0, must-revalidate`
- images / fonts / icons → `public, max-age=86400`
- json / xml / txt → `public, max-age=300`
- explicit `Content-Type` per extension (fixes mobile chunk-load errors)
- prunes objects that no longer exist in `out/`

Pass `SKIP_BUILD=1` to skip the build step and ship the current `out/`.

### CI deploy

`.github/workflows/deploy.yml` runs on every push to `main`. To enable:

1. Repo → Settings → Secrets and variables → Actions
2. Add **secrets**:
   - `ARVAN_ACCESS_KEY_ID`
   - `ARVAN_SECRET_ACCESS_KEY`
3. (Optional) Add **variables** to override the bucket / endpoint:
   - `ARVAN_BUCKET`
   - `ARVAN_ENDPOINT`

The workflow runs `next build`, deploys via `scripts/deploy.sh`, then
smoke-tests `/`, `/fa/`, and `/en/` for `HTTP 200`.

### Static-export limitations (read before adding features)

`output: "export"` means **no SSR, no middleware, no API routes, no ISR**.
The whole site is prerendered to plain HTML/JS/CSS at build time.

If a future feature needs a server runtime (contact form, auth, dynamic
data), the deploy target should move to a container platform (Arvan PaaS,
Liara, Vercel) and `output: "export"` should be removed.
