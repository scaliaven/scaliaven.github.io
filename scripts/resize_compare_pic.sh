#!/usr/bin/env bash
# Resize and center-crop prof_pic_color.png to match prof_pic.jpg dimensions.
# Usage: bash scripts/resize_compare_pic.sh

set -euo pipefail

SRC="assets/img/prof_pic_color.png"
REF="assets/img/prof_pic.jpg"
OUT="assets/img/prof_pic_color.png"

# Read reference dimensions
read W H < <(magick identify -format "%w %h\n" "$REF")

echo "Reference ($REF): ${W}x${H}"
echo "Resizing $SRC → ${W}x${H} (center crop)…"

magick "$SRC" \
  -resize "${W}x${H}^" \
  -gravity Center \
  -extent "${W}x${H}" \
  -quality 85 \
  "$OUT"

echo "Done. Output: $OUT ($(magick identify -format '%wx%h' "$OUT"))"
