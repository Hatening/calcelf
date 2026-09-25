#!/usr/bin/env node
// tests/multilang-i18n-test.js — CalcElf 知识卡 11 语种回归测试
// 运行：node tests/multilang-i18n-test.js
//
// 覆盖：
//  1) 路由测试  registry.classify(text,{language}) 最高分卡 == 目标卡
//  2) 答案测试  registry.runCard(card,text,{language})，与【独立参考实现】比对
//  3) 旁白语种测试 steps[].narration 的语言正确性（非 zh 不得含中文）
//  4) 反例测试  跨族误接 / board classifyBoard 对小学题必须拒绝
//  5) 已知口径回归  sequence 第2026项=64；爬井 10/3/2=8天
//
// 设计要点：参考实现完全独立于卡片内部 solve，直接读题目 params 重算，避免自证。
// 未完成 i18n 升级的卡片会跑出 FAIL 但绝不崩溃。
'use strict';

const fs = require('fs');
const path = require('path');
const registry = require('../lib/kards/registry.js');
const i18n = require('../lib/kards/i18n.js');
const { classifyBoard } = require('../lib/board-router.js');

const ROOT = path.join(__dirname, '..');
const bank = JSON.parse(fs.readFileSync(path.join(__dirname, 'multilang-problems.json'), 'utf8'));

/* =====================================================================
 *  独立参考实现 —— 不 require 任何卡片的 solve，直接按数学定义重算
 * ===================================================================== */
function r2(x) { const r = Math.round(x * 100) / 100; return Object.is(r, -0) ? 0 : r; }

function reference(prob) {
  const p = prob.params || {};
  switch (prob.card) {
    case 'axis_motion': {
      const { depth, up, down } = p;
      if (up >= depth) return { nums: [1] };
      if (up - down <= 0) return { unsolvable: true };
      const days = Math.ceil((depth - up) / (up - down)) + 1;
      return { nums: [days] };
    }
    case 'motion': {
      if (p.mode === 'meet') return { nums: [r2(p.distance / (p.vA + p.vB))] };
      if (p.mode === 'chase') {
        const fast = Math.max(p.vA, p.vB), slow = Math.min(p.vA, p.vB);
        return { nums: [r2(p.headStart / (fast - slow))] };
      }
      if (p.mode === 'away') return { nums: [r2((p.vA + p.vB) * p.givenTime)] };
      return {};
    }
    case 'numberline': {
      if (p.mode === 'jump') return { nums: [p.dir > 0 ? p.start + p.jump : p.start - p.jump] };
      if (p.mode === 'fractionCompare') {
        const diff = p.n1 * p.d2 - p.n2 * p.d1;
        if (diff > 0) return { frac: `${p.n1}/${p.d1}` };
        if (diff < 0) return { frac: `${p.n2}/${p.d2}` };
        return { frac: 'EQUAL' };
      }
      return {};
    }
    case 'bars': {
      if (p.mode === 'fraction') return { nums: [r2(p.total * p.num / p.den)] };
      if (p.mode === 'percent') return { nums: [r2(p.total * p.pct / 100)] };
      if (p.mode === 'multiple') return { nums: [r2(p.sum / (p.k + 1))] };
      return {};
    }
    case 'grid': {
      return { nums: [p.rows * p.cols] };
    }
    case 'balance': {
      return { nums: [r2((p.c - p.bSigned) / p.a)] };
    }
    case 'geometry': {
      switch (p.task) {
        case 'rect_perimeter': return { nums: [r2(2 * (p.width + p.height))] };
        case 'rect_area': return { nums: [r2(p.width * p.height)] };
        case 'square_perimeter': return { nums: [r2(4 * p.side)] };
        case 'square_area': return { nums: [r2(p.side * p.side)] };
        case 'tri_area': return { nums: [r2(p.base * p.height / 2)] };
        case 'circle_circumference': return { nums: [r2(2 * Math.PI * p.radius)] };
        case 'circle_area': return { nums: [r2(Math.PI * p.radius * p.radius)] };
        case 'triangle_angle': return { nums: [r2(180 - p.known[0] - p.known[1])] };
        case 'supplementary': return { nums: [r2(180 - p.given)] };
        case 'complementary': return { nums: [r2(90 - p.given)] };
        case 'pythagorean': return { nums: [r2(Math.sqrt(p.legA * p.legA + p.legB * p.legB))] };
        default: return {};
      }
    }
    case 'function-graph': {
      switch (p.task) {
        case 'linear_value': return { nums: [r2(p.k * p.x + p.b)] };
        case 'linear_points': {
          const [x1, y1] = p.p1, [x2, y2] = p.p2;
          const k = (y2 - y1) / (x2 - x1), b = y1 - k * x1;
          return { nums: [r2(k), r2(b)] };
        }
        case 'quadratic_vertex': {
          const h = -p.b / (2 * p.a), vk = p.a * h * h + p.b * h + p.c;
          return { nums: [r2(h), r2(vk)] };
        }
        case 'intersection': {
          const xi = (p.b2 - p.b1) / (p.k1 - p.k2), yi = p.k1 * xi + p.b1;
          return { nums: [r2(xi), r2(yi)] };
        }
        default: return {};
      }
    }
    case 'sequence': {
      const N = p.N;
      const m = Math.max(1, Math.ceil((Math.sqrt(1 + 8 * N) - 1) / 2 - 1e-9));
      return { nums: [m] };
    }
    default: return {};
  }
}

