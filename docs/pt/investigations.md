---
description: Trace caminhos por um grafo com khonsu graph explore, cite a evidência por trás de cada registro, salve uma investigação e reverifique-a depois que os dados mudarem.
---
# Investigações

Uma investigação segue relacionamentos de um ponto de partida até uma resposta: qual caminho leva da internet até esta instância, o que um serviço com falha derruba junto, quem está por trás de uma empresa. O KhonsuGraph mantém quatro coisas separadas para que a resposta possa ser verificada depois: o caminho, a evidência de cada registro nele, a investigação salva e o que mudou no grafo desde então.

Esses comandos chegaram no KhonsuGraph 0.3.0. Execute `khonsu --version` para ver o que você tem.

## Siga um caminho {#explore}

`khonsu graph explore` explora a partir de um ou mais nós sem carregar o grafo inteiro. Na janela, a mesma exploração é o **Path Explorer** em uma tela de grafo.

```sh
khonsu graph explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` e `--to` aceitam um `khonsu_id` (o ID estável que todo registro sincronizado carrega) ou um ID numérico de nó. Os IDs acima são ilustrativos, de um grafo AWS como o dos [exemplos](./examples#aws-exposure); leia os seus com uma consulta como `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5`.

| Opção | Significado | Padrão |
| --- | --- | --- |
| `--from NODE` | Um nó de partida. Repita para vários | Obrigatório |
| `--to NODE` | Relata um caminho com o menor número de saltos até este nó entre o que a exploração encontrou | Nenhum |
| `--direction out\|in\|both` | No sentido das setas, contra elas, ou ambos | `out` |
| `--type A,B` | Segue apenas estes tipos de relacionamento | Todos os tipos |
| `--max-hops N` | Passos a partir de um início, no máximo 16 | 3 |
| `--max-nodes N` | Nós retornados, no máximo 2.000 | 200 |
| `--max-edges N` | Relacionamentos retornados, no máximo 5.000 | 500 |

Cada salto na saída tem um `text` como `Internet -[ROUTES_TO]-> shop`. Leia `complete` primeiro. Quando ele é false, `limits` indica o limite que interrompeu a exploração, então um caminho ausente significa "não dentro destes limites", não "nenhum caminho". Um valor acima de um teto é recusado em vez de reduzido.

Um caminho é um candidato encontrado nos dados. Ele não é prova de que algo possa ser alcançado, e a ausência de um caminho não é prova de segurança.

## Evidência {#evidence}

`khonsu graph evidence` informa o que sustenta um nó ou um relacionamento: qual origem e plugin o gravou, quando ele mudou pela última vez e se a última sincronização dessa origem foi completa.

```sh
khonsu graph evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| Campo | Significado |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` ou `rel:<khonsu_id>`. Cite-o quando relatar um achado |
| `source`, `plugin` | O que gravou o registro |
| `record_written_at` | Quando o registro mudou pela última vez, não quando foi visto pela última vez |
| `source_last_successful_sync` | Desconhecido quando a última sincronização da origem falhou |
| `source_coverage` | A última execução da origem: `complete`, `partial`, `failed` ou `cancelled`, e eventuais lacunas |
| `assertion` | `explicit` (uma origem o informou), `derived` ou `unknown` |
| `properties`, `redacted` | As próprias propriedades do registro, e os nomes mascarados como possíveis segredos |

Um campo de procedência ou é conhecido com um valor, ou explicitamente desconhecido; nada é estimado. Com `--to`, `khonsu graph explore` acrescenta `path.evidence`, um registro derivado que lista os IDs de evidência nos quais o caminho se apoia.

O quão fortemente um relacionamento é conhecido é uma convenção nas próprias propriedades. `confidence` é `confirmed`, `inferred` ou `unconfirmed`, e `evidence` diz o que o mostrou. Um caminho é tão forte quanto seu salto mais fraco: um relacionamento `unconfirmed` torna o caminho não confirmado.

## Análises de plugin {#plugin-analyses}

Um plugin pode trazer regras para o próprio domínio. `khonsu plugin describe ID` as lista, e `khonsu plugin analyze` executa uma:

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

A análise `exposure` da AWS retorna achados com um veredito `potential_exposure`, `insufficient_data` ou `not_indicated`. Cada achado nomeia sua regra, as condições que verificou com os campos por trás delas, o que não pôde ser avaliado (`unknowns`), o que a regra não lê (`assumptions`) e um `walk` que você pode passar para `khonsu graph explore`. Um achado descreve configuração. Ele não diz que um recurso é alcançável, ou seguro.

## Investigações salvas {#saved-investigations}

Uma investigação salva guarda, em um arquivo próprio, os pontos de partida e filtros de uma exploração, o caminho que você escolheu, uma consulta e um painel. Salvar não grava nada no grafo.

```sh
khonsu investigate save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigate reopen web.investigation
```

Reabrir executa a exploração de novo no grafo como ele está agora e diz como isso difere de quando foi salvo. Leia `graph_state` primeiro:

| `graph_state` | Significado |
| --- | --- |
| `unchanged` | O grafo contém o que continha quando foi salvo |
| `changed` | Algo difere. `differences` mostra o que consegue, e não é uma lista completa |
| `not_compared` | O grafo tem mais de 200.000 nós ou relacionamentos, então não foi submetido a hash, e as contagens coincidem |

Uma resposta alterada nunca substitui a salva silenciosamente. `path_same` diz se o caminho ainda se apoia nos mesmos registros. `missing_seeds` e `target_missing` nomeiam registros salvos que desapareceram. `unsure` lista registros encontrados apenas por um ID interno em um grafo alterado. `incomplete_sources` nomeia origens cuja última sincronização não foi completa.

Uma nova sincronização que não muda nada deixa o grafo `unchanged`: a comparação cobre rótulos, tipos, extremidades e propriedades, e deixa de fora IDs internos e horários de sincronização.

O arquivo é JSON. Ele guarda o caminho do grafo, IDs de fontes de dados, IDs estáveis de registros e filtros. Nunca guarda configuração de origem nem credenciais. O caminho do grafo pode incluir um nome de usuário, então verifique-o antes de compartilhar um arquivo.

## Snapshots e diferenças {#snapshots}

Um snapshot guarda os registros de um grafo em um arquivo, por ID estável, para que você possa perguntar depois o que mudou. Snapshots são tirados manualmente; nada tira um quando uma sincronização roda.

```sh
khonsu graph snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu graph snapshot save tuesday.snapshot.json --db graphs/aws
khonsu graph snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu graph snapshot check monday.snapshot.json --db graphs/aws
```

| Lista | Significado |
| --- | --- |
| `added` | Apenas no snapshot posterior |
| `removed` | Desapareceu, e a última sincronização da origem foi completa no snapshot posterior |
| `not_seen` | Ausente no snapshot posterior, sem nada que mostre que a origem foi lida por completo. Pode ainda existir |
| `changed` | O mesmo ID estável com propriedades, rótulos ou extremidades diferentes |

Um registro só é `removed` quando o snapshot posterior pode comprovar isso. Depois de uma sincronização parcial ou com falha, ele permanece em `not_seen`, e `warnings` diz por quê.

Um snapshot não guarda o caminho do grafo, configuração de origem nem credenciais, e tudo que parece segredo é mascarado. Ele guarda as outras propriedades dos seus dados, então trate o arquivo como trataria o grafo.

## Na janela

Selecione um nó em uma tela de grafo e use o **Path Explorer** para explorar a partir dele. **Save investigation…** mantém os filtros atuais, os pontos de partida da última exploração, o caminho até o nó selecionado e a consulta da aba. **Graph > Open investigation…**, ou `khonsu open web.investigation`, reabre uma em uma nova aba. Tudo que difere de quando foi salvo aparece como um aviso na tela.

## Limites

- `khonsu graph explore` e `khonsu investigate` precisam do grafo livre. Eles falham com o tipo `locked` enquanto a janela o tem aberto; use o Path Explorer na janela em vez disso.
- Um grafo com mais de 200.000 nós ou relacionamentos não pode receber snapshot e falha com o tipo `too_large`.
- Registros gravados à mão não têm ID estável. Eles são contados, mas não entram na comparação de diferenças.
- A janela ainda não tem uma visão de snapshot ou de diferenças.

A [referência da CLI](./cli) lista todos os comandos. Para centralidade, comunidades e caminhos mais curtos sobre o grafo inteiro, veja [análise de grafos](./analysis).
