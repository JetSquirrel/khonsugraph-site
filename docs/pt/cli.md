---
description: O comando khonsu imprime JSON em todos os comandos, para que o Claude Code e outros agentes de IA possam inspecionar um grafo, consultá-lo, traçar caminhos e escrever painéis.
---
# CLI e agentes de IA

O app desktop e a CLI compartilham um único executável. Sem argumentos, `khonsugraph` abre o app; com um subcomando, ele executa o comando e sai. O botão **Command line & AI** na barra de título (o ícone do robô) instala `khonsu` no PATH e pode instalar a skill para o Claude Code.

A [skill de agente](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) ensina aos agentes o fluxo de trabalho com o esquema primeiro e o subconjunto de Cypher suportado.

## Referência de comandos

| Comando | Finalidade |
| --- | --- |
| `khonsu init DIR` | Cria um grafo vazio |
| `khonsu schema --db DIR` | Inspeciona rótulos, relacionamentos, propriedades e tabelas |
| `khonsu query --db DIR --cypher "…"` | Executa uma instrução Cypher somente leitura |
| `khonsu query --db DIR --sql "…"` | Executa uma instrução SQL somente leitura |
| `khonsu query --db DIR --file query.cypher` | Executa um arquivo de consulta; `.sql` seleciona SQL |
| `khonsu explain --db DIR --cypher "…"` | Explica uma consulta |
| `khonsu explore --db DIR --from NODE [--to NODE]` | [Explora a partir de um nó](./investigations#explore) e relata um caminho |
| `khonsu evidence --db DIR --node NODE --rel REL` | Mostra [o que sustenta um registro](./investigations#evidence) |
| `khonsu analyze ALGORITHM --db DIR` | Executa um [algoritmo de grafo](./analysis): PageRank, comunidades, componentes e mais |
| `khonsu investigation save FILE --db DIR --from NODE` | [Salva uma investigação](./investigations#saved-investigations); `reopen FILE` a executa de novo |
| `khonsu snapshot save FILE --db DIR` | Guarda os registros do grafo; [`snapshot diff A B`](./investigations#snapshots) compara dois |
| `khonsu rebuild --db DIR` | Reconstrói um grafo em formato antigo a partir de suas fontes de dados |
| `khonsu plugin list` | Lista plugins e permissões |
| `khonsu plugin describe ID` | Mostra os campos de configuração e os tipos de saída de um plugin |
| `khonsu plugin search [WORDS]` | Lista o que os [marketplaces](./marketplace) oferecem |
| `khonsu plugin install ID --yes` | Instala um plugin pelo nome a partir de um marketplace e o aprova |
| `khonsu plugin install DIR --yes` | Instala um diretório ou ZIP de plugin e aprova suas permissões |
| `khonsu plugin update` | Atualiza plugins instalados de um marketplace; `--dry-run` mostra uma prévia |
| `khonsu marketplace list` | Lista os marketplaces; `add` e `remove` os alteram |
| `khonsu plugin sync --source ID` | Sincroniza uma origem; `--dry-run` pré-visualiza, `--incremental` e `--append` adicionam sem remover |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Executa uma [análise de plugin](./investigations#plugin-analyses), como `exposure` da AWS |
| `khonsu source list` | Lista as origens configuradas |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configura uma origem; `--test` verifica antes |
| `khonsu source remove ID` | Remove uma origem |
| `khonsu check FILE --db DIR` | Valida um painel em relação a um grafo |
| `khonsu comments FILE` | Lista, responde e resolve comentários de gráficos |
| `khonsu presence FILE --doing editing --plot NAME` | Mostra à janela quais gráficos você está editando |
| `khonsu open DIR` | Abre um grafo no app desktop |
| `khonsu open FILE.dash` | Abre um painel |
| `khonsu open --state` | Lê o grafo e as abas da janela em execução |

`--db` usa `KHONSU_DB` por padrão e, depois dele, o grafo aberto por último no app. Use um caminho explícito em automação. Gravações por consulta exigem `--write`.

## Saída e erros

Cada comando imprime um objeto JSON em stdout; `--pretty` o indenta. O progresso de sincronização vai para stderr como linhas JSON. Os resultados de consulta contêm `columns`, `rows`, `row_count`, `truncated` e `elapsed_ms`, além de `graph` quando nós ou relacionamentos são retornados.

`--max-rows` usa 200 por padrão e trunca o resultado exibido. Ele não reduz o trabalho de execução da consulta. Sempre inspecione `truncated` e use consultas limitadas.

Falhas têm um objeto `error` com `kind` e `message`, e `detail` opcional. Verifique o status de saída antes de interpretar o stdout: 1 indica erro de execução; 2 indica erro de uso ou de especificação do painel.

## Um ciclo de revisão

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# Edite o arquivo .dash e depois valide-o.
khonsu check overview.dash --db graphs/demo
# Use um ID de comentário real retornado pelo primeiro comando.
khonsu comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu presence overview.dash --doing idle
```

Enquanto o app mantém um grafo, consultas de leitura, `check` e `plugin sync` rodam pela janela e retornam `via_window: true`. Gravações por consulta, `explore` e `investigation` precisam do grafo livre. Não remova bloqueios para forçar uma gravação. Veja [solução de problemas](./troubleshooting).
