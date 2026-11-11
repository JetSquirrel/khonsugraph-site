---
description: Run PageRank, betweenness, Louvain communities, connected components, k-core and shortest paths on a local graph with khonsu analyze.
---
# Graph analysis

A Cypher query answers what you ask about named patterns. `khonsu analyze` answers questions about the shape of the graph: which node is most central, which groups form, how two nodes connect. It computes in memory and follows networkx's definitions, so results match networkx on the same graph.

```sh
khonsu analyze summary --db graphs/audit
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu analyze communities --db graphs/investigation
```

Start with `summary` on an unfamiliar graph.

## Algorithms

| Command | Answers | Options |
| --- | --- | --- |
| `summary` | Size, density, components, clustering, largest core and diameter | |
| `degree` | Which nodes have the most relationships | `--top N` |
| `pagerank` | Which nodes the rest of the graph points to | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | Which nodes sit on the most shortest paths | `--sample K` |
| `closeness` | Which nodes are the fewest hops from everything else | `--undirected` |
| `components` | Which parts of the graph are disconnected | `--strong` |
| `communities` | Which groups are densely connected (Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | How often a node's neighbors know each other | |
| `kcore` | The densely connected core of the graph | |
| `path` | The shortest path between two nodes | `--from ID --to ID` |

`path` takes numeric node IDs: return `id(n)` from a query, or read `_id` in a result.

## Choose the subgraph

By default an algorithm reads the whole graph. Narrow it three ways:

```sh
khonsu analyze betweenness --db graphs/sre --label Service
khonsu analyze pagerank --db graphs/audit --type TRUSTS
khonsu analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` keeps nodes with those labels and the relationships between them.
- `--type` keeps those relationships and, without `--label`, only the nodes they join.
- `--cypher` analyzes exactly the nodes and relationships a query returns whole.

Relationships are directed unless you pass `--undirected`. Clustering, cores and communities always read them both ways. `--weight PROP` reads a numeric relationship property as weight for PageRank, or as length for paths, betweenness and closeness. A missing value counts as 1.

## Output

Every run prints one JSON object with `algorithm`, the `graph` it read (`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms` and `rows`.

Node rows are `{id, labels, name, <score>}`, best first, limited by `--top`. `components` and `communities` return groups with their `size` and first ten `members`; communities add `modularity`. `path` returns `found`, `hops`, `length` and the path's nodes.

Betweenness is exact up to 5,000 nodes and sampled from 500 sources above that. `sampled_sources` is null when the result is exact; say so when you report a sampled result.

## Analysis or Cypher?

Cypher has `shortestPath` and `allShortestPaths` between two bound nodes; see [Cypher & SQL](./queries). Use `khonsu analyze path` when the path should respect a weight, and the other algorithms when the question is about the whole graph rather than one pattern. To walk outward from a node with caps on hops and size, use [`khonsu explore`](./investigations#explore).
