---
name: caliber-onboard
description: "Use when wiring the caliber plugin into a user-level/global AGENTS.md after install or upgrade — on-site recon of the existing instruction file, installed plugins and competing routes, then fuses caliber's grading entry as versioned managed blocks (no template-paste, no takeover of existing routes). 中文触发：安装后接入、全局 AGENTS.md 接入、用户级指令配置、caliber 入口配置、首次配置、onboard"
metadata:
  version: "1.0.1"
  source: distilled-from-practice
---

# caliber-onboard — 全局 AGENTS.md 智能融合接入

caliber 的核心特质是**智能融合**：多 skill / plugin 在同一 agent 里协同编排，
路由不抢占、剂量随任务缩放、冲突交用户裁定。本 skill 把这种融合做进用户的
全局指令文件——**不是把固定模板拍进文件，而是现场读懂用户已有的路由与习惯，
把 caliber 安放进协调位置**：该被调用的时候被调用（不喧宾夺主），与既有
路由串联（不抢占管辖权）。

与 init-docs 的分工：init-docs 管**工程级** docs 体系播种（追加自包含块、零
判断）；本 skill 管**用户级**全局指令文件接入（与既有散文规则协商，判断是
核心工作）。

## 何时用 / 不用

- **用**：刚安装或升级 caliber 插件后；用户问「怎么让 agent 用上 caliber」；
  怀疑全局接入过时（托管块版本旧）；用户要求检查/刷新全局入口。
- **不用**：工程级 docs 播种（init-docs 域）；用户明确不要全局规则；纯问答
  会话；非 ZCode 平台的全局文件（`~/.claude/` 系只报告，不动手）。

## 流程

### Step 0 — 环境侦察（零写入）

家目录定位用 `$HOME`（git bash 下 `~` 同效），禁止写死盘符路径。逐项检查：

| # | 检查 | 方法 |
|---|---|---|
| 1 | 主目标 `~/.zcode/AGENTS.md` | 存在性 / `wc -l` / 主语言（通读判定中英）/ 标题结构（`grep -n '^#'`） |
| 2 | 托管标记 | `grep -n 'caliber:global:' ~/.zcode/AGENTS.md`（无文件则记「缺席」） |
| 3 | 遗留散文信号 | `grep -in 'caliber\|定级\|plan-forge\|plan-review-ritual\|工程任务入口' ~/.zcode/AGENTS.md`；判「疑似既有 caliber 内容」需 ≥2 行命中或标题行命中 |
| 4 | 既有路由/流程规则 | 先 `grep -in '入口\|路由\|分诊\|route\|dispatch\|workflow\|一律\|先用\|先走\|必须先\|must first\|always' ~/.zcode/AGENTS.md` 定位候选，再**通读全文**做语义判定——凡「X 类任务先/一律/必须走 Y」形规则句均逐条登记（行号+原文）；grep 只是定位辅助，判定是语义的，漏检责任在通读 |
| 5 | 已装插件盘点 | `ls ~/.zcode/cli/plugins/cache/` 得 marketplace 层，再对各目录 `ls` 得 plugin 层（不进 version 层）；`~/.zcode/cli/config.json` 的 enabledPlugins 仅作辅证（实测可为空对象，以 cache 目录为准） |
| 6 | 其它平台文件 | `~/.claude/CLAUDE.md`、`~/.claude/AGENTS.md` 存在性——只进报告，不动手 |
| 7 | 插件版本 | 读本 skill 目录上两级 `.zcode-plugin/plugin.json` 的 version（插件根 = 本 skill 目录 `../../`），并与 canonical 块标记内版本字面量交叉核对：不一致 = 打包漂移 → 报告中指出；S2/S3 比较一律以 plugin.json 为准（canonical 文本仍逐字使用） |

输出侦察纪要表（逐项一行结论）。文件 >400 行时附一行提示「全局文件宜精瘦」
（只提示，不改写）。

### Step 1 — 场景判定

| 场景 | 判据 | 策略 |
|---|---|---|
| S0 新建 | #1 文件缺席 | 动作=新建；默认档 = core+recommended；免 Step 2 停止点（无覆盖风险），落盘后报告并提示可重跑调档。语言取用户会话语言；无对应 canonical → 停报（铁律 3） |
| S1 插入 | 文件在、#2 #3 均无命中 | 判断插入位置：文件有路由/入口类章节（= 持有任务分流/先后顺序/强制流程规则句的章节）则插该章节之后，否则文末新节；文件含多个 H1 时不得落入尾部索引/备忘类 H1 辖区；插入位置必须在 Step 2 预览中以锚点原文明示；进 Step 2 |
| S2 幂等 | #2 命中且各块版本 = 插件版本 | 校验零改动，报告退出 |
| S3 升级 | #2 命中且块版本 < 插件版本 | 原位换块（位置不动）；进 Step 2（轻预览=块 diff 摘要）。块版本 > 插件版本（用户回退装旧插件）→ 只报告不动手 |
| S4 遗留散文 | #3 命中、#2 无命中 | 不自动动散文：行→块归组按语义（同主题散文节 → 对应块），映射表进 Step 2 预览；Step 2 给三选一——①散文换成托管块（展示将删原文）②保留散文、该块不装 ③暂不处理；逐命中块用户裁定 |
| S5 路由冲突 | #4 检出与本块语义相斥的既有规则（如「所有任务先走 X」） | Step 2 展示冲突点 + 串联提案（谁管域、caliber 管剂量）；用户裁定；永不静默改既有路由 |

