import React from "react";
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from "remotion";
import {loadFont as loadBangers} from "@remotion/google-fonts/Bangers";
import {loadFont as loadComic} from "@remotion/google-fonts/ComicNeue";
import {loadFont as loadNunito} from "@remotion/google-fonts/Nunito";
import {SHOTS, VO, TOTAL} from "./timeline";

export {TOTAL};
const display = loadBangers("normal", {weights: ["400"], subsets: ["latin"]}).fontFamily;
const comic = loadComic("normal", {weights: ["700"], subsets: ["latin"]}).fontFamily;
const ui = loadNunito("normal", {weights: ["600", "800"], subsets: ["latin", "latin-ext"]}).fontFamily;

const INK = "#24170e";
const PAPER = "#f4e8cc";
const YELLOW = "#ffd84a";
const RED = "#c8372d";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const ease = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});

// ---------- per-shot clip config (trimBefore in frames, optional still + ken-burns) ----------
type ClipCfg = {src?: string; still?: string; trim?: number; kb?: [number, number]; blur?: number; muteAmb?: boolean};
const CLIP: Record<string, ClipCfg> = {
  s02: {src: "clips/s02.mp4"}, s03: {src: "clips/s03.mp4"}, s04: {src: "clips/s04.mp4"}, s05: {src: "clips/s05.mp4"},
  s06: {src: "clips/s06.mp4"}, s07: {src: "clips/s07.mp4"}, s08: {src: "clips/s08.mp4"}, s09: {src: "clips/s09.mp4"},
  s10: {src: "clips/s10.mp4"}, s11: {src: "clips/s11.mp4"}, s12: {src: "clips/s12.mp4"}, s13: {src: "clips/s13.mp4"},
  s14: {still: "img/s14.png", kb: [1.0, 1.08]}, s15: {src: "clips/s15.mp4"},
  s16: {still: "img/s16.png", kb: [1.05, 1.0], blur: 6},
  s17: {src: "clips/s17.mp4"}, s18: {src: "clips/s18.mp4"},
  s19: {still: "img/s19.png", kb: [1.0, 1.06], blur: 7},
  s20: {still: "img/s20.png", kb: [1.0, 1.0]},
  s21: {src: "clips/s21.mp4"}, s22: {src: "clips/s22.mp4"},
  s23: {still: "img/s23.png", kb: [1.04, 1.0], blur: 7},
  s24: {src: "clips/s24.mp4"}, s25: {src: "clips/s25.mp4"},
};
const CLIP_CFG = CLIP as Record<string, ClipCfg>;

const Plate: React.FC<{id: string; dur: number}> = ({id, dur}) => {
  const f = useCurrentFrame();
  const c = CLIP_CFG[id];
  if (!c) return null;
  const fade = Math.min(ease(f, 0, 5), 1 - ease(f, dur - 5, dur));
  if (c.src) {
    return (
      <AbsoluteFill style={{opacity: id === "s02" ? 1 : fade}}>
        <OffthreadVideo src={staticFile(c.src)} trimBefore={c.trim ?? 0} volume={0.16} style={{width: "100%", height: "100%", objectFit: "cover"}} />
      </AbsoluteFill>
    );
  }
  const [a, b] = c.kb ?? [1, 1.05];
  const s = interpolate(f, [0, dur], [a, b], clamp);
  return (
    <AbsoluteFill style={{opacity: fade, overflow: "hidden"}}>
      <Img src={staticFile(c.still!)} style={{width: "100%", height: "100%", objectFit: "cover", transform: `scale(${s})`, filter: c.blur ? `blur(${c.blur}px) brightness(0.8)` : undefined}} />
    </AbsoluteFill>
  );
};

