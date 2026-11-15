---
description: khonsu analyze로 로컬 그래프에서 PageRank, 매개 중심성, Louvain 커뮤니티, 연결 요소, k-core, 최단 경로를 실행합니다.
---
# 그래프 분석

Cypher 쿼리는 이름 붙인 패턴에 관한 질문에 답합니다. `khonsu analyze`는 그래프의 형태에 대한 질문에 답합니다. 어떤 노드가 가장 중심에 있는지, 어떤 그룹이 형성되는지, 두 노드가 어떻게 연결되는지입니다. 메모리에서 계산하고 networkx의 정의를 따르므로, 같은 그래프에서 networkx와 결과가 일치합니다.

```sh
khonsu analyze summary --db graphs/audit
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu analyze communities --db graphs/investigation
```

익숙하지 않은 그래프에서는 `summary`로 시작하십시오.

## 알고리즘

| 명령 | 답하는 질문 | 옵션 |
| --- | --- | --- |
| `summary` | 크기, 밀도, 연결 요소, 클러스터링, 가장 큰 코어, 지름 | |
| `degree` | 어떤 노드가 관계를 가장 많이 가지는지 | `--top N` |
| `pagerank` | 그래프의 나머지가 어떤 노드를 가리키는지 | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | 어떤 노드가 가장 많은 최단 경로 위에 있는지 | `--sample K` |
| `closeness` | 어떤 노드가 다른 모든 노드에서 가장 적은 홉에 있는지 | `--undirected` |
| `components` | 그래프의 어느 부분이 분리되어 있는지 | `--strong` |
| `communities` | 어떤 그룹이 밀도 높게 연결되어 있는지(Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | 한 노드의 이웃들이 서로 아는 빈도 | |
| `kcore` | 그래프의 밀도 높은 코어 | |
| `path` | 두 노드 사이의 최단 경로 | `--from ID --to ID` |

`path`는 숫자 노드 ID를 받습니다. 쿼리에서 `id(n)`을 반환하거나 결과의 `_id`를 읽으십시오.

## 하위 그래프 선택하기

기본적으로 알고리즘은 그래프 전체를 읽습니다. 세 가지 방법으로 범위를 좁힐 수 있습니다.

```sh
khonsu analyze betweenness --db graphs/sre --label Service
khonsu analyze pagerank --db graphs/audit --type TRUSTS
khonsu analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label`은 해당 레이블을 가진 노드와 그들 사이의 관계를 유지합니다.
- `--type`은 해당 관계를 유지하며, `--label`이 없으면 그 관계가 연결하는 노드만 유지합니다.
- `--cypher`는 쿼리가 전체로 반환하는 노드와 관계를 정확히 분석합니다.

관계는 `--undirected`를 넘기지 않는 한 방향성을 가집니다. 클러스터링, 코어, 커뮤니티는 항상 양방향으로 읽습니다. `--weight PROP`은 숫자 관계 속성을 PageRank의 가중치로, 또는 경로, 매개 중심성, 근접 중심성의 길이로 읽습니다. 값이 없으면 1로 계산합니다.

## 출력

모든 실행은 `algorithm`, 읽은 `graph`(`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms`, `rows`를 담은 JSON 객체 하나를 출력합니다.

노드 행은 `{id, labels, name, <score>}`이며 점수가 좋은 순서이고 `--top`으로 제한됩니다. `components`와 `communities`는 `size`와 처음 열 개의 `members`를 가진 그룹을 반환하며, 커뮤니티는 `modularity`를 추가합니다. `path`는 `found`, `hops`, `length`와 경로의 노드를 반환합니다.

매개 중심성은 5,000개 노드까지 정확하며, 그 이상에서는 500개 소스에서 샘플링합니다. 결과가 정확하면 `sampled_sources`가 null이며, 샘플링한 결과를 보고할 때는 그 사실을 밝히십시오.

## 분석 또는 Cypher?

Cypher에는 바인딩된 두 노드 사이의 `shortestPath`와 `allShortestPaths`가 있습니다. [Cypher & SQL](./queries)을 참고하십시오. 경로가 가중치를 존중해야 할 때는 `khonsu analyze path`를 사용하고, 질문이 하나의 패턴이 아니라 그래프 전체에 대한 것일 때는 다른 알고리즘을 사용하십시오. 홉 수와 크기에 상한을 두고 노드에서 바깥으로 걸어가려면 [`khonsu explore`](./investigations#explore)를 사용하십시오.
