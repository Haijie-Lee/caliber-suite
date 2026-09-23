---
name: coding-forge
description: "Use when executing an ML/L-level implementation plan whose tasks are predominantly coding (new features, bug fixes, refactors) with git — caliber 阶段 4 编码执行引擎（非 coding 归兄弟引擎 caliber:exec-forge）：brief 文件化、双 verdict 审查门、TDD 证据强制、编辑纪律注入、ledger 断点恢复。中文触发：编码执行、代码派发、TDD 驱动、编码 forge"
metadata:
  version: "1.0.3"
  source: distilled-from-practice
---

# Coding Forge — 编码锻造：隔离分支上逐任务实现、逐任务过审

caliber ML/L 级**阶段 4 执行引擎**（coding 主场），与兄弟引擎 exec-forge
（非 coding 主场）并列：两引擎共享同一套同源机制集（brief 文件化 / 组合决策 /
dispatch 纪律 / 四状态 / 双 verdict 审查门 / fix loop / 过程日志契约 / 终审 /
四停止），按任务性质分流——代码主导且有 git 走本引擎，其余走
`caliber:exec-forge`（路由规则单一真源 = caliber §动态组合「执行引擎选择」节）。
本 skill 是 caliber 编排下的执行引擎，不是
独立工作流：定级、plan 锻造、阶段路由均在 caliber 侧完成。
v1.0.1（2026-09-20）：MS 交接注改 caliber 直调并补轻量 plan 输入语义（caliber v1.16.0 体系自研化联动）。
v1.0.2（2026-09-22）：终审评估 loop 防静默悬挂回写（与 exec-forge 1.6.2 同源双改；实证：2026-09-22 AeroFold U-M1-02/03/04 三单元终审 31 条 deferred minor 静默悬挂，当晚补账 ef86219+d2e5366）——§6 Minor 出口半句改完整指向；§终审加「终审前对账清单」+ new-minors 声明行与恒等式 + 处置四档扩五档（新增核销档）；final-reviewer prompt 加计数块与席位分离；plan-forge checklists 视角 1 加终审任务显式四步条。
v1.0.3（2026-09-24，trans-forge L1 复盘回写同源补齐）：§3 dispatch 纪律加「禁反向泛化句」、§4 report 加「证据回填」、§5 审查门加「叙事性断言事实性核对」——与 exec-forge 1.7.1 三条同源映射；§6 报告准确性补「防线」条款（exec-forge 1.6.3 同源补齐：写「已提交 X」前 X 必须已发生且有可指档案）。

## 为什么有效（理解了才会用对）

- **实现者与审查者永远不同上下文（fresh 分席）。** 作者盲区在执行层同样存在：
  写完的人重读的是"我记得想写什么"，不是代码实际是什么。每个任务的 diff
  都必须过独立审查门。
- **brief = 需求唯一真源。** subagent 的上下文是精确构造的，不继承会话史；
  精确值只出现在 brief，dispatch prompt 只做指针。
- **双 verdict 门。** spec 合规与代码质量是两个独立判决，缺一不放行；
  实现者自审不替代审查门。
- **修循环有闸。** fix loop 上限 5 轮 + breaker 裁定 + 同模式复发升级——
  循环不会无限空转，结构性失败被强制定性上浮。
- **TDD 证据强制。** 无红测试不写实现；GREEN 证据 = 项目全量测试命令输出，
  漏报失败 = 报告伪造。次序即证据。
- **ledger 断点恢复。** ledger 是会话压缩后唯一可信的进度真源——控制器丢失
  进度重派已完成任务序列，是最贵的已观测失败；ledger 首行身份防串 plan。
- **基线先行。** 开工前全量测试全绿 + BASE 记录——之后每一个红都能归因。
- **文本块注入防漂移。** 弱模型编辑纪律以文本块随 dispatch 注入全新上下文，
  不注入 = 零效果。

## 何时使用 / 不使用（本地判据；路由规则单一真源 = caliber §动态组合「执行引擎选择」节）

引擎路由规则（画像分布 → 引擎）由 caliber §动态组合「执行引擎选择」节持有，
本节不复制。本地一句判据：**plan 任务代码主导（过半任务性质 ∈
{新增, 修bug, 重构} 且涉及源码）且仓库有 git → 本引擎；否则 →
`caliber:exec-forge`**。同一 plan 引擎唯一不混跑；主导判定有歧义 → 停
（caliber 铁律，歧义即停）。S/MS 级不走 dispatch 形态——主线程内联消费
§inline TDD 骨架（S/MS 级）。

## 输入

- `PLAN`（绑定权威）：含逐任务画像与 Global Constraints。**coding plan 免
  预分配表**——实现/审查角色内建于本引擎（实现者 = 每任务 fresh dispatch
  subagent，审查者 = fresh 独立 reviewer，终审 = fresh 独立 agent，形态默认
  dispatch；S/MS 级见 §inline TDD 骨架（S/MS 级））。
- 任务画像与 `技能消费` 行：plan 任务块的画像（性质/难度）驱动 §任务环 §2
  组合决策；`技能消费` 行 = 预绑定组件，语义指针 exec-forge §输入（预绑定 =
  默认消费——dispatch 边界偏离须记 ledger Ruling，终审闭环核查）。
- `routing.yaml`（可选）：`<项目根>/.caliber/routing.yaml` 存在才消费；
  消费方式 = §任务环 §2 组合决策步。缺席处置同源 exec-forge §输入：plan 含
  dispatch 行而表不在 → 提示用户可回 caliber Step 1.5 补装路由（组件供给随
  会话漂移，表是运行时产物）；用户不补 → ledger 记 Ruling "无表，注入通道
  关闭（仅 plan 预绑定可注入）"后继续，不阻塞。
- Global Constraints：plan 的 Global Constraints 节，逐字复制给每个 reviewer。

## Setup（工作区、git 隔离与 ledger）

1. **工作区**：`<项目根>/.caliber/exec/<plan-stem>/`（plan-stem = plan 文件名
   去 `.md` 后缀；plan 的 Global Constraints 显式声明 `plan-stem = …` 时以
   声明值为准——fixture-plan 必须声明）。`mkdir -p <ws>`。另一个 plan 的目录
   不许读写。
