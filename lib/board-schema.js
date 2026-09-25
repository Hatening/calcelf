// lib/board-schema.js — edulab board JSON 校验器
// 复刻 edulab 判据，服务端在把 board JSON 发给前端 / 写入缓存前做结构校验。
// 目标：拒绝会让渲染器崩掉的畸形结构（constant 写成字符串、trace 写成数组、view 缺 xRange、
// conic 缺关键参数、points 形状不对等），但不过度限制合法的扩展字段
// （functions / datasets / legend / annotations / rangeBar / answerBand 等都放行）。
//
// 导出：validateBoard(board, host) -> { ok: boolean, errors: string[] }
// host: "2d" | "3d" | "solid" | "reaction"

'use strict';

// ---- 枚举白名单（既包含任务规约列出的核心类型，也包含 13 个 lesson 中真实出现的扩展类型）----
const CONIC_KINDS = new Set(['circle', 'ellipse', 'hyperbola', 'parabola']);

// 2d derived 构造类型：解析几何核心 16 种 + 函数图像/向量/统计 lesson 中真实使用的类型
const DERIVED_TYPES_2D = new Set([
  // 解析几何核心（problem-schema.md）
  'line_through_angle', 'line_through_slope', 'line_x_eq_my_c',
  'line_through_points', 'line_through_point_dir',
  'point_on_conic', 'intersect_line_conic', 'intersect_line_line',
  'midpoint', 'foot_perp', 'reflect', 'point_reflect', 'tangent_at',
  'vector', 'segment', 'polygon',
  // 函数图像 lesson（solution-quadratic / normal-distribution）
  'point_on_function', 'tangent_at_function', 'area_under_curve',
  // 向量 lesson（solution-vector-addition）
  'parallelogram', 'vector_components',
  // 统计 lesson（solution-normal-distribution）
  'histogram', 'box_plot',
]);

// 2d readouts 类型：核心 10 种 + 平面几何/函数图像/统计扩展
const READOUT_TYPES_2D = new Set([
  'coord', 'length', 'distance', 'dot', 'slope', 'slope_product',
  'area_triangle', 'distance_point_line', 'expr', 'status',
  // 平面几何（edu-plane-geometry）
  'angle', 'ratio', 'area',
  // 函数图像 lesson
  'function_at', 'derivative_at', 'area_value',
  // 统计 lesson
  'probability', 'mean', 'stddev', 'median',
]);

const OBJECT_TYPES_3D = new Set(['sphere', 'arrow', 'curve']);

// ---- 基础类型判断 ----
// 数值字段允许是 number 或字符串表达式（如 "2*p"），但不能是 object/array/bool
function isNumOrStr(v) {
  return (typeof v === 'number' && isFinite(v)) || typeof v === 'string';
}

