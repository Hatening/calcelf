// renderer/modes/axis-motion.js — 轴线运动模式渲染器
// 爬井 / 弹跳 / 升降 / 往返 / 水位变化都走这一个模式
import { createEngine, buildTimeline } from '../core/engine.js';
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, dashedLine, circle } from '../atoms/actors.js';
import { progressBar, stepCard, highlightPulse } from '../atoms/ui.js';
import { t as i18n, langOf, isRTL } from '../core/i18n.js';

export function render(canvas, anim) {
  const scene = anim.scene || {};
  const actor = anim.actor || { emoji: '🐸' };
  const phases = Array.isArray(anim.phases) ? anim.phases : [];
  const depth = Number(scene.wellDepth) || 10;
  const lang = langOf(anim);
  const rtl = isRTL(lang);
  const unit = scene.unit || (lang === 'zh-CN' || lang === 'zh-TW' ? '米' : 'm');
  const beats = Array.isArray(anim.beats) ? anim.beats : phases.map((p, i) => ({ id: `p${i}`, duration: 2500 }));
  const timeline = buildTimeline(beats);
  const totalMs = timeline.length ? timeline[timeline.length - 1].end + TOKENS.timing.holdMs : 5000;

  const engine = createEngine(canvas, { theme: 'dark' });

  engine.playTimeline(timeline, ({ ctx, W, H, t, phase }) => {
    const w = W(), h = H();
    const idx = Math.min(phase.index, phases.length - 1);
    const p = phases[idx] || { from: 0, to: 0, type: 'day', label: '' };
    const local = phase.local;
    const pos = p.from + (p.to - p.from) * engine.EASE.inOut(local);
    const isNight = p.type === 'night';
    const done = phase.done;

    // —— 天色背景 ——
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    if (isNight) { sky.addColorStop(0, '#0b1330'); sky.addColorStop(1, '#1a234e'); }
    else { sky.addColorStop(0, '#2a366b'); sky.addColorStop(1, '#1a2348'); }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // —— 太阳 / 月亮（右上角）——
    const sx = w - 70, sy = 70;
    if (isNight) {
      ctx.fillStyle = '#fcd5ff';
      circle(ctx, sx, sy, 24, { fill: '#fcd5ff' });
      ctx.fillStyle = '#0b1330';
      circle(ctx, sx - 9, sy - 6, 22, { fill: '#0b1330' });
      label(ctx, '🌙 ' + i18n(lang, 'night'), sx, sy + 52, { color: '#8fa4db', font: 13 });
    } else {
      circle(ctx, sx, sy, 26, { fill: '#ffd76a' });
      ctx.strokeStyle = 'rgba(255,215,106,.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + t / 1500;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * 32, sy + Math.sin(a) * 32);
        ctx.lineTo(sx + Math.cos(a) * 42, sy + Math.sin(a) * 42);
        ctx.stroke();
      }
      label(ctx, '☀️ ' + i18n(lang, 'day'), sx, sy + 56, { color: '#ffd76a', font: 13 });
    }

    // —— 井的矩形 ——
    const wellTop = h * 0.12;
    const wellBottom = h * 0.82;
    const wellW = Math.min(180, w * 0.36);
    const wellX = w / 2 - wellW / 2;
    const wellH = wellBottom - wellTop;
    // 坐标换算：卡片 phases 用“已爬高度”(0=井底, depth=井口)；
    // 屏幕刻度用“深度”(0=井口/顶部, depth=井底/底部)。二者互为 depth-h。
    const clampD = (v) => Math.max(0, Math.min(v, depth));
    const depthY = (dv) => wellTop + (clampD(dv) / depth) * wellH;  // 深度 → y
    const heightY = (hv) => depthY(depth - clampD(hv));             // 已爬高度 → y
    const d2y = heightY;                                            // phases/物体用高度

    // 井体
    ctx.fillStyle = '#8a8ffc';
    ctx.fillRect(wellX, wellTop, wellW, wellH);
    ctx.strokeStyle = '#3a4db0';
    ctx.lineWidth = 3;
    ctx.strokeRect(wellX, wellTop, wellW, wellH);
    // 井口
    ctx.fillStyle = '#2a3550';
    ctx.fillRect(wellX - 14, wellTop - 14, wellW + 28, 14);
    ctx.strokeStyle = '#4f8cff';
    ctx.strokeRect(wellX - 14, wellTop - 14, wellW + 28, 14);

    // 深度刻度
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let d = 0; d <= depth; d++) {
      const y = depthY(d);   // 深度刻度：0 在井口(上)，depth 在井底(下)
      ctx.strokeStyle = 'rgba(99,186,131,.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wellX - 8, y); ctx.lineTo(wellX, y); ctx.stroke();
      if (d % 2 === 0) { ctx.fillStyle = '#5b6a83'; ctx.fillText(d + '', wellX - 14, y); }
    }

    // 已走过的轨迹
    for (let i = 0; i < idx; i++) {
      const q = phases[i];
      dashedLine(ctx, w / 2, d2y(q.from), w / 2, d2y(q.to));
    }
    if (phases.length) {
      if (done) {
        const q = phases[idx];
        dashedLine(ctx, w / 2, d2y(q.from), w / 2, d2y(q.to));
      } else {
        dashedLine(ctx, w / 2, d2y(p.from), w / 2, d2y(pos));
      }
    }

    // 物体（任意 emoji）—— 全程同一身份，只改位置
    const fy = d2y(pos);
    emoji(ctx, actor.emoji || '🐸', w / 2, fy, 44);
    if (!done) highlightPulse(ctx, w / 2, fy, 28, t, { color: isNight ? '#8a8ffc' : '#ffd76a' });

    // 当前位置标注
    label(ctx, pos.toFixed(1) + ' ' + unit, wellX + wellW + 22, fy, {
      color: '#2fd6a5', font: 14, align: 'left',
    });

    // 底部状态条
    const statusText = done ? (i18n(lang, 'done') + ': ' + (anim.answer || p.label || '')) : (p.label || '');
    stepCard(ctx, w, h, statusText, { color: done ? '#2fd6a5' : (isNight ? '#8fa4db' : '#ffd76a') });

    // 进度条
    const prog = Math.min(t / (timeline.length ? timeline[timeline.length - 1].end : totalMs), 1);
    progressBar(ctx, w, h, prog);
  });

  return engine;
}
