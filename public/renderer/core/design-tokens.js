// renderer/core/design-tokens.js — 全局设计令牌：颜色/字号/间距/圆角/动效时长
// 所有模式共用，保证视觉一致。明暗主题通过 data-theme 切换。
export const TOKENS = {
  colors: {
    bg: { dark: '#0d1228', light: '#f7f8fc' },
    surface: { dark: '#161d3a', light: '#ffffff' },
    primary: '#4f8cff',      // 蓝 = 个位/主操作
    accent: '#f59e0b',       // 橙 = 十位/强调
    success: '#2fd6a5',      // 绿 = 正确/验证
    danger: '#ef4444',       // 红 = 错误/提醒
    text: { dark: '#eeeefb', light: '#1a1a2e' },
    textDim: { dark: '#8fa4db', light: '#6b7280' },
    well: '#8a8ffc',
    wellBorder: '#3a4db0',
    grid: 'rgba(79,140,255,.15)',
    axis: 'rgba(143,164,219,.5)',
  },
  typography: {
    family: 'system-ui, "PingFang SC", "Noto Sans SC", sans-serif',
    emoji: 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"',
    sizes: { xs: 11, sm: 13, md: 16, lg: 20, xl: 26, xxl: 34 },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 8, md: 14, lg: 20, xl: 28 },
  timing: {
    beatMs: 5000,       // 每拍停留约 5 秒
    transitionMs: 700,  // 对象缓动 0.7s
    holdMs: 1500,       // 结论停留
  },
  progress: {
    dotColors: ['#4f8cff', '#f59e0b', '#2fd6a5'],
  },
};

export function themeColor(key, theme = 'dark') {
  const c = TOKENS.colors[key];
  if (!c) return key;
  return typeof c === 'string' ? c : (c[theme] || c.dark);
}
