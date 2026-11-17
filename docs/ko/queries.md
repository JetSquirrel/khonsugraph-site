---
description: 로컬 그래프를 Cypher로, 테이블을 PostgreSQL SQL로 조회합니다. 지원되는 Cypher 절, 최단 경로, 매개변수, 현재 HawDB 제한을 다룹니다.
---
# Cypher 및 SQL

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

Cypher는 `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE`와 범위가 지정된 가변 길이 패턴을 지원합니다. `--write`를 사용하면 `CREATE`, `MERGE`, `SET`, `DELETE`, `DETACH DELETE`도 사용할 수 있습니다. 예를 들어 서비스 그래프에서는 다음과 같습니다.

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

이 쿼리는 끝점들을 반환합니다. 그 사이를 연결하는 관계를 그리려면 한 홉 관계를 별도로 조회하십시오.

## 최단 경로

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)`, `relationships(p)`도 동작합니다. 두 끝점은 속성 맵, `WHERE` 또는 앞선 절에 의해 바인딩되어야 합니다. `p`를 반환하면 캔버스에 경로가 그려집니다. 상한이 없는 `*`는 256홉에서 멈추고 경로가 없다고 보고하는 대신 실패합니다.

홉 수와 크기에 상한을 두고 노드에서 바깥으로 걸어가려면 [`khonsu graph explore`](./investigations#explore)를 사용하십시오. 가중 경로, 매개 중심성, 커뮤니티는 [그래프 분석](./analysis)을 참고하십시오.

## SQL과 매개변수

SQL 쿼리는 같은 HawDB 디렉터리의 테이블에 대해 PostgreSQL 방언 SQL로 동작합니다. 그래프를 가져왔다고 해서 같은 이름의 SQL 테이블이 생기지는 않습니다. 먼저 `schema`를 확인하십시오. 다음 예제는 `assets` 테이블이 있어야 동작합니다.

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` 값은 가능하면 JSON으로 파싱하고, 그렇지 않으면 문자열로 처리합니다. SQL은 위치 매개변수를 사용합니다(`$1`과 `-p 1=value`).

## 현재 제한 사항 {#current-limitations}

KhonsuGraph 0.3.0은 HawDB 0.29.0을 사용하며, 그 Cypher는 다른 그래프 데이터베이스와 다릅니다.

- `labels()`, `keys()`, `properties()`, `CALL db.*`, `SHOW`는 지원되지 않습니다. 메타데이터에는 `khonsu schema`를 사용하십시오.
- `count`, `sum`, `collect`, `min`, `max`, `avg`가 지원되는 집계 함수이며, 표현식에 대해서도 사용할 수 있습니다.
- 읽기는 `MATCH` 또는 `UNWIND`로 시작합니다. 단독 `RETURN 1`은 파싱되지 않으며, `OPTIONAL MATCH`는 첫 절이 될 수 없습니다.
- 가변 길이 패턴은 관계 유형이 필요하고 관계 변수를 사용할 수 없습니다. 유형이 없는 관계 패턴은 한 홉에만 동작합니다.
- 경로 변수는 `shortestPath`와 `allShortestPaths`에서만 동작합니다.
- 문자열은 `+`로 연결할 수 없으며, `toLower`, `toUpper`, `reduce`, `any`, `all`, `none`, `exists`는 사용할 수 없습니다.
- `CREATE`는 문장당 패턴 하나를 받습니다. `LOAD CSV`는 꺼져 있으므로 [데이터 소스](./data-sources)로 파일을 가져오십시오.
- 스칼라 `IN`, 리스트 컴프리헨션, JSON 텍스트에 대한 `json_value()`, 날짜와 기간, 관계 속성 `SET`은 지원됩니다.
- 읽기에는 100,000행 실행 상한이 있습니다. `--max-rows`는 실행 후 표시되는 행만 제한하므로, 쿼리에도 `LIMIT`을 사용하십시오.
- 벡터 값은 JSON 숫자 배열로 반환됩니다. 열은 `RETURN` 순서대로 반환되지만, 여전히 이름으로 읽으십시오.
- `WHERE true`는 Cypher에서는 동작하지만 SQL에서는 동작하지 않습니다.

HawDB 0.25 이전에, 즉 KhonsuGraph 0.2.0 이하에서 작성한 그래프는 이 버전에서 읽을 수 없습니다. [문제 해결](./troubleshooting#old-format)을 참고하십시오.

## 읽기 및 쓰기 접근

CLI 쿼리는 기본적으로 읽기 전용입니다. `--write`가 쓰기를 명시적으로 활성화합니다. 한 번에 하나의 프로세스만 그래프 디렉터리를 소유합니다. 앱이 그래프를 열고 있는 동안에는 CLI 읽기 쿼리와 대시보드 검사가 해당 창을 통해 라우팅됩니다. 쓰기와 동기화는 그곳에서 그래프가 닫혀 있어야 합니다.
