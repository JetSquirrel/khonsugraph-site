---
description: Cypher でローカルのグラフを、PostgreSQL の SQL でテーブルをクエリします。サポートされている Cypher の句、最短経路、パラメーター、現在の HawDB の制限について説明します。
---
# Cypher と SQL

## クエリの前に調べる

```sh
khonsu schema --db graphs/demo
```

結果には、ラベル、リレーションシップ型、プロパティ名、件数、リレーションシップパターン、SQL テーブルが一覧表示されます。別のグラフのスキーマを前提にせず、これらの名前を使用してください。

## 接続を返す

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

ノードとリレーションシップを丸ごと返すと、テーブルの値とグラフ要素の両方が得られます。`a.name` だけを返すとスカラーの列になり、接続されたグラフにはなりません。CLI では、グラフ要素は別の `graph` オブジェクトに現れます。

Cypher は `MATCH`、`OPTIONAL MATCH`、`WHERE`、`RETURN [DISTINCT]`、`ORDER BY`、`SKIP`、`LIMIT`、`WITH`、`UNWIND`、`CASE`、および上限付きの可変長パターンをサポートします。`--write` を付けると、`CREATE`、`MERGE`、`SET`、`DELETE`、`DETACH DELETE` も使用できます。たとえば、サービスグラフの場合:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

これは端点を返します。間に挟まる接続を描画するには、1 ホップのリレーションシップを別途クエリしてください。

## 最短経路

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`、`nodes(p)`、`relationships(p)` も動作します。両方の端点は、プロパティマップ、`WHERE`、またはそれより前の句によってバインドされている必要があります。`p` を返すと、キャンバス上に経路が描画されます。上限のない `*` は 256 ホップで停止し、経路が存在しないと報告する代わりに失敗します。

ホップ数とサイズに上限を設けてノードから外側へたどるには、[`khonsu graph explore`](./investigations#explore) を使用してください。重み付き経路、中心性、コミュニティについては、[グラフ分析](./analysis) を参照してください。

## SQL とパラメーター

SQL クエリは、同じ HawDB ディレクトリ内のテーブルに対して、PostgreSQL 方言の SQL で動作します。グラフのインポートは、同名の SQL テーブルがあることを意味しません。まず `schema` を調べてください。次の例には `assets` テーブルが必要です:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` の値は、可能であれば JSON として解析され、そうでなければ文字列として扱われます。SQL は位置パラメーターを使用します(`-p 1=value` と `$1`)。

## 現在の制限 {#current-limitations}

KhonsuGraph 0.3.0 は HawDB 0.29.0 を使用しており、その Cypher は他のグラフデータベースとは異なります:

- `labels()`、`keys()`、`properties()`、`CALL db.*`、`SHOW` はサポートされていません。メタデータには `khonsu schema` を使用してください。
- `count`、`sum`、`collect`、`min`、`max`、`avg` が、サポートされている集計関数です。式に対しても使用できます。
- 読み取りは `MATCH` または `UNWIND` で始まります。単独の `RETURN 1` は解析されず、`OPTIONAL MATCH` を最初の句にすることはできません。
- 可変長パターンにはリレーションシップ型が必要で、リレーションシップ変数は使用できません。型のないリレーションシップパターンは 1 ホップのみ動作します。
- パス変数は `shortestPath` と `allShortestPaths` でのみ動作します。
- 文字列は `+` で連結できず、`toLower`、`toUpper`、`reduce`、`any`、`all`、`none`、`exists` は使用できません。
- `CREATE` は 1 文につき 1 つのパターンを受け取ります。`LOAD CSV` は無効になっています。ファイルは [データソース](./data-sources) を使って取り込んでください。
- スカラーの `IN`、リスト内包表記、JSON テキストに対する `json_value()`、日付と期間、リレーションシッププロパティの `SET` はサポートされています。
- 読み取りには 100,000 行の実行上限があります。`--max-rows` は実行後の表示行を制限するだけなので、クエリ内でも `LIMIT` を使用してください。
- ベクトル値は JSON の数値配列として返されます。列は `RETURN` の順序で返されますが、引き続き名前で読み取ってください。
- `WHERE true` は Cypher では動作しますが、SQL では動作しません。

HawDB 0.25 より前、つまり KhonsuGraph 0.2.0 以前に書き込まれたグラフは、このバージョンでは読み取れません。[トラブルシューティング](./troubleshooting#old-format) を参照してください。

## 読み取りと書き込みのアクセス

CLI のクエリは既定で読み取り専用です。`--write` で明示的に書き込みを有効にします。一度に 1 つのプロセスだけがグラフディレクトリを所有します。アプリがグラフを開いている間、CLI の読み取りクエリとダッシュボードのチェックは、そのウィンドウ経由でルーティングされます。書き込みと同期には、そこでグラフを閉じている必要があります。