2. **git 隔离（默认 = 新 branch）**：
   - 默认从当前 HEAD 派生新 branch，branch 名 = `<plan-stem>`；
   - **never on main/master without consent**——未获用户明确同意不在
     main/master 上动工；
   - `BASE=$(git rev-parse HEAD)` 开工前记录进 ledger——审查包与终审包的
     区间锚；**禁 `HEAD~1` 定位**（多提交任务会被截断）；
   - **基线先行**：开工前跑项目全量测试命令，全绿才开工；不绿 = 停止点
     （先向用户展示基线红，裁定修基线或换基线后再动工）；
   - **worktree 为可选模式**（用户在阶段 4 入口停止点裁定切换），三闸 =
     detect-before-create（目标路径已存在则复用不重建）/ check-ignore
     （确认 worktree 路径被 gitignore 覆盖或位于仓外）/ clean baseline
     （新 worktree 内重跑全量测试全绿才开工）；
   - 工作区 `.caliber/` 不入 git——仓 `.gitignore` 缺 `.caliber/` 行则开工前
     追加（否则运行工件卷入 commits 污染审查包）。
3. **ledger**：`<ws>/progress.md`，首行逐字 =
   `# coding-forge ledger — plan: <plan 路径>`（身份行常量）。恢复语义
   （同源 exec-forge §Setup）：首行对不上 = 别人的进度，原样保留、另起新
   ledger；已有 `Task <N>: complete` 行的任务不重派，从首个无完成行的任务
   续；末行是 fix round = 中途，从下一轮续。续跑以 ledger 既有留痕为准——
   阶段 4 入口停止点不重复停等、pre-flight 不重复扫描；有新增调整另记
   Ruling。压缩后信 ledger 与 `git log`，不信记忆。启用过程日志
   （§过程日志契约）时同建 `<ws>/process-log.md`。
4. **读 plan 一遍**，建逐任务 todo；plan 指名 Spec 则同读（冲突以 Spec 为
   绑定权威；无 Spec → ledger 记一笔，其后 ruling 均为临时裁定）。
5. **pre-flight 冲突扫描**（派 Task 1 前；同源 + 编码特化）：逐对共享
   文件/接口的任务列对照行（谁产谁消、发现什么）；逐任务列自洽行（验证
   判据 vs 产物、创建 vs 后触）；编码特化——plan 各任务文件清单与当前
   未提交改动（`git status --porcelain`）比对，交集非空 = 开工前逐条裁定
   （先提交 / 先 stash / 纳入本 plan），ruling 记 ledger。输出是表不是
   结论——"扫描干净"必须带这些行进 ledger；发现的冲突在执行开始前逐条
   裁定（plan 文本为准）。

## 阶段 4 入口停止点 — 执行确认（批量，唯一）

默认 = 展示后**停**，用户确认/逐条修改后才派第一个任务。展示内容：

1. 引擎选择与判定理由（一行：画像分布 → coding-forge）；
2. **隔离模式**：branch 名 / BASE sha / 工作区路径（worktree 模式时含
   worktree 路径）——隔离模式的最终裁定权在用户（plan-forge 交接节已
   提醒可切换，此处拍板）；
3. 任务清单概览与每任务预排（骨架 × 注入档，标注来源 = plan 画像 /
   默认规则）。

**折叠条件**（同源 exec-forge §阶段 4 入口停止点）：三条**全部**满足时
允许不停——
① 用户消息含明确执行授权（"执行 / 按 plan 执行"类指令）；
② 展示内容零运行时调整——隔离模式取 §Setup 实跑值、任务预排逐字来自
   plan 画像，无现场发明行；
③ 无新增不可逆操作。
折叠也须留痕：一行展示依据（引擎 + 隔离模式 + 零调整声明）+ ledger
`Ruling:` 记折叠与三条件核对。任一条件不满足 → 必须展示后停下等确认。

确认后执行中再调预排 = ledger `Ruling:`（允许，rulings not stalls），
除非触及 §四停止契约。

## 任务环（每任务）

### 1. brief 文件化

task 全文提取到文件，brief = 需求唯一真源（同源 exec-forge §1，awk 命令
逐字同源——`sub()` 剥冒号必须保留，它对破折号与冒号两种任务标题形态都
兼容；禁按旧版失配认知省掉）：

```bash
awk '/^```/{fence=!fence} !fence && /^## /{inb=0} \
!fence && /^### Task [0-9]+/{t=$3; sub(/:.*/,"",t); inb=(t==n)} inb' n="$N" "$PLAN" \
  > "<ws>/task-${N}-brief.md"
```

验证：`head -1` = `### Task <N> …`；`wc -l` > 5；`tail` 最后一个非空行
属本任务内容（不再用下一任务号 grep 判零——Interfaces 块合法交叉引用
会假阳性；提取尾随空行合法）。精确值（数字/魔法串/签名/判据）只出现在
brief，不出现在 dispatch prompt。plan 任务标题以破折号形态
`### Task N — …` 为最稳输入。

### 2. 组合决策与注入（每任务，brief 之后、dispatch 之前）

每任务必过，产物 = 一行 ledger 组合行 +（有注入时）注入产物。同源
exec-forge §2 四步：

① **定骨架**：按画像性质查 §过程骨架菜单 编码版（新增功能 → TDD 直改 /
   修 bug → 调试骨架 / 重构 → 行为冻结）。
② **查组件**：`<项目根>/.caliber/routing.yaml` 存在才查——匹配
   （`stages` ⊇ implement 命中 + 任务文本关键词匹配；领域组件 ≤3）、
   新鲜度比对（表含 `visible_count` 时与当前会话 skill 清单条目数比对，
   不等 → 一行警告后继续消费，不阻塞）、预绑定消费义务（plan `技能消费`
   行 = 默认消费，跳过或替换须 Ruling；冲突 → plan 赢 + Ruling；命中但
   运行时判不适用 → 不注入 + Ruling）、无表/无命中处置（组合行注记，
   合法空转，本步不省略）；审查边界同法（`stages` ⊇ review → 摘录进
   审查包 constraints 块）——语义同源 exec-forge §2 ②。
