---
description: 用 Cypher 查询本地图、用 PostgreSQL SQL 查询表。支持的 Cypher 子句、最短路径、参数与 HawDB 当前限制。
---
# Cypher 与 SQL

## 先查看 Schema

```sh
khonsu schema --db graphs/demo
```

结果列出标签、关系类型、属性、数量、关系模式与 SQL 表。请依据实际名称查询，不要假定不同图使用相同 Schema。

## 返回完整连接

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

返回完整节点与关系可以同时提供表格值和图元素。只返回 `a.name` 会得到标量列，而不是连接图。CLI 会在独立的 `graph` 对象中提供图元素。

Cypher 支持 `MATCH`、`OPTIONAL MATCH`、`WHERE`、`RETURN [DISTINCT]`、`ORDER BY`、`SKIP`、`LIMIT`、`WITH`、`UNWIND`、`CASE` 和有界变长模式。使用 `--write` 时还可以执行 `CREATE`、`MERGE`、`SET`、`DELETE` 和 `DETACH DELETE`。例如在服务关系图中：

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

这会返回端点。要绘制中间的连接，请另外查询单跳关系。

## 最短路径

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

同样支持 `allShortestPaths`、`nodes(p)` 和 `relationships(p)`。两个端点都必须通过属性、`WHERE` 或前面的子句确定。返回 `p` 会在画布上画出这条路径。不设上限的 `*` 在 256 跳处停止并报错，而不是报告没有路径。

需要从一个节点向外探索并限制跳数和规模时，使用 [`khonsu explore`](./investigations#explore)。带权路径、中心性和社区发现见[图分析](./analysis)。

## SQL 与参数

SQL 使用 PostgreSQL 方言，查询同一 HawDB 目录中的表。导入图节点不代表存在同名 SQL 表，请先查看 `schema`。下方 SQL 示例需要已有 `assets` 表：

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` 的值可以解析为 JSON 时按 JSON 处理，否则作为字符串。SQL 使用位置参数，例如 `$1` 对应 `-p 1=value`。

## 当前限制 {#current-limitations}

KhonsuGraph 0.3.0 使用 HawDB 0.29.0，它的 Cypher 与其他图数据库有所不同：

- 不支持 `labels()`、`keys()`、`properties()`、`CALL db.*` 和 `SHOW`。使用 `khonsu schema` 查看元数据。
- 支持 `count`、`sum`、`collect`、`min`、`max` 和 `avg` 聚合，也可以作用于表达式。
- 读取查询以 `MATCH` 或 `UNWIND` 开头。单独的 `RETURN 1` 无法解析，`OPTIONAL MATCH` 不能作为第一个子句。
- 变长模式必须指定关系类型，不能使用关系变量。不指定类型的关系模式只支持一跳。
- 路径变量只能用于 `shortestPath` 和 `allShortestPaths`。
- 不能用 `+` 拼接字符串，也没有 `toLower`、`toUpper`、`reduce`、`any`、`all`、`none` 和 `exists`。
- `CREATE` 每条语句只接受一个模式。`LOAD CSV` 已关闭，请通过[数据源](./data-sources)导入文件。
- 支持标量 `IN`、列表推导、JSON 文本的 `json_value()`、日期与时长，以及关系属性 `SET`。
- 读取执行上限为 100,000 行。`--max-rows` 只限制执行后的显示行数，因此仍应在查询中使用 `LIMIT`。
- 向量返回为 JSON 数字数组。结果列按 `RETURN` 的顺序返回，但仍应按列名读取。
- `WHERE true` 在 Cypher 中可用，在 SQL 中不可用。

HawDB 0.25 之前写入的图（由 KhonsuGraph 0.2.0 及更早版本创建）无法被当前版本读取，见[常见问题](./troubleshooting#old-format)。

## 读写访问

CLI 查询默认只读，`--write` 显式启用写入。同一时间只有一个进程拥有图目录。应用打开图时，CLI 只读查询和仪表盘检查通过该窗口执行。写入与同步前需要在应用中关闭该图。
