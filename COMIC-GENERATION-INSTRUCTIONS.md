# Ethan Mission Comic Generation Instructions

These instructions define the required process and constraints for generating comics from Ethan's mission letters.

## Default Generation Path

These comics should use the built-in image workflow by default.

Default approach:

- Use the built-in image workflow first for normal comic generation.
- Load the Ethan character sheet, sample comic, and letter-specific attachments into context as actual reference images whenever possible.

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
3. Always include all available attachments for the selected `LETTER-XXX` as references for that comic.
4. The Ethan character sheet, sample comic, and letter-specific attachments must be passed into the active image workflow as actual input images whenever possible.
5. Comics must clearly read as taking place in Brazil (architecture, streets, signage language cues, clothing context, landscape, and local atmosphere where appropriate).
6. Character and scene rendering style must be **1990s comic strip cartoon** with clearly stylized, non-realistic visuals.
7. Do **not** generate photorealistic, painterly, or cinematic-real skin-texture output. The result must read immediately as a cartoon comic strip.
8. Final comic aspect ratio must be `1:1` (square).
9. Use the highest resolution available to the image generation tool for the final output.
10. Save each final comic image in the repository base directory (repo root).
11. Do not invent events, timeline facts, or captions that are not in the selected letter and its attachments.
12. Any explicit date/year reference in captions must match the letter source exactly.
13. If a year transition is mentioned, use the correct transition from the mission timeline (`2025` to `2026`), not `2024` to `2025`.
14. Panel count is not fixed. The number of panels must be dictated by the selected letter's content and pacing.

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
   - Images 3-N: all `LETTER-XXX` attachments as scene/person/location references
5. Build a prompt that references:
   - Ethan character consistency and style lock via `ethan-character-sheet-90s.png` (follow extremely closely)
   - 1990s comic-strip cartoon style direction (bold outlines, simplified forms, expressive faces, cel-style shading)
   - Sample comic visual style via `ethan-comic-example.png` for panel flow/story readability only
   - Letter-specific events and all letter attachments
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

## Prompt Checklist (Before Final Render)

- Ethan and companion character presentation follows `ethan-character-sheet-90s.png` incredibly closely with no noticeable drift.
- Character and scene style is clearly 1990s comic-strip cartoon (not photorealistic or painterly).
- Panel storytelling/layout remains aligned with `archive/ethan-comic-example.png`.
- Letter-specific attachments are reflected in scenes/people/settings.
- Real reference images were supplied to the active image workflow, not just described in prompt text.
- No extra story details are added beyond what is in the original letter and attachments.
- Any year/date text shown is correct for the letter timeline (including `2025` to `2026` where relevant).
- Brazil context is visually evident.
- Output is square (`1:1`).
- Final render uses highest available resolution setting.
- Final file is in repo root with correct `LETTER-XXX-comic.png` naming.
- Panel count/layout matches the letter's actual content density rather than a fixed template.
