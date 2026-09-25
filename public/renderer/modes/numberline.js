// renderer/modes/numberline.js — 数轴模式渲染器
// 整数加减跳跃 / 分数比较
import { createEngine, buildTimeline } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, numberLine, circle, arrow } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

export function render(canvas, anim) {
  const scene = anim.scene || {};
  const beats = Array.isArray(anim.beats) ? anim.beats : [{ id: 'b', duration: 5000 }];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 5000;

  const engine = createEngine(canvas, { theme: 'dark' });
  const isFrac = scene.mode === 'fractionCompare';

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index;
    const local = phase.local;

    ctx.fillStyle = '#0d1228'; ctx.fillRect(0, 0, w, h);

    const nlY = h * 0.44;
    const marginL = Math.max(60, w * 0.1);
    const marginR = Math.max(60, w * 0.1);
    const nlLen = w - marginL - marginR;

    if (!isFrac) {
      const { start, end, min, max, actor } = scene;
      const nl = numberLine(ctx, marginL, nlY, nlLen, { min, max, step: Math.max(1, Math.round((max - min) / 10)) });
      const sxp = nl.toPx(start), exp = nl.toPx(end);

      let m = 0;
      if (idx === 0) m = 0;
      else if (idx === 1) m = engine.EASE.inOut(local);
      else m = 1;

      label(ctx, String(start), sxp, nlY + 40, { color: '#8fa4db', font: 13 });
      if (idx >= 2) label(ctx, String(end), exp, nlY + 40, { color: '#2fd6a5', font: 16, weight: 'bold' });

      // 跳跃弧线
      if (idx === 1) {
        const arcH = 60 * Math.sin(m * Math.PI);
        ctx.save();
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(sxp, nlY - 12);
        ctx.quadraticCurveTo((sxp + exp) / 2, nlY - 12 - arcH - 30, exp, nlY - 12);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        arrow(ctx, sxp + (exp - sxp) * 0.5 - (exp > sxp ? 18 : -18), nlY - 12 - arcH - 44,
          sxp + (exp - sxp) * 0.5 + (exp > sxp ? 18 : -18), nlY - 12 - arcH - 44, { color: '#f59e0b' });
      }

      const curX = sxp + (exp - sxp) * m;
      const arcH = idx === 1 ? 60 * Math.sin(m * Math.PI) : 0;
      const ay = nlY - 18 - arcH;
      emoji(ctx, actor || '🐸', curX, ay, 44);
      if (idx === 1) highlightPulse(ctx, curX, ay, 26, t, { color: '#f59e0b' });
      if (idx >= 2) circle(ctx, exp, nlY, 7, { fill: '#2fd6a5' });

      if (idx >= 3) {
        ctx.save(); ctx.globalAlpha = Math.min(1, local * 1.2);
        const eq = (anim.scenes || []).find(s => s.type === 'equation');
        if (eq) label(ctx, eq.text, w / 2, h * 0.16, { color: '#2fd6a5', font: 26, weight: 'bold' });
        label(ctx, '＝ ' + (anim.answer || ''), w / 2, h * 0.16 + 46, { color: '#ffd76a', font: 24, weight: 'bold' });
        ctx.restore();
      }
    } else {
      const nl = numberLine(ctx, marginL, nlY, nlLen, { min: 0, max: 1, step: 0.2, labels: false });
      label(ctx, '0', marginL, nlY + 22, { color: '#8fa4db', font: 13 });
      label(ctx, '1', marginL + nlLen, nlY + 22, { color: '#8fa4db', font: 13 });

      const fracs = (anim.scenes || []).find(s => s.type === 'numberline')?.fractions || [];
      fracs.forEach((f, i) => {
        if (idx < i) return;
        const fx = nl.toPx(f.v);
        const big = idx >= 2 && anim.answer && anim.answer.startsWith(f.label);
        circle(ctx, fx, nlY, big ? 9 : 6, { fill: big ? '#2fd6a5' : (i === 0 ? '#4f8cff' : '#f59e0b') });
        label(ctx, f.label, fx, nlY - (i === 0 ? 34 : 62), { color: big ? '#2fd6a5' : (i === 0 ? '#4f8cff' : '#f59e0b'), font: 16, weight: big ? 'bold' : '' });
      });

      if (idx >= 3) {
        ctx.save(); ctx.globalAlpha = Math.min(1, local * 1.2);
        label(ctx, anim.answer || '', w / 2, h * 0.16, { color: '#ffd76a', font: 26, weight: 'bold' });
        ctx.restore();
      }
    }

    const beatLabel = beats[idx] ? beats[idx].label : '';
    stepCard(ctx, w, h, beatLabel, { color: '#4f8cff' });
    progressBar(ctx, w, h, Math.min(t / totalMs, 1));
  });

  return engine;
}
