---
description: 公開データセットを使ったグラフ調査の例です。Sysmon ログからの攻撃チェーン、サービスの影響範囲、ICIJ Offshore Leaks ネットワーク、Bitcoin の信頼ネットワーク、AWS の露出を取り上げます。
---
# 例

[アプリケーションリポジトリ](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) には、公開データセットからグラフを準備するダッシュボードとスクリプトが含まれています。`.dash` ファイル単体には、そのデータベースは含まれません。

## 公開データセット

| ダッシュボード | 問い | ソースデータ | グラフ |
| --- | --- | --- | --- |
| [セキュリティ攻撃チェーン](#attack-chain) | ノイズの多いホストログには、どの攻撃チェーンが隠れているか？ | MITRE ATT&CK と OTRF Security-Datasets | 1,838 ノード、20,591 リレーションシップ |
| [SRE の影響範囲](#blast-radius) | 障害が発生したサービスは何を巻き込むか？ | Google Online Boutique のサービスマニフェスト | 12 サービス、16 呼び出し経路 |
| [オフショア企業ネットワーク](#offshore-network) | 一連の企業の背後には誰がいるか？ | ICIJ Offshore Leaks | 5,577 ノード、6,515 リレーションシップ |
| [アカウント信頼ネットワーク](#trust-network) | どのアカウントについて他者が警告しているか？ | SNAP Bitcoin OTC の評価 | 5,881 アカウント、35,592 評価 |
| 交通機関の近くの賃貸 | どの住宅が MTR 駅の近くにあるか？ | OpenStreetMap の MTR データと Inside Airbnb Hong Kong | 5,730 ノード、17,119 リレーションシップ |

各ソースはそれぞれ独自のライセンスを保持しています。ICIJ データセットに含まれていることは、不正行為を意味するものではありません。出典とライセンスについては、リポジトリの examples README を参照してください。

## 攻撃チェーン {#attack-chain}

セキュリティエンジニアや脅威ハンター向けです。`security/attack_chain.dash` は、MITRE ATT&CK(グループ、ソフトウェア、テクニック、緩和策)を、2 つの OTRF Sysmon 記録(Empire Mimikatz と Covenant PowerShell リモーティング)と結合します。プロセス作成と LSASS アクセスのイベントは、それが示すテクニックにリンクします。テクニックを選ぶと、どの既知のグループがそれを使用しているか、どのように緩和するかがわかります。プロセスを選ぶと、それが何を生成し、何に接続したかがわかります。

以下のコマンドで、`sre` の代わりに `security` を使い、ダッシュボードとして `attack_chain.dash` を指定して構築します。

## オフショアネットワーク {#offshore-network}

調査担当者向けです。`investigation/offshore_network.dash` は、ICIJ Offshore Leaks データベース(パナマ文書、香港、2012〜2015 年)から、役員、企業、仲介業者をマッピングします。役員を選ぶとその企業がわかり、最も多く設立した仲介業者を見つけられます。

`sre` の代わりに `investigation` を使って構築します。

## 信頼ネットワーク {#trust-network}

監査担当者向けです。`audit/trust_network.dash` は、Bitcoin OTC の信頼ネットワークにおいて誰が誰を評価しているかを探索します。[グラフ分析](./analysis) は、ネットワークが依存しているアカウントを見つけます:

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

`sre` の代わりに `audit` を使って構築します。

## サービスの影響範囲 {#blast-radius}

SRE 向けです。どのサービスが、直接または他のサービスを通じて、障害が発生した依存先を呼び出しているかを示します。アプリリポジトリのチェックアウトから:

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

## 実アカウントなしの AWS 露出 {#aws-exposure}

クラウドセキュリティエンジニア向けです。AWS アカウントの設定がインターネットに何を開いているかを、インターネット CIDR からセキュリティグループ、ロードバランサーを経て、インスタンスとそれらが引き受けるロールまで示します。

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

0.3.0 以降、`khonsu plugin analyze aws exposure --db graphs/aws` は、各検出結果について、その背後にあるルールとフィールドを報告し、`khonsu explore` が経路をたどります。[調査](./investigations) を参照してください。
