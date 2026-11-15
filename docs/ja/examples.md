---
description: AWS の露出、サービスの依存関係、セキュリティ、信頼ネットワークに関するリポジトリのダッシュボードを見ます。
---
# 例

[アプリケーションリポジトリ](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) には、公開データセットからグラフを準備するダッシュボードとスクリプトが含まれています。`.dash` ファイル単体には、そのデータベースは含まれません。

## 公開データセット

| ダッシュボード | ソースデータ |
| --- | --- |
| セキュリティ攻撃チェーン | MITRE ATT&CK と OTRF Security-Datasets |
| SRE の影響範囲 | Google Online Boutique のサービスマニフェスト |
| オフショア企業ネットワーク | ICIJ Offshore Leaks |
| アカウント信頼ネットワーク | SNAP Bitcoin OTC の評価 |
| 交通機関の近くの賃貸 | OpenStreetMap の MTR データと Inside Airbnb Hong Kong |

各ソースはそれぞれ独自のライセンスを保持しています。ICIJ データセットに含まれていることは、不正行為を意味するものではありません。出典とライセンスについては、リポジトリの examples README を参照してください。

## サービスグラフを構築する

アプリリポジトリのチェックアウトから:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

fetch スクリプトは公開データをダウンロードします。`$PWD` は CSV のパスを絶対パスに保ちます。CSV プラグインは `nodes` と `edges` にこれが必要です。examples README の説明に従って、`sre` を他のストーリーディレクトリに置き換えてください。

## 実アカウントなしで AWS を使う

アプリリポジトリには、保存された AWS CLI のレスポンスが含まれています。そのルートから実行します:

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

<a href="/docs/samples/exposure.dash" download>露出ダッシュボードをダウンロード</a>することもできます。これにはインポート済みの AWS グラフが必要です。
