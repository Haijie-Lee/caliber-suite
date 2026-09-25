# 视觉基线协议（visual-baseline-protocol）

消费方：选材者（生产 baseline.json 与 token 差集映射表，二者进选材产物）、extract-baseline.mjs（§3 为 `--elements` 缺省值的数据源）、visual-gate 与 visual-reviewer（消费 baseline）。本文件是 ui-forge 视觉基线生产的协议主件，契约定义见 plan 契约矩阵 C2/C4。

## 1. baseline.json schema（C2 逐字）

顶层键（逐字）：`meta`、`elements`、`exemptions`。

| 顶层键 | 子键 | 语义 |
|---|---|---|
| `meta` | `sourceUrl`,`viewport`,`extractedAt`,`extractorVersion` | 基线来源 URL、视口、提取时间、提取器版本 |
| `elements` | 项键 `selector`,`role`,`props`,`_rect`（`_rect` 子键 `width`,`height`） | 锚点元素提取结果 |
| `exemptions` | 项键 `selector`,`props?`,`reason`,`source`,`registeredAt` | 豁免登记（匹配规则见 visual-gate-protocol）；`source` 字段证据规约见 visual-gate-protocol §5（两类锚齐备） |

`props` 属性集（14 个，逐字）：`fontFamily,fontSize,fontWeight,lineHeight,letterSpacing,color,background,padding,marginBottom,border,borderRadius,height,minHeight,gap`。

`--elements` 文件项键（逐字）：`role`,`selector`,`implSelector?`,`nth?`,`textContains?`,`implTextContains?`,`group?`——gate 的 impl 侧定位用 `implSelector`，缺省 = `selector`；`nth` = querySelectorAll 序号，双侧同值分别应用；`textContains` = design 侧叶子元素文本过滤，`implTextContains` = impl 侧覆盖过滤词，缺省 = `textContains`；`group` = 栏比例分组，同组 ≥2 元素参与比值判定。；提取产出项另带 `_visible` 布尔键（原生可见性，谓词与三态处置见 visual-gate-protocol §7；旧基线无键 = true）；role 在同一文件内唯一（gate 配对键域），重复 role 致 gate 退 2；多条目同 selector 须以不同 nth 区分（同 selector 同 nth = 重复测量，extract 与 gate 均 stderr 告警）

### 示例：keycode 元素（值 = C8#1 实测）

示例仅给一个真实值：keycode 元素的 fontSize = 30px（2026-09-25 双侧 getComputedStyle 实测，plan 金样预期 diff 清单 C8#1）；其余属性位以 `<提取值>` 占位——本文件不为示例发明样式值（见 §5 铁律）。

```json
{
  "meta": {
    "sourceUrl": "http://localhost:8931/hifi.html",
    "viewport": "1200x860",
    "extractedAt": "2026-09-25T00:00:00.000Z",
    "extractorVersion": "0.1.0"
  },
  "elements": [
    {
      "selector": ".keycode",
      "role": "keycode",
      "props": {
        "fontFamily": "<提取值>",
        "fontSize": "30px",
        "fontWeight": "<提取值>",
        "lineHeight": "<提取值>",
        "letterSpacing": "<提取值>",
        "color": "<提取值>",
        "background": "<提取值>",
        "padding": "<提取值>",
        "marginBottom": "<提取值>",
        "border": "<提取值>",
        "borderRadius": "<提取值>",
        "height": "<提取值>",
        "minHeight": "<提取值>",
        "gap": "<提取值>"
      },
      "_rect": {
        "width": "<提取值>",
        "height": "<提取值>"
      }
    }
  ],
  "exemptions": []
}
```

## 2. 提取程序四步

### 2.1 起服

设计稿目录起静态服：`python -m http.server <port>`（或复用既有静态服）。例：AeroFold-ui hifi 稿根目录 = `docs/designs/web-ui/`，端口 8931（plan 前提③，金样设计-url = `http://localhost:8931/hifi.html`）。

### 2.2 跑 C4 命令

`node extract-baseline.mjs --url <url> --out <path> --viewport <WxH> [--elements <json-file>] [--prepare <js-file>]`

C4 契约全文见 plan 契约矩阵 C4；`--elements` 缺省 = 内置锚点元素最小集（§3），传入时与内置集合并覆盖。