// ---------- shared comic UI ----------
const Caption: React.FC<{text: string; at?: number; x?: number; y?: number; rot?: number; size?: number}> = ({text, at = 4, x = 70, y = 930, rot = -2, size = 52}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div style={{position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${rot}deg)`, transformOrigin: "left bottom", background: YELLOW, border: `4px solid ${INK}`, padding: "10px 26px", fontFamily: comic, fontWeight: 700, fontSize: size, color: INK, boxShadow: `6px 6px 0 ${INK}`, letterSpacing: 0.5}}>
      {text}
    </div>
  );
};

const PaperBg: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #fbf3dc 0%, ${PAPER} 60%, #e6d3a8 100%)`}}>
    <AbsoluteFill style={{backgroundImage: "radial-gradient(rgba(36,23,14,0.08) 1.5px, transparent 1.6px)", backgroundSize: "14px 14px"}} />
  </AbsoluteFill>
);

// ---------- s01 title ----------
const Title: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = spring({frame: f - 6, fps, config: {damping: 11, stiffness: 120}});
  const s2 = spring({frame: f - 22, fps, config: {damping: 12}});
  const out = 1 - ease(f, 78, 90);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <PaperBg />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18}}>
        <div style={{fontFamily: comic, fontWeight: 700, fontSize: 40, color: INK, opacity: ease(f, 0, 10), letterSpacing: 3}}>LETTER 25 · ELDER NELSON</div>
        <div style={{transform: `scale(${s1}) rotate(-3deg)`, fontFamily: display, fontSize: 190, lineHeight: 0.95, color: RED, WebkitTextStroke: `5px ${INK}`, textShadow: `9px 9px 0 ${INK}`, textAlign: "center"}}>
          HOSPITAL<br />VAGABUNDOS
        </div>
        <div style={{transform: `translateY(${interpolate(s2, [0, 1], [40, 0])}px)`, opacity: s2, fontFamily: comic, fontWeight: 700, fontSize: 38, color: INK, background: YELLOW, border: `3px solid ${INK}`, padding: "6px 22px"}}>
          Rio Grande do Sul, Brasil · March 2026
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- s14 clock ----------
const Clock: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [12, dur - 30], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const hours = 22 + p * 8; // 10 PM -> 6 AM
  const h = hours % 24;
  const label = (() => {
    const tot = Math.round(h * 60) % 1440; const hh = Math.floor(tot / 60); const mm = tot % 60;
    const ap = hh >= 12 ? "PM" : "AM"; const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}:${String(mm).padStart(2, "0")} ${ap}`;
  })();
  const ang = (h % 12) * 30; const mang = ((h % 1) * 360);
  const night = 1 - p;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(20,24,60,${0.35 * night})`}} />
      <AbsoluteFill style={{background: `rgba(255,190,120,${0.22 * p})`}} />
      <div style={{position: "absolute", right: 70, top: 50, width: 360, height: 360, transform: "scale(0.95)", transformOrigin: "right top", borderRadius: "50%", background: "#fffaf0", border: `10px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`}}>
        {Array.from({length: 12}).map((_, i) => (
          <div key={i} style={{position: "absolute", left: 175, top: 14, width: 10, height: 30, background: INK, transformOrigin: "5px 166px", transform: `rotate(${i * 30}deg)`}} />
        ))}
        <div style={{position: "absolute", left: 172, top: 80, width: 16, height: 110, background: INK, borderRadius: 8, transformOrigin: "8px 100px", transform: `rotate(${ang}deg)`}} />
        <div style={{position: "absolute", left: 175, top: 40, width: 10, height: 150, background: RED, borderRadius: 5, transformOrigin: "5px 140px", transform: `rotate(${mang}deg)`}} />
        <div style={{position: "absolute", left: 165, top: 165, width: 30, height: 30, borderRadius: "50%", background: INK}} />
      </div>
      <div style={{position: "absolute", right: 450, top: 60, width: 380, textAlign: "right", fontFamily: display, fontSize: 92, color: YELLOW, WebkitTextStroke: `3px ${INK}`, textShadow: `5px 5px 0 ${INK}`}}>{label}</div>
      <Caption text="8 hours at the clinic" at={6} />
    </AbsoluteFill>
  );
};

