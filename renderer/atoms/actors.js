// renderer/atoms/actors.js — 原子演员层：可复用的视觉零件
// 所有模式共用。演员有稳定 id，动作只改状态不删除重建。
import { TOKENS, themeColor } from '../core/design-tokens.js';

// —— emoji 演员（青蛙/狗/人/太阳等）——
export function emoji(ctx, ch, x, y, size = 40, opts = {}) {
  ctx.save();
  if (opts.rotate) { ctx.translate(x, y); ctx.rotate(opts.rotate); ctx.translate(-x, -y); }
  if (opts.opacity != null) ctx.globalAlpha = opts.opacity;
  ctx.font = `${size}px ${TOKENS.typography.emoji}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, x, y);
  ctx.restore();
}

// —— 文字标签 ——
export function label(ctx, text, x, y, opts = {}) {
  ctx.save();
  ctx.fillStyle = opts.color || themeColor('text', opts.theme || 'dark');
  ctx.font = `${opts.weight || ''} ${opts.font || TOKENS.typography.sizes.sm}px ${TOKENS.typography.family}`.trim();
  ctx.textAlign = opts.align || 'center';
  ctx.textBaseline = opts.baseline || 'middle';
  if (opts.shadow) { ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 4; }
  ctx.fillText(String(text), x, y);
  ctx.restore();
}

// —— 箭头 ——
export function arrow(ctx, x1, y1, x2, y2, opts = {}) {
  const color = opts.color || TOKENS.colors.primary;
  const width = opts.width || 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = opts.headLength || 8;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hl * Math.cos(a - Math.PI / 6), y2 - hl * Math.sin(a - Math.PI / 6));
  ctx.lineTo(x2 - hl * Math.cos(a + Math.PI / 6), y2 - hl * Math.sin(a + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// —— 虚线 ——
export function dashedLine(ctx, x1, y1, x2, y2, opts = {}) {
  ctx.save();
  ctx.strokeStyle = opts.color || 'rgba(79,140,255,.35)';
  ctx.lineWidth = opts.width || 2;
  ctx.setLineDash(opts.pattern || [4, 4]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// —— 矩形条（条形模型用）——
export function bar(ctx, x, y, w, h, opts = {}) {
  ctx.save();
  ctx.fillStyle = opts.color || TOKENS.colors.primary;
  if (opts.gradient) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, opts.gradient[0]);
    g.addColorStop(1, opts.gradient[1]);
    ctx.fillStyle = g;
  }
  if (opts.radius) roundRect(ctx, x, y, w, h, opts.radius);
  else ctx.fillRect(x, y, w, h);
  if (opts.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}

// —— 圆角矩形路径 ——
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.fill();
}

// —— 圆 ——
export function circle(ctx, x, y, r, opts = {}) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (opts.fill) { ctx.fillStyle = opts.fill; ctx.fill(); }
  if (opts.stroke) { ctx.strokeStyle = opts.stroke; ctx.lineWidth = opts.width || 2; ctx.stroke(); }
  ctx.restore();
}

// —— 数轴 ——
export function numberLine(ctx, x, y, len, opts = {}) {
  const min = opts.min ?? 0;
  const max = opts.max ?? 10;
  const step = opts.step ?? 1;
  ctx.save();
  ctx.strokeStyle = opts.color || themeColor('axis', opts.theme || 'dark');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();
  // 箭头
  arrow(ctx, x + len - 2, y, x + len + 8, y, { color: opts.color, width: 2 });
  // 刻度
  const range = max - min;
  for (let v = min; v <= max; v += step) {
    const px = x + ((v - min) / range) * len;
    ctx.beginPath();
    ctx.moveTo(px, y - 5);
    ctx.lineTo(px, y + 5);
    ctx.strokeStyle = opts.color || themeColor('axis', opts.theme || 'dark');
    ctx.stroke();
    if (opts.labels !== false) {
      label(ctx, String(v), px, y + 18, { font: 11, color: themeColor('textDim', opts.theme || 'dark') });
    }
  }
  ctx.restore();
  return { x, y, len, toPx: (v) => x + ((v - min) / range) * len };
}

// —— 坐标系（函数图像/几何用）——
export function axes(ctx, cx, cy, w, h, opts = {}) {
  const xMin = opts.xMin ?? -5, xMax = opts.xMax ?? 5;
  const yMin = opts.yMin ?? -5, yMax = opts.yMax ?? 5;
  ctx.save();
  ctx.strokeStyle = opts.color || themeColor('axis', opts.theme || 'dark');
  ctx.lineWidth = 1.5;
  // 网格
  ctx.strokeStyle = TOKENS.colors.grid;
  ctx.lineWidth = 1;
  const xStep = opts.xStep || 1, yStep = opts.yStep || 1;
  for (let xv = xMin; xv <= xMax; xv += xStep) {
    const px = cx + ((xv - xMin) / (xMax - xMin)) * w;
    ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, cy - h); ctx.stroke();
  }
  for (let yv = yMin; yv <= yMax; yv += yStep) {
    const py = cy - ((yv - yMin) / (yMax - yMin)) * h;
    ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx + w, py); ctx.stroke();
  }
  // 主轴
  ctx.strokeStyle = opts.color || themeColor('axis', opts.theme || 'dark');
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - h); ctx.stroke();
  arrow(ctx, cx + w - 2, cy, cx + w + 8, cy, { color: opts.color });
  arrow(ctx, cx, cy - h + 2, cx, cy - h - 8, { color: opts.color });
  ctx.restore();
  return {
    cx, cy, w, h, xMin, xMax, yMin, yMax,
    toPx: (xv, yv) => [cx + ((xv - xMin) / (xMax - xMin)) * w, cy - ((yv - yMin) / (yMax - yMin)) * h],
  };
}

// —— 点阵/阵列（grid 族用）——
export function dotGrid(ctx, x, y, cols, rows, spacing, opts = {}) {
  ctx.save();
  const r = opts.radius || 6;
  const fill = opts.fill || TOKENS.colors.primary;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const px = x + col * spacing;
      const py = y + row * spacing;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = opts.highlight && opts.highlight(row, col) ? opts.highlightColor || TOKENS.colors.accent : fill;
      ctx.fill();
    }
  }
  ctx.restore();
}

// —— 天平（balance 族用）——
export function balanceScale(ctx, cx, cy, opts = {}) {
  const tilt = opts.tilt || 0; // -1 左重 .. 1 右重
  const armLen = opts.armLen || 120;
  ctx.save();
  // 支柱
  ctx.strokeStyle = '#8a8ffc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + 60);
  ctx.stroke();
  // 底座
  ctx.fillStyle = '#3a4db0';
  roundRect(ctx, cx - 30, cy + 55, 60, 10, 5);
  // 横梁（带倾斜）
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt * 0.15);
  ctx.strokeStyle = '#4f8cff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-armLen, 0);
  ctx.lineTo(armLen, 0);
  ctx.stroke();
  // 左盘
  ctx.beginPath(); ctx.moveTo(-armLen, 0); ctx.lineTo(-armLen, 20); ctx.stroke();
  ctx.fillStyle = 'rgba(79,140,255,.3)';
  roundRect(ctx, -armLen - 25, 20, 50, 12, 6);
  // 右盘
  ctx.beginPath(); ctx.moveTo(armLen, 0); ctx.lineTo(armLen, 20); ctx.stroke();
  ctx.fillStyle = 'rgba(245,158,11,.3)';
  roundRect(ctx, armLen - 25, 20, 50, 12, 6);
  ctx.restore();
  // 支点
  circle(ctx, cx, cy, 6, { fill: '#f59e0b' });
  ctx.restore();
  return { leftX: cx - armLen, rightX: cx + armLen, panY: cy + 20 };
}

// —— 同义词归一：把题目中的实体映射到统一 emoji ——
export const ACTOR_MAP = {
  frog: '🐸', dog: '🐕', cat: '🐈', rabbit: '🐇', bird: '🐦',
  turtle: '🐢', fish: '🐟', butterfly: '🦋', monkey: '🐒',
  person: '🧒', kid: '🧒', boy: '👦', girl: '👧', teacher: '👩‍🏫',
  well: '🕳️', tree: '🌳', sapling: '🌱', sun: '☀️', moon: '🌙',
  cloud: '☁️', apple: '🍎', box: '📦', ball: '⚽', car: '🚗',
  house: '🏠', book: '📖', water: '💧', flower: '🌸', star: '⭐',
  rocket: '🚀', balloon: '🎈', gift: '🎁', clock: '⏰',
};

export function normalizeActor(type) {
  const t = String(type || '').toLowerCase().trim();
  const aliases = {
    '青蛙': 'frog', '蛙': 'frog', '蛤蟆': 'frog',
    '狗': 'dog', '犬': 'dog', '小狗': 'dog', '狗狗': 'dog',
    '猫': 'cat', '猫咪': 'cat', '小猫': 'cat',
    '兔': 'rabbit', '兔子': 'rabbit', '小兔': 'rabbit',
    '鸟': 'bird', '小鸟': 'bird', '鸟儿': 'bird',
    '乌龟': 'turtle', '龟': 'turtle',
    '鱼': 'fish', '小鱼': 'fish',
    '蝴蝶': 'butterfly', '蝶': 'butterfly',
    '猴子': 'monkey', '猴': 'monkey',
    '人': 'person', '小朋友': 'person', '孩子': 'person', '学生': 'person',
    '男孩': 'boy', '女孩': 'girl', '老师': 'teacher',
    '井': 'well', '水井': 'well', '深井': 'well',
    '树': 'tree', '大树': 'tree', '树木': 'tree',
    '树苗': 'sapling', '小树苗': 'sapling',
    '太阳': 'sun', '日': 'sun', '月亮': 'moon', '月': 'moon',
    '云': 'cloud', '云朵': 'cloud',
    '苹果': 'apple', '箱子': 'box', '盒子': 'box',
    '球': 'ball', '小球': 'ball', '汽车': 'car', '车': 'car',
    '房子': 'house', '房屋': 'house', '书': 'book', '书本': 'book',
    '水': 'water', '花': 'flower', '花朵': 'flower',
    '星星': 'star', '星': 'star', '火箭': 'rocket',
    '气球': 'balloon', '礼物': 'gift', '钟': 'clock', '时钟': 'clock',
  };
  const key = aliases[t] || t;
  return { type: key, emoji: ACTOR_MAP[key] || '❓' };
}
