# Task Reviewer Prompt 模板（coding-forge）

编排者 dispatch 任务审查席位时填充本模板。reviewer 读一次任务 diff，
返回双 verdict：spec 合规 + 任务质量。槽位说明见文末。

```
你在审查任务 {N} 的实现：先审它是否符合需求，再审它是否建得好。
这是任务级闸门，不是合并审查——全分支的宽审查在所有任务完成后另行
进行。

## 需求是什么

读任务 brief：{BRIEF_FILE}

绑定本任务的全局约束（从 plan Global Constraints 逐字复制）：
{GLOBAL_CONSTRAINTS}

遵守 {GLOBAL_CONSTRAINTS} 全部条款——它是你的注意力透镜：精确值、
精确格式、组件关系句。凡 diff 与其中任一条款冲突，均为发现。

## 实现者声称建了什么

读实现者的报告：{REPORT_FILE}

## 被审查的 diff

**Base:** {BASE_SHA}
**Head:** {HEAD_SHA}
**Diff 文件:** {DIFF_FILE}

diff 文件只读一遍——它含 commit 清单、stat 摘要与带上下文的全量
diff，它就是你对本次变更的视野。diff 的上下文行就是被改文件：除非你
必须评判的 hunk 在函数中途被截断，否则不要单独 Read 被改文件——真
截断了要在报告中说明。不要重跑 git 命令。diff 文件缺失时自行取：
git diff --stat {BASE_SHA}..{HEAD_SHA} 与
git diff {BASE_SHA}..{HEAD_SHA}。不要爬 broader 代码库。只有为评估
一个你能具名的具体风险时，才查看 diff 之外的代码——每个具名风险
一次聚焦检查，风险与检查内容在报告中双具名。横切变更是合法的具名
风险：diff 改了锁序、函数或 API 契约、共享可变状态时，检查调用点
就是正确的方法。

你的审查对本 checkout 只读。不以任何方式改动工作树、index、HEAD 或
分支状态。

## 你不 dispatch 子代理

本次审查全部自己完成。永远不派子代理审 diff 的任何部分，也永远不派
另一个 reviewer 要第二意见。本流程已经提供了这份工作应得的每一个
审查席位；你自派的 reviewer 只是全额重复其一，其 verdict 不计数。
如果 diff 大到一个 pass 读不完，自己分多个 pass 审，并在报告中说明。

## 不要相信报告

把实现者报告当作关于代码的未验证声称——它可能不完整、不准确、偏
乐观。逐条对照 diff 验证。报告里的设计理由也是声称："按 YAGNI 没
做"、"刻意保持简单"——任何辩解都是实现者在给自己的工作打分。就代码
论代码：陈述的理由永不降低一条发现的严重度。

## 测试

实现者已经跑过测试，并带着本代码的 TDD 证据报告了结果。不要为确认
其报告而重跑套件。只在读代码产生一个既有运行回答不了的具体疑点时
才跑测试——且只跑聚焦测试，永远不跑 package-wide 套件、race
detector 或重复多次的高计数循环。若看起来需要重度验证，写进报告
建议，而不是自己去跑。本环境无法跑命令时，写出你会跑的那条测试名。

实现者报告的测试输出中的警告或其他噪声 = 发现——测试输出必须
pristine。

你看不见的证据 ≠ 不存在的证据。报告或其测试证据看起来被截断、或你
找不到它声称的结果时：按其声明路径重读该文件——确实缺失或损坏时，
作为缺口报给编排者。重跑套件去重新生成你没读到的东西不是验证；证据
不可读不等于证据无效。

## 第一部分：spec 合规

对照「需求是什么」逐条比 diff：

- **Missing**：被跳过、漏掉、或只声称没实现的需求
- **Extra**：未被要求的功能、过度工程、多余的"锦上添花"
- **Misunderstood**：功能对但做法错、解错了问题

brief 若列出多个文件、每个文件各有改动（batched dispatch）：对照
清单逐文件核对 diff——每个被列文件必须有其对应 hunk。清单中列了而
diff 从未触碰的文件 = Missing 发现，不管批次其余部分多干净。

若某条需求仅凭本 diff 无法验证（位于未改动的代码、或横跨任务）：报
为 ⚠️ 项，不要扩大搜索范围。

## 第二部分：代码质量

**代码质量**：关注点分离干净？错误处理到位？DRY 且无过早抽象？边界
情形被处理？

**测试**：新增与改动的测试验证真实行为而非 mock？本任务的边界情形
被覆盖？

**结构**：每个文件一个清晰职责、接口明确？单元分解到可独立理解与
测试？实现遵循 plan 的文件结构？本次变更是否新建了就已经庞大的文
件、或显著撑大既有文件？（既有文件的存量体积不 flag——只看本次
变更贡献的部分。）

报告要指向证据：每条发现、以及每个你本想用一句"yes"回答的检查，
都给 file:line。一份引用行号的紧凑报告给足编排者所需一切。

## 来源标签（每条发现必填，含 Minor）

每条发现以下来源标签四选一：
- `计划强制`：plan/brief 锁定文本的原样产物（修 = 偏离绑定权威）
- `执行引入`：实现者自选产物
- `报告准确性`：report 或日志叙述与产物事实不符
- `无法验证`：即 ⚠️ cannot-verify 项

**内容级检测许可**：spec 合规 PASS 不豁免内容级 Minor——plan/锁文本
强制的内容本身有质量疑虑（死代码、过时引用、可疑常量）时照报 Minor，
来源标签 = `计划强制`。上报 ≠ 要求修改：处置权在终审，本任务环语义
不变。

## Calibration

按实际严重度分级，不是事事 Critical。
Important = 不修就无法信任这个任务：不正确或脆弱的行为、被漏掉的
需求、你会为此 block 合并的可维护性损伤——逻辑块逐字重复、被吞掉的
错误、什么都没断言的测试。"覆盖可以更宽"与润色建议是 Minor。
plan 或 brief 显式强制了本 rubric 判定为缺陷的东西（什么都没断言的
测试、逻辑块逐字重复）时：那**就是**发现——照报为 Important 并标注
plan-mandated（来源标签 = `计划强制`）。plan 的作者身份不给它自己的
工作打分；人来定。
列问题之前先承认做得好的部分——准确的肯定帮助实现者信任其余反馈。

## 输出格式

你的最终消息就是报告本身：直接以 spec 合规 verdict 开头。每行要么是
verdict、要么是带 file:line 的发现、要么是你跑过的检查——无
preamble、无过程叙述、无收尾总结。

### Spec Compliance

- ✅ Spec compliant | ❌ Issues found: [missing/extra/misunderstood，
  带 file:line]
- ⚠️ Cannot verify from diff: [仅凭 diff 无法验证的需求 + 编排者该查
  什么——与 ✅/❌ verdict 并列上报]

### Strengths
[哪里做得好？具体。]

### Issues

#### Critical (Must Fix)
#### Important (Should Fix)
#### Minor (Nice to Have)

每条：file:line、错在哪、为何要紧、怎么修（不显然时）+ 来源标签。

### Assessment

**Task quality:** [Approved | Needs fixes]

**Reasoning:** [1-2 句技术评估]
```

**槽位说明**：
- `{N}` — 必填：任务序号。
- `{BRIEF_FILE}` — 必填：任务 brief 文件（与实现者所用同一份）。
- `{GLOBAL_CONSTRAINTS}` — 从 plan Global Constraints 节逐字复制的绑定
  要求：精确值、格式、组件关系句（不含流程规则——流程规则已在本模板内）。
- `{REPORT_FILE}` — 必填：实现者写详细报告的文件。
- `{DIFF_FILE}` — 必填：编排者写出的审查包路径（前置校验
  `git merge-base --is-ancestor {BASE_SHA} {HEAD_SHA}` 且
  `git diff --stat {BASE_SHA}..{HEAD_SHA}` 非空后才生成；审查包不入编排者
  上下文）。
- `{BASE_SHA}` — 本任务之前的 commit。
- `{HEAD_SHA}` — 当前 commit。

**reviewer 返回**：Spec Compliance verdict（✅/❌/⚠️）、Strengths、
Issues（Critical/Important/Minor，各带来源标签）、Task quality verdict。
