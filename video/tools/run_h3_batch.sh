#!/usr/bin/env bash
# Serial H3 batch on garrix. Run from the PROJECT dir (cwd). Args: shot ids.
# Needs frames/<id>_start.png (approved), prompts/<id>.txt, prompts/gen_frames.json {id: frames}.
# Env: H3_SLUG (garrix file prefix, e.g. e25). One heavy job at a time: never run two copies.
SLUG=${H3_SLUG:?set H3_SLUG}
R=/home/robert/stacks/comfyui-h3
for sid in "$@"; do
  [ -s renders/${sid}_take1.mp4 ] && continue
  f=$(python3 -c "import json;print(json.load(open('prompts/gen_frames.json'))['$sid'])")
  scp -q prompts/$sid.txt garrix:$R/$SLUG/prompts/$sid.txt && scp -q frames/${sid}_start.png garrix:$R/input/${SLUG}_${sid}_start.png || { echo "copy fail $sid" >> renders/batch.log; continue; }
  ssh garrix "cd $R && python3 $SLUG/build_graphs.py i2v $sid ${SLUG}_${sid}_start.png $f 7 $SLUG/$sid.json >/dev/null && timeout 1500 python3 run_h3.py ${SLUG}_${sid}_b1 $SLUG/$sid.json 1400 > $SLUG/$sid.runlog 2>&1; grep -E 'qwen_final|dmesg_new_errs|exec_s|abort' $SLUG/$sid.runlog | tr -d '\n'; echo"  >> renders/batch.log
  out=$(ssh garrix "ls -t $R/output/video/${SLUG}_${sid}_0*.mp4 2>/dev/null | head -1")
  [ -n "$out" ] && scp -q garrix:$out renders/${sid}_take1.mp4
  echo "done $sid frames=$f $(date +%T) -> $out" >> renders/batch.log
done
echo ALLDONE >> renders/batch.log
