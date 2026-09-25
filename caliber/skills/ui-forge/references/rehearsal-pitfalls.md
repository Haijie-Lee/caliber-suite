# 彩排雷点与判例回流（rehearsal-pitfalls）

消费方：caliber 阶段 3 彩排（plan-forge 工序 4 Phase 1 confusion-hunt 注入本文件增节）、plan 写作期（雷点 12 条逐条对 plan）、UI 保真判例回流登记（判例回流五步）。本文件不评价设计优劣——设计取舍归用户与设计交付物，这里只写字面执行者逐字执行会踩的机械陷阱。

## 彩排雷点 12 条

每条三段式：「陷阱」（含机制）→「执行者会怎么错」→「plan 该怎么写死」。机制解释引 research 出处（`research-ui-fidelity.md` §一，来源编号见其 §五来源清单）；无业出处条目自述工程机制。

### 雷点 1 — token 取整诱导

**陷阱**：设计稿实测值不在 token 刻度档内（如 22/15/11/30px 类非刻度值），实现按「就近取整」挂档，实现值 ≠ 设计值。机制：DTCG 规定工具不得猜测、规整 token 值 → 刻度表只归档命名不做就近取整，漂移判据 = 实现值 ≠ 设计值（零容差）｜research §一 [S4]〔推断：行业无「刻度规整」成文做法，本条为据 [S4] 语义推出的工程纪律〕。ui-forge 道层② 实证：token 刻度只有 [12,13,14,16,18,24,36,48]，设计实测 9/11/15/22/30px 无档可挂，就近取整致 9 处字号漂移（2026-09-25 同批）。

**执行者会怎么错**：看到刻度档有 16/24，把 15px 写 16px、22px 写 24px；把「规整到刻度」当规范动作，不登记不上报。

**plan 该怎么写死**：样式值只能来自 baseline.json / token 文件 / token-gap-map 三源（visual-baseline-protocol.md §5 铁律）；表内无档的实测值原样进 token-gap-map，禁止就近取整——记 FIDELITY-LOG 一行待清算，按最近档占位并标注（ui-forge §注入节纪律）；每个进 plan 的样式值带三选一出处。

### 雷点 2 — preflight/reset 渗漏行高

**陷阱**：reset 框架（Tailwind preflight 等）给全局设 `line-height: 1.5` 与 `font: inherit`，把全局行高带进 button/input/textarea，控件按自身字号乘全局因子而非设计意图。机制：控件高度合成式 = line-height + padding + border，reset 的 `font: inherit` 把全局 lh 带进控件 → 控件须显式 line-height 再验 height 合成式｜research §一 [S6][S17]。

**执行者会怎么错**：只在 body 声明行高，控件不显式声明；或对按钮只写 height 不写 line-height，指望文字自动垂直居中——实测 height 被合成式撑开，胖瘦漂移 4-5px。

**plan 该怎么写死**：控件类（button/input/textarea）逐类显式 line-height（= normal 或设计值）；验收锚比控件 height 合成式四子项（line-height + padding + border）而非只比 height——定位 4-5px 胖瘦漂移的唯一可靠判法｜research §一 [S6][S17]。

### 雷点 3 — preflight/reset 渗漏字体（button 不继承 body font-family）

**陷阱**：button/input 等表单控件按 UA 默认样式自带系统字体，不随 body 的 font-family 声明继承——实现只在 body 声明字体、控件不显式声明时，控件文字落点 = 系统字体而非设计字体。机制：getComputedStyle('font-family') 只回声明串不回落点，字体缺字形按字符逐个回退到链后位，generic 族无字符覆盖保证｜research §一 [S23][S26]。

**执行者会怎么错**：在 body 写 font-family 后认为全站统一，不检查按钮；或把字体声明写在父级，被控件的 UA 默认 font-family 覆盖。

**plan 该怎么写死**：控件类（button/input/select/textarea）逐类显式 font-family（依赖 reset `font: inherit` 时先验证其在场）；验收经 DevTools Computed→Rendered Fonts 查控件实际生效 face 与设计目标一致，比声明串无意义｜research §一 [S23][S26]。

