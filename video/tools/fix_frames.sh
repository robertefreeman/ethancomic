#!/usr/bin/env bash
# Serial frame fixes: fix_frames.sh <id>:<model>:<base image>:<extra refs comma-sep> ...
# Run from the PROJECT dir (cwd); tools/ is copied into it.
for spec in "$@"; do
  IFS=: read sid model base refs <<< "$spec"
  out=frames/${sid}_src_fix.png
  imgs="$base ${refs//,/ }"
  for try in 1 2 3; do python3 tools/img.py $model prompts/img/${sid}_fix.txt $out $imgs >> frames/gen.log 2>&1 && break; sleep 60; done
  [ -s "$out" ] && ffmpeg -y -v error -i $out -vf "scale=864:480:force_original_aspect_ratio=increase,crop=864:480" frames/${sid}_start_fix.png
  echo "fixdone $sid" >> frames/gen.log; sleep 35
done
