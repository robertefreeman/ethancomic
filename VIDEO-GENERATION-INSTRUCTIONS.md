# Ethan Mission Video Generation Instructions

These instructions explain how to turn one of Ethan's letters into a short narrated film (about 2 minutes, 16:9).

In the film, a narrator reads the letter while comic-style animated scenes play. The scenes use the same character and style artifacts as the comics.

The process was first run end to end on **LETTER-025 "Hospital Vagabundos"** (2026-10-21). Every rule below comes from that run. The full record is in [`video/LETTER-025/`](video/LETTER-025/).

Read this whole file before starting. Also read [`COMIC-GENERATION-INSTRUCTIONS.md`](COMIC-GENERATION-INSTRUCTIONS.md). Its style lock and its "no invented facts" rules apply to every video frame too.

---

## 0. Toolchain and Hard Rules

| Stage | Tool | Where |
|---|---|---|
| Scene start frames | GPT Image 2.5. **Flare** by default; **Sunburst** only to retry a hero frame that keeps failing | LiteLLM gateway `https://aigateway.r0b.cc/v1` (`video/tools/img.py`) |
| Animation | MiniMax H3 image-to-video (I2V) through ComfyUI | Garrix `192.168.6.81:8188`, lane `h3_i2v_cropped_864x480_124f_8step` (864×480, 24 fps, Turbo LoRA, 8 steps) |
| Narrator voice design | Qwen3-TTS VoiceDesign (`refm4-qwen-voicedesign`) | refm4 `192.168.6.51:18114` |
| Final narration | Fish S2 Pro (`refm4-fish-s2-pro`) with inline `[cue]` emotion tags | refm4 `192.168.6.51:18113` |
| Speech-to-text QA | Parakeet (`parakeet-ultra`) | gateway, or LAN `192.168.6.60:8111` |
| Graphics, edit, mix | Remotion 4.0.537 (CLI render; Studio not required) | Garrix `/home/robert/stacks/remotion-studio/projects/<project>` |
| Trim, scale, loudness, checks | ffmpeg / ffprobe | local |

Hermes skills to load: `producing-ai-videos`, `voice-audio-gateway`, `comfyui-video-generation-ops`, `remotion-garrix`. Their reference `producing-ai-videos/references/narrated-letter-film-lessons.md` is the condensed version of this file.

### Hard rules

1. **One heavy H3 job at a time.** H3 runs on Garrix GPU1, next to the production LLM on GPU0.
   - Never start a second batch while one is running.
   - Killing a local batch does **not** cancel the job it already queued. Delete that job with `POST /queue {"delete":[prompt_id]}` and kill the remote `run_h3.py` process.
2. **Image calls must be serial,** about 35 s apart. The image route allows only one request in flight; parallel calls fail with 429.
3. **Do not restart `qwen38-radiance-garrix`, LiteLLM, cloudflared or `comfyui-h3`.**
   - The Fish TTS service (`ai.refm4.fish`) may be restarted to register a voice, but only with the user's approval.
   - The ComfyUI queue must be empty when you finish.
4. **No invented facts.** Every scene, caption and overlay must be supported by the letter or its attachments.
5. **No real photos on screen** unless the user explicitly asks for them. The attachments are references only.
6. **Never put legible text in GPT Image frames or H3 clips.** Phone screens, signs, clocks, captions, stamps and titles are all built in Remotion.
7. **Disclose review limits.** Vision-model review and speech-to-text checks are not human viewing or listening. Say so in every report.
8. **Secrets.** The gateway key (`$AIGATEWAY_API_KEY`) lives only in the terminal environment, never in argv, files or this repo. The `execute_code` kernel does not have it, so run gateway calls from the terminal.

---

## 1. Choose the Letter

Rank letters by body word count and attachment count, using `ethan_mission_letters/ethan_mission_letters.md` and `attachments/manifest.json`. Then read the top ~10 in full.

**Pick a letter with an arc:** a dramatic beat plus a comic payoff. Example: a companion collapses, eight hours at the clinic, then a Google Translate blunder.

**Inspect every attachment** with a vision model and record what each one shows. Attachments supply likenesses (companions, members), locations and timestamps.

