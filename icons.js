/* ============================================================
 * CalcElf v5.6.5 自绘 SVG 图标系统（替代 low 的 emoji）
 * 纯内联 SVG、currentColor 取色、圆润描边，全站统一。
 * 用法：calfIcon('star') 或 calfIcon('star','ic-lg')
 * ============================================================ */
(function () {
  const P = {
    // 通用圆润描边参数
    fill: 'none', stroke: 'currentColor', sw: 2,
    line: 'round', join: 'round'
  };
  const I = {
    // 识别题目：铅笔纸
    pencil: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M13.5 6.5l3 3"/>',
    // 解题思路：灯泡
    bulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.7 10.7c.7.6 1.2 1.4 1.3 2.3h4.8c.1-.9.6-1.7 1.3-2.3A6 6 0 0 0 12 3z"/>',
    // 动画：场记板
    film: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 9h18"/><path d="M8 6 6.5 3.5M13 6l-1.5-2.5M18 6l-1.5-2.5"/><circle cx="12" cy="14.5" r="2.4"/>',
    // 提问对话
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    // 练习：靶心
    target: '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    // 放大镜（开始解题）
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    // 正确：勾
    check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
    // 大拇指
    thumb: '<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3z"/><path d="M7 11l4.5-7a2.2 2.2 0 0 1 3.8 2.1L14 9h5.2a2 2 0 0 1 2 2.4l-1 6A2 2 0 0 1 18.2 19H7"/>',
    // 错误：哭丧脸（不用钢叉）
    sad: '<circle cx="12" cy="12" r="9"/><path d="M8.5 16s1.2-2 3.5-2 3.5 2 3.5 2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.6"/>',
    // 笑脸
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.6"/>',
    // 大脑/过程
    brain: '<path d="M9.5 4.5a2.6 2.6 0 0 0-2.6 2.6A2.8 2.8 0 0 0 5 12.2a2.6 2.6 0 0 0 1.6 3.4A2.7 2.7 0 0 0 9.5 20a2.4 2.4 0 0 0 2.5-2.3V6.6A2.4 2.4 0 0 0 9.5 4.5z"/><path d="M14.5 4.5a2.6 2.6 0 0 1 2.6 2.6A2.8 2.8 0 0 1 19 12.2a2.6 2.6 0 0 1-1.6 3.4A2.7 2.7 0 0 1 14.5 20a2.4 2.4 0 0 1-2.5-2.3"/>',
    // 星星（描边）
    star: '<path d="m12 3.5 2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.5 6.9 19.2l1-5.7-4.1-4 5.7-.8z"/>',
    // 星星（实心 Q 版）
    starFill: '<path d="m12 3.2 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.5l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
    // 锁
    lock: '<rect x="5" y="11" width="14" height="9" rx="2.4"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>',
    // 发送
    send: '<path d="M21 4 3.5 11.2c-.7.3-.6 1.3.1 1.5l4.4 1.3 1.6 4.6c.2.7 1.1.8 1.5.2L21 4z"/><path d="m9.6 14 11.4-10"/>',
    // 闪光/魔法
    sparkle: '<path d="M12 4l1.7 4.8L18.5 10.5 13.7 12.2 12 17l-1.7-4.8L5.5 10.5l4.8-1.7z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" fill="currentColor" stroke="none"/>',
    // 水滴/浇水
    drop: '<path d="M12 3.5s6 6.4 6 10.3a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z"/>',
    // 礼物
    gift: '<rect x="3.5" y="9" width="17" height="11" rx="2"/><path d="M4 13h16"/><path d="M12 9v11"/><path d="M12 9S10.4 5 8.2 5.4 9.8 9 12 9zm0 0s1.6-4 3.8-3.6S14.2 9 12 9z"/>',
    // 答案标签
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2.2 3.5L17 11H5"/>',
    // 刷新/重试
    retry: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    // 全屏
    expand: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
    // 步骤数字圆点由 CSS 处理
    // 邮件
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>'
  };
  function calfIcon(name, cls) {
    const body = I[name];
    if (!body) return '';
    const filled = /fill="currentColor"/.test(body);
    return `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
      fill="${filled ? 'none' : 'none'}" stroke="currentColor" stroke-width="${P.sw}"
      stroke-linecap="${P.line}" stroke-linejoin="${P.join}">${body}</svg>`;
  }
  window.calfIcon = calfIcon;

  // 标题图标映射（data-icon → 图标名）
  window.CALF_TITLE_ICONS = {
    resultTitle: 'pencil', solutionTitle: 'bulb', animTitle: 'film',
    chatTitle: 'chat', practiceTitle: 'target'
  };

  // 去掉文案开头的 emoji，便于用 SVG 图标替代
  window.calfStripEmoji = function (s) {
    return String(s == null ? '' : s)
      .replace(/^[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]+/gu, '')
      .replace(/^\s+/, '');
  };

  // 动画加载：小精灵坐在云上挥魔法棒（纯 SVG/CSS，轻量）
  window.calfAnimWizard = function () {
    return ''
      + '<div class="awz">'
      +  '<svg class="awz-swirl" viewBox="0 0 200 170" aria-hidden="true">'
      +  '<defs><linearGradient id="awzSg" x1="0" y1="0" x2="1" y2="1">'
      +  '<stop offset="0" stop-color="#7dd3fc"/><stop offset=".55" stop-color="#a78bfa"/><stop offset="1" stop-color="#fde68a"/></linearGradient></defs>'
      +  '<ellipse cx="100" cy="96" rx="80" ry="44" fill="none" stroke="url(#awzSg)" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 14" opacity=".85"/>'
      +  '<g class="awz-g g1" font-family="Arial,sans-serif" font-weight="800" font-size="22" fill="#3b82f6"><text x="26" y="60">×</text></g>'
      +  '<g class="awz-g g2" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="#f59e0b"><text x="160" y="56">+</text></g>'
      +  '<g class="awz-g g3" font-family="Arial,sans-serif" font-weight="800" font-size="20" fill="#8b5cf6"><text x="150" y="128">÷</text></g>'
      +  '<g class="awz-g g4" font-family="Arial,sans-serif" font-weight="800" font-size="16" fill="#fbbf24"><text x="34" y="126">✦</text></g>'
      +  '</svg>'
      +  '<svg class="awz-cloud" viewBox="0 0 160 60" aria-hidden="true">'
      +  '<g fill="#ffffff" stroke="#e3edff" stroke-width="2">'
      +  '<ellipse cx="52" cy="40" rx="34" ry="17"/><ellipse cx="86" cy="32" rx="30" ry="20"/><ellipse cx="112" cy="42" rx="30" ry="15"/></g></svg>'
      +  '<img class="awz-mascot" src="/calcelf-logo.png" alt="">'
      +  '<svg class="awz-wand" viewBox="0 0 80 92" aria-hidden="true">'
      +  '<line x1="26" y1="74" x2="52" y2="30" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>'
      +  '<path d="M55 4 L60 18 L75 22 L60 27 L55 41 L50 27 L35 22 L50 18 Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>'
      +  '<circle cx="55" cy="22" r="3.4" fill="#fff7d6"/></svg>'
      + '</div>';
  };
})();