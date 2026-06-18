#!/usr/bin/env bash
# Deploy aicon landing to Arvan Object Storage with correct MIME types
# and cache headers per asset class.
#
# Usage:
#   AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... ./scripts/deploy.sh
#
# Optional env:
#   BUCKET    (default: aicon-landing)
#   ENDPOINT  (default: https://s3.ir-thr-at1.arvanstorage.ir)
#   SKIP_BUILD=1 to skip `npm run build` (use existing out/)

set -euo pipefail

BUCKET="${BUCKET:-aicon-landing}"
ENDPOINT="${ENDPOINT:-https://s3.ir-thr-at1.arvanstorage.ir}"
OUT_DIR="${OUT_DIR:-out}"

: "${AWS_ACCESS_KEY_ID:?missing AWS_ACCESS_KEY_ID}"
: "${AWS_SECRET_ACCESS_KEY:?missing AWS_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

bold() { printf "\033[1m%s\033[0m\n" "$*"; }
note() { printf "  %s\n" "$*"; }

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  bold "▶ Building (next build → ${OUT_DIR}/)"
  npm run build
fi

if [[ ! -d "$OUT_DIR" ]]; then
  echo "✗ ${OUT_DIR}/ not found. Run \`npm run build\` first or unset SKIP_BUILD." >&2
  exit 1
fi

local_count=$(find "$OUT_DIR" -type f | wc -l | tr -d ' ')
bold "▶ Deploying ${local_count} files → s3://${BUCKET} (${ENDPOINT})"

# push <glob> <content-type> <cache-control>
push() {
  local pattern="$1" ctype="$2" cache="$3"
  aws --endpoint-url="$ENDPOINT" s3 cp "$OUT_DIR/" "s3://$BUCKET/" \
    --recursive --exclude "*" --include "$pattern" \
    --acl public-read \
    --content-type "$ctype" \
    --cache-control "$cache" \
    --metadata-directive REPLACE \
    --no-progress | tail -1 || true
  note "✓ $pattern"
}

# Hashed/immutable assets — long cache
push "_next/static/*"          "" "public, max-age=31536000, immutable"  # fallback if no extension match below
push "*.js"                    "application/javascript; charset=utf-8" "public, max-age=31536000, immutable"
push "*.mjs"                   "application/javascript; charset=utf-8" "public, max-age=31536000, immutable"
push "*.css"                   "text/css; charset=utf-8"               "public, max-age=31536000, immutable"
push "*.woff2"                 "font/woff2"                            "public, max-age=31536000, immutable"
push "*.woff"                  "font/woff"                             "public, max-age=31536000, immutable"

# HTML — must revalidate so users get the latest chunk references
push "*.html"                  "text/html; charset=utf-8"              "public, max-age=0, must-revalidate"

# Visual assets — moderate cache
push "*.svg"                   "image/svg+xml"                         "public, max-age=86400"
push "*.ico"                   "image/x-icon"                          "public, max-age=86400"
push "*.png"                   "image/png"                             "public, max-age=86400"
push "*.jpg"                   "image/jpeg"                            "public, max-age=86400"
push "*.jpeg"                  "image/jpeg"                            "public, max-age=86400"
push "*.webp"                  "image/webp"                            "public, max-age=86400"

# Misc text — short cache
push "*.json"                  "application/json; charset=utf-8"       "public, max-age=300"
push "*.xml"                   "application/xml; charset=utf-8"        "public, max-age=300"
push "*.txt"                   "text/plain; charset=utf-8"             "public, max-age=300"

# Special: extensionless files (e.g. _redirects)
if [[ -f "$OUT_DIR/_redirects" ]]; then
  aws --endpoint-url="$ENDPOINT" s3 cp "$OUT_DIR/_redirects" "s3://$BUCKET/_redirects" \
    --acl public-read \
    --content-type "text/plain; charset=utf-8" \
    --cache-control "public, max-age=300" \
    --metadata-directive REPLACE --no-progress >/dev/null
  note "✓ _redirects"
fi

# Delete stale objects (those no longer in $OUT_DIR)
bold "▶ Pruning stale objects"
local_files=$(cd "$OUT_DIR" && find . -type f | sed 's|^\./||' | sort)
remote_files=$(aws --endpoint-url="$ENDPOINT" s3 ls "s3://$BUCKET" --recursive | awk '{ $1=$2=$3=""; sub(/^   /,""); print }' | sort)
stale=$(comm -23 <(echo "$remote_files") <(echo "$local_files") || true)
if [[ -n "$stale" ]]; then
  while IFS= read -r key; do
    [[ -z "$key" ]] && continue
    aws --endpoint-url="$ENDPOINT" s3 rm "s3://$BUCKET/$key" >/dev/null
    note "✗ removed $key"
  done <<< "$stale"
else
  note "nothing to prune"
fi

bold "✅ Deployed."
echo "    https://${BUCKET}.s3-website.ir-thr-at1.arvanstorage.ir"
