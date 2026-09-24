---
name: plan-review-ritual
description: "Use when you finish writing any implementation plan, spec, or design doc and are about to hand it to execution — especially when the executor is less capable."
metadata:
  version: "2.6.4"
  source: distilled-from-practice
---

# Plan Review Ritual v2

把"写完 plan"和"交付实现"之间的 review 固化为仪式。v2 升级：对抗升级为
**双声部共识**、发现按**三级分类**处置（明显笔误不再
逐条打扰用户）、新增**决策审计追踪**与**门前验证**；声部故障**修复优先、降级须用户裁定**（2026-09-01 用户裁定，废除自动降级）。
本 skill 是对抗审查**机制**；审查视角清单由调用方注入（plan-forge 工序 3
注入五视角）。v2.4 升级：新增**轮次化机制**（`ROUND`/`AUDIT_PATH` 入参，
见 Step 0/Step 2）支撑 L 级收敛循环——本 skill 仍是**单轮引擎**，循环策略
（轮次编排/收敛判据/重锻出口）由调用方 plan-forge 工序 3 持有
（2026-09-01 用户裁定）。v2.5 升级（2026-09-14）：声部 A 链化（plan-reviewer 优先、general-purpose 兜底、去前缀匹配、选择留痕）；声部 B 调用前能力预检；污染条款限定外部注入插件在场。
v2.6 升级（2026-09-14，两项用户裁定）：① "换脑子"——轮 3 起声部方法互换，
同一方法相邻两轮由不同声部执行（R2 A 修复验尸 → R3 B 接棒，R2 B 回填漂移
→ R3 A 接棒），防多轮审查视角固化；声部 B 纯文本边界不变，互换的只是方法
分配。② 声部 B 通道选择链化——voice-b-reviewer agent 在场为首选（模型分化
靠用户级 override，见 Step 2 声部 B 节）；外部通道仅作链式兜底。
v2.6.1-2.6.2（2026-09-15）：去强弱模型档措辞换词（执行者越弱 ROI 越大 →
能力越弱 ROI 越大 等 4 处；litmus 验收段改「较弱执行者」）；2.6.2 修
frontmatter description 英文残留 "weaker model"（独立复核抓取）。
v2.6.3（2026-09-20）：调用方关系 MS 行改写（MS 退出 ritual 消费）。
v2.6.4（2026-09-24）：Step 4 修复纪律加落点现盘定界指针（canonical = exec-forge §6 fix loop「修复预案落点现盘定界」；first-l-grade §4.1 grep 定界纪律）。

## 为什么有效（不要跳过，理解了才会用对）

1. **写作和评审是两种认知模式，无法同时进行。** 写作时大脑在"设计"，
   review 时必须在"执行"（这行代码跑起来会怎样）。Bug 全在"执行"层。
2. **作者盲区真实存在。** 作者重读的是"我记得我想写什么"，不是"纸上实际
   写了什么"。必须有零写作参与的第二双眼睛；**两个独立声部一致命中 =
   无条件修**（强信号）。
3. **plan 违反自己写的约束是最常见的坑。** 写完"铁律"后第一个违反它的
   往往是作者自己。
4. **plan 的读者是逐字执行的执行者，不是会心领神会的同事。** 执行者
   越弱，review 的 ROI 越大。
5. **不是所有发现都值得打扰用户。** 明显笔误静默修；只有真分歧才上裁定门；
   模型认为用户方向该改时，**用户原方向是默认——模型必须举证**。

## 何时使用 / 不使用

- **用**：任何 implementation plan / spec / 含代码块的设计文档写完后、
  交付实现前。执行者能力较弱时**必须**用。
- **不用**：代码 diff 的评审（那是 code review 的对象）；纯文字无代码的
  短篇文档（过重）。

## Step 0 — 输入

- `PLAN`：plan 文件路径（必需）。
- `CHECKLIST`：审查视角清单（可选）：plan-forge 工序 3 注入五视角；
  缺省用 Step 2 的通用模板。
- `VOICE_B`：第二声部 = **通道选择链**——链① `voice-b-reviewer` agent（在场
  首选，去前缀匹配）、链② 外部声部通道（fallback；2026-09-01 固定
  通道裁定，2026-09-14 用户修订为链式兜底）；链尽/降级/单声部均为
  **用户裁定停止点**。选择规程与故障修复梯子见 Step 2 声部 B 节。
