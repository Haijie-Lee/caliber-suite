---
name: caliber
description: "Use when starting any engineering task — feature, bugfix, refactor, or change request — before touching code. Not for pure Q&A, research, or open-ended discussion."
metadata:
  version: "1.9.0"
  source: distilled-from-practice
---

# Caliber — 量任务之口径，施流程之水准

工程任务总入口。流程骨架恒定，剂量随任务缩放：简单任务走完全程但每站从轻，
复杂任务全剂量。编排 superpowers 与 plan-review-ritual；依赖缺失时读
`fallback.md` 对应章节兜住底线纪律。

## 为什么有效（理解了才会用对）

- **阶段不可跳过，深度可以缩放。** 返工不来自"流程太重"，来自"该想的没想"。
  S 级也过六站，只是每站一分钟。
- **复杂度在入口量一次，执行中持续复量。** 低估了就升级——升级不是失败，
  瞒着复杂度假装简单才是。
- **编排而非重造。** 每个阶段调用最擅长它的 skill；本 skill 只管三件事：
  定级、路由、守停止点。
- **唯一入口。** 定级后由阶段表决定何时调 brainstorming / TDD 等依赖 skill；
  不要在 caliber 之外对同一任务重复触发它们。

## Step 0 — 依赖验证（每次入口必做，一行输出）

对照可用 skill 列表（会话开头的可用-skills 清单）检查：

| 依赖 | 用途 | 缺失时 |
|---|---|---|
| superpowers:test-driven-development | 所有级实现 | 读 fallback.md §TDD |
| superpowers:verification-before-completion | 所有级验证 | 读 fallback.md §证据 |
| superpowers:systematic-debugging | bug 类澄清 | 读 fallback.md §根因 |
| superpowers:brainstorming | L 级澄清 | 读 fallback.md §三问 |
| superpowers:writing-plans | ML/L 级计划（plan-forge 缺时） | 读 fallback.md §简plan |
| plan-review-ritual | MS/ML 级自审；L 级完整 + plan-forge 工序 3 内部调用 | 读 fallback.md §自审 |
| plan-forge | ML/L 级阶段 2（plan 锻造；ML 级仅工序 1-2，L 级工序 1-4） | 退回：ML 级阶段 2 调 writing-plans；L 级阶段 3 调 plan-review-ritual |
| superpowers:subagent-driven-development | ML/L 级阶段 4 实现 | 读 fallback.md §单会话SDD |
| superpowers:finishing-a-development-branch | L 级阶段 6 分支收尾 | 读 fallback.md §分支收尾 |
| ecc:learn 或 skillify | L 级阶段 6 经验固化 | 读 fallback.md §固化 |

缺失不中断：读 `fallback.md` 对应章节兜住纪律，告知用户装回完整版效果更佳。
（分支收尾/经验固化仅 L 级用到，S/M 级任务缺席不告警；plan-forge 为 ML/L 级用到，S/MS 级任务缺席不告警，届时再验。）
输出一行：`✓ 全配` 或 `⚠ 缺 X（已按 fallback 兜底）`。

## Step 1 — 量口径（定级，≤3 行输出）

五维各判轻重，任一维命中"重"即升：

| 维度 | 轻 | 重 |
|---|---|---|
| 影响面 | 单模块 | 多模块 / 跨系统 |
| 可逆性 | git revert 可回 | 删数据 / 迁移 / 外发 / 硬件写入 |
| 方案 | 唯一且明确 | 需选型 / 需求模糊 |
| 验证 | 单测可覆盖 | 需真机 / 部署 / 多环境 |
| 跨度 | 当会话完成 | 跨会话 / 需交接 |

- 判级顺序：先查 L 条件（可逆性 / 方案 / 跨度任一重 → **L**）；再查 M 条件
  （影响面 / 验证重 → **M**）；全轻 → **S**
- 拿不准 → 升级（保守原则）
- 宣布：`定级 X，理由：<命中的维度>`。用户可一句话改级，此后不再问。

**M 级子档（MS / ML）**：入口定级只判到 M，子档不在入口划分。在阶段 1 方案
确认停止点，agent 基于前期调查结果（真实代码、方案改动清单），从涉及范围、
改动难度、重要程度、验证可达性（改动区有无测试覆盖——无覆盖区 inline 实现
缺自证手段，偏 ML 让 SDD 审查兜底）等维度综合评估，给出 MS/ML 推荐 + 理由，
**人工拍板**。不设机械阈值——任务类型多样，量化锚点会失效，agent 综合判断
+ 人工确认兜底（2026-08-14 用户裁决）。

