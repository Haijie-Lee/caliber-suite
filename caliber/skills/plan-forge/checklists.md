# Plan Forge — 检查清单（按需读取）

仅在进入对应工序时读对应节。这里是对抗审查的**视角细目**；机制（双声部、
共识表、裁定分类、审计追踪）在 plan-review-ritual v2，此处不重复。

## 工序 2 — 制坯检查清单（已移交）

本清单已随六道锻造下沉至 caliber/skills/plan-drafting/SKILL.md「自查清单」节（v1.8.0，2026-09-20）；工序 3-4 节清单不受影响。

## 工序 3 — 锻打五视角清单（轮 1 注入 plan-review-ritual 的 CHECKLIST；轮 ≥2 stance/prompt 骨架见本节末尾）

通用纪律：只报运行时会炸或执行会卡的问题；引用原文行，引不到的不报；
风格/组织问题不报。

### 视角 1 — 执行者（较弱执行者逐字执行）
- 有没有步骤依赖执行者的背景知识才能懂？（"按现有模式处理"= 炸）
- 有没有步骤完成判据模糊？（"处理一下边界情况"——什么算处理完？）
- 任务间顺序依赖是否显式？（Task N+3 用了 Task N 的产物，说了吗？）
- 每个文件路径是否精确到存在/将存在的具体位置？

### 视角 2 — 契约（跨任务一致性）
- Task N 定义的签名 vs Task N+M 的调用：逐字对
- 消息/文件格式：生产者和消费者对同一字段的类型/可空性理解一致吗？
- 常量/枚举值：所有使用点的取值集合一致吗？
- "Interfaces: Consumes/Produces" 块与正文实际代码一致吗？
- **文件/目录搬迁任务：替换表的旧字符串必须与实文逐字比对**（实证：2026-08-13 文档整合——两处旧串缺反引号、一处缺括号导致全文替换零匹配，另 8 处引用点漏列入表；grep 证据逐条对照，计数注解（"2 处"）在"显示文本+URL 双出现"的文件里必然失真——直接标"全文替换"）
- **断链修复的目标必须实测存在**（实证：`plans/status_redesign.md` 全仓库不存在——幽灵旧名；修复时先 `find` 验证目标，判定旧名/笔误要写进 plan，不许静默猜测）

### 视角 3 — 环境（平台真实行为）
- 每条平台断言（shell 行为、编码、路径分隔符、超时语义）是实测的还是想象的？
- 外部命令/依赖的版本假设写出来了吗？版本不符时的行为呢？
- 并发/时序假设：有没有"这里肯定已经完成了"而未同步的点？
- 资源假设：磁盘、内存、句柄——超限时的行为定义了吗？
- **共享工作树的提交纪律**（实证：多 workstream 并行仓库，`git add -A`/`-u` 把 7 个他线修改 + 未跟踪文件卷入"纯搬迁"提交）：commit 步骤必须显式路径暂存；未跟踪他线文件"只改不提交"；含他线改动的文件用条件分支 + 简报说明
- **外部声部/长任务引用的超时语义必须分档且实测**（实证：2026-09-01 backmigration plan 复审轮——ritual Voice B 全量任务单（读 plan + 交叉核对仓库）被固定 `timeout 300` 强杀 RC=124 零输出，转写验尸证明子进程健康（38 工具调用/242s/上下文 119.6K），同日 8 次调用 7 成功、唯一失败即封顶误杀）：凡 plan 步骤引用外部模型审查或长任务，超时按输入规模分档（纯文本 ≤300s；含计划外文件读取 → 后台 + 看门狗 + 停滞判杀），且 RC=124 的处置 = 先验尸转写再降级，禁止看到超时就降级；千行级/开放式读取优先改为摘录进 prompt 或移交主声部，而非仅换后台
- **MSYS2/Git Bash 的 `sed -i` 默认剥 CRLF**（实证：2026-09-09 fed_console 移植 T4——plan 原样命令 `sed -i 's/Eco Console/Fed Console/g' tools/collect_dist.ps1` 执行后 162 个 `\r` 清零，触发自己的 CRLF 门禁；`sed -b -i`（binary I/O）保 162 个且替换正确）：凡 plan 步骤用 sed 编辑 `*.ps1` 等 CRLF 强制文件，命令必须写 `sed -b -i`，且验证步骤必须含 `file` 或 `\r` 计数断言
- **派 subagent 去某包体内挖子系统前，plan 必须含一条「该子系统确实在此包体内」的实测断言**（实证：2026-09-19 ZCode 动态工作流调研 workflow——「实现层」面 brief 写「从 app.asar 里挖 CreateWorkflow 实现」，实际引擎在服务端，客户端包 27068 文件内 `dwf_run`/`caps_max_concurrency`/`actor_site_id` 命中数均为 0，只有工具名注册表项；该 subagent 执行 6m40s 仍停在第一步挖不存在的引擎，同批整轮已烧 270K tokens）。**关键：为该面配的独立核验者抓不到此错**——核验者被要求「独立重读同一证据源」，与调研者共享同一错误前提；**换人复审只能证伪证据源能证伪的东西，前提本身错了双人复核会一致地错**。故 plan 的每条「去 X 里找 Y」任务，须由编排者先用一个特征标识符 grep 坐实（成本约 1 次调用），而不是交给执行者或审查者验证
- **凡 plan 含 `report()` / 事件上报类调用，payload 必须只含该下游真正消费的字段，且 plan 须给出上限量级**（实证：2026-09-19 同上 workflow——把 88 条 claims 数组塞进 `report()` 得 62685 字节，超 32768 上限，整轮以 `ReportCapExceeded` 终止于 19.1M tokens；该数组对只声明四列的 `artifact.table` 毫无用处，属「顺手多带一点」打死整轮）。完整数据走返回值交下游、上报只留摘要。配套排障纪律：**工作流失败的第一动作是查持久化的节点结果（如 `dwf_node.result_json`）而非看失败通知**——该轮 5 个已完成面的 261 条结果全部可从中取回，改 payload 后重跑 6 步命中缓存

