---
description: khonsu graph explore でグラフ内の経路をたどり、各レコードの背後にある証拠を引用し、調査を保存して、データ変更後に再確認します。
---
# 調査

調査は、出発点から答えまでリレーションシップをたどります。インターネットからこのインスタンスへはどの経路が通じているのか、障害が発生したサービスは何を巻き込むのか、企業の背後には誰がいるのか。KhonsuGraph は、後から答えを検証できるように、4 つのものを分けて保持します。経路、その上の各レコードの証拠、保存された調査、そしてそれ以降にグラフで何が変わったかです。

これらのコマンドは KhonsuGraph 0.3.0 で追加されました。`khonsu --version` を実行して、お使いのバージョンを確認してください。

## 経路をたどる {#explore}

`khonsu graph explore` は、グラフ全体を読み込まずに、1 つ以上のノードから外側へたどります。ウィンドウでは、同じたどり方がグラフキャンバス上の **Path Explorer** です。

```sh
khonsu graph explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` と `--to` は、`khonsu_id`(同期されたすべてのレコードが持つ安定した ID)または数値のノード ID を受け取ります。上の ID は例示であり、[例](./examples#aws-exposure) にあるような AWS グラフのものです。自分の ID は `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5` のようなクエリで読み取ってください。

| オプション | 意味 | 既定値 |
| --- | --- | --- |
| `--from NODE` | 開始ノード。複数指定する場合は繰り返す | 必須 |
| `--to NODE` | 探索で見つかった中から、このノードへの最小ホップ数の経路を報告する | なし |
| `--direction out\|in\|both` | 矢印に沿って、矢印に逆らって、またはその両方 | `out` |
| `--type A,B` | これらのリレーションシップ型のみをたどる | すべての型 |
| `--max-hops N` | 開始点からのステップ数。最大 16 | 3 |
| `--max-nodes N` | 返されるノード数。最大 2,000 | 200 |
| `--max-edges N` | 返されるリレーションシップ数。最大 5,000 | 500 |

出力の各ホップには、`Internet -[ROUTES_TO]-> shop` のような `text` があります。まず `complete` を読んでください。これが false の場合、`limits` にたどり方を途中で打ち切った上限が示されます。したがって、経路が見つからないことは「これらの上限の範囲内にはない」という意味であり、「経路が存在しない」という意味ではありません。上限を超える値は、引き下げられるのではなく拒否されます。

経路はデータ内で見つかった候補です。何かに到達できることの証明ではなく、経路がないことは安全であることの証明ではありません。

## 証拠 {#evidence}

`khonsu graph evidence` は、ノードまたはリレーションシップを何が支えているかを示します。どのソースとプラグインがそれを書き込んだか、最後にいつ変更されたか、そのソースの最後の同期が完全だったかどうかです。

```sh
khonsu graph evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| フィールド | 意味 |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` または `rel:<khonsu_id>`。所見を報告する際に引用する |
| `source`、`plugin` | レコードを書き込んだもの |
| `record_written_at` | レコードが最後に変更された時刻であり、最後に確認された時刻ではない |
| `source_last_successful_sync` | ソースの最後の同期が失敗した場合は不明 |
| `source_coverage` | ソースの最後の実行: `complete`、`partial`、`failed`、`cancelled`、およびギャップ |
| `assertion` | `explicit`(ソースが報告した)、`derived`、`unknown` |
| `properties`、`redacted` | レコード自身のプロパティと、秘密の可能性があるとしてマスクされた名前 |

来歴のフィールドは、値がわかっているか、明示的に不明であるかのどちらかです。推定されることはありません。`--to` を付けると、`khonsu graph explore` は `path.evidence` を追加します。これは経路が依存している証拠 ID を一覧にした派生レコードです。

リレーションシップがどの程度強く知られているかは、そのプロパティにおける慣習です。`confidence` は `confirmed`、`inferred`、`unconfirmed` のいずれかで、`evidence` は何がそれを示したかを表します。経路の強さは最も弱いホップと同じです。1 つの `unconfirmed` リレーションシップがあれば、経路は未確認になります。

## プラグインの分析 {#plugin-analyses}

プラグインは、自分のドメイン向けのルールを同梱できます。`khonsu plugin describe ID` がそれらを一覧表示し、`khonsu plugin analyze` が 1 つを実行します:

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

AWS の `exposure` 分析は、`potential_exposure`、`insufficient_data`、`not_indicated` のいずれかの判定を持つ検出結果を返します。各検出結果は、そのルール、チェックした条件とその背後のフィールド、評価できなかったもの(`unknowns`)、ルールが読まないもの(`assumptions`)、および `khonsu graph explore` に渡せる `walk` を明示します。検出結果は設定を説明するものです。リソースに到達可能であることや、安全であることを述べるものではありません。

## 保存された調査 {#saved-investigations}

保存された調査は、たどり方の開始点とフィルター、選択した経路、クエリ、ダッシュボードを、専用のファイルに保持します。保存してもグラフには何も書き込まれません。

```sh
khonsu investigate save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigate reopen web.investigation
```

再び開くと、現在のグラフに対してたどり方を再実行し、保存時との違いを報告します。まず `graph_state` を読んでください:

| `graph_state` | 意味 |
| --- | --- |
| `unchanged` | グラフは保存時の内容を保っている |
| `changed` | 何かが異なる。`differences` はわかる範囲を示し、完全なリストではない |
| `not_compared` | グラフが 200,000 を超えるノードまたはリレーションシップを持つため、ハッシュ化されず、件数が一致している |

変わった答えが、保存された答えを黙って置き換えることはありません。`path_same` は、経路が依然として同じレコードに依存しているかを示します。`missing_seeds` と `target_missing` は、失われた保存済みのレコードを明示します。`unsure` は、変更されたグラフ上で内部 ID のみによって見つかったレコードを一覧にします。`incomplete_sources` は、最後の同期が完全でなかったソースを明示します。

何も変更しない再同期では、グラフは `unchanged` のままです。比較はラベル、型、端点、プロパティを対象とし、内部 ID と同期時刻は除外します。

ファイルは JSON です。グラフのパス、データソース ID、安定したレコード ID、フィルターを保持します。ソースの設定や認証情報は決して保持しません。グラフのパスにはユーザー名が含まれることがあるため、ファイルを共有する前に確認してください。

## スナップショットと差分 {#snapshots}

スナップショットは、後から何が変わったかを尋ねられるように、グラフのレコードを安定した ID ごとにファイルへ保持します。スナップショットは手動で取得します。同期の実行時に自動で取得されることはありません。

```sh
khonsu graph snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu graph snapshot save tuesday.snapshot.json --db graphs/aws
khonsu graph snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu graph snapshot check monday.snapshot.json --db graphs/aws
```

| リスト | 意味 |
| --- | --- |
| `added` | 後のスナップショットにのみ存在する |
| `removed` | 失われており、後のスナップショットでソースの最後の同期が complete だった |
| `not_seen` | 後のスナップショットに存在しないが、ソースが完全に読み取られたことを示すものがない。まだ存在する可能性がある |
| `changed` | 同じ安定した ID で、プロパティ、ラベル、端点が異なる |

レコードが `removed` になるのは、後のスナップショットがそれを裏付けられる場合だけです。部分的な同期や失敗した同期の後は `not_seen` に残り、`warnings` がその理由を示します。

スナップショットは、グラフのパス、ソースの設定、認証情報を保持せず、秘密に見えるものはマスクされます。ただし、データのその他のプロパティは保持するため、ファイルはグラフと同様に扱ってください。

## ウィンドウでの操作

グラフキャンバスでノードを選択し、**Path Explorer** を使ってそこからたどります。**Save investigation…** は、現在のフィルター、最後のたどり方の開始点、選択したノードへの経路、タブのクエリを保持します。**Graph > Open investigation…**、または `khonsu open web.investigation` で、新しいタブで調査を開き直せます。保存時と異なる点は、キャンバス上の警告として表示されます。

## 制限

- `khonsu graph explore` と `khonsu investigate` には、グラフが空いている必要があります。ウィンドウがグラフを開いている間は、kind `locked` で失敗します。代わりにウィンドウの Path Explorer を使用してください。
- 200,000 を超えるノードまたはリレーションシップを持つグラフはスナップショットを取得できず、kind `too_large` で失敗します。
- 手作業で書き込まれたレコードには安定した ID がありません。差分では件数に数えられますが、比較はされません。
- ウィンドウにはまだスナップショットや差分のビューがありません。

[CLI リファレンス](./cli) にすべてのコマンドが一覧されています。グラフ全体に対する中心性、コミュニティ、最短経路については、[グラフ分析](./analysis) を参照してください。
