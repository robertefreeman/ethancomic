# video/

Assets for turning Ethan's letters into narrated short films. The procedure is in [`../VIDEO-GENERATION-INSTRUCTIONS.md`](../VIDEO-GENERATION-INSTRUCTIONS.md); read that first.

- **`tools/`**: scripts you copy into each production directory under `~/Videos/hermes-productions/ethan-letter-NNN/`.
  - `img.py`: GPT Image generate/edit through the gateway, with an explicit model (Flare or Sunburst).
  - `gen_frames.sh` and `fix_frames.sh`: serial frame generation and fix edits.
  - `run_h3_batch.sh`: serial H3 I2V batch on Garrix. Needs `H3_SLUG` set.
  - `garrix_build_graphs.py`: H3 API graph builder. It lives on Garrix as `comfyui-h3/<SLUG>/build_graphs.py`.
  - `prep_clip.py` and `slow_clip.py`: bring clips to 1080p/24 at the exact slot length. `slow_clip.py` uses motion-interpolated slow-mo for short clean windows.
- **`remotion-template/src/`**: the Remotion composition from LETTER-025. It includes the comic caption, title and end cards, clock, 24-hour badge, timeline, phone translate and chat screens, punch-in, CENSORED stamp, SFX cues and VO-aware music ducking.
- **`refs/`**: character sheets for recurring companions. Ethan's sheet is in the repo root.
- **`LETTER-025/`**: the record of the first film: brief, shot list, narration and Fish cue files, all image and H3 prompts, VO timing manifest, and the frame and clip reviews.

Generated media (frames, renders, audio, final MP4s) is not committed. It stays in the production directory.
