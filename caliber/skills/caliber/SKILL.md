---
name: caliber
description: "Use when starting any engineering task — feature, bugfix, refactor, or change request — before touching code. Not for pure Q&A, research, or open-ended discussion."
metadata:
  version: "1.16.0"
  source: distilled-from-practice
---

# Caliber — 量任务之口径，施流程之水准

工程任务总入口。流程骨架恒定，剂量随任务缩放：简单任务走完全程但每站从轻，
复杂任务全剂量。编排自研套件（coding-forge + exec-forge + plan-forge + plan-drafting + deep-probe）与
plan-review-ritual；
依赖缺失时读 `fallback.md` 对应章节兜住底线纪律。
v1.11（2026-09-14）：阶段 4 引擎路由（代码主导+git → coding-forge，其余 →
caliber:exec-forge）+ 阶段 4 入口执行编排批量确认停止点；画像性质枚举扩 8 值。
v1.11.2（2026-09-15）：组合决策消费钩子指针（→ exec-forge §任务环组合
决策步，P1）+ 接续任务路由新鲜度检查（P2）+ routing.yaml `visible_count`
（P3）+ scout 空表举证（P4）+ 组合行格式扩 注入档/命中 字段（P5 注记随
exec-forge §模型轴）。
v1.12.0（2026-09-15，用户裁定去 Claude 遗产词汇）：「实现/审查分席缺省」
替代强弱模型档（分席价值=上下文隔离承载，Claude 侧档位映射注记保留其
功能）；注入档=策略选择（指令化=默认、许可清单须显式授予）；dispatch
三轴改选择轴 agent_type×prompt；scout/彩排派遣去 model= 参数。
（1.11.3 并入：接续条款补无 visible_count 字段跳过。）
v1.12.1（2026-09-15，独立复核修复）：组合行占位符对齐 exec-forge §组合行
（model=<平台基底>）。
v1.13.0（2026-09-16，用户裁定）：ML 级阶段 3 接入 plan-forge 工序 4 真实彩排（与 L 同构全量；单派遣两阶段 = confusion-hunt + 技能消费映射）；skill 消费从「候选非绑定、dispatch 边界现决」升级为「预绑定+偏离留痕」（彩排映射经编排者裁定回写 plan 为默认消费，dispatch 边界偏离记 ledger Ruling，终审闭环核查——执行期遗忘 = 实证失败模式 A2）。
v1.14.0（2026-09-16，用户裁定）：阶段 6 通用注——docs/known-issues.md
重访触发命中项的显式处置义务（exec-forge 1.5.0 登记端的消费闭环；与
plan-forge 1.6.0 工序 1 选材第 5 条同为登记表消费侧）。
v1.15.0（2026-09-19，coding-forge 自研）：编码主线切换自研 coding-forge——
外部 subagent 编码引擎引用全量替换为 caliber:coding-forge（依赖表/阶段表/引擎路由/形态名/四状态注/
预分配表注全量联动；fallback.md 节标题同步改写指针）。
v1.16.0（2026-09-20，用户裁定）：体系自研化——MS 级出轻量 plan 文档
（.caliber/plans/）+ 快速自查与 plan-reviewer 独立审查两道；计划起草与澄清
工序全量切换为原生实现（plan-drafting / deep-probe）；
停止点工艺四条（问必带注/纠正响应协议/前提清单交付/挂起清单配铁律 5）；
scout 黑名单扩六件。接续中的旧 MS 任务可按旧语义完成；任务台账前置——plan 落盘即开账（.caliber/exec/<plan-stem>/progress.md），新增铁律 8 台账先于记忆

## 为什么有效（理解了才会用对）

- **阶段不可跳过，深度可以缩放。** 返工不来自"流程太重"，来自"该想的没想"。
  S 级也过六站，只是每站一分钟。
- **复杂度在入口量一次，执行中持续复量。** 低估了就升级——升级不是失败，
  瞒着复杂度假装简单才是。
- **编排而非重造。** 每个阶段调用最擅长它的 skill；本 skill 只管三件事：
  定级、路由、守停止点。
- **唯一入口。** 定级后由阶段表决定何时调 deep-probe / TDD 等依赖 skill；
  不要在 caliber 之外对同一任务重复触发它们。

## Step 0 — 依赖验证（每次入口必做，一行输出）

