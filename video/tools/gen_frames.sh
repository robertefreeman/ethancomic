#!/usr/bin/env bash
# Serial frame generation, Flare default; ~35 s spacing; retry 3x with 60 s backoff.
# Usage: gen_frames.sh <shot ids...>   (prompts/img/<id>.txt, refs from prompts/img/plan.json)
# Run from the PROJECT dir (cwd); tools/ is copied into it.
for sid in "$@"; do
  out=frames/${sid}_src_v1.png; [ -s "$out" ] && continue
  refs=$(python3 -c "import json;print(' '.join(next(f['refs'] for f in json.load(open('prompts/img/plan.json'))['frames'] if f['id']=='$sid')))")
  for try in 1 2 3; do
    python3 tools/img.py azure-gpt-image-2.5-flare prompts/img/$sid.txt $out $refs >> frames/gen.log 2>&1 && break
    echo "retry $sid $try" >> frames/gen.log; sleep 60
  done
  [ -s "$out" ] && ffmpeg -y -v error -i $out -vf "scale=864:480:force_original_aspect_ratio=increase,crop=864:480" frames/${sid}_start_v1.png
  echo "done $sid" >> frames/gen.log; sleep 35
done
echo ALLDONE >> frames/gen.log
