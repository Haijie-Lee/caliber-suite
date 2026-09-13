# docs/ 文档治理宪法（{{PROJECT_NAME}}）

> 建立：{{DATE}} by caliber:init-docs ｜ 本文件治理 docs/ 树的分类、命名、生命周期、引用与维护规则，docs/ 下所有新增文档均适用。

## 1. 加载时机契约

| 层 | 何时读 | 预算 |
|---|---|---|
| AGENTS.md | 每会话自动 | ≤400 行 |
| 组件 CLAUDE.md | 进入对应目录工作前（文档地图指路，手动读，非自动注入） | 各 ≤80 行 |
| CONTEXT.md | 每会话自动（caliber 插件 SessionStart hook 注入） | ≤120 行 |
| docs/README.md（本文件） | 术语/文档位置存疑时 | ≤120 行 |
| architecture/ runbooks/ | 任务涉及对应域时 | 按需 |
| learnings/ adr/ | 追溯 why / 写新 learnings 前查重（先扫 learnings/INDEX.md 再决定读哪份） | 按需 |

## 2. 分类原则总表

| 目录 | 何时新增 | 命名示例 |
|---|---|---|
| learnings/ | 一次性历史/复盘/验证 trail 落档时 | YYYY-MM-DD-<slug>.md |
| architecture/ | 域内当前真相成型或修正时（原地更新 + [MODIFIED 日期]） | <domain>.md |
| runbooks/ | 可复现操作步骤沉淀时 | <operation>.md |
| adr/ | 决策定案时（含被否方案与重审条件） | ADR-NNNN-<slug>.md |

新类别（designs/ analysis/ reference/ 等）按 §7 流程修订本表后启用；目录随第一份对应文档出现而建立。

## 3. 命名规范

- R1：kebab-case 全小写。
- R2：事件型文件前缀 `YYYY-MM-DD`，取首次落档日期。
- R3：主题型文件不加日期。
- R4：外部文件豁免（非本体系产出的文件不强改）。

## 4. 文档生命周期

- session 结论 → learnings/、adr/、architecture/（按属性归口，见 §9 四层路由）。
- 计划 → docs/plans/。
- 操作 → runbooks/。

## 5. 引用纪律

- 一律相对路径。
- 搬迁后必须 grep 旧路径，残留=0 才算完成。
- 行号引用失效即删行号（只留文件级引用）。
- 冻结归档（learnings/、adr/）内的历史叙述允许保留旧路径——属已知例外，不做回改。

## 6. 边界约定

- 机器本地状态（agent 工具的 memory 等）不入库。
- secrets 红线：token/密钥/个人信息永不进 docs/。

## 7. 目录变更流程

先改本文件 §2 总表，再动目录；同步更新 AGENTS.md 文档地图块。

## 8. delete-zone

已废止概念登记；新文档出现下述概念时按「现行替代」列改写。（建立时为空表）

| 已废止概念 | 原因 | 现行替代 | 重访条件 |
|---|---|---|---|

## 9. 维护节奏（生产端四层路由协议）

session 收尾（写路径，逐条执行）：新知识先落 learnings/adr（史实层），然后**必须完成路由判断**——「这知识下次何时被需要？」按下表归口；跳过路由判断 = 体系退化回单文件膨胀。**无新知识=零产出是合法结果**（防仪式化造文件，learnings/ 不做新垃圾抽屉）。新 learning 落档即追加 `docs/learnings/INDEX.md` 一行（日期|文件|何时需要）。

| 知识形态 | 归口 | 上限 |
|---|---|---|
| 每会话必须生效的规则 | AGENTS.md 常驻纪律节 | 全文 ≤400 行且纪律 ≤8 条，超额必须挤出不常踩条目 |
| 进某目录就会踩的操作规则 | 组件 CLAUDE.md | ≤80 行/份 |
| 域内当前真相 | docs/architecture/（原地更新 + [MODIFIED 日期]） | 单文件 ≤500 行 |
| 一次性历史/复盘/验证 trail | docs/learnings/ | 无上限（按需加载） |
| 定案（含被否方案与重审条件） | docs/adr/ | 每案 ≤150 行 |
| 可复现操作步骤 | docs/runbooks/ | 按需 |

- **翻案**：architecture 层原地修正 + [MODIFIED 日期]，不删史实；被推翻概念在 §8 delete-zone 登记。
- **常驻层白名单**：进 AGENTS.md 常驻纪律的条目必须满足「任何会话都可能踩、且踩了代价高」，每条 ≤2 行 + 链接。
