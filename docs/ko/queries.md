---
description: Cypher로 그래프를, SQL로 테이블을 조회하고 캔버스와 현재 HawDB 제한을 이해합니다.
---
# Cypher & SQL

## 쿼리 전에 확인하기

```sh
khonsu schema --db graphs/demo
```

결과에는 레이블, 관계 유형, 속성 이름, 개수, 관계 패턴, SQL 테이블이 나열됩니다. 다른 그래프의 스키마를 가정하지 말고 이 이름들을 사용하십시오.

## 연결 반환하기

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

노드와 관계 전체를 반환하면 테이블 값과 그래프 요소를 모두 얻습니다. `a.name`만 반환하면 연결된 그래프가 아니라 스칼라 열만 얻게 됩니다. CLI에서는 그래프 요소가 별도의 `graph` 객체에 나타납니다.

Cypher는 `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`와 범위가 지정된 가변 길이 패턴을 지원합니다. `--write`를 사용하면 `CREATE`, `MERGE`, `SET`, `DELETE`, `DETACH DELETE`도 사용할 수 있습니다. 예를 들어 서비스 그래프에서는 다음과 같습니다.

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

이 쿼리는 끝점들을 반환합니다. 그 사이를 연결하는 관계를 그리려면 한 홉 관계를 별도로 조회하십시오.

## SQL과 매개변수

SQL 쿼리는 같은 HawDB 디렉터리의 테이블에 대해 PostgreSQL 방언 SQL로 동작합니다. 그래프를 가져왔다고 해서 같은 이름의 SQL 테이블이 생기지는 않습니다. 먼저 `schema`를 확인하십시오. 다음 예제는 `assets` 테이블이 있어야 동작합니다.

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` 값은 가능하면 JSON으로 파싱하고, 그렇지 않으면 문자열로 처리합니다. SQL은 위치 매개변수를 사용합니다(`$1`과 `-p 1=value`).

## 현재 제한 사항 {#current-limitations}

확인된 소스는 HawDB 0.12.0을 사용합니다.

- Cypher의 `sum()`, `labels()`, `keys()`, `properties()`, `shortestPath`, 경로 변수, `CALL db.*`, `SHOW`는 이 워크플로에서 지원되지 않습니다. 메타데이터에는 `khonsu schema`를 사용하십시오.
- `count`, `collect`, `min`, `max`, `avg`는 지원되는 집계 함수입니다.
- 가변 길이 패턴은 관계 유형이 있어야 하며 관계 변수를 사용할 수 없습니다.
- `UNWIND` 뒤에는 쓰기 절이 와야 합니다. 단독 읽기 전용 `UNWIND`와 `WHERE true`는 지원되지 않습니다.
- `OPTIONAL MATCH`, 스칼라 `IN`, JSON 텍스트에 대한 `json_value()`, 관계 속성 `SET`은 지원됩니다.
- 읽기 실행에는 100,000행 상한이 있습니다. `--max-rows`는 실행 후 표시되는 행만 제한하므로, 쿼리에도 `LIMIT`을 사용하십시오.
- 벡터 값은 JSON 숫자 배열로 반환됩니다. 엔진이 열 순서를 바꿀 수 있으므로 결과 열은 이름으로 읽으십시오.

## 읽기 및 쓰기 접근

CLI 쿼리는 기본적으로 읽기 전용입니다. `--write`가 쓰기를 명시적으로 활성화합니다. 한 번에 하나의 프로세스만 그래프 디렉터리를 소유합니다. 앱이 그래프를 열고 있는 동안에는 CLI 읽기 쿼리와 대시보드 검사가 해당 창을 통해 라우팅됩니다. 쓰기와 동기화는 그곳에서 그래프가 닫혀 있어야 합니다.