对照可用 skill 列表（会话开头的可用-skills 清单）检查：

| 依赖 | 用途 | 缺失时 |
|---|---|---|
| caliber:coding-forge | 所有级实现（S/MS inline TDD 骨架） | 读 fallback.md §TDD |
| caliber:coding-forge | 所有级验证 | 读 fallback.md §证据 |
| caliber:coding-forge | bug 类澄清（调试骨架） | 读 fallback.md §根因 |
| deep-probe | L 级澄清；MS/ML 级方案探索轻量档 | 读 fallback.md §三问 |
| plan-drafting | MS 级阶段 2 轻量 plan；ML/L 级计划（plan-forge 缺时） | 读 fallback.md §简plan |
| plan-review-ritual | ML 级自审；L 级完整 + plan-forge 工序 3 内部调用 | 读 fallback.md §自审 |
| plan-forge | ML/L 级阶段 2（plan 锻造；ML 级工序 1-2 + 工序 4 彩排，L 级工序 1-4） | 退回：ML 级阶段 2 调 plan-drafting；L 级阶段 3 调 plan-review-ritual |
| caliber:coding-forge | ML/L 级阶段 4 实现（代码主导且有 git；路由见 §动态组合） | 读 fallback.md §单会话执行 |
| caliber:exec-forge | ML/L 级阶段 4 非 coding 执行引擎（路由见 §动态组合） | 有 git 退 coding-forge；无 git 退 inline + 独立补审门 |
| caliber:coding-forge | L 级阶段 6 分支收尾（caliber 阶段 6 接管语义） | 读 fallback.md §分支收尾 |
| 经验固化组件（项目级 learnings 任一） | L 级阶段 6 经验固化 | 读 fallback.md §固化 |

缺失不中断：读 `fallback.md` 对应章节兜住纪律，告知用户装回完整版效果更佳。
（分支收尾/经验固化仅 L 级用到，S/M 级任务缺席不告警；plan-forge 与 exec-forge 为 ML/L 级用到，S/MS 级任务缺席不告警，届时再验。）
输出一行：`✓ 全配` 或 `⚠ 缺 X（已按 fallback 兜底）`。

**docs 体系订阅检查（每次入口必做，一行输出）**：工程根同时缺 `CONTEXT.md` 与
`docs/learnings/INDEX.md` 时，依赖验证行后追加输出：
`📄 本工程未订阅 docs 治理体系，可调用 init-docs（caliber 插件 ≥1.2.0 提供）播种引导`
（随后正常继续定级，不中断）。任一文件存在（部分或全部订阅）则不输出。

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
缺自证手段，偏 ML 让 coding-forge 审查兜底）等维度综合评估，给出 MS/ML 推荐 + 理由，
**人工拍板**。不设机械阈值——任务类型多样，量化锚点会失效，agent 综合判断
+ 人工确认兜底（2026-08-14 用户裁决）。

**接续任务**（会话压缩 / 恢复后）：沿用已定级，仅重跑 Step 0，不重新定级；ML/L 级另查 routing.yaml 存在性与新鲜度（缺席 → 按 Step 1.5 门控重装；表含 `visible_count` 且与会话 skill 清单条目数不符 → 同门控；无该字段 → 新鲜度比对跳过）。

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
   - 可见组件清单：**主源 = 当前会话可用 skill 清单**（系统提示注入的 name + 文件路径，即"可加载"全集；注意注入清单**不含 description**，2026-09-14 实证）——以清单路径为输入跑 `python` 批量预提取（逐路径读 SKILL.md frontmatter 取 name+description 首行）；**补充源 = 磁盘扫描** `~/.zcode/skills/`、`~/.agents/skills/`、`~/.claude/skills/`（存在才扫，发现未加载组件供 visible:false 注入式激活，磁盘扫描实际获得的真实路径是合法 path 来源）；预提取输出**分两区**：主源区（会话清单条目：名称+简述）与补充源区（磁盘扫描条目：每条带 `[磁盘扫描]` 前缀 + 实得文件路径），填入 `{VISIBLE_COMPONENTS}` 槽时保持分区与标注原样——前缀是 scout 步骤 4 的 visible 判定依据，**不得丢弃**（2026-09-14 轮 3 pre-mortem 实证：无标注则磁盘组件被误标 visible:true 丢路径，注入式激活静默失效）；
     **剔除体系黑名单**（caliber 骨架无条件编排组件，与 scout prompt 排除清单同源）：`caliber`、`plan-forge`、`plan-review-ritual`、`plan-drafting`、`deep-probe`、`coding-forge`、`exec-forge`、`init-docs`、`update-docs`、经验固化组件（名称/简述含 learnings、经验固化、skill 固化 类字样的任一组件）——入表纯冗余且挤占路由名额；
   - 遥测 top-30：`~/.claude.json` 存在才执行下列命令；不存在（纯 ZCode 环境无对应物，2026-09-14 实证）槽位填 `EMPTY`：
     `python -c "import json,os; d=json.load(open(os.path.expanduser('~/.claude.json'),encoding='utf-8'))['skillUsage']; [print(k+': '+str(v.get('usageCount',0))) for k,v in sorted(d.items(), key=lambda x: -x[1].get('usageCount',0))[:30]]"`；
   - 隐藏索引：槽位只填文件路径 `~/.claude/hidden-components-index.yaml`（外部注入插件产物；实测 ~37K tokens，2026-08-25），由侦察 agent 自行 Read；文件不存在则槽位填 `EMPTY` 并继续（提示可跑该插件脚本生成）。