**接续任务**（会话压缩 / 恢复后）：沿用已定级，仅重跑 Step 0，不重新定级。

**执行中复量**：发现根因牵涉面比定级时大、或冒出不可逆操作 → 停下宣布升级，
按新级别补齐已走过阶段的差额深度，再继续。**降级同理**：方案确认后范围缩小、
或前期调查发现真实改动远小于定级估计 → 正式复量宣布降级，后续阶段按新级别
缩减。子档间复量（MS↔ML）同原则：agent 多维度重估给建议，人工确认后按新档
补齐/缩减差额。

## Step 1.5 — 路由装配（按级门控，2026-09-01 用户裁定）

为当前任务装配项目级组件路由表，后续各阶段入口先查表再动手。
本工序自身不查路由表（防递归）。

**按级门控**：路由表的唯一可靠消费者是**编排边界**（阶段入口的组合决策与
dispatch 派发）；S/MS 无 dispatch 边界，主线程查表纪律实测失效（2026-09-01
机制分析：自发调用四重漏损与可靠性层级）。因此：
- **S 级**：跳过本工序（不派 scout、不落盘）；各阶段"无表即跳过"为现成
  fallback；
- **L 级**：定级后立即执行下述工序；
- **M 级**：**延迟到阶段 1 停止点拍板子档后**——拍板 MS → 跳过；
  拍板 ML → 执行下述工序（阶段 2 入口前完成装配）。

1. **项目指纹**（主线程）：读项目根关键文件（package.json / pyproject.toml /
   Cargo.toml / go.mod / sdkconfig / CMakeLists.txt，存在哪个读哪个），得出
   languages + frameworks 两行结论。
2. **预提取**（主线程执行，侦察 agent 不读大文件）：
   - 可见组件清单：`python -c` 扫描 `~/.claude/skills/*/SKILL.md` 取
     name+description 首行，外加 ecc 白名单 24 个与 gstack router 入口；
     **剔除体系黑名单**（caliber 骨架无条件编排组件，与 scout prompt
     排除清单同源）：`caliber`、`plan-forge`、`plan-review-ritual`、
     `qwen-cli`、`minimax-cli`、`skillify`、`ecc:learn`、`superpowers:*`
     ——入表纯冗余且挤占路由名额；
   - 遥测 top-30：执行
     `python -c "import json,os; d=json.load(open(os.path.expanduser('~/.claude.json'),encoding='utf-8'))['skillUsage']; [print(k+': '+str(v.get('usageCount',0))) for k,v in sorted(d.items(), key=lambda x: -x[1].get('usageCount',0))[:30]]"`；
   - 隐藏索引：槽位只填文件路径 `~/.claude/hidden-components-index.yaml`
     （实测 ~37K tokens，2026-08-25），由侦察 agent 自行 Read；文件不存在
     则槽位填 `EMPTY` 并继续（提示可跑 muzzle 脚本生成）。
3. **dispatch 侦察 agent**：`Task(subagent_type=general-purpose, model=haiku)`，
   prompt 按 `route-scout-prompt.md` 填槽：`{TASK_SUMMARY} {CALIBER_LEVEL}
   {PROJECT_FINGERPRINT} {VISIBLE_COMPONENTS} {HIDDEN_INDEX} {TELEMETRY}`。
4. **落盘**：agent 输出写入 `<项目根>/.caliber/routing.yaml`。首次创建
   `.caliber/` 时：项目根存在 `.git` 目录且 `.gitignore` 无 `.caliber/` 行
   → 追加一行 `.caliber/`；无 `.git` → 跳过并输出一行说明。
5. **采用**：ML/L 级展示全表，**停**，用户确认后继续（S/MS 按门控无表）。
6. **合法性兜底**：输出非合法 YAML（`yaml.safe_load` 失败或缺 `routes` 键）
   → 原样重试一次；仍失败 → 写 `routes: []` 空表 + 一行警告，流程继续
   （等同无路由表，不阻塞）。

