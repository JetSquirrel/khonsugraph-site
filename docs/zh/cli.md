---
description: khonsu 命令行对每条命令都输出 JSON，方便 Claude Code 等 AI Agent 查看图、执行查询、追踪路径并编写仪表盘。
---
# CLI 与 AI Agent

桌面应用与 CLI 共用一个可执行文件。不带参数运行 `khonsugraph` 会打开应用，带子命令时执行命令后退出。标题栏的 **命令行与 AI** 按钮（机器人图标）可以将 `khonsu` 加入 PATH，并为 Claude Code 安装 Skill。

[Agent Skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) 介绍先查看 Schema 的工作流，以及可用的 Cypher 语法。

## 命令索引

| 命令 | 用途 |
| --- | --- |
| `khonsu graph init DIR` | 创建空图 |
| `khonsu schema --db DIR` | 查看标签、关系、属性与表 |
| `khonsu query --db DIR --cypher "…"` | 执行一条只读 Cypher |
| `khonsu query --db DIR --sql "…"` | 执行一条只读 SQL |
| `khonsu query --db DIR --file query.cypher` | 执行查询文件；`.sql` 使用 SQL |
| `khonsu query --db DIR --semantic --cypher "…"` | [用本体的词语查询](./ontology#semantic)：`Device`、`Account`、`runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | 根据图[检查语句](./ontology#validate)，不执行 |
| `khonsu graph explain --db DIR --cypher "…"` | 查看查询计划 |
| `khonsu graph ontology describe [--db DIR]` | 列出[概念](./ontology)及其覆盖的图标签 |
| `khonsu graph ontology resolve WORD…` | 说明词语的含义：概念、同义词及对应的标签 |
| `khonsu graph ontology check --db DIR --entities a,b` | 图中是否有问题所涉及的每类事物的记录 |
| `khonsu graph ontology path --from A --to B [--db DIR]` | 两个概念如何相连，以 Cypher 模式给出 |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [从节点向外探索](./investigations#explore)并给出路径 |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | 查看[一条记录的依据](./investigations#evidence) |
| `khonsu graph analyze ALGORITHM --db DIR` | 运行[图算法](./analysis)：PageRank、社区发现、连通分量等 |
| `khonsu investigate save FILE --db DIR --from NODE` | [保存调查](./investigations#saved-investigations)；`reopen FILE` 重新执行 |
| `khonsu graph snapshot save FILE --db DIR` | 保存图中的记录；[`snapshot diff A B`](./investigations#snapshots) 比较两个快照 |
| `khonsu graph rebuild --db DIR` | 用数据源重建旧格式的图 |
| `khonsu plugin list` | 列出插件与权限 |
| `khonsu plugin describe ID` | 查看插件的配置字段与输出类型 |
| `khonsu plugin search [WORDS]` | 列出[插件市场](./marketplace)提供的插件 |
| `khonsu plugin install ID --yes` | 按名称从插件市场安装插件并批准 |
| `khonsu plugin install DIR --yes` | 安装插件目录或 ZIP，并批准其权限 |
| `khonsu plugin update` | 更新从插件市场安装的插件；`--dry-run` 只预览 |
| `khonsu plugin marketplace list` | 列出插件市场；用 `add` 和 `remove` 修改 |
| `khonsu plugin sync --source ID` | 同步数据源；`--dry-run` 预览，`--incremental` 和 `--append` 只新增和更新、不删除 |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | 运行[插件自带的分析](./investigations#plugin-analyses)，例如 AWS `exposure` |
| `khonsu source list` | 列出已配置数据源 |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | 配置数据源；`--test` 先测试连接 |
| `khonsu source remove ID` | 删除数据源 |
| `khonsu dash check FILE --db DIR` | 在图上验证仪表盘 |
| `khonsu dash comments FILE` | 列出、回复和解决图表评论 |
| `khonsu dash presence FILE --doing editing --plot NAME` | 告诉窗口你正在编辑哪些图表 |
| `khonsu open DIR` | 在桌面应用中打开图 |
| `khonsu open FILE.dash` | 打开仪表盘 |
| `khonsu open --state` | 读取运行中窗口的图和标签页状态 |

未指定 `--db` 时依次使用 `KHONSU_DB`、应用上次打开的图。自动化流程中建议显式指定路径。写查询需要 `--write`。

## 输出与错误

每条命令在 stdout 输出一个 JSON 对象，`--pretty` 可格式化。同步进度以 JSON Lines 输出到 stderr。查询结果包括 `columns`、`rows`、`row_count`、`truncated` 和 `elapsed_ms`，返回节点或关系时还包括 `graph`。

`--max-rows` 默认 200，只截断展示结果，不减少查询执行成本。请检查 `truncated` 并限制查询规模。

失败结果包含带 `kind`、`message` 和可选 `detail` 的 `error` 对象。解析 stdout 前先检查退出状态：1 表示执行错误，2 表示用法或仪表盘规格错误。

从 0.3.0 之后的版本起，退出码 2 也表示查询[与图不符](./ontology#validate)（`invalid_query`），3 表示图中没有问题所涉及事物的记录（`not_investigable`），4 表示需要人来确认（`needs_confirmation`）。

## 批准由人来做 {#approval}

从 0.3.0 之后的版本起，批准插件权限是人的决定。当 Agent 运行 `khonsu plugin install … --yes`、`plugin update` 或 `plugin approve` 时，插件会被安装或更新但不会被批准，命令以 4 退出，类型为 `needs_confirmation`，并列出这些插件。请让用户在应用中或在自己的终端里批准。KhonsuGraph 通过 `KHONSU_AGENT` 或 Claude Code、Codex、Cursor 和 Gemini CLI 设置的环境变量识别 Agent。

## 审阅循环

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# 修改 .dash 文件后验证。
khonsu dash check overview.dash --db graphs/demo
# 使用第一条命令返回的真实评论 ID。
khonsu dash comments overview.dash --reply c1 --text "已更新关系图面板" --resolve
khonsu dash presence overview.dash --doing idle
```

应用打开图时，只读查询、`dash check` 和 `plugin sync` 通过窗口执行，返回 `via_window: true`。查询写入、`graph explore` 和 `investigate` 需要图空闲。不要删除锁文件强行写入。参阅[常见问题](./troubleshooting)。
