// ============================================================
// CalcElf 确定性数学验证器（v5.7.0）
// 不依赖大模型、不依赖第三方库：覆盖 K12 高频的
//   1) 纯算术表达式（含分数 a/b、小数、括号、×÷+-）
//   2) 一元一次方程（含两边都含 x、负系数、分数系数）
// 更复杂的题（方程组、几何、证明、物理化学）返回 unverified，
// 由上层决定是否升级模型；严禁把“没验证”显示成“已验证”。
// ============================================================

function normalizeMath(s) {
  return String(s || '')
    .replace(/[−–—]/g, '-')
    .replace(/[×✕✖·•]/g, '*')
    .replace(/[÷∕]/g, '/')
    .replace(/[，]/g, ',')
    .replace(/\s+/g, '')
    .replace(/[?？。;；]+$/g, '');
}

// 递归下降解析器：把含变量 x 的表达式解析为 { a, b }（值 = a*x + b）
function parseLinear(expr) {
  let p = 0;
  const s = expr;
  function peek() { return s[p]; }
  function parseExpr() {
    let v = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = s[p++];
      const r = parseTerm();
      v = op === '+' ? { a: v.a + r.a, b: v.b + r.b } : { a: v.a - r.a, b: v.b - r.b };
    }
    return v;
  }
  function parseTerm() {
    let v = parseFactor();
    while (peek() === '*' || peek() === '/' || peek() === '(' || isImplicitVar()) {
      if (peek() === '*') { p++; const r = parseFactor(); v = mul(v, r); }
      else if (peek() === '/') { p++; const r = parseFactor();
        if (Math.abs(r.a) > 1e-12) throw Error('cannot divide by x');
        v = { a: v.a / r.b, b: v.b / r.b };
      } else {
        // 隐式乘法：2(x+1)、2x、(x+1)3、(x+1)(x-1) 后者不允许（二次）
        const before = p;
        const r = parseFactor();
        if (Math.abs(v.a * r.a) > 1e-12) throw Error('non-linear (x*x)');
        v = mul(v, r);
        if (p === before) break;
      }
    }
    return v;
  }
  function isImplicitVar() {
    const c = peek();
    if (!c) return false;
    if (c === 'x' || c === 'X') return true;
    if (c === '(') {
      // 仅当前一个 token 是数字或 ) 或 x 时才算隐式乘法
      const prev = s[p - 1];
      return prev !== undefined && (/[0-9.)xX]/.test(prev));
    }
    return false;
  }
  function mul(u, v) {
    if (Math.abs(u.a * v.a) > 1e-12) throw Error('non-linear');
    return { a: u.a * v.b + v.a * u.b, b: u.b * v.b };
  }
  function parseFactor() {
    const c = peek();
    if (c === '+') { p++; return parseFactor(); }
    if (c === '-') { p++; const v = parseFactor(); return { a: -v.a, b: -v.b }; }
    if (c === '(') {
      p++; const v = parseExpr();
      if (peek() !== ')') throw Error('missing )');
      p++; return v;
    }
    if (c === 'x' || c === 'X') {
      p++;
      // x 后面紧跟 ( 也算隐式乘法，交给 parseTerm 处理
      return { a: 1, b: 0 };
    }
    // 数字（含小数、分数 a/b）
    const m = /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?/.exec(s.slice(p));
    if (!m) throw Error('unexpected char ' + c);
    p += m[0].length;
    let num = parseFloat(m[1]);
    if (m[2] !== undefined) { const den = parseFloat(m[2]); if (!den) throw Error('div by zero'); num /= den; }
    return { a: 0, b: num };
  }
  const v = parseExpr();
  if (p !== s.length) throw Error('unparsed tail: ' + s.slice(p));
  return v;
}

function evalArithmetic(expr) {
  const v = parseLinear(normalizeMath(expr));
  if (Math.abs(v.a) > 1e-12) throw Error('contains variable');
  return v.b;
}

// 解一元一次方程；返回数值解（分数时返回小数）
function solveLinear(rawEq) {
  const eq = normalizeMath(rawEq).replace(/[?？]/g, '');
  if (!eq.includes('=')) throw Error('not an equation');
  // 变量只能有一种且为 x/X
  const letters = [...new Set((eq.match(/[a-zA-Z]/g) || []))];
  if (letters.length === 0) throw Error('no variable');
  if (letters.length > 1 || (letters[0] !== 'x' && letters[0] !== 'X')) throw Error('unsupported variable');
  if (eq.includes('^') || /x\s*\*\s*x/i.test(eq)) throw Error('non-linear');
  const sides = eq.split('=').map(z => z.trim()).filter(Boolean);
  if (sides.length !== 2) throw Error('multiple equals');
  const L = parseLinear(sides[0]);
  const R = parseLinear(sides[1]);
  const a = L.a - R.a;
  const b = R.b - L.b; // a*x = b
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) throw Error('identity');
    throw Error('no solution');
  }
  return b / a;
}

// 从答案文本里提取数字（支持 x=6、x = -1/2、6 等）
function extractNumber(text) {
  const t = normalizeMath(text);
  const m = t.match(/(-?\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)/);
  if (!m) return null;
  const frac = m[1].split('/');
  if (frac.length === 2) return parseFloat(frac[0]) / parseFloat(frac[1]);
  return parseFloat(frac[0]);
}

function closeEnough(a, b) {
  if (!isFinite(a) || !isFinite(b)) return false;
  const tol = Math.max(1e-6, Math.abs(b) * 1e-4);
  return Math.abs(a - b) <= tol;
}

// 主入口：对解题结果做确定性验证
// 返回 { status:'verified'|'mismatch'|'unverified', expected?, reason? }
function verifyResult(result) {
  try {
    const q = normalizeMath(result?.question_text || '');
    const answerText = String(result?.answer || '');
    const got = extractNumber(answerText);
    if (got === null) return { status: 'unverified', reason: 'answer not numeric' };

    // 1) 一元一次方程
    if (q.includes('=') && /[xX]/.test(q) && !/[a-wyzA-WYZ]/.test(q.replace(/x/gi, ''))) {
      try {
        const expected = solveLinear(q);
        return closeEnough(got, expected)
          ? { status: 'verified', expected: fmt(expected), kind: 'linear_equation' }
          : { status: 'mismatch', expected: fmt(expected), got: fmt(got), kind: 'linear_equation' };
      } catch (e) {
        return { status: 'unverified', reason: 'linear parse: ' + e.message };
      }
    }

    // 2) 纯算术：题目以 = 或 ? 结尾、只含数字与运算符
    const arith = q.replace(/[=?？]/g, '');
    if (/^[0-9+\-*/().]+$/.test(arith) && /[+\-*/]/.test(arith)) {
      try {
        const expected = evalArithmetic(arith);
        return closeEnough(got, expected)
          ? { status: 'verified', expected: fmt(expected), kind: 'arithmetic' }
          : { status: 'mismatch', expected: fmt(expected), got: fmt(got), kind: 'arithmetic' };
      } catch (e) {
        return { status: 'unverified', reason: 'arith parse: ' + e.message };
      }
    }

    return { status: 'unverified', reason: 'unsupported problem type' };
  } catch (e) {
    return { status: 'unverified', reason: e.message };
  }
}

function fmt(n) {
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  return String(Math.round(n * 10000) / 10000);
}

module.exports = { verifyResult, solveLinear, evalArithmetic, normalizeMath };