**后续各阶段入口**（仅 ML/L 级——S/MS 按门控无表）：`.caliber/routing.yaml`
存在时，由**编排者**（主线程）在阶段入口与 dispatch 边界按 `keywords` 匹配
消费，命中组件**优先**使用；路由表是编排者的选料单，不是执行者的自助购物
指南——执行者不查表，组合由编排者注入。**implement 阶段命中移交 §动态组合
消费**（组合决定由编排层做），本段只管 `visible: false` 组件的装载手段。
`visible: false`
的组件注入式激活（agent → `Task(general-purpose, prompt=Read(<path>) 正文 +
任务)`；skill/command → Read 正文遵循执行，或提示用户 `/ecc:<name>`）；
未命中走全局默认。路由表是优先推荐层，不屏蔽任何全局组件。

## Step 2 — 按级施准（六阶段骨架）

阶段恒定，深度按级：

| # | 阶段 | S 轻量 | MS 标准-轻 | ML 标准-重 | L 完整 |
|---|---|---|---|---|---|
| 1 | 澄清 | agent 一句话重述需求（歧义才停，见铁律 7）；bug 类先用 systematic-debugging 定位根因 | 列出方案选项，**停**，用户选定（同停止点拍板 MS/ML，见 Step 1 子档段） | 同 MS | 调 brainstorming 问答澄清（**停**） |
| 2 | 计划 | 一句话方案 | 对话内步骤列表（文件+改法+验证） | 调 plan-forge 工序 1-2（选材+制坯）出正式 plan 文档落盘（缺时 writing-plans）——**ML 级必出 plan 文档** | 调 plan-forge 工序 1-2（选材+制坯）出 plan 初稿 |
| 3 | 审查 | 自问：有没有更简单的做法？ | 跑 plan-review-ritual Step 1 自审（对象：阶段 2 步骤列表） | 跑 plan-review-ritual Step 1 自审（对象：阶段 2 落盘的 plan 文档） | plan-forge 工序 3-4（锻打=**收敛循环**：双声部逐轮对抗至收敛判据，≤3 轮，轮 3 不收敛回工序 2 重锻**停**；准出=**exit gate**：凡经修复的 plan 必经 fresh 强模型全局复审；成型=litmus **真实彩排**：fresh 弱模型 confusion-hunt；Taste 裁定**停**可批量，User Challenge 必停） |
| 4 | 实现 | TDD 直接改，一次一 commit | TDD 逐步，每步跑验证（inline） | SDD 为默认骨架：逐任务按 §动态组合 派发（机械→裸 dispatch / 集成→SDD+注入 / 判断类、组合复杂→收回主线程 inline 并补独立审查） | SDD 为默认骨架：逐任务按 §动态组合 派发（机械→裸 dispatch / 集成→SDD+注入 / 判断类、组合复杂→收回主线程 inline 并补独立审查） |
| 5 | 验证 | 跑验证命令，输出即证据 | 单测 + 相关集成测试 | 单测 + 相关集成测试 | 分层验证 + 真机最小验证（先离线模拟核心路径）+ 全分支 review |
| 6 | 收尾 | 规范 commit message | commit + 三行简报（改动/验证/遗留） | commit + 三行简报（改动/验证/遗留） | ledger 收尾 + 调 learn/skillify 固化新经验 + 分支收尾决策（**停**） |

**路由表查表**（仅 ML/L 级；S/MS 按 Step 1.5 门控无表，直接跳过本步）：
上表各阶段（1-6）开始时由编排者先查 `.caliber/routing.yaml`
（Step 1.5 产物），命中优先、未命中走全局默认；无表则跳过本步。
**implement 阶段**（ML/L 级）的命中不走"主线程自读"，经 §动态组合 进入
执行：画像领域词记入 plan（候选依据，非绑定），组合决定由编排层在 dispatch
边界做出（注入两档：指令化/许可清单）。S/MS 级命中按上句默认（主线程自读）。

## §动态组合（阶段 4 执行层：任务画像 → 组合 + 派遣 → 执行形态）

**作用域**：本节仅适用 ML/L 级（SDD 场景）阶段 4。S/MS 阶段 4 语义不变
（TDD inline），不适用本节。

