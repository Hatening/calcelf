/**
 * CalcElf 集中配置 —— 所有可调业务值集中在此，不散写页面。
 * v5.3 业务值已拍板：动画并入解题不另扣费；充值包 100/250/600；阈值 30/60/130。
 */
window.CALFELF_CONFIG = {
  // === Credits 消耗 ===
  COST: {
    solve: 2,
    animation: 0, // v5.3：动画课件已并入解题权益，不再单独扣 Credits（后端 lib/credits.js 同步为 0）
    chat: 1,
    voice: 1,
    practice: 1
  },

  // === Credits 四层提醒阈值（已确认）===
  CREDITS_TIERS: {
    rich: 130,    // ≥130 充裕 🌳
    good: 60,     // 60–129 良好 🌿
    low: 30,      // 30–59 偏低 🍂
    alert: 0      // <30 告急 🥀
  },

  // === 单卖 Credits 充值包三档（已确认：100/$4.99、250/$9.99、600/$19.99）===
  TOPUP_PACKS: [
    { id: 'pack100',  credits: 100,  price: 4.99 },
    { id: 'pack250',  credits: 250,  price: 9.99 },
    { id: 'pack600',   credits: 600,  price: 19.99 }
  ],

  // === 会籍套餐 ===
  PLANS: [
    { id: 'student', name: 'Student', price: 4.99,  monthlyCredits: 250,  tag: '' },
    { id: 'plus',     name: 'Plus',    price: 9.99,  monthlyCredits: 800,  tag: 'POPULAR' },
    { id: 'family',  name: 'Family',  price: 19.99, monthlyCredits: 2200, tag: '' }
  ],

  // === 四主题默认学段映射（注册时按年级自动推荐，但用户可自由切换）===
  THEME_GRADE_MAP: {
    story:    '1-3',   // 魔法绘本：低龄 chibi
    elf:      '3-6',   // 精灵乐园：中龄伙伴（默认）
    cloud:    '7-9',   // 云朵书房：学术
    aurora:   '10-12'  // 极光实验室：高级
  },
  DEFAULT_THEME: 'elf',
  DEFAULT_MASCOT_COLOR: 'teal', // teal / blue / purple

  // === 语言 ===
  SUPPORTED_LANGS: ['zh', 'en', 'ja', 'ko', 'fr'],
  DEFAULT_LANG: 'zh'
};
