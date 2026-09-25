# 保真检查清单（fidelity-checklist）

消费方：fidelity 验收与 visual-reviewer 对拍判定。每条一行「查什么 + 怎么判」；「怎么判」出处 = baseline 键名（`props.*` 14 属性集 / `_rect`）或 T6 阈值表档位（零容差 / ±1px / 逐字等值 / 栏比例 ±2%）。

## 排版族

- **字族回退链 CJK 落点**：读 baseline `props.fontFamily` 与实现 computed 声明串，再查 DevTools Computed→Rendered Fonts 实际生效 face；CJK 目标字体须在回退链中靠前位（generic 只能垫底），实际渲染落点命中设计目标即过，缺字形致字宽漂移即报。
- **字号**：读 baseline `props.fontSize` 与实现 computed 逐元素比；rem 有小数舍入（如 15.008px）容差 ≤0.5px，其余判定按阈值表「零容差」档。
- **字重**：读 baseline `props.fontWeight` 与实现 computed 比；设计名先换算数值（Medium=500/SemiBold=600），判定按阈值表「零容差」档；缺字重被近邻替代或 font-synthesis 合成粗体即报。
- **行高（控件是否被全局 lh 渗漏）**：读 baseline `props.lineHeight` 与 `fontSize` 比值，控件类（button/input）期望 = normal 或显式值，与 body 全局 lh 不一致即报。
- **字距**：读 baseline `props.letterSpacing` 与实现 computed 比；Figma 百分比换算 px（2%×16px=0.32px）换算舍入容差 0.05px，其余判定按阈值表「零容差」档。
- **CJK-拉丁混排基线**：取混排行 first-baseline 或 bbox 顶边差判定，CJK 与拉丁基线对齐，≤1px 偏心不判负、>1px 判负。
- **数字等宽（mono/tabular-nums）**：表格/金额/时间/计数器查实现 computed `font-variant-numeric: tabular-nums`（tnum）声明且字体真含该 OpenType 特性；O/0 混淆处 slashed-zero（zero）；判定按阈值表「零容差」档。
- **省略截断策略**：查实现 text-overflow: ellipsis / -webkit-line-clamp 行数与设计一致；截断点位置联查换行/截断条目，多行截断行数按设计稿。
- **(research §一) 实际渲染字体（font-family 落点）**：查 DevTools Computed→Rendered Fonts 或 document.fonts 实际生效 face；getComputedStyle('font-family') 只回声明串不回落点，比声明串无意义。
- **(research §一) 回退链逐字回退行为**：字体缺字形按字符逐个回退到链后位；generic 族（sans-serif 等）无字符覆盖保证 → 中文串任一字落点变化即字宽漂移；双侧渲染同一串取 rect 宽比对。
- **(research §一) line-height 与控件高度关系**：控件内容高 = line-height + padding + border；reset 框架 `font: inherit` 把全局 lh 带进 button/input/textarea → 控件须显式 line-height 再验 height 合成式。
- **(research §一) line-height 双侧比计算像素值**：Figma 有 px/%/Auto 三态，% 与无单位数 = 按自身字号乘的因子、px/em 继承为固定长度 → 只比最终计算 px，勿比声明数字；双侧 getComputedStyle('lineHeight') 终值比对。
- **(research §一) font-feature-settings / font-variation-settings**：双侧比 computed（reset 会设 inherit）；设计用了 ss01/cv11 等特性须落 CSS。
- **(research §一) text-transform / casing**：大写须由 transform 实现而非硬编码文案（影响换行宽度与本地化）。
- **(research §一) 字体加载态**：对比须在 document.fonts.ready / 预加载后进行，外部字体晚加载制造假 diff。
- **(research §一) 孤字/寡行**：标题末行单字判负；text-wrap: balance（标题；Chromium ≤6 行/Firefox ≤10 行内生效）或 pretty（正文防寡行）+ 逐段末行字符数检查。
- **(research §一) 文字基线网格**：Material 文字对齐 4dp 基线栅格；判据 = 值与 4dp 方格对齐。

## 空间族

