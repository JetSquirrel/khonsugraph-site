---
description: 用 khonsu analyze 在本地图上运行 PageRank、介数中心性、Louvain 社区发现、连通分量、k-core 和最短路径。
---
# 图分析

Cypher 查询回答的是关于具体模式的问题。`khonsu analyze` 回答的是关于图整体结构的问题：哪个节点最核心，形成了哪些群体，两个节点如何相连。计算在内存中完成，算法定义与 networkx 一致，因此在同一张图上结果与 networkx 相同。

```sh
khonsu analyze summary --db graphs/audit
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu analyze communities --db graphs/investigation
```

面对一张不熟悉的图，先运行 `summary`。

## 算法

| 命令 | 回答的问题 | 选项 |
| --- | --- | --- |
| `summary` | 规模、密度、连通分量、聚类系数、最大核与直径 | |
| `degree` | 哪些节点的关系最多 | `--top N` |
| `pagerank` | 图中其他节点最终指向哪些节点 | `--alpha 0.85`、`--weight PROP` |
| `betweenness` | 哪些节点位于最多的最短路径上 | `--sample K` |
| `closeness` | 哪些节点到其他节点的跳数最少 | `--undirected` |
| `components` | 图的哪些部分互不连通 | `--strong` |
| `communities` | 哪些群体内部连接紧密（Louvain） | `--resolution 1.0`、`--seed 42` |
| `clustering` | 一个节点的邻居之间有多大比例彼此相连 | |
| `kcore` | 图中连接最紧密的核心 | |
| `path` | 两个节点之间的最短路径 | `--from ID --to ID` |

`path` 使用数字节点 ID：在查询中返回 `id(n)`，或读取结果中的 `_id`。

## 选择子图

默认情况下，算法读取整张图。可以用三种方式缩小范围：

```sh
khonsu analyze betweenness --db graphs/sre --label Service
khonsu analyze pagerank --db graphs/audit --type TRUSTS
khonsu analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` 保留带有这些标签的节点，以及它们之间的关系。
- `--type` 保留这些类型的关系；不带 `--label` 时，只保留这些关系连接的节点。
- `--cypher` 只分析查询完整返回的节点和关系。

关系默认有方向，除非使用 `--undirected`。聚类系数、k-core 和社区发现始终按无向处理。`--weight PROP` 读取关系上的数值属性：在 PageRank 中作为权重，在路径、介数和接近中心性中作为长度。缺失的值按 1 计算。

## 输出

每次运行输出一个 JSON 对象，包含 `algorithm`、读取的 `graph`（`nodes`、`relationships`、`directed`、`weighted`）、`load_ms`、`elapsed_ms` 和 `rows`。

节点行的格式是 `{id, labels, name, <分数>}`，按分数从高到低排列，数量由 `--top` 限定。`components` 和 `communities` 返回分组，带有 `size` 和前十个 `members`；社区发现还会给出 `modularity`。`path` 返回 `found`、`hops`、`length` 和路径上的节点。

节点数不超过 5,000 时，介数中心性是精确计算；超过时从 500 个源点采样。结果精确时 `sampled_sources` 为 null；报告采样结果时请说明这一点。

## 用图分析还是 Cypher？

Cypher 支持在两个已确定的节点之间使用 `shortestPath` 和 `allShortestPaths`，见 [Cypher 与 SQL](./queries)。路径需要考虑权重时使用 `khonsu analyze path`；问题针对整张图而不是某个模式时，使用其他算法。需要从一个节点向外探索并限制跳数和规模时，使用 [`khonsu explore`](./investigations#explore)。