### 雷点 4 — box-sizing 双源

**陷阱**：设计稿尺寸含 padding（border-box 语义），reset 给全局 `box-sizing: border-box`；实现局部改回 content-box 时，实测宽高 = 内容 + padding + border 双重叠加，与设计几何不符。双源 = reset 全局声明与局部覆盖两个来源冲突。机制：Figma 尺寸含 padding → 对应 border-box；content-box 实现须加 padding+border 后再比｜research §一 [S26]。

**执行者会怎么错**：只读设计稿宽高值不核对实现 box-sizing；或以为全局有 border-box 就全覆盖，忽略组件内 `box-sizing: content-box` 覆盖。

**plan 该怎么写死**：每个被测元素验收锚核对 computed box-sizing；几何比取 border-box 语义（getBoundingClientRect），content-box 实现显式加 padding+border 复核后再比；宽高 = padding + border + content 合成逐项验｜research §一 [S26]。

### 雷点 5 — grid `1fr` 无 `minmax(0,1fr)`

**陷阱**：grid 轨道写 `1fr` ≡ `minmax(auto,1fr)`，下限 = 子项 min-content——表格/图片/长串把轨道撑爆，容器宽超出父级。机制：1fr ≡ minmax(auto,1fr)，下限=子项 min-content，凡设计稿含 1fr 处必查 minmax(0,1fr)，或子项 min-width:0 / overflow 系｜research §一 [S8][S9]。

**执行者会怎么错**：`grid-template-columns` 直接写 `1fr 1fr` 不写 minmax(0,1fr)；验收只用设计稿同款短内容，看不到撑爆。

**plan 该怎么写死**：凡设计稿含 1fr 处逐处写死 minmax(0,1fr)（或子项 min-width:0 / overflow 系）｜research §一 [S8][S9]；验收锚含撑爆压力测试——注入表格/长不可断串后容器宽 ≤ 父容器宽，溢出即 fail｜research §一 [S8]。

### 雷点 6 — 表格 min-content 爆轨

**陷阱**：表格单元格的 min-content（长不可断串、固定宽内容）把行/列轨道撑出设计宽度。机制：撑爆压力测试 = 注入表格/长不可断串后容器宽 ≤ 父容器宽（溢出即 fail）｜research §一 [S8]。

**执行者会怎么错**：表格列宽按设计稿样例文本宽度写死，不注入最长串；或默认 table-layout auto 交给浏览器处理。

**plan 该怎么写死**：验收锚含表格撑爆压力样本（按设计稿最坏内容：长串/表格/图片构造），容器宽 ≤ 父容器宽；列宽约束显式（minmax 或 table-layout: fixed + 显式列宽）｜research §一 [S8]。

### 雷点 7 — UA 控件默认值依赖

**陷阱**：实现依赖浏览器 UA 默认样式（input 自带高度与 padding、select 箭头、button 默认 padding/border、checkbox 尺寸），不显式声明——跨浏览器/跨 OS 漂移，且与设计几何不符。机制：reset（preflight）对 form 元素的重置清单覆盖 UA 默认，覆盖范围随 reset 版本而变，UA 默认不可作契约（工程机制，research 无独立条目）。

**执行者会怎么错**：input 只写宽度不写高度与 padding，靠浏览器默认撑；select 不做 appearance 复位，样式被系统控件盖住。

**plan 该怎么写死**：控件外观属性全部显式声明（appearance、height/min-height、padding、border）；验收锚逐控件比 computed 外观属性，禁以 UA 默认当基线——reset 覆盖清单逐项核对。

### 雷点 8 — 继承链污染

**陷阱**：样式经 DOM 继承链传播（color/line-height/font-size/border 等），声明在错误层级或被子级高优先级规则覆盖，目标元素 computed 值 ≠ 设计值。机制：继承与层叠会覆盖声明值，比声明无意义——fill/text/border 三处都要取 computed｜research §一 [S26]。

**执行者会怎么错**：只比 CSS 声明串（样式表写了就算过），不取 computed；或把设计值声明在 body 层，组件内更高优先级覆盖不自知。

