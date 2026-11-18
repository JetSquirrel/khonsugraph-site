---
description: Consulte um grafo local em Cypher e tabelas em SQL PostgreSQL. Cláusulas Cypher suportadas, caminhos mais curtos, parâmetros e limites atuais do HawDB.
---
# Cypher e SQL

## Inspecione antes de consultar

```sh
khonsu schema --db graphs/demo
```

O resultado lista rótulos, tipos de relacionamento, nomes de propriedades, contagens, padrões de relacionamento e tabelas SQL. Use esses nomes em vez de supor o esquema de outro grafo.

## Retorne conexões

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

Retornar nós e relacionamentos inteiros fornece tanto valores de tabela quanto elementos de grafo. Retornar apenas `a.name` dá uma coluna escalar, não um grafo conectado. Na CLI, elementos de grafo aparecem em um objeto `graph` separado.

O Cypher suporta `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE` e padrões de comprimento variável limitados. Com `--write`, `CREATE`, `MERGE`, `SET`, `DELETE` e `DETACH DELETE` também ficam disponíveis. Por exemplo, com um grafo de serviços:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Isso retorna os nós das extremidades. Consulte relacionamentos de um salto separadamente para desenhar as conexões intermediárias.

## Caminhos mais curtos

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)` e `relationships(p)` também funcionam. As duas extremidades precisam estar vinculadas por um mapa de propriedades, um `WHERE` ou uma cláusula anterior. Retornar `p` desenha o caminho na tela. Um `*` sem limite para em 256 saltos e falha, em vez de informar que não existe caminho.

Para explorar a partir de um nó com limites de saltos e tamanho, use [`khonsu graph explore`](./investigations#explore). Para caminhos ponderados, centralidade e comunidades, veja [análise de grafos](./analysis).

## SQL e parâmetros

Consultas SQL operam em tabelas no mesmo diretório do HawDB, usando SQL no dialeto PostgreSQL. Uma importação de grafo não implica uma tabela SQL com o mesmo nome. Inspecione o `schema` primeiro. O exemplo a seguir exige uma tabela `assets`:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Os valores de `-p` são interpretados como JSON quando possível, caso contrário como strings. SQL usa parâmetros posicionais (`$1` com `-p 1=value`).

## Limitações atuais {#current-limitations}

O KhonsuGraph 0.3.0 usa o HawDB 0.29.0, cujo Cypher difere de outros bancos de grafo:

- `labels()`, `keys()`, `properties()`, `CALL db.*` e `SHOW` não são suportados. Use `khonsu schema` para metadados.
- `count`, `sum`, `collect`, `min`, `max` e `avg` são os agregados suportados, também sobre expressões.
- Uma leitura começa com `MATCH` ou `UNWIND`. Um `RETURN 1` sozinho não é analisado, e `OPTIONAL MATCH` não pode ser a primeira cláusula.
- Padrões de comprimento variável exigem um tipo de relacionamento e nenhuma variável de relacionamento. Um padrão de relacionamento sem tipo funciona para apenas um salto.
- Variáveis de caminho funcionam apenas em `shortestPath` e `allShortestPaths`.
- Strings não podem ser concatenadas com `+`, e `toLower`, `toUpper`, `reduce`, `any`, `all`, `none` e `exists` não estão disponíveis.
- `CREATE` aceita um padrão por instrução. `LOAD CSV` está desativado; traga arquivos com uma [fonte de dados](./data-sources).
- `IN` escalar, compreensões de lista, `json_value()` sobre texto JSON, datas e durações, e `SET` de propriedade de relacionamento são suportados.
- Leituras têm um teto de execução de 100.000 linhas. `--max-rows` só limita as linhas exibidas após a execução, então use `LIMIT` na consulta também.
- Valores vetoriais são retornados como arrays JSON de números. As colunas voltam na ordem do `RETURN`; ainda assim, leia-as por nome.
- `WHERE true` funciona em Cypher, mas não em SQL.

Um grafo gravado antes do HawDB 0.25, pelo KhonsuGraph 0.2.0 ou anterior, não pode ser lido por esta versão; veja [solução de problemas](./troubleshooting#old-format).

## Verifique uma consulta ou pergunte com as palavras da ontologia {#semantic}

`--validate-only` verifica uma instrução Cypher contra os rótulos, tipos de relação e padrões do grafo e não executa nada: um rótulo com erro de digitação, uma relação seguida no sentido contrário ou um padrão que o grafo não tem é relatado com nomes próximos. `--semantic` permite que uma consulta use conceitos como `Device` e `Account` em vez dos rótulos de uma fonte. Ambos chegam na versão seguinte à 0.3.0; veja [ontologia](./ontology#semantic).

## Acesso de leitura e gravação

As consultas da CLI são somente leitura por padrão. `--write` habilita gravações explicitamente. Um processo é dono de um diretório de grafo por vez. Enquanto o app tem o grafo aberto, as consultas de leitura da CLI e as verificações de painel passam por aquela janela. Gravações e sincronizações exigem o grafo fechado ali.

Uma instrução executada com `--write` não está em nenhuma fonte de dados, então `khonsu graph rebuild` não a preserva. A partir da versão seguinte à 0.3.0, cada uma é registrada em `writes.jsonl` na pasta de configuração (quando, qual grafo, a instrução com o material de chaves mascarado e o agente que a executou), para que possa ser encontrada e escrita de novo.