3. **dispatch 侦察 agent**：`Task(subagent_type=general-purpose)`
   （模型档可配平台用最低档——侦察是机械转写；本平台档不可配即默认），
   prompt 按 `route-scout-prompt.md` 填槽：`{TASK_SUMMARY} {CALIBER_LEVEL}
   {PROJECT_FINGERPRINT} {VISIBLE_COMPONENTS} {HIDDEN_INDEX} {TELEMETRY}`。
4. **落盘**：agent 输出写入 `<项目根>/.caliber/routing.yaml`，主线程落盘
   时在表头加 `visible_count: <当前会话可用 skill 清单条目数>`（消费方
   新鲜度比对用，2026-09-15 P3）。首次创建
   `.caliber/` 时：项目根存在 `.git` 目录且 `.gitignore` 无 `.caliber/` 行
   → 追加一行 `.caliber/`；无 `.git` → 跳过并输出一行说明。
5. **采用**：ML/L 级展示全表，**停**，用户确认后继续（S/MS 按门控无表）。
   **折叠条件**（2026-09-15 用户裁定；exec-forge 两轮冒烟实证同款模式）
   ——三条件**全部**满足时允许不停：① 用户消息含明确执行授权；② 全表
   无取舍待决（唯一 route 或全部 route 均为本任务骨架既定组件，用户无
   选/改空间）；③ 无新增不可逆操作。折叠须一行展示依据 + ledger
   `Ruling:` 记折叠与三条件核对；任一不满足 → 必须展示全表停下等确认。
6. **合法性兜底**：输出非合法 YAML（`yaml.safe_load` 失败或缺 `routes` 键）
   或 `routes` 为空且缺 `exclusions` 块（空表举证，见 scout prompt）
   → 原样重试一次；仍失败 → 写 `routes: []` 空表（同样加
   `visible_count` 表头）+ 一行警告，流程继续（等同无路由表，不阻塞）。

**后续各阶段入口**（仅 ML/L 级——S/MS 按门控无表）：`.caliber/routing.yaml`
存在时，由**编排者**（主线程）在阶段入口与 dispatch 边界按 `keywords` 匹配
消费，命中组件**优先**使用；路由表是编排者的选料单，不是执行者的自助购物
指南——被 dispatch 的执行者不查表，组合由编排者注入。**implement 阶段命中移交 §动态组合
消费**（组合决定由编排层做），本段只管 `visible: false` 组件的装载手段。
`visible: false`
的组件注入式激活（agent → `Task(general-purpose, prompt=Read(<path>) 正文 +
任务)`；skill/command → Read 正文遵循执行，或提示用户 `/<plugin>:<name>` 斜杠命令形态）；
未命中走全局默认。路由表是优先推荐层，不屏蔽任何全局组件。

## Step 2 — 按级施准（六阶段骨架）

阶段恒定，深度按级：