阶段 4 的**过程节拍**恒定（TDD/SDD 是骨架），**领域装备**按任务动态组合。
plan 管"做什么"（绑定权威，刚性）；本节管"拿什么做"（skill 组合，动态）
与"派谁做"——dispatch 三轴：agent_type（2b）× model（强弱缺省）× prompt
（注入两档）。组合点在 dispatch 边界，决策者是编排层（主线程），不是弱执行者——判断只是
从"派发时做"前移为"在信息最多的时刻做"（运行时能看到前序任务的实际产出
与真实代码状态），弱执行者拿到的仍是逐字指令（注入的 skill 正文摘录）。

**1. 任务画像（组合输入）**：plan（plan-forge 工序 2）为每任务标注画像，
格式定死：`画像: 性质=…; 难度=…; 领域词=[…]`
- 性质：新增 / 修bug / 重构 / 配置 / 文档
- 难度：机械 / 集成 / 判断——**自设三档**（信号源自 SDD 复杂度信号但独立
  设档；SDD 原档为 cheap/standard/most-capable，不可直接引用）
- 领域词：供路由表关键词匹配
画像前置进 plan，但**不锁 skill 组合**——锁了就把运行时信息（前序任务实际
产出、真实代码状态）丢掉，回到死板。画像是执行层的输入，不是执行层的指令。
任务缺画像标注 → 按"集成"对待（dispatch+注入，安全向）。

**2. 组合公式**：每任务 dispatch 前，编排层算组合 = 过程骨架 ×1 + 领域组件 ≤3
+ agent_type = f(画像)：
- **过程骨架 ×1**：按画像性质查映射选取（枚举集，不许开放即兴）：
  新增→TDD直改 / 修bug→调试先行 / 重构→重构-验证 / 原型→原型-验证 /
  配置、文档→TDD轻验证。
- **领域组件 ≤3**：路由表 `stages` ⊇ implement 命中 + 任务文本关键词匹配；
  候选源只认路由表与全局 skill 清单，不许凭空造（C2）。领域组件以画像
  领域词的形式记入 plan（候选依据，非绑定）；组合决定由编排层在 dispatch
  边界做出（C6）。
- **agent_type = f(画像)**（dispatch 第三轴，2026-09-01 新增）：见 2b 映射表。

**2b. agent_type 映射**（2026-09-01 从 1005 份历史 transcript 实测分布蒸馏；
候选只认 Agent 工具当前可见列表，无信号退 general-purpose）：

| 画像/任务信号 | subagent_type | 实测依据 |
|---|---|---|
| 只读搜索/定位（fan-out 扫文件，结论导向） | `Explore` | 108 次，只读主力 |
| 逐任务 diff 审查（SDD reviewer 槽） | `ecc:code-reviewer` | 115 次，与 ecc"改动后必须用"条款同源 |
| 审查且领域词命中语言专项（python/go/rust/cpp/ts/react/flutter） | `ecc:<lang>-reviewer` | 低频（cpp 仅 1 次）——待账本验证增量 |
| L 级阶段 5 多维大审查 | `comprehensive-review:*` 三件套 | 62 次 |
| 实现（机械/集成 dispatch） | `coder` 优先，`general-purpose` 备选 | 250 次 |
| 计划/拆解/需求分析 | `Plan` / `architect` | 39 次 |
| 无信号 / 拿不准 | `general-purpose` | 兜底（现状 856 次即它） |

纪律：
- **只读信号不明确 → 一律给全工具 type**：权限错配（只读 agent 干写活）
  比选择保守更危险。
- 体系内已写死者不在本表、勿改：plan 对抗审查（ritual 声部 A）=
  `general-purpose`（ritual Step 2 写死；plan 审查非代码 diff 审查，
  ecc:code-reviewer 的代码场景系统提示错配）；litmus 彩排 =
  `general-purpose + haiku`（plan-forge 工序 4 写死）。
- 映射是启发式非绑定；agent 列表随插件增减漂移时旧映射不失效（找不到的
  type 退 general-purpose）。

**3. 难度决定执行形态**：
- 机械 → **裸 SDD dispatch**（零组合或最小组合，保住便宜快）
- 集成 → **SDD dispatch + 注入**
- 判断类 / 组合复杂 → **收回主线程 inline**：主线程天然持有全部 skill 与
  完整上下文，是 skill 发挥空间最大的执行者。**收回不等于免审**：inline
  完成后派强模型 reviewer 审查该 diff（SDD 原文警告 controller 自改会跳过
  审查，故补此门）。2026-08-29 用户裁决：此为 2026-08-13 强弱分工理由的
  授权例外，见"强弱模型缺省"段。

