// renderer/modes/balance.js — 天平 / 等式 / 一元一次方程 模式渲染器
// CPA：具象(天平两端盒子+砝码，平衡) → 图示(两边同步取放砝码、平均分份) → 抽象(方程等号对齐)
import { createEngine, buildTimeline, phaseAt, EASE } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, roundRect, dashedLine, arrow, circle } from '../atoms/actors.js';
import { balanceScale } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';

export function render(canvas, anim) {
  const a = Number(anim.a) || 1;
  const bSigned = Number(anim.bSigned) || 0;
  const c = Number(anim.c) || 0;
  const target = Number(anim.target) || (c - bSigned);
  const x = Number(anim.x) || (target / a);
  const unit = anim.unit || '';
  const equation = anim.equation || '';
  const i18n = anim.i18n || {};

  const beats = Array.isArray(anim.beats) && anim.beats.length
    ? anim.beats
    : [
        { id: 'initial', duration: 5000, label: '' },
        { id: 'sync', duration: 5000, label: '' },
        { id: 'divide', duration: 5000, label: '' },
        { id: 'abstract', duration: 5000, label: '' },
      ];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 20000;

  const engine = createEngine(canvas, { theme: 'dark' });

  // 画一个砝码小圆盘
  function weightChip(ctx, px, py, r, opts = {}) {
    ctx.save();
    circle(ctx, px, py, r, { fill: opts.fill || '#9aa4c7', stroke: '#5b6a83', width: 2 });
    ctx.restore();
  }
  // 画一个盒子（标 x）
  function box(ctx, px, py, s, opts = {}) {
    ctx.save();
    ctx.globalAlpha = opts.opacity != null ? opts.opacity : 1;
    ctx.fillStyle = '#f59e0b';
    roundRect(ctx, px - s / 2, py - s / 2, s, s, 5);
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2;
    ctx.strokeRect(px - s / 2 + 2, py - s / 2 + 2, s - 4, s - 4);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = `bold ${Math.round(s * 0.5)}px ${TOKENS.typography.family}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('x', px, py + 1);
    ctx.restore();
  }

  engine.play(totalMs, ({ ctx, W, H, t }) => {
    const w = W(), h = H();
    const ph = phaseAt(timeline, t);
    const idx = Math.min(ph.index, beats.length - 1);
    const local = EASE.inOut(ph.local);
    const beatId = beats[idx].id;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#141a3d'); bg.addColorStop(1, '#0d1228');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    if (i18n.title) label(ctx, i18n.title, w / 2, h * 0.08, { font: TOKENS.typography.sizes.lg, color: themeColor('text') });

    const cx = w / 2;
    const cy = h * 0.46;
    const armLen = Math.min(150, w * 0.22);

    // 抽象拍：淡出天平，直接列方程
    if (beatId === 'abstract') {
      ctx.save();
      ctx.globalAlpha = 1 - local;
      const pan = balanceScale(ctx, cx, cy, { tilt: 0, armLen });
      drawContents(ctx, pan, { a, bVisible: bSigned !== 0, rightCount: c, t, local: 0, syncOut: 0, divide: 0 });
      ctx.restore();

      // 方程三行，等号垂直对齐（居中即对齐）
      const fade = EASE.out(local);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `bold ${TOKENS.typography.sizes.xl}px ${TOKENS.typography.family}`;
      const yy = h * 0.30;
      ctx.fillStyle = themeColor('text');
      ctx.fillText(equation, cx, yy);
      ctx.font = `${TOKENS.typography.sizes.lg}px ${TOKENS.typography.family}`;
      ctx.fillStyle = '#8fa4db';
      ctx.fillText(`${a}x = ${target}`, cx, yy + 48);
      ctx.fillStyle = '#2fd6a5';
      ctx.font = `bold ${TOKENS.typography.sizes.xl}px ${TOKENS.typography.family}`;
      ctx.fillText(`x = ${target} ÷ ${a} = ${x}${unit ? ' ' + unit : ''}`, cx, yy + 96);
      ctx.restore();

      stepCard(ctx, w, h, (i18n.answer || 'Answer') + ': x = ' + x, { color: '#2fd6a5' });
      progressBar(ctx, w, h, Math.min(t / totalMs, 1));
      return;
    }

    // 倾斜：initial=0；sync 微微晃动回 0；divide=0
    let tilt = 0;
    if (beatId === 'sync') tilt = Math.sin(local * Math.PI) * 0.18 * (1 - local);

    const pan = balanceScale(ctx, cx, cy, { tilt, armLen });

    let bVisible = true, rightCount = c, syncOut = 0, divide = 0;
    if (beatId === 'sync') {
      // |bSigned| 个砝码从两边飘走
      syncOut = local;
      bVisible = bSigned !== 0;
      rightCount = c; // 仍画 c，但左边那 |b| 个淡出飘走；视觉上右边同步减少 |b|
    }
    if (beatId === 'divide') {
      bVisible = false;
      rightCount = target;
      divide = local;
    }

    drawContents(ctx, pan, { a, bVisible, rightCount, t, local, syncOut, divide, bSigned, x, unit });

    function drawContents(ctx, pan, o) {
      const leftX = pan.leftX, rightX = pan.rightX, panY = pan.panY;
      // —— 左盘：a 个盒子 ——
      const boxS = Math.min(40, (armLen * 1.5) / Math.max(a, 1) * 0.6);
      const boxGap = boxS + 8;
      const leftStart = leftX - ((a - 1) * boxGap) / 2;
      for (let i = 0; i < a; i++) {
        box(ctx, leftStart + i * boxGap, panY - boxS / 2 - 6, boxS, { opacity: o.divide > 0 ? 1 : 1 });
      }
      // —— 左盘上的 bSigned 个砝码（同步拍淡出飘走）——
      if (o.bVisible && bSigned !== 0) {
        const r = 9;
        const n = Math.abs(bSigned);
        const bw = r * 2 + 4;
        const wStart = leftX - ((n - 1) * bw) / 2;
        const lift = (o.syncOut || 0) * 40;
        ctx.save();
        ctx.globalAlpha = 1 - (o.syncOut || 0);
        for (let i = 0; i < n; i++) {
          weightChip(ctx, wStart + i * bw, panY - boxS - 14 - lift, r);
        }
        ctx.restore();
        // 标注 “−b”
        if ((o.syncOut || 0) > 0.1) {
          label(ctx, bSigned > 0 ? '−' + n : '+' + n, wStart, panY - boxS - 40 - lift, { color: '#ef4444', font: 16 });
        }
      }
      // —— 右盘：rightCount 个砝码 ——
      const nR = o.rightCount;
      const rR = Math.max(7, Math.min(11, (armLen * 1.6) / Math.max(nR, 1) * 0.5));
      const bwR = rR * 2 + 3;
      const rightStart = rightX - ((nR - 1) * bwR) / 2;
      const hiddenOnRight = (o.bVisible && bSigned !== 0) ? Math.abs(bSigned) : 0;
      for (let i = 0; i < nR; i++) {
        let alpha = 1, lift = 0;
        // 同步拍：最外侧 |b| 个砝码飘走（与左边对应）
        if (o.bVisible && bSigned !== 0 && i >= nR - hiddenOnRight) {
          alpha = 1 - (o.syncOut || 0);
          lift = (o.syncOut || 0) * 40;
        }
        // 平均分份拍：画分隔
        ctx.save();
        ctx.globalAlpha = alpha;
        weightChip(ctx, rightStart + i * bwR, panY - rR - 6 - lift, rR);
        ctx.restore();
      }
      // 同步拍右盘 “−b” 标注
      if (o.bVisible && bSigned !== 0 && (o.syncOut || 0) > 0.1) {
        label(ctx, '−' + Math.abs(bSigned), rightStart + (nR - 1) * bwR, panY - rR - 40 - (o.syncOut || 0) * 40, { color: '#ef4444', font: 16 });
      }

      // 平均分份：在右盘砝码间画虚线分组，每组 x 个
      if (o.divide > 0.02) {
        ctx.save();
        ctx.globalAlpha = o.divide;
        for (let g = 1; g < a; g++) {
          const splitAt = rightStart + (g * x) * bwR - bwR / 2;
          dashedLine(ctx, splitAt, panY - rR - 26, splitAt, panY + 16, { color: '#2fd6a5', width: 2, pattern: [3, 3] });
        }
        // 高亮第一组（=1个盒子）
        const g1x0 = rightStart - bwR / 2;
        const g1x1 = rightStart + (x - 1) * bwR + bwR / 2;
        ctx.strokeStyle = '#2fd6a5'; ctx.lineWidth = 3;
        ctx.strokeRect(g1x0, panY - rR - 26, g1x1 - g1x0, rR * 2 + 20);
        ctx.restore();
        // 连线：第一个盒子 ↔ 第一组砝码
        arrow(ctx, leftStart + boxGap / 2, panY - boxS - 10, rightStart + (x - 1) * bwR / 2, panY - rR - 10, { color: '#2fd6a5', width: 2 });
      }

      // 盘下总量标签
      const leftMass = (o.bVisible ? '' : `${a}x`);
      const rightMass = (o.bVisible && bSigned !== 0) ? `${c}${unit}` : `${o.rightCount}${unit}`;
      label(ctx, leftMass, leftX, panY + 34, { color: '#f59e0b', font: 14 });
      label(ctx, rightMass, rightX, panY + 34, { color: '#4f8cff', font: 14 });
    }

    stepCard(ctx, w, h, beats[idx].label || '', {
      color: beatId === 'divide' ? '#2fd6a5' : themeColor('text'),
    });
    progressBar(ctx, w, h, Math.min(t / totalMs, 1));
  });

  return engine;
}
