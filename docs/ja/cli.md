---
description: khonsu コマンドラインはすべてのコマンドで JSON を出力するため、Claude Code やその他の AI エージェントがグラフを調査し、クエリし、経路をたどり、ダッシュボードを書くことができます。
---
# CLI と AI エージェント

デスクトップアプリと CLI は 1 つの実行ファイルを共有しています。引数なしの場合、`khonsugraph` はアプリを開きます。サブコマンドを付けると、そのコマンドを実行して終了します。タイトルバーの **コマンドラインと AI** ボタン(ロボットのアイコン)は、`khonsu` を PATH にインストールし、Claude Code 用のスキルをインストールできます。

[エージェントスキル](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) は、スキーマファーストのワークフローとサポートされている Cypher のサブセットをエージェントに教えます。

## コマンドリファレンス

| コマンド | 目的 |
| --- | --- |
| `khonsu graph init DIR` | 空のグラフを作成する |
| `khonsu schema --db DIR` | ラベル、リレーションシップ、プロパティ、テーブルを調査する |
| `khonsu query --db DIR --cypher "…"` | 読み取り専用の Cypher 文を 1 つ実行する |
| `khonsu query --db DIR --sql "…"` | 読み取り専用の SQL 文を 1 つ実行する |
| `khonsu query --db DIR --file query.cypher` | クエリファイルを実行する。`.sql` を指定すると SQL が選択される |
| `khonsu query --db DIR --semantic --cypher "…"` | [オントロジーの言葉でクエリを書く](./ontology#semantic)：`Device`、`Account`、`runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | 文をグラフと照らし合わせて[確かめ](./ontology#validate)、何も実行しない |
| `khonsu graph explain --db DIR --cypher "…"` | クエリを説明する |
| `khonsu graph ontology describe [--db DIR]` | [概念](./ontology)と、それが対応するグラフのラベルを一覧にする |
| `khonsu graph ontology resolve WORD…` | 言葉の意味を示す：概念、同義語、対応するラベル |
| `khonsu graph ontology check --db DIR --entities a,b` | 質問の対象それぞれについてグラフにレコードがあるか |
| `khonsu graph ontology path --from A --to B [--db DIR]` | 二つの概念のつながり方を Cypher のパターンで示す |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [ノードから外側へたどり](./investigations#explore)、経路を報告する |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | [レコードを支えるもの](./investigations#evidence)を表示する |
| `khonsu graph analyze ALGORITHM --db DIR` | [グラフアルゴリズム](./analysis)(PageRank、コミュニティ、連結成分など)を実行する |
| `khonsu investigate save FILE --db DIR --from NODE` | [調査を保存する](./investigations#saved-investigations)。`reopen FILE` で再実行する |
| `khonsu graph snapshot save FILE --db DIR` | グラフのレコードを保存する。[`snapshot diff A B`](./investigations#snapshots) は 2 つを比較する |
| `khonsu graph rebuild --db DIR` | 古い形式のグラフをデータソースから再構築する |
| `khonsu plugin list` | プラグインと権限を一覧表示する |
| `khonsu plugin describe ID` | プラグインの設定フィールドと出力型を表示する |
| `khonsu plugin search [WORDS]` | [マーケットプレイス](./marketplace)にあるプラグインを一覧表示する |
| `khonsu plugin install ID --yes` | マーケットプレイスからプラグインを名前でインストールして承認する |
| `khonsu plugin install DIR --yes` | プラグインディレクトリまたは ZIP をインストールし、その権限を承認する |
| `khonsu plugin update` | マーケットプレイスからインストールしたプラグインを更新する。`--dry-run` でプレビュー |
| `khonsu plugin marketplace list` | マーケットプレイスを一覧表示する。`add` と `remove` で変更 |
| `khonsu plugin sync --source ID` | ソースを同期する。`--dry-run` はプレビュー、`--incremental` と `--append` は削除を行わずに追加する |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | [プラグインの分析](./investigations#plugin-analyses)(たとえば AWS の `exposure`)を実行する |
| `khonsu source list` | 設定済みのソースを一覧表示する |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | ソースを設定する。`--test` を付けると最初にチェックする |
| `khonsu source remove ID` | ソースを削除する |
| `khonsu dash check FILE --db DIR` | グラフに対してダッシュボードを検証する |
| `khonsu dash comments FILE` | プロットのコメントを一覧表示し、返信し、解決する |
| `khonsu dash presence FILE --doing editing --plot NAME` | どのプロットを編集中かをウィンドウに表示する |
| `khonsu open DIR` | デスクトップアプリでグラフを開く |
| `khonsu open FILE.dash` | ダッシュボードを開く |
| `khonsu open --state` | 実行中のウィンドウのグラフとタブを読み取る |

`--db` は `KHONSU_DB`、次にアプリで最後に開いたグラフを既定値とします。自動化では明示的なパスを使用してください。クエリによる書き込みには `--write` が必要です。

## 出力とエラー

各コマンドは stdout に 1 つの JSON オブジェクトを出力します。`--pretty` を付けるとインデントされます。同期の進捗は JSON Lines として stderr に出力されます。クエリ結果には `columns`、`rows`、`row_count`、`truncated`、`elapsed_ms` が含まれ、ノードやリレーションシップが返される場合は `graph` も含まれます。

`--max-rows` は既定で 200 で、表示される結果を切り詰めます。クエリ実行の処理量は減りません。常に `truncated` を確認し、上限付きのクエリを使用してください。

失敗時には、`kind` と `message`、および任意の `detail` を持つ `error` オブジェクトがあります。stdout を解釈する前に終了ステータスを確認してください。1 は実行エラー、2 は使用方法またはダッシュボード仕様のエラーを示します。

0.3.0 の次のリリースからは、終了コード 2 はクエリが[グラフに合わない](./ontology#validate)こと（`invalid_query`）も表し、3 は質問の対象のレコードがグラフにないこと（`not_investigable`）、4 は人の確認が必要なこと（`needs_confirmation`）を表します。

## 承認は人が行う {#approval}

0.3.0 の次のリリースからは、プラグインの権限の承認は人が決めることになります。エージェントが `khonsu plugin install … --yes`、`plugin update`、`plugin approve` を実行すると、プラグインはインストールまたは更新されますが承認はされず、コマンドは種類 `needs_confirmation` で 4 を返して終了し、該当するプラグインを挙げます。アプリまたはご自身のターミナルで承認するよう、利用者に依頼してください。エージェントは `KHONSU_AGENT`、または Claude Code、Codex、Cursor、Gemini CLI が設定する環境変数から検出されます。

## レビューループ

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# .dash ファイルを編集し、その後検証します。
khonsu dash check overview.dash --db graphs/demo
# 最初のコマンドが返した実際のコメント ID を使用します。
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

アプリがグラフを保持している間、読み取りクエリ、`dash check`、`plugin sync` はそのウィンドウ経由で実行され、`via_window: true` を返します。クエリによる書き込み、`graph explore`、`investigate` にはグラフが空いている必要があります。書き込みを強制するためにロックを削除しないでください。[トラブルシューティング](./troubleshooting) を参照してください。
