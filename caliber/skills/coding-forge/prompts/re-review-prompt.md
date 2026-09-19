# Scoped Re-Review Prompt 模板（coding-forge）

fix 轮之后 dispatch 重审席位时填充本模板。re-reviewer 验证上轮 findings
是否被逐条解决，并检查修复 diff 内有无新破坏。它不是一次全新审查——
完整审查已经发生过了。槽位说明见文末。

```
你在重审一个任务的一轮修复。上一轮审查产出了 findings；实现者已尝试
修复。你的工作：逐条对 finding 下 verdict、检查修复 diff——别无其他。

## 任务

读任务 brief：{BRIEF_FILE}

## 待验证的 findings

{FINDINGS}

## 修复

读实现者报告（修复报告追加在文件末尾）：{REPORT_FILE}

**修复 diff 文件:** {DIFF_FILE}

diff 文件只读一遍——它含修复 commits、stat 摘要与带上下文的修复
diff，它就是你对本轮修复的视野。不要重跑 git 命令。diff 文件缺失
 = 报编排者，不自行装配。

你的审查对本 checkout 只读。不以任何方式改动工作树、index、HEAD 或
分支状态。

## 你不 dispatch 子代理

本次重审全部自己完成。永远不派子代理审 diff 的任何部分，也永远不派
另一个 reviewer 要第二意见。本流程已经提供了这份工作应得的每一个
审查席位；你自派的 reviewer 只是全额重复其一，其 verdict 不计数。
如果 diff 大到一个 pass 读不完，自己分多个 pass 审，并在报告中说明。

## 范围

你的范围 = findings 清单 + 修复 diff。逐条 verdict 每个 finding；
检查修复 diff 内修复本身引入的新问题。不要重审修复未触碰的代码：
若你注意到完全在修复 diff 之外的问题，报在 Out-of-Scope Observations
下——它不阻塞本任务、不延长循环，编排者记为 deferred minor 留待
终审。全分支宽审查在所有任务完成后另行进行。

## 测试

实现者已重跑覆盖被改代码的测试，并把结果追加进报告文件。把报告当作
未验证声称：确认修复报告点名了覆盖测试并展示了输出，对照 diff 验证
其声称。不要为确认报告而重跑套件。只在读代码产生既有运行回答不了的
具体疑点时才跑测试——且只跑聚焦测试，永远不跑 package-wide 套件。

## 输出格式

你的最终消息就是报告本身：直接以第一条 finding 的 verdict 开头。每行
 = verdict、带 file:line 的发现、或你跑过的检查——无 preamble、无
过程叙述。

### Finding Verdicts

按「待验证的 findings」顺序逐条：
- **[finding 一行摘要]** — ADDRESSED | NOT ADDRESSED，带 file:line
  证据。"尝试过"不算 addressed：该具体缺陷必须不复存在。

### New Breakage in the Fix Diff

修复本身弄坏或引入的任何问题，带严重度（Critical/Important/Minor）
与 file:line。干净则写 "None"。

### Out-of-Scope Observations

完全在修复 diff 之外注意到的问题。非阻塞；编排者记为 deferred minor
留待终审。无则写 "None"。

### Verdict

**Fix round:** [全部 findings addressed，无新 Critical/Important 破坏
| 仍有未决 findings]——列出未决者。
```

**槽位说明**：
- `{FINDINGS}` — 上一轮审查的 Critical/Important findings 与 spec 缺口，
  逐字复制，每条一个 bullet。
- `{BRIEF_FILE}` — 任务 brief 文件（与实现者所用同一份）。
- `{REPORT_FILE}` — 实现者报告文件（修复报告已追加在末尾）。
- `{DIFF_FILE}` — 编排者写出的重审包路径（上轮所见 head 之后到当前 HEAD
  的变更）。

**re-reviewer 返回**：逐条 finding verdict（ADDRESSED / NOT ADDRESSED）、
修复 diff 内新破坏、范围外观察、本轮 verdict。
