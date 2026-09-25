// renderer/modes/grid.js — 阵列 / 乘法入门 / 面积入门 模式渲染器
// CPA：具象(真实物体/方块按行列排开) → 图示(点阵/方格，逐行高亮跳数) → 抽象(乘法算式/面积公式)
import { createEngine, buildTimeline, phaseAt, EASE } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, roundRect, circle, dashedLine } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

export function render(canvas, anim) {
  const rows = Number(anim.rows) || 3;
  const cols = Number(anim.cols) || 4;
  const product = Number(anim.product) || rows * cols;
  const mode = anim.mode || 'multiply';
  const actor = anim.actor || { emoji: '🍎' };
  const formula = anim.formula || `${rows} × ${cols} = ${product}`;
  const i18n = anim.i18n || {};

  const beats = Array.isArray(anim.beats) && anim.beats.length
    ? anim.beats
    : [
        { id: 'concrete', duration: 5000, label: '' },
        { id: 'pictorial', duration: 5000, label: '' },
        { id: 'abstract', duration: 5000, label: '' },
      ];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 15000;

  const engine = createEngine(canvas, { theme: 'dark' });

  engine.play(totalMs, ({ ctx, W, H, t }) => {
    const w = W(), h = H();
    const ph = phaseAt(timeline, t);
    const idx = Math.min(ph.index, beats.length - 1);
    const local = EASE.inOut(ph.local);
    const beatId = beats[idx].id;

    // —— 背景 ——
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#10163a'); bg.addColorStop(1, '#0d1228');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    // —— 几何布局：居中于上 2/3 区域 ——
    const top = h * 0.16, bottom = h * 0.80;
    const availW = w * 0.74, availH = (bottom - top);
    const spacing = Math.max(28, Math.min(availW / cols, availH / rows, 70));
    const gridW = (cols - 1) * spacing;
    const gridH = (rows - 1) * spacing;
    const ox = w / 2 - gridW / 2;
    const oy = top + availH / 2 - gridH / 2;

    // 标题
    if (i18n.title) label(ctx, i18n.title, w / 2, h * 0.08, { font: TOKENS.typography.sizes.lg, color: themeColor('text') });

    if (beatId === 'concrete') {
      // 具象：物体逐行淡入（错峰），全程同一 emoji 身份
      const totalCells = rows * cols;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const order = r * cols + c;
          const appear = Math.min(1, Math.max(0, (local * 1.4 - order / totalCells)) * 2.2);
          const a = EASE.out(Math.max(0, Math.min(1, appear)));
          const px = ox + c * spacing, py = oy + r * spacing;
          const size = spacing * 0.6 * a;
          if (mode === 'area') {
            // 面积：画成实心小方块
            ctx.save();
            ctx.globalAlpha = a;
            ctx.fillStyle = 'rgba(79,140,255,.85)';
            roundRect(ctx, px - size / 2, py - size / 2, size, size, 4);
            ctx.restore();
          } else {
            emoji(ctx, actor.emoji || '🍎', px, py, size, { opacity: a });
          }
        }
      }
      // 行列标注
      label(ctx, `${rows} ${i18n.rowLabel || 'rows'}`, w / 2, oy - gridH / 2 - 26, { color: '#f59e0b', font: TOKENS.typography.sizes.md });
    }

    else if (beatId === 'pictorial') {
      // 图示：物体褪成圆点/方格，逐行高亮跳数
      const litRows = local * rows; // 已点亮行数（连续）
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = ox + c * spacing, py = oy + r * spacing;
          const rowPos = litRows - r; // >1 整行亮, 0..1 渐亮
          const on = Math.max(0, Math.min(1, rowPos));
          if (mode === 'area') {
            ctx.save();
            ctx.fillStyle = `rgba(79,140,255,${0.25 + on * 0.6})`;
            ctx.strokeStyle = 'rgba(79,140,255,.9)';
            ctx.lineWidth = 1.5;
            const s = spacing * 0.8;
            ctx.beginPath(); ctx.rect(px - s / 2, py - s / 2, s, s); ctx.fill(); ctx.stroke();
            ctx.restore();
          } else {
            const dotR = spacing * 0.26;
            circle(ctx, px, py, dotR, { fill: on > 0.99 ? '#f59e0b' : '#4f8cff' });
          }
        }
      }
      // 跳数计数
      const counted = Math.floor(litRows) * cols;
      const shown = Math.round(litRows * cols);
      label(ctx, (i18n.count || 'count') + ': ' + shown, w / 2, bottom + 26, {
        color: '#2fd6a5', font: TOKENS.typography.sizes.lg,
      });
      // 当前行高亮下划线
      if (litRows < rows - 0.01) {
        const hr = Math.min(rows - 1, Math.floor(litRows));
        dashedLine(ctx, ox - spacing * 0.4, oy + hr * spacing + spacing * 0.45,
          ox + gridW + spacing * 0.4, oy + hr * spacing + spacing * 0.45, { color: '#f59e0b', width: 2 });
      }
    }

    else {
      // abstract: 点阵淡出，算式浮现
      const fade = local;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = ox + c * spacing, py = oy + r * spacing;
          ctx.save();
          ctx.globalAlpha = 1 - fade * 0.85;
          circle(ctx, px, py, spacing * 0.2, { fill: '#4f8cff' });
          ctx.restore();
        }
      }
      // 中心大算式
      const cyy = h * 0.42;
      ctx.save();
      ctx.globalAlpha = EASE.out(fade);
      ctx.font = `bold ${TOKENS.typography.sizes.xxl + 8}px ${TOKENS.typography.family}`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = themeColor('text');
      ctx.fillText(formula, w / 2, cyy);
      ctx.restore();
      // 答案高亮脉冲
      if (fade > 0.6) {
        highlightPulse(ctx, w / 2, cyy, 60, t, { color: '#2fd6a5' });
        label(ctx, (i18n.answer || 'Answer') + ': ' + product, w / 2, cyy + 56, {
          color: '#2fd6a5', font: TOKENS.typography.sizes.xl,
        });
      }
    }

    // 底部步骤卡 + 进度条
    stepCard(ctx, w, h, beats[idx].label || anim.answer || '',
      { color: beatId === 'abstract' ? '#2fd6a5' : themeColor('text') });
    const prog = Math.min(t / totalMs, 1);
    progressBar(ctx, w, h, prog);
  });

  return engine;
}
