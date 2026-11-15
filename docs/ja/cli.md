---
description: khonsu JSON CLI を使用して、グラフを調査し、データをクエリし、ダッシュボードで共同作業します。
---
# CLI と AI エージェント

デスクトップアプリと CLI は 1 つの実行ファイルを共有しています。引数なしの場合、`khonsugraph` はアプリを開きます。サブコマンドを付けると、そのコマンドを実行して終了します。タイトルバーの **コマンドラインと AI** ボタン(ロボットのアイコン)は、`khonsu` を PATH にインストールし、Claude Code 用のスキルをインストールできます。

[エージェントスキル](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) は、スキーマファーストのワークフローとサポートされている Cypher のサブセットをエージェントに教えます。

## コマンドリファレンス

| コマンド | 目的 |
| --- | --- |
| `khonsu init DIR` | 空のグラフを作成する |
| `khonsu schema --db DIR` | ラベル、リレーションシップ、プロパティ、テーブルを調査する |
| `khonsu query --db DIR --cypher "…"` | 読み取り専用の Cypher 文を 1 つ実行する |
| `khonsu query --db DIR --sql "…"` | 読み取り専用の SQL 文を 1 つ実行する |
| `khonsu query --db DIR --file query.cypher` | クエリファイルを実行する。`.sql` を指定すると SQL が選択される |
| `khonsu explain --db DIR --cypher "…"` | クエリを説明する |
| `khonsu plugin list` | プラグインと権限を一覧表示する |
| `khonsu plugin describe ID` | プラグインの設定フィールドと出力型を表示する |
| `khonsu plugin install DIR --yes` | プラグインディレクトリまたは ZIP をインストールし、その権限を承認する |
| `khonsu plugin sync --source ID` | ソースを同期する。プレビューには `--dry-run`、増分同期には `--incremental` を追加する |
| `khonsu source list` | 設定済みのソースを一覧表示する |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | ソースを設定する。`--test` を付けると最初にチェックする |
| `khonsu source remove ID` | ソースを削除する |
| `khonsu check FILE --db DIR` | グラフに対してダッシュボードを検証する |
| `khonsu comments FILE` | プロットのコメントを一覧表示し、返信し、解決する |
| `khonsu presence FILE --doing editing --plot NAME` | どのプロットを編集中かをウィンドウに表示する |
| `khonsu open DIR` | デスクトップアプリでグラフを開く |
| `khonsu open FILE.dash` | ダッシュボードを開く |
| `khonsu open --state` | 実行中のウィンドウのグラフとタブを読み取る |

`--db` は `KHONSU_DB`、次にアプリで最後に開いたグラフを既定値とします。自動化では明示的なパスを使用してください。クエリによる書き込みには `--write` が必要です。

## 出力とエラー

各コマンドは stdout に 1 つの JSON オブジェクトを出力します。`--pretty` を付けるとインデントされます。同期の進捗は JSON Lines として stderr に出力されます。クエリ結果には `columns`、`rows`、`row_count`、`truncated`、`elapsed_ms` が含まれ、ノードやリレーションシップが返される場合は `graph` も含まれます。

`--max-rows` は既定で 200 で、表示される結果を切り詰めます。クエリ実行の処理量は減りません。常に `truncated` を確認し、上限付きのクエリを使用してください。

失敗時には、`kind` と `message`、および任意の `detail` を持つ `error` オブジェクトがあります。stdout を解釈する前に終了ステータスを確認してください。1 は実行エラー、2 は使用方法またはダッシュボード仕様のエラーを示します。

## レビューループ

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# .dash ファイルを編集し、その後検証します。
khonsu check overview.dash --db graphs/demo
# 最初のコマンドが返した実際のコメント ID を使用します。
khonsu comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu presence overview.dash --doing idle
```

アプリがグラフを保持している間、読み取りクエリと `check` はそのウィンドウ経由で実行され、`via_window: true` を返します。書き込みを強制するためにロックを削除しないでください。[トラブルシューティング](./troubleshooting) を参照してください。
