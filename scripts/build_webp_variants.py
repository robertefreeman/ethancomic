#!/usr/bin/env python3
"""
build_webp_variants.py — Convert LETTER-NNN-comic.png → LETTER-NNN-comic.webp

Generates a WebP copy of each comic PNG at quality 85 (visually lossless for
line-art comics, typically 60-70% size reduction vs PNG).

Outputs land in docs/assets/img/ alongside the source PNGs so the docs/ site
can reference them via /assets/img/LETTER-NNN-comic.webp.

Usage:
    python3 scripts/build_webp_variants.py [--quality 85] [--dry-run]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--quality", type=int, default=85,
                    help="WebP quality 1-100 (default: 85)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show what would be converted, do not write files")
    args = ap.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    img_dir = repo_root / "docs" / "assets" / "img"
    pngs = sorted(img_dir.glob("LETTER-*-comic.png"))
    if not pngs:
        print(f"ERROR: no LETTER-*-comic.png files found in {img_dir}", file=sys.stderr)
        return 1

    print(f"Found {len(pngs)} PNGs. Converting to WebP at quality={args.quality}…")

    total_png = 0
    total_webp = 0
    converted = 0
    skipped = 0

    for png in pngs:
        webp = png.with_suffix(".webp")
        png_size = png.stat().st_size
        total_png += png_size

        if webp.exists() and webp.stat().st_mtime >= png.stat().st_mtime:
            skipped += 1
            total_webp += webp.stat().st_size
            print(f"  [skip] {webp.name} (newer than or same as PNG)")
            continue

        if args.dry_run:
            print(f"  [would convert] {png.name} ({png_size:,} bytes)")
            continue

        with Image.open(png) as im:
            # Comics are RGB(A); WebP handles both. Preserve alpha if present.
            im.save(webp, "WEBP", quality=args.quality, method=6)

        webp_size = webp.stat().st_size
        total_webp += webp_size
        converted += 1
        ratio = (1 - webp_size / png_size) * 100
        print(f"  [done] {png.name} → {webp.name}  "
              f"{png_size:>9,} → {webp_size:>9,}  ({ratio:+.1f}%)")

    print()
    print(f"Summary: {converted} converted, {skipped} skipped, {len(pngs)} total")
    if total_png > 0:
        print(f"Total bytes: {total_png:,} PNG → {total_webp:,} WebP "
              f"({(1 - total_webp/total_png)*100:+.1f}%)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