- **基线网格（8px）**：读 baseline `props.padding`/`props.gap`/`props.height` 与 `_rect` 几何值；组件与间距对齐 8dp 方格（值%8 余数）、图标与文字对齐 4dp 方格（值%4 余数），设计自身非标值以设计稿为准。
- **padding/margin/gap**：读 baseline `props.padding`/`props.marginBottom`/`props.gap` 与实现 computed 逐边比；padding 四向可不等逐边比、margin 以「元素间最终间距」比而非声明值（折叠无对应）、gap 直接比 computed（无折叠/合成最可靠）；判定按阈值表「±1px」档。
- **视觉密度**：抽样读 baseline `props.padding`/`props.gap`/`props.height` 值分布成簇并与 token 刻度档一致，散点孤值即报（密度漂移）。
- **跨元素对齐**：对拍时双侧 live getBoundingClientRect 边缘量测（design/impl 两页各自 live 取 rect 边缘坐标比对，属 gate 侧运行时量测），同栏元素左缘对齐、同排元素基线/底缘对齐，≤1px 偏心不判负、>1px 判负；出处 = gate 运行时双侧 rect 边缘比对。
- **(research §一) 非标值保真**：设计 22/15/11/30px 类非刻度值须原样进 CSS/token；漂移判据 = 实现值 ≠ 设计值（零容差），刻度表只归档命名不做就近取整。〔推断：机制为工程推导（同批四根因实证 9 处字号漂移），非行业成文惯例〕
- **(research §一) 4px 级偏差必须机器判**：人工走查 4px 差在正常缩放下不可见，而 4px 偏差几乎必是实现错误（spacing 是最不可靠的人检项）→ 间距一律机器取 computed 比对。
- **(research §一) 测距双源互验**：Figma Dev Mode 悬浮/⌥ 拖拽测距值 ↔ getBoundingClientRect 几何互验一致。
- **(research §一) 尺寸语义**：Figma 尺寸含 padding → 对应 box-sizing: border-box；content-box 实现须加 padding+border 后再比。

## 色彩族

- **语义 token 消费（禁写死 hex）**：查实现样式来源须引用 design token 名而非硬编码近似 hex；双侧比「token 引用关系」+ 解析值，DTCG 别名 `{a.b}` 只能指整个 token、解析到目标 $value。
- **对比度 AA 4.5:1（大字 3:1）**：正文/控件文本对比度 ≥4.5:1，大字（≥18pt≈24px，或 14pt≈18.66px 粗体）≥3:1；阈值不四舍五入（4.499:1 判负）；用指定 CSS 颜色算、抗锯齿不计；中文标题按 3:1 判前先核字号档位。
- **状态色阶**：读 baseline `props.color`/`props.background` 逐状态（hover/focus/active/disabled）computed 值，状态间色阶按设计 token 档位，判定按阈值表「零容差」档。
- **焦点环与背景对比 ≥3:1**：焦点环（outline/描边）与相邻背景色对比度 ≥3:1，聚焦/未聚焦同像素对比 ≥3:1（非文本对比判法）。
- **禁用态低对比豁免与可识别性双要求**：禁用态低对比豁免后仍须可识别——视觉降饱和仍可读、状态可辨识，不因豁免而不可见。
- **(research §一) fill / text / border 三处 computed color**：继承与层叠会覆盖声明值，比声明无意义；三处都取 computed 比，判定按阈值表「零容差」档。
- **(research §一) 半透明合成**：比 computed rgba 四元组（已合成 alpha）或 color+opacity 两项，底色固定后比对。
- **(research §一) 图标 fill/stroke 与状态色**：逐状态（default/hover/active）比 SVG fill/stroke，与设计 token 同源。
- **(research §一) 非文本对比 ≥3:1**：控件边框、图标、焦点指示器对相邻色 ≥3:1（WCAG 1.4.11）。
- **(research §一) 术语隔离**：AA/AAA 是 WCAG 无障碍分级，与像素 diff 容差分级不同域，检查器配置勿混用。

## 控件族

- **高度/内距**：读 baseline `props.height`/`props.minHeight`/`props.padding` 与实现 computed 比；判定按阈值表「±1px」档。
- **圆角**：读 baseline `props.borderRadius` 与实现 computed 比；判定按阈值表「零容差」档。
- **描边**：读 baseline `props.border` 与实现 computed 比（宽/样式/颜色三子项）；判定按阈值表「零容差」档。
- **四态齐备（hover/focus/active/disabled）**：default/disabled/hover/focus/pressed 五核逐态存双侧样本比对；selected 属选择控件语义（checkbox/radio）非按钮态，不混入矩阵；loading 态归 `interaction-motion-checklist.md` 三态节。
- **焦点环**：outline/描边形态而非仅颜色变化；面积 ≥2 CSS px 厚的控件周长、聚焦/未聚焦对比 ≥3:1、内缩式指示器厚 ≥3px；:focus-visible 键盘导航出现、指针点击不出现。
- **(research §一) 状态反馈时限**：hover ~150-200ms（防误触延迟）、focus 100-150ms、pressed 100-150ms 内出反馈。
- **(research §一) disabled 语义**：aria-disabled（保持可聚焦 + 读屏播报）而非仅禁用属性；视觉降饱和仍可读。
- **(research §一) 触控目标**：≥24×24 CSS px（WCAG 2.5.8；间距例外=24px 直径圆不相交判）；Material ≥48×48dp 且间距 ≥8dp；移动端常用 44×44。
- **(research §一) 控件高度合成**：height = line-height + padding + border → 逐项比四子项而非只比 height（定位 4-5px 胖瘦漂移的唯一可靠判法）。
- **(research §一) 过渡属性**：比 computed transition-duration / transition-timing-function / transition-property 与 token 对齐（时长惯例 100-200ms）。