一女二嫁（多场景同现，如 S4+S5）→ 按命中场景逐块逐点进同一个 Step 2 预览。

**版本比较规则**（S2/S3 判定用）：标记内版本字面量剥 `v` 前缀后与 plugin.json
version 按点分数值逐段比较。

### Step 2 — 方案预览（落盘前唯一内容停止点；S0 豁免）

完整展示后**停**，等用户裁定：

1. 拟装块清单：块 id + 档位（core / recommended / optional）。
2. 档位询问（一次问清）：`core 仅入口` / `core+recommended（默认）` /
   `全量含 optional`。重跑时已装块多于所选档位 → 超档块默认保留并列入
   报告，移除须用户逐块明示。
3. 渲染后全文：按文件主语言从 `references/global-blocks.<lang>.md` 逐字取块
   （含标记对），标注每块插入位置（引用锚点行原文）。
4. S4/S5 处置提案（命中时）。
5. 用户拒绝某块 → 该块跳过，其余继续；用户全拒 → 报告退出，零改动。

### Step 3 — 落盘

- **备份**：首次写入前 `cp 目标文件` 到系统临时目录，文件名
  `caliber-onboard-<basename>.bak`（路径进报告）；S0 新建无文件可备，跳过。
- **防并行**：写入前重读目标 mtime，与 Step 0 不一致 → 报告并行改动，回
  Step 0 重侦察（不盲覆盖）；S0 新建无 mtime 可读，校验语义 = 确认目标仍
  缺席。
- **最小 diff**：托管块外一字节不动；块文本从 canonical 逐字复制（含标记对，
  不含 markdown 围栏行）；不调整用户既有标题层级/列表记号/空行风格，插入块
  的标题层级随宿主文件惯例；多块落盘时相对顺序 = canonical 文件顺序
  （entry → plan-review → pipeline → subagent）；行尾随宿主——宿主文件为
  CRLF 时块文本转 CRLF 落盘（「逐字」指内容，行尾字节随宿主）。
- **S3 换块**：旧块标记对内全文替换为新块，块在文件中的位置不动；顺带安装
  的缺失块插于既有托管块聚簇紧邻之后。
- **S0 新建**：首行 `# AGENTS.md`，空一行，接入选档各块（块间空一行）。

### Step 4 — 自检与报告

1. 标记配平：`grep -c '<!-- caliber:global:'` 与 `grep -c '<!-- /caliber:global:'`
   相等，且块 id 集合 = 本次落盘集合。
2. diff 复核：`diff -u 备份 目标`（diff 有差异时 exit 1 属预期，**不进 `&&`
   链**）——hunk 应全部位于新增/替换的托管块；出现托管块外 hunk = 事故，
   从备份恢复并报告。S0 新建无备份，本项跳过。
3. 报告：装了哪些块/位置、跳过清单、S4/S5 处置结果、#5 检测到的已安装
   plugin 清单、#6 其它平台文件提示。
4. 生效指引（逐字大意）：全局指令文件在会话启动时加载，**下个新会话生效**；
   插件升级后重跑本 skill 可校验或原位升级托管块。
5. 链接一句：工程级 docs 体系播种用 `caliber:init-docs`。

## 铁律

1. **不覆盖**：托管块外既有内容只有「保留」一种命运；S4 散文处置必须用户
   当面裁定（换块 / 保留 / 暂不处理）。
2. **判断类产出必过预览**：Step 2 是落盘前唯一内容停止点（S0 全新建豁
   免——无覆盖风险，用默认档，落盘后报告并提示可重跑调档）。
3. **canonical 唯一源**：块文本只取自 `references/global-blocks.<lang>.md`；
   无对应语言 canonical → 停，报告缺语言支持，不即兴翻译、不改写。
4. **幂等**：重跑 = 校验 + 零改动报告（S2）或原位升级旧版块（S3）；零改动
   是合法结果不是失败。
5. **融合不抢占**：既有路由规则的管辖权不被本 skill 改写；冲突只报告 +
   提案，裁定权在用户。