**plan 该怎么写死**：验收锚逐元素取 computed（含继承合成结果）比；对每个视觉属性写死「比 computed 而非声明」；颜色三处（fill/text/border）分别取 computed｜research §一 [S26]。

### 雷点 9 — Unicode 图标回退

**陷阱**：图标用 Unicode 码点（PUA 区/emoji/dingbats）渲染，字体缺字形按字符逐个回退到链后位，落点字体与设计不符、跨 OS 表现不一。机制：字体缺字形按字符逐个回退到链后位；generic 族无字符覆盖保证 → 中文串任一字落点变化即字宽漂移｜research §一 [S23]。

**执行者会怎么错**：把箭头/符号直接打进文本不配字体，以为「系统会有」；或图标字体在回退链中排在 generic 之后被垫底覆盖。

**plan 该怎么写死**：图标码点对应字体显式声明在回退链靠前位；验收经 Rendered Fonts 核验每个图标字符实际落点与字形，缺字形致字宽漂移即报｜research §一 [S23][S26]。

### 雷点 10 — CJK 孤字换行

**陷阱**：CJK 标题末行留孤字（单字独占末行），视觉失衡；正文无防寡行处理时末行寡字。机制：标题末行单字判负；text-wrap: balance（标题；Chromium ≤6 行/Firefox ≤10 行内生效）或 pretty（正文防寡行）｜research §一 [S30][S5]。

**执行者会怎么错**：标题字串直接写死不验证换行点；或按英文空格换行思维对待中文，不查末行单字。

**plan 该怎么写死**：标题/正文显式 text-wrap 策略（balance/pretty）并逐段末行字符数检查（末行单字即 fail）｜research §一 [S30]；验收锚含设计稿真实中文串的换行点比对｜research §一 [S26]。

### 雷点 11 — DPR/缩放

**陷阱**：验收与实现跑在不同 DPR 或浏览器缩放下——双侧 DPR/scale 不一致制造假 diff；实现按 device pixel 而非 CSS px 写值致几何漂移。机制：Chromatic 默认 DPR 2.0、超尺寸回退 1.0；Playwright scale:'css'（1 CSS px）| 'device' → 双侧固定同一 scale｜research §三 [S12][S2]。

**执行者会怎么错**：一侧在缩放 150% 的浏览器取 rect、另一侧在 100% 取，几何对不上；或位图资产按 1x 导出在 2x 屏糊化。

**plan 该怎么写死**：双侧固定同一 scale（CSS px）与同一 DPR｜research §三 [S12][S2]；位图按展示分辨率提供 2x 资产｜research §一 [S26]。

### 雷点 12 — 滚动条占位

**陷阱**：页面/容器溢出出现滚动条，经典滚动条占位（gutter）收窄布局可用宽；overlay 滚动条不占位——同一页面在两种模式下几何不同。机制：scrollbar-gutter/滚动条占位改变可用宽，布局元素实测宽随其漂移（工程机制，research 无独立条目）。

**执行者会怎么错**：验收时页面恰好无滚动条，量取几何通过；内容变长出现滚动条后布局被挤偏；或忽略滚动容器内滚动条对内容的挤压。

**plan 该怎么写死**：验收锚固定滚动状态（显式固定滚动位/固定内容长度后取 rect）；溢出容器显式 scrollbar-gutter 策略（stable 或按设计意图）；几何验收在「有滚动条」与「无滚动条」两态各取一次。

## confusion-hunt 增节

本增节在 plan-forge 工序 4 Phase 1 confusion-hunt 既有四类点位（看不懂的 / 需要猜的 / 引用找不到的 / 步骤缺失的——plan-forge 工序 4 既有枚举）之上注入第 5 类点位与两道 UI 专属彩排；编排者把本增节并入彩排 prompt（checklists.md 工序 4 节指针）。彩排 agent 仍守零背景纪律（只读 + 叙述，不执行写操作）。

### 第 5 类点位「值找不到出处」

