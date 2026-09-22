# caliber — ZCode 工程纪律插件

> 最后更新：2026-09-22

caliber 是一个 ZCode 插件（以 git 仓库形态作为 marketplace 源分发），把"工程纪律"打包为 **9 个 skills + 4 个工作流 hooks + 10 个 agents**：skills 让流程严谨度随任务复杂度缩放，hooks 在关键时刻把纪律自动递到 agent 眼前。

## 它解决什么问题

用 agent 干活时有三类反复出现的失序：

- **开工不读项目文档**——agent 直接进入任务，不知道项目约定与上下文；
- **定计划不查历史教训**——同类坑反复踩，learnings 写了却没人看；
- **会话结束不更新 learnings**——经验随会话关闭而丢失。

caliber 的思路：前两类靠 hooks 在事件点上**自动注入**（不依赖 agent 自觉）；第三类靠 Stop 钩子做收尾提醒。同时用 skill 定级机制避免流程过载——小任务走轻流程，大任务走全剂量，而不是对所有任务一视同仁上重流程。

## 组件

### Skills（9 个）

| 组件 | 一句话职责 |
|---|---|
| `caliber` | 工程任务总入口：定级（S/M/L，M 档再分 MS/ML 子档）、路由、守停止点；六阶段骨架恒定、剂量随级缩放 |
| `plan-forge` | ML/L 级出正式 plan 文档的锻造工艺：选材→制坯→锻打（L 级收敛循环）→准出闸口→成型（fresh 零背景基线真实彩排） |
| `plan-review-ritual` | 任何 plan/spec 写完后、交付实现前的对抗审查仪式：双声部共识、三级裁定、决策审计追踪 |
| `init-docs` | 新工程 docs 体系播种：探测 gap → 预览确认 → 模板落盘，建立四件种子文件激活 hooks 订阅（CONTEXT.md / 治理宪法 / learnings 索引 / AGENTS.md 文档地图） |
| `update-docs` | docs 体系回填与同步：把已有 learnings 登记进 INDEX.md、扫描仓库已有文档/清单生成或更新 CONTEXT.md（体系未播种时引导先 init-docs） |
| `exec-forge` | ML/L 阶段 4 非 coding 执行引擎：plan 期预分配混合执行编排、routing.yaml 驱动注入两档、逐任务审查门、ledger 断点恢复 |
| `coding-forge` | ML/L 阶段 4 编码执行引擎：brief 文件化、双 verdict 审查门、TDD 证据强制、编辑纪律注入、ledger 断点恢复（兄弟双引擎：coding + git 场景归本引擎） |
| `plan-drafting` | 全级 plan 起草引擎，MS 轻量/ML 标准/L 完整三档模板，契约矩阵先行 |
| `deep-probe` | 澄清对齐引擎，L 级全仪式/MS·ML 轻量档（ML 双轨：方案挑战者独立生成 + 对照表），收口对齐快照 |

### Agents（10 个）

| Agent | 一句话职责 |
|---|---|
| `plan-reviewer` | plan/spec 对抗性审查，ritual 声部 A 首选 |
| `voice-b-reviewer` | plan 对抗审查声部 B 专责：纯文本内部一致性 / 回填漂移 / 修复验尸 + pre-mortem |
| `code-reviewer` | 代码 diff 审查，引擎 reviewer 槽首选 |
| `coder` | 编码实现，引擎实现槽首选 |
| `debugger` | 疑难 bug 系统化诊断 |
| `architect` | 需求分析与任务分解 |
| `researcher` | 深度调研与选型 |
| `doc-writer` | 技术文档编写 |
| `complex-purpose` | 复杂问题分析与多步任务执行，高于 general-purpose 一档 |
| `ops-operator` | 系统操作与安装配置 |

