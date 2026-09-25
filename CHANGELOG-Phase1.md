# CalcElf Phase 1 变更日志

## v6.0.0 — 知识卡体系 + P0 八族 + 前端交互增强

### 新增：知识卡体系（确定性渲染）
- **渲染引擎**：Canvas 三层架构（core → modes → atoms），port 自验证项目
  - `public/renderer/core/engine.js` — 画布/DPR/动画循环/时间轴/缓动
  - `public/renderer/core/design-tokens.js` — 全局设计令牌
  - `public/renderer/atoms/actors.js` — 演员系统（emoji/数轴/坐标系/天平等）
  - `public/renderer/atoms/ui.js` — UI 原子（进度点/星星/等待精灵/CPA过渡）
- **P0 八族知识卡**（`lib/kards/`）：
  - axis_motion（轴线运动/爬井）
  - motion（相遇/追及/行程）
  - numberline（数轴/整数/分数）
  - bars（条形模型/分数/和差倍/百分比）
  - grid（阵列/乘法/面积）
  - balance（天平/方程/等式）
  - geometry（几何/周长面积/角度）
  - function-graph（函数图像/一次/二次）
- **编排层**：`lib/kards/orchestrator.js` — 路由/级联/缓存/质量门
- **新端点**：`api/kard.js` — 知识卡分类+抽参+渲染参数
- **每族合成样本**：`samples/*.json`，共 185 道（含易错/边界题）
- **无头回测**：63 帧截图证据，零 JS 报错

### 修复：前端输入交互
1. **照片+文字共存**：上传照片后打字/语音不再删图，视为补充说明；文本框标题随情境切换
2. **解题排队**：后台解题时再提交 → 旧题继续跑完扣费，新题排队自动开始
3. **备注分类**：澄清条件融入解题，独立疑问自动进 Ask CalcElf 面板
4. **动画舞台放大**：默认全宽 + 最小高度增加约 30%（桌面 620px/移动 420px）
5. **Practice 锁定持久化**：首次提交即锁死，localStorage 跨刷新保持；提交新题自动重置

### 保留
- free HTML 作为长尾受控兜底（降低 reasoning_effort、25s+25s 超时）
- 静态步骤卡作为最后兜底
- 原有全部功能（登录/支付/聊天/语音/多语言 11 种）

### 质量数据
- 黄金集通过率：183/185 = 98.9%（≥90% 门槛）
- 每族必含图形场景，无纯文字卡
- 无头回测零 JS console 报错
- 运动对象全程不消失
