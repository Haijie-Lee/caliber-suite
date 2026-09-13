<!-- caliber:docs-map -->
## 文档地图（docs 治理体系；宪法 = docs/README.md）

### 加载时机契约

> 本表与 docs/README.md §1 同源，以 §1 为正主——此处是指针级复述，修订先改 §1。

| 层 | 何时读 | 预算 |
|---|---|---|
| AGENTS.md（本文件） | 每会话自动 | ≤400 行 |
| 组件 CLAUDE.md | 进入对应目录工作前（手动读，非自动注入） | 各 ≤80 行 |
| CONTEXT.md | 每会话自动（caliber 插件 hook 注入） | ≤120 行 |
| docs/README.md | 术语/文档位置存疑时 | ≤120 行 |
| docs/architecture/ docs/runbooks/ docs/adr/ | 任务涉及对应域时 | 按需 |
| docs/learnings/ | 追溯 why / 写新 learnings 前查重（先扫 docs/learnings/INDEX.md） | 按需 |

### 目录树

```
AGENTS.md / CONTEXT.md
docs/
  README.md       治理宪法（分类/命名/生命周期/引用纪律/delete-zone/§9 四层路由）
  learnings/      事故复盘全文 + INDEX.md（日期|文件|何时需要）
  architecture/   域当前真相单页（原地更新 + [MODIFIED 日期]）
  runbooks/       可复现操作步骤
  adr/            定案（含被否方案与重审条件）
  plans/          plan 账本（ML/L 级任务 plan 文档落盘处）
```

### 开工三问（动手前先答）

动哪些目录？→ 读对应组件 CLAUDE.md（无则跳过）。动哪些机制（数据格式/协议/配置/启动顺序）？→ 查 docs/architecture/ 对应单页（无则跳过）。涉及长流程/外部系统？→ 读 docs/runbooks/ 对应本（无则跳过）。**三问全有答案才动手**；目录尚空的层答「无」即合法。

### 约定

- 组件 CLAUDE.md：≤80 行/份，进目录工作前读；只写「进该目录就会踩」的操作规则。
- docs/plans/：ML/L 级任务 plan 文档归口（YYYY-MM-DD-<主题>-plan.md）。
- 维护节奏：见 docs/README.md §9（会话收尾四层路由，caliber Stop hook 机械提醒）。
<!-- /caliber:docs-map -->
