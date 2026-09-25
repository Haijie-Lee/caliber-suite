# 视觉对拍门协议（visual-gate-protocol）

消费方：visual-gate.mjs（对拍判定，产出报告）、visual-reviewer（消费报告做残余维度审查）。本文件是 ui-forge 视觉对拍门（gate）的判定阈值与报告协议主件，契约定义见 plan 契约矩阵 C3/C9。

## 1. CLI 契约（C3 逐字）与运行纪律

`node visual-gate.mjs --design-url <url> --impl-url <url> --baseline <path> --elements <json-file> --viewport <WxH> --out <path> [--prepare <js-file>] [--prepare-design <js-file>]`；`--prepare` = 提取前对 impl 页面 `page.evaluate` 该 JS 文件（SPA 切屏等预备动作），缺省无；`--prepare-design` = 截 shot-design 前对 design 页面同法预备（2026-09-25 起，金样 deferred ①），缺省无；退出码：0=无未豁免 diff，1=有未豁免 diff，2=运行错误；`--out` 缺省 `fidelity-report.md`

### 双引擎纪律

对拍统一用 Chromium 打开实现 URL，不用 Tauri WebView2 窗口——computed style 双引擎一致，字体光栅化差异不进 diff，2026-09-25 实测环境注记。

### 基线取向（写死）

**设计保真以设计稿为基线**（视觉回归工具以旧实现为基线会吃掉错误实现；属性级提取对比报「哪个属性、期望 vs 实际」，像素 diff 只报「哪里变」且对渲染异常过敏——两者互补，本门取属性级为主、截图为辅，出处 research-ui-fidelity.md §三）。

## 2. 阈值表（逐字，每属性一行表格行）

| 属性 | 判定 |
|---|---|
| fontSize | 零容差 |
| fontWeight | 零容差 |
| lineHeight | 零容差 |
| letterSpacing | 零容差 |
| color | 零容差 |
| background | 零容差 |
| border | 零容差 |
| borderRadius | 零容差 |
| height | ±1px |
| minHeight | ±1px |
| padding | ±1px |
| gap | ±1px |
| marginBottom | ±1px |
| fontFamily | 逐字等值 |
| 栏比例（同容器子元素宽度比） | ±2% |

他处引用本表档位一律用「阈值表」指针。

注（2026-09-25 实战 F-a）：border 判定前先作零宽归一——双侧 computed 串首个 px 分量
（宽度）均为 0 即视为等值，不再逐字比对（preflight `*{border:0 solid}` 得 `0px solid …`
vs UA 初始 `0px none …`，视觉零差异；AeroFold 首轮 65 条 diff 中 30+ 条属此族）。
归一只改判定、不改阈值档位。

### 行业佐证注

属性级零偏差比 computed px 值为设计保真主流判法（4px 级偏差肉眼不可见、几乎必是实现错误）；像素 diff 阈值惯例（Playwright 0.2 YIQ / pixelmatch 0.1 OKLab / BackstopJS 0.1% / Chromatic .063）仅适用截图辅助通道，出处 research-ui-fidelity.md §三。

## 3. prop → 族映射表（逐字；报告分组的数据源）

| prop | 族 |
|---|---|
| fontFamily / fontSize / fontWeight / lineHeight / letterSpacing | 排版族 |
| padding / marginBottom / gap | 空间族 |
| color / background | 色彩族 |
| height / minHeight / border / borderRadius | 控件族 |
| _rect 栏比例 | 布局族 |

文案族/图标媒体族 = 人工检查项（不进机器 diff 报告，由 visual-reviewer 残余维度形态覆盖）。

## 4. 报告 schema（按族分组）

按族分组（排版/空间/色彩/控件/布局五机器族），每条一行：

| selector | prop | baseline | actual | exempted |
|---|---|---|---|---|
| <元素 selector> | <属性名> | <设计稿实测值> | <实现侧实测值> | <是/否> |

末尾汇总行（总 diff 数/豁免数/未豁免数/跳过数）。

报告另含两节（2026-09-25 起）：`## 跳过清单`（skipped 态条目，列 = role/selector/原因，
skipped>0 才出，见 §7）；`## 豁免登记建议`（未豁免 diff 逐条给可直接粘贴进
baseline.exemptions 的 JSON 行，格式 `{"selector":"…","props":["…"],"reason":"","source":""}`，
按 selector+prop 去重——栏比例行的 selector 即组合串 `selA[nthA] ~ selB[nthB]`，nth 缺省
注 [0]，逐字可登记，实战 F-g）。两节在噪音模式主报告省略、全文附件保留。汇总行格式
逐字 = `总 diff <T> / 豁免 <E> / 未豁免 <U> / 跳过 <S>`。