**4. 注入两档**（仅对 dispatch 的任务）：
- **弱模型实现者** → skill **指令化**：编排者 Read skill 正文、抽取与本任务
  相关段落写进 brief，subagent 不碰 Skill 工具。
- **强模型实现者** → skill **许可清单**：dispatch 带一行"本任务许可调用：
  X、Y、Z"——枚举式、可审计，不是自由购物。（subagent 调 skill 的障碍是
  纪律级而非工具级：general-purpose 持 Skill 工具，SUBAGENT-STOP 是
  using-superpowers 的纪律条款，直接指令优先于它。）

**5. 安全边界**（动态不变混乱）：
- plan 的 spec/契约仍是绑定权威：组合只决定"规格内怎么实现"；skill 指引与
  plan 冲突 → plan 赢 + ruling 记录。
- 组合上限（骨架 1 + 领域 ≤3）、候选源封闭，防编排者即兴。
- 审查门不变：reviewer 的 constraints 块加"核对 diff 是否符合绑定组件约定"，
  注入由强模型验证闭环；收回 inline 的 diff 另过独立强模型审查（见第 3 条）。
- 组合进 ledger（`Task N: 组合=[…] agent=X model=Y 理由=…`），收尾可审计
  （agent_type 分布是 2b 映射表校准的数据源）；实现者运行中
  报缺组合，走既有 NEEDS_CONTEXT / DONE_WITH_CONCERNS 状态（SDD 四状态
  契约封闭，不造新通道），编排者裁定是否补组合后重派。

**强弱模型缺省**（阶段 4 ML/L 级；dispatch 的 model 轴，与 2b 的 agent_type
轴正交、各自独立设置）：有用户指令按指令；无指令时**实现者降配
sonnet/haiku、审查者用最强可用模型**（opus 级）。SDD 的核心价值是强弱分工：
实现已被 plan 拆解为机械步骤，弱模型干得快且省；强模型把住逐任务审查关。
整体执行质量高于同级模型单干（2026-08-13 用户裁决：ML 级同样走 SDD 即为此；
2026-08-14 MS 子档拆分后，MS 保持 inline TDD 不走 SDD）。
**不要**让实现者继承会话模型——那等于放弃了审查者与实现者的能力差。

**与 §动态组合 的关系**：本段"实现者"指**被 dispatch** 的实现者——裸/注入
dispatch 仍按此降配弱模型。**判断类/组合复杂收回主线程 inline** 不是
dispatch，由主线程（会话模型）执行、天然持全部 skill——这是 skill 的发挥
空间，与强弱分工不冲突；收回的 inline diff 必须过独立强模型 reviewer 审查
（防跳过审查门）。
（2026-08-29 用户裁决：2026-08-13 强弱分工理由适用于机械/集成 dispatch；
判断类收回是本裁决授权的例外，以审查门补偿为前提；2026-08-14 MS 拆分后
MS 保持 inline 同此渊源。）

## 铁律（不随级别缩放）

1. **六站必过**——S 级也澄清、也验证，只是每站从轻。
2. **证据先于断言**——说"完成了/修好了/通过了"之前，先跑命令、看输出。
3. **不可逆操作前必停**——删数据、外发、硬件写入、force push，无论级别。
4. **root cause 优先**——bug 类任务先定位根因再动手；治标的修复要在
   commit 里写明是治标。
5. **延期决策必带重访触发器**——"暂不决定"必须附"出现什么条件时回来定"，
   写进 ledger 或 plan。
6. **低估即升级**——执行中发现复杂度被低估，停下来升，不硬撑。
7. **歧义即停**——需求、方案、风险取舍有歧义就问；猜出来的方案不值得写。

## 停止点速查

- **S 级**：不可逆操作前、歧义。
- **MS/ML 级**：+ 方案确认（同停止点拍板 MS/ML 子档）。
- **ML/L 级**：+ 路由表确认（Step 1.5 第 5 步）。
- **L 级**：+ brainstorming 问答、plan 逐条裁定（可批量）、审查轮 3 不收敛
  重锻、分支收尾。

其余一律自动推进——该走的流程不打断，该停的决策不抢跑。
