---
description: 그래프 대시보드를 평문 .dash 파일로 작성하고 에이전트로 검토합니다.
---
# 대시보드

`.dash` 파일은 평문입니다. 이름이 붙은 쿼리, 플롯, 필터로 구성됩니다. 이 파일은 현재 앱에서 열려 있는 그래프를 읽습니다. 데이터는 플러그인을 통해 별도로 가져오며, `source` 블록은 없습니다.

## 첫 그래프 패널 만들기

[시작하기](./getting-started)를 마친 뒤 다음 내용을 `overview.dash`로 저장하십시오.

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check`는 각 쿼리를 읽기 전용으로 실행하고, 플롯 열을 검증하며, 필터를 실제 값으로 시험합니다. 대시보드를 열거나 공유하기 전에 보고된 오류를 모두 수정하십시오.

## 플롯과 레이아웃

플롯 유형에는 `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text`, `graph`가 있습니다. `width`는 1–12열 범위입니다. 그래프 쿼리는 노드와 관계 전체를 반환하며, `caption`은 레이블로 표시할 노드 속성을 지정합니다. `group`은 속성 기준으로 노드를 그룹화할 수 있습니다.

## 공유 필터

테이블 행, 막대, 그래프 노드가 필터를 구동할 수 있습니다. 다음 예제에서 테이블 쿼리는 `service`를 반환하고, 다른 쿼리는 `WHERE $service`를 사용합니다.

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

플레이스홀더는 `WHERE` 조건 전체여야 하며, 선택적으로 `AND`로 연결할 수 있습니다. Cypher에서는 선택한 값을 `match` 표현식과 비교하고, SQL에서는 열 자체와 비교하므로 `match`가 필요하지 않습니다. 선택하지 않은 조건은 제거되며, 소스 플롯은 자기 자신을 필터링하지 않습니다. 전체 [리포지터리 예제](./examples)에는 이런 연동 쿼리와 플롯이 포함되어 있습니다.

## 에이전트로 검토하기

앱에서 플롯에 댓글을 남기십시오. 에이전트는 댓글을 읽고, 파일을 편집하고, `check`를 실행한 뒤 답변합니다. 댓글은 대시보드 옆의 `FILE.comments.json`에 저장됩니다. 프레즌스는 에이전트가 편집 중인 플롯을 식별할 수 있게 하며, 파일이 변경되면 창이 다시 그려집니다.

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

이 형식에는 임의 함수, 조건문, 데이터에 따라 달라지는 스타일링이 없습니다. 검토 명령은 [CLI 및 에이전트](./cli)를 참고하십시오.
