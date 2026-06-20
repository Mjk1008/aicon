#!/usr/bin/env bash
# Deploy aicon landing to Liara as a static app.
#
# Prereqs (one-time):
#   1. `liara login` (browser flow with the new account)
#   2. Create a Static app named $APP on https://console.liara.ir/
#
# Usage:
#   ./scripts/deploy.sh           # builds, then deploys
#   SKIP_BUILD=1 ./scripts/deploy.sh  # uses existing out/
#
# Env overrides:
#   APP       (default: aicon-landing)
#   PLATFORM  (default: static)
#   LOCATION  (default: iran)

set -euo pipefail

APP="${APP:-aicon}"
PLATFORM="${PLATFORM:-static}"
LOCATION="${LOCATION:-iran}"
OUT_DIR="${OUT_DIR:-out}"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }

if ! command -v liara >/dev/null 2>&1; then
  echo "✗ liara CLI not installed. Install with: npm i -g @liara/cli" >&2
  exit 1
fi

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  bold "▶ Building (next export → ${OUT_DIR}/)"
  npm run build
fi

if [[ ! -f "${OUT_DIR}/index.html" ]]; then
  echo "✗ ${OUT_DIR}/index.html missing — build did not produce a static export." >&2
  exit 1
fi

bold "▶ Deploying ${OUT_DIR}/ → liara app: ${APP} (${LOCATION})"

# Liara's `static.path` config wasn't reliably honored, so we deploy
# from inside out/ — every file at the bucket root, exactly the way
# the static platform expects (`/index.html` served as `/`).
(
  cd "$OUT_DIR"
  liara deploy --app "$APP" --platform "$PLATFORM" -b "$LOCATION" --no-app-logs --detach
)

bold "✅ Deploy submitted."
echo "    https://${APP}.liara.run"
