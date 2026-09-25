// renderer/modes/motion.js — 行程模式渲染器
// 相向相遇 / 同向追及 / 背向相离，共用一条水平轨道
import { createEngine, buildTimeline } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, arrow, circle, dashedLine } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

export function render(canvas, anim) {
  const scene = anim.scene || {};
  const beats = Array.isArray(anim.beats) ? anim.beats : [{ id: 'b', duration: 5000 }];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 5000;

  const { a0, a1, b0, b1 } = scene;
  const minCoord = Math.min(a0, a1, b0, b1);
  const maxCoord = Math.max(a0, a1, b0, b1);
  const span = Math.max(1e-6, maxCoord - minCoord);
  const pad = span * 0.12;

  const engine = createEngine(canvas, { theme: 'dark' });

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index;
    const local = phase.local;

    // 运动进度 m：intro=0, move=ease, meet/eq=1
    let m = 0;
    if (idx === 0) m = 0;
    else if (idx === 1) m = engine.EASE.inOut(local);
    else m = 1;

    // —— 背景 ——
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#10183a'); bg.addColorStop(1, '#0d1228');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // —— 坐标映射 ——
    const marginL = Math.max(70, w * 0.12);
    const marginR = Math.max(70, w * 0.12);
    const roadW = w - marginL - marginR;
    const roadY = h * 0.46;
    const px = (v) => marginL + ((v - (minCoord - pad)) / (span + 2 * pad)) * roadW;

    // —— 图示层：轨道 + 刻度 ——
    const pictorialA = idx === 0 ? 0.3 : Math.min(1, 0.45 + idx * 0.25);
    ctx.save();
    ctx.globalAlpha = pictorialA;
    ctx.strokeStyle = 'rgba(143,164,219,.55)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(marginL - 20, roadY); ctx.lineTo(w - marginR + 20, roadY); ctx.stroke();
    ctx.fillStyle = themeColor('textDim', 'dark');
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    const stepT = Math.max(1, Math.round(span / 8));
    for (let v = Math.floor(minCoord - pad); v <= Math.ceil(maxCoord + pad); v += stepT) {
      const x = px(v);
      ctx.strokeStyle = 'rgba(143,164,219,.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, roadY - 6); ctx.lineTo(x, roadY + 6); ctx.stroke();
      ctx.fillText(String(v), x, roadY + 22);
    }
    ctx.restore();

    // —— 位置插值（全程同一身份，只改 x）——
    const ax = px(a0 + (a1 - a0) * m);
    const bx = px(b0 + (b1 - b0) * m);
    const done = m >= 1;

    // —— 相遇点标记（beat>=2）——
    if (idx >= 2) {
      const meetX = px(a1);
      ctx.save();
      ctx.globalAlpha = Math.min(1, (idx - 1) * 0.7);
      dashedLine(ctx, meetX, roadY - 74, meetX, roadY + 30, { color: '#2fd6a5', width: 2 });
      circle(ctx, meetX, roadY, 6, { fill: '#2fd6a5' });
      label(ctx, scene.meetPt || '相遇点', meetX, roadY - 86, { color: '#2fd6a5', font: 14 });
      ctx.restore();
    }

    // —— 两个运动对象（具象层，全程不消失）——
    const shrink = idx >= 3 ? 0.7 : 1;
    const size = 46 * shrink;
    ctx.save();
    ctx.globalAlpha = idx === 3 ? 0.55 : 1;
    label(ctx, scene.speedLabelA || '', ax, roadY - size - 26, { color: '#4f8cff', font: 13 });
    label(ctx, scene.speedLabelB || '', bx, roadY - size - 26, { color: '#f59e0b', font: 13 });
    ctx.restore();
    emoji(ctx, scene.actorA || '🚗', ax, roadY - size / 2 - 4, size);
    emoji(ctx, scene.actorB || '🚙', bx, roadY + size / 2 + 10, size);
    if (!done && idx === 1) {
      highlightPulse(ctx, ax, roadY - size / 2 - 4, size * 0.6, t, { color: '#4f8cff' });
      highlightPulse(ctx, bx, roadY + size / 2 + 10, size * 0.6, t, { color: '#f59e0b' });
    }

    // —— 抽象层：算式卡片（beat 3）——
    if (idx >= 3) {
      const a = Math.min(1, local * 1.2);
      ctx.save();
      ctx.globalAlpha = a;
      const eq = (anim.scenes || []).find(s => s.type === 'equation');
      if (eq) {
        const bw = Math.min(w * 0.82, 560), bh = 64;
        const bx0 = w / 2 - bw / 2, by0 = h * 0.15;
        ctx.fillStyle = 'rgba(22,29,58,.95)';
        ctx.strokeStyle = '#2fd6a5'; ctx.lineWidth = 2;
        roundRectPath(ctx, bx0, by0, bw, bh, 14);
        ctx.fill(); ctx.stroke();
        label(ctx, eq.text, w / 2, by0 + bh / 2, { color: '#2fd6a5', font: 22, weight: 'bold' });
      }
      ctx.globalAlpha = a;
      label(ctx, '＝ ' + (anim.answer || ''), w / 2, h * 0.15 + 104, { color: '#ffd76a', font: 26, weight: 'bold' });
      ctx.restore();
    }

    // —— 底部 stepCard + progressBar ——
    const beatLabel = beats[idx] ? beats[idx].label : '';
    const statusText = done && idx >= 2 ? ((anim.answer || '') + '  ✅') : beatLabel;
    stepCard(ctx, w, h, statusText, { color: done ? '#2fd6a5' : '#4f8cff' });
    progressBar(ctx, w, h, Math.min(t / totalMs, 1));
  });

  return engine;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