agents 不绑定模型（frontmatter 无 model 键），继承 dispatch 指定模型或会话默认模型。voice-b-reviewer 的对抗价值依赖模型分化：建议在 agent 设置中为它配置与会话默认不同家族的模型 override——配好后它即成为 plan-review-ritual 声部 B 首选，无需任何外部 CLI。

caliber 的 dispatch 选择链按任务信号自动选用；同名用户级 agent 存在时用户级以裸名优先。

### Hooks（4 个，全自动，无需调用）

| Hook | 触发时机 | 一句话职责 |
|---|---|---|
| `context-md.sh` | 会话开始 / compact 后 | 工程根存在 `CONTEXT.md` 则全量注入会话上下文 |
| `index-md.sh` | 调用 skill 前 | 仅当调用 caliber / plan-forge / plan-drafting / deep-probe 且工程存在 `docs/learnings/INDEX.md` 时注入该索引——定计划前先扫历史教训 |
| `learnings-wrapup.sh` | 每轮回答结束时（Stop 事件） | 会话有实质编辑（≥3 次 Write/Edit）但未触 learnings 时，递送收尾检查单提醒复盘；门控保证每会话至多提醒 1 次 |
| `index-registry-check.sh` | 写入文件后 | 写 `docs/learnings/*.md` 未登记 INDEX.md 时注入登记提醒；同时维护编辑计数供收尾 hook 门控 |

## 安装

前置条件：

- ZCode（桌面版）
- Windows + Git for Windows（hooks 的解释器依赖 Git Bash）
- `python` 在 PATH（hooks 的 JSON 解析依赖）

步骤：

1. Settings → Plugin Management → Discover → **+**
2. 添加本 git 仓库为 marketplace 源
3. 安装插件 `caliber`

安装后 skills 以 `caliber:<name>` 命名空间出现，裸名别名同样可用。

## 使用

- **hooks 全自动生效**，无需任何调用。
- **订阅机制 = 声明即数据**：工程根存在 `CONTEXT.md`，开工即自动注入；存在 `docs/learnings/INDEX.md`，learnings 相关 hooks 自动订阅。没有这些文件的工程**零打扰**——不需要任何配置开关。新工程可用 `init-docs` 一键建立种子文件；已有文档积累的工程可用 `update-docs` 回填索引与 CONTEXT。ML/L 级非 coding 任务的阶段 4 执行由 `exec-forge` 接管（执行编排预分配 + 逐任务审查门）。
- **skills 按需调用**：`caliber:caliber` / `caliber:plan-forge` / `caliber:plan-review-ritual` / `caliber:init-docs` / `caliber:update-docs` / `caliber:exec-forge` / `caliber:coding-forge` / `caliber:plan-drafting` / `caliber:deep-probe`，或用裸名 `caliber` / `plan-forge` / `plan-review-ritual` / `init-docs` / `update-docs` / `exec-forge` / `coding-forge` / `plan-drafting` / `deep-probe`。

## 更新

本仓库是 git 源 marketplace，ZCode 对 git 源**有更新检测**：插件出新版本后 Plugin Management 会出现「可更新」徽章，一键更新即可。

注意：这与本地目录源不同——本地源没有更新检测，改了内容必须卸载重装；git 源无此负担。

## 平台支持

- **Windows 10/11 + Git Bash**：实证可用。
- **macOS / Linux**：未验证。Windows 特定的是 `hooks/hooks.json` 里的 Git Bash 绝对路径（hook 脚本本身的解释器解析为可移植的 `python || python3` 兜底），移植需先改 hooks.json 的解释器路径并实证。

## 卸载与反馈

- 卸载：Settings → Plugin Management 直接卸载即可。
- 问题与建议：走本仓库 Issues。

## License

[MIT](LICENSE)

## 支持作者

如果这个插件对您有帮助，可以请作者喝杯咖啡☕随缘支持，感谢感谢🙏🙏

<p align="center">
  <img src="assets/wechat-reward-qr.png" alt="微信收款码" width="220" />
</p>
