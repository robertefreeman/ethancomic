#!/usr/bin/env python3
"""Gateway image edit/generate with an explicit model (Sunburst etc.). Key from env, never argv.
Usage: img.py <model> <prompt_file> <out.png> [image1 image2 ...]   (no images = generate)"""
import base64, json, os, ssl, sys, time, urllib.request, uuid
model, pf, out, imgs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
G = os.environ.get("AIGATEWAY_BASE", "https://aigateway.r0b.cc/v1"); KEY = os.environ["AIGATEWAY_API_KEY"]
prompt = open(pf).read().strip(); ctx = ssl._create_unverified_context()
def post(url, body, ctype):
    req = urllib.request.Request(url, data=body, headers={"Authorization": f"Bearer {KEY}", "Content-Type": ctype})
    return json.load(urllib.request.urlopen(req, context=ctx, timeout=600))
t0 = time.time()
if imgs:
    b = uuid.uuid4().hex; parts = []
    def field(n, v): parts.append(f'--{b}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode())
    field("model", model); field("prompt", prompt); field("size", "1536x1024"); field("n", "1")
    for p in imgs:
        parts.append(f'--{b}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(p)}"\r\nContent-Type: image/png\r\n\r\n'.encode() + open(p, "rb").read() + b"\r\n")
    parts.append(f"--{b}--\r\n".encode())
    r = post(f"{G}/images/edits", b"".join(parts), f"multipart/form-data; boundary={b}")
else:
    r = post(f"{G}/images/generations", json.dumps({"model": model, "prompt": prompt, "size": "1536x1024", "n": 1}).encode(), "application/json")
d = r["data"][0]
if d.get("b64_json"): open(out, "wb").write(base64.b64decode(d["b64_json"]))
else: open(out, "wb").write(urllib.request.urlopen(d["url"], context=ctx).read())
json.dump({"model": model, "prompt_file": pf, "inputs": imgs, "secs": round(time.time()-t0, 1)}, open(out + ".json", "w"), indent=1)
print("ok", out, round(time.time()-t0, 1), "s")
