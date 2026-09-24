# Ethan Mission Comic Generation Instructions

These instructions define the required process and constraints for generating comics from Ethan's mission letters.

## Default Generation Path

These comics should use the built-in image workflow by default.

Default approach:

- Use the built-in image workflow first for normal comic generation.
- The built-in workflow accepts at most five reference images per call. Include the Ethan character sheet and sample comic, then choose up to three of the most useful letter-specific images for the first render.
- Inspect every letter attachment, even when it cannot fit into the first render's reference set. Use additional relevant attachments in targeted edit calls during the review pass.

Fallback approach:

- Use the CLI image workflow only when the built-in path cannot cleanly support the required reference handling, output requirements, or iteration workflow.
- CLI tool path: `$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py`

Reason:

- The built-in workflow should be the default because it is simpler and does not depend on local API-key setup.
- Character consistency and scene fidelity still require using the Ethan character sheet, sample comic, and letter-specific attachments as real reference images whenever possible.
- The CLI path remains available as a fallback for cases where explicit multi-image edit control is necessary.

## Required Inputs

Use all of the following for every comic:

1. `ethan_mission_letters/ethan_mission_letters.md` (letter narrative source)
2. `ethan_mission_letters/attachments/` (letter-specific reference photos/videos)
3. `archive/ethan-comic-example.png` (overall look-and-feel/style consistency reference)
4. `ethan-character-sheet-90s.png` (primary character consistency reference for Ethan in all comics)
5. `GPT-IMAGE-PROMPTING-GUIDE.md` (prompting best practices for `gpt-image-2`)

## Environment Requirements

Default built-in workflow:

1. Use the built-in image workflow first.
2. Load reference images into context as actual image inputs whenever possible.

CLI fallback only:

1. `OPENAI_API_KEY`
2. Network access for the OpenAI Image API
3. Use of the CLI `edit` workflow when supplying one or more reference images for style/identity grounding

## Non-Negotiable Rules

1. Always use `ethan-character-sheet-90s.png` as the primary referent image for Ethan's face, build, hairstyle, expressions, outfit details, and rendering style.
2. Follow `ethan-character-sheet-90s.png` incredibly closely. Treat it as the authoritative source for character look and style. Do not drift from it.
3. Review every available attachment for the selected `LETTER-XXX`; do not assume every file is relevant to a story scene. Record which ones show people, places, or events in the letter.
4. Pass actual references into the image workflow. Each call supports at most five reference images: use the character sheet and sample comic plus up to three letter attachments for the first render. Select attachments that best establish the main people, location, or event; do not arbitrarily take only the first three files.
5. If there are more than three letter attachments, inspect the remaining images and use the most relevant ones in one or more targeted edit calls. In each edit call, include the comic being edited, the character sheet, and up to three additional scene/person references. Keep each edit focused, and preserve accurate panels while incorporating the reference detail.
6. If there are more than five total attachments, use the same staged process: review the full set, select the strongest references for the first render, then bring in additional relevant references during targeted edits. A reference does not need to appear visibly in a panel; it can establish a person's likeness, clothing, or location. Do not add an event just because an attachment depicts it unless the selected letter also describes that event.
7. Comics must clearly read as taking place in Brazil (architecture, streets, signage language cues, clothing context, landscape, and local atmosphere where appropriate).
8. Character and scene rendering style must be **1990s comic strip cartoon** with clearly stylized, non-realistic visuals.
9. Do **not** generate photorealistic, painterly, or cinematic-real skin-texture output. The result must read immediately as a cartoon comic strip.
10. Final comic aspect ratio must be `1:1` (square).
11. Use the highest resolution available to the image generation tool for the final output.
12. Save each final comic image in the repository base directory (repo root), and add the site copies described below.
13. Do not invent events, timeline facts, locations, captions, or quotes that are not supported by the selected letter and its attachments. Treat dialogue as narration unless the letter provides the exact quote. Do not turn a plausible inference into a stated fact.
14. Any explicit date/year reference in captions must match the letter source exactly.
15. If a year transition is mentioned, use the correct transition from the mission timeline (`2025` to `2026`), not `2024` to `2025`.
16. Panel count is not fixed. The number of panels must be dictated by the selected letter's content and pacing.

## Output Naming

Use this naming format in the repo root:

- `LETTER-001-comic.png`
- `LETTER-013-comic.png`
- `LETTER-029-comic.png`

Pattern: `LETTER-XXX-comic.png`

## Generation Workflow

1. Select a letter from `ethan_mission_letters/ethan_mission_letters.md`.
2. Gather all matching references from `ethan_mission_letters/attachments/` using the same letter ID prefix (for example, `LETTER-013_*`).
3. Read the selected letter and extract key beats to determine panel count and scene sequence.
4. Prepare image references with explicit roles:
   - Image 1: `ethan-character-sheet-90s.png` as identity/style authority
   - Image 2: `archive/ethan-comic-example.png` as layout/storytelling reference
   - Images 3-5: up to three selected `LETTER-XXX` attachments as scene/person/location references
   - Any further relevant attachments: supply in targeted edit calls after reviewing the first render
