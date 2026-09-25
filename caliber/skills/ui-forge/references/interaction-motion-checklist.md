# 交互与动效清单（interaction-motion-checklist）

消费方：interaction 状态验收与状态声明对拍判定。每条一行「查什么 + 怎么判」；「怎么判」出处 = baseline 键名（`props.*` 14 属性集 / `_rect`）或 T6 阈值表档位（零容差 / ±1px / 逐字等值 / 栏比例 ±2%）；动效类验收形态见挂起条款。

**挂起条款**：动效（进入/退出/补间动画）的验收形态 v1 挂起——本文件只登记动效清单与状态声明，不做对拍判定；重审触发器 = 首个含明确动效需求的 UI 任务出现（2026-09-25 用户裁定）。

## hover 反馈

- **状态色阶**：判据见 `fidelity-checklist.md`「状态色阶」条（单落点不复制——2026-09-25 终审并案，双写归指针）；本条义务 = 逐状态（hover/focus/active/disabled）构造样本送判。
- **hover 反馈时限**：判据归并「过渡时长与曲线」节「(research §二) 时长惯例」条（单落点不复读——2026-09-25 终审并案）。
- **(research §二) 静态截图只覆盖 default 态**：状态验收须逐态构造样本；CSS `:hover` 是 trusted event 难程序化模拟 → 用 Pseudo States 插件或 `.hover/.active` 镜像类；Chromatic 明确 hover/focus 需显式模拟：play function、.focus()。
- **(research §二) 交互测试只拍终态**：play function 中间态不落图，要中间态就拆多个 story。
- **(research §二) 机器可判交互项**：逐状态提取 background-color/color/border/box-shadow/opacity/outline/transform/transition-* 与双侧 diff（属性级对比是确定性判定）。〔推断：条目组合自 [S26] 检查项，非成文清单〕

## 过渡时长与曲线

- **过渡声明齐备**：查实现 transition-property / transition-duration / transition-timing-function 三项是否显式声明；未声明即视为无过渡，动效清单登记有该动效而实现无声明即报。
- **时长 ≤200ms 惯例**：判据归并下条「(research §二) 时长惯例」（单落点不复读——2026-09-25 终审并案）。
- **(research §二) 时长惯例**：微交互反馈 100-200ms（NNg：hover 150-200ms、focus/pressed 100-150ms）；WinUI 控件动画三档 250/167/83ms；MD3 duration token short1-4=50/100/150/200ms、medium1-4=250/300/350/400ms、long1-4=450/500/550/700ms、extra-long=900/1400ms → 双侧比 computed transition-duration 与 token 对齐。
- **(research §二) 缓动惯例**：MD3：easing-standard cubic-bezier(0.2,0,0,1)、emphasized-decelerate (0.05,0.7,0.1,1)、legacy (0.4,0,0.2,1)；Fluent：进场 (0,0,0,1)、退场 (1,0,1,1) → 比 computed transition-timing-function 逐 token。

## 键盘焦点流

- **tab 顺序**：tab 顺序同设计流程；逐 Tab 走查焦点落点顺序与设计一致，跳序/漏焦点即报。
- **焦点环可见**：判据见 `fidelity-checklist.md`「焦点环」条（单落点不复制——2026-09-25 终审并案，双写归指针）；本条义务 = focus 态样本构造（:focus-visible 键盘触发、指针点击不出现）送判。
- **(research §二) 键盘可达与 tab 顺序**：tab 顺序同设计流程；focus-visible 只在键盘导航出现、鼠标点击不出现。
- **(research §二) 焦点环会被截图裁掉**：Chromatic 裁到 story 根节点尺寸，outline 常被裁 → 样本根节点加 padding 再截。

## loading/empty/error 三态

- **三态齐备**：loading/empty/error 三态逐态构造样本与设计稿比对（静态截图只覆盖 default 态，三态须显式触发采集）；缺任一态即报。
- **(research §二) 三态模式（loading/empty/error）是一等验收对象**：loading：骨架 + 读屏 "Loading" 标签；error：消息具体、不指责用户、给恢复途径（Retry）+ role="alert"；empty：区分「首次无数据」与「筛选无结果」并各给行动按钮。
- **(research §二) disabled/loading 行为**：aria-disabled 元素仍可聚焦、不提交；loading 防重复提交且完成态有可见变化（勿无限 spinner）。
- **(research §二) 状态词表**：hover/pressed/selected 语义分离（selected 属选择控件）；避免把 loading/empty/error 叫「按钮状态」混进同一矩阵。

## 拖拽反馈

- **拖拽悬停态**：拖拽源悬停于可放置目标上方时，目标出可放置反馈（高亮/描边/背景变化按设计稿）；读 baseline `props.color`/`props.background`/`props.border` 逐状态 computed 值，判定按阈值表「零容差」档。
- **拖拽落点态**：拖拽释放落点的目标态样式与设计稿一致（落点激活/放置指示样式）；未实现落点态或与设计不符即报。

## 弹层进出

- **遮罩**：弹层打开时遮罩存在、覆盖范围与设计稿一致；遮罩色值按设计 token，判定按阈值表「零容差」档。
- **焦点圈禁**：弹层打开时焦点移入弹层、Tab 循环被圈禁在弹层内（不逃逸到背景内容）；焦点逃逸即报。
- **弹层进出（动效清单登记）**：查动效清单对弹层进入/退出动效形态的登记；验收形态 v1 挂起（挂起条款见文首），登记即可不做对拍判定。

## reduced-motion 偏好声明

- **reduced-motion 偏好声明**：查 `@media (prefers-reduced-motion: reduce)` 分支存在并声明降级策略；实现无该分支即报。
- **(research §二) reduced-motion 分支必验**：@media (prefers-reduced-motion: reduce) 须有降级（缩放/平移类换淡入或移除）；双侧在 reduce 环境各采一份样本；该媒体特性 2020-01 起全平台可用。
