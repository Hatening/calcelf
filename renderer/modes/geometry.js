// public/renderer/modes/geometry.js — 几何族渲染器
// CPA：具象(真实场景 emoji) → 图示(Canvas path 多边形 + 边长/角度标注) → 抽象(公式卡片)
import { createEngine, buildTimeline, EASE } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { label, arrow, dashedLine, circle, roundRect, emoji } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

const CONCRETE_EMOJI = {
  concrete_fence: '🚧',
  concrete_tiles: '🧱',
  concrete_sandbox: '🏠',
  concrete_wheel: '🎡',
  concrete_pie: '🥧',
  concrete_clock: '⏰',
  concrete_ladder: '🪜',
};

export function render(canvas, anim) {
  const shape = (anim.shape) || { kind: 'rect', w: 4, h: 3 };
  const beats = Array.isArray(anim.beats) && anim.beats.length ? anim.beats : [
    { id: 'c', duration: 5000 }, { id: 's', duration: 5000 }, { id: 'f', duration: 5000 },
  ];
  const timeline = buildTimeline(beats);
  const totalMs = timeline[timeline.length - 1].end + TOKENS.timing.holdMs;
  const engine = createEngine(canvas, { theme: 'dark' });

  const BLUE = '#4f8cff', ORANGE = '#f59e0b', GREEN = '#2fd6a5', PURPLE = '#8a8ffc';

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index;
    const local = phase.local;
    const reveal = EASE.inOut(local);

    // —— 背景 ——
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#131a3a'); bg.addColorStop(1, '#0d1228');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h * 0.42;
    const maxPix = Math.min(w, h) * 0.46;

    // 选择比例尺：让形状自适应
    let dims = [];
    if (shape.kind === 'rect' || shape.kind === 'square') {
      dims = [shape.w || shape.s || 4, shape.h || shape.s || 3];
    } else if (shape.kind === 'triangle') {
      dims = [shape.base || 4, shape.height || 3];
    } else if (shape.kind === 'circle') {
      dims = [(shape.r || 2) * 2];
    } else if (shape.kind === 'righttri') {
      dims = [shape.b || 3, shape.a || 4];
    } else if (shape.kind === 'triangle_angle' || shape.kind === 'angle_pair') {
      dims = [4, 3];
    }
    const maxDim = Math.max(...dims, 1);
    const s = maxPix / maxDim;

    // 形状在 beat0 淡显，beat1 全显，beat2 压暗让公式突出
    let shapeAlpha = 0.18;
    if (idx === 1) shapeAlpha = 0.25 + 0.75 * reveal;
    else if (idx === 2) shapeAlpha = 0.4;

    ctx.save();
    ctx.globalAlpha = shapeAlpha;
    drawShape(ctx, shape, cx, cy, s, { BLUE, ORANGE, GREEN, PURPLE, t, reveal, idx });
    ctx.restore();

    // —— 具象层（beat0 大 emoji + 说明）——
    if (idx === 0) {
      const hint = anim.scenes && anim.scenes[0] && anim.scenes[0].hint;
      const e = CONCRETE_EMOJI[hint] || '📐';
      const bob = Math.sin(t / 500) * 6;
      emoji(ctx, e, cx, cy - 10 + bob, 96);
    }

    // —— 公式层（beat2）——
    if (idx === 2) {
      const pw = Math.min(w * 0.86, 640);
      const ph = 70;
      const px = cx - pw / 2;
      const py = cy + maxPix * 0.55;
      ctx.save();
      ctx.globalAlpha = Math.min(1, reveal * 1.5);
      ctx.fillStyle = 'rgba(20,28,60,.94)';
      roundRect(ctx, px, py, pw, ph, 14);
      ctx.strokeStyle = GREEN; ctx.lineWidth = 2;
      ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
      label(ctx, anim.formula || '', cx, py + ph / 2, { font: 18, color: GREEN, weight: '600' });
      label(ctx, '= ' + (anim.answer || ''), cx, py - 26, { font: 22, color: ORANGE, weight: '700' });
      ctx.restore();
    }

    // —— 底部 stepCard + 进度条 ——
    const beatLabel = (beats[idx] && beats[idx].label) || '';
    const statusText = idx === 2 ? (anim.answer || beatLabel) : beatLabel;
    stepCard(ctx, w, h, statusText, { color: idx === 2 ? GREEN : BLUE });
    const prog = Math.min(t / (timeline[timeline.length - 1].end + TOKENS.timing.holdMs), 1);
    progressBar(ctx, w, h, prog);
  });

  return engine;
}

