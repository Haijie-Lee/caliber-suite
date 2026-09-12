# Plan Forge — 检查清单（按需读取）

仅在进入对应工序时读对应节。这里是对抗审查的**视角细目**；机制（双声部、
共识表、裁定分类、审计追踪）在 plan-review-ritual v2，此处不重复。

## 工序 2 — 制坯检查清单（设计扫描）

初稿完成后逐条过，每条发现必须引用原文；零发现项也要留"查了什么"一句。

### 判断逃逸词扫描
- [ ] 全文搜 `适当|视情况|必要时|类似|照做|合理|尽量|等等|按需|妥善处理`——
      每处命中展开为具体指令（做什么/做到什么程度/怎么算做完）或转显式问题
- [ ] 英文等价物同样命中：appropriate / as needed / similar to / handle properly

### 契约矩阵
- [ ] 每个跨任务函数：签名（参数名/类型/返回）在 Consumes 与 Produces 逐字一致
- [ ] dataclass 新增字段：带默认值且放末尾（否则已有构造 TypeError 或静默错绑）
- [ ] 同一函数/字段/常量在任何两个任务里拼写完全一致（含大小写）
- [ ] 正文引用的每个类型/函数/常量/文件，都能在矩阵或某任务中找到定义点

### 验证内建
- [ ] 每条测试断言的期望值：把输入代入实现心算一遍，与断言一致
- [ ] 每个"运行命令验证"步骤：期望输出具体到可比对（不是"应该成功"）
- [ ] fixture 数据来源标注（真实样本路径 / 抓取日期）
- [ ] **残留/存在性检查正则的反身自伤**（实证：2026-08-13 文档整合——`(doc|plans|reference)/` 模式命中迁移后的合法新路径 `docs/plans/`、`../plans/`、树行 `├── plans/`，4 条验收命令在完美执行下全部误报"残留"）：设计验证时先枚举**合法新内容**的形态（前缀 s、前缀 /、树行、表行、白名单行），用前导字符排除（`[^A-Za-z0-9s/]`）+ 白名单行号显式列出；新写入的文档内容尽量用全名（`docs/plans/` 而非 `plans/`）减少白名单
- [ ] **计数验证命令的尾换行陷阱**（实证：`printf '%s' "$G1" | wc -l` 吞掉尾换行——非零残留显示为 0，假绿）：用 `printf '%s\n'`；"0 行"期望必须能证明是真 0，不是公式吞了输出

### 风险登记
- [ ] 每条风险四要素齐全：触发条件 / 爆炸半径 / 可逆性 / 处置
- [ ] 延期决策带重访触发器（"出现 X 时回来定"）
- [ ] 不可逆操作（删数据、外发、硬件写入、force push）有显式停止点
- [ ] **验证命令的扫描范围是否包含 plan/spec 文件自身**（实证：plan 的替换表"旧字符串"列含旧路径，全局残留 grep 把 plan 文件打成残留；graphify 生成索引、URL 路径段同理）——已知例外清单必须显式列入 plan/spec 文件名，且 grep 按文件名前缀过滤

### 任务画像标注
- [ ] 每任务画像三要素齐全：性质（新增/修bug/重构/配置/文档）、难度
      （机械/集成/判断）、领域词
- [ ] 格式与 `画像: 性质=…; 难度=…; 领域词=[…]` 逐字一致
- [ ] 画像只记性质/难度/领域词，未记 skill 组合决定（组合是执行层决策）

## 工序 3 — 锻打五视角清单（轮 1 注入 plan-review-ritual 的 CHECKLIST；轮 ≥2 stance/prompt 骨架见本节末尾）

通用纪律：只报运行时会炸或执行会卡的问题；引用原文行，引不到的不报；
风格/组织问题不报。

### 视角 1 — 执行者（弱模型逐字执行）
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
- **外部声部/长任务引用的超时语义必须分档且实测**（实证：2026-09-01 backmigration plan 复审轮——ritual Voice B 全量任务单（读 plan + 交叉核对仓库）被固定 `timeout 300` 强杀 RC=124 零输出，转写验尸证明子进程健康（38 工具调用/242s/上下文 119.6K），同日 8 次调用 7 成功、唯一失败即封顶误杀）：凡 plan 步骤引用外部模型审查或长任务，超时按输入规模分档（纯文本 ≤300s；含计划外文件读取 → 后台 + 看门狗 + 停滞判杀），且 RC=124 的处置 = 先验尸转写再降级，禁止看到超时就降级；千行级/开放式读取优先改为摘录进 prompt 或移交主声部，而非仅换后台（与 qwen-cli Prompt 构造第 5 条同口径）
- **MSYS2/Git Bash 的 `sed -i` 默认剥 CRLF**（实证：2026-09-09 fed_console 移植 T4——plan 原样命令 `sed -i 's/Eco Console/Fed Console/g' tools/collect_dist.ps1` 执行后 162 个 `\r` 清零，触发自己的 CRLF 门禁；`sed -b -i`（binary I/O）保 162 个且替换正确）：凡 plan 步骤用 sed 编辑 `*.ps1` 等 CRLF 强制文件，命令必须写 `sed -b -i`，且验证步骤必须含 `file` 或 `\r` 计数断言

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

### 轮次化 stance 与 prompt 骨架（轮 ≥2 由 forge 工序 3 装配注入）

**stance 轮换表**（写死，不许即兴换）：
- 轮 2 声部 A：delta 验尸（主）+ 恶意字面执行者（次）+ 完整性批判；
- 轮 2 声部 B（纯文本）：恶意字面执行者 + 回填漂移猎手；
- 轮 3 声部 A：pre-mortem（"两周后实现失败，写事故报告——哪行 plan 被
  逐字执行导致了失败？"只报风险登记未覆盖的失败模式）+ delta 复验。

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