## 布局族

- **栅格栏比例**：读 baseline `_rect.width` 同组两两全算比值与设计同序对比，判定按阈值表「栏比例 ±2%」档；group 同值 ≥2 元素参与比值判定。
- **minmax(0,1fr) 抗压**：1fr ≡ minmax(auto,1fr) 下限=子项 min-content → 凡设计稿含 1fr 处必查 minmax(0,1fr)，或子项 min-width:0 / overflow 系。
- **min-content 爆轨推演**：注入表格/长不可断串后容器宽 ≤ 父容器宽（溢出即 fail）；压力样本按设计稿最坏内容（长串/表格/图片）构造。
- **溢出与滚动容器**：查 overflow 容器滚动条占位（scrollbar-gutter）不破坏布局；hidden 裁剪不截断关键内容。
- **窄口表现**：断点宽度同设计；断点处堆叠顺序、显隐（移动菜单等）逐一验；设计自身窄口表现（如状态列竖排）非缺陷不报。
- **(research §一) max-width/min-width 约束**：max-width 取代固定宽是设计意图非偏差，按约束语义比而非固定宽。
- **(research §一) 宽高比**：图片不拉伸不裁切，比设计 frame 宽高比（16:9 / 3:2 / 4:3 / 1:1 等）。
- **(research §一) 尺寸不变性即失败项**：BackstopJS requireSameDimensions 默认 true、Chromatic 对被豁免元素仍报尺寸/位置变化 → 豁免只遮渲染差异不遮几何漂移。
- **(research §一) sticky/fixed 元素**：截图对比易随滚动抖动 → 几何验收显式固定滚动位后取 rect。

## 文案族

- **孤字**：末行单字（标题单行孤字）判负；text-wrap: balance（标题）/ pretty（正文防寡行）+ 逐段末行字符数检查。
- **换行点**：双侧文本节点断行位置逐项比；关键断行点（连接词/单位/日期）不拆开。
- **截断**：双侧文本节点值与 text-overflow: ellipsis 截断位置一致；查不可见空白（NBSP 等）。
- **占位文本**：placeholder 与设计稿一致；占位符文本对比度同正文要求，不当低对比豁免。
- **CJK 标点**：标点不落行首、行尾点号悬挂（clreq §6.1.1-6.1.3）；破折号/省略号两连不得拆行；注入长串标点压力样本验换行。
- **(research §一) casing 实现方式**：大写是否 transform 而非硬编码进文案（影响换行宽度与本地化）。
- **(research §一) CJK-拉丁混排间距**：汉字与拉丁/数字间 ≤1/4 汉字宽、行首尾不加（clreq §2.1.3）。
- **(research §一) 全角 ASCII 不入库**：半角字符+样式处理，不让引擎吃全角空格。
- **(research §一) 本地化长度压力**：同 key 多语言最长串注入后无溢出、无异常换行。
- **(research §一) 动态串豁免形态**：日期/邮箱/URL 类文本用模式匹配豁免（Applitools Dynamic 区域思路）而非整块忽略。

## 图标媒体族

- **尺寸对齐**：图标渲染像素尺寸与设计稿导出尺寸一致（±1px）；toolbar 图标对齐 4dp 栅格、标准图标 24dp、头像 40dp。
- **Unicode 回退字形差（如 ↑ 在 mono 栈下的渲染差）**：图标字符逐字符核验 Rendered Fonts 落点与字形；缺字形回退使字宽/字面漂移即报。
- **位图/SVG 在 2x DPR 下的糊化**：retina 用 2x 资产、展示分辨率与设计稿一致；SVG 矢量无模糊，位图在 2x DPR 下须足分辨率，糊化即报。
- **图标与相邻文本基线对齐**：图标 bbox 与相邻文本基线对齐；取 first-baseline 或 bbox 顶边差判定。
- **纯图标按钮禁（必须带文本标签或 aria-label）**：纯图标按钮必须带文本标签或 aria-label（读屏可达），aria-label 语义与设计稿图标一致。
- **(research §一) 图标资产导出**：Figma 区分「原图 source image」与「图层导出 layer export」→ 双侧比 SVG 源或位图像素尺寸。
- **(research §一) 图标颜色与状态色**：SVG fill/stroke 逐状态（default/hover/active）比，与设计 token 同源。
- **(research §一) 图片默认行为覆盖**：reset 给 img/video `max-width:100%; height:auto` + display:block → 还原固定尺寸须显式覆盖并复测。
- **(research §一) 标准宽高比键线**：16:9 / 3:2 / 4:3 / 1:1 / 3:4 / 2:3（Material keylines）作宽高比对照基准。
- **(research §一) 动图/视频/动画截帧**：冻结后截：CSS 动画/过渡/视频/GIF 由工具暂停，JS 动画须手动停；Playwright animations:'disabled'。
