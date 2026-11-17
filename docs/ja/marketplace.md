---
description: マーケットプレイスから KhonsuGraph のプラグインを名前で検索、インストール、更新し、ダウンロードした内容を検証し、自作のプラグインを公開します。
---
# マーケットプレイス

マーケットプレイスはプラグインを名前で一覧にします。各プラグインのバージョン、宣言された権限、プラットフォームごとのパッケージとその SHA-256 が載っています。KhonsuGraph は、ローカルのフォルダー、GitHub リポジトリ、HTTPS アドレスのいずれからでもマーケットプレイスを読み込めます。

::: info 次のリリースで提供
マーケットプレイスは 0.3.0 の次のリリースで提供されます。そのリリースから、アプリに同梱されるプラグインは CSV だけになります。AWS と Neo4j は、SQL や DuckLocal と同じく公式マーケットプレイスからインストールします。0.3.0 では、AWS と Neo4j はまだアプリに同梱されています。
:::

## プラグインをインストールする {#install}

```sh
khonsu plugin search              # マーケットプレイスにあるプラグイン
khonsu plugin install aws --yes   # ダウンロード、検証、インストール、承認
khonsu plugin update              # インストール済みプラグインを最新にする
```

アプリでは、**Add Data Source… → More Plugins…** に同じ一覧が表示されます。そこでプラグインをインストールまたは更新すると、承認ダイアログ、続いてソースのフォームに進みます。

2 つのマーケットプレイスが同じ ID を載せている場合は、使うほうを指定します: `khonsu plugin install sql@official`。`khonsu plugin update --dry-run` は変更内容を報告するだけです。

## 公式プラグイン {#official}

| プラグイン | 読み込む内容 |
| --- | --- |
| `sql` | PostgreSQL、MySQL、SQLite のテーブル。手動で、または主キーと外部キーからマッピングします |
| `ducklocal` | DuckLocal を通じて読む Parquet、CSV、JSON、DuckDB のテーブル |
| `aws` | 読み取り専用の AWS CLI を通じた VPC、サブネット、セキュリティグループ、インスタンス、ロードバランサー、IAM ロール。露出分析と `aws.exposure` テンプレートを提供します |
| `neo4j` | Cartography が書き込んだものなどの Neo4j データベースを、HTTP API 経由でコピーします |

どのインストールにも最初から `official` マーケットプレイスが登録されています。`marketplace.khonsugraph.com` から配信され、各プラグインのソースと README を収めた [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) リポジトリからビルドされます。CSV プラグインは引き続き組み込みです。

## 検証される内容 {#checks}

- パッケージは、マーケットプレイスに載っている SHA-256 と一致し、載っているプラグインとバージョンを含んでいる必要があります。そうでなければ何もインストールされず、以前のものがそのまま残ります。
- インデックスとパッケージは HTTPS でのみ読み込まれます。
- インストールは承認ではありません。マーケットプレイスのプラグインは実行前に承認が必要で、更新後は再び承認が必要です。`--yes` は同じ手順で承認します。

マーケットプレイスが示すのはパッケージの場所とハッシュだけで、プラグインの安全性を保証するものではありません。承認する前に宣言された権限を確認してください。権限は宣言であり、サンドボックスではありません。[プラグイン開発](./plugins) を参照してください。

## マーケットプレイスを追加する {#add}

```sh
khonsu marketplace add acme/khonsu-plugins          # GitHub の owner/repo
khonsu marketplace add https://plugins.example.com  # 任意の HTTPS アドレス
khonsu marketplace add ~/work/team-plugins          # フォルダー
khonsu marketplace list
khonsu marketplace remove team-plugins
```

`khonsu marketplace remove official` で公式マーケットプレイスを無効にし、`khonsu marketplace restore` で元に戻せます。

## プラグインを公開する {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

プラグインをそのフォルダーにパッケージし、フォルダーの `marketplace.json` に載せます。フォルダーをコミットしてプッシュするか、静的ホスティングにアップロードしてください。他の人は `khonsu marketplace add` で一度追加すれば、名前でインストールできます。同じバージョンを再び公開すると、そのプラットフォームのパッケージが置き換わるので、プラットフォームごとに自分のビルドを公開できます。[マーケットプレイスの完全なリファレンス](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md) を参照してください。
