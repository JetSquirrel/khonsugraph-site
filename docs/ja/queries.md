---
description: Cypher でグラフを、SQL でテーブルをクエリし、キャンバスと現在の HawDB の制限を理解します。
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

Cypher は `MATCH`、`OPTIONAL MATCH`、`WHERE`、`RETURN [DISTINCT]`、`ORDER BY`、`SKIP`、`LIMIT`、`WITH`、および上限付きの可変長パターンをサポートします。`--write` を付けると、`CREATE`、`MERGE`、`SET`、`DELETE`、`DETACH DELETE` も使用できます。たとえば、サービスグラフの場合:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

これは端点を返します。間に挟まる接続を描画するには、1 ホップのリレーションシップを別途クエリしてください。

## SQL とパラメーター

SQL クエリは、同じ HawDB ディレクトリ内のテーブルに対して、PostgreSQL 方言の SQL で動作します。グラフのインポートは、同名の SQL テーブルがあることを意味しません。まず `schema` を調べてください。次の例には `assets` テーブルが必要です:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` の値は、可能であれば JSON として解析され、そうでなければ文字列として扱われます。SQL は位置パラメーターを使用します(`-p 1=value` と `$1`)。

## 現在の制限 {#current-limitations}

確認済みのソースは HawDB 0.12.0 を使用しています:

- Cypher の `sum()`、`labels()`、`keys()`、`properties()`、`shortestPath`、パス変数、`CALL db.*`、`SHOW` は、このワークフローではサポートされていません。メタデータには `khonsu schema` を使用してください。
- `count`、`collect`、`min`、`max`、`avg` が、サポートされている集計関数です。
- 可変長パターンにはリレーションシップ型が必要で、リレーションシップ変数は使用できません。
- `UNWIND` の後には書き込み句が必要です。単独の読み取り専用 `UNWIND` と `WHERE true` はサポートされていません。
- `OPTIONAL MATCH`、スカラーの `IN`、JSON テキストに対する `json_value()`、リレーションシッププロパティの `SET` はサポートされています。
- 読み取りには 100,000 行の実行上限があります。`--max-rows` は実行後の表示行を制限するだけなので、クエリ内でも `LIMIT` を使用してください。
- ベクトル値は JSON の数値配列として返されます。結果の列は名前で読み取ってください。エンジンが列の順序を入れ替えることがあります。

## 読み取りと書き込みのアクセス

CLI のクエリは既定で読み取り専用です。`--write` で明示的に書き込みを有効にします。一度に 1 つのプロセスだけがグラフディレクトリを所有します。アプリがグラフを開いている間、CLI の読み取りクエリとダッシュボードのチェックは、そのウィンドウ経由でルーティングされます。書き込みと同期には、そこでグラフを閉じている必要があります。
