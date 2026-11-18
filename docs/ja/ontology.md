---
description: オントロジーファイルとマッピングファイルでグラフのラベルの意味を示し、グラフが質問に答えられるかを確かめ、概念どうしのつながりを調べ、オントロジーの言葉でクエリを書きます。
---
# オントロジー

グラフのラベルは、レコードがどこから来たかを表します：`Host`、`EntraUser`、`WazuhAgent`。オントロジーは、それが何であるかを表します：`Device`、`Account`。オントロジーがあれば、どのデータソースからグラフを作っても同じ言葉で質問でき、あなたや AI エージェントはクエリを書く前に、そのグラフが質問に答えられるかを確かめられます。

::: info 次のリリースで提供
オントロジーのコマンド、`--semantic`、`--validate-only` は 0.3.0 の次のリリースで提供されます。
:::

オントロジーはファイルに置かれ、グラフには書き込まれません。グラフはデータソースが書いた内容だけを持ち、[`khonsu graph rebuild`](./troubleshooting#old-format) はデータソースからグラフを作り直すため、グラフにしかないものは失われます。

## 概念とマッピング {#files}

**オントロジーファイル**（`*.ontology.json`）は、概念と、概念どうしの間で許される関係を宣言します：

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

概念は他の概念を `extends` できます。関係は、その両端を拡張するどの概念にも成り立ちます。`Agent` から `Account` への `holds` は、`Person` と `Account` も結びます。

**マッピングファイル**（`*.mapping.json`）は、グラフのラベルと関係タイプが何であるかを示します：

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

人がレビューして `"status": "certified"` を設定するまで、すべて `draft` です。回答は、根拠とした下書きを `drafts` に挙げます。

## ライブラリの読み込み元 {#library}

次の順に読み込み、同じ ID は最初のものが使われます：

1. **組み込み**：どの調査でも共通する約 20 の概念（`Person`、`Organization`、`Account`、`Device`、`Process`、`IPAddress`、`Domain`、`Event`、`Observation` など）と、それらの間の関係。
2. KhonsuGraph の設定フォルダーにある `ontology/`。
3. インストール済みの各プラグインのフォルダーにある `ontology/`。プラグインは、自分が書くラベルの意味を同梱できます。
4. 指定した各 `--ontology PATH`（ファイルまたはフォルダー）。

使えないファイルは `problems` に報告されて除外され、残りは読み込まれます。リポジトリのセキュリティの例には、[ATT&CK パックとマッピング](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology)があります。

## クエリの前に確かめる {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # 何がマッピングされ、何がされていないか
khonsu graph ontology resolve machine login ip            # 言葉の意味
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** は概念と関係を一覧にし、`--concept` で一つの概念を詳しく表示します。`--db` を付けると、ライブラリとグラフを比べます：マッピングされたラベル（件数付き）、マッピングされていないラベルと関係タイプ、マッピングされているがグラフにないラベル。
- **resolve** は各語の意味を示します：名前または同義語で一致する概念や関係、またはマッピングで意味が与えられたラベル。意味のない語には `suggestions` が付きます。
- **check** は、質問の対象それぞれについてグラフにレコードがあるかを示します。項目は `unknown_term`、`no_mapping`、`not_in_graph` のいずれかとして `missing` に入り、そのときコマンドは種類 `not_investigable` で **3** を返して終了します。
- **path** は、ある概念から別の概念への最少ホップの道筋を示します：宣言された関係を通るもの、`--db` を付けるとグラフに実際にあるパターンを通るものも。それぞれ `MATCH` にそのまま使える Cypher の `pattern` 付きです。道筋はデータのつながり方であり、その道筋に沿って何かが起きた証拠ではありません。

どの回答にも `ontology_versions`（使ったファイルの ID、リビジョン、読み込み元）が付きます。

## オントロジーの言葉でクエリを書く {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

`--semantic` では、ラベルとして使った概念は、このグラフでその概念またはその拡張にマッピングされたすべてのラベルに置き換わり、関係はそれにマッピングされたタイプに置き換わります：`(d:Device)` は `(d:Host:Server)` に、`[:runs_on]` は `[:EXEC_ON|RAN_ON]` になります。グラフにあるラベルはそのまま残ります。グラフに何も対応しない概念は、空の結果を返すのではなく 3 で終了します。結果の `semantic` には、実行された文、各置き換え、使った下書きが入ります。セマンティッククエリは読み取り専用です。

## 実行せずにクエリを確かめる {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` は文をグラフと照らし合わせ、何も実行しません。`--semantic` はすべてのクエリの前に同じ確認を行います。

| 種類 | 重大度 | 内容 |
| --- | --- | --- |
| `unknown_label`、`unknown_type` | エラー | グラフにそのラベルや関係タイプがない。`suggestions` に近い名前がある |
| `wrong_direction` | エラー | グラフにはそのパターンが逆向きにしかない |
| `no_such_pattern` | エラー | グラフにはそのパターンがどちらの向きにもない |
| `unbounded` | 警告 | 上限のない可変長パターン |
| `cartesian` | 警告 | 一つの `MATCH` の部分どうしが変数を共有せず、その行のすべての組み合わせが返る |

エラーがあると種類 `invalid_query` で 2 を返して終了し、問題は `error.detail` に入ります。警告は報告され、文は実行されます。詳しいリファレンスは[ソースリポジトリ](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md)にあります。
