---
description: Say what a graph's labels mean with ontology and mapping files, check whether a graph can answer a question, find how concepts connect, and query in the ontology's words.
---
# Ontology

A graph's labels say where records came from: `Host`, `EntraUser`, `WazuhAgent`. The ontology says what they are: a `Device`, an `Account`. With it, a question can be asked in the same words whatever sources built the graph, and you or an AI agent can find out whether a graph can answer it before writing a query.

::: info Coming in the next release
The ontology commands, `--semantic` and `--validate-only` arrive in the release after 0.3.0.
:::

The ontology lives in files, never in the graph. A graph holds what its data sources wrote, and [`khonsu graph rebuild`](./troubleshooting#old-format) makes it again from them, so anything kept only in the graph would be lost.

## Concepts and mappings {#files}

**An ontology file** (`*.ontology.json`) declares concepts and the relationships allowed between them:

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

A concept can `extends` others, and a relationship holds for whatever extends its ends: `holds` from `Agent` to `Account` also joins a `Person` to an `Account`.

**A mapping file** (`*.mapping.json`) says what a graph's labels and relationship types are:

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

Everything is `draft` until a person reviews it and sets `"status": "certified"`. Answers list the drafts they rest on under `drafts`.

## Where the library comes from {#library}

In this order, the first copy of an ID winning:

1. **Built in**: about twenty concepts every investigation shares, such as `Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event` and `Observation`, and the relationships between them.
2. `ontology/` in the KhonsuGraph config folder.
3. `ontology/` in each installed plugin's folder, so a plugin ships the meaning of the labels it writes.
4. Each `--ontology PATH` you pass, a file or a folder.

A file that can't be used is reported under `problems` and left out; the rest still loads. The repository's security example has an [ATT&CK pack and a mapping](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology).

## Ask before you query {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # what is mapped, and what isn't
khonsu graph ontology resolve machine login ip            # what words mean
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** lists the concepts and relationships, or one in full with `--concept`. With `--db` it compares the library with the graph: labels mapped (with counts), labels and relationship types not mapped, and labels mapped but absent.
- **resolve** says what each word means: a concept or relationship by name or synonym, or a label a mapping gives a meaning. A word that means nothing gets `suggestions`.
- **check** says whether the graph holds records of each thing a question is about. A term is `missing` as `unknown_term`, `no_mapping` or `not_in_graph`, and then the command exits **3** with kind `not_investigable`.
- **path** gives the fewest-hop ways from one concept to another: over the declared relationships, and with `--db` over the patterns the graph actually holds, each as a Cypher `pattern` ready for `MATCH`. A path is a way the data connects, not proof that anything happened along it.

Every answer carries `ontology_versions`: the files used, by ID, revision and origin.

## Query in the ontology's words {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

With `--semantic`, a concept used as a label becomes every label in this graph mapped to it or to what extends it, and a relationship becomes the types mapped to it: `(d:Device)` becomes `(d:Host:Server)` and `[:runs_on]` becomes `[:EXEC_ON|RAN_ON]`. Labels the graph already has are left as written. A concept nothing in the graph holds exits 3 instead of returning no rows. The result has `semantic`, with the statement that ran, each replacement and the drafts used. A semantic query only reads.

## Check a query without running it {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` checks a statement against the graph and runs nothing; `--semantic` runs the same check before every query.

| Kind | Severity | What |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | error | The graph has no such label or relationship type; `suggestions` has close names |
| `wrong_direction` | error | The graph holds the pattern only the other way round |
| `no_such_pattern` | error | The graph holds no such pattern either way |
| `unbounded` | warning | A variable-length pattern with no upper bound |
| `cartesian` | warning | Parts of one `MATCH` share no variable, so every pair of their rows comes back |

An error exits 2 with kind `invalid_query` and the issues under `error.detail`; warnings are reported and the statement runs. The full reference is in the [source repository](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md).