`--prepare` = 提取前对页面 `page.evaluate` 该 JS 文件（设计稿切屏预备，2026-09-25 起）；逐屏基线工作流 = 每屏一次 `--prepare` 提取 + 一次 gate 对拍（实战模式见 visual-gate-protocol §7 末段）。

### 2.3 人审基线 JSON

人审 = agent 对设计稿截图目视抽查 ≥3 个元素的 fontSize/height 与 JSON 值一致——机械动作，非停止点。

### 2.4 token 差集审计

计算设计实际值集 − token 刻度集，差集两路处置：

* 回写 token 补档：差集值在 ≥2 个元素复用时（单次孤值不具备归档语义，留映射表），回写设计交付物 token 文件；
* 生成逐元素映射表 `token-gap-map.md`：逐元素登记 selector / 属性 / 设计实测值。

**禁止就近取整**——C9②（逐字原则见 `../SKILL.md` 道层三原则 ②，本文不复制；刻度表无档的实测值原样进映射表，不做规整）。

token 刻度集出处 = 设计交付物内 `design-tokens.(css|json)` 或项目主题层文件（如 AeroFold-ui hifi.html `:root` 的 `--fs-*` 块）；两者皆无 → 刻度集为空、全部实测值进 token-gap-map。

## 3. 锚点元素最小集（`--elements` 缺省值）

16 role 枚举（与 hifi class 同名优先；本枚举区用 `- ` 行首形态，他节 bullet 用 `*` 或表格，保证计数断言不误计）：

- wordmark
- end-tab
- side-item
- side-cap
- page-title
- page-desc
- card-title
- card-desc
- btn-primary
- btn-sm
- input
- table-th
- table-td
- alert-title
- tag
- badge

每屏特有视觉锚点（如 keycode / dropzone-big / ring-small）由选材者按设计稿经 `--elements` 追加，不落入内置最小集。

role → 默认 selector 映射表（逐字；T7 extract-baseline.mjs 内置表的数据源；设计稿 class 不同名时由 `--elements` 覆盖）：

| role | 默认 selector |
|---|---|
| wordmark | `.wordmark, .brand` |
| end-tab | `.end-tab.on, .end-tab` |
| side-item | `.side-item.on, .side-item` |
| side-cap | `.side-item .cap` |
| page-title | `.page-title, h1` |
| page-desc | `.page-desc` |
| card-title | `.card .ct, .card-title` |
| card-desc | `.card .cd, .card-desc` |
| btn-primary | `.btn.primary` |
| btn-sm | `.btn.sm` |
| input | `input` |
| table-th | `.tbl th, table th` |
| table-td | `.tbl td, table td` |
| alert-title | `.alert .at, .alert-title` |
| tag | `.tag` |
| badge | `.badge` |

屏特有锚点示例（hifi class 同名优先；selector 取自 plan C8 实测与 T12 设计侧表）：

| 屏特有 role | 示例 selector |
|---|---|
| keycode | `.keycode` |
| dropzone-big | `.dropzone .big` |
| ring-small | `.ring .rt small` |

## 4. 设计解剖三清单

选材期对设计稿解剖登记三份清单，随选材产物进 plan。

### 组件清单

* 枚举设计稿中的组件（按钮 / 输入框 / 表格 / 卡片 / 提示条 / 标签 / 徽标等），逐件登记；与锚点最小集 role 命中者直接用内置 role，屏特有组件经 `--elements` 新增 role。

### 状态清单

* 状态枚举（逐字）：hover / focus / active / disabled / loading / empty / error。
* 登记每个组件在设计稿中的状态覆盖情况（哪些状态有样式、哪些无），供后续工序引用。

### 动效清单

* v1 仅登记不验收：登记设计稿中出现的动效与状态切换，不做判定。
* 动效的验收形态挂起条款见 `references/interaction-motion-checklist.md`（重审触发器 = 首个含明确动效需求的 UI 任务出现）。

## 5. 铁律：零出处的样式值禁止进 plan

每个值溯源三选一：baseline 实测 / token 文件 / token-gap-map——三者之外禁止发明。

行业佐证：W3C DTCG Design Tokens Format Module（2025.10 Draft CGR）明文禁止工具猜测/规整 token 值——刻度表「就近取整」无行业依据、属反模式，出处 research-ui-fidelity.md §一 [S4]。
