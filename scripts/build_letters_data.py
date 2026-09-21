#!/usr/bin/env python3
"""
build_letters_data.py — Parse ethan_mission_letters.md → docs/data/letters.json

Source markdown structure (each block):
    ## LETTER-NNN: <subject>
    **Email ID:** `<id>`
    **Letter Date:** `YYYY-MM-DD`

    <clean plain-text body, possibly with quoted ">" block for LETTER-001>

    <duplicated HTML-encoded body — start marker: "Sent from my iPhone Begin forwarded message:" or "Begin forwarded message:">
    <that duplicate continues until "Images:">

    Images:
     LETTER-NNN_filename1.jpg
     LETTER-NNN_filename2.jpg
     ...

The script extracts ONLY the clean body (everything between metadata and either the
duplicate body marker or the "Images:" section), preserves paragraph breaks, and
emits JSON to docs/data/letters.json.

Usage:
    python3 scripts/build_letters_data.py [--md PATH] [--out PATH]
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HEADER_RE = re.compile(r"^## (LETTER-\d{3}):[ \t]*(.*)$", re.MULTILINE)
EMAIL_ID_RE = re.compile(r"^\*\*Email ID:\*\*[ \t]*`([^`]+)`", re.MULTILINE)
LETTER_DATE_RE = re.compile(r"^\*\*Letter Date:\*\*[ \t]*`([^`]+)`", re.MULTILINE)

# Markers that signal the end of the clean body and the start of the duplicated copy
# or the trailing image list.
DUPLICATE_BODY_MARKERS = (
    "Sent from my iPhone Begin forwarded message:",
    "Begin forwarded message:",
)
IMAGES_MARKER = "Images:"

# Heuristic for detecting the duplicated-body line when none of the explicit
# markers are present: a single very long line (>400 chars) that contains
# HTML entities (which the clean plain-text body never does). Several letters
# (e.g. LETTER-012, LETTER-022) have a duplicated body that begins with the
# greeting itself on a single huge line.
DUPLICATE_BODY_LONG_LINE_THRESHOLD = 400


def split_blocks(md: str) -> list[str]:
    """Split markdown into per-letter blocks."""
    blocks = re.split(r"(?=^## LETTER-\d+:)", md, flags=re.MULTILINE)
    return [b.lstrip("\n") for b in blocks if b.lstrip().startswith("## LETTER-")]


def extract_header(block: str) -> tuple[str, str]:
    """Return (letter_id, subject) from the first line."""
    m = HEADER_RE.match(block)
    if not m:
        raise ValueError(f"Block missing header:\n{block[:200]}")
    return m.group(1), m.group(2).strip()


def extract_metadata(block: str) -> tuple[str | None, str | None]:
    """Return (email_id, letter_date) from the metadata lines."""
    email_id = None
    letter_date = None
    for line in block.splitlines():
        if m := EMAIL_ID_RE.match(line):
            email_id = m.group(1)
        elif m := LETTER_DATE_RE.match(line):
            letter_date = m.group(1)
        # Stop scanning after we've moved past the metadata block
        if email_id and letter_date:
            # Keep scanning a bit more in case there are stray metadata lines,
            # but bail once we hit a blank line followed by content.
            pass
        if line.strip() == "" and email_id and letter_date:
            break
    return email_id, letter_date


def extract_body(block: str) -> str:
    """Extract the clean plain-text body.

    Strategy:
      1. Drop everything up to and including the metadata lines.
      2. LETTER-001-style handling: if the first content block contains
         "Sent from my iPhone" and/or "Begin forwarded message:" preface
         lines followed by a `>`-quoted block, skip past the preface to
         start at the quoted block.
      3. Take everything until the first occurrence of either:
         - "Images:" line (start of trailing attachment list)
         - A duplicated-body marker ("Sent from my iPhone Begin forwarded message:"
           or "Begin forwarded message:") on a NON-quoted line. Letters like
           LETTER-001 have a `>`-quoted block whose content itself mentions
           "Begin forwarded message:" — we must ignore those.
      4. If the body is a `>`-quoted block (LETTER-001 style), strip the `>`
         prefixes to get the readable text.
      5. Trim leading/trailing whitespace and excess blank lines.
    """
    lines = block.splitlines()

    # Skip past header + metadata. Find the index of the first non-metadata,
    # non-blank line — that's where the body starts.
    body_start = 0
    in_meta = True
    for i, line in enumerate(lines):
        if in_meta:
            if HEADER_RE.match(line):
                continue
            if EMAIL_ID_RE.match(line) or LETTER_DATE_RE.match(line):
                continue
            if line.strip() == "":
                continue
            # First real content line
            in_meta = False
            body_start = i
            break

    # Look ahead up to ~40 lines for the DEEPEST `>`-quoted block. LETTER-001
    # has nested forwards (outer `>` and inner `>>`); the inner block contains
    # the actual letter content. Scan for the maximum `>` prefix length seen
    # anywhere in the look-ahead window, then jump to the first line that
    # matches it.
    max_prefix = 0
    for j in range(body_start, min(body_start + 40, len(lines))):
        stripped = lines[j].lstrip()
        prefix_len = 0
        for ch in stripped:
            if ch == ">":
                prefix_len += 1
            else:
                break
        if prefix_len > max_prefix:
            max_prefix = prefix_len
    if max_prefix > 0:
        # Jump body_start to the first line at the deepest prefix level.
        for k in range(body_start, len(lines)):
            stripped = lines[k].lstrip()
            prefix_len = 0
            for ch in stripped:
                if ch == ">":
                    prefix_len += 1
                else:
                    break
            if prefix_len == max_prefix:
                body_start = k
                break

    # Determine if body is a quoted block (starts with '>' or '> ').
    is_quoted = lines[body_start].lstrip().startswith(">")

    # Now scan from body_start forward, looking for the end marker.
    # For quoted blocks, only count markers on unquoted lines (lines not starting
    # with '>'). For plain blocks, any line counts. Three stop conditions:
    #   1. The "Images:" line
    #   2. An explicit duplicate-body marker ("Sent from my iPhone Begin
    #      forwarded message:" or "Begin forwarded message:")
    #   3. A single very long line (>400 chars) containing HTML entities —
    #      these are the duplicated forward bodies that don't include any
    #      marker text but are clearly the second copy.
    body_end = len(lines)
    for i in range(body_start, len(lines)):
        line = lines[i]
        if is_quoted and line.lstrip().startswith(">"):
            continue
        stripped = line.strip()
        if stripped == IMAGES_MARKER:
            body_end = i
            break
        if any(stripped.startswith(m) for m in DUPLICATE_BODY_MARKERS):
            body_end = i
            break
        if (len(line) > DUPLICATE_BODY_LONG_LINE_THRESHOLD
                and re.search(r"&(?:amp|lt|gt|nbsp|quot|apos|#\d+);", line)):
            body_end = i
            break

    body_lines = lines[body_start:body_end]

    # If quoted, strip leading `>` and `>>` etc. prefixes from each line.
    if is_quoted:
        body_lines = [re.sub(r"^>+\s?", "", ln) for ln in body_lines]

    # For quoted blocks (LETTER-001 style), skip past any leading email-header
    # lines (From:/Date:/To:/Subject:) so the body starts at the actual content.
    if is_quoted:
        first_real = 0
        for k, ln in enumerate(body_lines):
            s = ln.strip()
            if not s:
                continue  # blank line, keep scanning
            if s.startswith(("From:", "Date:", "To:", "Subject:", "Cc:", "Bcc:")):
                continue
            # Also skip BOM markers and ZWSPs
            if s in ("﻿", "\u200b", "\ufeff"):
                continue
            first_real = k
            break
        # Also strip any leading blank lines
        body_lines = body_lines[first_real:]
        while body_lines and body_lines[0].strip() == "":
            body_lines.pop(0)

    # Collapse runs of >3 blank lines down to a single blank, trim ends.
    cleaned: list[str] = []
    blank_run = 0
    for ln in body_lines:
        s = ln.strip()
        # Strip embedded attachment/image references — these belong on the
        # Images: list, not in the letter body. Format: <filename.jpg> or
        # LETTER-NNN_filename.ext
        if re.match(r"^<[^>]+\.(jpe?g|png|gif|webp|heic|heif|mov|mp4)>$", s, re.IGNORECASE):
            continue
        if re.match(r"^LETTER-\d{3}_.+\.(jpe?g|png|gif|webp|heic|heif|mov|mp4)$", s, re.IGNORECASE):
            continue
        if not s:
            blank_run += 1
            if blank_run <= 1:
                cleaned.append("")
        else:
            blank_run = 0
            cleaned.append(ln)

    # Strip leading/trailing blank lines
    while cleaned and cleaned[0].strip() == "":
        cleaned.pop(0)
    while cleaned and cleaned[-1].strip() == "":
        cleaned.pop()

    return "\n".join(cleaned).strip()


def html_unescape(text: str) -> str:
    """Light HTML entity unescape — the duplicated body uses &lt;/&gt;/&nbsp;/&amp;."""
    return (
        text.replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", '"')
            .replace("&apos;", "'")
            .replace("&nbsp;", " ")
            .replace("&amp;", "&")
    )


def parse_block(block: str) -> dict:
    letter_id, subject = extract_header(block)
    email_id, letter_date = extract_metadata(block)
    body = html_unescape(extract_body(block))
    return {
        "id": letter_id,
        "subject": subject,
        "date": letter_date,
        "email_id": email_id,
        "body": body,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    default_md = Path("ethan_mission_letters/ethan_mission_letters.md") if Path("ethan_mission_letters/ethan_mission_letters.md").exists() else Path("ethan_mission_letters.md")
    ap.add_argument(
        "--md",
        default=str(default_md),
        help="Path to the source markdown archive",
    )
    ap.add_argument(
        "--out",
        default="docs/data/letters.json",
        help="Path to write the JSON output",
    )
    args = ap.parse_args()

    md_path = Path(args.md)
    if not md_path.exists():
        print(f"ERROR: markdown file not found: {md_path}", file=sys.stderr)
        return 1

    md = md_path.read_text(encoding="utf-8")
    blocks = split_blocks(md)
    letters = [parse_block(b) for b in blocks]

    # Sort by ID (which is zero-padded, so string sort = numeric sort)
    letters.sort(key=lambda x: x["id"])

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(letters, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Sanity report
    print(f"Parsed {len(letters)} letters → {out_path}")
    missing_date = [l["id"] for l in letters if not l["date"]]
    missing_email = [l["id"] for l in letters if not l["email_id"]]
    empty_body = [l["id"] for l in letters if not l["body"]]
    if missing_date:
        print(f"  WARN: missing date: {missing_date}", file=sys.stderr)
    if missing_email:
        print(f"  WARN: missing email_id: {missing_email}", file=sys.stderr)
    if empty_body:
        print(f"  WARN: empty body: {empty_body}", file=sys.stderr)
    return 0 if not (missing_date or missing_email or empty_body) else 2


if __name__ == "__main__":
    sys.exit(main())
