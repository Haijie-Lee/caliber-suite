---
name: update-docs
description: "Use when backfilling or synchronizing an already-initialized caliber docs-governance system — indexes existing docs/learnings/*.md into INDEX.md (日期|文件|何时需要) and generates or updates CONTEXT.md by scanning the repo's existing README, docs and manifests. 中文触发：回填 learnings 索引、补登 INDEX、更新 CONTEXT.md、文档体系同步、扫描仓库生成 CONTEXT"
metadata:
  version: "1.0.0"
  source: distilled-from-practice
---

# update-docs — docs 体系回填与同步

init-docs 播种的是空白骨架；本 skill 把工程**已有的**知识接进体系：
docs/learnings/ 里已存在的 .md 回填进 INDEX.md（日期|文件|何时需要），
仓库已有的 README/docs/工程清单提炼进 CONTEXT.md（角色/术语/铁律三节）。
分工：init-docs 管「种子文件在不在」，本 skill 管「种子文件与工程现状
同不同步」。

## 何时用 / 不用

- **用**：体系已播种（`CONTEXT.md` 或 `docs/learnings/INDEX.md` 至少其一
  存在），且 INDEX.md 与 learnings/ 有漂移，或 CONTEXT.md 空白/滞后于
  仓库现状；或从 init-docs Step 7 链接而来。
- **不用**：体系未播种（双缺 → Step 0 引导 init-docs）；要改
  docs/README.md 宪法或 AGENTS.md（只报告，属人工/init-docs 域）；要
  新写 learning（属会话收尾 §9 路由）。

## 流程

### Step 0 — 体系订阅检查（零写入，前置闸门）

- `CONTEXT.md` 与 `docs/learnings/INDEX.md` **双缺** → 停，逐字询问：
  「本工程尚未建立 docs 治理体系（CONTEXT.md 与 docs/learnings/INDEX.md
  双缺）。update-docs 服务于已播种的体系——是否先调用 caliber:init-docs
  播种？（是 = 播种后接续本 skill；否 = 退出，不做任何改动）」
  - 答「是」→ 调用 caliber:init-docs（其 Step 7 会链回本 skill）。
  - 答「否」→ 逐字报告「已退出，未做任何改动。需要时请先运行
    caliber:init-docs。」并结束。
- 任一存在（含部分订阅）→ 继续 Step 1，报告标注订阅缺口。

### Step 1 — 探测（零写入）

以工程根为基准逐项检查并输出状态表：

| # | 检查 | 方法 |
|---|---|---|
| 1 | learnings 清单 | 递归 `docs/learnings/**/*.md`（INDEX.md 自身不计），记 相对路径 / 日期前缀有无 / frontmatter 有无 |
| 2 | INDEX.md 状态 | 缺失 / 标准（含 `\| 日期 \| 文件 \| 何时需要 \|` 表头）/ 非标准；标准则解析既有行的文件名集合 |
| 3 | CONTEXT.md 状态 | 缺失 / 空白模板（含 `示例：` 行）/ 人工维护 / 超预算（`wc -l` >120，报告并跳过 CONTEXT 侧全部动作） |
| 4 | 扫描源清单 | README*、docs/ 下一层 .md、清单元件（package.json / pyproject.toml / Cargo.toml / go.mod / sdkconfig / CMakeLists.txt / docker-compose*.y*ml，存在哪个记哪个） |
| 5 | docs/README.md §9 锚点 | `grep -E '^## 9' docs/README.md`；缺则仅报告，不修 |

### Step 2 — 蒸馏（判断类核心工作）

**INDEX 侧**（逐份处理；≤20 份主线程，>20 分批 dispatch 只读 agent、
批 ≤15 份，统一返回 `相对路径<TAB>日期<TAB>何时需要`）：

- 读头 ≤40 行，信息源优先级：frontmatter description > H1+首段 > 节标题；
  蒸馏「何时需要」一行（≤30 字，写「何时需要它」而非「它是什么」）。
- 无法蒸馏（空文件/纯 dump）→ 列填「（待人工补充）」并在报告点名。
- 日期列：文件名 `YYYY-MM-DD` 前缀优先；无前缀取文件 mtime。
- 文件列：相对 `docs/learnings/` 的路径（子目录含一层分隔符）。