top-5 排序写死：数值属性按差幅降序，其余按生成序。

## 5. 豁免机制

两段式匹配（写死，与 plan Review Focus#2 同句）：「selector 精确匹配（**design 侧 C2 selector 为唯一命名域**，报告条目与豁免登记同域，implSelector 仅定位用）AND（豁免项带 props 时）diff.prop ∈ 豁免.props；豁免项不带 props = 该 selector 全部 diff 豁免」

每条豁免必须有 `reason` 与 `source`（裁定文档/实测记录）；豁免项在收尾时逐条清算或转挂起（C9③）。

行业判例：Chromatic 被豁免元素的**尺寸变化仍报**（豁免只遮渲染差异不遮几何漂移）——豁免粒度宁窄勿宽；各工具豁免命名盘点（Percy Ignore Regions / Chromatic ignoreSelectors / BackstopJS hide·removeSelectors / Playwright mask·clip / Applitools Ignore+Floating regions）见 research-ui-fidelity.md §三。

栏比例 diff 的 selector 列 = 组合串 `<selA>[<nthA>] ~ <selB>[<nthB>]`（配对键域 = role，
nth 缺省注 [0]；2026-09-25 R9-F1 起）——栏比例豁免登记的 selector 以报告行逐字为准
（含 [0] 注记），手工改写易错，用 §4 豁免登记建议节的原样行（实战 F-g/T8-F3 文档
精确化）。

豁免 `source` 字段证据规约（2026-09-25 终审裁定，金样 deferred ③）：两类锚齐备——
①裁定出处（裁定文档/会话/裁定门指针）；②机器证据锚（fidelity-report 文件名、
shot-design/shot-impl 截图名、或实测记录文件路径，至少其一）。缺 ② 的豁免
visual-reviewer 席位可不予背书（金样实证：tbl td 豁免机械两段式全绿，因设计侧视觉锚
缺席未获背书）。

## 6. 噪音纪律

未豁免 diff > 50 条时报告只出汇总 + 按族 top-5，全文落附件（防噪音淹没——同源教训 = AeroFold-ui 仓 `docs/learnings/2026-09-24-relay-integration-false-greens.md` U-M2-02 集成假绿复盘：单轮 PASS 无证据力，跨仓只读引用）。

## 7. 可见性与 skipped 态（2026-09-25 起，金样 deferred ②⑥ + 实战 L13/L15 裁定）

提取侧为每个元素记录 `_visible`（原生可见性，揭示前判定）：谓词 =
`node.getClientRects().length > 0 && computed display !== 'none' && visibility !== 'hidden'`；
旧基线无 `_visible` 键 = 视为 true（legacy 兼容语义）。

gate 配对后按双侧 `_visible` 三态处置：

| 情形 | 处置 |
|---|---|
| 双侧均不可见 | skipped：不进 diff、不计退出码；stderr 逐条 + 报告 `## 跳过清单` 节登记（元素属未 prepare 屏——按屏拆分 elements 为推荐工作流） |
| baseline 侧不可见、impl 可见 | skipped + 告警（基线屏态未覆盖；无 ground truth 不造值——用 extract-baseline `--prepare` 按屏提取基线） |
| baseline 可见、impl 不可见 | 计「元素不可见」diff 一条（控件族，未豁免 → 退出码 1）——若元素属于当前屏 = 实现缺陷；若属于其他屏 = elements 清单/prepare 序列未对齐（stderr 提示含两分支） |

可见性谓词管「隐藏态垃圾测量」，管不到「双侧均可见但配错元素」（跨屏同 class
误配，golden 轮 A recv-card 噪音即此族）——后者属 elements 作者屏态对齐责任，
推荐工作流 = 每屏一份 elements 文件 + 逐屏对拍（AeroFold 实战模式：9 视图 9 份
elements 逐屏基线，见其 `.campaign/evidence/ui/gate/` 与 methodology §四-5③，
跨仓只读引用）。view 作为一等概念（名/prepare 序列/可选 anchor/元素组）归 v2
演进，本版不落 schema。
