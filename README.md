# caliber — ZCode 工程纪律插件

> 最后更新：2026-09-13

caliber 是一个 ZCode 插件（以 git 仓库形态作为 marketplace 源分发），把"工程纪律"打包为 **4 个 skills + 4 个工作流 hooks**：skills 让流程严谨度随任务复杂度缩放，hooks 在关键时刻把纪律自动递到 agent 眼前。

## 它解决什么问题

用 agent 干活时有三类反复出现的失序：

- **开工不读项目文档**——agent 直接进入任务，不知道项目约定与上下文；
- **定计划不查历史教训**——同类坑反复踩，learnings 写了却没人看；
- **会话结束不更新 learnings**——经验随会话关闭而丢失。

caliber 的思路：前两类靠 hooks 在事件点上**自动注入**（不依赖 agent 自觉）；第三类靠 Stop 钩子做收尾提醒。同时用 skill 定级机制避免流程过载——小任务走轻流程，大任务走全剂量，而不是对所有任务一视同仁上重流程。

## 组件

### Skills（4 个）

| 组件 | 一句话职责 |
|---|---|
| `caliber` | 工程任务总入口：定级（S/M/L，M 档再分 MS/ML 子档）、路由、守停止点；六阶段骨架恒定、剂量随级缩放 |
| `plan-forge` | ML/L 级出正式 plan 文档的锻造工艺：选材→制坯→锻打（L 级收敛循环）→准出闸口→成型（弱模型真实彩排） |
| `plan-review-ritual` | 任何 plan/spec 写完后、交付实现前的对抗审查仪式：双声部共识、三级裁定、决策审计追踪 |
| `init-docs` | 新工程 docs 体系播种：探测 gap → 预览确认 → 模板落盘，建立四件种子文件激活 hooks 订阅（CONTEXT.md / 治理宪法 / learnings 索引 / AGENTS.md 文档地图） |

### Hooks（4 个，全自动，无需调用）

| Hook | 触发时机 | 一句话职责 |
|---|---|---|
| `context-md.sh` | 会话开始 / compact 后 | 工程根存在 `CONTEXT.md` 则全量注入会话上下文 |
| `index-md.sh` | 调用 skill 前 | 仅当调用 caliber / plan-forge 且工程存在 `docs/learnings/INDEX.md` 时注入该索引——定计划前先扫历史教训 |
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
- **订阅机制 = 声明即数据**：工程根存在 `CONTEXT.md`，开工即自动注入；存在 `docs/learnings/INDEX.md`，learnings 相关 hooks 自动订阅。没有这些文件的工程**零打扰**——不需要任何配置开关。新工程可用 `init-docs` 一键建立种子文件。
- **skills 按需调用**：`caliber:caliber` / `caliber:plan-forge` / `caliber:plan-review-ritual` / `caliber:init-docs`，或用裸名 `caliber` / `plan-forge` / `plan-review-ritual` / `init-docs`。

## 更新

本仓库是 git 源 marketplace，ZCode 对 git 源**有更新检测**：插件出新版本后 Plugin Management 会出现「可更新」徽章，一键更新即可。

注意：这与本地目录源不同——本地源没有更新检测，改了内容必须卸载重装；git 源无此负担。

## 平台支持

- **Windows 10/11 + Git Bash**：实证可用。
- **macOS / Linux**：未验证。Windows 特定的是 `hooks/hooks.json` 里的 Git Bash 绝对路径（hook 脚本本身的解释器解析为可移植的 `python || python3` 兜底），移植需先改 hooks.json 的解释器路径并实证。

## 卸载与反馈

- 卸载：Settings → Plugin Management 直接卸载即可。
- 问题与建议：走本仓库 Issues。

## 支持作者

如果这个插件对您有帮助，可以请作者喝杯咖啡☕随缘支持，感谢感谢🙏🙏

<p align="center">
  <img src="assets/wechat-reward-qr.png" alt="微信收款码" width="220" />
</p>
