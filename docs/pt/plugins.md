---
description: Crie um plugin de fonte de dados em qualquer linguagem usando o protocolo JSON Lines.
---
# Desenvolvimento de plugins

Um plugin é um executável separado que emite nós e relacionamentos por stdin/stdout usando JSON Lines. O host grava os registros no HawDB. Um plugin não precisa abrir o grafo por conta própria.

A versão 1 do protocolo é experimental e pode mudar antes da 1.0. A [referência completa do protocolo](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) é mantida junto com a aplicação.

## Estrutura do pacote

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

O executável roda com a pasta do plugin como diretório de trabalho. O menor exemplo completo é o [plugin folders em Python](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders) do repositório.

## Operações

| Operação | Entrada | Saída |
| --- | --- | --- |
| `describe` | Nenhuma | Esquema de configuração, permissões e tipos de saída |
| `test` | Requisição com configuração e segredos | `test_result` ou `error` |
| `sync` | Requisição com configuração, segredos, modo e cursor | Registros e progresso, depois `done` ou `error` |

Cada mensagem é um objeto JSON em sua própria linha, com um campo `type`. Diagnósticos pertencem ao stderr. Mantenha os IDs estáveis entre sincronizações; as extremidades de relacionamento se referem a IDs de nó da mesma origem. Termine sincronizações bem-sucedidas com `done`.

## Permissões e segredos

Declare acesso à rede, leitura de arquivos e comandos no manifesto. O KhonsuGraph mostra essas declarações para aprovação, mas **não** coloca o processo em sandbox. Marque campos secretos de configuração com `secret: true` para usar o chaveiro do sistema.

Instale um diretório ou ZIP de plugin depois de revisá-lo:

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` aprova as permissões declaradas. O instalador copia o plugin; reinstale após alterar o código-fonte. Veja [semântica de sincronização](./data-sources#sync-semantics) antes de implementar sincronização completa ou incremental.