**CONTEXT 侧**（缺失 / 空白模板 / 人工维护三态做；超预算态不做）：

- 术语候选分级：一级 README/docs（高置信，权威文档列带相对路径）>
  二级清单元件 name/description/service 名（中置信）> 三级代码符号
  （仅一二级全缺时 ≤5 条，预览显著标注「低置信」）。
- 角色表：仅有「系统内固定角色/设备/服务」实证（docker-compose
  services / 配置角色等）才填；无实证 → 渲染时整节删除（模板自带规则）。
- 铁律节：**不写入任何条目**。从 docs grep `必须|禁止|永不|must|never`
  候选句 ≤8 条列进报告，工程主裁定后手工补。
- 每条术语一行；渲染后全文 ≤120 行为硬上限，超出砍低置信条目。

### Step 3 — 预览（唯一停止点）

完整展示后**停**，等用户批准：

1. INDEX 变动表：新建/追加行逐条（日期|文件|何时需要）；悬空行
   （INDEX 有行、磁盘无此文件）单列「建议删除」。
2. CONTEXT 渲染块：新建 = 全文；填充/追加 = 改动节全文，新增行首标 `+`。
3. 铁律候选清单（不进文件，仅供工程主参考）。
4. 存在既有内容处置事项（人工维护 CONTEXT 可追加 / 有悬空行）时，同
   停止点逐字询问：「本次对既有内容的处置力度：保守 = 只追加新行，
   既有行与悬空行一律不动；积极 = 按预览直接增删改。选哪种？
   （默认保守）」
5. 用户拒绝某文件 → 该文件动作改「跳过」，其余继续。

### Step 4 — 落盘

顺序固定：① INDEX.md → ② CONTEXT.md。落盘前重读目标 mtime，与
Step 1 不一致 → 报告并行改动，回 Step 1 重探测（不盲覆盖）。

- INDEX 新建：渲染邻居模板 `../init-docs/templates/learnings-INDEX.md`
  （占位符照常替换，建立行落款改 `by caliber:update-docs`），全量行按
  日期升序。
- INDEX 追加：既有行逐字保留；新行按日期升序接尾；仅批准删除的悬空
  行才移除。
- CONTEXT 新建/空白模板：渲染 `../init-docs/templates/CONTEXT.md`
  （替换 `{{PROJECT_NAME}}`/`{{DATE}}`，建立行落款改
  `by caliber:update-docs`），示例行替换为蒸馏条目；无角色实证删
  §1 整节。
- CONTEXT 人工维护：新行插对应表尾；目标节不存在时以模板格式补建
  该节（无角色实证的 §1 除外，不建）；既有行一字不动。
- 模板文件缺失 = 打包残缺 → 报告并跳过该文件动作（不手写骨架）。
- 目录不存在先建。

### Step 5 — 自检与报告

逐条执行并输出结果：

1. 每份 learning 的 basename 在 INDEX.md 可 `grep -F` 命中（与
   index-registry-check hook 同一登记判据），零漏登。
2. 落盘文件全文无 `{{` 残留。
3. CONTEXT.md `wc -l` ≤120。
4. 落盘内容做 secrets 红线扫描（token/密钥/密码形态），零命中。
5. 确切计数报告：INDEX 新建/追加 N 行、删除 M 行、CONTEXT 新增 K 条、
   跳过清单、「（待人工补充）」点名清单、铁律候选清单。

## 铁律

1. **不覆盖**：既有行只有「保留」与「预览批准后才动」两种命运；重写、
   静默合并、格式转换一律禁止。处置力度（保守/积极）只在 Step 3 由
   用户当次裁定，不记忆不继承。
2. **判断类产出必过预览**：蒸馏与 CONTEXT 条目是判断类工作，未预览
   批准不落盘（Step 3 唯一停止点）。
3. **铁律节永不自动写**：候选句只进报告——写进文件 = 每会话注入放大，
   裁定权在工程主。
4. **不越权**：docs/README.md 宪法、AGENTS.md、learnings 文件本体
   一律只读；体系未播种不代 init-docs 播种（Step 0 退出语义）。
5. **幂等**：重跑 = 校验 + 零改动报告，零产出是合法结果不是失败。