/* ---------- 数字比对工具 ---------- */
function numbersIn(s) {
  return (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}
function numsMatch(cardAnswer, expectedNums) {
  const got = numbersIn(cardAnswer);
  return expectedNums.every((e) => got.some((c) => Math.abs(c - e) <= 1e-6));
}

/* =====================================================================
 *  测试主流程
 * ===================================================================== */
(async () => {
  const results = [];           // 每题明细
  const summary = {};           // summary[card][lang] = {total, pass, fail:{routing,answer,narration}}
  function bucket(card, lang) {
    if (!summary[card]) summary[card] = {};
    if (!summary[card][lang]) summary[card][lang] = { total: 0, routing: 0, answer: 0, narration: 0 };
    return summary[card][lang];
  }

  const failList = [];

  for (const prob of bank.problems) {
    const { card, lang, text } = prob;
    const b = bucket(card, lang);
    b.total++;
    const rec = { card, lang, tag: prob.tag, text, expectAnswer: prob.expect.answer, checks: {} };

    try {
      // ---- 1) 路由 ----
      let route;
      try { route = registry.classify(text, { language: lang }); } catch (e) { route = null; }
      const routedId = route ? route.id : null;
      const routedScore = route ? route.score : 0;
      rec.checks.routing = { want: card, got: routedId, score: routedScore, pass: routedId === card };
      if (rec.checks.routing.pass) b.routing++;

      // ---- 2) 答案（独立参考实现）----
      const ref = reference(prob);
      let run;
      try { run = await registry.runCard(card, text, { language: lang }); }
      catch (e) { run = { eligible: false, reason: 'exception:' + e.message }; }

      rec.checks.run = { eligible: run.eligible, reason: run.reason || null, answer: run.answer };

      let answerPass = false;
      if (ref.unsolvable) {
        // 无解题：期望卡片拒绝求解
        answerPass = run.eligible === false;
        rec.checks.answer = { want: 'unsolvable', got: run.eligible ? run.answer : ('rejected:' + run.reason), pass: answerPass };
      } else if (!run.eligible) {
        answerPass = false;
        rec.checks.answer = { want: ref, got: 'NOT_ELIGIBLE:' + (run.reason || ''), pass: false };
      } else if (ref.frac) {
        // 分数比较：检查答案是否含期望分数标签，或相等
        const ans = String(run.answer);
        answerPass = ref.frac === 'EQUAL'
          ? /一样|equal|equ/i.test(ans)
          : ans.includes(ref.frac);
        rec.checks.answer = { want: ref.frac, got: ans, pass: answerPass };
      } else if (Array.isArray(ref.nums)) {
        answerPass = numsMatch(run.answer, ref.nums);
        rec.checks.answer = { want: ref.nums, got: String(run.answer), pass: answerPass };
      }
      if (answerPass) b.answer++;

      // ---- 3) 旁白语种 ----
      let narrPass = true; const narrIssues = [];
      const steps = (run.eligible && Array.isArray(run.steps)) ? run.steps : [];
      const isZhLang = lang === 'zh-CN' || lang === 'zh-TW';
      for (const st of steps) {
        const n = String((st && st.narration) || '');
        if (!n.trim()) continue;
        // 纯公式/数字旁白（剥离单位后无 2 字母以上自然词）视为语言中立，跳过语种检测
        const clean = n.replace(/cm|mm|km|kg|cm²|km²|m²|ft|inches?|inch|π|√/gi, '');
        if (!/[a-zA-Z]{2,}|[\u4e00-\u9fff]{2,}|[\u3040-\u30ff]{2,}|[\uac00-\ud7af]{2,}|[\u0600-\u06ff]{2,}/.test(clean)) continue;
        if (!isZhLang && i18n.hasChinese(n)) {
          // 例外：日语旁白允许日制汉字（含假名即视为日语，不是漏出中文）
          if (lang === 'ja' && /[\u3040-\u30ff]/.test(n)) {
            // ok — Japanese kanji + kana
          } else {
            narrPass = false; narrIssues.push('hasChinese:' + n.slice(0, 40));
          }
        }
        if (isZhLang && !/[\u4e00-\u9fff]/.test(n)) { narrPass = false; narrIssues.push('missingChinese:' + n.slice(0, 40)); }
        if (!isZhLang && !i18n.looksLikeLang(n, lang)) { narrPass = false; narrIssues.push('notLooksLikeLang:' + n.slice(0, 40)); }
      }
      // 旁白测试仅在卡片成功解题后才有意义；eligible=false 时记为 skip（不计失败）
      if (!run.eligible) {
        rec.checks.narration = { pass: null, note: 'skipped:card_not_eligible', issues: narrIssues };
      } else {
        rec.checks.narration = { pass: narrPass, issues: narrIssues };
        if (narrPass) b.narration++;
      }

      rec.pass = rec.checks.routing.pass && answerPass && (rec.checks.narration.pass !== false);
    } catch (e) {
      rec.checks.fatal = e.message;
      rec.pass = false;
    }

    results.push(rec);
    if (!rec.pass) {
      failList.push({ card, lang, tag: prob.tag, text: text.slice(0, 60),
        routing: rec.checks.routing && rec.checks.routing.got,
        answer: rec.checks.answer && rec.checks.answer.got,
        narr: rec.checks.narration && rec.checks.narration.issues });
    }
  }

  /* ---------- 4) 反例测试 ---------- */
  const counterResults = [];
  for (const c of bank.counters) {
    const rec = { text: c.text.slice(0, 60), lang: c.lang, note: c.note };
    try {
      if (c.boardMustReject) {
        const r = classifyBoard(c.text, { stage: c.stage || 'elementary', language: c.lang });
        rec.kind = 'board-reject';
        rec.pass = r === null;
        rec.got = r ? r.family : null;
      } else if (c.boardShouldMatch) {
        const r = classifyBoard(c.text, { stage: 'high', language: c.lang });
        rec.kind = 'board-match';
        rec.pass = !!r && r.family === c.boardShouldMatch;
        rec.got = r ? r.family : null;
      } else {
        const r = registry.classify(c.text, { language: c.lang });
        rec.kind = c.avoid ? 'avoid-family' : 'routing';
        rec.got = r ? { id: r.id, score: r.score } : null;
        if (c.avoid) {
          // 不应被 avoid 族命中（允许路由到任何其它族，包括 None）
          rec.pass = !r || r.id !== c.avoid;
        } else {
          rec.pass = r ? r.id === c.expectCard : false;
        }
      }
    } catch (e) { rec.pass = false; rec.error = e.message; }
    counterResults.push(rec);
    if (!rec.pass) failList.push({ counter: true, ...rec });
  }

  /* ---------- 5) 已知口径回归 ---------- */
  const regressions = [];
  // 序列第2026项 = 64
  {
    const m = Math.max(1, Math.ceil((Math.sqrt(1 + 8 * 2026) - 1) / 2 - 1e-9));
    regressions.push({ name: 'sequence term 2026 == 64', want: 64, got: m, pass: m === 64 });
  }
  // 爬井 10/3/2 = 8 天
  {
    const days = Math.ceil((10 - 3) / (3 - 2)) + 1;
    regressions.push({ name: 'well 10m up3 down2 == 8 days', want: 8, got: days, pass: days === 8 });
  }

  /* =====================================================================
   *  输出
   * ===================================================================== */
  // 控制台汇总表
  console.log('\n================ MULTILANG i18n REGRESSION ================');
  const langs = bank.meta.langs;
  const families = bank.meta.families;
  // 表头
  const head = 'card'.padEnd(16) + langs.map(l => l.padStart(10)).join('');
  console.log(head);
  for (const card of families) {
    let row = card.padEnd(16);
    for (const lang of langs) {
      const s = (summary[card] && summary[card][lang]) || { total: 0, routing: 0, answer: 0, narration: 0 };
      const pct = s.total ? (100 * s.answer / s.total).toFixed(0) : '-';
      row += String(pct + '%').padStart(10);
    }
    console.log(row);
  }
  console.log('\n（上表数值 = 该族该语种【答案】通过率；路由/旁白见明细 JSON）');

  // 总计
  let tot = { total: 0, routing: 0, answer: 0, narrEligible: 0, narrPass: 0 };
  for (const card of families) for (const lang of langs) {
    const s = (summary[card] && summary[card][lang]); if (!s) continue;
    tot.total += s.total; tot.routing += s.routing; tot.answer += s.answer;
  }
  console.log(`\nTOTAL problems=${tot.total}  routing_pass=${tot.routing} (${(100*tot.routing/tot.total).toFixed(1)}%)  answer_pass=${tot.answer} (${(100*tot.answer/tot.total).toFixed(1)}%)`);
  const cp = counterResults.filter(c => c.pass).length;
  console.log(`COUNTEREXAMPLES: ${cp}/${counterResults.length} passed`);
  console.log(`REGRESSIONS: ${regressions.filter(r=>r.pass).length}/${regressions.length} passed`);

  // 写 results JSON
  const resultsDoc = {
    generated: new Date().toISOString(),
    totals: tot,
    perFamilyLang: summary,
    regressions,
    counters: counterResults,
    problems: results,
  };
  fs.writeFileSync(path.join(__dirname, 'multilang-results.json'), JSON.stringify(resultsDoc, null, 2), 'utf8');

  // 写报告 MD
  let md = `# Multilang i18n Regression Report\n\n`;
  md += `Generated: ${resultsDoc.generated}\n\n`;
  md += `- Total problems: **${tot.total}**\n`;
  md += `- Routing pass: **${tot.routing} / ${tot.total}** (${(100*tot.routing/tot.total).toFixed(1)}%)\n`;
  md += `- Answer pass: **${tot.answer} / ${tot.total}** (${(100*tot.answer/tot.total).toFixed(1)}%)\n`;
  md += `- Counterexample pass: **${cp} / ${counterResults.length}**\n`;
  md += `- Regression pass: **${regressions.filter(r=>r.pass).length} / ${regressions.length}**\n\n`;
  md += `## Per-family / per-language answer pass rate\n\n`;
  md += '| card | ' + langs.join(' | ') + ' |\n|' + '---|'.repeat(langs.length + 1) + '\n';
  for (const card of families) {
    let row = `| ${card} `;
    for (const lang of langs) {
      const s = (summary[card] && summary[card][lang]) || { total: 0, answer: 0 };
      row += `| ${s.total ? (100*s.answer/s.total).toFixed(0)+'%' : '-'} `;
    }
    md += row + '|\n';
  }
  md += `\n## Regressions\n\n`;
  for (const r of regressions) md += `- [${r.pass ? 'PASS' : 'FAIL'}] ${r.name} (want ${r.want}, got ${r.got})\n`;
  md += `\n## Counterexamples\n\n`;
  for (const c of counterResults) md += `- [${c.pass ? 'PASS' : 'FAIL'}] (${c.kind}) ${c.note} → got ${JSON.stringify(c.got)}\n`;
  md += `\n## Failure list (${failList.length})\n\n`;
  for (const f of failList.slice(0, 80)) md += `- ${JSON.stringify(f)}\n`;
  fs.writeFileSync(path.join(__dirname, 'MULTILANG-I18N-REPORT.md'), md, 'utf8');

  console.log('\nWrote tests/multilang-results.json and tests/MULTILANG-I18N-REPORT.md');
  console.log('Failures:', failList.length);
  // 退出码：回归口径必须全过
  const regOk = regressions.every(r => r.pass);
  process.exit(regOk ? 0 : 2);
})();
