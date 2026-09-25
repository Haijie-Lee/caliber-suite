---
name: ui-forge
description: "Use when a task involves implementing or modifying UI from a visual design artifact (mockup/hifi/tokens) — provides visual baseline extraction, token-gap audit, fidelity checklists, rehearsal pitfalls, and the visual-gate acceptance harness. Not for design creation, code review, or non-visual tasks. 中文触发：UI 还原、视觉稿实现、保真对拍、设计稿验收"
metadata:
  version: "0.2.0"
  source: distilled-from-practice
---

# UI Forge — 视觉正确性 artifact 化装备库

把 UI/视觉任务的「视觉正确性」转化为机器可检查的 artifact（baseline.json / token 差集映射表 / fidelity-report），并持有这些 artifact 的生产协议、检查知识库与验收门。与 plan-forge 同级的横切装备库：caliber 骨架不动，UI 信号命中时各阶段经消费指针读本 skill 对应分件；非 UI 任务零开销。

## 道层三原则

（每条带实证注；出处均为 2026-09-25 AeroFold-ui 三屏切片保真审查——注中「同批」所指。）

①机器可检查 > 模型肉眼 > 编者自评
实证：coder 自报「1:1 还原」与实测差 9 处字号漂移（同批）。

②值必有出处，零出处不进 plan
实证：token 刻度只有 [12,13,14,16,18,24,36,48]，设计实测值 9/11/15/22/30px 无档可挂，就近取整致 9 处字号漂移（2026-09-25 AeroFold-ui 保真审查实测）。

③豁免必登记，登记必清算
实证：固定密钥表状态列竖排在 1200px 视口下设计稿自身同样竖排，属设计窄口表现——未登记豁免时 gate 会把它误报为缺陷（同批实测）。

三条原则是一切设计的取舍序；他节引用用「道层①/②/③」指针，不重复原文。

## 何时使用 / 不使用

- **用**：视觉稿（mockup / hifi / design tokens）驱动的 UI 实现或修改——新页面/组件按稿还原、存量界面按稿整改、设计稿验收。
- **不用**：设计创作（无稿造稿）；代码 diff 审查（归 code-reviewer）；非视觉任务；动效验收 v1 挂起（只登记不判定，见 `references/interaction-motion-checklist.md` 挂起条款）。

## 剂量协议

| 级别 | 剂量 |
|---|---|
| S | 只读 rehearsal-pitfalls 简版 |
| MS | +baseline 提取单屏抽检 |
| ML | 全量：基线 + 差集 + 验收锚 + 彩排增节 + 对拍门 |
| L | +visual-reviewer 基线审查 + 豁免清算裁定 |

术语（随节成文）：

- **验收锚** = 写入 plan 的机器可判视觉期望值（锚点元素 × 属性 × 期望实测值，与测试断言同级、由 visual-gate 判定）。
- **彩排增节** = plan-forge 工序 4 彩排时注入的 UI 点位类型与视觉 pre-mortem，细目在 `references/rehearsal-pitfalls.md`「confusion-hunt 增节」节。

## 消费点契约

UI 信号命中（`docs/designs/` 视觉稿交付物存在 + 任务含页面/组件/视觉还原实现动词）时：选材加跑 ui-forge 视觉基线协议（`caliber/skills/ui-forge/references/visual-baseline-protocol.md`），baseline.json 与 token 差集映射表进选材产物。

（本句与 plan-forge 工序 1 第 6 条双写逐字一致——单侧漂移即失效，维护义务见 §版本刻度。）

五阶段消费表：

| 消费点 | 读取 |
|---|---|
| caliber 阶段 2 选材 | `references/visual-baseline-protocol.md` |
| caliber 阶段 3 彩排 | `references/rehearsal-pitfalls.md`（confusion-hunt 增节） |
| caliber 阶段 4 注入 | §注入节（阶段 4 样式纪律）一条 |
| caliber 阶段 5 验证 | `scripts/visual-gate.mjs` 对拍门 |
| campaign gate | fidelity-report 消费点（定义见下） |

campaign gate 消费点定义：campaign 单元 gate 两判据 = ①`fidelity-report.md` 文件存在且非空 ②单元 lint_cmd 复跑串联 visual-gate.mjs，退出码 1 = gate 红。

## 注入节（阶段 4 样式纪律）

样式值只能来自 baseline 映射表/token 差集映射表；表内无档时禁止就近取整或自造值——记 FIDELITY-LOG（或并入该仓 DRIFT-LOG）一行待清算，按最近档占位并标注。

术语（随节成文）：**DRIFT-LOG** = 目标仓既有的 append-only 漂移登记表（如 AeroFold-ui `docs/api/DRIFT-LOG.md`）；仓无 DRIFT-LOG 时建 `FIDELITY-LOG.md` 于该仓 docs/ 下同制（append-only，每条 = selector/prop/占位值/待清算触发器）。

## 管四件 / 不管六件

**管四件**：

1. 视觉基线生产（提取协议 + 脚本 + token 差集审计）
2. 保真检查知识库（references 五件 + 判例回流）
3. 视觉验收门（visual-gate 脚本 + 报告协议 + 豁免机制）
4. visual-reviewer 席位定义（三形态 + 零背景纪律）

**不管六件**（各归既有主）：

- 定级停止点台账归 caliber
- plan 写作归 plan-forge/plan-drafting
- 代码实现归 coding-forge
- 代码 diff 审查归 code-reviewer
- 设计优劣归用户/设计交付物
- 动效验收 v1 挂起（重审触发器 = 首个含明确动效需求的 UI 任务出现）

## 与既有 skill 的关系

| 组件 | 关系 |
|---|---|
| caliber | 骨架宿主：定级/停止点/台账/六阶段不动；UI 信号命中时经 §消费点契约 各阶段读指针进入本 skill |
| plan-forge | plan 写作主：工序 1 选材第 6 条 = §消费点契约 双写句；工序 4 彩排经 checklists.md 指针读 rehearsal-pitfalls |
| plan-drafting | MS 级 plan 起草主；MS 档剂量（+baseline 单屏抽检）随其轻量 plan 落地 |
| coding-forge | 代码实现主：编码任务归它；本 skill 只供 §注入节 样式纪律与验收锚 |
| campaign | 单元 gate 消费 fidelity-report（两判据见 §消费点契约）；本 skill 不进 campaign 编排 |
| visual-reviewer | 班底席位：三形态与零背景纪律定义在 `caliber/agents/visual-reviewer.md`；席位定义权归本 skill（管四件④） |

## 版本刻度

版本刻度：0.1.0 起步，小调整 +0.0.1、大调整 +0.1，不承诺 1.0.0（2026-09-25 用户裁定）。

changelog 归工作仓 `docs/skills-changelog.md`（升序；skill 文件不携带 changelog——2026-09-25 用户裁定：log 只记工作仓，不进发布仓）。双写义务：§消费点契约 的 UI 信号句与 plan-forge 工序 1 第 6 条逐字一致——任何一侧改动须双侧同步 + cmp 验证。
