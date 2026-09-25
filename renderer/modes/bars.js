// renderer/modes/bars.js — 条形模型(tape model)渲染器
// 分数求部分 / 百分比 / 和倍问题
import { createEngine, buildTimeline } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, bar, circle } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';
import { t as i18n, langOf } from '../core/i18n.js';

export function render(canvas, anim) {
  const scene = anim.scene || {};
  const lang = langOf(anim);
  const isZh = lang.indexOf('zh') === 0;
  const beats = Array.isArray(anim.beats) ? anim.beats : [{ id: 'b', duration: 5000 }];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 5000;
  const engine = createEngine(canvas, { theme: 'dark' });
  const mode = scene.mode;

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index;
    const local = phase.local;

    ctx.fillStyle = '#0d1228'; ctx.fillRect(0, 0, w, h);

    const barW = Math.min(w * 0.78, 620);
    const barX = w / 2 - barW / 2;
    const barH = 46;

    // —— 具象层：实物排列（前 1 拍）——
    if (scene.object) {
      const concreteA = idx === 0 ? 1 : Math.max(0, 0.4 - idx * 0.15);
      if (concreteA > 0.02) {
        ctx.save(); ctx.globalAlpha = concreteA;
        const n = Math.min(Number(scene.total) || 1, 12);
        const gap = Math.min(46, (barW) / n);
        const startX = w / 2 - (n - 1) * gap / 2;
        for (let i = 0; i < n; i++) {
          emoji(ctx, scene.object, startX + i * gap, h * 0.4, 34);
        }
        ctx.restore();
      }
    }

    // —— 图示层：tape bar ——
    if (mode === 'fraction') {
      const { den, num, total, part } = scene;
      const barY = h * 0.42;
      // 整根条
      bar(ctx, barX, barY, barW, barH, { color: 'rgba(79,140,255,.25)', radius: 10 });
      // 高亮 num/den（idx>=3 淡入）
      const hl = idx >= 3 ? Math.min(1, local * 1.3) : (idx >= 2 ? 0 : 0);
      const segW = barW / den;
      if (hl > 0.01) {
        bar(ctx, barX, barY, segW * num * hl, barH, { color: '#f59e0b', radius: 10 });
      }
      // 分割线（idx>=2）
      if (idx >= 2) {
        ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
        for (let i = 1; i < den; i++) {
          const x = barX + segW * i;
          ctx.beginPath(); ctx.moveTo(x, barY); ctx.lineTo(x, barY + barH); ctx.stroke();
        }
        ctx.restore();
      }
      // 标签
      label(ctx, i18n(lang, 'unit1') + ' = ' + total, barX + barW + 10, barY + barH / 2, { color: '#8fa4db', font: 13, align: 'left' });
      if (idx >= 3) {
        label(ctx, `${num}/${den} = ${part}`, barX + segW * num / 2, barY - 20, { color: '#f59e0b', font: 16, weight: 'bold' });
        highlightPulse(ctx, barX + segW * num / 2, barY + barH / 2, segW * num / 2, t, { color: '#f59e0b' });
      }
    } else if (mode === 'percent') {
      const { pct, total, part } = scene;
      const barY = h * 0.42;
      bar(ctx, barX, barY, barW, barH, { color: 'rgba(79,140,255,.25)', radius: 10 });
      const hl = idx >= 2 ? Math.min(1, local * 1.3) : 0;
      if (hl > 0.01) {
        bar(ctx, barX, barY, barW * (pct / 100) * hl, barH, { color: '#f59e0b', radius: 10 });
      }
      label(ctx, `100% = ${total}`, barX + barW + 10, barY + barH / 2, { color: '#8fa4db', font: 13, align: 'left' });
      if (idx >= 2) {
        label(ctx, `${pct}% = ${part}`, barX + barW * (pct / 100) / 2, barY - 20, { color: '#f59e0b', font: 16, weight: 'bold' });
      }
    } else if (mode === 'multiple') {
      const { sum, k, unitVal } = scene;
      const unitW = barW / (k + 1);
      const y1 = h * 0.36; // 乙
      const y2 = h * 0.46; // 甲
      // 乙 = 1 份
      bar(ctx, barX, y1, unitW, barH, { color: '#4f8cff', radius: 8 });
      const labelB = isZh ? '乙(1份)' : 'B(1)';
      const labelA = isZh ? `甲(${k}份)` : `A(${k})`;
      const labelOne = isZh ? `1份 = ${unitVal}` : `1 = ${unitVal}`;
      label(ctx, labelB, barX + unitW / 2, y1 - 16, { color: '#4f8cff', font: 13 });
      // 甲 = k 份
      bar(ctx, barX, y2, unitW * k, barH, { color: '#f59e0b', radius: 8 });
      label(ctx, labelA, barX + unitW * k / 2, y2 + barH + 20, { color: '#f59e0b', font: 13 });
      // 分割 k 份
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5;
      for (let i = 1; i < k; i++) {
        const x = barX + unitW * i;
        ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x, y2 + barH); ctx.stroke();
      }
      ctx.restore();
      if (idx >= 2) {
        highlightPulse(ctx, barX + unitW / 2, y1 + barH / 2, unitW / 2, t, { color: '#4f8cff' });
        label(ctx, labelOne, barX + unitW / 2, y1 - 40, { color: '#2fd6a5', font: 16, weight: 'bold' });
      }
    }

    // —— 抽象层：算式（最后一拍）——
    const lastIdx = beats.length - 1;
    if (idx >= lastIdx) {
      ctx.save(); ctx.globalAlpha = Math.min(1, local * 1.2);
      const eq = (anim.scenes || []).find(s => s.type === 'equation');
      if (eq) label(ctx, eq.text, w / 2, h * 0.15, { color: '#2fd6a5', font: 24, weight: 'bold' });
      label(ctx, '＝ ' + (anim.answer || ''), w / 2, h * 0.15 + 44, { color: '#ffd76a', font: 24, weight: 'bold' });
      ctx.restore();
    }

    const beatLabel = beats[idx] ? beats[idx].label : '';
    stepCard(ctx, w, h, beatLabel, { color: '#4f8cff' });
    progressBar(ctx, w, h, Math.min(t / totalMs, 1));
  });

  return engine;
}
