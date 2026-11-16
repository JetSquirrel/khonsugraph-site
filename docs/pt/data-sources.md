---
description: Transforme arquivos CSV, contas AWS e bancos Neo4j ou Cartography em um grafo local de nós e relacionamentos com plugins de fontes de dados.
---
# Fontes de dados

Plugins transformam um sistema externo em nós e relacionamentos. O KhonsuGraph executa o plugin como um processo separado e grava os registros no grafo.

## CSV

O plugin CSV integrado mapeia linhas para nós e relacionamentos. Escolha colunas de ID, origem e destino estáveis; as demais colunas viram propriedades. Valores numéricos e booleanos são inferidos por padrão. Defina `infer_types=false` para manter texto.

Veja a importação completa em [primeiros passos](./getting-started). Para rótulos de nó ou tipos de relacionamento mistos, use a configuração JSON em `nodes` e `edges`. Os caminhos dentro desse JSON precisam ser absolutos: o plugin roda a partir da própria pasta, e apenas os campos de arquivo único são convertidos para caminhos absolutos para você.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

O plugin AWS usa a AWS CLI para ler VPCs, sub-redes, security groups, instâncias, load balancers e roles do IAM. Instale e configure a AWS CLI primeiro e depois use um perfil somente leitura que você controla. `regions` é uma lista separada por vírgulas, como `us-east-1,eu-west-1`.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Isso acessa a conta AWS configurada. Para um passo a passo offline, use os fixtures salvos no repositório do app; veja [exemplos](./examples).

O <a href="/docs/samples/exposure.dash" download>painel de exposição da AWS</a> traça `Cidr → SecurityGroup ← Instance → Role` usando os relacionamentos importados por este plugin.

## Neo4j e Cartography {#neo4j}

O plugin Neo4j, adicionado na 0.3.0, copia os nós e relacionamentos de um banco Neo4j para um grafo local por meio da API HTTP do Neo4j. Ele envia apenas consultas de leitura. Seu uso principal é o [Cartography](https://github.com/cartography-cncf/cartography), que traz AWS, GCP, Azure, Kubernetes, GitHub, Okta e mais para o Neo4j; qualquer banco Neo4j funciona.

```sh
khonsu init graphs/infra
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

O endereço é o HTTP do Neo4j, 7474 por padrão, não `bolt://`. A senha fica no chaveiro do sistema, e um perfil de leitor basta.

O HawDB tem um rótulo por nó, então cada nó recebe um dos seus rótulos do Neo4j, geralmente o mais raro, e mantém todos eles em `neo4j_labels`. Quando `MATCH (p:AWSPrincipal)` não retorna nada, tente `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`. Consultas escritas para o Neo4j podem precisar de ajustes; veja [limitações de consulta](./queries#current-limitations) e o [README do plugin](https://github.com/JetSquirrel/KhonsuGraph/tree/main/plugins/neo4j).

## Semântica de sincronização {#sync-semantics}

- IDs estáveis permitem que importações repetidas atualizem registros existentes.
- Uma sincronização completa remove, desta origem, registros importados anteriormente que não estão no novo resultado.
- A sincronização incremental só adiciona ou atualiza registros, quando o plugin oferece suporte. `--append` faz o mesmo para qualquer origem: use quando os arquivos contêm apenas o que é novo desde a última sincronização.
- Um registro inalterado não é gravado de novo, então `nodes_written` e `edges_written` do relatório de sincronização contam mudanças.
- Uma sincronização com falha pode manter registros já gravados. A próxima sincronização bem-sucedida os reconcilia.
- Uma aresta com extremidade desconhecida é ignorada e contada em `skipped_edges`.

Os registros importados incluem `khonsu_id`, `khonsu_source`, `khonsu_plugin` e `khonsu_synced_at`; a [evidência](./investigations#evidence) os lê de volta. Enquanto o app tem o grafo aberto, `khonsu plugin sync` roda pela janela, que mostra o progresso e reexecuta seus painéis abertos. Gravações por consulta exigem o grafo fechado ali.

## Outros sistemas

Instale um plugin somente depois de revisar suas permissões. Permissões são declarações, não um sandbox do sistema operacional. Campos secretos de configuração ficam no chaveiro do sistema. Veja [desenvolvimento de plugins](./plugins).
