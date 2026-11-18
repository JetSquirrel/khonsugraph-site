---
description: JSON Lines プロトコルを使用して、任意の言語でデータソースプラグインを構築します。
---
# プラグイン開発

プラグインは、JSON Lines を使用して stdin/stdout 経由でノードとリレーションシップを出力する、独立した実行ファイルです。ホストがレコードを HawDB に書き込みます。プラグインは自身でグラフを開く必要はありません。

プロトコルバージョン 1 は実験的であり、1.0 より前に変更される可能性があります。[完全なプロトコルリファレンス](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) はアプリケーションとともに管理されています。

## パッケージ構成

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

実行ファイルは、プラグインフォルダーを作業ディレクトリとして実行されます。最小の完全な例は、リポジトリの [Python フォルダープラグイン](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders) です。

## 操作

| 操作 | 入力 | 出力 |
| --- | --- | --- |
| `describe` | なし | 設定スキーマ、権限、出力型 |
| `test` | 設定とシークレットを含むリクエスト | `test_result` または `error` |
| `sync` | 設定、シークレット、モード、カーソルを含むリクエスト | レコードと進捗、その後 `done` または `error` |

すべてのメッセージは、`type` フィールドを持つ 1 行の JSON オブジェクトです。診断情報は stderr に出力します。同期の間で ID を安定させてください。リレーションシップの端点は、同じソースのノード ID を参照します。成功した同期は `done` で終了します。

## 権限とシークレット

ネットワークアクセス、ファイルの読み取り、コマンドをマニフェストで宣言します。KhonsuGraph は承認のためにこれらの宣言を表示しますが、プロセスをサンドボックス化は **しません**。システムキーチェーンを使用するには、秘密の設定フィールドを `secret: true` でマークします。

確認したうえで、プラグインディレクトリまたは ZIP をインストールします:

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` は宣言された権限を承認します。AI エージェントが実行した場合は[何も承認しません](./cli#approval)。インストーラーはプラグインをコピーするため、ソースを変更した後は再インストールしてください。フル同期または増分同期を実装する前に、[同期の仕組み](./data-sources#sync-semantics) を参照してください。

## プラグインを共有する {#share}

他の人が名前でインストールできるようにするには、プラグインをマーケットプレイスに公開します。[プラグインを公開する](./marketplace#publish) を参照してください。
