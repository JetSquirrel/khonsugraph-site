---
description: 用纯文本 .dash 文件编写关系图仪表盘，并与 Agent 协作审阅。
---
# 仪表盘

`.dash` 是纯文本文件，包含命名查询、图表和筛选器。它读取应用当前打开的图。数据通过插件单独导入，格式中没有 `source` 块。

## 第一个关系图面板

完成[快速开始](./getting-started)后，将以下内容保存为 `overview.dash`：

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check` 只读执行每条查询，验证图表列，并使用真实值测试筛选器。打开或分享仪表盘前，请修复所有报错。

## 图表与布局

支持 `table`、`bar`、`line`、`area`、`scatter`、`pie`、`map`、`card`、`text` 和 `graph`。`width` 占用 1–12 列。关系图查询需要返回完整节点和关系；`caption` 指定显示为节点标签的属性，`group` 可以按属性分组。

## 联动筛选

表格行、柱形或图节点都可以驱动筛选器。以下片段中，表格查询返回 `service`，另一条查询使用 `WHERE $service`：

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

占位符必须是完整的 `WHERE` 条件，可通过 `AND` 连接。Cypher 查询用 `match` 指定的表达式与选中值比较；SQL 查询直接比较该列，不需要 `match`。未选择值时移除该条件；筛选来源图表不会过滤自身。[仓库示例](./examples)包含完整的关联查询和图表。

## 与 Agent 一起审阅

在应用里对具体图表评论。Agent 读取评论、编辑文件、执行 `check` 并回复。评论保存在仪表盘旁的 `FILE.comments.json`。Presence 可以标出 Agent 正在编辑的图表，窗口会在文件变化后重绘。

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

该格式不支持任意函数、条件语句或数据驱动样式。审阅命令请参阅 [CLI 与 Agent](./cli)。