彩排 agent 对 plan 中每个样式值追问「出处是什么」——出处三选一：baseline 实测 / token 文件 / token-gap-map（visual-baseline-protocol.md §5 铁律）。样式值无 baseline/token-gap-map 出处 = 取整诱导点，**必须上报而非自决**：彩排 agent 不得替 plan 补值、不得判定「就近取整」、不得标注「应该没问题」。该类点位进 confusion-hunt 报告，编排者回工序 2 补全出处或落 FIDELITY-LOG 待清算——上报是义务，自决即放过取整诱导。

### 基线可执行性彩排

零背景 agent 只拿 baseline.json + plan、不看设计稿，能否逐字重建样式表——重建失败处即点位。判据：彩排 agent 从 plan 文本能推得每个样式值的取值命令（从 baseline 取哪个键、哪个 role/selector）与目标元素定位（implSelector/nth/textContains），推不出即报「步骤缺失的」；取值命令缺失而彩排 agent 只能靠猜 baseline 键名 → 报「需要猜的」。

### 视觉 pre-mortem

彩排末问一句：「两周后用户说看着不舒服，最可能是哪行 plan 被逐字执行导致的？」——答案进 confusion-hunt 报告（按类归入既有四类或第 5 类点位），编排者回工序 2 补防护（验收锚/撑爆压力/显式声明），不请彩排 agent 给设计建议——设计优劣归用户与设计交付物。

## 判例回流五步

判例库机制 = deep-probe 判例库（`caliber/skills/deep-probe/SKILL.md` §判例库，指针化成文，正文不复制）。UI 保真域沿用同五步、同五要素；判例与 probe 判例同库登记，分辨率裁决的合并判据两域通用。

### 触发信号

deep-probe 判例库四类必记：对方纠正且替换了机制、擦边事件（差点犯的错）、押注被证伪、假对齐被戳穿；UI 域加一类：visual-gate/验收判负揭示的机制性根因（非单点实现错误）。失败权重高于成功（不对称写入）。

### 即时登记

高密度轮次当场标记候选（一句话即可），会话收尾前成文；禁止事后凭记忆重建——遗漏集中在最密的轮次。

### 成文五要素

情境 → 错误 → 机制 → 规则 → 失效条件。（五要素逐字，同 deep-probe 判例库。）

### 分辨率裁决

先检索既有判例：情境与机制同构 → 合并；机制不同 → 新条目。库膨胀成复读 = 沉淀失败。

### 压缩复活

超阈值（约 20 条）触发压缩——本文件只持指针一句：压缩落点归 deep-probe 判例库主场（`caliber/skills/deep-probe/SKILL.md` §判例库 法层 / `references/probe-cases.md`），压缩触发时移交；每条带最后验证时间，长期未验证者降权。

### 首批判例：2026-09-25 四根因

出处：AeroFold-ui 仓 `docs/learnings/2026-09-25-ui-fidelity-gap-methodology.md`（跨仓只读）——本文件只引根因与规则，不复制该仓正文。

- ①token 刻度规整漂移：情境 = 刻度表无档的设计实测值；错误 = 就近取整进 token 档；机制 = token 取整诱导（雷点 1）；规则 = 零出处值禁止进 plan，无档实测值进 token-gap-map；失效条件 = 刻度表补档后实测值全入档。
- ②全局 line-height 渗漏控件：情境 = reset 全局行高在场；错误 = 控件未显式 line-height 被全局因子渗漏；机制 = 控件高度合成式 = line-height + padding + border（雷点 2）；规则 = 控件显式 line-height 再验合成式；失效条件 = reset 移除全局 lh 后。
- ③grid 1fr 无 minmax(0,1fr) 被 min-content 撑爆：情境 = 设计稿含 1fr 轨道；错误 = 直接写 1fr；机制 = 1fr ≡ minmax(auto,1fr) 下限 = 子项 min-content（雷点 5）；规则 = 凡 1fr 处写 minmax(0,1fr)；失效条件 = 子项全显式 min-width:0。
- ④侧栏标题硬编码不随视图切换：情境 = 侧栏标题随视图切换文案；错误 = 标题字串硬编码、不绑定视图状态；机制 = 文案-视图状态映射断裂；规则 = 动态文案由视图状态驱动，验收锚含逐视图文案比对；失效条件 = 视图文案恒定。