function drawShape(ctx, shape, cx, cy, s, c) {
  const { BLUE, ORANGE, GREEN, PURPLE, t, reveal } = c;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (shape.kind === 'rect' || shape.kind === 'square') {
    const w = (shape.w || shape.s || 4) * s;
    const h = (shape.h || shape.s || 3) * s;
    const x = cx - w / 2, y = cy - h / 2;
    if (shape.measure === 'area') {
      ctx.fillStyle = 'rgba(79,140,255,.28)';
      ctx.fillRect(x, y, w, h);
    }
    ctx.strokeStyle = BLUE; ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    label(ctx, fmt(shape.w || shape.s), cx, y + h + 18, { font: 13, color: '#cdd8ff' });
    label(ctx, fmt(shape.h || shape.s), x - 24, cy, { font: 13, color: '#cdd8ff', align: 'right' });
    if (shape.measure === 'perimeter') {
      const perim = 2 * (w + h);
      const d = (reveal * perim) % perim;
      let px, py;
      if (d < w) { px = x + d; py = y; }
      else if (d < w + h) { px = x + w; py = y + (d - w); }
      else if (d < 2 * w + h) { px = x + w - (d - w - h); py = y + h; }
      else { px = x; py = y + h - (d - 2 * w - h); }
      highlightPulse(ctx, px, py, 10, t, { color: ORANGE });
    }
    return;
  }

  if (shape.kind === 'triangle') {
    const a = (shape.base || 4) * s;
    const h = (shape.height || 3) * s;
    const x1 = cx - a / 2, y1 = cy + h / 2;
    const x2 = cx + a / 2, y2 = cy + h / 2;
    const xt = cx, yt = cy - h / 2;
    ctx.fillStyle = 'rgba(245,158,11,.22)';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(xt, yt); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = ORANGE; ctx.lineWidth = 4;
    ctx.stroke();
    dashedLine(ctx, xt, yt, xt, y1, { color: '#8fa4db', width: 2 });
    label(ctx, fmt(shape.base), cx, y1 + 18, { font: 13, color: '#cdd8ff' });
    label(ctx, fmt(shape.height), xt + 26, (yt + y1) / 2, { font: 13, color: '#cdd8ff', align: 'left' });
    return;
  }

  if (shape.kind === 'circle') {
    const r = (shape.r || 2) * s;
    if (shape.measure === 'area') {
      circle(ctx, cx, cy, r, { fill: 'rgba(47,214,165,.22)' });
    }
    ctx.strokeStyle = GREEN; ctx.lineWidth = 4;
    circle(ctx, cx, cy, r, { stroke: GREEN, width: 4 });
    dashedLine(ctx, cx, cy, cx + r, cy, { color: '#cdd8ff', width: 2 });
    circle(ctx, cx, cy, 4, { fill: '#eeeefb' });
    label(ctx, 'r=' + fmt(shape.r), cx + r / 2, cy - 12, { font: 13, color: '#cdd8ff' });
    return;
  }

  if (shape.kind === 'righttri') {
    const a = (shape.a || 3) * s;
    const b = (shape.b || 4) * s;
    const ox = cx - b / 2, oy = cy + a / 2;
    ctx.strokeStyle = PURPLE; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ox, oy); ctx.lineTo(ox + b, oy); ctx.lineTo(ox, oy - a); ctx.closePath();
    ctx.stroke();
    const rs = 12;
    ctx.strokeStyle = '#cdd8ff'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + rs, oy); ctx.lineTo(ox + rs, oy - rs); ctx.lineTo(ox, oy - rs); ctx.stroke();
    label(ctx, fmt(shape.b), ox + b / 2, oy + 18, { font: 13, color: '#cdd8ff' });
    label(ctx, fmt(shape.a), ox - 26, oy - a / 2, { font: 13, color: '#cdd8ff', align: 'right' });
    const mx = ox + b / 2, my = oy - a / 2;
    highlightPulse(ctx, mx - 6, my - 6, 14, t, { color: ORANGE });
    label(ctx, 'c≈' + fmt(shape.c), mx + 16, my - 10, { font: 14, color: ORANGE, align: 'left', weight: '600' });
    return;
  }

  if (shape.kind === 'triangle_angle') {
    const a = 4 * s;
    const x1 = cx - a / 2, y1 = cy + a / 2;
    const x2 = cx + a / 2, y2 = cy + a / 2;
    const xt = cx - 0.2 * a, yt = cy - a / 2;
    ctx.strokeStyle = BLUE; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(xt, yt); ctx.closePath(); ctx.stroke();
    const angs = shape.angles || [];
    label(ctx, angs[0] + '°', x1 + 26, y1 - 16, { font: 14, color: '#cdd8ff' });
    label(ctx, angs[1] + '°', x2 - 26, y2 - 16, { font: 14, color: '#cdd8ff' });
    label(ctx, '? = ' + (angs[2] != null ? angs[2] + '°' : ''), xt, yt - 20, { font: 16, color: ORANGE, weight: '700' });
    return;
  }

  if (shape.kind === 'angle_pair') {
    const L = 3.2 * s;
    const vx = cx, vy = cy + 40;
    if (shape.straight) {
      ctx.strokeStyle = BLUE; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(vx - L, vy); ctx.lineTo(vx + L, vy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx - L * 0.7, vy - L * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + L * 0.7, vy - L * 0.55); ctx.stroke();
      arcDeg(ctx, vx, vy, 46, 180, 0, ORANGE);
      label(ctx, shape.a + '°', vx - L * 0.4, vy - L * 0.55 - 16, { font: 14, color: '#cdd8ff' });
      label(ctx, '?=' + shape.b + '°', vx + L * 0.4, vy - L * 0.55 - 16, { font: 15, color: ORANGE, weight: '700' });
    } else {
      ctx.strokeStyle = BLUE; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + L, vy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx, vy - L); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + L * 0.6, vy - L * 0.8); ctx.stroke();
      ctx.strokeStyle = '#cdd8ff'; ctx.lineWidth = 2;
      ctx.strokeRect(vx, vy - 14, 14, 14);
      label(ctx, shape.a + '°', vx + L * 0.45, vy - 12, { font: 14, color: '#cdd8ff' });
      label(ctx, '?=' + shape.b + '°', vx + 18, vy - L * 0.45, { font: 15, color: ORANGE, weight: '700' });
    }
    return;
  }
}

function arcDeg(ctx, cx, cy, r, a0, a1, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, a0 * Math.PI / 180, a1 * Math.PI / 180, false);
  ctx.stroke();
  ctx.restore();
}

function fmt(x) {
  if (typeof x !== 'number') return x;
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? '0' : String(r);
}