| # | 阶段 | S 轻量 | MS 标准-轻 | ML 标准-重 | L 完整 |
|---|---|---|---|---|---|
| 1 | 澄清 | agent 一句话重述需求（歧义才停，见铁律 7）；bug 类先用调试骨架定位根因 | 调 deep-probe 轻量档（重述+方案探索+押注），列出方案选项，**停**，用户选定（同停止点拍板 MS/ML，见 Step 1 子档段） | 同 MS | 调 deep-probe 全仪式澄清（对齐快照收口，**停**） |
| 2 | 计划 | 一句话方案 | 调 plan-drafting 轻量档出 plan 文档落盘 .caliber/plans/（五节：目标/文件+改法/验证/commit/风险） | 调 plan-forge 工序 1-2（选材+制坯）出正式 plan 文档落盘（缺时直调 plan-drafting）——**ML 级必出 plan 文档** | 调 plan-forge 工序 1-2（选材+制坯）出 plan 初稿 |
| 3 | 审查 | 自问：有没有更简单的做法？ | 快速自查五条 + dispatch plan-reviewer 独立审查（单轮，对象：阶段 2 轻量 plan；Mechanical 静默修、Taste/User Challenge **停**） | 跑 plan-review-ritual Step 1 自审（对象：阶段 2 落盘的 plan 文档）→ plan-forge 工序 4 真实彩排（单派遣两阶段：confusion-hunt + 技能消费映射；映射裁定回写预绑定；自审修复落地后再彩排） | plan-forge 工序 3-4（锻打=**收敛循环**：双声部逐轮对抗至收敛判据，≤3 轮，轮 3 不收敛回工序 2 重锻**停**；准出=**exit gate**：凡经修复的 plan 必经 fresh 独立全局复审；成型=litmus **真实彩排**（单派遣两阶段：fresh 零背景基线 agent confusion-hunt + 技能消费映射，映射裁定回写预绑定）；Taste 裁定**停**可批量，User Challenge 必停） |
| 4 | 实现 | TDD 直接改，一次一 commit | TDD 逐步，每步跑验证（inline） | 引擎路由（规则见 §动态组合 首节）：代码主导+git → coding-forge；其余 → exec-forge。逐任务按执行编排预分配表派发（机械→裸 dispatch / 集成→dispatch+注入 / 判断类、组合复杂→主线程 inline + 独立审查）；阶段 4 入口批量确认停止点 | 引擎路由（规则见 §动态组合 首节）：代码主导+git → coding-forge；其余 → exec-forge。逐任务按执行编排预分配表派发（机械→裸 dispatch / 集成→dispatch+注入 / 判断类、组合复杂→主线程 inline + 独立审查）；阶段 4 入口批量确认停止点 |
| 5 | 验证 | 跑验证命令，输出即证据 | 单测 + 相关集成测试 | 单测 + 相关集成测试 | 分层验证 + 真机最小验证（先离线模拟核心路径）+ 全分支 review |
| 6 | 收尾 | 规范 commit message | commit + 三行简报（改动/验证/遗留） | commit + 三行简报（改动/验证/遗留） | ledger 收尾 + 调 learnings 固化新经验 + 分支收尾决策（**停**） |

**阶段 2 出口通用（1.16.0）**：凡 plan 落盘（MS=`.caliber/plans/`、ML/L=`docs/plans/`），
编排者即建任务台账 `.caliber/exec/<plan-stem>/progress.md`——表头（定级/引擎路由/
plan 路径/开账时间）+ 流水行 `| 时间 | 阶段 | 事件 | 产出/指针 |`；此后审查轮、
裁定门、闸口、彩排、dispatch、停止点逐项追加；阶段 4 引擎启动后续写同一文件，
不重建、不覆盖。

**阶段 6 通用（1.14.0）**：`docs/known-issues.md` 存在时做**触发核查**——
重访触发命中本任务的 open 项必须显式处置（关闭记理由 / 带新触发再延 /
转 TODO.md），处置结果进三行简报；文件不存在或零命中 → 跳过不记。

**路由表查表**（仅 ML/L 级；S/MS 按 Step 1.5 门控无表，直接跳过本步）：
上表各阶段（1-6）开始时由编排者先查 `.caliber/routing.yaml`
（Step 1.5 产物），命中优先、未命中走全局默认；无表则跳过本步。
**implement 阶段**（ML/L 级）的命中不走"主线程自读"，经 §动态组合 进入
执行：画像领域词记入 plan（候选依据，工序 4 彩排后升级为预绑定），组合决定由编排层在 dispatch
边界做出（注入两档：指令化/许可清单；预绑定语义见 §动态组合）。S/MS 级命中按上句默认（主线程自读）。