③ **定档注入**（指令化 = 默认档 / 许可清单 = 须显式授予）：档规则同源
   exec-forge §2 ③。**编码特化——代码 dispatch 的注入默认内容源** =
   用户环境内编辑纪律 skill 的「注入模板」节（在场才读取展开；指针式
   引用，模板正文不复制进本文档）：
   - 槽位填充规则 = operator 填验证命令（模板末行验证命令槽，填本任务
     §验证手段菜单 编码版 的适用条目）；
   - **缺席分支**：该 skill 不在场 → 编排者以内联最小编辑纪律块填槽
     （Edit 连续 2 次失败停下报告 / 禁整文件 Write 覆盖 / 不动上下文外
     内容 / 末行验证命令槽），组合行理由位注明「内联兜底」；
   - 缺省 = 全量注入；任务画像注明「注入降档」时可降为空串；
   - 注入落点 = §3 dispatch 的 implementer-prompt `{INJECT_EDIT_DISCIPLINE}` 槽位，
     **非 brief 文件**（brief 保持需求唯一真源的纯净）。
④ **写组合行**（即时落账——随本步组合决策完成即写入 ledger，先于
   dispatch 动工；补记/迟记 = 时序漂移，终审必查）：
   `Task <N>: 组合=[<骨架>×<组件清单>] agent=<type> model=<平台基底> 注入档=<档> 命中=<表/plan/无> 理由=<一行>`
   model 字段记实际基底 `platform-default(agent_type=<x>)`——ZCode Agent
   工具无 model 参数，dispatch 模型统一 platform-default（轴塌缩实录，
   同源 exec-forge §模型轴）；分席价值由 fresh 独立上下文承载，不由模型
   差承载。命中 字段兼记注入来源与席位来源。

**fix 轮与 resume**：指令化内容随 brief 文件持久，resume 天然覆盖；许可
清单不跨轮继承——fix 轮 prompt 必须重带权限行；`{INJECT_EDIT_DISCIPLINE}` 块在
fresh dispatch 的 fix 轮同样重带。

### 3. dispatch

填充 `prompts/implementer-prompt.md`（槽位：`{N}` `{TASK_NAME}`
`{BRIEF_FILE}` `{CONTEXT}` `{REPORT_FILE}` `{WORKDIR}` `{INJECT_EDIT_DISCIPLINE}`）。
dispatch prompt 构成（五件，同源）：

1. 一行定位（本任务在 plan 里的位置）；
2. brief 路径（"先读——它是你的需求，精确值逐字使用"）；
3. 前序任务接口（brief 不知道的签名/字段/决策）；
4. 你对 brief 内歧义的裁定（有则写）；
5. report 文件路径与汇报契约（见 §4）。

**parked finding 指针携带**：上一任务审查 parked 项落在本任务触及区域时，
把该 ledger 条目指针写进本任务 brief 附注。

纪律（同源）：
- **no-subagents 契约**：实现者不得再派 subagent——帮手不派，reviewer 更
  不派；审查由编排者在 report 后到达。worker 自派 reviewer = 重复席位，
  是缺陷不是严谨。
- **一次一个实现 subagent**（禁并行，防冲突）。
- **预算行**（每 dispatch 必填，写不出不许派）：
  `预算：材料 X KB + 变更 Y KB + 工具结果预估 Z KB = 合计 W KB`；
  门槛 W ≤ 150 KB；超限降级链：砍上下文行数 → 按文件切片分 agent →
  浓缩中继（摘要 agent）。
- **一 agent 一个动词**：实现 X / 审查 Y / 验证 Z 各派各的；"顺便核对"
  是一笔新 token 账。
- **长任务心跳**：预期 >10 分钟的任务，dispatch 里要求"每完成一个子任务
  向 report 文件追加一行"——文件 mtime = 确定性心跳；卡死从心跳续派
  （不从零重派）。
- **不贴会话史**：dispatch 描述一个任务，不是会话历史；前序摘要史禁止
  粘进 prompt。
- **禁反向泛化句**（2026-09-24，trans-forge L1 T2-F1 实证，与 exec-forge
  1.7.1 同源）：brief/plan 已写明提交义务（C10 类）的任务，dispatch prompt
  禁写「不要 git commit」类反向泛化句——worker 据此跳过 brief 明令的提交。
  提交纪律唯一权威 = brief/编排侧；worker 的边界是「不替编排者决定何时
  提交」，不是被泛化句豁免既有义务。
- **记录 agentId**：dispatch 结果里的 agent 身份——fix 轮 1-3 要 resume。
- **无 model 槽**：模板已去 model 槽位——ZCode Agent 工具无 model 参数，
  模型统一 platform-default（见 §2 ④）。

### 4. report 契约与四状态

实现者把完整报告写进 `<ws>/task-<N>-report.md`（变更清单、验证命令与
输出、自审发现），**返回仅**（≤15 行）：status + commits 列表 + 一行
测试摘要 + concerns + 报告路径。（一切粘贴进出主线程的内容全程驻留
context——工件走文件。）

**编码特化——TDD 证据字段**（report 必含）：
- **RED**：命令 + 失败输出摘录 + 为何该失败是预期（watch-it-fail）；
- **GREEN（项目全量测试命令）**：项目全量测试命令（仓自用的 bare
  `pytest` / `npm test` 等命令，非仅本任务测试文件）+ 通过输出摘录 +
  **全部失败具名清单**（含非本任务引入者；零失败 = 显式声明「全量套件
  零失败」）。漏报失败 = **报告伪造**；
- 调试骨架任务以**复现环证据**替代 RED/GREEN：复现测试见红 = RED 等价，
  修复后该测试转绿 + 全量套件输出 = GREEN 等价；
- **commits 列表** `<base7>..<head7>`（本任务全部提交的短 sha 区间，编码特化——
  exec-forge 记文件清单，本引擎以 git 提交区间替代）。

**证据回填**（2026-09-24，与 exec-forge 1.7.1 同源）：变更清单/文件计数/
commits 区间断言一律以实时命令输出支撑（`git status --short` /
`git diff --stat <base7>..<head7>` / `git log --oneline`），禁凭记忆填清单
或区间——计划时态的动作不是完成时态的事实。与 §6 报告准确性 防线同源
分工：防线管动作陈述的时态，本条管断言的证据形态。

