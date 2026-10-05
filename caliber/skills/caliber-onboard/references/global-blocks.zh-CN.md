# global-blocks.zh-CN.md — 全局接入 canonical 块（zh-CN）

> 唯一内容源。caliber-onboard Step 3 只许从本文件逐字取块（取围栏内文本，
> 不含围栏行）。块文本已预包裹标记对；标记内版本字面量 = 发布时插件版本，
> 随版本联动批更新（随插件版本号 bump 即联动，不待发布）。
> 改块文本 = 升插件版本 + 记 docs/skills-changelog.md。

## 块：entry

- 档位：core
- 用途：工程任务入口——caliber 定级路由的接入 + 融合条款（不喧宾夺主、
  不抢占既有路由、冲突交用户裁定）。

```markdown
<!-- caliber:global:entry v1.7.5 -->
## 工程任务入口（caliber）

**改动类请求（feature / bugfix / refactor / 迁移 / 多文件操作等）先经 skill `caliber` 定级再执行**——定级决定流程剂量（S/MS 轻、ML 标准、L 全剂量），让流程严谨度随任务复杂度缩放。以下不必绕行：纯问答与查询、用户已给出明确具体指令的小改动、用户明示跳过。

**融合条款**（与本文件其它规则并存时）：
- caliber 是「剂量层」不是「抢占层」：本文件或环境中的其它路由/分诊规则（其它插件的域入口、个人既定流程）管「谁接这个任务」，caliber 管「接了之后用多重的流程」；改动类任务无域路由认领时，先过 caliber 定级。
- 规则间冲突不自动裁决：发现本块与其它规则语义冲突时，向用户报告冲突点并等裁定，不静默覆盖既有规则。
- 多 skill / plugin 共存是常态：定级之后按需组合同环境中的其它组件，单一任务可串联多个插件能力——智能融合是 caliber 的核心特质。
- 规则权威 = 各 skill 原文（插件专属，经 Skill 工具按名调用）；本块与 skill 原文冲突时以原文为准。
<!-- /caliber:global:entry -->
```

## 块：plan-review

- 档位：recommended
- 用途：plan/spec 写完后必过对抗审查的例行纪律。

```markdown
<!-- caliber:global:plan-review v1.7.5 -->
## Plan review 例行流程（caliber）

**写完任何 plan / spec / 实现计划后，先做多视角 review 再交付实现**——plan 的执行者是逐字执行的执行者，plan 里的 bug 会原样变成产物 bug。流程走 skill `plan-review-ritual`：多视角分节（架构→代码质量→测试→性能），每节零发现也要明说「查了什么、为什么没有」。验收标准：不看其他文档的逐字执行者能否照做到底——不行则补全（完整代码、确切期望输出、不留「显然」步骤）。
<!-- /caliber:global:plan-review -->
```

## 块：pipeline

- 档位：recommended
- 用途：三件套流水线要点与稳定裁定（防级别×机制错配）。

```markdown
<!-- caliber:global:pipeline v1.7.5 -->
## caliber 流水线要点

- 三件套：`caliber`（定级路由）→ `plan-forge`（ML/L 级 plan 锻造）→ `plan-review-ritual`（对抗审查）；各级剂量、工序、声部通道以各 skill 原文为准。
- 易错裁定：双声部审查（声部 A+B）是 L 级机制，ML 级不欠声部 B。
- 执行中发现复杂度被低估 → 停下升级，不硬撑（低估即升级）；不可逆操作、歧义、延期决策必停问用户。
<!-- /caliber:global:pipeline -->
```

## 块：subagent

- 档位：optional
- 用途：专业 sub-agent 优先的调度偏好（caliber 班底的消费侧纪律）。

```markdown
<!-- caliber:global:subagent v1.7.5 -->
## Sub-agent 调度偏好

**派发工作给 sub-agent 前，先看可用列表里有没有匹配任务性质的专业化 agent**（代码审查、调试、调研、文档等专用席位）——有合适的优先专业化，general-purpose 只作兜底。专业化 agent 带领域定制的工具集与行为约束（只读不改、置信度门槛、证据引用格式），产出纪律性强于通用 agent。
<!-- /caliber:global:subagent -->
```
