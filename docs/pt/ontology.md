---
description: Diga o que os rótulos de um grafo significam com arquivos de ontologia e de mapeamento, verifique se um grafo consegue responder a uma pergunta, descubra como os conceitos se ligam e consulte com as palavras da ontologia.
---
# Ontologia

Os rótulos de um grafo dizem de onde vieram os registros: `Host`, `EntraUser`, `WazuhAgent`. A ontologia diz o que eles são: um `Device`, uma `Account`. Com ela, uma pergunta é feita com as mesmas palavras, quaisquer que sejam as fontes que montaram o grafo, e você ou um agente de IA pode descobrir se um grafo consegue respondê-la antes de escrever uma consulta.

::: info Na próxima versão
Os comandos de ontologia, `--semantic` e `--validate-only` chegam na versão seguinte à 0.3.0.
:::

A ontologia fica em arquivos, nunca no grafo. Um grafo guarda o que suas fontes de dados escreveram, e [`khonsu graph rebuild`](./troubleshooting#old-format) o refaz a partir delas, então o que estivesse só no grafo se perderia.

## Conceitos e mapeamentos {#files}

**Um arquivo de ontologia** (`*.ontology.json`) declara conceitos e as relações permitidas entre eles:

```json
{
  "format": "khonsu-ontology",
  "version": 1,
  "id": "attack",
  "revision": "0.1.0",
  "concepts": [
    { "name": "Technique", "description": "An ATT&CK technique.", "synonyms": ["ttp"] }
  ],
  "relationships": [
    { "name": "indicates", "from": "Entity", "to": "Technique" }
  ]
}
```

Um conceito pode estender (`extends`) outros, e uma relação vale para tudo o que estende suas pontas: `holds` de `Agent` para `Account` também liga uma `Person` a uma `Account`.

**Um arquivo de mapeamento** (`*.mapping.json`) diz o que são os rótulos e os tipos de relação de um grafo:

```json
{
  "format": "khonsu-mapping",
  "version": 1,
  "id": "security-example",
  "revision": "1",
  "status": "draft",
  "labels": [{ "label": "Host", "concept": "Device" }],
  "relationship_types": [{ "type": "RAN_ON", "relationship": "runs_on" }]
}
```

Tudo é `draft` até que uma pessoa revise e defina `"status": "certified"`. As respostas listam em `drafts` os rascunhos em que se apoiam.

## De onde vem a biblioteca {#library}

Nesta ordem, valendo a primeira cópia de cada ID:

1. **Embutida**: cerca de vinte conceitos que toda investigação compartilha, como `Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event` e `Observation`, e as relações entre eles.
2. `ontology/` na pasta de configuração do KhonsuGraph.
3. `ontology/` na pasta de cada plugin instalado, para que um plugin traga o significado dos rótulos que escreve.
4. Cada `--ontology PATH` informado, um arquivo ou uma pasta.

Um arquivo que não pode ser usado é relatado em `problems` e deixado de fora; o resto carrega mesmo assim. O exemplo de segurança do repositório tem um [pacote ATT&CK e um mapeamento](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology).

## Pergunte antes de consultar {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # o que está mapeado e o que não está
khonsu graph ontology resolve machine login ip            # o que as palavras significam
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** lista os conceitos e as relações, ou um conceito completo com `--concept`. Com `--db`, compara a biblioteca com o grafo: rótulos mapeados (com contagens), rótulos e tipos de relação não mapeados, e rótulos mapeados mas ausentes.
- **resolve** diz o que cada palavra significa: um conceito ou uma relação por nome ou sinônimo, ou um rótulo ao qual um mapeamento dá significado. Uma palavra que não significa nada recebe `suggestions`.
- **check** diz se o grafo tem registros de cada coisa de que trata uma pergunta. Um termo aparece em `missing` como `unknown_term`, `no_mapping` ou `not_in_graph`, e então o comando termina com **3** e o tipo `not_investigable`.
- **path** dá os caminhos com menos saltos de um conceito a outro: pelas relações declaradas e, com `--db`, pelos padrões que o grafo realmente contém, cada um como um `pattern` Cypher pronto para `MATCH`. Um caminho é uma forma como os dados se ligam, não a prova de que algo aconteceu ao longo dele.

Toda resposta traz `ontology_versions`: os arquivos usados, por ID, revisão e origem.

## Consulte com as palavras da ontologia {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

Com `--semantic`, um conceito usado como rótulo vira todos os rótulos deste grafo mapeados para ele ou para o que o estende, e uma relação vira os tipos mapeados para ela: `(d:Device)` vira `(d:Host:Server)` e `[:runs_on]` vira `[:EXEC_ON|RAN_ON]`. Os rótulos que o grafo já tem ficam como foram escritos. Um conceito que nada no grafo contém termina com 3 em vez de retornar nenhuma linha. O resultado tem `semantic`, com a instrução executada, cada substituição e os rascunhos usados. Uma consulta semântica só lê.

## Verifique uma consulta sem executá-la {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` verifica uma instrução contra o grafo e não executa nada; `--semantic` faz a mesma verificação antes de cada consulta.

| Tipo | Gravidade | O que significa |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | erro | O grafo não tem esse rótulo nem esse tipo de relação; `suggestions` traz nomes próximos |
| `wrong_direction` | erro | O grafo só contém o padrão no sentido contrário |
| `no_such_pattern` | erro | O grafo não contém o padrão em nenhum sentido |
| `unbounded` | aviso | Um padrão de comprimento variável sem limite superior |
| `cartesian` | aviso | Partes de um mesmo `MATCH` não compartilham variável, então voltam todos os pares de suas linhas |

Um erro termina com 2, o tipo `invalid_query` e os problemas em `error.detail`; avisos são relatados e a instrução é executada. A referência completa está no [repositório do código](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md).