- `ROUND`：轮号 + 上轮 DELTA 表（可选，默认 1）。`ROUND=1` 且无 DELTA =
  现行单轮行为；`ROUND≥2` 启用 Step 2 轮次化 prompt 变体。DELTA 表由调用方
  从 `AUDIT_PATH` 上一轮审计行装配（修复位置/摘要/涟漪）。
- `AUDIT_PATH`：审计落盘路径（可选，默认 = PLAN 文件末尾，即现行行为）。
  L 级收敛循环由 plan-forge 工序 3 传入
  `<项目根>/.caliber/review-logs/<plan-stem>.md`。

## Step 1 — 执行追踪式自审（作者本人，换"跑代码"的脑子）

逐条做，每条发现必须**引用原文行**，找不到证据的降级进附录：

1. **心算每条测试断言**：把测试输入代入实现代码，算出期望值再对比断言。
   （实测抓到：`sorted()` 平局顺序写反、时间戳年份断言算错一年。）
2. **模块级语句逐个 import 一遍（脑中）**：`re.compile(r"\X")` 这类模块级
   语句在 import 时就执行——它炸了，整个测试文件连收集都过不去。
3. **跨任务签名/字段/命名一致性**：Task N 定义 vs Task N+3 的调用；
   dataclass 新增字段必须带默认值放末尾（否则已有构造全部 TypeError）；
   同一函数在两个任务里两个签名。
4. **对照自己的全局约束清单逐条查**：plan 开头写的每条"铁律"，去正文里
   找违反点。（实测抓到：约束写"COM 引用不得入集合"，正文 BFS 队列却存
   COM Folder。）
5. **平台/语言事实核查**：目标平台的真实行为，不是想象的行为。
   （PS5.1 `powershell -File` 把 Write-Warning 送进 stdout 破坏 NDJSON；
   外层超时必须 > 内层超时之和。）

**全深就是全深**：每个检查项，"没发现问题"必须附"查了什么、为什么没有"
（1-2 句）。一行带过 = 没查。

## Step 2 — 双声部对抗审查

**声部 A**（必须）：fresh-context 对抗 subagent，零写作参与——它读的是"纸上实际写了什么"。

**选择链**（2026-09-14 链化，替代写死 general-purpose）：dispatch 前查当前会话 Agent 工具可见列表，按**去前缀名**匹配（`${name##*:}`，与 hooks 剥 skill 插件前缀同纪律），取链上首个在场者：
1. `plan-reviewer`（含插件前缀形态，如 `caliber:plan-reviewer`）在场 → 用它。其系统提示已内置审查方法论、上报纪律与输出格式，dispatch prompt 用**精简形态**：PLAN 路径 + CHECKLIST（调用方注入视角）+ CONTEXT（2-3 句背景 + 已验证领域事实）+ ROUND≥2 时的 DELTA/防重复段——**不再内联下方通用模板**，避免双份纪律打架。
2. 不在场 → `general-purpose` + 下方**完整 prompt 模板**（指令化注入，与 caliber §动态组合 注入档同理）。

留痕：解析结果写一行进审计表（`声部A = <type>`）。链式兜底是**设计内行为，非降级**——声部 A 的核心契约是 fresh-context 零写作参与，不是某个具体 agent；2026-09-01"降级须用户裁定"针对声部 B 外部通道，不适用本链。

prompt 模板（general-purpose 形态用；按需裁剪，保留粗体纪律）：

```
You are a brutally honest technical reviewer examining an implementation plan
that has already been through review. Your job is NOT to repeat that review.
Find what it missed: logical gaps, feasibility risks taken for granted,
syntax errors in code blocks, wrong test expectations,
cross-task signature mismatches. Be direct. Be terse. No compliments.

CONTEXT: <2-3 句项目背景 + 已验证的领域事实>
READ: <PLAN 路径>（all of it）+ <关键支撑文件>
CHECKLIST: <调用方注入的视角清单；无则按上文默认>

For EVERY issue: quote the exact plan line/snippet, severity (P1/P2/P3),
concrete fix in one sentence. Focus on things that would actually fail at
runtime or make tests fail. No style comments. No task-organization comments.
```