四状态（封闭集，不造新通道；与 exec-forge §4 逐字对齐）：
- **DONE** → 进 §5 审查门。
- **DONE_WITH_CONCERNS** → 先读 concerns：涉正确性/范围 → 处理后再审；
  观察类 → 记录后审。
- **NEEDS_CONTEXT** → 补上下文重派。
- **BLOCKED** → 四路定性：上下文问题 → 补；推理不足 → fresh 重派
  （强化 brief / 换更高 agent_type）；任务过大 → 拆小；plan 本身错 →
  裁定更正、ledger Ruling、带裁定重派。
- **永不**原样强重试；实现者说卡了，就必须有东西变了再派。
- 实现者提问（开工前/中）→ 完整回答，不催它进实现。

### 5. 审查门（每任务，不可跳过）

填充 `prompts/task-reviewer-prompt.md`。reviewer 输入（全走文件路径）：

1. brief（同一份）；
2. report 文件；
3. **审查包** `<ws>/task-<N>-review.md`——编排者生成（编码特化：审查包
   脚本机制内联化）：
   - **前置校验**：`git merge-base --is-ancestor <base7> <head7>` 且
     `git diff --stat <base7>..<head7>` 非空；任一失败 = 停止点，不上送
     审查（先核 ledger 与 `git log`，区间错了修区间）；
   - 然后 `git log --oneline <base7>..<head7>` +
     `git diff --stat <base7>..<head7>` + `git diff <base7>..<head7>`
     全量写工作区文件；
   - 审查包**不入编排者上下文**（路径移交 reviewer）。
4. **全局约束块**：从 plan Global Constraints 逐字复制——reviewer 的
   注意力透镜（精确值、精确格式、组件关系句）。

双 verdict 缺一不可（同源）：**spec 合规**（对照 brief 逐条）+ **任务
质量**（代码质量 / 测试验真行为 / 结构）。实现者自审不替代审查门；两个
都要。

纪律（同源）：
- **禁预判 reviewer**：prompt 里出现 "do not flag" / "不要当作缺陷" /
  "至多 Minor" / "plan 选了" → 停，重写 prompt。误报让它报，fix loop
  里裁定。
- 不让 reviewer 重跑实现者已跑的验证（report 带证据）；疑点聚焦测试
  可以，package-wide 重跑禁止。
- **叙事性断言事实性核对**（2026-09-24，与 exec-forge 1.7.1 落盘声明
  存在性核对同源）：审查包 = git 区间 diff，只覆盖代码变更，不覆盖
  report 的叙事性断言（「全量套件零失败」声明、commits 区间、变更清单
  文件集）——reviewer 对每条叙事性断言做低成本实测核对（commits 区间
  对 `git log <range>` 核存在性、变更清单对 `git diff --stat` 核同名集、
  落盘工件 `test -f`），与上条「不重跑验证」不冲突：验的是 report 的
  事实性，不是产物功能。断言无实物 = 报告准确性类，按 §6 当场原位修正
  + 独立 Ruling。
- 不加无具体理由的开放指令（"检查所有用法"类）。
- ⚠️ **cannot-verify 项**（reviewer 报"从变更包无法验证"）：不阻塞审查，
  但编排者必须逐条自解后才许标完成——编排者持有 reviewer 没有的跨任务
  上下文；确认是真缺口 = 按 spec ❌ 进 fix loop。
- **来源标签**（与 exec-forge §5 同源）：reviewer prompt 要求每条发现
  （含 Minor）带来源标签四选一——`计划强制`（plan/brief 锁定文本的原样
  产物，修 = 偏离绑定权威）/ `执行引入`（实现者自选产物）/ `报告准确性`
  （report 或日志叙述与产物事实不符）/ `无法验证`（= cannot-verify 项）。
  标签是 §6 出口与 §终审 处置路由的输入；reviewer 漏标 → 编排者补标或
  退回，不凭严重度猜路由。
- **内容级检测许可**：spec 合规 PASS 不豁免内容级 Minor——plan/brief
  强制的内容本身有质量疑虑（死代码、过时引用、可疑常量）时照报 Minor，
  来源标签 = `计划强制`。上报 ≠ 要求修改：处置权属 §终审 评估 loop，
  任务环 fix loop 语义不变。
- **parked finding 登记规则**：breaker 裁定的 parked 项写 ledger
  `parked — <finding> — Ruling: <为何产物成立>`；触及该区域的后序任务
  dispatch 时携带指针（见 §3）。
- 注入任务：reviewer 以 brief「## 注入」节为保真基准核对 diff 落实；
  `{INJECT_EDIT_DISCIPLINE}` 降档（空槽）须有任务画像注明，否则按 §终审 ③核查端
  处置。

### 6. fix loop（上限 5 轮）

触发：spec ❌ / 任何 Critical 或 Important / 确认真实的 ⚠️。
先走三条出口再进环（同源）：
- **Minor** → ledger `Task <N>: minor (deferred): <一行>`，终审时按
  §终审「deferred/parked triage」评估 loop 处置（评估包装配 → 单次
  评估 dispatch → 落盘 → eval 行入账）；永不进环。
- **报告准确性类**（来源标签 = 报告准确性）→ 不 defer：当场原位修正
  report（把值改对），并记独立一条 ledger Ruling（启用过程日志时另记
  偏离恢复 类条目）——report 是终审与判读的证据底座，失真承重，修复
  窗口不过夜；产物本体不动，无需 scoped 重审。**防线**（exec-forge
  1.6.3 同源补齐）：写「已提交/已推送/已写入 X」类陈述前，X 动作必须
  **已发生**且有可指档案（commit hash / grep 锚 / 文件实文）；动作未做的
  先做再写——「先写后做」在报告里与虚称不可区分（实证 2026-09-23
  AeroFold U-M1-06 报告虚称 runbook 已同步，独立审查 Major 抓获）。
- **plan-mandated / 与 plan 文本冲突的发现** → 编排者裁定（Spec 为绑定
  权威、plan 是其论证），ruling 记 ledger 后才行动；不许因 plan 要求而
  静默驳回，也不许派与 plan 矛盾的修复而无 ruling 记录。

