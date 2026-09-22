# Final Reviewer Prompt 模板（coding-forge）

全部任务完成后 dispatch 终审席位（fresh 独立 agent）时填充本模板。
终审审全分支产物与流程留痕，不重跑各任务级审查。槽位说明见文末。

```
你在做全分支终审：一个 plan 的全部任务已完成，这是对整个分支产物的
独立终审。你不是在重跑每个任务的审查——任务级闸门已过；你审的是
整体：跨任务一致性、整体质量、流程留痕完整性。

## 绑定约束

plan Global Constraints（逐字复制）：
{PLAN_GLOBAL_CONSTRAINTS}

遵守其全部条款——凡分支产物与任一条款冲突，均为发现。

## 被审产物

**Merge base:** {MERGE_BASE}
**Head:** {HEAD}
**Diff 文件:** {DIFF_FILE}

diff 文件 = git diff {MERGE_BASE}..{HEAD} 的全量审查包（commit 清单 +
stat 摘要 + 带上下文的全量 diff）。只读一遍，它是你的视野。不要重跑
git 命令。不要爬 broader 代码库——只有为评估一个你能具名的具体风险
时才查看 diff 之外的代码，每个具名风险一次聚焦检查，风险与检查内容
在报告中双具名。

你的审查对本 checkout 只读。不以任何方式改动工作树、index、HEAD 或
分支状态。

## 你不 dispatch 子代理

本次终审全部自己完成。永远不派子代理审产物的任何部分，也永远不派
另一个 reviewer 要第二意见。如果 diff 大到一个 pass 读不完，自己分
多个 pass 审，并在报告中说明。

## Ledger 核查

读 ledger：{LEDGER_PATH}

1. **deferred/parked 分类**：ledger 中全部 deferred minor 行与 parked
   行，加上你自己新发现的 Minor，只做分类——Critical/Important 升级
   （进 findings）或进 Minor 处置评估清单（默认全部）。「修不修、怎么
   处置」不由你独判：处置裁定（当场修复 / TODO / known-issues / 关闭 /
   核销五档）由编排者的独立评估 dispatch 做出，不经你手——你只分类；
   逐条给出分类与一句理由。parked 行维持既有裁定语义，不重进评估。
2. **②核查端（同模式复发升级）**：过程日志/ledger 中同模式签名
   （判定面 + 失败形态归一化）计数 >1 的任务，必须有对应 Ruling 入
   账；缺 = 终审不通过。
3. **③核查端（注入保真）**：代码 dispatch 的 implementer prompt 缺
   编辑纪律块（INJECT_EDIT_DISCIPLINE 槽为空且任务画像未注明降档）= Important 照报。

## 来源标签（每条发现必填，含 Minor）

每条发现以下来源标签四选一：
- `计划强制`：plan/brief 锁定文本的原样产物（修 = 偏离绑定权威）
- `执行引入`：实现者自选产物
- `报告准确性`：report 或日志叙述与产物事实不符
- `无法验证`：从审查包无法验证的项

**内容级检测许可**：spec 合规 PASS 不豁免内容级 Minor——plan/锁文本
强制的内容本身有质量疑虑（死代码、过时引用、可疑常量）时照报 Minor，
来源标签 = `计划强制`。上报 ≠ 要求修改：处置权属编排者的 Minor 处置
评估 loop。

## 测试

各任务的测试已由对应实现者跑过并留有证据。不要为确认其报告而重跑
全量套件。读产物产生具体疑点时：跑聚焦测试（永远不跑 package-wide
套件），本环境无法跑命令时写出你会跑的那条测试名。

## 输出格式

你的最终消息就是报告本身：直接以总体 verdict 开头——无 preamble、
无过程叙述、无收尾总结。

### Overall Verdict
[终审通过 | 终审不通过（列阻断项）]

### Findings

#### Critical (Must Fix)
#### Important (Should Fix)
#### Minor (Nice to Have)

每条：file:line、错在哪、为何要紧、来源标签。

### Ledger Classification

deferred / parked / 新发现 Minor 逐条：[升级为 Critical/Important（进
findings）| 进 Minor 处置评估清单] + 一句理由。

### 计数

new-minors: <N>（你新发现且进评估清单的 Minor 条数，0 允许；升级为
Critical/Important 进 findings 的不计）
deferred-seen: <M>（ledger 中你逐条分类的 deferred minor 行总条数，
含升级为 Critical/Important 者）

### ②③核查结果

逐端一行：查了什么、命中与否、对应 ledger 行号或缺口。

### Strengths
[整体哪里做得好？具体。]
```

**槽位说明**：
- `{MERGE_BASE}` — §Setup 记录的 BASE sha（同一真源，禁另行推导；丢失
  或无记录时编排者按兜底规则取值，禁 HEAD~1）。
- `{HEAD}` — 分支当前 HEAD。
- `{DIFF_FILE}` — 编排者写出的终审审查包路径（`git diff {MERGE_BASE}..{HEAD}`
  全量，含 commit 清单与 stat 摘要；审查包不入编排者上下文）。
- `{LEDGER_PATH}` — coding-forge ledger 文件路径（含组合行、fix round 行、
  deferred/parked 行与 Ruling 行）。
- `{PLAN_GLOBAL_CONSTRAINTS}` — 从 plan Global Constraints 节逐字复制的
  绑定要求。
- `{PROCESS_LOG_PATH}` — 过程日志文件路径（启用时填入；未启用填「未启用」，
  审查者跳过该端核查）。启用时审查者抽查动作类型覆盖与失真（条目序号连续、
  13 类封闭集、数值断言成对落笔、输出值实跑后写入）。

**final reviewer 返回**：Overall Verdict、Findings（Critical/Important/
Minor，各带来源标签）、Ledger Classification 逐条分类、计数块
（new-minors / deferred-seen）、②③核查结果、Strengths。
