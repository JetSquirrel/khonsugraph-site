---
description: khonsu analyze で、ローカルのグラフに対して PageRank、媒介中心性、Louvain コミュニティ、連結成分、k-core、最短経路を実行します。
---
# グラフ分析

Cypher クエリは、名前を付けたパターンについて尋ねたことに答えます。`khonsu analyze` は、グラフの形についての問いに答えます。どのノードが最も中心的か、どのグループが形成されるか、2 つのノードがどうつながるか。計算はメモリ内で行い、networkx の定義に従うため、同じグラフであれば結果は networkx と一致します。

```sh
khonsu analyze summary --db graphs/audit
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu analyze communities --db graphs/investigation
```

慣れていないグラフでは、まず `summary` から始めてください。

## アルゴリズム

| コマンド | 答えること | オプション |
| --- | --- | --- |
| `summary` | サイズ、密度、連結成分、クラスタリング、最大のコア、直径 | |
| `degree` | どのノードが最も多くのリレーションシップを持つか | `--top N` |
| `pagerank` | グラフの残りがどのノードを指しているか | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | どのノードが最も多くの最短経路上にあるか | `--sample K` |
| `closeness` | どのノードが他のすべてから最小ホップ数にあるか | `--undirected` |
| `components` | グラフのどの部分が切断されているか | `--strong` |
| `communities` | どのグループが密に接続されているか(Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | ノードの隣接ノード同士が知り合いである頻度 | |
| `kcore` | グラフの密に接続されたコア | |
| `path` | 2 つのノード間の最短経路 | `--from ID --to ID` |

`path` は数値のノード ID を受け取ります。クエリから `id(n)` を返すか、結果の `_id` を読んでください。

## サブグラフを選ぶ

既定では、アルゴリズムはグラフ全体を読み取ります。3 つの方法で絞り込めます:

```sh
khonsu analyze betweenness --db graphs/sre --label Service
khonsu analyze pagerank --db graphs/audit --type TRUSTS
khonsu analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` は、それらのラベルを持つノードと、それらの間のリレーションシップを保持します。
- `--type` はそれらのリレーションシップを保持し、`--label` がなければ、それらが結ぶノードだけを保持します。
- `--cypher` は、クエリが丸ごと返すノードとリレーションシップだけを分析します。

`--undirected` を指定しない限り、リレーションシップは有向として扱われます。クラスタリング、コア、コミュニティは常に両方向に読み取ります。`--weight PROP` は、数値のリレーションシッププロパティを、PageRank では重みとして、経路、媒介中心性、近接中心性では長さとして読み取ります。値がない場合は 1 として扱われます。

## 出力

各実行は、`algorithm`、読み取った `graph`(`nodes`、`relationships`、`directed`、`weighted`)、`load_ms`、`elapsed_ms`、`rows` を持つ 1 つの JSON オブジェクトを出力します。

ノードの行は `{id, labels, name, <score>}` で、最良のものが先頭に来て、`--top` によって制限されます。`components` と `communities` は、`size` と最初の 10 個の `members` を持つグループを返します。コミュニティはさらに `modularity` を追加します。`path` は `found`、`hops`、`length`、および経路のノードを返します。

媒介中心性は 5,000 ノードまで正確で、それを超える場合は 500 のソースからサンプリングします。結果が正確な場合、`sampled_sources` は null です。サンプリングされた結果を報告する際は、その旨を伝えてください。

## 分析か Cypher か

Cypher には、バインドされた 2 つのノード間の `shortestPath` と `allShortestPaths` があります。[Cypher と SQL](./queries) を参照してください。経路が重みを尊重すべき場合は `khonsu analyze path` を使用し、問いが 1 つのパターンではなくグラフ全体に関するものである場合は他のアルゴリズムを使用してください。ホップ数とサイズに上限を設けてノードから外側へたどるには、[`khonsu explore`](./investigations#explore) を使用してください。