轮次（同源）：
- **轮 1-3 — resume 原实现者**：未决 findings 逐字发回（harness 支持则
  续原 agent；不支持则 fresh dispatch 带 brief + report 路径 + findings，
  并重带 `{INJECT_EDIT_DISCIPLINE}` 块与许可清单权限行——report 文件是持久记忆）。
  修复后重跑覆盖验证、把修复报告**追加**进同一 report 文件（含新 commits
  区间）。
- **轮 4-5 — fresh 实现者换眼**：带 brief、report 路径、未决 findings 与
  框架句："前一个实现者尝试了 <N> 次；现在归你。读 report 文件了解已试过
  的。"三轮 resume 不收敛 = 实现者看不见自己的问题，换眼一步到位。
- **每轮必过 scoped 重审**：填充 `prompts/re-review-prompt.md`——只判
  每条 finding ADDRESSED / NOT ADDRESSED + 修复 diff 内的新破坏（新
  Critical/Important 进未决清单；范围外观察记 deferred minor，不延长
  循环）。重审包 = `git diff <fix_base7>..HEAD`（fix_base = 上轮审查所见
  head），前置校验与 §5 同法。
- **重审前确认**修复报告含：覆盖验证命令、实际输出、验证文件名——三件
  齐才派重审。
- **②同模式复发升级**：模式签名 =（判定面，
  失败形态）归一化；同一签名第 2 次出现 = 结构性定性，**禁同法第 3 次
  重试**，上浮编排者 Ruling（定性 + 换法或改契约）；签名与计数写过程
  日志（§过程日志契约 铁律联动），终审核查（§终审 ②核查端）。
- **breaker（轮 5 仍未决）**：停止派活，编排者逐条裁定——reviewer 错了
  或有争议 → `parked — <finding> — Ruling: <为何产物成立>`；真但下游无
  依赖 → parked + ruling（真实且延期）；真且承重（后续任务建在它上面 /
  暴露 plan 缺陷）→ 最小解锁改动 ruling + 带进下一任务 dispatch；park
  承重缺陷 = 后续全建在上面。只有"条条路都是猜"才停（§四停止契约）。
  裁定只在 cap 做；提前裁定 = 换名的预判。每条裁定都是 ledger 行，静默
  丢弃禁止。
- **编排者永不亲自修** dispatch 任务的 findings——context 保持干净做
  编排，且编排者修复跳过审查。

每轮结束 ledger：
`Task <N>: fix round <R>/5 (<X> addressed, <Y> open — <一行>; commits <a7>..<b7>)`。

### 7. 完成任务

审查干净（或 cap 裁定全 parked）→ ledger（编码特化——commits 区间替代
exec-forge 的 files 清单）：
`Task <N>: complete (commits <base7>..<head7>, review clean)` 或
`(…, <K> parked)`。

**完成闸（编码特化）**：标完成前，项目全量测试命令必须当前全绿——非
任务单文件绿。全量套件有红（含非本任务引入者）= 不标完成：先定性归属
（本任务引入 → 回 §6；存量/环境 → Ruling 记 ledger 并展示给用户），再
裁定去向。标 todo 完成，进下一任务。**有未停 Critical/Important 不进
下一任务。**

## 验证手段菜单 编码版（任务性质 → 验证形式；plan 必须给具体期望）

| 手段 | 用法与判据 |
|---|---|
| 单元测试 | 新行为必有新测试；断言验行为不验 mock；输出 pristine（无警告噪声） |
| 集成测试 | 跨模块/跨进程行为；plan 指明覆盖的交互面 |
| 类型检查 | 仓自用命令（`tsc --noEmit` / `mypy` 等）零错误为绿 |
| lint | 仓自用 lint 命令零新增告警 |
| build | 构建命令零错误；产物存在性检查 |
| 运行冒烟 | 启动/主路径跑通，期望输出逐字比对 |
| 回归四步验证 | revert → 测试 MUST FAIL → restore → PASS——证明测试真的盯着这个行为 |

通用（同源）：期望给不出具体值 = plan 缺陷 → NEEDS_CONTEXT 退回，不许
现场编。**仪器校准**：断言"归零"前，先用同形命令断言一个已知存在的串
能命中——同形命令报 0 才可信（防坏命令报假绿）。**项目全量测试命令 =
统一完成闸**：任何手段组合都不替代全量套件绿（见 §4 GREEN 字段与 §7
完成闸）。

## 过程骨架菜单 编码版（性质 → 执行骨架；与 caliber §动态组合 映射同源）

- **新增功能 → TDD 直改**：先写失败测试并看它红（watch-it-fail——没
  亲眼见红不算 RED），再最小实现转绿，再重构；delete-means-delete——
  删代码 = 真删，不留注释残骸与死分支。
- **修 bug → 调试骨架**：**无 red-capable
  反馈环不进假设**——先写复现测试见红，再动修；找不到可挂复现测试的
  seam（接缝）→ 先造 seam 或上浮裁定，不绕过；修复 = 最小改动使复现
  测试转绿 + 全量套件绿；**同签名失败第 2 次 = 架构质询停环上浮**
  （与 §任务环 §6 ②联动——模式签名记过程日志）。
- **重构 → 行为冻结**：先取得全绿基线再动手；改后全量套件全绿才算完；
  **禁同提交改行为 + 结构**——行为变更与结构变更分提交，各自过验证。

## inline TDD 骨架（S/MS 级）

S/MS 级编码任务不走 dispatch 形态——主线程内联执行，实现/审查不分席
（其余条款与 dispatch 形态相同：TDD 证据、全量验证闸、反理性化表均
适用）。

- **Iron Law**：无红测试不写实现代码——先写测试、亲眼看它失败，失败
  原因符合预期，才许写实现。违反次序产出的代码无证据效力。
- **R-G-R 循环**：RED（写一个失败测试）→ GREEN（最小实现转绿）→
  REFACTOR（绿下整理）；循环往复，一次只推一个行为。
- **单任务规模上限**：一个行为一个循环——一个测试能描述完、一个
  commit 装得下；装不下 = 拆任务，不扩大循环。
