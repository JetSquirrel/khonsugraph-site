---
description: 使用 Cypher 查询关系、SQL 查询表，了解图画布与 HawDB 当前限制。
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

Cypher 支持 `MATCH`、`OPTIONAL MATCH`、`WHERE`、`RETURN [DISTINCT]`、`ORDER BY`、`SKIP`、`LIMIT`、`WITH` 和有界变长模式。使用 `--write` 时还可以执行 `CREATE`、`MERGE`、`SET`、`DELETE` 和 `DETACH DELETE`。例如在服务关系图中：

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

这会返回端点。要绘制中间的连接，请另外查询单跳关系。

## SQL 与参数

SQL 使用 PostgreSQL 方言，查询同一 HawDB 目录中的表。导入图节点不代表存在同名 SQL 表，请先查看 `schema`。下方 SQL 示例需要已有 `assets` 表：

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` 的值可以解析为 JSON 时按 JSON 处理，否则作为字符串。SQL 使用位置参数，例如 `$1` 对应 `-p 1=value`。

## 当前限制

已检查的源码使用 HawDB 0.12.0：

- 当前工作流不支持 Cypher `sum()`、`labels()`、`keys()`、`properties()`、`shortestPath`、路径变量、`CALL db.*` 和 `SHOW`。使用 `khonsu schema` 查看元数据。
- 支持 `count`、`collect`、`min`、`max` 和 `avg` 聚合。
- 变长模式必须指定关系类型，不能使用关系变量。
- `UNWIND` 后必须跟写入子句；不支持独立的只读 `UNWIND` 和 `WHERE true`。
- 支持 `OPTIONAL MATCH`、标量 `IN`、JSON 文本的 `json_value()`，以及关系属性 `SET`。
- 读取执行上限为 100,000 行。`--max-rows` 只限制执行后的显示行数，因此仍应在查询中使用 `LIMIT`。
- 向量返回为 JSON 数字数组。引擎可能调整结果列顺序，请按列名读取。

## 读写访问

CLI 查询默认只读，`--write` 显式启用写入。同一时间只有一个进程拥有图目录。应用打开图时，CLI 只读查询和仪表盘检查通过该窗口执行。写入与同步前需要在应用中关闭该图。