// 长度为 n 的向量，元素允许 number/string
function isVecN(v, n) {
  return Array.isArray(v) && v.length === n && v.every(isNumOrStr);
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ============================================================
// 2d board 校验
// ============================================================
function validate2d(board, errors) {
  // board_logic 的控制台是自由结构（venn / truthTable / logicGates），无坐标系，
  // 跳过 view/conics/derived/points 等画板校验，只检查 param/readouts 的基本形状。
  const isLogicConsole =
    board.logicType != null || board.consoleTitle != null ||
    isPlainObject(board.venn) || Array.isArray(board.truthTable) ||
    Array.isArray(board.logicGates);

  // view
  if (!isLogicConsole) {
    if (!isPlainObject(board.view)) {
      errors.push('board.view 必须是对象');
    } else {
      if (!isVecN(board.view.xRange, 2)) errors.push('board.view.xRange 必须是 [number,number]');
      if (!isVecN(board.view.yRange, 2)) errors.push('board.view.yRange 必须是 [number,number]');
    }
  }

  // conics
  if (board.conics != null) {
    if (!Array.isArray(board.conics)) {
      errors.push('board.conics 必须是数组');
    } else {
      board.conics.forEach((c, i) => {
        const p = `board.conics[${i}]`;
        if (!isPlainObject(c)) return errors.push(`${p} 必须是对象`);
        if (typeof c.name !== 'string' || !c.name) errors.push(`${p}.name 必须是非空字符串`);
        if (!CONIC_KINDS.has(c.kind)) errors.push(`${p}.kind 必须是 ${[...CONIC_KINDS].join('/')} 之一`);
        if (c.kind === 'circle' && !isNumOrStr(c.r)) errors.push(`${p}(circle) 必须含 r`);
        if ((c.kind === 'ellipse' || c.kind === 'hyperbola') && (!isNumOrStr(c.a) || !isNumOrStr(c.b))) {
          errors.push(`${p}(${c.kind}) 必须含 a 和 b`);
        }
        if (c.kind === 'parabola' && !isNumOrStr(c.p)) errors.push(`${p}(parabola) 必须含 p`);
      });
    }
  }

  // param（可省略；存在时校验）
  if (board.param != null) {
    if (!isPlainObject(board.param)) {
      errors.push('board.param 必须是对象');
    } else {
      if (typeof board.param.name !== 'string' || !board.param.name) errors.push('board.param.name 必须是非空字符串');
      if (!isNumOrStr(board.param.min)) errors.push('board.param.min 必须是 number 或表达式字符串');
      if (!isNumOrStr(board.param.max)) errors.push('board.param.max 必须是 number 或表达式字符串');
    }
  }

  // scalars
  if (board.scalars != null) {
    if (!Array.isArray(board.scalars)) {
      errors.push('board.scalars 必须是数组');
    } else {
      board.scalars.forEach((s, i) => {
        const p = `board.scalars[${i}]`;
        if (!isPlainObject(s)) return errors.push(`${p} 必须是对象`);
        if (typeof s.name !== 'string' || !s.name) errors.push(`${p}.name 必须是非空字符串`);
        if (typeof s.expr !== 'string') errors.push(`${p}.expr 必须是字符串表达式`);
      });
    }
  }

  // derived
  if (board.derived != null) {
    if (!Array.isArray(board.derived)) {
      errors.push('board.derived 必须是数组');
    } else {
      board.derived.forEach((d, i) => {
        const p = `board.derived[${i}]`;
        if (!isPlainObject(d)) return errors.push(`${p} 必须是对象`);
        if (typeof d.type !== 'string') return errors.push(`${p}.type 必须是字符串`);
        if (!DERIVED_TYPES_2D.has(d.type)) {
          errors.push(`${p}.type="${d.type}" 不在已知 derived 类型枚举中`);
        }
      });
    }
  }

  // readouts
  if (board.readouts != null) {
    if (!Array.isArray(board.readouts)) {
      errors.push('board.readouts 必须是数组');
    } else {
      board.readouts.forEach((r, i) => {
        const p = `board.readouts[${i}]`;
        if (!isPlainObject(r)) return errors.push(`${p} 必须是对象`);
        if (typeof r.id !== 'string' || !r.id) errors.push(`${p}.id 必须是非空字符串`);
        if (typeof r.label !== 'string') errors.push(`${p}.label 必须是字符串`);
        if (typeof r.type !== 'string') return errors.push(`${p}.type 必须是字符串`);
        if (!READOUT_TYPES_2D.has(r.type)) {
          errors.push(`${p}.type="${r.type}" 不在已知 readout 类型枚举中`);
        }
      });
    }
  }

  // constant：必须是对象 {of, label?} 或 null；不得是字符串/数组
  if (board.constant != null && !isPlainObject(board.constant)) {
    errors.push('board.constant 必须是对象 {of, label?} 或 null，不能是字符串/数组');
  } else if (isPlainObject(board.constant) && typeof board.constant.of !== 'string') {
    errors.push('board.constant.of 必须是字符串（指向某个 readout id）');
  }

  // trace：必须是对象 {of, color?} 或 null；不得是字符串/数组
  if (board.trace != null && !isPlainObject(board.trace)) {
    errors.push('board.trace 必须是对象 {of, color?} 或 null，不能是字符串/数组');
  } else if (isPlainObject(board.trace) && board.trace.of == null) {
    errors.push('board.trace.of 必须存在（指向某个点/derived 名或坐标表达式）');
  }

  // points：对象，每个值是 [x,y] | {xy,...} | 几何构造对象 {type,...}
  if (board.points != null) {
    if (!isPlainObject(board.points)) {
      errors.push('board.points 必须是对象');
    } else {
      for (const [name, v] of Object.entries(board.points)) {
        const p = `board.points.${name}`;
        if (isVecN(v, 2)) continue;                                   // [x, y]
        if (isPlainObject(v)) {
          if (v.xy != null) {
            if (!isVecN(v.xy, 2)) errors.push(`${p}.xy 必须是 [x,y]`);
          } else if (typeof v.type === 'string') {
            // 几何构造点（midpoint/foot/intersection/on_ray/reflect/rotate...），放行
          } else {
            errors.push(`${p} 必须含 xy 或 type 字段`);
          }
        } else {
          errors.push(`${p} 必须是 [x,y] 数组或 {xy,...}/{type,...} 对象`);
        }
      }
    }
  }
}

// ============================================================
// 3d board（board3d 结构，字段名统一为 board）校验
// ============================================================
function validate3d(board, errors) {
  if (!isPlainObject(board.view)) {
    errors.push('board.view 必须是对象');
  } else {
    if (board.view.cameraPos != null && !isVecN(board.view.cameraPos, 3)) {
      errors.push('board.view.cameraPos 必须是 [x,y,z]');
    }
    if (board.view.target != null && !isVecN(board.view.target, 3)) {
      errors.push('board.view.target 必须是 [x,y,z]');
    }
  }

  // objects
  if (board.objects != null) {
    if (!Array.isArray(board.objects)) {
      errors.push('board.objects 必须是数组');
    } else {
      board.objects.forEach((o, i) => {
        const p = `board.objects[${i}]`;
        if (!isPlainObject(o)) return errors.push(`${p} 必须是对象`);
        if (!OBJECT_TYPES_3D.has(o.type)) {
          return errors.push(`${p}.type 必须是 sphere/arrow/curve 之一`);
        }
        if (o.type === 'sphere') {
          if (!isVecN(o.position, 3)) errors.push(`${p}(sphere) 必须含 position:[x,y,z]`);
          if (!isNumOrStr(o.radius)) errors.push(`${p}(sphere) 必须含 radius`);
        } else if (o.type === 'arrow') {
          if (!isVecN(o.from, 3)) errors.push(`${p}(arrow) 必须含 from:[x,y,z]`);
          if (!isVecN(o.to, 3)) errors.push(`${p}(arrow) 必须含 to:[x,y,z]`);
        } else if (o.type === 'curve') {
          if (!isPlainObject(o.expr) || o.expr.x == null || o.expr.y == null || o.expr.z == null) {
            errors.push(`${p}(curve) 必须含 expr:{x,y,z}`);
          }
        }
      });
    }
  }

  // param（同 2d）
  if (board.param != null) {
    if (!isPlainObject(board.param)) {
      errors.push('board.param 必须是对象');
    } else {
      if (typeof board.param.name !== 'string' || !board.param.name) errors.push('board.param.name 必须是非空字符串');
      if (!isNumOrStr(board.param.min)) errors.push('board.param.min 必须是 number 或表达式字符串');
      if (!isNumOrStr(board.param.max)) errors.push('board.param.max 必须是 number 或表达式字符串');
    }
  }

  // scalars（同 2d）
  if (board.scalars != null && !Array.isArray(board.scalars)) {
    errors.push('board.scalars 必须是数组');
  } else if (Array.isArray(board.scalars)) {
    board.scalars.forEach((s, i) => {
      if (!isPlainObject(s) || typeof s.name !== 'string' || typeof s.expr !== 'string') {
        errors.push(`board.scalars[${i}] 必须是 {name:string, expr:string}`);
      }
    });
  }

  // readouts：3d 目前主要用 expr
  if (board.readouts != null) {
    if (!Array.isArray(board.readouts)) {
      errors.push('board.readouts 必须是数组');
    } else {
      board.readouts.forEach((r, i) => {
        const p = `board.readouts[${i}]`;
        if (!isPlainObject(r)) return errors.push(`${p} 必须是对象`);
        if (typeof r.id !== 'string' || !r.id) errors.push(`${p}.id 必须是非空字符串`);
        if (typeof r.label !== 'string') errors.push(`${p}.label 必须是字符串`);
      });
    }
  }

  // trace：对象 {of, color?}；of 可是字符串或 [x,y,z] 表达式数组
  if (board.trace != null && !isPlainObject(board.trace)) {
    errors.push('board.trace 必须是对象 {of, color?}');
  } else if (isPlainObject(board.trace) && board.trace.of == null) {
    errors.push('board.trace.of 必须存在');
  }
}

// ============================================================
// solid / reaction：结构较自由，只做基本对象校验
// ============================================================
function validateLoose(board, errors, host) {
  if (!isPlainObject(board)) {
    errors.push(`board 必须是对象（host=${host}）`);
    return;
  }
  if (host === 'solid') {
    // solid 模板读 model 结构：points(对象) + edges(数组)，至少要有一个可视元素
    const hasPoints = isPlainObject(board.points);
    const hasEdges = Array.isArray(board.edges);
    const hasElements = isPlainObject(board.elements);
    if (!hasPoints && !hasEdges && !hasElements && !Array.isArray(board.spheres)) {
      errors.push('solid board 应至少包含 points/edges/elements 之一');
    }
  } else if (host === 'reaction') {
    // reaction 模板结构自由（species/atoms/meta...），要求非空对象即可
    if (Object.keys(board).length === 0) errors.push('reaction board 不能为空对象');
  }
}

// ============================================================
// 主入口
// ============================================================
function validateBoard(board, host) {
  const errors = [];
  if (!isPlainObject(board)) {
    return { ok: false, errors: ['board 必须是对象'] };
  }
  switch (host) {
    case '2d':
      validate2d(board, errors);
      break;
    case '3d':
      validate3d(board, errors);
      break;
    case 'solid':
      validateLoose(board, errors, 'solid');
      break;
    case 'reaction':
      validateLoose(board, errors, 'reaction');
      break;
    default:
      // renderer 等未知 host：仅要求是对象
      if (!isPlainObject(board)) errors.push('board 必须是对象');
  }
  return { ok: errors.length === 0, errors };
}

module.exports = {
  validateBoard,
  CONIC_KINDS,
  DERIVED_TYPES_2D,
  READOUT_TYPES_2D,
  OBJECT_TYPES_3D,
};