- **完成前全量验证闸**：标完成前跑项目全量测试命令，全绿才算完成——
  非任务单文件绿；有红先定性归属再处置（与 §7 完成闸同源语义）。
- **MS 级批量执行与 checkpoint**（caliber 阶段 4 直调；MS 级输入 = .caliber/plans/ 轻量 plan 文档）：
  多任务顺序内联执行，每任务独立 R-G-R 循环，任务边界 = checkpoint
  （每任务完成向用户展示一次：完成了什么、全量套件状态、下一任务）。

## git 语义节

- **每任务至少一 commit**：实现者自提交（dispatch prompt 内指令），
  commit message 带任务号与任务名；fix 轮修复同样即修即提交——ledger
  的 `<base7>..<head7>` 区间因此始终可达。
- **BASE 族禁 `HEAD~1`**：一切区间锚（审查包 / 重审包 / 终审包）用记录
  的 sha，不用相对定位——多提交任务会被 `HEAD~1` 截断。
- **阶段 4 边界**：本引擎不 merge、不 push、不动共享分支；分支上的全部
  提交是执行证据。
- **finishing 移交 caliber 阶段 6**：
  - 前置闸 = 项目全量测试命令绿（不绿不进收尾菜单）；
  - 分支处置菜单 = merge / PR / keep / discard，由用户在阶段 6 裁定；
  - **typed discard 授权语义**：discard 须用户明确键入选择（菜单展示 ≠
    授权），丢弃前展示将丢失的 commits 清单；
  - 工作区 `.caliber/exec/<plan-stem>/` 的留存/清理由阶段 6 收尾决策
    处置。

## 批量同形小任务

同型小编辑（同一改法跨文件）→ **一单 batch dispatch**（同源）：brief 列
全文件与改法，单 subagent 完成，变更作一个单元过审。审查侧**逐文件
核对**：brief 清单中每个文件必须在 diff 里有对应 hunk，清单文件缺
hunk = Missing finding。不一任务一 subagent——独立判断/独立测试面/
独立审查面才配独立 dispatch。

## 过程日志契约（动作级留痕；L 级默认启用，ML 级 plan/用户声明启用）

任务级进度在 ledger，**动作级过程在本日志**——长程执行的黑匣子（同源
exec-forge §过程日志契约）。启用条件：L 级默认启用；ML 级以 plan 声明或
用户声明为准，未见声明 = 不启用；S/MS 级无编排面，不适用。

**启用即建**：`<ws>/process-log.md`。已存在 → 续追加（序号接续既有最大
值），禁止重建/清空——覆盖即销毁黑匣子。主线程每个编排动作后追加一条：

```
## [<序号>] <动作类型> — <一行摘要>
```

动作类型枚举（13 类，不得自创）：现场勘查 / 装配 / 折叠判定 / 注入 /
dispatch / inline执行 / 审查门 / fix轮 / 验证 / Ruling / 偏离恢复 /
终审 / 收尾。归类指引：现场勘查/装配/折叠判定/注入/dispatch/inline执行
对应 §任务环各步（inline执行 = inline 形态任务的主线程实做，其机检命令
实跑拆 验证 类）；inline 路径组合行落账与 dispatch 路径对齐——inline执行
条目先记「组合行（即时落账）」一笔再记实做；审查门 含**任务级** report
抵达与四状态处置；验证 = 任务验证命令实跑；fix轮 = 修复往返；Ruling =
四停止外自行裁定；偏离恢复 = 失真/意外修正；终审/收尾 对应同名节——终审
verdict、其 report 抵达与四状态处置及 deferred triage 均归 终审 类，不归
审查门。复合动作取主类型、另一动作写进摘要，不创新类。每条要素：命令
全文与原样输出（命令类动作适用时——Ruling/折叠判定等无命令动作不填）、
涉及文件路径、组合行/Ruling 全文（适用时）、下一步依据一行。

铁律（日志撒谎比没日志更糟）：
- **输出值一律实跑后写入**：先单独发命令拿到实际输出，再构造引用该
  输出的条目——日志条目与被执行命令**不得同批构造**（同批 = 预测式
  失真；命令与条目出现在同一批工具调用 = 违规）；**数值断言成对落笔**
  （格式条款）：凡写入对**产物或执行事实**的数值断言（计数/行数/字节数/
  耗时/条目数等度量值——plan 已载明的结构性数字、契约格式行内嵌数字
  （预算行预估值、fix 轮行 `<X> addressed`、条目序号）与预测/估算值免
  配对；配对仅约束实测类断言），必须「值 + 产生它的命令」成对出现
  （样板：`wc -l X → 48`）——只有值没有命令 = 预写失真嫌疑，审查门可
  要求补证；无命令动作（Ruling/折叠判定）的理由引用实测值时同样按本条
  成对；发现预写失真 → 原位修正 + **独立一条 偏离恢复 类条目**——内联
  更正注记只是留痕的一部分，不替代条目；只改值不改模式必复发。**同类
  偏离签名第 2 次 = Ruling 必记**（同模式复发升级的过程日志端，与
  §任务环 §6 ②、§终审 ②核查端三端闭环）。
- **失败原样**：失败输出不裁剪、不概括；任何"第一次没成"的动作原样
  记录失败形态 + 修正动作——禁止只记成功路径。条目义务限**语义性
  失败**（命令 exit≠0、产物不符预期、验证未过、dispatch 返回非
  DONE）；工具级机械重试（不改变动作语义的）免记。
- **实现者侧不摊派**：subagent 的 report 契约不变，成本全在主线程。

机制挂钩：终审抽查（见 §终审）；收尾素材源（见 §收尾）。

## 终审（final review）

全任务完成后：**fresh 独立 agent** 全产物终审。填充
`prompts/final-reviewer-prompt.md`。

- **终审包（编码特化）**：`git log --oneline <MERGE_BASE>..HEAD` +
  `git diff --stat <MERGE_BASE>..HEAD` + `git diff <MERGE_BASE>..HEAD`
  全量，编排者生成写工作区文件 `<ws>/final-review.md`，**不入编排者
  上下文**。MERGE_BASE = §Setup 记录的 BASE sha（同一真源，禁另行
  推导）；BASE sha 丢失/无记录 = 兜底 `git merge-base main HEAD`（或
  实际主分支名）；**禁 `HEAD~1` 不变**。
