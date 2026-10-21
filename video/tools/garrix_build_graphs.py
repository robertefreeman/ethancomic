#!/usr/bin/env python3
# Build H3 API graphs for one Ethan letter film. Copy to garrix:/home/robert/stacks/comfyui-h3/<SLUG>/build_graphs.py
# Run from /home/robert/stacks/comfyui-h3. SLUG (short prefix, e.g. e25) comes from env H3_SLUG.
import os
SLUG = os.environ.get("H3_SLUG", "e25")
import json, sys
sys.path.insert(0, "/home/robert/stacks/comfyui-h3")
import h3_audio_graphs as A
import h3_graphs as B
def i2v(image, prompt, frames, w, h, seed, prefix):
    g = {}
    g["1"]={"class_type":"UNETLoader","inputs":{"unet_name":B.DIT,"weight_dtype":"default"}}
    g["2"]={"class_type":"CLIPLoader","inputs":{"clip_name":B.TE,"type":"minimax","device":"default"}}
    g["3"]={"class_type":"VAELoader","inputs":{"vae_name":B.VV}}
    g["4"]={"class_type":"VAELoader","inputs":{"vae_name":B.AV}}
    g["20"]={"class_type":"MiniMaxH3TurboLoRA","inputs":{"model":["1",0],"lora_name":B.LORA,"strength":1.0,"low_vram":False}}
    g["30"]={"class_type":"LoadImage","inputs":{"image":image}}
    g["31"]={"class_type":"ImageScale","inputs":{"image":["30",0],"upscale_method":"lanczos","width":w,"height":h,"crop":"center"}}
    g["5"]={"class_type":"MiniMaxH3ImageToVideo","inputs":{"clip":["2",0],"vae":["3",0],"prompt":prompt,"width":w,"height":h,"length":frames,"first_frame":["31",0]}}
    g["6"]={"class_type":"MiniMaxH3TurboSampler","inputs":{}}
    g["7"]={"class_type":"BasicScheduler","inputs":{"model":["20",0],"scheduler":"simple","steps":8,"denoise":1.0}}
    g["8"]={"class_type":"BasicGuider","inputs":{"model":["20",0],"conditioning":["5",0]}}
    g["9"]={"class_type":"RandomNoise","inputs":{"noise_seed":seed}}
    g["10"]={"class_type":"SamplerCustomAdvanced","inputs":{"noise":["9",0],"guider":["8",0],"sampler":["6",0],"sigmas":["7",0],"latent_image":["5",1]}}
    g["11"]={"class_type":"VAEDecode","inputs":{"samples":["10",0],"vae":["3",0]}}
    g["12"]={"class_type":"VAEDecodeAudio","inputs":{"samples":["10",0],"vae":["4",0]}}
    g["13"]={"class_type":"CreateVideo","inputs":{"images":["11",0],"fps":24,"audio":["12",0]}}
    g["14"]={"class_type":"SaveVideo","inputs":{"video":["13",0],"filename_prefix":f"video/{prefix}","format":"auto","codec":"auto"}}
    return g
kind, shot, image, frames, seed, out = sys.argv[1:7]
prompt = open(f"{SLUG}/prompts/{shot}.txt").read().strip()
if kind == "i2v":
    g = i2v(image, prompt, int(frames), 864, 480, int(seed), f"{SLUG}_{shot}")
else:
    g = A.build("a1", image, f"{SLUG}_voice_ref.wav", "", prompt, int(frames), 864, 480, int(seed), f"{SLUG}_{shot}")
json.dump(g, open(out, "w"), indent=1); print("wrote", out)
