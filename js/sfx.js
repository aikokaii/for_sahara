let ctx, out, noise;

function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state !== "running") ctx.resume().catch(() => {});
}
["pointerdown", "touchend", "keydown"].forEach(ev => addEventListener(ev, unlock, { capture: true, passive: true }));

function env(g, t, peak, attack, release) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
}

function tone(type, f0, f1, t, dur, peak, attack = 0.01) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + attack + dur);
  env(g, t, peak, attack, dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + attack + dur + 0.05);
}

function hiss(t, dur, peak, type, f0, f1, q = 1, attack = 0.005) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise;
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + attack + dur);
  env(g, t, peak, attack, dur);
  s.connect(f).connect(g).connect(out);
  s.start(t);
  s.stop(t + attack + dur + 0.05);
}

const SOUNDS = {
  pop(t) {
    hiss(t, 0.18, 0.9, "highpass", 900, 0, 0.7, 0.002);
    tone("sine", 180, 50, t, 0.12, 0.7, 0.002);
  },
  squeak(t) {
    tone("triangle", 520 + Math.random() * 80, 820, t, 0.12, 0.18);
  },
  whoosh(t) {
    hiss(t, 0.4, 0.35, "bandpass", 2200, 500, 0.9, 0.06);
  },
  chime(t) {
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone("sine", f, 0, t + i * 0.07, 0.6, 0.16, 0.005));
  },
  click(t) {
    hiss(t, 0.02, 0.5, "highpass", 2500, 0, 0.7, 0.001);
    tone("square", 140, 60, t, 0.03, 0.12, 0.001);
  },
  zip(t) {
    tone("sine", 380, 1300, t, 0.16, 0.15);
  },
};

export function play(name) {
  if (!ctx || ctx.state !== "running" || (window.BdayMusic && window.BdayMusic.audio.muted)) return;
  try { SOUNDS[name](ctx.currentTime); } catch {}
}

export function buzz(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}
