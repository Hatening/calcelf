// renderer/modes/sequence.js — 分组数列 / 找规律 模式渲染器
// 1, 2,2, 3,3,3, … n 连续出现 n 次；定位第 N 个数（三角形数 T(k)=k(k+1)/2）。
import { createEngine, buildTimeline } from '../core/engine.js';
import { label, roundRect, circle } from '../atoms/actors.js';
import { stepCard, progressBar, highlightPulse } from '../atoms/ui.js';

const GROUP_COLORS = ['#4f8cff', '#2fd6a5', '#f59e0b', '#c4b5fd', '#f472b6', '#38bdf8', '#a3e635', '#fb923c'];
const gcolor = (n) => GROUP_COLORS[(n - 1) % GROUP_COLORS.length];

function chip(ctx, cx, cy, r, text, color, opts = {}) {
  ctx.save();
  ctx.globalAlpha = opts.alpha != null ? opts.alpha : 1;
  ctx.fillStyle = color;
  roundRect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.42);
  if (opts.stroke) { ctx.lineWidth = opts.strokeWidth || 3; ctx.strokeStyle = opts.stroke;
    roundRect(ctx, cx - r, cy - r, r * 2, r * 2, r * 0.42); }
  ctx.fillStyle = '#0d1228';
  ctx.font = `bold ${Math.round(r * 1.02)}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(text), cx, cy + 1);
  ctx.restore();
}

export function render(canvas, anim) {
  const sc = anim.scene || {};
  const N = sc.N, m = sc.m, Tprev = sc.Tprev, Tm = sc.Tm, off = sc.offsetWithin;
  const zh = (anim.language || 'zh').indexOf('zh') === 0;
  const T = {
    hRule: zh ? '规律：数字 n，连续出现 n 次' : 'Pattern: n appears n times in a row',
    hTri: zh ? '累计个数：三角形数 T(k)=1+2+…+k=k(k+1)/2' : 'Cumulative: triangular T(k)=1+2+…+k=k(k+1)/2',
    hLoc: zh ? `定位：T(${m - 1})=${Tprev} < ${N} ≤ T(${m})=${Tm}` : `Locate: T(${m - 1})=${Tprev} < ${N} ≤ T(${m})=${Tm}`,
    cum: (n, v) => zh ? `共 ${v}` : `T(${n})=${v}`,
    dots: '……',
    target: zh ? `第 ${N} 个` : `term ${N}`,
    ansSmall: zh ? `第 ${N} 个数` : `Term ${N}`,
    ansBig: `= ${m}`,
  };

  const beats = Array.isArray(anim.beats) ? anim.beats : [{ id: 'b', duration: 5000 }];
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + 1600 : 5000;
  const engine = createEngine(canvas, { theme: 'dark' });

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = phase.index, local = phase.local;
    ctx.fillStyle = '#0d1228'; ctx.fillRect(0, 0, w, h);

    // ---- 布局参数（响应式）----
    const padX = Math.max(14, w * 0.05);
    const lx = padX + 16;                 // 组标签圆心 x
    const x0 = padX + 42;                 // 卡片起始 x
    const chipAreaW = w - x0 - padX;
    const G = Math.max(1, Math.min(5, m - 1));          // 具体展示前 G 组
    const cmShow = Math.min(Math.max(off, 6), 12);      // 第 m 组展示的卡片数
    const maxChips = Math.max(G, cmShow, 1);
    const gap = 6;
    let r = Math.min(20, (chipAreaW - (maxChips - 1) * gap) / (2 * maxChips));
    const rowsCount = G + 2;
    const rowsStartY = 58;
    const availRowH = h - 66 - rowsStartY;
    r = Math.min(r, Math.max(9, (availRowH / rowsCount - 12) / 2));
    const rowH = 2 * r + 12;
    const rowY = (i) => rowsStartY + i * rowH;
    const chipX = (j) => x0 + j * (2 * r + gap) + r;

    // 组标签
    const groupLabel = (n, cy, alpha = 1) => {
      ctx.save(); ctx.globalAlpha = alpha;
      circle(ctx, lx, cy, r * 0.92, { fill: gcolor(n) });
      ctx.fillStyle = '#0d1228'; ctx.font = `bold ${Math.round(r * 0.95)}px system-ui`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), lx, cy + 1);
      ctx.restore();
    };
    const cumLabel = (n, cy, alpha = 1) => {
      const v = n * (n + 1) / 2; const s = T.cum(n, v);
      const after = x0 + n * (2 * r + gap) + 8;
      const ew = s.length * 7;
      let x = after, al = 'left';
      if (after + ew > w - padX) { x = w - padX; al = 'end'; }
      label(ctx, s, x, cy, { color: '#9fb0e6', font: Math.round(Math.min(13, r * 0.78)), align: al, alpha });
    };

    // ---- 顶部标题 ----
    const header = [T.hRule, T.hTri, T.hLoc, T.hLoc][idx];
    label(ctx, header, w / 2, 26, { color: idx === 2 ? '#ffd76a' : '#cdd7f5', font: w < 380 ? 13 : 15, weight: 'bold' });

    // ===== 拍 0：分组逐组出现 =====
    if (idx === 0) {
      const prog = local * G;
      for (let n = 1; n <= G; n++) {
        const cy = rowY(n - 1) + r;
        const reveal = Math.max(0, Math.min(1, prog - (n - 1)));
        if (reveal <= 0) continue;
        groupLabel(n, cy, reveal);
        for (let j = 0; j < n; j++) {
          const a = Math.max(0, Math.min(1, (reveal - j * 0.18) * 1.4));
          chip(ctx, chipX(j), cy, r, n, gcolor(n), { alpha: a });
        }
      }
    }

    // ===== 拍 1：累计三角形数 =====
    if (idx === 1) {
      const revealCum = Math.ceil(local * G);
      for (let n = 1; n <= G; n++) {
        const cy = rowY(n - 1) + r;
        groupLabel(n, cy, 1);
        for (let j = 0; j < n; j++) chip(ctx, chipX(j), cy, r, n, gcolor(n));
        if (n <= revealCum) cumLabel(n, cy, Math.min(1, (local * G - (n - 1)) * 1.6));
      }
    }

    // ===== 拍 2 / 3：定位 + 答案 =====
    if (idx >= 2) {
      const dim = idx === 2 ? 0.5 : 0.2;
      for (let n = 1; n <= G; n++) {
        const cy = rowY(n - 1) + r;
        groupLabel(n, cy, dim);
        for (let j = 0; j < n; j++) chip(ctx, chipX(j), cy, r, n, gcolor(n), { alpha: dim });
        cumLabel(n, cy, dim * 0.9);
      }
      // 省略号
      const ey = rowY(G);
      label(ctx, T.dots, x0 + chipAreaW * 0.18, ey + r, { color: '#8fa4db', font: 20,
        alpha: Math.min(1, local * 3) });

      // 第 m 组
      const my = rowY(G + 1) + r;
      const mAlpha = idx === 2 ? Math.min(1, Math.max(0, local * 2 - 0.4)) : 1;
      groupLabel(m, my, mAlpha);
      for (let j = 0; j < cmShow; j++) {
        const isTarget = j === off - 1;
        chip(ctx, chipX(j), my, r, m, gcolor(m), {
          alpha: mAlpha,
          stroke: isTarget ? '#ffd76a' : null,
        });
        if (isTarget) {
          highlightPulse(ctx, chipX(j), my, r + 5, t, { color: '#ffd76a' });
          label(ctx, T.target, chipX(j), my + r + 16, { color: '#ffd76a', font: 12, weight: 'bold' });
        }
      }
      if (m > cmShow) label(ctx, '+…', chipX(cmShow - 1) + r + 12, my, { color: '#8fa4db', font: 16 });
    }

    // ===== 拍 3：居中实心答案卡（绿色描边）=====
    if (idx === 3) {
      const cardW = Math.min(w - 2 * padX, 330);
      const cardH = 118;
      const ccx = w / 2, ccy = h * 0.46, top = ccy - cardH / 2;
      const bx = ccx - cardW / 2;
      ctx.save();
      ctx.fillStyle = '#2fd6a5'; roundRect(ctx, bx, top, cardW, cardH, 18);          // 描边层
      ctx.fillStyle = '#121a3a'; roundRect(ctx, bx + 3, top + 3, cardW - 6, cardH - 6, 15); // 内层
      label(ctx, T.ansSmall, ccx, ccy - 26, { color: '#cdd7f5', font: 16, weight: 'bold' });
      label(ctx, T.ansBig, ccx, ccy + 24, { color: '#2fd6a5', font: 42, weight: 'bold' });
      ctx.restore();
    }

    stepCard(ctx, w, h, beats[idx] ? beats[idx].label : '', { color: '#4f8cff' });
    progressBar(ctx, w, h, Math.min(t / totalMs, 1));
  });

  return engine;
}
