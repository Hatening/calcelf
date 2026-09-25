// tests/i18n-batch1-smoke.js — 4 张卡 zh-CN / en / ar 三语 smoke test
const { runCard } = require('../lib/kards/registry.js');
const i18n = require('../lib/kards/i18n.js');

const cases = [
  // motion (meet)
  { card: 'motion', lang: 'zh-CN', problem: '两车相距120千米，甲车每小时行40千米，乙车每小时行20千米，同时相向而行，几小时后相遇？', expect: '2 小时' },
  { card: 'motion', lang: 'en', problem: 'Two cars are 120 km apart, one at 40 km per hour, the other at 20 km per hour, driving toward each other. After how many hours do they meet?', expect: '2 h' },
  { card: 'motion', lang: 'ar', problem: 'سيارتان تبعدان 120 كم، تسير الأولى بسرعة 40 كم في الساعة والثانية 20 كم في الساعة، وتتحركان باتجاه بعضهما. بعد كم ساعة تلتقيان؟', expect: '2 ساعة' },

  // numberline (jump)
  { card: 'numberline', lang: 'zh-CN', problem: '青蛙从3出发，向右跳4格，最后落在几？', expect: '7' },
  { card: 'numberline', lang: 'en', problem: 'Start at 3 on the number line and jump 4 spaces to the right. Where do you land?', expect: '7' },
  { card: 'numberline', lang: 'ar', problem: 'ينطلق من 3 على خط الأعداد ويقفز 4 خانات نحو اليمين. أين يستقر؟', expect: '7' },

  // bars (fraction)
  { card: 'bars', lang: 'zh-CN', problem: '一袋苹果有20个，吃了其中的3/5，吃了多少个？', expect: '12' },
  { card: 'bars', lang: 'en', problem: 'There are 20 apples; 3/5 of them are eaten. How many apples are eaten?', expect: '12' },
  { card: 'bars', lang: 'ar', problem: 'يوجد 20 تفاحة، أكلنا 3/5 منها. كم تفاحة أكلنا؟', expect: '12' },

  // balance (ax+b=c)
  { card: 'balance', lang: 'zh-CN', problem: '解方程 2x + 5 = 17', expect: '6' },
  { card: 'balance', lang: 'en', problem: 'Solve for x: 2x + 5 = 17', expect: '6' },
  { card: 'balance', lang: 'ar', problem: 'حل المعادلة: 2x + 5 = 17', expect: '6' },
];

const hasCJK = (s) => /[\u4e00-\u9fff]/.test(String(s || ''));

(async () => {
  let pass = 0, fail = 0;
  const lines = [];
  for (const c of cases) {
    const res = await runCard(c.card, c.problem, { language: c.lang });
    let ok = true; const msgs = [];
    if (!res.eligible) { ok = false; msgs.push('NOT_ELIGIBLE:' + res.reason); }
    if (res.eligible && String(res.answer).trim() !== c.expect) { ok = false; msgs.push(`ANSWER got=${res.answer} expect=${c.expect}`); }
    // 非中文请求零中文泄漏：检查旁白 + beats + scene label
    if (res.eligible && c.lang !== 'zh-CN') {
      for (const st of (res.steps || [])) if (hasCJK(st.narration)) { ok = false; msgs.push('CN_LEAK_NARR: ' + st.narration); }
      for (const b of (res.renderParams && res.renderParams.beats || [])) if (hasCJK(b.label)) { ok = false; msgs.push('CN_LEAK_BEAT: ' + b.label); }
      const sc = res.renderParams && res.renderParams.scene;
      if (sc && hasCJK(sc.label)) { ok = false; msgs.push('CN_LEAK_SCENE: ' + sc.label); }
      if (res.renderParams && hasCJK(res.renderParams.answer)) { ok = false; msgs.push('CN_LEAK_ANSWER'); }
      if (c.lang === 'ar' && res.renderParams && !res.renderParams.rtl) { ok = false; msgs.push('AR_NOT_RTL'); }
      if (res.renderParams && res.renderParams.language !== c.lang) { ok = false; msgs.push('LANG_FIELD=' + res.renderParams.language); }
    }
    if (ok) { pass++; } else { fail++; }
    const line = `[${ok ? 'PASS' : 'FAIL'}] ${c.card}/${c.lang} :: ${ok ? 'answer=' + res.answer : msgs.join(' | ')}`;
    console.log(line);
    lines.push(line);
    if (res.eligible) {
      console.log('     narr:', (res.steps || []).map(s => s.narration).join('  ||  '));
    }
  }
  console.log(`\nTOTAL pass=${pass}/${cases.length}`);
  process.exit(fail ? 1 : 0);
})();
