---
description: 소스 플러그인을 사용해 CSV 파일, AWS 계정, Neo4j 또는 Cartography 데이터베이스를 노드와 관계로 이루어진 로컬 그래프로 변환합니다.
---
# 데이터 소스

플러그인은 외부 시스템을 노드와 관계로 변환합니다. KhonsuGraph는 플러그인을 별도 프로세스로 실행하고 그 레코드를 그래프에 기록합니다.

## CSV

내장 CSV 플러그인은 행을 노드와 관계로 매핑합니다. 안정적인 ID, 소스, 대상 열을 선택하십시오. 나머지 열은 속성이 됩니다. 숫자와 불리언 값은 기본적으로 추론됩니다. 텍스트로 유지하려면 `infer_types=false`를 설정하십시오.

전체 가져오기 예제는 [시작하기](./getting-started)를 참고하십시오. 노드 레이블이나 관계 유형이 섞여 있는 경우에는 `nodes`와 `edges` JSON 설정을 사용하십시오. 이 JSON 안의 경로는 절대 경로여야 합니다. 플러그인은 자체 폴더에서 실행되며, 단일 파일 필드만 자동으로 절대 경로로 변환됩니다.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

AWS 플러그인은 AWS CLI를 사용해 VPC, 서브넷, 보안 그룹, 인스턴스, 로드 밸런서, IAM 역할을 읽습니다. 먼저 AWS CLI를 설치하고 구성한 뒤, 사용자가 관리하는 읽기 전용 프로파일을 사용하십시오. `regions`는 `us-east-1,eu-west-1`처럼 쉼표로 구분한 목록입니다.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

이 작업은 구성된 AWS 계정에 접속합니다. 오프라인으로 따라 해 보려면 앱 리포지터리에 저장된 픽스처를 대신 사용하십시오. [예제](./examples)를 참고하십시오.

<a href="/docs/samples/exposure.dash" download>AWS 노출 대시보드</a>는 이 플러그인이 가져온 관계를 사용해 `Cidr → SecurityGroup ← Instance → Role`을 추적합니다.

## Neo4j와 Cartography {#neo4j}

0.3.0에서 추가된 Neo4j 플러그인은 Neo4j의 HTTP API를 통해 Neo4j 데이터베이스의 노드와 관계를 로컬 그래프로 복사합니다. 읽기 쿼리만 보냅니다. 주된 용도는 AWS, GCP, Azure, Kubernetes, GitHub, Okta 등을 Neo4j로 가져오는 [Cartography](https://github.com/cartography-cncf/cartography)이며, 어떤 Neo4j 데이터베이스든 사용할 수 있습니다.

```sh
khonsu init graphs/infra
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

주소는 `bolt://`가 아니라 Neo4j의 HTTP 주소이며 기본값은 7474입니다. 비밀번호는 시스템 키체인에 보관되며, 읽기 역할만으로 충분합니다.

HawDB는 노드마다 레이블을 하나만 가지므로, 각 노드는 Neo4j 레이블 중 하나(보통 가장 희귀한 것)를 취하고 나머지는 모두 `neo4j_labels`에 보관합니다. `MATCH (p:AWSPrincipal)`이 아무것도 반환하지 않으면 `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`를 시도하십시오. Neo4j용으로 작성한 쿼리는 수정이 필요할 수 있습니다. [쿼리 제한 사항](./queries#current-limitations)과 [플러그인의 README](https://github.com/JetSquirrel/KhonsuGraph/tree/main/plugins/neo4j)를 참고하십시오.

## 동기화 방식 {#sync-semantics}

- 안정적인 ID가 있으면 반복 가져오기가 기존 레코드를 갱신합니다.
- 전체 동기화는 이 소스에서 이전에 가져온 레코드 중 새 결과에 없는 레코드를 제거합니다.
- 증분 동기화는 플러그인이 지원하는 경우 레코드를 추가하거나 갱신만 합니다. `--append`는 모든 소스에 대해 같은 일을 합니다. 파일에 마지막 동기화 이후 새로 생긴 것만 들어 있을 때 사용하십시오.
- 변경되지 않은 레코드는 다시 기록되지 않으므로, 동기화 보고서의 `nodes_written`과 `edges_written`은 변경된 항목을 셉니다.
- 동기화가 실패하면 이미 기록된 레코드가 남을 수 있습니다. 다음에 성공한 동기화가 이들을 정리합니다.
- 끝점을 알 수 없는 관계는 건너뛰고 `skipped_edges`에 집계됩니다.

가져온 레코드에는 `khonsu_id`, `khonsu_source`, `khonsu_plugin`, `khonsu_synced_at`이 포함되며, [증거](./investigations#evidence)가 이들을 다시 읽습니다. 앱이 그래프를 열고 있는 동안에는 `khonsu plugin sync`가 해당 창을 통해 실행되어 진행 상황을 표시하고 열려 있는 대시보드를 다시 실행합니다. 쿼리 쓰기는 그곳에서 그래프가 닫혀 있어야 합니다.

## 기타 시스템

플러그인의 권한을 검토한 뒤에만 설치하십시오. 권한은 선언일 뿐 운영체제 샌드박스가 아닙니다. 비밀 설정 필드는 시스템 키체인에 저장됩니다. [플러그인 개발](./plugins)을 참고하십시오.
