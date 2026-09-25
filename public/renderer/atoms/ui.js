// renderer/atoms/ui.js — UI 原子：进度点、星星、进度条、等待小精灵、CPA 过渡辅助
import { TOKENS, themeColor } from '../core/design-tokens.js';
import { emoji, label, roundRect } from './actors.js';

// —— 三彩色点向右循环推进（蓝→中→右，橙再右→左→中→右）——
export function progressDots(ctx, x, y, t, opts = {}) {
  const colors = opts.colors || TOKENS.progress.dotColors;
  const spacing = opts.spacing || 16;
  const r = opts.radius || 5;
  const cycle = (t / 1200) % 2; // 2 秒一个循环
  ctx.save();
  for (let i = 0; i < 3; i++) {
    let offset;
    if (i === 0) {
      // 蓝点：0→1 向右
      offset = cycle < 1 ? cycle : (cycle - 1);
    } else if (i === 1) {
      // 橙点：右→左→中→右
      const c = (cycle + 0.5) % 2;
      offset = c < 0.5 ? (1 - c * 2) : (c - 0.5) * 2;
    } else {
      // 绿点：跟随蓝点延迟
      offset = (cycle + 0.3) % 1;
    }
    const px = x + offset * spacing * 2;
    const py = y + Math.sin(t / 300 + i) * 2;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }
  ctx.restore();
}

// —— 中心星星忽大忽小 ——
export function pulsingStar(ctx, x, y, t, opts = {}) {
  const baseSize = opts.size || 30;
  const pulse = 1 + Math.sin(t / 400) * 0.15;
  emoji(ctx, '⭐', x, y, baseSize * pulse);
}

// —— 底部进度条 ——
export function progressBar(ctx, w, h, progress, opts = {}) {
  const y = opts.y || (h - 6);
  const height = opts.height || 4;
  ctx.save();
  ctx.fillStyle = 'rgba(79,140,255,.2)';
  ctx.fillRect(0, y, w, height);
  ctx.fillStyle = opts.color || TOKENS.colors.primary;
  ctx.fillRect(0, y, w * Math.max(0, Math.min(1, progress)), height);
  ctx.restore();
}

// —— 等待画面：手持小棒施法的小精灵 ——
export function waitingElf(ctx, w, h, t, opts = {}) {
  const theme = opts.theme || 'dark';
  ctx.save();
  // 背景
  ctx.fillStyle = themeColor('bg', theme);
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2 - 20;
  // 小精灵（用 emoji + 魔法棒）
  const bob = Math.sin(t / 500) * 6;
  emoji(ctx, '🧙', cx, cy + bob, 64);
  // 魔法棒光点
  const wandX = cx + 30, wandY = cy - 10 + bob;
  const sparkle = (t / 200) % 1;
  ctx.globalAlpha = 1 - sparkle;
  emoji(ctx, '✨', wandX + sparkle * 20, wandY - sparkle * 15, 20 * (1 - sparkle * 0.5));
  ctx.globalAlpha = 1;
  // 文字
  label(ctx, opts.text || 'CalcElf 正在思考…', cx, cy + 60, {
    font: TOKENS.typography.sizes.md, color: themeColor('text', theme),
  });
  progressDots(ctx, cx - 16, cy + 85, t);
  ctx.restore();
}

// —— 聊天等待：渐变"点点点" ——
export function typingDots(ctx, x, y, t, opts = {}) {
  const colors = ['#4f8cff', '#8a8ffc', '#c4b5fd'];
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const bounce = Math.abs(Math.sin(t / 300 + i * 0.5));
    ctx.beginPath();
    ctx.arc(x + i * 12, y - bounce * 4, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors[i];
    ctx.fill();
  }
  ctx.restore();
}

// —— CPA 过渡辅助：根据 phase 进度计算当前层透明度 ——
// 返回 { concrete, pictorial, abstract } 各 0..1
export function cpaLayers(phaseLocal, totalBeats) {
  // 假设每 3 拍为一个 CPA 循环：拍1=具象, 拍2=图示, 拍3=抽象
  const stage = phaseLocal;
  if (stage < 0.33) return { concrete: 1, pictorial: stage / 0.33 * 0.3, abstract: 0 };
  if (stage < 0.66) return { concrete: 1 - (stage - 0.33) / 0.33 * 0.5, pictorial: 1, abstract: (stage - 0.33) / 0.33 * 0.3 };
  return { concrete: 0.3, pictorial: 1 - (stage - 0.66) / 0.34 * 0.5, abstract: 1 };
}

// —— 步骤卡片（底部讲解区）——
export function stepCard(ctx, w, h, text, opts = {}) {
  const theme = opts.theme || 'dark';
  const cardH = opts.height || 56;
  const y = h - cardH;
  ctx.save();
  ctx.fillStyle = theme === 'dark' ? 'rgba(16,15,28,.85)' : 'rgba(255,255,255,.9)';
  ctx.fillRect(0, y, w, cardH);
  // 文字（自动截断）
  const maxChars = Math.floor(w / 14);
  const display = String(text || '').length > maxChars ? String(text).slice(0, maxChars - 1) + '…' : text;
  label(ctx, display, w / 2, y + cardH / 2, {
    font: opts.font || TOKENS.typography.sizes.md,
    color: opts.color || themeColor('text', theme),
  });
  ctx.restore();
}

// —— 高亮脉冲（用于强调某个对象）——
export function highlightPulse(ctx, x, y, r, t, opts = {}) {
  const pulse = 0.5 + Math.sin(t / 300) * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.3 + pulse * 0.4;
  ctx.beginPath();
  ctx.arc(x, y, r + pulse * 6, 0, Math.PI * 2);
  ctx.strokeStyle = opts.color || TOKENS.colors.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

// —— 对错标记 ——
export function checkMark(ctx, x, y, size = 32) {
  emoji(ctx, '✅', x, y, size);
}
export function crossMark(ctx, x, y, size = 32) {
  emoji(ctx, '❌', x, y, size);
}

// —— 竖式计算（与题目竖式逐位对齐）——
export function verticalMath(ctx, x, y, digits, opts = {}) {
  // digits: [{value, color?}] 从右到左（个位在前）
  const theme = opts.theme || 'dark';
  const charW = opts.charW || 28;
  const lineH = opts.lineH || 32;
  ctx.save();
  ctx.font = `${opts.fontSize || 24}px ${TOKENS.typography.family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const n = digits.length;
  digits.forEach((d, i) => {
    const px = x + (n - 1 - i) * charW;
    ctx.fillStyle = d.color || themeColor('text', theme);
    ctx.fillText(String(d.value), px, y);
  });
  // 横线
  if (opts.showLine !== false) {
    ctx.strokeStyle = themeColor('textDim', theme);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - charW / 2, y + lineH / 2);
    ctx.lineTo(x + (n - 0.5) * charW, y + lineH / 2);
    ctx.stroke();
  }
  ctx.restore();
}
