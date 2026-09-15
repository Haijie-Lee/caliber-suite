---
name: init-docs
description: "Use when bootstrapping a project into the caliber docs-governance system — creates the seed files (CONTEXT.md, docs/README.md constitution, docs/learnings/INDEX.md, AGENTS.md doc-map block) that activate the plugin hooks by data-declaration subscription. 中文触发：初始化文档体系、新工程 docs 引导、建立治理宪法、播种文档体系、订阅 hooks"
metadata:
  version: "1.2.0"
  source: distilled-from-practice
---

# init-docs — 新工程 docs 体系播种

把「工程该有哪些文档纪律」从口头约定变成文件事实：建立四件种子文件。
caliber 插件的四个 hook 以**文件存在性**为订阅开关（数据声明订阅）——
文件在，纪律自动生效；文件不在，全程零打扰。本 skill 只做播种与补缺；
体系靠 docs/README.md §9 的四层路由在后续会话中自然生长。

## 何时用 / 不用

- **用**：工程缺 `CONTEXT.md` 或 `docs/learnings/INDEX.md`（未订阅或部分
  订阅），且工程主愿意建立 docs 治理体系。
- **不用**：四件已齐（重跑 = 幂等零动作）；工程主明确不要治理体系；
  一次性脚本或抛弃型工程。

## 流程

### Step 1 — 探测（零写入）

以当前工程根为基准，逐文件检查：

| # | 检查 | 方法 |
|---|---|---|
| 1 | `CONTEXT.md` 存在？ | 文件存在性 |
| 2 | `docs/learnings/INDEX.md` 存在？ | 文件存在性 |
| 3 | `docs/README.md` 存在？存在则含 §9 锚点？ | 存在性 + `grep -E '^## 9' docs/README.md` |
| 4 | `AGENTS.md` 存在？存在则含 docs-map 块？ | 存在性 + `grep -F 'caliber:docs-map' AGENTS.md` |
| 5 | `docs/learnings/` 有 .md 但 INDEX.md 缺失？ | 计数（INDEX.md 自身不计） |

输出 gap 表（状态枚举：缺失 / 存在-跳过 / 存在但缺锚点-仅报告）：

| 文件 | 状态 | 动作 |
|---|---|---|
| CONTEXT.md | <状态> | 新建（模板）/ 跳过 |
| docs/learnings/INDEX.md | <状态> | 新建（模板）/ 跳过 |
| docs/README.md | <状态> | 新建（模板）/ 跳过 / 仅报告（缺 §9 锚点） |
| AGENTS.md | <状态> | 新建 / 预览后追加 / 跳过 |

### Step 2 — 决策点（落盘前唯一停止点）

- **四件已齐** → 报告「已订阅，零动作」并退出。
- **AGENTS.md 存在且无 docs-map 块** → 完整展示渲染后的追加块（占位符
  已替换），**停**，等用户确认；用户拒绝 → 该文件动作改「跳过」，其余继续。
- **AGENTS.md 不存在** → 动作 = 新建，不停止（无覆盖风险）。
- 其余三件套缺失 → 直接新建，不停止。

### Step 3 — 落盘

顺序固定：① `docs/learnings/INDEX.md` → ② `docs/README.md` →
③ `CONTEXT.md` → ④ `AGENTS.md`。

每个文件：读 `templates/<对应模板>` → 替换 `{{PROJECT_NAME}}` 为工程根
目录名、`{{DATE}}` 为今天（YYYY-MM-DD）→ Write。目录不存在先建
（`docs/learnings/` 可能两层都缺）。

AGENTS.md 两种形态：
- **新建**：首行 `# AGENTS.md — <工程名>`，空一行，接渲染后的
  agents-docmap 全文。
- **追加**：文件末尾空一行，接渲染后的 agents-docmap 全文（自带标记对
  包裹）；既有任何一行不得改动。

### Step 4 — 边界情形（只报告，不动手）

- `docs/README.md` 存在但缺 §9 锚点，逐字报告：
  「Stop hook 收尾文案引用『docs/README.md §9 四层路由』，该文件缺 §9 节，
  指针将悬空。建议：参照 docs/README.md 模板手动补 §9，或将现有文件改名
  迁走后重跑本 skill。」
- `docs/learnings/` 有 N 份 .md 且 INDEX.md 本次新建，逐字报告：
  「已有 N 份 learning 未登记 INDEX.md。补登需逐份判断『何时需要』，属
  判断类工作，本 skill 不代劳——可由 caliber:update-docs 接续完成（见
  Step 7）。」
- `CONTEXT.md` 已存在 → 跳过；SessionStart 注入对它早已生效，内容归
  工程主。

### Step 5 — 冒烟指引（逐字输出）

落盘完成后向用户输出：

1. **本会话立即可验**：调用一次 `caliber`（任意工程任务入口）——上下文
   应出现 docs/learnings/INDEX.md 注入（PreToolUse hook，文件已存在即
   生效）。
2. **compact 或下个新会话验证**：CONTEXT.md 全文注入（SessionStart
   hook，matcher 为 startup|compact）。
3. **Stop hook 不触发属预期**：本次落盘的 Write 已将会话标记为「已写
   learnings」，收尾提醒正确静默——这不是故障。

### Step 6 — 生长指引（一句话）

体系不需要预制更多：docs/README.md §9 的四层路由会在每次会话收尾
（caliber Stop hook 机械提醒）逼着知识归口；新类别目录随第一份对应知识
出现而建立，扩容流程见宪法 §7。

### Step 7 — update-docs 链接询问（条件触发，逐字）

落盘与报告完成后，下列条件命中任一 → 向用户逐字输出询问：

- 本次新建了 `docs/learnings/INDEX.md` 且 docs/learnings/ 有未登记 .md
  （Step 4 第二条已触发）；
- 本次新建了 `CONTEXT.md` 且工程已有代码或文档（README* / docs/ 下已有
  内容 / 清单元件任一存在）。

询问文案（逐字）：
「检测到可回填内容。caliber:update-docs 可把已有 learnings 登记进
INDEX.md，并扫描仓库已有文档与清单提炼 CONTEXT.md——是否现在接续调用？」

两条件均不命中（真空工程）→ 不询问，零打扰。用户答「是」→ 立即调用
caliber:update-docs skill。

## 铁律

1. **不覆盖**：已有文件只有「跳过」与「预览确认后追加」两种命运；重写、
   合并、改写一律禁止。
2. **占位符**仅 `{{PROJECT_NAME}}` 与 `{{DATE}}`；落盘后工程文件全文
   不得残留 `{{`（落盘后自检一次）。
3. **文件落盘决策点唯一**（Step 2 的 AGENTS.md 追加确认）；Step 7 的 update-docs 链接询问属收尾引导，不产生文件动作；其余分支自动推进。
4. **报告文案逐字**用本 skill 给定的文本，不即兴改写——它们会被工程主
   原样转发或存档。
