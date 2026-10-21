import json, os, subprocess, sys
# Usage (from project dir): python3 tools/prep_clip.py <shot ids>. Reads tools/sel.json {id: [take, in_seconds]}.
P=os.environ.get("PROJECT", os.getcwd())
man=json.load(open(f"{P}/audio/vo/manifest.json")); L={s["id"]:s["len"] for s in man["shots"]}
SEL=json.load(open(f"{P}/tools/sel.json"))
for sid in sys.argv[1:]:
    take,tin=SEL[sid]; src=f"{P}/renders/{take}.mp4"; out=f"{P}/remotion/public/clips/{sid}.mp4"
    srcdur=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",src],capture_output=True,text=True).stdout)
    need=L[sid]+0.1; avail=srcdur-tin; vf="scale=1920:1080:flags=lanczos,setsar=1"
    if avail<need: vf+=f",tpad=stop_mode=clone:stop_duration={need-avail+0.05:.2f}"
    subprocess.run(["ffmpeg","-y","-v","error","-ss",str(tin),"-i",src,"-t",f"{need:.2f}","-vf",vf,"-af",f"apad,atrim=0:{need:.2f}","-c:v","libx264","-crf","16","-pix_fmt","yuv420p","-c:a","aac","-ar","48000","-ac","2","-r","24",out])
    print(sid, round(avail,2), round(need,2), "HOLD" if avail<need else "")