- **只报运行时会炸的问题**（风格/组织问题明确排除——噪音会淹没问题）。
- 要求引用原文行——引不到的不报（这条纪律杀掉大部分误报）。
- 预期 5-10 分钟（复杂 plan 实测 585s；Agent 通道无硬超时，此为预期管理而非封顶），失败不阻塞主流程。

**声部 B**（必须；缺席/故障走 Step 2 修复梯子与停止点，**不得单声部续跑**）：同一 PLAN、换模型来源，**分工与声部 A 不同**（2026-09-01 实证改版）：**B = 纯文本内部一致性专责**——只读 PLAN 本体（内部矛盾/回填漂移/字面执行者陷阱），**不做仓库与代码交叉核对**。依据：A（主声部 subagent）上下文预算大，事实核查养得起；B 保持纯文本——外部通道有超时上限，开放式 grep 仓内大文件会把上下文炸到 100K+，纯文本专责让 B 的注意力全在内部一致性上（两链通用）。B 的 CHECKLIST 取 A 清单中不依赖仓库读取的条目（拿不准是否依赖仓库 = 视为依赖，剔除）；共识表机制不变（A 全量覆盖，文本类发现仍可与 B 双命中成 CONFIRMED）。**调用按规程执行，
禁止凭感觉判断"配没配"**：

0. **通道选择链**（2026-09-14 用户裁定新增）：dispatch 前查当前会话 Agent 工具可见列表，按**去前缀名**匹配（`caliber:voice-b-reviewer` 与裸名同效），取链上首个在场者。
1. **链① `voice-b-reviewer` agent 在场** → 用它。其系统提示已内置声部 B 方法论
   （纯文本专责、轮次 stance、上报纪律），dispatch prompt 用**精简形态** =
   PLAN 绝对路径 + 本轮 B 视角 CHECKLIST（纯文本子集）+ `ROUND≥2` 时的
   DELTA/轮次 stance 段。**模型分化留痕**（每次必做）：读
   `~/.zcode/v2/agents-state.json` 的 `pluginAgentModelSelectionOverrides`
   有无本 agent 键——有 → 审计行 `声部B = voice-b-reviewer (override: <模型展示名>)`；
   无 → 审计行 `声部B = voice-b-reviewer (model=platform-default)` 并**提示用户**：
   配一个与主声部不同家族的模型 override 才保住跨家族对抗价值（配置 = ZCode
   插件 agent 管理界面）。无 override **不阻断**——配置是用户主权，但对抗
   价值稀释必须在审计里看得见。
2. **链② `voice-b-reviewer` 缺席 → 外部声部通道**（fallback 通道；
   2026-09-01 用户裁定其为固定通道，2026-09-14 用户修订为链式兜底——
   "故障先修复、禁止自动降级"纪律继续适用本链②）。链② 留痕：审计行
   `声部B = 外部声部通道 (fallback；链① voice-b-reviewer 缺席)`。
   外部通道的调用规程（预检、调用命令、stdin 重定向纪律、失败模式表）以
   用户环境内既有外部声部 skill 的说明为唯一准绳，本 skill 不留副本。
   prompt = 对抗审查 prompt + B 视角子集 CHECKLIST（纯文本）+ PLAN 绝对路径；
   返回审查文本 = 成功；任何失败 → 第 3 条修复梯子（**先修复，禁止降级**）。
   能力预检：调用前先查当前会话 skill 清单有无可用的外部声部 skill
   ——无 → 不发起注定失败的调用，直接进第 4 条用户裁定停止点（证据 = 会话
   清单缺席）。预检只判 skill 在场；skill 在场 ≠ 底层 CLI 可用——CLI 缺席仍
   走梯子 ③ 配置类上报，预检不替代该 skill 自带的预检（如有）。