5. Build a prompt that references:
   - Ethan character consistency and style lock via `ethan-character-sheet-90s.png` (follow extremely closely)
   - 1990s comic-strip cartoon style direction (bold outlines, simplified forms, expressive faces, cel-style shading)
   - Sample comic visual style via `ethan-comic-example.png` for panel flow/story readability only
   - Letter-specific events and details grounded in the full attachment set, staged across calls when needed
   - Brazil setting cues
   - Square `1:1` composition
   - Maximum available output resolution
6. Include the mandatory style block below verbatim (or equivalent language with same constraints):

```
STYLE LOCK (MANDATORY):
- 1990s comic strip cartoon look, clearly stylized and non-photorealistic.
- Bold black ink outlines, simplified anatomy, expressive/cartoon facial features.
- Flat or cel-style color shading, limited texture detail, clean comic panel readability.
- Keep Ethan model locked to ethan-character-sheet-90s.png.

NEGATIVE CONSTRAINTS (MANDATORY):
- No photorealism.
- No painterly realism.
- No realistic skin pores or cinematic photography look.
- No hyper-detailed lighting that makes characters look like real photos.
- No invented facts, events, or timeline details.
- No incorrect year labels; use letter-accurate years only.
```
7. Generate the comic through the built-in image workflow by default, using real image inputs whenever possible.
8. If the built-in workflow cannot support the required reference handling cleanly, fall back to the CLI workflow, preferably via the CLI `edit` path for image-conditioned generation.
9. If needed, iterate with targeted prompt refinements while preserving Ethan consistency and Brazil context.
10. Save the final selected image to the repo root using `LETTER-XXX-comic.png`.
11. Choose panel count and panel sizes based on the amount of meaningful content in that specific letter (fewer panels for simple weeks, more panels for event-heavy weeks).

## Workflow Notes

- Preferred model: `gpt-image-2`
- Preferred default mode: built-in image workflow with loaded reference images in context
- Preferred CLI fallback mode: `edit` with repeated `--image` inputs
- Preferred final size: largest practical square size supported by the model constraints
- Reference images should be described by index and role inside the prompt
- Do not rely on text-only prompting when real reference images are available

## Required Accuracy Repass (After First Render)

Every comic must receive a second visual review before it is considered final. Compare the generated image directly against both the full letter and all available attachments, not only against the initial prompt.

1. Check each panel against the letter's events, timeline, places, relationships, companions, and stated outcomes. Correct contradictions, wrong locations, and unsupported additions.
2. Read all visible lettering closely. Correct misspelled names, mistranslated or garbled text, wrong dates, invented direct quotes, and captions that add a fact or opinion the letter does not state. Prefer short, source-grounded narration over invented dialogue.
3. Compare characters, clothing, people, and settings with the attachments. Use a targeted edit with an unused, relevant reference when it improves likeness or adds a documented detail. Keep Ethan locked to the character sheet and preserve the cartoon style.
4. Check that no photo or photorealistic insert breaks the comic style after an edit. If a reference photo is incorporated, redraw its content as a cartoon panel.
5. Inspect the revised image again. Confirm the requested correction took effect and did not damage other accurate panels, text, square aspect ratio, or character consistency. Repeat a focused edit if needed.

## Site Assets

For each final comic:

1. Keep the full-resolution PNG in the repository root using `LETTER-XXX-comic.png`.
2. Copy the same PNG into `docs/assets/img/` so the website can load it.
3. Generate its WebP version alongside the site PNG by running `python3 scripts/build_webp_variants.py`. If Pillow is unavailable, use an isolated environment to install it; do not silently omit the WebP asset.
4. Confirm the root PNG and site PNG match, and that both the PNG and WebP exist for the new letter.

## Prompt Checklist (Before Final Render)

- Ethan and companion character presentation follows `ethan-character-sheet-90s.png` incredibly closely with no noticeable drift.
- Character and scene style is clearly 1990s comic-strip cartoon (not photorealistic or painterly).
- Panel storytelling/layout remains aligned with `archive/ethan-comic-example.png`.
- The full attachment set was reviewed; the most relevant letter-specific references were supplied to the active image workflow, within its five-image limit.
- If other relevant attachments could not fit in the first call, they were used during targeted edits where they improved accuracy.
- Real reference images were supplied to the active image workflow, not just described in prompt text.
- No extra story details are added beyond what is in the original letter and attachments.
- Any year/date text shown is correct for the letter timeline (including `2025` to `2026` where relevant).
- Brazil context is visually evident.
- Output is square (`1:1`).
- Final render uses highest available resolution setting.
- Final file is in repo root with correct `LETTER-XXX-comic.png` naming.
- Panel count/layout matches the letter's actual content density rather than a fixed template.
- The required accuracy repass is complete and the corrected image has been visually rechecked.
- Root PNG, site PNG, and site WebP are present and the two PNGs match.
