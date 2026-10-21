# Ethan's Missionary Letters & Comic Archive

A clean archive and static web viewer for Elder Ethan Nelson's missionary letters from Rio Grande do Sul, Brazil, paired with custom 1990s comic-strip style illustrated panels.

Hosted live on GitHub Pages from `/docs` on `main`.

---

## Repository Structure

```text
ethan-comic/
├── README.md                      # Project overview and instructions
├── COMIC-GENERATION-INSTRUCTIONS.md # Standards and workflow for comic artwork
├── VIDEO-GENERATION-INSTRUCTIONS.md # Agent workflow for narrated short films from letters
├── GPT-IMAGE-PROMPTING-GUIDE.md   # Prompt engineering reference for comic generation
├── ethan-character-sheet-90s.png  # Primary character visual consistency reference
│
├── ethan_mission_letters/         # [SOURCE ARCHIVE]
│   ├── ethan_mission_letters.md   # Complete sequential archive of all missionary letters
│   └── attachments/               # Canonical LETTER-XXX_<name> photo attachments from emails
│       └── manifest.json          # Email attachment index
│
├── docs/                          # [GITHUB PAGES STATIC VIEWER]
│   ├── .nojekyll                  # Disables Jekyll processing for plain static hosting
│   ├── index.html                 # Chronological grid of all letters
│   ├── letter.html                # Single-letter reading viewer with comic illustration
│   ├── data/
│   │   └── letters.json           # Generated site data (JSON parsed from markdown)
│   └── assets/
│       ├── css/styles.css         # Brazilian flag-themed palette & typography
│       ├── js/
│       │   ├── index.js           # Grid gallery controller
│       │   └── viewer.js          # Single-letter reader controller
│       └── img/                   # Web-optimized comic panels (LETTER-XXX-comic.{png,webp})
│
├── scripts/                       # [PIPELINE SCRIPTS]
│   ├── build_letters_data.py      # Parses markdown archive → docs/data/letters.json
│   └── build_webp_variants.py     # Converts comic PNGs → WebP at 85% quality
│
├── video/                         # [SHORT FILMS] tools, Remotion template, per-letter records
│   ├── tools/                     # Frame, H3 and clip-prep scripts
│   ├── remotion-template/         # Remotion composition (graphics, edit, mix)
│   ├── refs/                      # Companion character sheets
│   └── LETTER-025/                # First film: script, prompts, reviews
│
└── archive/                       # [REFERENCE ASSETS]
    └── ethan-comic-example.png    # Visual reference for panel layout and storytelling
```

---

## Build & Update Workflow

Whenever letters are added or updated in `ethan_mission_letters/ethan_mission_letters.md`:

```bash
# 1. Regenerate web data
python3 scripts/build_letters_data.py

# 2. Build WebP versions of any newly added comic PNGs in docs/assets/img/
python3 scripts/build_webp_variants.py

# 3. Commit and deploy
git add ethan_mission_letters/ docs/
git commit -m "Add letters / update site data"
git push origin main
```

---

## Short Films

Letters can also be turned into narrated, comic-style short films: a narrator voice reads the letter while animated scenes in the comic style play. Agents should follow [`VIDEO-GENERATION-INSTRUCTIONS.md`](VIDEO-GENERATION-INSTRUCTIONS.md). The first film, **LETTER-025 "Hospital Vagabundos"** (2:09), is documented in [`video/LETTER-025/`](video/LETTER-025/). Rendered media is kept outside the repo.
