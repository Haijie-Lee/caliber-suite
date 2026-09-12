# Caliber Fallback — 依赖 skill 缺失时的底线纪律

仅在 SKILL.md Step 0 检测到依赖缺失时阅读对应章节（缺哪个读哪个，不用全读）。
兜底目标：保住纪律的灵魂，不追求完整仪式；装回完整 skill 后以其为准。

## §TDD（替代 superpowers:test-driven-development）

先写失败测试 → 跑它看红 → 最小实现 → 跑它看绿 → commit。
没有测试的改动不算改动，算许愿。

## §证据（替代 superpowers:verification-before-completion）

任何"完成/修好/通过"的声称之前：跑验证命令，把输出贴出来。
输出与声称不符时，以输出为准。

## §根因（替代 superpowers:systematic-debugging）

复现 → 最小化 → 定位到具体文件/行/条件 → 单变量验证假设 → 修 → 回归测试锁定。
禁止"改改看行不行"的散弹式修复。

## §三问（替代 superpowers:brainstorming）

动手前问用户三个问题：要做什么（可观测的完成态）？为什么（约束与动机）？
什么绝对不能碰（不可逆边界）？答完才进计划阶段。

## §简plan（替代 superpowers:writing-plans）

写清五样：①目标一句话；②涉及文件清单（路径精确）；③每文件的改法（含关键代码）；
④每步验证命令+预期输出；⑤commit 划分。验收标准：换一个不知道背景的人照做能做完。

## §自审（替代 plan-review-ritual，M/L 级计划审查）

五条，每条发现必须引用原文，引不到的不报：

1. 心算每条测试断言：输入代入实现，算出的期望值和断言一致吗？
2. 模块级语句（regex、常量、装饰器）import 时就执行——它会炸吗？
3. 跨任务/跨文件的签名、字段、命名逐个对得上吗？
4. 自己定的每条约束，正文里有没有自己违反的？
5. 平台事实核查：目标环境的真实行为是这样吗（不凭想象）？

## §单会话SDD（替代 superpowers:subagent-driven-development）

任务逐个来：每任务独立实现 → 跑测试 → commit → 换"找茬"的脑子重读 diff 自审 →
对话内记 ledger（任务/提交/审查结论/遗留项）。标准：任何人凭 ledger 能接手。

## §分支收尾（替代 superpowers:finishing-a-development-branch）

列出选项（合并回主干 / 开 PR / 保留分支 / 删除分支）及各自后果一句话，
**停**——让用户选，不替用户定。

## §固化（替代 ecc:learn / skillify）

问用户一句："本次会话有没有值得固化的模式？"有则起草 SKILL.md（name /
description 以 Use when 开头、只写触发条件不写流程 / 问题 / 方案 / 示例），
经用户确认后写入 `~/.claude/skills/<name>/`；无则跳过。
