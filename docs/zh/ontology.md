---
description: 用本体文件和映射文件说明图中标签的含义，检查一张图能否回答某个问题，找出概念之间如何相连，并用本体的词语查询。
---
# 本体

图的标签说明记录来自哪里：`Host`、`EntraUser`、`WazuhAgent`。本体说明它们是什么：一台 `Device`、一个 `Account`。有了本体，无论图由哪些数据源构建，同一个问题都可以用同样的词来问；你或 AI Agent 也能在写查询之前先确认这张图能否回答它。

::: info 下一个版本提供
本体命令、`--semantic` 和 `--validate-only` 将在 0.3.0 之后的版本中提供。
:::

本体保存在文件中，从不写入图。图只保存数据源写入的内容，[`khonsu graph rebuild`](./troubleshooting#old-format) 会从数据源重新生成它，所以只存在于图中的内容会丢失。

## 概念与映射 {#files}

**本体文件**（`*.ontology.json`）声明概念，以及概念之间允许的关系：

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

概念可以 `extends` 其他概念；关系对扩展了其两端的任何概念都成立：从 `Agent` 到 `Account` 的 `holds` 也连接 `Person` 和 `Account`。

**映射文件**（`*.mapping.json`）说明图中的标签和关系类型是什么：

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

所有内容在有人审阅并设置 `"status": "certified"` 之前都是 `draft`。回答会在 `drafts` 下列出所依据的草稿。

## 本体库从哪里来 {#library}

按以下顺序加载，同一 ID 以最先出现的为准：

1. **内置**：每次调查都会用到的约二十个概念，例如 `Person`、`Organization`、`Account`、`Device`、`Process`、`IPAddress`、`Domain`、`Event` 和 `Observation`，以及它们之间的关系。
2. KhonsuGraph 配置文件夹中的 `ontology/`。
3. 每个已安装插件文件夹中的 `ontology/`，因此插件可以附带它所写标签的含义。
4. 你传入的每个 `--ontology PATH`，可以是文件或文件夹。

无法使用的文件会在 `problems` 下报告并被跳过，其余文件照常加载。仓库中的安全示例包含一个 [ATT&CK 包和一个映射](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology)。

## 查询之前先问 {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # 哪些已映射，哪些没有
khonsu graph ontology resolve machine login ip            # 这些词是什么意思
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** 列出概念和关系；用 `--concept` 可查看单个概念的完整信息。加上 `--db` 时，它把本体库与图进行比较：已映射的标签（含数量）、未映射的标签和关系类型，以及已映射但图中不存在的标签。
- **resolve** 说明每个词的含义：按名称或同义词匹配的概念或关系，或由映射赋予含义的标签。没有含义的词会给出 `suggestions`。
- **check** 说明图中是否有问题所涉及的每类事物的记录。某个词项会以 `unknown_term`、`no_mapping` 或 `not_in_graph` 列入 `missing`，此时命令以 **3** 退出，类型为 `not_investigable`。
- **path** 给出从一个概念到另一个概念跳数最少的路径：基于声明的关系；加上 `--db` 时，还基于图中实际存在的模式，每条都给出可直接用于 `MATCH` 的 Cypher `pattern`。路径表示数据之间如何相连，并不证明沿途发生过任何事。

每个回答都带有 `ontology_versions`：所用文件的 ID、修订版本和来源。

## 用本体的词语查询 {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

使用 `--semantic` 时，作为标签使用的概念会替换为这张图中映射到它或其子概念的所有标签，关系会替换为映射到它的类型：`(d:Device)` 变为 `(d:Host:Server)`，`[:runs_on]` 变为 `[:EXEC_ON|RAN_ON]`。图中已有的标签保持原样。图中没有任何记录对应的概念会以 3 退出，而不是返回空结果。结果中的 `semantic` 包含实际执行的语句、每处替换以及所用的草稿。语义查询只读。

## 不执行地检查查询 {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` 根据图检查语句但不执行；`--semantic` 在每次查询前执行同样的检查。

| 类型 | 严重程度 | 含义 |
| --- | --- | --- |
| `unknown_label`、`unknown_type` | 错误 | 图中没有这个标签或关系类型；`suggestions` 给出相近的名称 |
| `wrong_direction` | 错误 | 图中只有方向相反的该模式 |
| `no_such_pattern` | 错误 | 图中两个方向都没有该模式 |
| `unbounded` | 警告 | 变长模式没有上限 |
| `cartesian` | 警告 | 同一个 `MATCH` 的各部分没有共享变量，会返回它们行的所有组合 |

出现错误时以 2 退出，类型为 `invalid_query`，问题列在 `error.detail` 下；警告会被报告，语句照常执行。完整参考见[源码仓库](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md)。
