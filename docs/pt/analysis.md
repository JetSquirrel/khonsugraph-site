---
description: Execute PageRank, betweenness, comunidades de Louvain, componentes conectados, k-core e caminhos mais curtos em um grafo local com khonsu graph analyze.
---
# Análise de grafos

Uma consulta Cypher responde ao que você pergunta sobre padrões nomeados. `khonsu graph analyze` responde a perguntas sobre a forma do grafo: qual nó é mais central, que grupos se formam, como dois nós se conectam. Ele calcula em memória e segue as definições do networkx, então os resultados coincidem com o networkx no mesmo grafo.

```sh
khonsu graph analyze summary --db graphs/audit
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu graph analyze communities --db graphs/investigation
```

Comece com `summary` em um grafo desconhecido.

## Algoritmos

| Comando | Responde | Opções |
| --- | --- | --- |
| `summary` | Tamanho, densidade, componentes, agrupamento, maior núcleo e diâmetro | |
| `degree` | Quais nós têm mais relacionamentos | `--top N` |
| `pagerank` | Para quais nós o resto do grafo aponta | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | Quais nós ficam no maior número de caminhos mais curtos | `--sample K` |
| `closeness` | Quais nós estão a menos saltos de todo o resto | `--undirected` |
| `components` | Quais partes do grafo estão desconectadas | `--strong` |
| `communities` | Quais grupos são densamente conectados (Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | Com que frequência os vizinhos de um nó se conhecem | |
| `kcore` | O núcleo densamente conectado do grafo | |
| `path` | O caminho mais curto entre dois nós | `--from ID --to ID` |

`path` aceita IDs numéricos de nó: retorne `id(n)` de uma consulta, ou leia `_id` em um resultado.

## Escolha o subgrafo

Por padrão, um algoritmo lê o grafo inteiro. Restrinja-o de três maneiras:

```sh
khonsu graph analyze betweenness --db graphs/sre --label Service
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS
khonsu graph analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` mantém os nós com esses rótulos e os relacionamentos entre eles.
- `--type` mantém esses relacionamentos e, sem `--label`, apenas os nós que eles unem.
- `--cypher` analisa exatamente os nós e relacionamentos que uma consulta retorna inteiros.

Relacionamentos são direcionados a menos que você passe `--undirected`. Agrupamento, núcleos e comunidades sempre os leem nos dois sentidos. `--weight PROP` lê uma propriedade numérica de relacionamento como peso para o PageRank, ou como comprimento para caminhos, betweenness e closeness. Um valor ausente conta como 1.

## Saída

Cada execução imprime um objeto JSON com `algorithm`, o `graph` lido (`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms` e `rows`.

As linhas de nó são `{id, labels, name, <score>}`, melhores primeiro, limitadas por `--top`. `components` e `communities` retornam grupos com seu `size` e os dez primeiros `members`; comunidades acrescentam `modularity`. `path` retorna `found`, `hops`, `length` e os nós do caminho.

O betweenness é exato até 5.000 nós e amostrado a partir de 500 origens acima disso. `sampled_sources` é null quando o resultado é exato; diga isso ao relatar um resultado amostrado.

## Análise ou Cypher?

O Cypher tem `shortestPath` e `allShortestPaths` entre dois nós vinculados; veja [Cypher e SQL](./queries). Use `khonsu graph analyze path` quando o caminho precisar respeitar um peso, e os outros algoritmos quando a pergunta for sobre o grafo inteiro e não sobre um padrão. Para explorar a partir de um nó com limites de saltos e tamanho, use [`khonsu graph explore`](./investigations#explore).