### 视角 4 — 风险（失败模式）
- 每个外部交互点：失败时 plan 说什么了吗？（超时、拒绝、空响应、畸形响应）
- 部分失败状态：任务做到一半挂了，系统处在什么状态？能恢复吗？
- 取消路径：用户中途取消，资源（子进程、临时文件、锁）谁清理？
- 风险登记表每条处置与正文一致吗？（登记说"兜底"，正文有兜底代码吗？）

### 视角 5 — 测试（断言可复现）
- 每条断言：输入代入实现，期望值能心算复现吗？复现不出来 = 断言是抄的
- fixture 是真实数据还是手编的？手编数据的"干净度假象"排了吗？
- 模块级语句（regex、常量、装饰器）：import 时就执行——它会炸吗？
- 有没有测试只断言"不抛异常"（= 没断言）？
- 逐字交付的破坏性/不可逆核心脚本，有没有只被 plan 自带断言（快乐路径）验证？——补对抗性边界探针（盘符相对路径 / 同 basename 碰撞 / 异常 schema 输入），实证：2026-09-16 file-hygiene T4 F1/F2（3 轮审查+3 闸口+彩排全过快乐路径，执行期对抗探针抓出「崩溃无 manifest」与「trash 静默覆盖」两缺陷）

### 轮次化 stance 与 prompt 骨架（轮 ≥2 由 forge 工序 3 装配注入）

**stance 轮换表**（写死，不许即兴换；2026-09-14 起轮 3 方法互换——同一方法
相邻两轮由不同声部执行，防视角固化；B 永不分配仓库依赖方法）：
- 轮 2 声部 A：修复验尸（旧名 delta 验尸；主）+ 恶意字面执行者（次）+ 完整性批判；
- 轮 2 声部 B（纯文本）：恶意字面执行者 + 回填漂移猎手；
- 轮 3 声部 A（互换，接管 B 域方法）：回填漂移 + delta 复验（仓库增强可选）；
- 轮 3 声部 B（互换，接管 A 域方法纯文本版）：修复验尸（DELTA 表 vs plan
  正文逐行对，不读仓库）+ pre-mortem（"两周后实现失败，写事故报告——哪行
  plan 被逐字执行导致了失败？"只报风险登记未覆盖的失败模式）。

**轮 ≥2 声部 A prompt 骨架**（在 ritual 轮 1 模板基础上加三段）：

