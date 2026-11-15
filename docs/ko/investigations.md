---
description: khonsu explore로 그래프의 경로를 추적하고, 각 레코드의 근거가 되는 증거를 인용하고, 조사를 저장하고, 데이터가 바뀐 뒤 다시 확인합니다.
---
# 조사

조사는 시작점에서 답까지 관계를 따라갑니다. 인터넷에서 이 인스턴스로 이어지는 경로는 무엇인지, 실패한 서비스가 무엇을 함께 무너뜨리는지, 기업 뒤에는 누가 있는지 같은 질문입니다. KhonsuGraph는 나중에 답을 검증할 수 있도록 네 가지를 분리해 둡니다. 경로, 경로 위 각 레코드의 증거, 저장된 조사, 그리고 그 이후 그래프에서 바뀐 것입니다.

이 명령들은 KhonsuGraph 0.3.0에서 추가되었습니다. 설치된 버전은 `khonsu --version`으로 확인하십시오.

## 경로 따라가기 {#explore}

`khonsu explore`는 그래프 전체를 로드하지 않고 하나 이상의 노드에서 바깥으로 걸어갑니다. 창에서는 같은 탐색이 그래프 캔버스의 **경로 탐색기**(Path Explorer)입니다.

```sh
khonsu explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from`과 `--to`는 `khonsu_id`(동기화된 모든 레코드가 지니는 안정적인 ID) 또는 숫자 노드 ID를 받습니다. 위 ID는 [예제](./examples#aws-exposure)에 나오는 것과 같은 AWS 그래프에서 가져온 예시이므로, `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5` 같은 쿼리로 자신의 ID를 읽으십시오.

| 옵션 | 의미 | 기본값 |
| --- | --- | --- |
| `--from NODE` | 시작 노드입니다. 여러 개를 지정하려면 반복하십시오 | 필수 |
| `--to NODE` | 탐색이 찾은 것 중 이 노드까지의 최소 홉 경로를 보고합니다 | 없음 |
| `--direction out\|in\|both` | 화살표를 따라, 화살표 반대로, 또는 양쪽으로 | `out` |
| `--type A,B` | 지정한 관계 유형만 따릅니다 | 모든 유형 |
| `--max-hops N` | 시작점에서 최대 16단계 | 3 |
| `--max-nodes N` | 반환되는 노드, 최대 2,000개 | 200 |
| `--max-edges N` | 반환되는 관계, 최대 5,000개 | 500 |

출력의 각 홉에는 `Internet -[ROUTES_TO]-> shop` 같은 `text`가 있습니다. `complete`를 먼저 읽으십시오. 이 값이 false이면 `limits`가 탐색을 중단시킨 상한을 알려 주므로, 경로가 없다는 것은 "이 상한 안에서는 없다"는 뜻이며 "경로가 없다"는 뜻이 아닙니다. 상한을 넘는 값은 낮추지 않고 거부됩니다.

경로는 데이터에서 찾은 후보입니다. 무언가에 도달할 수 있다는 증명이 아니며, 경로가 없다고 해서 안전하다는 증명도 아닙니다.

## 증거 {#evidence}

`khonsu evidence`는 노드나 관계를 무엇이 뒷받침하는지 알려 줍니다. 어떤 소스와 플러그인이 기록했는지, 마지막으로 언제 바뀌었는지, 그 소스의 마지막 동기화가 완전했는지입니다.

```sh
khonsu evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| 필드 | 의미 |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` 또는 `rel:<khonsu_id>`. 발견을 보고할 때 인용하십시오 |
| `source`, `plugin` | 레코드를 기록한 주체 |
| `record_written_at` | 레코드가 마지막으로 바뀐 시점이며, 마지막으로 확인된 시점이 아닙니다 |
| `source_last_successful_sync` | 소스의 마지막 동기화가 실패했으면 알 수 없습니다 |
| `source_coverage` | 소스의 마지막 실행 결과인 `complete`, `partial`, `failed`, `cancelled`와 누락 범위 |
| `assertion` | `explicit`(소스가 보고함), `derived`, `unknown` |
| `properties`, `redacted` | 레코드 자체의 속성과 비밀로 의심되어 마스킹된 이름 |

출처 필드는 값을 아는 상태이거나 명시적으로 알 수 없음 상태이며, 추정하지 않습니다. `--to`를 사용하면 `khonsu explore`가 경로가 기대는 증거 ID를 나열하는 파생 레코드 `path.evidence`를 추가합니다.

관계가 얼마나 강하게 알려져 있는지는 그 속성에 담긴 관례입니다. `confidence`는 `confirmed`, `inferred`, `unconfirmed` 중 하나이며, `evidence`는 무엇이 그것을 보여 주었는지 나타냅니다. 경로는 가장 약한 홉만큼만 강합니다. `unconfirmed` 관계가 하나라도 있으면 그 경로 역시 확인되지 않은 것으로 취급됩니다.

## 플러그인 분석 {#plugin-analyses}

플러그인은 자체 도메인에 대한 규칙을 함께 제공할 수 있습니다. `khonsu plugin describe ID`가 규칙을 나열하고, `khonsu plugin analyze`가 그중 하나를 실행합니다.

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

AWS `exposure` 분석은 `potential_exposure`, `insufficient_data`, `not_indicated` 중 하나의 판정과 함께 발견을 반환합니다. 각 발견은 자신의 규칙, 검사한 조건과 그 근거 필드, 평가할 수 없었던 것(`unknowns`), 규칙이 읽지 않는 것(`assumptions`), 그리고 `khonsu explore`에 넘길 수 있는 `walk`를 알려 줍니다. 발견은 구성을 설명합니다. 리소스에 도달할 수 있는지 또는 안전한지는 말하지 않습니다.

## 저장된 조사 {#saved-investigations}

저장된 조사는 탐색의 시작점과 필터, 선택한 경로, 쿼리, 대시보드를 자체 파일에 보관합니다. 저장해도 그래프에는 아무것도 기록되지 않습니다.

```sh
khonsu investigation save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigation reopen web.investigation
```

다시 열면 현재 그래프에서 탐색을 다시 실행하고 저장했을 때와 무엇이 다른지 알려 줍니다. `graph_state`를 먼저 읽으십시오.

| `graph_state` | 의미 |
| --- | --- |
| `unchanged` | 그래프가 저장했을 때와 같은 내용을 담고 있습니다 |
| `changed` | 무언가 다릅니다. `differences`가 알 수 있는 만큼 제공하며, 전체 목록은 아닙니다 |
| `not_compared` | 그래프에 200,000개를 넘는 노드나 관계가 있어 해시하지 않았고, 개수는 일치합니다 |

바뀐 결과가 저장된 결과를 조용히 대체하는 일은 없습니다. `path_same`은 경로가 여전히 같은 레코드에 기대는지 알려 줍니다. `missing_seeds`와 `target_missing`은 사라진 저장 레코드를 알려 줍니다. `unsure`는 바뀐 그래프에서 내부 ID로만 찾은 레코드를 나열합니다. `incomplete_sources`는 마지막 동기화가 완전하지 않았던 소스를 알려 줍니다.

아무것도 바꾸지 않는 재동기화는 그래프를 `unchanged`로 남깁니다. 비교는 레이블, 유형, 양 끝, 속성을 포함하고 내부 ID와 동기화 시각은 제외합니다.

파일은 JSON입니다. 그래프의 경로, 데이터 소스 ID, 안정적인 레코드 ID, 필터를 담습니다. 소스 구성이나 자격 증명은 담지 않습니다. 그래프 경로에 사용자 이름이 포함될 수 있으므로 파일을 공유하기 전에 확인하십시오.

## 스냅샷과 비교 {#snapshots}

스냅샷은 그래프의 레코드를 안정적인 ID 기준으로 파일에 보관하므로, 나중에 무엇이 바뀌었는지 물을 수 있습니다. 스냅샷은 직접 만들어야 하며, 동기화가 실행될 때 자동으로 만들어지는 것은 없습니다.

```sh
khonsu snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu snapshot save tuesday.snapshot.json --db graphs/aws
khonsu snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu snapshot check monday.snapshot.json --db graphs/aws
```

| 목록 | 의미 |
| --- | --- |
| `added` | 나중 스냅샷에만 있습니다 |
| `removed` | 사라졌고, 나중 스냅샷에서 소스의 마지막 동기화가 완전했습니다 |
| `not_seen` | 나중 스냅샷에 없지만, 소스가 완전히 읽혔다는 근거가 없습니다. 여전히 존재할 수 있습니다 |
| `changed` | 같은 안정적인 ID인데 속성, 레이블, 양 끝이 다릅니다 |

레코드는 나중 스냅샷이 이를 뒷받침할 때만 `removed`가 됩니다. 부분 동기화나 실패한 동기화 뒤에는 `not_seen`에 남고, `warnings`가 그 이유를 알려 줍니다.

스냅샷은 그래프의 경로, 소스 구성, 자격 증명을 담지 않으며, 비밀로 보이는 것은 마스킹됩니다. 다만 데이터의 다른 속성은 담으므로, 그래프를 다루듯이 파일을 다루십시오.

## 창에서

그래프 캔버스에서 노드를 선택하고 **경로 탐색기**로 그 노드에서 걸어가십시오. **조사 저장…**은 현재 필터, 마지막 탐색의 시작점, 선택한 노드까지의 경로, 탭의 쿼리를 보관합니다. **그래프 > 조사 열기…** 또는 `khonsu open web.investigation`은 조사를 새 탭에서 다시 엽니다. 저장했을 때와 다른 점은 캔버스에 경고로 표시됩니다.

## 제한

- `khonsu explore`와 `khonsu investigation`은 그래프가 비어 있어야 합니다. 창이 그래프를 열고 있으면 종류 `locked`로 실패하므로, 대신 창에서 경로 탐색기를 사용하십시오.
- 200,000개를 넘는 노드나 관계가 있는 그래프는 스냅샷을 만들 수 없고 종류 `too_large`로 실패합니다.
- 직접 작성한 레코드에는 안정적인 ID가 없습니다. 개수에는 포함되지만 diff에서 비교되지는 않습니다.
- 창에는 아직 스냅샷이나 diff 보기가 없습니다.

[CLI 참조](./cli)에 모든 명령이 나열되어 있습니다. 그래프 전체에 대한 매개 중심성, 커뮤니티, 최단 경로는 [그래프 분석](./analysis)을 참고하십시오.