// ---------- s15 24 hours badge ----------
const Badge24: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 40, fps, config: {damping: 8, stiffness: 180}});
  const items = ["NO SLEEP", "NO FOOD", "NO WATER"];
  return (
    <AbsoluteFill>
      <div style={{position: "absolute", left: 110, top: 90, transform: `scale(${s}) rotate(-8deg)`, width: 470, height: 470, borderRadius: "50%", background: YELLOW, border: `10px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        <div style={{fontFamily: display, fontSize: 200, lineHeight: 0.85, color: RED, WebkitTextStroke: `4px ${INK}`}}>24</div>
        <div style={{fontFamily: display, fontSize: 74, color: INK, letterSpacing: 4}}>HOURS</div>
        <div style={{fontFamily: comic, fontWeight: 700, fontSize: 34, color: INK, marginTop: 6}}>MILESTONE!</div>
      </div>
      {items.map((t, i) => {
        const si = spring({frame: f - 62 - i * 8, fps, config: {damping: 12}});
        return (
          <div key={t} style={{position: "absolute", left: 120, top: 660 + i * 100, opacity: si, transform: `translateX(${interpolate(si, [0, 1], [-60, 0])}px)`, fontFamily: display, fontSize: 70, color: "white", WebkitTextStroke: `3px ${INK}`, textShadow: `5px 5px 0 ${INK}`}}>
            <span style={{color: RED}}>✕</span> {t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- s16 day timeline ----------
const Timeline: React.FC<{dur: number}> = ({dur}) => {
  const dim = 0.72;
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stops = [
    {t: "5:30 AM", d: "Catch the bus", at: 0.06},
    {t: "10:00 PM", d: "Clinic run", at: 0.34},
    {t: "6:00 AM", d: "Next day: leave", at: 0.6},
    {t: "MIDDAY", d: "Sleep! Food! Water!", at: 0.8},
  ];
  const line = interpolate(f, [8, dur * 0.85], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(244,232,204,${dim})`}} />
      <div style={{position: "absolute", left: 330, right: 330, top: 520, height: 14, background: "rgba(36,23,14,0.2)", borderRadius: 7}} />
      <div style={{position: "absolute", left: 330, top: 520, height: 14, width: `${line * (1920 - 660)}px`, background: RED, borderRadius: 7, border: `2px solid ${INK}`}} />
      {stops.map((s, i) => {
        const x = 330 + (i / (stops.length - 1)) * (1920 - 660);
        const sp = spring({frame: f - s.at * dur, fps, config: {damping: 12, stiffness: 150}});
        return (
          <div key={s.t} style={{position: "absolute", left: x - 190, top: i % 2 ? 580 : 280, width: 380, textAlign: "center", transform: `scale(${sp})`}}>
            <div style={{fontFamily: display, fontSize: 70, color: YELLOW, WebkitTextStroke: `3px ${INK}`, textShadow: `5px 5px 0 ${INK}`}}>{s.t}</div>
            <div style={{fontFamily: comic, fontWeight: 700, fontSize: 42, color: INK, background: "white", border: `3px solid ${INK}`, padding: "8px 14px", marginTop: 8, boxShadow: `5px 5px 0 ${INK}`, whiteSpace: "nowrap"}}>{s.d}</div>
          </div>
        );
      })}
      {stops.map((s, i) => {
        const x = 330 + (i / (stops.length - 1)) * (1920 - 660);
        const sp = spring({frame: f - s.at * dur, fps, config: {damping: 10}});
        return <div key={"d" + i} style={{position: "absolute", left: x - 22, top: 505, width: 44, height: 44, borderRadius: "50%", background: YELLOW, border: `5px solid ${INK}`, transform: `scale(${sp})`}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- phone frame ----------
const Phone: React.FC<{children: React.ReactNode; enter?: number}> = ({children, enter = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - enter, fps, config: {damping: 15, stiffness: 120}});
  return (
    <div style={{position: "absolute", left: 1920 / 2 - 260, top: 60, width: 520, height: 960, transform: `translateY(${interpolate(s, [0, 1], [1100, 0])}px) rotate(${interpolate(s, [0, 1], [8, -2])}deg)`, background: "#1b1b1f", borderRadius: 64, border: `6px solid ${INK}`, boxShadow: `14px 14px 0 rgba(36,23,14,0.85)`, padding: 22}}>
      <div style={{width: "100%", height: "100%", borderRadius: 46, overflow: "hidden", background: "#f7f7f9", position: "relative"}}>{children}</div>
    </div>
  );
};

// ---------- s19 translate ----------
const Translate: React.FC = () => {
  const f = useCurrentFrame();
  const word = "vagabundos";
  const typed = word.slice(0, Math.max(0, Math.min(word.length, Math.floor((f - 26) / 3))));
  const showOut = ease(f, 26 + word.length * 3 + 8, 26 + word.length * 3 + 18);
  const thumbs = ease(f, 120, 132);
  return (
    <AbsoluteFill>
      <Phone>
        <div style={{background: "#3b6fd8", color: "white", fontFamily: ui, fontWeight: 800, fontSize: 34, padding: "70px 30px 26px"}}>Translate</div>
        <div style={{display: "flex", justifyContent: "space-between", padding: "18px 30px", fontFamily: ui, fontWeight: 800, fontSize: 26, color: "#3b6fd8", borderBottom: "2px solid #e3e3ea"}}><span>Portuguese</span><span>⇄</span><span>English</span></div>
        <div style={{padding: "34px 30px", fontFamily: ui, fontWeight: 600, fontSize: 54, color: "#222", minHeight: 150, borderBottom: "2px solid #e3e3ea"}}>{typed}<span style={{opacity: f % 16 < 8 ? 1 : 0, color: "#3b6fd8"}}>|</span></div>
        <div style={{padding: "34px 30px", fontFamily: ui, fontWeight: 800, fontSize: 64, color: "#3b6fd8", opacity: showOut}}>bums</div>
        <div style={{padding: "0 30px", fontFamily: ui, fontWeight: 600, fontSize: 26, color: "#888", opacity: showOut}}>noun · casual</div>
      </Phone>
      <div style={{position: "absolute", left: 1330, top: 110, fontSize: 150, opacity: thumbs, transform: `scale(${0.6 + 0.4 * thumbs}) rotate(-10deg)`}}>👍</div>
    </AbsoluteFill>
  );
};

// ---------- s20 punch-in + glitch ----------
const Punch: React.FC = () => {
  const f = useCurrentFrame();
  const hit = 14; // record scratch lands here (VO line starts ~0.6 s in)
  const z = interpolate(f, [hit - 2, hit + 4], [1, 1.32], {...clamp, easing: Easing.out(Easing.back(2))});
  const shake = f >= hit && f < hit + 10 ? Math.sin(f * 3.1) * 14 : 0;
  const glitch = f >= hit + 2 ? 1 : 0;
  const crack = ease(f, hit + 30, hit + 40);
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${z}) translate(${shake}px, ${-shake / 2}px)`, transformOrigin: "32% 0%"}}>
        <Img src={staticFile("img/s20.png")} style={{width: "100%", height: "100%", objectFit: "cover", filter: glitch ? `saturate(${1 + 0.6 * Math.abs(Math.sin(f))})` : undefined}} />
      </AbsoluteFill>
      {glitch ? (
        <div style={{position: "absolute", right: 70, top: 640, width: 560, padding: "26px 30px", background: "#f7f7f9", border: `5px solid ${INK}`, borderRadius: 24, boxShadow: `10px 10px 0 ${INK}`, transform: `rotate(4deg) translateX(${f % 6 < 3 ? 6 : -6}px)`}}>
          <div style={{fontFamily: ui, fontWeight: 800, fontSize: 36, color: "#444"}}>vagabundos =</div>
          <div style={{position: "relative", fontFamily: ui, fontWeight: 800, fontSize: 90, color: "#333"}}>
            <span style={{textDecoration: crack > 0.5 ? "line-through" : "none", textDecorationColor: RED, textDecorationThickness: 10}}>bums</span>
            <span style={{position: "absolute", left: 4, top: 0, color: RED, opacity: 0.5, transform: `translateX(${f % 4 < 2 ? 5 : -5}px)`}}>bums</span>
          </div>
          <div style={{fontFamily: display, fontSize: 64, color: RED, opacity: crack, WebkitTextStroke: `2px ${INK}`, marginTop: 8, transform: `scale(${0.7 + 0.3 * crack})`}}>TRANSLATION ERROR</div>
        </div>
      ) : null}
      <AbsoluteFill style={{background: "white", opacity: interpolate(f, [hit, hit + 3], [0.8, 0], clamp) * (f >= hit ? 1 : 0)}} />
    </AbsoluteFill>
  );
};

// ---------- s21 censored ----------
const Censored: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = Math.round(dur * 0.52);
  const b = spring({frame: f - at + 18, fps, config: {damping: 12}});
  const s = spring({frame: f - at, fps, config: {damping: 7, stiffness: 220}});
  return (
    <AbsoluteFill>
      <div style={{position: "absolute", right: 170, top: 170, transform: `scale(${b})`, transformOrigin: "left bottom", background: "white", border: `6px solid ${INK}`, borderRadius: 60, padding: "40px 60px", fontFamily: display, fontSize: 130, color: INK, boxShadow: `8px 8px 0 ${INK}`}}>#@$%&!<div style={{position: "absolute", left: -46, bottom: 30, width: 0, height: 0, borderTop: "26px solid transparent", borderBottom: "26px solid transparent", borderRight: `52px solid ${INK}`}} /></div>
      <div style={{position: "absolute", right: 150, top: 280, transform: `scale(${interpolate(s, [0, 1], [2.4, 1])}) rotate(-14deg)`, opacity: Math.min(1, s * 1.6), border: `12px solid ${RED}`, color: RED, fontFamily: display, fontSize: 150, padding: "4px 36px", borderRadius: 18, background: "rgba(255,255,255,0.82)", letterSpacing: 6}}>CENSORED</div>
    </AbsoluteFill>
  );
};

// ---------- s23 group chat ----------
const Chat: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const msgs = [
    {who: "Irmã Ana", t: "vagabundo!! kkk", me: false, at: 22},
    {who: "Pedro", t: "kkkkkkkk", me: false, at: 46},
    {who: "Lucas", t: "bom dia vagabundos ☀️", me: false, at: 72},
    {who: "", t: "😅🙏", me: true, at: 100},
    {who: "Irmão João", t: "vagabundos unidos!! 💪", me: false, at: 122},
  ];
  return (
    <AbsoluteFill>
      <Phone>
        <div style={{background: "#1f8a5b", color: "white", padding: "64px 28px 20px", display: "flex", alignItems: "center", gap: 18}}>
          <div style={{width: 64, height: 64, borderRadius: "50%", background: YELLOW, border: `3px solid white`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34}}>🛋️</div>
          <div>
            <div style={{fontFamily: ui, fontWeight: 800, fontSize: 36}}>vagabundos</div>
            <div style={{fontFamily: ui, fontWeight: 600, fontSize: 22, opacity: 0.85}}>6 participantes</div>
          </div>
        </div>
        <div style={{padding: "24px 22px", display: "flex", flexDirection: "column", gap: 16, background: "#ece5dd", height: "100%"}}>
          {msgs.map((m) => {
            const s = spring({frame: f - m.at, fps, config: {damping: 13, stiffness: 170}});
            return (
              <div key={m.t} style={{alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%", transform: `scale(${s})`, transformOrigin: m.me ? "right bottom" : "left bottom", background: m.me ? "#d9fdd3" : "white", borderRadius: 18, padding: "12px 18px", boxShadow: "0 2px 0 rgba(0,0,0,0.12)"}}>
                {m.who ? <div style={{fontFamily: ui, fontWeight: 800, fontSize: 22, color: "#1f8a5b"}}>{m.who}</div> : null}
                <div style={{fontFamily: ui, fontWeight: 600, fontSize: 36, color: "#222"}}>{m.t}</div>
              </div>
            );
          })}
        </div>
      </Phone>
    </AbsoluteFill>
  );
};

// ---------- end card ----------
const EndCard: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const start = dur - 110;
  const o = ease(f, start, start + 14);
  return (
    <AbsoluteFill style={{opacity: o}}>
      <PaperBg />
      <AbsoluteFill style={{alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20}}>
        <div style={{fontFamily: display, fontSize: 170, color: RED, WebkitTextStroke: `5px ${INK}`, textShadow: `9px 9px 0 ${INK}`, transform: "rotate(-3deg)"}}>TCHAU!</div>
        <div style={{fontFamily: comic, fontWeight: 700, fontSize: 52, color: INK}}>— Elder Nelson</div>
        <div style={{fontFamily: comic, fontWeight: 700, fontSize: 30, color: INK, opacity: 0.9, marginTop: 30, letterSpacing: 2}}>FROM HIS LETTER HOME · 24 MARCH 2026</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- overlays per shot ----------
const Overlay: React.FC<{id: string; dur: number}> = ({id, dur}) => {
  switch (id) {
    case "s01": return <Title />;
    case "s03": return <Caption text="Zone Conference" />;
    case "s05": return <Caption text="Capão da Canoa" />;
    case "s07": return <Caption text="Friday" />;
    case "s11": return <Caption text="The clinic · 10 PM" />;
    case "s14": return <Clock dur={dur} />;
    case "s15": return <Badge24 />;
    case "s16": return <Timeline dur={dur} />;
    case "s19": return <Translate />;
    case "s20": return <Punch />;
    case "s21": return <Censored dur={dur} />;
    case "s23": return <Chat />;
    case "s25": return <EndCard dur={dur} />;
    default: return null;
  }
};

// ---------- SFX cues (frame offsets inside a shot) ----------
const SFX: {shot: string; at: number; src: string; vol: number}[] = [
  {shot: "s01", at: 6, src: "sfx/whoosh.wav", vol: 0.5},
  {shot: "s15", at: 40, src: "sfx/pop.wav", vol: 0.55},
  {shot: "s19", at: 70, src: "sfx/ping2.wav", vol: 0.35},
  {shot: "s20", at: 14, src: "sfx/scratch.wav", vol: 0.75},
  {shot: "s23", at: 22, src: "sfx/ping.wav", vol: 0.4},
  {shot: "s23", at: 46, src: "sfx/ping.wav", vol: 0.4},
  {shot: "s23", at: 72, src: "sfx/ping.wav", vol: 0.4},
  {shot: "s23", at: 100, src: "sfx/ping2.wav", vol: 0.4},
  {shot: "s23", at: 122, src: "sfx/ping.wav", vol: 0.4},
];

const shotFrom = (id: string) => SHOTS.find((s) => s.id === id)!;

export const Film: React.FC = () => {
  const censorAt = (() => { const s = shotFrom("s21"); return s.from + Math.round(s.dur * 0.52); })();
  const scratchAt = shotFrom("s20").from + 14;
  const musicVol = (f: number) => {
    const base = interpolate(f, [0, 24, TOTAL - 72, TOTAL], [0, 0.34, 0.34, 0], clamp);
    // duck ~9 dB while a VO line plays, with 6-frame ramps
    const duck = VO.reduce((m, v) => Math.max(m, interpolate(f, [v.from - 6, v.from, v.from + v.dur, v.from + v.dur + 8], [0, 1, 1, 0], clamp)), 0);
    const drop = interpolate(f, [scratchAt - 2, scratchAt, scratchAt + 40, scratchAt + 60], [1, 0.03, 0.03, 1], clamp); // music cuts on the scratch
    return base * (1 - 0.65 * duck) * drop;
  };
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      {SHOTS.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur} name={s.id}>
          <Plate id={s.id} dur={s.dur} />
          <Overlay id={s.id} dur={s.dur} />
        </Sequence>
      ))}
      {VO.map((v) => (
        <Sequence key={"vo" + v.id} from={v.from} name={"vo " + v.id}>
          <Audio src={staticFile(`vo/${v.id}.wav`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map((x, i) => (
        <Sequence key={"sfx" + i} from={shotFrom(x.shot).from + x.at} durationInFrames={60}>
          <Audio src={staticFile(x.src)} volume={x.vol} />
        </Sequence>
      ))}
      <Sequence from={censorAt} durationInFrames={30}><Audio src={staticFile("sfx/stamp.wav")} volume={0.7} /></Sequence>
      <Audio src={staticFile("music/bed.wav")} volume={musicVol} />
    </AbsoluteFill>
  );
};
