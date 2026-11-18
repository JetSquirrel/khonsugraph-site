---
description: O comando khonsu imprime JSON em todos os comandos, para que o Claude Code e outros agentes de IA possam inspecionar um grafo, consultá-lo, traçar caminhos e escrever painéis.
---
# CLI e agentes de IA

O app desktop e a CLI compartilham um único executável. Sem argumentos, `khonsugraph` abre o app; com um subcomando, ele executa o comando e sai. O botão **Command line & AI** na barra de título (o ícone do robô) instala `khonsu` no PATH e pode instalar a skill para o Claude Code.

A [skill de agente](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) ensina aos agentes o fluxo de trabalho com o esquema primeiro e o subconjunto de Cypher suportado.

## Referência de comandos

| Comando | Finalidade |
| --- | --- |
| `khonsu graph init DIR` | Cria um grafo vazio |
| `khonsu schema --db DIR` | Inspeciona rótulos, relacionamentos, propriedades e tabelas |
| `khonsu query --db DIR --cypher "…"` | Executa uma instrução Cypher somente leitura |
| `khonsu query --db DIR --sql "…"` | Executa uma instrução SQL somente leitura |
| `khonsu query --db DIR --file query.cypher` | Executa um arquivo de consulta; `.sql` seleciona SQL |
| `khonsu query --db DIR --semantic --cypher "…"` | [Consultar com as palavras da ontologia](./ontology#semantic): `Device`, `Account`, `runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | [Verificar uma instrução](./ontology#validate) contra o grafo sem executar nada |
| `khonsu graph explain --db DIR --cypher "…"` | Explica uma consulta |
| `khonsu graph ontology describe [--db DIR]` | Lista os [conceitos](./ontology) e quais rótulos do grafo eles cobrem |
| `khonsu graph ontology resolve WORD…` | Diz o que as palavras significam: conceitos, sinônimos e os rótulos correspondentes |
| `khonsu graph ontology check --db DIR --entities a,b` | Se o grafo tem registros de cada coisa de que trata uma pergunta |
| `khonsu graph ontology path --from A --to B [--db DIR]` | Como dois conceitos se ligam, como padrões Cypher |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [Explora a partir de um nó](./investigations#explore) e relata um caminho |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | Mostra [o que sustenta um registro](./investigations#evidence) |
| `khonsu graph analyze ALGORITHM --db DIR` | Executa um [algoritmo de grafo](./analysis): PageRank, comunidades, componentes e mais |
| `khonsu investigate save FILE --db DIR --from NODE` | [Salva uma investigação](./investigations#saved-investigations); `reopen FILE` a executa de novo |
| `khonsu graph snapshot save FILE --db DIR` | Guarda os registros do grafo; [`snapshot diff A B`](./investigations#snapshots) compara dois |
| `khonsu graph rebuild --db DIR` | Reconstrói um grafo em formato antigo a partir de suas fontes de dados |
| `khonsu plugin list` | Lista plugins e permissões |
| `khonsu plugin describe ID` | Mostra os campos de configuração e os tipos de saída de um plugin |
| `khonsu plugin search [WORDS]` | Lista o que os [marketplaces](./marketplace) oferecem |
| `khonsu plugin install ID --yes` | Instala um plugin pelo nome a partir de um marketplace e o aprova |
| `khonsu plugin install DIR --yes` | Instala um diretório ou ZIP de plugin e aprova suas permissões |
| `khonsu plugin update` | Atualiza plugins instalados de um marketplace; `--dry-run` mostra uma prévia |
| `khonsu plugin marketplace list` | Lista os marketplaces; `add` e `remove` os alteram |
| `khonsu plugin sync --source ID` | Sincroniza uma origem; `--dry-run` pré-visualiza, `--incremental` e `--append` adicionam sem remover |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Executa uma [análise de plugin](./investigations#plugin-analyses), como `exposure` da AWS |
| `khonsu source list` | Lista as origens configuradas |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configura uma origem; `--test` verifica antes |
| `khonsu source remove ID` | Remove uma origem |
| `khonsu dash check FILE --db DIR` | Valida um painel em relação a um grafo |
| `khonsu dash comments FILE` | Lista, responde e resolve comentários de gráficos |
| `khonsu dash presence FILE --doing editing --plot NAME` | Mostra à janela quais gráficos você está editando |
| `khonsu open DIR` | Abre um grafo no app desktop |
| `khonsu open FILE.dash` | Abre um painel |
| `khonsu open --state` | Lê o grafo e as abas da janela em execução |

`--db` usa `KHONSU_DB` por padrão e, depois dele, o grafo aberto por último no app. Use um caminho explícito em automação. Gravações por consulta exigem `--write`.

## Saída e erros

Cada comando imprime um objeto JSON em stdout; `--pretty` o indenta. O progresso de sincronização vai para stderr como linhas JSON. Os resultados de consulta contêm `columns`, `rows`, `row_count`, `truncated` e `elapsed_ms`, além de `graph` quando nós ou relacionamentos são retornados.

`--max-rows` usa 200 por padrão e trunca o resultado exibido. Ele não reduz o trabalho de execução da consulta. Sempre inspecione `truncated` e use consultas limitadas.

Falhas têm um objeto `error` com `kind` e `message`, e `detail` opcional. Verifique o status de saída antes de interpretar o stdout: 1 indica erro de execução; 2 indica erro de uso ou de especificação do painel.

A partir da versão seguinte à 0.3.0, o código 2 também indica uma consulta que [não se encaixa no grafo](./ontology#validate) (`invalid_query`), 3 indica que o grafo não tem registros de algo de que trata a pergunta (`not_investigable`) e 4 que uma pessoa precisa confirmar (`needs_confirmation`).

## A aprovação é de uma pessoa {#approval}

A partir da versão seguinte à 0.3.0, aprovar as permissões de um plugin é decisão de uma pessoa. Quando um agente executa `khonsu plugin install … --yes`, `plugin update` ou `plugin approve`, o plugin é instalado ou atualizado, mas não aprovado, e o comando termina com 4 e o tipo `needs_confirmation`, citando os plugins. Peça à pessoa que os aprove no app ou no próprio terminal. Um agente é detectado por `KHONSU_AGENT` ou pelas variáveis que Claude Code, Codex, Cursor e Gemini CLI definem.

## Um ciclo de revisão

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# Edite o arquivo .dash e depois valide-o.
khonsu dash check overview.dash --db graphs/demo
# Use um ID de comentário real retornado pelo primeiro comando.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

Enquanto o app mantém um grafo, consultas de leitura, `dash check` e `plugin sync` rodam pela janela e retornam `via_window: true`. Gravações por consulta, `graph explore` e `investigate` precisam do grafo livre. Não remova bloqueios para forçar uma gravação. Veja [solução de problemas](./troubleshooting).