## §动态组合（阶段 4 执行层：任务画像 → 组合 + 派遣 → 执行形态）

**作用域**：本节仅适用 ML/L 级阶段 4（两引擎通用——组合决策与引擎无关）。S/MS 阶段 4 语义不变
（TDD inline），不适用本节。

阶段 4 的**过程节拍**恒定（TDD/执行引擎是骨架），**领域装备**按任务动态组合。
plan 管"做什么"（绑定权威，刚性）；本节管"拿什么做"（skill 组合，动态）
与"派谁做"——dispatch 选择轴：agent_type（2b）× prompt（注入两档）；
model 轴在 ZCode 塌缩为 platform-default（仅记录，见"实现/审查分席缺省"段）。组合决策分两点落定（2026-09-16 用户裁定）：**技能消费在 plan 期彩排后预绑定**（plan-forge 工序 4 Phase 2 映射 + 编排者裁定回写——预绑定 = 默认消费——dispatch 边界偏离须记 ledger Ruling，终审闭环核查）；**消费方式与偏离裁定在 dispatch 边界**，决策者是编排层（主线程），不是执行者——执行者拿到的仍是逐字指令（注入的 skill 正文摘录）。无彩排产出的 plan（旧 plan / 免彩排级别）按旧语义：组合在 dispatch 边界现决、路由命中候选非绑定。

**1. 任务画像（组合输入）**：plan（plan-drafting 标注；plan-forge 工序 2 抽查）为每任务标注画像，
格式定死：`画像: 性质=…; 难度=…; 领域词=[…]`
- 性质：新增 / 修bug / 重构 / 原型 / 配置 / 文档 / 调研 / 操作
- 难度：机械 / 集成 / 判断——**自设三档**（独立设档口径，不外引其他分档体系）
- 领域词：供路由表关键词匹配
画像前置进 plan，工序 2 不锁 skill 组合——锁定发生在 plan-forge 工序 4
彩排后：Phase 2 映射 + 编排者裁定把技能消费以预绑定形态回写 plan（默认
消费；dispatch 边界仍可据运行时信息——前序任务实际产出、真实代码状态——
偏离，偏离必须记 ledger Ruling）。画像是执行层的输入；预绑定是执行层的
缺省，不是锁死。
任务缺画像标注 → 按"集成"对待（dispatch+注入，安全向）。

**执行引擎选择**（阶段 4 入口先定引擎，再谈组合）：按 plan 任务性质画像分布——
代码主导（过半任务性质 ∈ {新增,修bug,重构} 且涉及源码）且仓库有 git
→ caliber:coding-forge；其余（非代码主导 / 无 git /
混合但代码任务不涉 git 语义）→ caliber:exec-forge；同一 plan 引擎唯一不混跑。
exec-forge 内代码任务用其"代码"验证菜单。主导判定歧义 → 停（铁律 7）。
引擎与组合的分工：引擎持任务环机制（brief/四状态/审查门/fix loop/ledger），
本节持组合决策（骨架×领域组件×agent_type×注入档），引擎消费本节决策不复制。

**2. 组合公式**：每任务 dispatch 前，编排层算组合 = 过程骨架 ×1 + 领域组件 ≤3
+ agent_type = f(画像)：
- **过程骨架 ×1**：按画像性质查映射选取（枚举集，不许开放即兴）：
  新增→TDD直改 / 修bug→调试先行 / 重构→重构-验证 / 原型→原型-验证 /
  配置、文档→TDD轻验证 / 调研→证据登记 / 操作→回滚先行。非 coding 任务的
  骨架语义与验证形式见 caliber:exec-forge 菜单节（同源，不复制；非 coding
  任务的组合行骨架名以彼菜单为准）。
- **领域组件 ≤3**：plan 预绑定（工序 4 回写）> 路由表 `stages` ⊇
  implement 命中 + 任务文本关键词匹配 > 全局 skill 清单；候选源封闭，
  不许凭空造（C2）。预绑定组件默认消费（跳过须 Ruling）；预绑定外路由
  命中照常消费；无预绑定的 plan 按旧语义（命中候选非绑定，dispatch
  边界现决，C6）。
