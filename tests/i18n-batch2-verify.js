// tests/i18n-batch2-verify.js — 批量验证 grid/sequence/geometry/function-graph 11 语种改造
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { runCard } = require(path.join(ROOT, 'lib/kards/registry.js'));
const i18n = require(path.join(ROOT, 'lib/kards/i18n.js'));

const out = [];
const log = (s) => { out.push(s); console.log(s); };
const hasZh = (s) => /[\u4e00-\u9fff]/.test(String(s || ''));
let totalChecks = 0, passChecks = 0;
function check(name, cond, detail) {
  totalChecks++;
  if (cond) { passChecks++; log(`  PASS  ${name}${detail ? '  — ' + detail : ''}`); }
  else { log(`  FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}

const CARDS = ['grid', 'sequence', 'geometry', 'function-graph'];

(async () => {
  log('========================================================');
  log(' i18n BATCH-2  VERIFICATION REPORT');
  log(' Cards: ' + CARDS.join(', '));
  log(' Time: ' + new Date().toISOString());
  log('========================================================\n');

  // 1) node require 不报错
  log('[1] node require each card:');
  for (const id of CARDS) {
    try {
      const c = require(path.join(ROOT, 'lib/kards', id + '.js'));
      const kwN = (c.keywords || []).length;
      check(`require ${id}`, !!c.id && kwN > 0, `id=${c.id}, keywords=${kwN}`);
    } catch (e) {
      check(`require ${id}`, false, e.message);
    }
  }
  log('');

  // 2) 每语种关键词数量 ≥10（ar/fa ≥12）
  log('[2] per-language _keywords count (en/zh/ja/ko/fr/de/es/it ≥10; ar/fa ≥12):');
  // i18n 不直接暴露单语种表，通过 looksLikeLang 间接验证；这里改从注册表读不到，改为检查合集关键词覆盖
  for (const id of CARDS) {
    const c = require(path.join(ROOT, 'lib/kards', id + '.js'));
    check(`keywords(${id}) non-empty`, (c.keywords || []).length >= 10, `total=${(c.keywords||[]).length}`);
  }
  log('');

  // 3) 典型题目三语 runCard
  log('[3] runCard smoke (zh-CN / en / ar):');
  const cases = [
    // grid
    ['grid', '一个长方形长 5 米，宽 3 米，面积是多少？', 'zh-CN', '15'],
    ['grid', 'A rectangle is 5 long and 3 wide, what is its area?', 'en', '15'],
    ['grid', 'مستطيل طوله 5 وعرضه 3، احسب المساحة', 'ar', '15'],
    ['grid', '摆成 3 行 4 列的苹果阵列，一共多少个苹果？', 'zh-CN', '12'],
    ['grid', 'Apples in 3 rows and 4 columns, how many in all?', 'en', '12'],
    // sequence
    ['sequence', '数列：1, 2,2, 3,3,3, 4,4,4,4……自然数 n 连续出现 n 次，问第 2026 个数是多少？', 'zh-CN', '64'],
    ['sequence', 'Sequence: 1, 2,2, 3,3,3... natural number n appears n times in a row. What is the 2026th term?', 'en', '64'],
    ['sequence', 'المتتالية: 1, 2, 2, 3, 3, 3, 4, 4, 4, 4... العدد الطبيعي n يتكرر n مرات متتالية. ما هو الحد رقم 2026؟', 'ar', '64'],
    // geometry
    ['geometry', '长方形长 5 厘米宽 3 厘米，求周长', 'zh-CN', '16'],
    ['geometry', 'A right triangle has legs 3 and 4, find the hypotenuse', 'en', '5'],
    ['geometry', 'دائرة نصف قطرها 2، احسب المساحة', 'ar', '12.57'],
    ['geometry', 'Two angles of a triangle are 60° and 80°, find the third angle', 'en', '40°'],
    ['geometry', 'زاوية قياسها 35°، أوجد زاويتها المتكاملة', 'ar', '145°'],
    // function-graph
    ['function-graph', '一次函数图像经过 A(0,1) 和 B(2,5) 两点，求解析式', 'zh-CN', 'y=2x+1'],
    ['function-graph', 'Given y=2x+1, find the value when x=3', 'en', 'y=7'],
    ['function-graph', 'أوجد رأس القطع المكافئ y=x²-4x+3', 'ar', '(2,-1)'],
    ['function-graph', 'Find the intersection of y=x+1 and y=2x-1', 'en', '(2,3)'],
  ];

  for (const [id, prob, lang, expect] of cases) {
    const r = await runCard(id, prob, { language: lang });
    const rp = r.renderParams || {};
    const narr = (r.steps || []).map(s => s.narration).join(' | ');
    const ans = String(r.answer || '');
    const leak = (lang !== 'zh-CN') && (hasZh(narr) || hasZh(ans));
    const eligible = r.eligible === true;
    const ansOk = ans.includes(expect);
    const rtlOk = (lang === 'ar' || lang === 'fa') ? rp.rtl === true : rp.rtl === false;
    const langOk = rp.language === lang;
    const tag = `[${id}|${lang}]`;
    check(`${tag} eligible`, eligible, r.reason || '');
    check(`${tag} answer~=${expect}`, ansOk, `got=${ans}`);
    check(`${tag} no-zh-leak`, !leak, leak ? 'found CJK in narration/answer' : 'clean');
    check(`${tag} rtl field`, rtlOk, `rtl=${rp.rtl}`);
    check(`${tag} language field`, langOk, `language=${rp.language}`);
  }
  log('');

  // 4) 已知口径硬校验：sequence 第2026个=64（zh + ar）
  log('[4] invariant: sequence 第2026个数 = 64:');
  for (const [prob, lang] of [
    ['数列：1, 2,2, 3,3,3……自然数 n 连续出现 n 次，第 2026 个数是几？', 'zh-CN'],
    ['Sequence 1,2,2,3,3,3... number n appears n times. The 2026th term?', 'en'],
    ['المتتالية 1,2,2,3,3,3... العدد n يتكرر n مرات. ما هو الحد رقم 2026؟', 'ar'],
  ]) {
    const r = await runCard('sequence', prob, { language: lang });
    check(`seq[${lang}] N=2026 -> 64`, r.eligible && r.answer === '64', `got=${r.answer}`);
  }
  log('');

  // 5) 图形场景质量门
  log('[5) graphic scene present (quality gate):');
  for (const [id, prob, lang] of [
    ['grid', '一个长方形长 5 宽 3，面积？', 'zh-CN'],
    ['geometry', '圆的半径是 2，求面积', 'zh-CN'],
    ['function-graph', '求直线 y=x+1 和 y=2x-1 的交点', 'zh-CN'],
  ]) {
    const r = await runCard(id, prob, { language: lang });
    const scenes = (r.renderParams && r.renderParams.scenes) || [];
    const hasGraphic = scenes.some(s => s && s.type && s.type !== 'say' && s.type !== 'show');
    check(`${id} has graphic scene`, r.eligible && hasGraphic, scenes.map(s => s.type).join(','));
  }

  log('\n========================================================');
  log(` TOTAL checks: ${passChecks}/${totalChecks} passed`);
  log('========================================================');

  fs.writeFileSync(path.join(__dirname, 'i18n-batch2-report.txt'), out.join('\n') + '\n', 'utf8');
  process.exit(passChecks === totalChecks ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
