// renderer/core/engine.js — 引擎层：画布 / DPR / resize / 动画循环 / 时间轴 / 缓动 / 场景调度
// 所有模式共用，只写一次。模式只注册 draw(phase, ctx, W, H, t) 即可。
import { TOKENS } from './design-tokens.js';

export const EASE = {
  linear: x => x,
  inOut: x => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2,
  out: x => 1 - Math.pow(1-x, 3),
  in: x => x*x*x,
  elastic: x => {
    if (x === 0 || x === 1) return x;
    return Math.pow(2, -10*x) * Math.sin((x*10 - 0.75)*(2*Math.PI/3)) + 1;
  },
  bounce: x => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1/d1) return n1*x*x;
    if (x < 2/d1) return n1*(x -= 1.5/d1)*x + 0.75;
    if (x < 2.5/d1) return n1*(x -= 2.25/d1)*x + 0.9375;
    return n1*(x -= 2.625/d1)*x + 0.984375;
  },
};

// 时间轴：把多拍(beat)展开为绝对毫秒，每拍默认 beatMs，支持单拍自定义时长
export function buildTimeline(beats) {
  // beats: [{ id, duration?, label? }]
  const arr = Array.isArray(beats) ? beats : [];
  let cursor = 0;
  return arr.map(b => {
    const dur = b.duration || TOKENS.timing.beatMs;
    const seg = { id: b.id, label: b.label || '', start: cursor, duration: dur, end: cursor + dur };
    cursor += dur;
    return seg;
  });
}

export function phaseAt(timeline, t) {
  // 返回 { index, seg, local(0..1), done }
  if (!timeline.length) return { index: 0, seg: null, local: 0, done: true };
  const total = timeline[timeline.length - 1].end;
  if (t >= total) return { index: timeline.length - 1, seg: timeline[timeline.length - 1], local: 1, done: true };
  for (let i = 0; i < timeline.length; i++) {
    const s = timeline[i];
    if (t < s.end) return { index: i, seg: s, local: Math.max(0, (t - s.start) / s.duration), done: false };
  }
  return { index: timeline.length - 1, seg: timeline[timeline.length - 1], local: 1, done: true };
}

export function createEngine(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let raf = null;
  let t0 = 0;
  let total = 0;
  let paused = false;
  let pauseT = 0;
  const theme = opts.theme || 'dark';
  const onPhase = opts.onPhase || (() => {});
  let lastPhaseIdx = -1;

  function resize() {
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 400;
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  function W() { return canvas.clientWidth || 600; }
  function H() { return canvas.clientHeight || 400; }

  function clear() {
    ctx.clearRect(0, 0, W(), H());
  }

  function play(duration, drawFn) {
    total = duration;
    cancelAnimationFrame(raf);
    t0 = performance.now();
    paused = false;
    const loop = () => {
      if (paused) { raf = requestAnimationFrame(loop); return; }
      const t = performance.now() - t0 - pauseT;
      const p = Math.min(t / total, 1);
      clear();
      drawFn({ ctx, W, H, t, p, ease: EASE.inOut, theme });
      if (p < 1) raf = requestAnimationFrame(loop);
      else if (opts.onEnd) opts.onEnd();
    };
    raf = requestAnimationFrame(loop);
  }

  // 带时间轴的播放：自动计算总时长，每拍切换时回调
  function playTimeline(timeline, drawFn) {
    const segs = Array.isArray(timeline) ? timeline : buildTimeline(timeline);
    const totalMs = segs.length ? segs[segs.length - 1].end + TOKENS.timing.holdMs : TOKENS.timing.beatMs;
    lastPhaseIdx = -1;
    play(totalMs, (env) => {
      const ph = phaseAt(segs, env.t);
      if (ph.index !== lastPhaseIdx) { lastPhaseIdx = ph.index; onPhase(ph); }
      drawFn(Object.assign({}, env, { phase: ph, timeline: segs }));
    });
  }

  function pause() { paused = true; pauseT = performance.now() - t0; }
  function resume() { if (paused) { t0 = performance.now() - pauseT; paused = false; } }
  function stop() { cancelAnimationFrame(raf); clear(); }
  function destroy() { cancelAnimationFrame(raf); ro.disconnect(); }

  return { play, playTimeline, pause, resume, stop, destroy, W, H, ctx, ease: EASE.inOut, EASE, resize, theme };
}
