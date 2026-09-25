// public/renderer/modes/function-graph.js — 函数图像族渲染器
// CPA：具象(行程/水温/投篮/相遇) → 图示(坐标系 + 函数曲线逐点连线 + 关键点) → 抽象(公式卡片)
import { createEngine, buildTimeline, EASE } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { label, axes, circle, roundRect, emoji } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

const CONCRETE_EMOJI = {
  concrete_travel: '🚗',
  concrete_temp: '🌡️',
  concrete_ball: '🏀',
  concrete_meet: '🚆',
};

export function render(canvas, anim) {
  const funcs = Array.isArray(anim.funcs) ? anim.funcs : [];
  const keyPoints = Array.isArray(anim.keyPoints) ? anim.keyPoints : [];
  const beats = Array.isArray(anim.beats) && anim.beats.length ? anim.beats : [
    { id: 'c', duration: 5000 }, { id: 'g', duration: 5000 }, { id: 'f', duration: 5000 },
  ];
  const timeline = buildTimeline(beats);
  const totalMs = timeline[timeline.length - 1].end + TOKENS.timing.holdMs;
  const engine = createEngine(canvas, { theme: 'dark' });

  // —— 计算数据范围（包住所有关键点，留白）——
  let xs = keyPoints.map(p => p.x), ys = keyPoints.map(p => p.y);
  funcs.forEach(f => {
    if (f.type === 'line') {
      xs.push(-5, 5); ys.push(f.k * -5 + f.b, f.k * 5 + f.b);
    } else if (f.type === 'parabola') {
      const h = -f.b / (2 * f.a);
      xs.push(h - 3, h + 3);
      ys.push(f.a * h * h + f.b * h + f.c, f.c);
    }
  });
  let xMin = Math.floor(Math.min(...xs)) - 1, xMax = Math.ceil(Math.max(...xs)) + 1;
  let yMin = Math.floor(Math.min(...ys)) - 1, yMax = Math.ceil(Math.max(...ys)) + 1;
  if (xMax - xMin < 6) { xMin -= 3; xMax += 3; }
  if (yMax - yMin < 6) { yMin -= 3; yMax += 3; }

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index;
    const reveal = EASE.inOut(phase.local);

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#101a3e'); bg.addColorStop(1, '#0d1228');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // 绘图盒
    const plotLeft = 56, plotTop = 44, plotRight = w - 28, plotBottom = h - 96;
    const boxW = plotRight - plotLeft, boxH = plotBottom - plotTop;

    // beat0 淡显坐标系，beat1/2 全显
    const axesAlpha = idx === 0 ? 0.25 : 1;
    ctx.save();
    ctx.globalAlpha = axesAlpha;
    const ax = axes(ctx, plotLeft, plotBottom, boxW, boxH, {
      xMin, xMax, yMin, yMax, xStep: 1, yStep: 1,
    });
    ctx.restore();

    // —— 画函数曲线（beat1 逐点 reveal，beat2 保留）——
    if (idx >= 1) {
      const curveAlpha = idx === 1 ? (0.3 + 0.7 * reveal) : 0.95;
      funcs.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = curveAlpha;
        ctx.strokeStyle = f.color || '#4f8cff';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        ctx.beginPath();
        if (f.type === 'line') {
          const span = reveal;
          const ex = xMin + (xMax - xMin) * span;
          const [x0, y0] = ax.toPx(xMin, f.k * xMin + f.b);
          const [exx, eyy] = ax.toPx(ex, f.k * ex + f.b);
          ctx.moveTo(x0, y0);
          ctx.lineTo(exx, eyy);
          ctx.stroke();
        } else if (f.type === 'parabola') {
          const N = 80;
          const total = Math.max(2, Math.floor(N * reveal));
          for (let i = 0; i <= total; i++) {
            const xv = xMin + (xMax - xMin) * (i / N);
            const yv = f.a * xv * xv + f.b * xv + f.c;
            const [px, py] = ax.toPx(xv, yv);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        ctx.restore();
      });

      // —— 关键点 ——
      keyPoints.forEach((p, i) => {
        const fade = idx === 1 ? Math.max(0, reveal - 0.4) / 0.6 : 1;
        if (fade <= 0) return;
        ctx.save();
        ctx.globalAlpha = fade;
        const [px, py] = ax.toPx(p.x, p.y);
        circle(ctx, px, py, 6, { fill: '#f59e0b', stroke: '#fff', width: 2 });
        label(ctx, p.label || '', px, py - 16, { font: 12, color: '#ffe0a3', weight: '600' });
        if (i === 0 && idx >= 1) highlightPulse(ctx, px, py, 12, t, { color: '#f59e0b' });
        ctx.restore();
      });
    }

    // —— 具象层（beat0 大 emoji）——
    if (idx === 0) {
      const hint = anim.scenes && anim.scenes[0] && anim.scenes[0].hint;
      const e = CONCRETE_EMOJI[hint] || '📈';
      const bob = Math.sin(t / 500) * 6;
      emoji(ctx, e, w / 2, h * 0.45 + bob, 90);
      label(ctx, 'x → time / x → 时间', w / 2, h * 0.45 + 80, { font: 14, color: '#8fa4db' });
    }

    // —— 公式层（beat2）——
    if (idx === 2) {
      const pw = Math.min(w * 0.9, 660), ph = 60;
      const px = w / 2 - pw / 2, py = plotBottom + 14;
      ctx.save();
      ctx.globalAlpha = Math.min(1, reveal * 1.5);
      ctx.fillStyle = 'rgba(20,28,60,.92)';
      roundRect(ctx, px, py, pw, ph, 12);
      label(ctx, anim.formula || '', w / 2, py + ph / 2 - 8, { font: 15, color: '#2fd6a5', weight: '600' });
      label(ctx, '= ' + (anim.answer || ''), w / 2, py - 16, { font: 20, color: '#f59e0b', weight: '700' });
      ctx.restore();
    }

    // stepCard + progress
    const beatLabel = (beats[idx] && beats[idx].label) || '';
    stepCard(ctx, w, h, idx === 2 ? (anim.answer || beatLabel) : beatLabel, { color: idx === 2 ? '#2fd6a5' : '#4f8cff' });
    const prog = Math.min(t / (timeline[timeline.length - 1].end + TOKENS.timing.holdMs), 1);
    progressBar(ctx, w, h, prog);
  });

  return engine;
}
