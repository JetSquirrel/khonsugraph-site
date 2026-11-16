---
description: Resolva comandos da CLI ausentes, bloqueios de grafo, painéis vazios e erros de validação de consulta.
---
# Solução de problemas

## khonsu não é encontrado

Use **Command line & AI** (o ícone do robô) na barra de título do app e reabra seu terminal. No macOS, você pode invocar o binário do app diretamente:

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

No Windows, mantenha `khonsu.exe` com o restante do pacote extraído e adicione esse diretório ao PATH, ou invoque-o pelo caminho completo.

## O grafo está bloqueado

Um processo é dono de um diretório de grafo do HawDB. Leituras e verificações de painel passam pela janela em execução, mas gravações e sincronizações de origem exigem o grafo livre. Feche o grafo no outro processo. Nunca apague `khonsugraph.lock`, `owner.hawdb.lock` ou arquivos do banco de dados para contornar um lease.

## O grafo informa old_format {#old-format}

O HawDB 0.25 mudou seu formato de armazenamento e não lê grafos mais antigos, então um grafo gravado pelo KhonsuGraph 0.2.0 ou anterior falha ao abrir com o tipo `old_format`. `khonsu rebuild --db DIR` o refaz a partir de suas fontes de dados e mantém o diretório antigo ao lado como `DIR.hawdb-old`. Tudo que foi gravado à mão em vez de sincronizado não é transportado.

## Um painel de grafo está vazio

Retorne nós e relacionamentos inteiros (`RETURN a, r, b`) em vez de apenas nomes. Verifique se você abriu o grafo para o qual o painel foi escrito. Use `khonsu schema --db DIR` e execute a consulta diretamente para verificar os rótulos e o resultado.

## Uma consulta ou painel falha

Execute `khonsu check FILE --db DIR` e leia todos os erros relatados. Um gráfico pode referenciar uma coluna ausente; um conjunto de dados importado pode usar rótulos diferentes. Alguns recursos do Cypher não são suportados: veja [limitações de consulta](./queries#current-limitations).

Se uma leitura excede seu orçamento, restrinja-a usando predicados e `LIMIT`. Reduzir apenas `--max-rows` não diminui o custo de execução.

## Uma origem não consegue sincronizar

Execute `khonsu plugin describe ID` e verifique os campos de configuração. Garanta que os plugins empacotados permaneçam ao lado do executável. Caminhos de CSV de arquivo único são armazenados como caminhos absolutos quando a origem é adicionada. Caminhos dentro do JSON `nodes` e `edges` são armazenados como fornecidos e precisam ser absolutos. A AWS exige a AWS CLI e um perfil configurado acessível, a menos que você use fixtures. Escreva `regions` como texto separado por vírgulas, não como um array JSON.

Uma sincronização com falha pode deixar registros já gravados. Corrija a causa e sincronize de novo para reconciliar. Inspecione `skipped_edges` para extremidades não resolvidas.

## Relate um problema

Inclua a versão do app, o sistema operacional, o comando e o tipo de erro em uma [issue no GitHub](https://github.com/JetSquirrel/KhonsuGraph/issues). Remova credenciais e valores privados do grafo das reproduções.
