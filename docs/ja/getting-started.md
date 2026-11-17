---
description: KhonsuGraph をインストールし、グラフを作成して、小さな CSV の例をインポートします。
---
# はじめに

## インストール

利用可能なパッケージは [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases) にあります。リリースワークフローは、Apple silicon 向けの macOS DMG と 64 ビット Windows ZIP をビルドします。Windows パッケージは署名されていません。最新のエンジンアップグレードは、Windows ではなく macOS で検証されています。

macOS では、DMG を開いてアプリを Applications にコピーします。Windows では、ZIP 全体を展開し、実行ファイルの隣にある `plugins` フォルダーを保持してください。

アプリのタイトルバーにある **コマンドラインと AI** ボタン(ロボットのアイコン)は、`khonsu` コマンドを PATH にインストールし、エージェントスキルを Claude Code に追加できます。アプリの実行ファイルは、CLI のサブコマンドも直接受け付けます。

```sh
khonsu --version
```

## 小さなグラフを作成する

[hosts.csv](/samples/hosts.csv) と [dependencies.csv](/samples/dependencies.csv) を、同じ作業フォルダーにダウンロードします。これらは 3 つのホストと 2 つの依存関係を表しています。

そのフォルダーで次のコマンドを実行します。インポートの間は、デスクトップアプリでグラフを開いたままにしないでください。

```sh
khonsu graph init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

最初の同期は、書き込みを行わずに件数とサンプルをプレビューします。2 回目の同期がグラフをインポートします。`source add` は CSV のパスを絶対パスとして保存するため、以降の同期はどのフォルダーからでも動作します。

## クエリと探索

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

デスクトップのクエリエディターで、同じ Cypher クエリを実行します。ノードとリレーションシップを丸ごと返すと、グラフキャンバスは接続を表示するために必要な情報を得られます。

[クエリ](./queries) または [最初のダッシュボード](./dashboards) に進んでください。

## ソースからビルドする

アプリリポジトリのチェックアウトから:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

アプリは Rust、GPUI、HawDB を使用しています。リリースのパッケージングとプラットフォーム固有のセットアップについては、リポジトリの README を参照してください。