3. **失败 = 先修复（修复梯子，每步留痕），阶梯耗尽前禁止降级**。链① 失败
   （dispatch 报错/超时/产出为空）先按"缩任务域重试 + 强化 prompt 锚"修复
   一轮，再失败 → 落链②（链式兜底是**设计内行为，非降级**，留痕一行即可）；
   链② 失败按该外部声部 skill 提供的失败模式说明（如有）定性；无说明则按
   RC 与输出形态定性后依次走：
   ① **转写验尸**（RC=124/零输出/疑似卡死）：读子进程转写（该 skill 提供
      观测手段时用其方法，无则按 RC/末事件形态判）；ctx = 各 assistant 事件的
      `usage.input_tokens`——末事件=孤立 tool_use/tool_result 且 ctx 持续
      递增 = 健康但慢，不是故障；
   ② **健康但慢，或验尸判死（非配置类/非污染）** → 缩任务域重试（纯文本化）/
      `--resume` 续跑（该 skill 支持时）/ 看门狗重跑，按验尸结论选择；（实证 2026-09-01：全量任务单 300s 被杀时子进程健康
      跑了 38 个工具调用，缩域重试 109s 成功——同日 8 次调用 7 成功，唯一
      失败即固定封顶误杀健康任务。）
   ③ **配置类**（403/429/CLI 缺失、settings 缺失）→ 报告用户修配置（装
      CLI、换 API key、核外部 CLI 的超时配置），修复后重试；
   ④ **污染** → 存在上下文注入类外部插件时，确认其上下文开关类环境变量未被调用链剥离（纯 ZCode 环境无此污染源，跳过本项）+ 强化 prompt
      免疫锚 + 缩 prompt，重试。
4. **链尽 = 用户裁定停止点**：链①②均不可用，或链②修复梯子 ①-④ 耗尽
   仍失败 → **停**，把验尸证据 + 已尝试修复清单 + 失败定性贴给用户；经用户
   批准才可用备用外部通道（用户环境内的其他外部声部 skill，先 30s ping 验活）
   或第二个独立 subagent（prompt 换框架）。**禁止自动降级、禁止自动
   `[single-voice]`**（旧版「全不可用标记 single-voice 继续不中断」已废除——
   静默降级让第二声部形同虚设）。批准后降级原因 + 用户批准记录写入审计表。

**轮次化变体**（`ROUND≥2` 时启用；轮 1 模板一字不改）：

**方法轮换表**（v2.6 写死，不许即兴换；每个方法标注仓库依赖属性——声部 B
永不分配仓库依赖方法，拿不准 = 依赖）：

| 轮 | 声部 A | 声部 B（纯文本约束不变） |
|---|---|---|
| 2 | 修复验尸（主；仓库增强可选）+ 恶意字面执行者 + 完整性批判 | 恶意字面执行者 + 回填漂移猎手 |
| 3 | 回填漂移 + delta 复验（仓库增强可选） | 修复验尸（纯文本版）+ pre-mortem |

设计理由（2026-09-14 用户裁定"换脑子"）：同一方法在相邻两轮由不同声部
执行（R2 A 修复验尸 → R3 B 接棒；R2 B 回填漂移 → R3 A 接棒），方法 ×
声部交叉覆盖；每个声部每轮换方法，防多轮审查的视角固化。声部 B 的通道
（选择链见声部 B 节）与纯文本边界（不读仓库）不因互换改变——互换的是
方法分配，不是声部能力约束。跨轮复现条款（Step 3 审计行现有）天然覆盖
互换后的跨声部再命中，视同跨轮共识。

- **声部 A 轮 2**（现行不变）加三段：`DELTA` 段（立场 = 修复验尸）、恶意
  字面执行者 stance、防重复纪律——prompt 骨架见 plan-forge
  checklists.md 工序 3 节。
- **声部 B 轮 2**（现行不变）：纯文本 delta 猎手（恶意字面执行者 + 回填
  漂移专责），prompt 必须缩域（禁全量任务单，2026-09-01 实证）。
- **轮 3 互换**：A 接管 B 域方法（回填漂移 + delta 复验），允许仓库增强；
  B 接管 A 域方法的纯文本版——修复验尸 = DELTA 表各行与 plan 当前正文
  逐行对照（修复位置文本还在吗、摘要与正文一致吗、涟漪行的契约/引用落地
  了吗）；pre-mortem = "两周后实现失败，哪行 plan 被逐字执行导致了它"，
  只报风险登记未覆盖者。轮 3 B prompt 仍强制缩域。
- 轮次编排、收敛判据、重锻出口是**调用方策略**（plan-forge 工序 3），
  本 skill 只提供轮次化机制。

**共识表**（每条发现一行）：