- In LETTER-025, the hospital selfie was stamped Fri 2026-03-20 22:41. That matched the letter's "Friday… 10p".
- Look for names on badges. They identify companions, and other letters can confirm who is who.

**Use the existing comic for style only.** Comics sometimes contain invented details (for example a sign or banner that isn't in the letter). Ground every shot in the letter and its attachments instead.

**Ask the user these once, up front:**
- aspect ratio
- narrator voice
- how much H3 animation vs. Remotion graphics
- script treatment (light edit or verbatim)
- strictly chronological, or open with a cold-open tease
- music source
- whether to show real-photo credits
- resolution

LETTER-025 answers: 16:9; Qwen-designed voice rendered on Fish; mostly H3, with Remotion for overlays and text; light edit; strictly chronological; synthesized music plus H3 ambience; cartoon only; 864×480, upscaled later.

---

## 2. Project Layout

Work happens **outside** this repo. Generated media is large. Only instructions, tools, prompts and records are committed here.

```text
~/Videos/hermes-productions/ethan-letter-NNN/
├── brief.md  log.md  shots.json
├── script/       source_letter.txt, narration.md
├── refs/         symlinks to attachments, character sheets
├── frames/       <id>_src_*.png (3:2 originals), <id>_start.png (864x480 approved)
├── prompts/      <id>.txt (H3), img/<id>.txt (GPT Image), gen_frames.json {id: H3 frames}
├── renders/      <id>_take<N>.mp4, batch.log
├── audio/        voice_design/, vo/{raw,final}/, vo/manifest.json, music/, sfx/
├── review/       frames.md, clips.md, contact sheets
├── tools/        copied from this repo's video/tools/
├── remotion/     src/ (from video/remotion-template/), public/{clips,vo,music,sfx,img}
└── final/
```

Pick a short `H3_SLUG` (for example `e25`). It prefixes every file on Garrix.

```bash
P=~/Videos/hermes-productions/ethan-letter-NNN; mkdir -p $P && cp -r video/tools $P/
ssh garrix "mkdir -p /home/robert/stacks/comfyui-h3/$H3_SLUG/prompts"
scp video/tools/garrix_build_graphs.py garrix:/home/robert/stacks/comfyui-h3/$H3_SLUG/build_graphs.py
```

---

## 3. Script and Shot List

1. **Extract the letter body.** Drop "Sent from my iPhone", the duplicate HTML-flattened copy and the email headers.
2. **Light edit for the ear.** Keep Ethan's words and jokes. Spell numbers as spoken ("eight hours. Ten p.m. to six a.m."). Turn parentheticals into their own sentences.
3. **Plan by the real word count.** Fish reads about 3.2 words/s. A 339-word letter came to 1:49 tight, or 2:09 with 0.8 s line gaps, a title card and an end card.
4. **Split into shots.** Use **one beat per shot, 3–7 s each**, so about 24 shots for 2 minutes. No single H3 generation may exceed 10 s.
5. **Write `shots.json`.** For each shot, record: `id`, act, VO line, visual, method (`h3` | `remotion` | `remotion+h3still`), reference attachments, ambience, graphics layer.
   - Leave open frame space wherever an overlay will sit.
6. **Plan the comedy beats as graphics.** Examples: a phone translate screen, a record-scratch punch-in, a CENSORED stamp, a group-chat screen, a clock time-lapse, a milestone badge, a day timeline, location labels.
7. **Get the user's approval of the script** unless the user has delegated it.

---

## 4. Narrator Voice: Qwen Design, Then Fish Registration

This is the user's preferred method. Full procedure: `voice-audio-gateway/references/fish-s2-pro.md`, section "Registering a designed voice".

1. **Generate 3–4 Qwen takes of one test passage that contains every hard word.**
   - The hard words are foreign words, place names and the sign-off ("Olá", "Capão da Canoa", "vagabundos", "Tchau").
   - The `voice` field is the design prompt; strip all `[brackets]` from the text.
   - Working LETTER-025 prompt: `Gender: male; Age: about nineteen; Accent: American; Pitch: medium-light; Texture: warm, bright, slightly boyish; Pace: quick and conversational; Emotion: amused and good-natured, with a wry deadpan edge on the jokes; Use case: a young man reading his own funny letter home aloud as narration.`
   - **The user picks by ear.** The take is the voice, not the prompt; the same prompt gives a different voice on each call.
2. **Trim the chosen take into the reference clip** (10–14 s, 44.1 kHz mono, `loudnorm=I=-18`).
   - **Cut out any sentence the take mispronounced.** Fish copies pronunciation as well as timbre. A reference that said "Then an interesting week" made every Fish line say "Then"; cutting that sentence fixed it.
   - The registry's `ref_text` must be exactly the words left in the clip.
3. **Register on refm4.**
   - Back up `~/.fish/server.py`.
   - Copy the clip to `~/.fish/voices/<name>.wav`.
   - Add a `<NAME>_REFTXT` constant and a `VOICE_REGISTRY` entry, then run `python3 -m py_compile server.py`.
   - Restart with `launchctl kickstart -k gui/$(id -u)/ai.refm4.fish` (user approval required).
   - Health-check on the **LAN IP**: `curl http://192.168.6.51:18113/health`. Loopback returns 000 even when the service is healthy.
   - Prove the new voice is used: `~/.fish/serve.log` must show `voice=<name> ref=yes`. Unknown voice names fall back to the default voice silently.
   - LETTER-025 registered `ethan_narrator`. Reuse it unless the user wants a new voice.
4. **Render one file per line** with inline cues, one call at a time. Use `video/tools/` plus the skill's `scripts/tts.sh`.
   - Set a baseline cue, then a cue only at emotional turns: `[deadpan]`, `[tired]`, `[embarrassed]`, `[laughing]`, `[break]`, `[long-break]`.
   - Render two takes of each punchline.
   - In an A/B against paragraph reads, the user preferred **line by line** with gaps of 0.8 s, or 1.3 s at section turns.
5. **QA every file.**
   - Parakeet transcript diffed against the script; cue words must not appear.
   - Check ffprobe duration.
   - Run `find raw -name '*.wav' -size -10k`. A LiteLLM restart can save an "error code: 502" body as a `.wav`.
6. **Build the timeline.** Trim and normalize each line, then write `audio/vo/manifest.json` with per-shot `from`, `to`, `len`, `vo_start` and `vo_dur`.
   - Every shot length comes from the real VO.
   - Allow a 4 s title before the first line and 5 s for the end card.

---

## 5. Character Sheets and Start Frames (GPT Image)

**Character sheets.**
- Ethan: `ethan-character-sheet-90s.png`.
- Recurring companions: one sheet each, before any scene frames, built from the attachment likeness. Then run one style-match edit against Ethan's sheet.
- LETTER-025's companion sheet is at `video/refs/yallico-character-sheet.png`.

**Style lock.** Put the style lock in every prompt. See `video/LETTER-025/prompts/img/*.txt`:

> fine pen-and-ink outlines, light pencil hatching, flat muted warm watercolor washes, low saturation, soft even light (not dramatic cinematic lighting), 1990s comic-strip cartoon, non-photorealistic… no text anywhere, badges blank… start frame of a 16:9 shot center-cropped from 3:2; keep heads and hands inside the middle band. Mouths closed.

### Rules learned from LETTER-025

- **Do not stage close physical contact between two characters.** Carrying someone, hugging, cheek-to-cheek, or two heads together in a selfie: H3 turns it into an embrace or nuzzle within ~1 s, and no prompt wording fixed it (three takes failed). Restage instead:
  - a wide shot from behind (the carry to the car)
  - a handshake instead of a hug
  - a selfie with a foreground and background figure far apart
- **A room is only consistent if later frames are edits of its first frame.**
  - Generate one establishing frame per location.
  - Make every later shot in that location as an edit of it (`img.py <model> prompt.txt out.png establishing.png sheet.png`).
  - A text-only prompt for the same living room produced a different sofa, different chairs and the wrong cast.
- **Reuse "wrong" frames.** A clinic frame with an unwanted thumbs-up became the base for the selfie shot.
- **Fix headroom by recropping the 1536×1024 source,** not by regenerating.
- **Fix a single defect with an edit,** using "change only X" plus a full preserve list.

### Generation and review

- Generate frames with `tools/gen_frames.sh <ids>` and fixes with `tools/fix_frames.sh`. Both run serially in the background.
- Cover-crop each frame to exactly 864×480, then copy it to `frames/<id>_start.png`.
- Review every frame with a vision model: intent, identity, style, text, hands, separation. Log PASS/FIX in `review/frames.md`.
- If a frame fails solo review on style, also check it side by side with an approved frame. The solo reviewer is stricter than what matters in the cut.

---

## 6. Animation (H3 I2V)

### Prompts

Write prompts in H3's structured grammar. Templates: `video/LETTER-025/prompts/s*.txt`.

- Opening line: `For the target video, at 0.00 seconds…<Picture 1>… is fully referenced.`
- Then `integrated_multimodal_description`, starting with "2D-animated hand-drawn comic cartoon…".
- Describe what is already in the frame, then the motion that develops from it.
- End the description with `Mouths stay closed. No captions or on-screen text.`
- `overall_soundscape:` real ambience followed by **`No voices, narration or singing.`** The ambience is kept under the VO.
- `non_diegetic_music: N/A`

### Camera

- **Avoid "the camera pushes in" for two-person or listener shots.** It cropped Ethan out of a clinic shot and dropped the family out of a pointing shot.
- Write instead: "The camera is static, a locked-off shot that keeps X in frame."

### Frame counts

- Frame counts sit on the 17k+5 grid at 24 fps. Use the smallest count at or above `slot + 0.4 s`, with a floor of 124 frames and a maximum of 243.
- Store the counts in `prompts/gen_frames.json`.

### Rendering

```bash
cd $P && H3_SLUG=e25 bash tools/run_h3_batch.sh s02 s03 s06 ...   # background, notify on completion
```

- Each job takes about 145–210 s, and `run_h3.py` watches GPU health and the neighbouring LLM.
- **To queue a second batch,** chain it behind a guard: wait for the first script's process to exit **and** for an empty ComfyUI queue.

### Review every clip

- Review a contact sheet with a vision model. Use 3–4 fps for clips of 5 s or more.
- Expect the requested action in the **first 2–4 s, followed by drift**: props swapping, extra badges, a smile turning tearful, a face cropped.
- Log each clip in `review/clips.md` as PASS/REFINE/FAIL **with its clean window**, and cut to that window.
- After **3 failures on one shot with the same approach, stop and change the approach** (restage), or ask the user.

---

## 7. Clip Preparation

Bring every clip to 1920×1080, 24 fps and its exact slot length **before** copying it to Remotion.

- **The whole take fits the slot:** `python3 tools/prep_clip.py <ids>`. It reads `tools/sel.json` (`{id: [take, in_seconds]}`) and fills any shortfall by holding the last frame.
- **The clean window is shorter than the slot:** `python3 tools/slow_clip.py <id> <take> <in> <out> <speed>`. This uses motion-compensated interpolation (`minterpolate mi_mode=mci`).
  - **Never** slow clips with plain `setpts`. It duplicated frames down to about 15 unique fps, a visible stutter.
  - Verify with `mpdecimate`: unique frames should be about 24 × seconds.
- **The clean windows are on both sides of a defect** (for example a prop swap): join them with a short `xfade`.

---

## 8. Remotion Edit

The template is in [`video/remotion-template/src/`](video/remotion-template/src/): `Film.tsx`, `Root.tsx`, `timeline.ts`. Use LETTER-025's components as patterns:

- title card and end card on a paper background
- yellow comic `Caption` labels
- `Clock` (time-lapse)
- `Badge24`
- `Timeline`
- `Phone`, with `Translate` and `Chat` screens
- `Punch` (record-scratch zoom with a glitch card)
- `Censored` (stamp plus #@$%! bubble)
- SFX cues
- music ducking

### Setup

1. **Scaffold the project on Garrix.** Use the pinned version, never `@latest`:
   ```bash
   ssh garrix 'cd /home/robert/stacks/remotion-studio && docker compose run --rm --no-deps -w /work --entrypoint "" remotion-studio npx --yes create-video@4.0.537 --yes --blank --no-tailwind <project>'
   ```
   Then set the repo-local git identity, delete `src/Composition.tsx`, and install `@remotion/google-fonts@4.0.537` and `@remotion/transitions@4.0.537` with `--save-exact`.
2. **Generate `timeline.ts` from `audio/vo/manifest.json`:** `SHOTS` with `{id, from, dur, kind}` in frames, `VO` with `{id, from, dur}`, and `TOTAL`.
3. **Copy the assets** to `public/`: clips, VO lines (48 kHz stereo), music, SFX, and stills for the Ken Burns and graphics plates.

### Fonts and layout

- Bangers is the display face (`latin` subset only). Comic Neue and Nunito are used for UI text.
- The `latin` subsets already cover á, ã and ç. Requesting `latin-ext` fails the typecheck.
- Put captions **bottom-left**. Top-left captions land on heads in medium shots.
- Duck the music from **real VO windows**, not shot windows.

### Lint and stills

- Run `npm run lint` (eslint plus tsc) inside the container.
- Render key-frame stills (`--sequence --frames=a,b,c --image-format=png --scale=0.5`) at overlay steady state and review them.
  - Do this once with placeholder plates to catch layout bugs early, and again with the real clips.
- Fix every text-over-face, clipping or legibility bug before the full render.

### Full render

```bash
npx remotion render <CompId> out/<name>.mp4 --codec=h264 --crf=17 --concurrency=3 \
  --offthreadvideo-cache-size-in-bytes=1073741824 --offthreadvideo-threads=2
```

- `--concurrency=6` was killed by the container's 8 GiB memory limit (`Compositor exited with signal SIGKILL`).
- At concurrency 3, 3,103 frames took 2:08.

### Audio

- **Music:** licence-free, synthesized in Python. A bossa-style Karplus-Strong guitar with a shaker.
  - It goes sparse and minor for the dramatic act, and drops out entirely on the punchline scratch.
  - Run the result through `aecho`, then `lowpass`, then `loudnorm=I=-20`.
- **SFX:** synthesized the same way (scratch, pings, stamp, pop, tick, whoosh).
- **H3 native ambience:** keep it at volume about 0.16 under the VO.

---

## 9. Finishing and Validation

```bash
ffmpeg -i raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart final.mp4
```

Validate:

- **Format:** ffprobe shows 1920×1080, 24 fps and the expected frame count.
- **Full decode:** `ffmpeg -v error -i final.mp4 -f null -` reports no errors.
- **Black and frozen frames:** use `blackdetect` and `freezedetect`. The end-card hold is an expected freeze.
- **Loudness:** `ebur128` integrated loudness close to −14 LUFS.
- **Narration:** Parakeet on the whole mix, diffed against the script. LETTER-025 scored 0.988; the only misses were Portuguese names the speech-to-text cannot spell.
- **Whole-film contact sheet:** one frame every ~4 s, reviewed for coherence and order.

**Telegram delivery.** Bots can upload at most 50 MB, so make a two-pass copy (`-b:v 2550k` for about 2:10 at 1080p, about 43 MB). Send it with:

```bash
hermes send --to telegram "caption
MEDIA:/abs/path/final_telegram.mp4"
```

The full-quality master stays untouched.

**Report to the user:**
- chosen takes and seeds
- what was trimmed or slowed
- native resolution (864×480 scaled into 1080p) vs. any later upscale
- known minor defects
- that review was automated and the user has not yet watched or listened to the film

**Later upscale.** Upscale the H3 **clips** and re-render Remotion. Upscaling the finished MP4 also softens the text.

---

## 10. What to Commit Here

Commit to this repo:

- `video/LETTER-NNN/`:
  - `brief.md`, `shots.json`, `vo_manifest.json`
  - `script/` (source letter, narration, Fish cue files)
  - `prompts/`
  - `review/` (frames.md, clips.md, log.md)
- any new character sheets in `video/refs/`
- tool and template improvements in `video/tools/` and `video/remotion-template/`

Do **not** commit renders, frames, audio or the final MP4. They are hundreds of MB and live in `~/Videos/hermes-productions/`.

If the user wants the film published on the site, ask first. Plain GitHub rejects files over 100 MB, so that would need Git LFS or external hosting.

---

## Produced Films

| Letter | Title | Runtime | Master (local) | Record |
|---|---|---|---|---|
| LETTER-025 | Hospital Vagabundos | 2:09 | `~/Videos/hermes-productions/ethan-letter-025/final/hospital_vagabundos_v1.mp4` | [`video/LETTER-025/`](video/LETTER-025/) |