- reviewer prompt 同含 §5 来源标签条与内容级检测许可条；输入含 ledger
  路径（deferred/parked 行 triage）与（启用时）process-log 路径——
  启用时抽查动作类型覆盖（13 类封闭集）与失真（数值断言成对落笔、
  输出值实跑后写入）。
- **组合行核查（同源）**：逐任务核查组合行存在性（缺席 = 组合决策步
  被跳过）与时序（补记/迟记 = 时序漂移）；plan 含预绑定（`技能消费`
  行）时逐任务核查预绑定组件被消费（brief ## 注入 节 / 许可清单任务
  report 组件使用字段 / 组合行命中=plan）或有对应 Ruling 偏离留痕——
  两者皆无 = 预绑定被遗忘，报 Important。
- **②核查端**：同模式签名计数 >1 的任务必有 Ruling 入账（ledger 与
  过程日志对账），缺 = **终审不通过**。
- **③核查端**：代码 dispatch 的 implementer prompt 缺编辑纪律块
  （`{INJECT_EDIT_DISCIPLINE}` 空且任务画像未注明降档）= Important。
- **终审前对账清单**（终审闭环的机械闸，缺任一 = 终审不闭环）：
  ① 恒等式核对——deferred 行数 vs eval 裁定条数（含 new-minors 声明行，
    口径见下「deferred/parked triage」条）；
  ② 评估包已装配（逐条原文 + 来源标签 + plan 概要 + 判据清单 +
    report/diff 指针）；
  ③ 单次评估 dispatch 已返回且逐条裁定进 ledger；
  ④ known-issues / TODO 落盘完成（schema 见 §收尾，重访触发非空）。
- **deferred/parked triage（同源 Minor 处置评估 loop）**：终审 reviewer
  对 ledger deferred minor 与自身新发现的 Minor 只做分类——
  Critical/Important 升级（进 findings）或进评估（默认全部）；「修不修、
  怎么处置」不由终审 reviewer 独判。终审报告返回后、fix dispatch 派出
  前，编排者装配评估包（留存逐条原文 + 来源标签 + plan 概要 + 任务依赖
  关系 + 判据清单 + 上下文指针 report/diff 路径；来源标签漏标/误标时
  编排者可补标，评估包内留痕原标签 + 补标理由），**单次 dispatch
  `caliber:code-reviewer`**（缺席退 general-purpose，2b 链）按判据
  逐条裁定五档：
  - **当场修复**：满足任一——① 修复工作量小且价值高；② 全局重要性
    高于单次 review 呈现（跨任务承重 / 阻塞验收 / 证据链部件）。两判据
    必须引用具体证据。**裁定本档必须附修复方案参考**（file:line + 改法
    要点）——方案随 findings 进 fix dispatch，实现者照方案修、scoped
    重审照方案核。
  - **TODO**：真实且值得排期，但工作量或时机不适合本轮（跨任务改动 /
    依赖外部条件 / 方向级取舍）→ 写 `docs/TODO.md`（照其表头
    `| 日期 | 条目 | 触发条件 | 状态 |`）。
  - **known-issues**：真实但不值得排期 → 写 `docs/known-issues.md`
    （schema 见 §收尾；文件不存在则按 schema 创建）；重访触发必填，
    禁写「以后再说」类空触发。
  - **关闭**：误报/噪声 → Ruling 一行（每条裁定都是 ledger 行，静默
    丢弃禁止）。路由门槛：关闭档仅限发现不成立或无信息价值，发现为真
    禁入；评估席不得把工件/场景的生命周期（一次性 fixture、临时分支）
    当作发现本身的属性。来源标签 = `计划强制` 且发现为真 → 默认
    known-issues（修复 = 偏离绑定权威，登记即处置；例外仅可升档
    （当场修复/TODO）、不得入关闭，并须 Ruling 说明）；一次性场景的
    重访触发写「该工件复用或同类问题再现时」即合法。
  - **核销**：发现曾真但已被后序工作消解（曾成立、现已不成立）→
    Ruling 一行，须引用消解证据（commit / 载体行）。与关闭档的区分：
    关闭 = 发现不成立或无信息价值；核销 = 发现曾成立、现已不成立——
    当前仍成立的发现禁入核销档。
  时序：「当场修复」档并入终审既有 **ONE** fix dispatch（全清单，不一
  发现一派）+ exactly one scoped 重审——Minor 的唯一修复窗口在此；
  任务环内 Minor 永不进环的现纪律不变。parked 行维持既有裁定语义，不
  重进评估。评估逐条裁定进 ledger
  （`final review: eval <ID>=<档> — <一行理由>`，可一行多条）。
  终审报告返回后、评估包装配前，编排者先写机器可读声明行
  `final review: new-minors <N>`（N = 终审报告计数块照抄值，N=0 允许）。
  恒等式（「终审前对账清单」① 的核对对象）：eval 裁定条数（按
  `<ID>=` 出现计数，eval 行允许一行多条）== Σ `minor (deferred)`
  行条数 + N − deferred 行中升级为 Critical/Important 的条数（new
  minor 升级者本就不计入 N，不再扣；升级项经 fix dispatch 处置、
  不占评估额度；无升级时右侧即 Σ + N）。等式不成立 = 有 deferred
  minor 漏进评估，终审不闭环。

有 findings → **ONE** fix dispatch（全清单，不一发现一派）+ exactly one
scoped 重审 + 残量裁定（同 §6 breaker）。无第二波——残量承重 findings
进收尾简报呈用户。

## 四停止契约（其余 rulings not stalls）

只有这四样停下问用户：
1. 不可逆/破坏操作（删数据、外发、硬件写入、force push）；
2. 安全敏感动作；
3. 工作区外副作用且规范要求先问（merge、push 共享分支、发布）；
4. plan 破到每条前进路径都是猜。

其余一律自行裁定继续：`Ruling: <决定> — <理由> — 错了的代价` 进 ledger。
运行中的 plan 不等人——错误 ruling 的返工用户看得见撤得回；停在问题上
的会话浪费用户一整天。