- **agent_type = f(画像)**（dispatch 第三轴，2026-09-01 新增）：见 2b 映射表。

exec-forge 路径的消费钩子 = caliber:exec-forge §任务环「组合决策与注入」
步（机制在引擎、决策规则在本节；其操作版三原子——匹配句、`领域组件 ≤3`、
`命中=<表/plan/无>`——与本节同源逐字）；coding-forge
路径由编排者在 dispatch 边界应用本节。

**2b. agent_type 映射**（dispatch 第三轴，2026-09-14 链式重写）：候选只认当前会话 Agent 工具可见列表；按**去前缀名**匹配（`${name##*:}`）取链上首个在场者；全链缺席退 `general-purpose`。选择结果记 ledger（`agent=<type>`），可审计可校准：

| 画像/任务信号 | 优先链（取首个在场者，去前缀匹配） | 兜底 |
|---|---|---|
| 只读搜索/定位（fan-out 扫文件，结论导向） | `Explore` | general-purpose |
| 代码 diff 审查（引擎 reviewer 槽） | `code-reviewer` | general-purpose |
| plan 对抗审查（ritual 声部 A；MS 级阶段 3 单派遣亦消费） | `plan-reviewer`（详见 ritual Step 2 选择链与双形态 prompt） | general-purpose |
| 实现（机械/集成 dispatch） | `coder` → `general-purpose` | general-purpose |
| 计划/拆解/需求分析 | `architect` → `code-architect` | general-purpose |
| 疑难 bug 诊断（根因不明类） | `debugger` | general-purpose |
| 深度调研/选型 | `researcher` | general-purpose |
| 文档撰写/手册/报告（dispatch 形态时） | `doc-writer` | general-purpose |
| 系统操作/安装配置/进程服务（dispatch 形态时） | `ops-operator` | general-purpose |
| 无信号 / 拿不准 | `general-purpose` | — |

注：文档/系统操作类任务缺省收回主线程 inline（§动态组合 骨架：配置、文档→TDD轻验证）；上两行在编排层决定 dispatch 时生效。

纪律：
- **只读信号不明确 → 一律给全工具 type**：权限错配（只读 agent 干写活）比选择保守更危险。
- 体系内仍写死者（勿链化）：litmus 彩排 = fresh 零背景基线 agent（plan-forge 工序 4 写死——刻意零背景探测困惑；模型档不可配的本平台，零背景基线即最弱现实执行者，换熟手反而失效）；工序 3.5 准出闸口 = fresh 独立复审 agent（闸口契约=修复后全局复审，要求零轮次参与）。
- 链是启发式非绑定；agent 列表随插件增减漂移时旧链不失效（全缺席退 general-purpose = 现状行为）。
- 历史注记：旧版外部插件的专属 reviewer 行与 Claude 环境 transcript 频次依据随环境退役，不再作为选择依据。

**3. 难度决定执行形态**：
- 机械 → **裸 dispatch**（零组合或最小组合，保住便宜快）
- 集成 → **dispatch + 注入**
- 判断类 / 组合复杂 → **收回主线程 inline**：主线程天然持有全部 skill 与
  完整上下文，是 skill 发挥空间最大的执行者。**收回不等于免审**：inline
  完成后派独立 reviewer 审查该 diff（编排者自改易跳过
  审查，故补此门）。2026-08-29 用户裁决：此为 2026-08-13 分席理由的
  授权例外，见"实现/审查分席缺省"段。

**4. 注入两档**（仅对 dispatch 的任务；档=策略选择非模型档）：
- **指令化**（默认档）：编排者 Read skill 正文、抽取与本任务
  相关段落写进 brief，subagent 不碰 Skill 工具。
- **许可清单**（须显式授予——plan 预绑定或编排层 Ruling，工具授权永不
  默认）：dispatch 带一行"本任务许可调用：
  X、Y、Z"——枚举式、可审计，不是自由购物。（subagent 调 skill 的障碍是
  纪律级而非工具级：general-purpose 持 Skill 工具，外部通用纪律条款与直接
  指令冲突时直接指令优先。）

**5. 安全边界**（动态不变混乱）：
- plan 的 spec/契约仍是绑定权威：组合只决定"规格内怎么实现"；skill 指引与
  plan 冲突 → plan 赢 + ruling 记录。