```
DELTA（上轮修复——每个都是嫌疑人，猎杀它破坏了什么）：
| ID | 修复位置 | 修复摘要 | 涟漪 |
（由 forge 工序 3 从 AUDIT_PATH 上一轮审计行装配）

PRIMARY — delta autopsy: for each fix above — did it introduce new
inconsistencies? Were ALL call sites / dependent tasks / contract-matrix
rows updated to match? Does it contradict any global constraint in the plan?

SECONDARY — malicious literal executor: execute this plan with maximum
literalism and minimum goodwill. Where does an ambiguous line allow you to
do something the author did not intend? Quote the line.

COMPLETENESS: what is missing that a plan of this caliber must have —
uncovered failure modes, missing cancel/rollback paths, unspecified
ordering between dependent tasks.

纪律追加：Do NOT re-report already-fixed items (see DELTA) unless the fix
itself is wrong or incomplete.

DRIFT WATCH（一行必答，2026-09-08 新增）：Did any fix this round change
WHAT the plan promises to deliver (not just HOW it delivers)? If yes —
escalate as P2 immediately; do NOT silently classify as Mechanical.
（它管不了的由工序 3.5 兜底——本行只抓最明显的承诺变更。）
```

**轮 ≥2 声部 B prompt 骨架**（纯文本，不读仓库）：

```
同一 PLAN，立场：恶意字面执行者 + 回填漂移猎手。DELTA 表附后。只找三类：
1. 字面歧义导致的多种合法解读（引用该行）；
2. 修复段与未修复段的自相矛盾（回填漂移：Task 3 签名改了，Task 7 正文
   还是旧的）；
3. 引用未定义/已改名对象的悬空引用。
```

**轮 3 声部 B prompt 骨架**（纯文本，不读仓库）：

```
同一 PLAN，立场：修复验尸 + pre-mortem。DELTA 表附后。只找三类：
1. 验尸未闭合：DELTA 某行的修复位置在 plan 当前正文里找不到对应文本，
   或修复摘要与正文实际内容不符（引用该行与正文）；
2. 涟漪未落地：DELTA 标记"涟漪=是"的行，其契约矩阵行/跨任务引用在正文
   里仍是旧值；
3. pre-mortem：两周后实现失败——哪行 plan 被逐字执行导致了它？只报风险
   登记未覆盖的失败模式。
```
**成本纪律**：轮 ≥2 checklist ≤ 轮 1 一半；声部 B 一律缩域纯文本
（禁全量任务单，2026-09-01 实证：全量单被 300s 封顶误杀健康任务）。

## 工序 3.5 — 准出闸口检查清单（exit gate，2026-09-08 新增）

通用纪律（与轮内审查**相反**）：**不看 DELTA 表、不看任何轮次审计、不知道
修了什么**；只对照三样——原始 CONTEXT、当前 plan 全文、仓库现实。
每条发现必须同时引用 plan 原文 + CONTEXT 原文（或仓库证据），引不到的不报；
风格/组织问题不报。

### 问 1 — Goal drift（目标漂移）
- [ ] CONTEXT 的每个需求点：在 plan 里有明确落点吗？（逐条编号对照，
      落点引用 plan 原文；无落点 = 遗漏漂移）
- [ ] 反向镀金：plan 承诺了 CONTEXT 没要求的东西吗？（多出的迁移面/
      外发面/重写面都是成本与风险）
- [ ] plan 的验收标准（验证命令、成功判据）还对应 CONTEXT 的成功定义吗？

### 问 2 — Fact re-verification（事实再核查）
- [ ] **修复触碰过的段落**（编辑痕迹：与上下文文风/粒度突变的段落）：其中
      每个事实断言（文件存在性/函数签名/版本号/数值/命令行为）逐一读源或
      实测——必查；
- [ ] 未触碰段落：带 `(实测 YYYY-MM-DD)` 标注的断言抽样 ≥30% 再验证；
- [ ] 断言引用的对象在仓库里已改名/挪位/删除？（悬空引用全查，非抽样）

### 问 3 — 假设链连贯性（前提消失猎手）
- [ ] 每个 Task N 的前提（"此时 X 已存在/已配置/已通过"）：在 Task M
      （M<N）的**当前文本**里还成立吗？——不查文本矛盾（那是回填漂移的
      活），查前提是否被修复悄然撤走；
- [ ] 风险登记每条的处置与修复后正文一致吗？（处置引用的机制可能已被
      修复改掉）

### 派遣 prompt 骨架（forge 工序 3.5 注入，填槽 {CONTEXT} {PLAN_PATH}）

