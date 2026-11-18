---
description: 온톨로지 파일과 매핑 파일로 그래프 레이블의 의미를 밝히고, 그래프가 질문에 답할 수 있는지 확인하고, 개념이 어떻게 연결되는지 찾고, 온톨로지의 용어로 쿼리합니다.
---
# 온톨로지

그래프의 레이블은 레코드가 어디서 왔는지를 말합니다: `Host`, `EntraUser`, `WazuhAgent`. 온톨로지는 그것이 무엇인지를 말합니다: `Device`, `Account`. 온톨로지가 있으면 어떤 데이터 소스로 그래프를 만들었든 같은 용어로 질문할 수 있고, 사용자나 AI 에이전트는 쿼리를 쓰기 전에 그래프가 그 질문에 답할 수 있는지 확인할 수 있습니다.

::: info 다음 릴리스에서 제공
온톨로지 명령, `--semantic`, `--validate-only`는 0.3.0 다음 릴리스에서 제공됩니다.
:::

온톨로지는 파일에 있으며 그래프에는 기록되지 않습니다. 그래프는 데이터 소스가 기록한 것만 담고, [`khonsu graph rebuild`](./troubleshooting#old-format)는 데이터 소스로부터 그래프를 다시 만들기 때문에, 그래프에만 있는 것은 사라집니다.

## 개념과 매핑 {#files}

**온톨로지 파일**(`*.ontology.json`)은 개념과, 개념 사이에 허용되는 관계를 선언합니다:

```json
{
  "format": "khonsu-ontology",
  "version": 1,
  "id": "attack",
  "revision": "0.1.0",
  "concepts": [
    { "name": "Technique", "description": "An ATT&CK technique.", "synonyms": ["ttp"] }
  ],
  "relationships": [
    { "name": "indicates", "from": "Entity", "to": "Technique" }
  ]
}
```

개념은 다른 개념을 `extends`할 수 있고, 관계는 양 끝을 확장하는 모든 개념에 성립합니다. `Agent`에서 `Account`로 가는 `holds`는 `Person`과 `Account`도 잇습니다.

**매핑 파일**(`*.mapping.json`)은 그래프의 레이블과 관계 유형이 무엇인지 말합니다:

```json
{
  "format": "khonsu-mapping",
  "version": 1,
  "id": "security-example",
  "revision": "1",
  "status": "draft",
  "labels": [{ "label": "Host", "concept": "Device" }],
  "relationship_types": [{ "type": "RAN_ON", "relationship": "runs_on" }]
}
```

사람이 검토하고 `"status": "certified"`로 설정하기 전까지는 모두 `draft`입니다. 답변은 근거로 삼은 초안을 `drafts`에 나열합니다.

## 라이브러리를 읽는 곳 {#library}

다음 순서로 읽으며, 같은 ID는 먼저 나온 것이 쓰입니다:

1. **내장**: 모든 조사에 공통인 약 20개 개념(`Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event`, `Observation` 등)과 그 사이의 관계.
2. KhonsuGraph 설정 폴더의 `ontology/`.
3. 설치된 각 플러그인 폴더의 `ontology/`. 플러그인은 자신이 기록하는 레이블의 의미를 함께 제공할 수 있습니다.
4. 전달한 각 `--ontology PATH`(파일 또는 폴더).

사용할 수 없는 파일은 `problems`에 보고되고 제외되며, 나머지는 그대로 읽힙니다. 리포지터리의 보안 예제에는 [ATT&CK 팩과 매핑](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology)이 있습니다.

## 쿼리 전에 확인하기 {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # 매핑된 것과 매핑되지 않은 것
khonsu graph ontology resolve machine login ip            # 단어의 의미
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe**는 개념과 관계를 나열하고, `--concept`로 한 개념의 전체 정보를 보여 줍니다. `--db`를 주면 라이브러리와 그래프를 비교합니다: 매핑된 레이블(개수 포함), 매핑되지 않은 레이블과 관계 유형, 매핑되었지만 그래프에 없는 레이블.
- **resolve**는 각 단어의 의미를 알려 줍니다: 이름이나 동의어로 일치하는 개념 또는 관계, 또는 매핑이 의미를 부여한 레이블. 아무 의미도 없는 단어에는 `suggestions`가 붙습니다.
- **check**는 질문이 다루는 각 대상에 대해 그래프에 레코드가 있는지 알려 줍니다. 항목은 `unknown_term`, `no_mapping`, `not_in_graph` 중 하나로 `missing`에 들어가며, 이때 명령은 종류 `not_investigable`로 **3**을 반환하며 종료합니다.
- **path**는 한 개념에서 다른 개념까지 홉 수가 가장 적은 경로를 알려 줍니다: 선언된 관계를 따르는 경로와, `--db`를 주면 그래프에 실제로 있는 패턴을 따르는 경로. 각각 `MATCH`에 바로 쓸 수 있는 Cypher `pattern`이 함께 나옵니다. 경로는 데이터가 연결되는 방식일 뿐, 그 경로를 따라 무언가 일어났다는 증거가 아닙니다.

모든 답변에는 `ontology_versions`(사용한 파일의 ID, 리비전, 출처)가 포함됩니다.

## 온톨로지의 용어로 쿼리하기 {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

`--semantic`을 쓰면 레이블로 쓴 개념은 이 그래프에서 그 개념이나 그 확장에 매핑된 모든 레이블로, 관계는 그에 매핑된 유형으로 바뀝니다: `(d:Device)`는 `(d:Host:Server)`가 되고 `[:runs_on]`은 `[:EXEC_ON|RAN_ON]`이 됩니다. 그래프에 이미 있는 레이블은 그대로 둡니다. 그래프에 해당하는 레코드가 없는 개념은 빈 결과를 반환하지 않고 3으로 종료합니다. 결과의 `semantic`에는 실행된 문장, 각 치환, 사용한 초안이 들어 있습니다. 시맨틱 쿼리는 읽기만 합니다.

## 실행하지 않고 쿼리 확인하기 {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only`는 문장을 그래프와 대조해 확인하고 아무것도 실행하지 않습니다. `--semantic`은 모든 쿼리 전에 같은 확인을 수행합니다.

| 종류 | 심각도 | 내용 |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | 오류 | 그래프에 그런 레이블이나 관계 유형이 없음. `suggestions`에 비슷한 이름이 있음 |
| `wrong_direction` | 오류 | 그래프에는 그 패턴이 반대 방향으로만 있음 |
| `no_such_pattern` | 오류 | 그래프에는 그 패턴이 어느 방향으로도 없음 |
| `unbounded` | 경고 | 상한이 없는 가변 길이 패턴 |
| `cartesian` | 경고 | 한 `MATCH`의 부분들이 변수를 공유하지 않아 그 행의 모든 조합이 반환됨 |

오류가 있으면 종류 `invalid_query`로 2를 반환하며 종료하고, 문제는 `error.detail`에 들어갑니다. 경고는 보고되고 문장은 실행됩니다. 전체 참고 문서는 [소스 리포지터리](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md)에 있습니다.
