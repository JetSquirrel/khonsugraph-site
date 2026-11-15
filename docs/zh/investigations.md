---
description: 用 khonsu explore 追踪路径，查看每条记录背后的证据，保存调查，并在数据变化后复查结论。
---
# 调查

一次调查，是从某个起点沿着关系找到答案：哪条路径从互联网通向这台实例，一个服务故障会波及哪些服务，谁站在一家公司背后。KhonsuGraph 把四件事分开保存，方便日后复查：路径、路径上每条记录的证据、保存下来的调查，以及此后图里发生的变化。

这些命令从 KhonsuGraph 0.3.0 开始提供。运行 `khonsu --version` 查看当前版本。

## 追踪路径 {#explore}

`khonsu explore` 从一个或多个节点向外探索，不需要加载整张图。在窗口中，同样的操作是图画布上的 **Path Explorer**。

```sh
khonsu explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` 和 `--to` 接受 `khonsu_id`（每条同步记录都带有的稳定 ID）或数字节点 ID。上面的 ID 仅作示意，取自类似[示例](./examples#aws-exposure)中的 AWS 图；可以用 `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5` 这样的查询读取自己图中的 ID。

| 选项 | 含义 | 默认值 |
| --- | --- | --- |
| `--from NODE` | 起点，可重复指定多个 | 必填 |
| `--to NODE` | 在探索结果中给出通往该节点的最少跳数路径 | 无 |
| `--direction out\|in\|both` | 顺着箭头、逆着箭头，或两个方向 | `out` |
| `--type A,B` | 只沿这些关系类型探索 | 所有类型 |
| `--max-hops N` | 距离起点的步数，最多 16 | 3 |
| `--max-nodes N` | 返回的节点数，最多 2,000 | 200 |
| `--max-edges N` | 返回的关系数，最多 5,000 | 500 |

输出中的每一跳都有一段 `text`，例如 `Internet -[ROUTES_TO]-> shop`。请先看 `complete`：为 false 时，`limits` 会指出是哪个上限截断了探索，所以没找到路径只表示“在这些上限内没有”，而不是“不存在路径”。超过上限的取值会被拒绝，不会自动下调。

路径是在数据中找到的候选结果，不能证明目标一定可达；没有路径也不能证明安全。

## 证据 {#evidence}

`khonsu evidence` 说明一个节点或一条关系的依据：由哪个数据源和插件写入，最后一次变化的时间，以及该数据源上次同步是否完整。

```sh
khonsu evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| 字段 | 含义 |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` 或 `rel:<khonsu_id>`。报告结论时请引用它 |
| `source`、`plugin` | 写入这条记录的数据源和插件 |
| `record_written_at` | 记录最后一次变化的时间，不是最后一次被看到的时间 |
| `source_last_successful_sync` | 数据源上次同步失败时为未知 |
| `source_coverage` | 数据源最近一次运行：`complete`、`partial`、`failed` 或 `cancelled`，以及缺口 |
| `assertion` | `explicit`（数据源直接报告）、`derived`（推导得出）或 `unknown` |
| `properties`、`redacted` | 记录自身的属性，以及因疑似密钥而被遮盖的属性名 |

来源字段要么是带值的已知，要么明确标为未知，不做估计。使用 `--to` 时，`khonsu explore` 会附带 `path.evidence`，列出这条路径所依赖的证据 ID。

一条关系的可信程度，按约定写在它自己的属性里：`confidence` 取 `confirmed`、`inferred` 或 `unconfirmed`，`evidence` 说明依据是什么。路径的可信度取决于最弱的一跳：只要有一条 `unconfirmed` 的关系，整条路径就是未确认的。

## 插件分析 {#plugin-analyses}

插件可以自带所在领域的规则。`khonsu plugin describe ID` 列出这些分析，`khonsu plugin analyze` 运行其中一项：

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

AWS 的 `exposure` 分析返回的每条发现带有结论：`potential_exposure`、`insufficient_data` 或 `not_indicated`。每条发现都会列出所用规则、检查过的条件及其依据字段、无法判断的部分（`unknowns`）、规则没有读取的内容（`assumptions`），以及可以直接交给 `khonsu explore` 的 `walk`。发现描述的是配置情况，并不代表资源一定可达或一定安全。

## 保存调查 {#saved-investigations}

保存的调查是一个独立文件，记录探索的起点和筛选条件、选定的路径、一条查询和一个仪表盘。保存不会向图中写入任何内容。

```sh
khonsu investigation save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigation reopen web.investigation
```

重新打开时，会在当前的图上再执行一次探索，并说明与保存时有何不同。请先看 `graph_state`：

| `graph_state` | 含义 |
| --- | --- |
| `unchanged` | 图的内容与保存时一致 |
| `changed` | 有变化。`differences` 给出能说明的部分，但不是完整清单 |
| `not_compared` | 图超过 200,000 个节点或关系，没有计算指纹，但数量一致 |

变化后的答案不会悄悄替换保存的答案。`path_same` 说明路径是否仍然依赖同一批记录；`missing_seeds` 和 `target_missing` 列出已经消失的记录；`unsure` 列出在已变化的图上只能通过内部 ID 找到的记录；`incomplete_sources` 列出上次同步不完整的数据源。

没有带来变化的重新同步，图仍然是 `unchanged`：比较范围包括标签、类型、端点和属性，不包括内部 ID 和同步时间。

文件是 JSON 格式，包含图的路径、数据源 ID、稳定记录 ID 和筛选条件，不包含数据源配置或凭据。图的路径中可能带有用户名，分享文件前请检查。

## 快照与差异 {#snapshots}

快照按稳定 ID 把图中的记录保存到文件，方便以后回答“什么变了”。快照需要手动创建，同步时不会自动生成。

```sh
khonsu snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu snapshot save tuesday.snapshot.json --db graphs/aws
khonsu snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu snapshot check monday.snapshot.json --db graphs/aws
```

| 列表 | 含义 |
| --- | --- |
| `added` | 只出现在较新的快照中 |
| `removed` | 已经消失，并且较新快照中该数据源的上次同步是完整的 |
| `not_seen` | 较新的快照中没有，但无法确认数据源被完整读取。它可能仍然存在 |
| `changed` | 稳定 ID 相同，但属性、标签或端点不同 |

只有较新的快照能够证明时，记录才会被列为 `removed`。同步不完整或失败后，它会留在 `not_seen` 中，`warnings` 会说明原因。

快照不包含图的路径、数据源配置或凭据，疑似密钥的内容会被遮盖。但它包含数据的其他属性，请像对待图本身一样保管这个文件。

## 在窗口中

在图画布上选中一个节点，用 **Path Explorer** 从它开始探索。**Save investigation…** 会保存当前筛选条件、上一次探索的起点、通往所选节点的路径以及当前标签页的查询。**Graph > Open investigation…** 或 `khonsu open web.investigation` 会在新标签页中重新打开调查。与保存时不同的地方会以警告的形式显示在画布上。

## 限制

- `khonsu explore` 和 `khonsu investigation` 需要图没有被占用。窗口打开该图时，它们会以 `locked` 失败，此时请使用窗口中的 Path Explorer。
- 超过 200,000 个节点或关系的图无法创建快照，会以 `too_large` 失败。
- 手动写入的记录没有稳定 ID，在差异中只计数，不做比较。
- 窗口中暂时没有快照和差异视图。

所有命令见 [CLI 参考](./cli)。需要在整张图上计算中心性、社区和最短路径时，见[图分析](./analysis)。
