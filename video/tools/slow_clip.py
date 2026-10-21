#!/usr/bin/env python3
"""Fill a timeline slot from the CLEAN window of an H3 take, slowed with motion-compensated
interpolation (never plain frame duplication, which stutters at ~15 unique fps).

Usage (from the project dir):
  python3 tools/slow_clip.py <shot_id> <take_name> <in_s> <out_s> <speed>
  e.g. python3 tools/slow_clip.py s07 s07_take1 0 3.9 0.6
Writes remotion/public/clips/<shot_id>.mp4 at 1920x1080/24 fps, exactly the slot length from
audio/vo/manifest.json (+0.1 s); any remaining time is a held last frame.
Verify: ffmpeg -i out.mp4 -vf mpdecimate -an -f null -  -> unique frames ~= 24 * seconds.
"""
import json, os, subprocess, sys

P = os.environ.get("PROJECT", os.getcwd())
sid, take, tin, tout, speed = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
man = json.load(open(f"{P}/audio/vo/manifest.json"))
need = next(s["len"] for s in man["shots"] if s["id"] == sid) + 0.1
vf = (f"[0:v]setpts=PTS/{speed},minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:vsbmc=1,"
      f"scale=1920:1080:flags=lanczos,setsar=1,tpad=stop_mode=clone:stop_duration=4[v];"
      f"[0:a]atempo={max(0.5, speed)},apad[a]")
cmd = ["ffmpeg", "-y", "-v", "error", "-ss", str(tin), "-i", f"{P}/renders/{take}.mp4", "-t", str(tout - tin),
       "-filter_complex", vf, "-map", "[v]", "-map", "[a]", "-t", f"{need:.2f}",
       "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-ac", "2",
       f"{P}/remotion/public/clips/{sid}.mp4"]
os.makedirs(f"{P}/remotion/public/clips", exist_ok=True)
r = subprocess.run(cmd, capture_output=True, text=True)
print(sid, "slot", round(need, 2), "s; motion", round((tout - tin) / speed, 2), "s", r.stderr[-300:])
