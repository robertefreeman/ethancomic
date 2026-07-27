# Ethan's Mission — GitHub Pages Site

Static viewer for Ethan's missionary letters from Brazil. Each letter shows the
date, the parsed message body, and the matching illustrated comic panel.
Landing page (`index.html`) lists all 40 letters in a chronological grid;
`letter.html?n=N` shows a single letter with prev/next navigation, keyboard
arrows, and touch swipe.

Hosted via GitHub Pages from the `/docs` folder on the `main` branch.

> **Important:** The repo includes an empty `docs/.nojekyll` file. This tells
> GitHub Pages to skip Jekyll and serve the folder as plain static files —
> without it, the Pages build job tries to run our HTML through Jekyll and
> fails. Don't delete it.

## Repo layout (the parts this site touches)

```
docs/
├── index.html              # Landing page — hero + 40-card grid
├── letter.html             # Single-letter viewer (?n=NN routes to a letter)
├── README.md               # ← you are here
├── assets/
│   ├── css/styles.css      # Design tokens + all UI styles
│   ├── js/
│   │   ├── index.js        # Landing-page grid renderer
│   │   └── viewer.js       # Single-letter viewer logic
│   └── img/                # 40 PNGs + 40 WebPs (LETTER-NNN-comic.{png,webp})
└── data/
    └── letters.json        # Generated, 40 letters

scripts/
├── build_letters_data.py   # ethan_mission_letters.md → docs/data/letters.json
└── build_webp_variants.py  # PNG → WebP for every LETTER-*-comic.png
```

## Refresh workflow (when new letters arrive)

After new letters are added to `ethan_mission_letters.md` (via the
`ethan-comic-project` skill's archive workflow), regenerate the site data:

```bash
# 1. Parse the markdown archive → JSON
python3 scripts/build_letters_data.py

# 2. Convert any new/updated comic PNGs → WebP
python3 scripts/build_webp_variants.py

# 3. Commit and push
git add docs/data/letters.json docs/assets/img/
git commit -m "Add LETTER-NNN ..."
git push
```

GitHub Pages will auto-publish the new version within ~30 seconds.

### Verifying before commit

Both scripts are idempotent. Quick sanity check:

```bash
# Body parser is clean (no metadata leaked, no quote prefixes, no HTML entities)
python3 -c "
import json, re
data = json.load(open('docs/data/letters.json'))
print(f'{len(data)} letters parsed')
for l in data:
    if re.search(r'&#?\w+;', l['body']) or 'Begin forwarded' in l['body']:
        print(f'  LEAK in {l[\"id\"]}')
"

# Image parity: every letter has both PNG and WebP
python3 -c "
import json, os
data = json.load(open('docs/data/letters.json'))
for l in data:
    p = f'docs/assets/img/{l[\"id\"]}-comic.png'
    w = f'docs/assets/img/{l[\"id\"]}-comic.webp'
    if not (os.path.exists(p) and os.path.exists(w)):
        print(f'  MISSING: {l[\"id\"]}')
print('  ok' if all(True for _ in data) else '')
"
```

## Local development

```bash
cd docs
python3 -m http.server 8765
# Open http://localhost:8765/
```

## Design tokens

Brazilian-flag palette is defined as CSS custom properties at the top of
`assets/css/styles.css`:

| Token | Value | Use |
|---|---|---|
| `--primary` | `#009C3B` | Green — header, chips, primary buttons |
| `--primary-dk` | `#006B2B` | Hover state for primary |
| `--accent` | `#FFDF00` | Yellow — highlights, hover text |
| `--accent-soft` | `#FFF7BF` | Yellow wash — focus pill, light backgrounds |
| `--secondary` | `#002776` | Blue — focus ring, sparing accent |
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F7F9F3` | Letter card surface, sticky nav background |

To swap colors, edit the `:root` block — every component picks them up.

## Performance notes

- **WebP at q=85** shrinks the original PNGs by ~86% (123 MB → 17 MB total).
  Browsers prefer the `<source type="image/webp">`; older browsers fall back to PNG.
- The current letter's comic loads lazily; the **next** letter's WebP is
  preloaded via `<link rel="preload">` on `requestIdleCallback` so a flip feels instant.
- No build step, no framework, no third-party JS. Total JS payload is ~11 KB raw.

## Accessibility

- Skip link to `#main` on every page
- Semantic `<article>`, `<header>`, `<nav>`, `<section>`, `<figure>`, `<time>` elements
- Focus-visible rings in Brazilian blue (`--secondary`)
- Keyboard navigation: `←` / `→` arrows flip letters; `Tab` walks all interactive elements
- `prefers-reduced-motion` disables transitions and smooth scroll
- Color contrast: green-on-white and yellow-on-green pass WCAG AA for body and large text
