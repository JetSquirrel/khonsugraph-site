---
description: 使用 khonsu JSON CLI 查看图、查询数据，并与 Agent 协作审阅仪表盘。
---
# CLI 与 AI Agent

桌面应用与 CLI 共用一个可执行文件。不带参数运行 `khonsugraph` 会打开应用，带子命令时执行命令后退出。标题栏的 **命令行与 AI** 按钮（机器人图标）可以将 `khonsu` 加入 PATH，并为 Claude Code 安装 Skill。

[Agent Skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) 介绍先查看 Schema 的工作流，以及可用的 Cypher 语法。

## 命令索引

| 命令 | 用途 |
| --- | --- |
| `khonsu init DIR` | 创建空图 |
| `khonsu schema --db DIR` | 查看标签、关系、属性与表 |
| `khonsu query --db DIR --cypher "…"` | 执行一条只读 Cypher |
| `khonsu query --db DIR --sql "…"` | 执行一条只读 SQL |
| `khonsu query --db DIR --file query.cypher` | 执行查询文件；`.sql` 使用 SQL |
| `khonsu explain --db DIR --cypher "…"` | 查看查询计划 |
| `khonsu plugin list` | 列出插件与权限 |
| `khonsu plugin describe ID` | 查看插件的配置字段与输出类型 |
| `khonsu plugin install DIR --yes` | 安装插件目录或 ZIP，并批准其权限 |
| `khonsu plugin sync --source ID` | 同步数据源；`--dry-run` 预览，`--incremental` 增量同步 |
| `khonsu source list` | 列出已配置数据源 |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | 配置数据源；`--test` 先测试连接 |
| `khonsu source remove ID` | 删除数据源 |
| `khonsu check FILE --db DIR` | 在图上验证仪表盘 |
| `khonsu comments FILE` | 列出、回复和解决图表评论 |
| `khonsu presence FILE --doing editing --plot NAME` | 告诉窗口你正在编辑哪些图表 |
| `khonsu open DIR` | 在桌面应用中打开图 |
| `khonsu open FILE.dash` | 打开仪表盘 |
| `khonsu open --state` | 读取运行中窗口的图和标签页状态 |

未指定 `--db` 时依次使用 `KHONSU_DB`、应用上次打开的图。自动化流程中建议显式指定路径。写查询需要 `--write`。

## 输出与错误

每条命令在 stdout 输出一个 JSON 对象，`--pretty` 可格式化。同步进度以 JSON Lines 输出到 stderr。查询结果包括 `columns`、`rows`、`row_count`、`truncated` 和 `elapsed_ms`，返回节点或关系时还包括 `graph`。

`--max-rows` 默认 200，只截断展示结果，不减少查询执行成本。请检查 `truncated` 并限制查询规模。

失败结果包含带 `kind`、`message` 和可选 `detail` 的 `error` 对象。解析 stdout 前先检查退出状态：1 表示执行错误，2 表示用法或仪表盘规格错误。

## 审阅循环

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# 修改 .dash 文件后验证。
khonsu check overview.dash --db graphs/demo
# 使用第一条命令返回的真实评论 ID。
khonsu comments overview.dash --reply c1 --text "已更新关系图面板" --resolve
khonsu presence overview.dash --doing idle
```

应用打开图时，只读查询和 `check` 通过窗口执行，返回 `via_window: true`。不要删除锁文件强行写入。参阅[常见问题](./troubleshooting)。