- 组合上限（骨架 1 + 领域 ≤3）、候选源封闭，防编排者即兴。
- 审查门不变：reviewer 的 constraints 块加"核对 diff 是否符合绑定组件约定"，
  注入由独立 reviewer 验证闭环；收回 inline 的 diff 另过独立审查（见第 3 条）。
- 组合进 ledger（`Task N: 组合=[…] agent=X model=<平台基底> 注入档=Z 命中=<表/plan/无> 理由=…`），收尾可审计
  （agent_type 分布是 2b 映射表校准的数据源；平台基底字段与 exec-forge §组合行同源——ZCode 记 platform-default(agent_type=<x>)，模型档可配平台记映射档）；实现者运行中
  报缺组合，走既有 NEEDS_CONTEXT / DONE_WITH_CONCERNS 状态（引擎四状态
  契约封闭，不造新通道），编排者裁定是否补组合后重派。

**实现/审查分席缺省**（阶段 4 ML/L 级；dispatch 的分席轴，与 2b 的
agent_type 轴正交、各自独立设置）：实现已被 plan 拆解为机械步骤，实现者可
基线执行；审查者 fresh 独立于实现上下文，把住逐任务审查关——分席价值在
上下文隔离与作者盲区，不独在模型差（2026-08-13 用户裁决：ML 级同样分席
即为此；2026-08-14 MS 子档拆分后，MS 保持 inline TDD 不分席）。模型档
平台映射：Claude=实现降配 sonnet/haiku、审查 opus 级，且**不要**让实现者
继承会话模型（=放弃审查者与实现者的能力差）；**ZCode=Agent 工具无 model
参数，统一 platform-default（轴塌缩，组合行 model 字段仅记录实际基底）**。

**与 §动态组合 的关系**：本段"实现者"指**被 dispatch** 的实现者——裸/注入
dispatch 仍按此分席。**判断类/组合复杂收回主线程 inline** 不是
dispatch，由主线程（会话模型）执行、天然持全部 skill——这是 skill 的发挥
空间，与分席不冲突；收回的 inline diff 必须过独立 reviewer 审查
（防跳过审查门）。
（2026-08-29 用户裁决：2026-08-13 分席理由适用于机械/集成 dispatch；
判断类收回是本裁决授权的例外，以审查门补偿为前提；2026-08-14 MS 拆分后
MS 保持 inline 同此渊源。）

## 铁律（不随级别缩放）

1. **六站必过**——S 级也澄清、也验证，只是每站从轻。
2. **证据先于断言**——说"完成了/修好了/通过了"之前，先跑命令、看输出。
3. **不可逆操作前必停**——删数据、外发、硬件写入、force push，无论级别。
4. **root cause 优先**——bug 类任务先定位根因再动手；治标的修复要在
   commit 里写明是治标。
5. **延期决策必带重访触发器**——"暂不决定"必须附"出现什么条件时回来定"，
   写进 ledger 或 plan；已否决项进挂起清单（带时间戳，最多温和复活一次，不自发重提）——触发器管「暂不决定」，挂起清单管「已否决」
6. **低估即升级**——执行中发现复杂度被低估，停下来升，不硬撑。
7. **歧义即停**——需求、方案、风险取舍有歧义就问；猜出来的方案不值得写。
8. **台账先于记忆**——plan 落盘即开账，关键决策/断点随时入账；任何 compact 或会话中断前，台账必须先于上下文保持最新（agent 主动义务，不等提醒）。

## 停止点速查

- **S 级**：不可逆操作前、歧义。
- **MS/ML 级**：+ 方案确认（同停止点拍板 MS/ML 子档）+ MS plan 审查裁定（Taste/User Challenge）。
- **ML/L 级**：+ 路由表确认（Step 1.5 第 5 步）+ 阶段 4 入口执行编排批量确认（exec-forge/coding-forge 预分配表）——两确认均带折叠条件（见 Step 1.5 第 5 步与 exec-forge §阶段 4 入口停止点，2026-09-15 裁定）。
- **L 级**：+ deep-probe 澄清问答、plan 逐条裁定（可批量）、审查轮 3 不收敛
  重锻、分支收尾。

其余一律自动推进——该走的流程不打断，该停的决策不抢跑。