```
You are a fresh exit-gate reviewer. You did NOT participate in writing or
reviewing this plan. You are deliberately NOT told what was fixed during
review rounds — do not ask, do not infer.

INPUTS:
1. ORIGINAL CONTEXT (the clarified requirement this plan must serve):
{CONTEXT}
2. CURRENT PLAN (artifact under gate review): {PLAN_PATH} — read it in full.
3. Repository access: re-verify any factual claim against reality.

Answer THREE questions, every finding with verbatim citations (plan line +
CONTEXT line or repo evidence):
Q1 GOAL DRIFT — does the plan still deliver exactly what CONTEXT asks?
   Every CONTEXT requirement must have a plan landing point; and the plan
   must promise nothing CONTEXT did not ask for (gold-plating).
Q2 FACT RE-VERIFICATION — do factual claims (files, signatures, versions,
   numbers, command behaviors) still hold? Re-verify ALL claims in
   edited-looking sections; sample >=30% of dated "verified" claims elsewhere;
   exhaustively check for renamed/moved/deleted referenced objects.
Q3 ASSUMPTION CHAIN — for each task, do its stated/implied prerequisites
   still hold in the CURRENT text of earlier tasks? Hunt vanished premises,
   not text contradictions.

Report: PASS, or FINDINGS table (location | question | claim | evidence).
Any FINDING is P2 minimum. Fix nothing. No style comments.
```

## 工序 4 — 成型检查清单（litmus 真实彩排，2026-09-16 新增）

机制与级别语义在 SKILL.md 工序 4；本节只放派遣 prompt 骨架与回收检查。

### 派遣 prompt 骨架（填槽 {PLAN_PATH} {ROUTING_YAML_PATH} {VISIBLE_MAP}）

```
You are a fresh baseline executor with ZERO context beyond what this prompt
gives you. You did not write this plan and know nothing about the project.

PHASE 1 — confusion-hunt (do this FIRST; complete it fully before Phase 2):
Input: ONLY the plan file at {PLAN_PATH}. Read it in full.
For each task, narrate how you would execute it step by step, and report
four kinds of points:
1. what you cannot understand;
2. where you would have to guess;
3. references (files / functions / constants) you cannot locate;
4. missing steps that are "obviously" implied but not written.
Check kernel (verbatim):
- Is every test expectation given down to the exact digit?
- Is every signature/field defined before use?
- Any "obvious" steps left unwritten?
- Any reference to undefined types/functions/constants/files?
Rules: read-only; do NOT execute any write operation; do NOT open any file
other than the plan during Phase 1 — especially NOT {ROUTING_YAML_PATH} or
any skill file; component knowledge would mask your confusion points.
Write your Phase 1 report in full before starting Phase 2.

PHASE 2 — skill-consumption mapping (start only after the Phase 1 report
is fully written):
Inputs (only these three): the plan you already read; the routing table at
{ROUTING_YAML_PATH}; the SKILL.md bodies of the components you intend to
assess (visible:true entries — resolve paths from this name→path map:
{VISIBLE_MAP}; visible:false entries — read the `path` field verbatim).
For EACH task in the plan, answer explicitly: which step/action fits which
component? Base judgments on the real capability intersection between task
text and component description/body — never guess from component names.
If no component fits a task, answer "无" explicitly (silence = you forgot
to judge).
Output TWO tables:
技能消费建议表: | 任务 | 适用步骤 | 建议组件 | 来源(路由表命中/全局清单) | 理由 |
弃用建议(可空): | 任务 | plan 已有候选组件 | 弃用理由 |
Suggestions from the 全局清单 must quote the component's description line
as evidence. For tasks whose 画像 has 领域词: check them against
routing.yaml keywords; a keyword hit you do NOT recommend needs a one-line
why-not.
If {ROUTING_YAML_PATH} does not exist: skip Phase 2 and report exactly one
line: 无路由表，技能映射未执行.
```

（{VISIBLE_MAP} = 编排者预提取的 visible:true 组件「名称 → SKILL.md 路径」
映射，一行一条；彩排 agent 只 Read 不碰 Skill 工具。）

### 回收检查（编排者逐条）

- [ ] Phase 1 报告不含任何组件名 / routing 内容（G8 时序隔离纯度抽查）
- [ ] 建议表覆盖 plan 每个任务（含显式"无"）
- [ ] 全局清单来源的建议逐条附 description 摘录
- [ ] 弃用建议逐条有理由
- [ ] 编排者裁定逐条留痕（采用/调整/弃用 + 理由），SKILL.md 工序 4「回传与回写」三处回写完成
