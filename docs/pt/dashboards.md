---
description: Escreva painéis de grafo como arquivos .dash em texto simples e revise-os com um agente.
---
# Painéis

Um arquivo `.dash` é texto simples: consultas nomeadas, gráficos e filtros. Ele lê o grafo aberto no momento no app. Os dados são importados separadamente por plugins; não há bloco `source`.

## Seu primeiro painel de grafo

Depois de concluir [primeiros passos](./getting-started), salve isto como `overview.dash`:

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

`check` executa cada consulta em modo somente leitura, valida as colunas dos gráficos e testa filtros com valores reais. Corrija todo erro relatado antes de abrir ou compartilhar o painel.

## Gráficos e layout

Os tipos de gráfico incluem `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text` e `graph`. `width` ocupa de 1 a 12 colunas. Consultas de grafo retornam nós e relacionamentos inteiros; `caption` seleciona a propriedade do nó exibida como rótulo. `group` pode agrupar nós por uma propriedade.

## Filtros compartilhados

Uma linha de tabela, barra ou nó de grafo pode acionar um filtro. Neste exemplo, uma consulta de tabela retorna `service`, e outra consulta usa `WHERE $service`:

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

O placeholder precisa ser uma condição `WHERE` inteira, opcionalmente combinada com `AND`. Em Cypher, o valor escolhido é comparado com a expressão `match`; em SQL, ele é comparado com a própria coluna, então `match` não é necessário. Uma condição sem seleção é removida; o gráfico de origem não se filtra. Os [exemplos completos do repositório](./examples) incluem essas consultas e gráficos vinculados.

## Revise com um agente

Comente em um gráfico no app. Um agente lê os comentários, edita o arquivo, executa `check` e responde. Os comentários ficam ao lado do painel, em `FILE.comments.json`. A presença pode identificar os gráficos que o agente está editando, e a janela é redesenhada quando o arquivo muda.

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

O formato não tem funções arbitrárias, condicionais ou estilo dependente de dados. Veja [CLI e agentes](./cli) para os comandos de revisão.