## 连续执行与叙述纪律

不在任务间向用户报到（"要继续吗"式打扰禁止）——他们让你执行 plan，就
执行。工具调用间叙述 ≤ 一行；ledger 与工具结果承载记录。

## 反理性化表 编码版

| 借口 | 现实 |
|---|---|
| "测试跑过就行，不用看输出" | 报告必须摘录输出——输出 pristine 是质量维度，警告噪声也是发现。 |
| "我的测试文件全过 = 完成" | 项目全量测试命令才算绿；漏报失败（含非本任务引入者）= 报告伪造。 |
| "小改动不用写测试" | Iron Law：无红测试不写实现——改动再小，次序不变。 |
| "先实现后补测试，反正都有测试" | 次序即证据：后补的测试证明不了它盯住了这个行为（回归四步才证明）。 |
| "失败是环境问题，同法再试一次" | 同签名失败第 2 次 = 结构性定性——禁同法第 3 次重试，上浮 Ruling。 |
| "reviewer 看到顺手改掉就行" | reviewer 只读——发现写入 = Critical；修复走 fix loop 回实现者。 |
| "我自己修快，dispatch 是开销" | 编排者修复污染 context 且跳过审查。resume 实现者。 |
| "重构顺手把行为也改了" | 行为冻结：行为变更与结构变更分提交，禁同提交双改。 |
| "HEAD~1 取基线省事" | 多提交任务会被截断——BASE 族一律用记录的 sha。 |
| "Edit 失败就整文件重写" | 编辑纪律：Edit 连续 2 次失败停下报告——Write 全覆盖抹掉上下文外的近期改动。 |
| "再来一轮就收敛" | 过 cap 不收敛 = 结构性失败。裁定并路由。 |
| "ledger 记账是开销" | ledger 是压缩后唯一幸存物——没有它的控制器重派过整个已完成任务序列。 |

## 收尾

1. **Rulings 全量收集**：ledger 里每条 `Ruling:` 行进最终简报（"Rulings
   I made"，逐条带"错了的代价"）——清单必须穷举，这是用户唯一看到代决
   的地方。**评估 loop 裁定同责穷举**：每条 `<ID>=<档> — <理由>` 进简报
   （当场修复档附修复落点一行）。
2. **ledger 终态**：每任务一行 complete（commits 区间 + review clean /
   parked 数）或带 Ruling 的例外态；终审留痕含机器可读声明行
   `final review: new-minors <N>` 与逐条 eval 裁定行，恒等式成立（口径
   见 §终审「deferred/parked triage」条）；ledger 与工作区保留至
   caliber 阶段 5-6 验收后由收尾决策处置。
3. **分支移交 finishing 菜单**：全量套件绿 → 向用户展示分支处置菜单
   （merge / PR / keep / discard，语义见 §git 语义节）——阶段 4 不自行
   merge/push。
4. **经验固化**：执行中抓到的新型陷阱 → 项目 learnings / 平台清单回写
   （出处一行：哪次任务、什么现象）。
5. **过程日志（启用时）**：复盘文档与收尾简报以 process-log 为唯一
   素材源——证据驱动，不凭记忆写。
6. **known-issues 登记**：评估 loop 裁定为 known-issues 的条目写
   `docs/known-issues.md`——文件不存在则创建，布局依次为：标题行
   `# Known Issues — 执行期登记（coding-forge §收尾产出；caliber 阶段 6
   触发核查 / plan-forge 工序 1 选材消费）`、空行、3 行治理说明（`>`
   引用：条目来源与写入权限 / 重访触发必填 / 关闭语义）、空行、表头
   `| ID | 日期 | 来源(plan/任务) | 发现 | 类别 | 重访触发 | 状态 |`
   与分隔行（类别 ∈ {计划强制, 执行引入, 其他}；状态 ∈ {open, closed}）。
   关闭 = 状态改 closed 并补关闭理由，不删除原行——处置留痕。

## 调用方关系

caliber ML/L 级阶段 4 是本 skill 的唯一调用方；引擎路由规则单一真源 =
caliber §动态组合「执行引擎选择」节（本 skill §何时使用 只持本地判据，
不复制路由规则）。组合决策规则（骨架 × 领域组件 × agent_type × 注入档）
由 caliber §动态组合 持有；消费机制 = §任务环 §2 组合决策步（与
exec-forge §2 同源，本 skill 不复制决策规则全文）。prompts/ 四模板由
§3、§5、§6、§终审 以 `prompts/<文件名>` 相对路径引用消费。

**兄弟引擎 exec-forge**（路由语境形态 `caliber:exec-forge`）：两引擎
共享同源机制集——同源节清单 = §1 brief / §2 组合决策 / §3 dispatch
五件 / §4 四状态 / §5 双 verdict 门 / §6 fix loop / §7 完成 / §过程
日志契约 / §终审 / §四停止。**触发条件：改上述任一同源节必须双改
两侧**（语义对齐，编码特化处显式标注「编码特化」/「编码版」），否则
本清单的互引失效。git 重度语义（worktree/commit/
branch）的主场在本引擎；exec-forge 侧的 coding 扩展位已关闭
（1.6.0），其重访触发器移交本 skill §延期决策。

延期项与重访触发器见 §延期决策。

## 延期决策（带重访触发器）

登记处全集 = 本引擎立项 plan 的 §延期决策 节；本节收录其中属本引擎
主题者（「③编辑纪律规则在 exec-forge 轻量代码任务的适用」属 exec-forge
主题，不录）：

1. **中程审查机制**：不进 v1.0.0。触发器 =
   本引擎经 ≥2 个真实 L 级编码任务检验后评估审查门逃逸率。
2. **worktree 模式冒烟覆盖**：v1.0.0 只冒烟 branch 默认路径。触发器 =
   首个真实 worktree 需求任务。
3. **双独立审查（AND 门）**：不进 v1.0.0（与现行单
   reviewer + 来源标签体系冲突面未评估）。触发器 = v10 冒烟判读时审查
   门逃逸率实证。
4. **git 重度语义完整支持重访**（exec-forge coding 扩展位关闭后的移交
   项）：触发器 = 本引擎经 ≥2 个真实编码任务检验后评估。
