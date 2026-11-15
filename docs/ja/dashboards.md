---
description: グラフのダッシュボードをプレーンテキストの .dash ファイルとして書き、エージェントとともにレビューします。
---
# ダッシュボード

`.dash` ファイルはプレーンテキストで、名前付きのクエリ、プロット、フィルターで構成されます。アプリで現在開いているグラフを読み取ります。データはプラグインを通じて別途インポートされるため、`source` ブロックはありません。

## 最初のグラフパネル

[はじめに](./getting-started) を完了したら、次を `overview.dash` として保存します:

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check` は各クエリを読み取り専用で実行し、プロットの列を検証し、実際の値でフィルターを試します。ダッシュボードを開いたり共有したりする前に、報告されたすべてのエラーを修正してください。

## プロットとレイアウト

プロットの種類には `table`、`bar`、`line`、`area`、`scatter`、`pie`、`map`、`card`、`text`、`graph` があります。`width` は 1〜12 列にまたがります。グラフクエリはノードとリレーションシップを丸ごと返します。`caption` は、そのラベルとして表示するノードプロパティを選択します。`group` を使うと、プロパティによってノードをグループ化できます。

## 共有フィルター

テーブルの行、バー、グラフのノードがフィルターを駆動できます。この例では、あるテーブルクエリが `service` を返し、別のクエリが `WHERE $service` を使用します:

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

プレースホルダーは `WHERE` 条件全体でなければならず、任意で `AND` によって結合できます。Cypher では、選択された値が `match` 式と比較されます。SQL では列そのものと比較されるため、`match` は不要です。選択されていない条件は削除されます。ソースのプロット自身はフィルターされません。完全な [リポジトリの例](./examples) には、これらのリンクされたクエリとプロットが含まれています。

## エージェントによるレビュー

アプリでプロットにコメントします。エージェントはコメントを読み、ファイルを編集し、`check` を実行して返信します。コメントはダッシュボードの隣の `FILE.comments.json` に保存されます。プレゼンスによって、エージェントが編集しているプロットを識別でき、ファイルが変更されるとウィンドウが再描画されます。

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

このフォーマットには、任意の関数、条件分岐、データに依存したスタイリングはありません。レビュー用のコマンドについては [CLI とエージェント](./cli) を参照してください。
