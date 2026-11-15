---
description: ソースプラグインを使って、CSV ファイルや AWS リソースをノードとリレーションシップに変換します。
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

AWS プラグインは AWS CLI を使用して、VPC、サブネット、セキュリティグループ、インスタンス、ロードバランサー、IAM ロールを読み取ります。まず AWS CLI をインストールして設定し、その後、自分が管理する読み取り専用のプロファイルを使用してください。`regions` はカンマ区切りのリストで、たとえば `us-east-1,eu-west-1` です。

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

これは設定された AWS アカウントにアクセスします。オフラインで一通り試す場合は、代わりにアプリリポジトリに保存されているフィクスチャを使用してください。[例](./examples) を参照してください。

<a href="/docs/samples/exposure.dash" download>AWS 露出ダッシュボード</a>は、このプラグインがインポートしたリレーションシップを使って `Cidr → SecurityGroup ← Instance → Role` をたどります。

## 同期の仕組み {#sync-semantics}

- 安定した ID により、繰り返しのインポートで既存のレコードを更新できます。
- フル同期では、このソースから以前にインポートされたレコードのうち、新しい結果に含まれないものが削除されます。
- 増分同期は、プラグインが対応している場合に限り、レコードの追加または更新のみを行います。
- 失敗した同期は、すでに書き込まれたレコードを残す可能性があります。次に成功した同期でそれらが整合されます。
- 端点が不明なエッジはスキップされ、`skipped_edges` にカウントされます。

インポートされたレコードには `khonsu_id`、`khonsu_source`、`khonsu_plugin`、`khonsu_synced_at` が含まれます。グラフへの書き込みと同期には排他的アクセスが必要です。まずアプリでグラフを閉じてください。

## その他のシステム

プラグインは、その権限を確認したうえでインストールしてください。権限は宣言であり、オペレーティングシステムによるサンドボックスではありません。秘密の設定フィールドはシステムキーチェーンに保存されます。[プラグイン開発](./plugins) を参照してください。
