---
description: ソースプラグインを使って、CSV ファイル、AWS アカウント、Neo4j または Cartography のデータベースを、ノードとリレーションシップからなるローカルのグラフに変換します。
---
# データソース

プラグインは、外部のシステムをノードとリレーションシップに変換します。KhonsuGraph はプラグインを別プロセスとして実行し、レコードをグラフに書き込みます。

## CSV

組み込みの CSV プラグインは、行をノードとリレーションシップにマッピングします。安定した ID、ソース、ターゲットの各列を選択してください。それ以外の列はプロパティになります。数値と真偽値は既定で推論されます。テキストとして保持するには `infer_types=false` を設定します。

完全なインポートについては [はじめに](./getting-started) を参照してください。ノードラベルやリレーションシップ型が混在する場合は、`nodes` と `edges` の JSON 設定を使用します。この JSON 内のパスは絶対パスでなければなりません。プラグインは自身のフォルダーから実行され、単一ファイルのフィールドだけが自動的に絶対パスへ変換されます。

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

0.3.0 の次のリリースから、AWS プラグインはアプリに同梱されず、[マーケットプレイス](./marketplace)からインストールします: `khonsu plugin install aws --yes`。0.3.0 ではアプリに同梱されています。

AWS プラグインは AWS CLI を使用して、VPC、サブネット、セキュリティグループ、インスタンス、ロードバランサー、IAM ロールを読み取ります。まず AWS CLI をインストールして設定し、その後、自分が管理する読み取り専用のプロファイルを使用してください。`regions` はカンマ区切りのリストで、たとえば `us-east-1,eu-west-1` です。

```sh
khonsu init graphs/aws
khonsu plugin install aws --yes
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

これは設定した AWS アカウントにアクセスします。オフラインで試すには、代わりに [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) リポジトリにある保存済みのレスポンスを使ってください。[例](./examples) を参照してください。

<a href="/docs/samples/exposure.dash" download>AWS 露出ダッシュボード</a>は、このプラグインがインポートしたリレーションシップを使って `Cidr → SecurityGroup ← Instance → Role` をたどります。

## Neo4j と Cartography {#neo4j}

0.3.0 の次のリリースから、Neo4j プラグインはアプリに同梱されず、[マーケットプレイス](./marketplace)からインストールします: `khonsu plugin install neo4j --yes`。0.3.0 ではアプリに同梱されています。

Neo4j プラグインは 0.3.0 で追加され、Neo4j データベースのノードとリレーションシップを、Neo4j の HTTP API 経由でローカルのグラフにコピーします。送信するのは読み取りクエリのみです。主な用途は [Cartography](https://github.com/cartography-cncf/cartography) で、これは AWS、GCP、Azure、Kubernetes、GitHub、Okta などを Neo4j に取り込みます。どの Neo4j データベースでも使用できます。

```sh
khonsu init graphs/infra
khonsu plugin install neo4j --yes
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

アドレスは Neo4j の HTTP 用のもので、既定では 7474 です。`bolt://` ではありません。パスワードはシステムキーチェーンに保存され、reader ロールで十分です。

HawDB はノードごとに 1 つのラベルしか持てないため、各ノードは Neo4j のラベルのうち 1 つ(通常は最も珍しいもの)を取り、すべてのラベルを `neo4j_labels` に保持します。`MATCH (p:AWSPrincipal)` が何も返さない場合は、`MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels` を試してください。Neo4j 向けに書かれたクエリは変更が必要な場合があります。[クエリの制限](./queries#current-limitations) と [プラグインの README](https://github.com/JetSquirrel/khonsugraph-marketplace/tree/main/plugins/neo4j) を参照してください。

## 同期の仕組み {#sync-semantics}

- 安定した ID により、繰り返しのインポートで既存のレコードを更新できます。
- フル同期では、このソースから以前にインポートされたレコードのうち、新しい結果に含まれないものが削除されます。
- 増分同期は、プラグインが対応している場合に限り、レコードの追加または更新のみを行います。`--append` はどのソースでも同じ動作をします。ファイルに前回の同期以降の新しいデータだけが含まれている場合に使用してください。
- 変更のないレコードは再度書き込まれないため、同期レポートの `nodes_written` と `edges_written` は変更分を数えます。
- 失敗した同期は、すでに書き込まれたレコードを残す可能性があります。次に成功した同期でそれらが整合されます。
- 端点が不明なエッジはスキップされ、`skipped_edges` にカウントされます。

インポートされたレコードには `khonsu_id`、`khonsu_source`、`khonsu_plugin`、`khonsu_synced_at` が含まれます。[証拠](./investigations#evidence) はこれらを読み戻します。アプリがグラフを開いている間、`khonsu plugin sync` はウィンドウ経由で実行され、進捗が表示され、開いているダッシュボードが再実行されます。クエリによる書き込みには、そこでグラフを閉じている必要があります。

## その他のシステム

プラグインは、その権限を確認したうえでインストールしてください。権限は宣言であり、オペレーティングシステムによるサンドボックスではありません。秘密の設定フィールドはシステムキーチェーンに保存されます。[プラグイン開発](./plugins) を参照してください。