```
| 发现 | 声部A | 声部B | 共识 |
| ...  |  ✓/—  |  ✓/—  | CONFIRMED（双方命中）/ SINGLE（单方） |
```

CONFIRMED = **无条件修**；SINGLE 按置信度进裁定队列；critical 级 SINGLE
也必报。

## Step 3 — 决策分类裁定（不再逐条打扰用户）

每条发现先分类，再按类处置：

| 分类 | 判据 | 处置 |
|---|---|---|
| **Mechanical** | 明显笔误：断言值算错、签名漂移、编码标志、行号、拼错的符号 | 直接修 + 审计行，**不打扰用户** |
| **Taste** | 两种合理方案、可改可不改、风格倾向 | 上裁定门：严重度+原文引用+一句话修法+推荐项；可告诉用户"可回复'全部按推荐'" |
| **User Challenge** | 双声部一致认为**用户指定的方向**该改（合并/拆分/增删功能） | **永不自动定**。框架：用户原话 / 模型推荐 / 理由 / 我们可能缺什么上下文 / 如果我们错了代价是。**用户原方向为默认** |

**决策审计追踪**：每条裁定**立即**追加到 `AUDIT_PATH`（默认 = PLAN 文件
末尾；防 context 压缩丢失，compact 后任何人可凭此继续）：

```
<!-- REVIEW DECISION LOG -->
## 审查决策审计（plan-review-ritual v2.5）
| ID | 来源 | 发现 | 分类 | 裁定 | 理由 | 修复位置 | 涟漪 |
```

行格式纪律（轮间 DELTA 装配的前提）：
- ID 规则 `R<轮>-F<序>`（如 R2-F3），稳定可引用；
- **涟漪**列：该修复是否触碰契约矩阵（签名/字段/消息格式/常量）或跨任务
  引用——是/否。调用方据此判定是否触发下一轮；
- **跨轮复现**：同一位置在不同轮次被不同 stance 命中 → 标记"复现"，视作
  跨轮共识，强度不低于同轮 CONFIRMED。

零发现的检查项/视角必须在审计表或正文里留"查了什么"记录，不许静默跳过。

## Step 4 — 落修复 + 门前验证 + 较弱执行者验收

1. 修复全部改进 **plan 文件本身**（不是另写新文档）。多处同改的落点清单**现盘 grep 生成**，禁凭记忆/plan 枚举（canonical 条款 = exec-forge §6 fix loop「修复预案落点现盘定界」）。
2. **门前验证**（验收前逐项核对，缺一补一，最多 2 轮）：
   - [ ] 审计表行数 = 发现总数（无静默丢弃）
   - [ ] Mechanical 修复已回写 plan（抽查 diff）
   - [ ] 共识表已产出（或经用户批准降级后标记 `[single-voice]`，批准记录入审计表）
   - [ ] 审计行含稳定 ID（`R<轮>-F<序>`）与涟漪列（收敛循环/`ROUND≥2` 场景必查）
   - [ ] 每个检查项/视角都有"查了什么"记录
   - [ ] 未决项 = 0，或每条带重访触发器
3. **字面执行验收（litmus）**：假想一个不知道本项目任何背景的基线
   执行者，只看 plan 逐字执行——
   - 每个测试的期望值是否算到个位数给出？（不是"验证它正确"）
   - 每个签名/字段是否在使用前已定义？
   - 有没有"显然如此"而未写出的步骤？
   - 有没有引用了未定义的类型/函数/常量/文件？
   任一不满足 → 补全。这不是啰嗦，是契约。
4. plan 末尾审计表补一行总结（发现数 / 分类分布 / 未决项——无则写
   NO UNRESOLVED）。

## 收尾

- 抓到的新型陷阱（平台级、可复用的）写入项目陷阱文档或 learnings，
  让下次 Step 1.5 的清单变长——这个 skill 的价值随使用增长。
- 调用方关系：plan-forge 工序 3 调本机制并注入五视角清单
  （plan-forge/checklists.md）；L 级收敛循环由工序 3 传入 `ROUND`/
  `AUDIT_PATH`；caliber ML 级仅用 Step 1 自审；MS 级不经本 skill（阶段 3 = 快速自查 + plan-reviewer 单派遣，prompt 骨架见 plan-drafting）。
