---
description: khonsu 명령줄은 모든 명령에서 JSON을 출력하므로 Claude Code와 기타 AI 에이전트가 그래프를 확인하고, 조회하고, 경로를 추적하고, 대시보드를 작성할 수 있습니다.
---
# CLI 및 AI 에이전트

데스크톱 앱과 CLI는 하나의 실행 파일을 공유합니다. 인수 없이 `khonsugraph`를 실행하면 앱이 열리고, 하위 명령을 주면 그 명령을 실행한 뒤 종료합니다. 제목 표시줄의 **명령줄 및 AI** 버튼(로봇 아이콘)은 `khonsu`를 PATH에 설치하고 Claude Code용 스킬을 설치할 수 있습니다.

[에이전트 스킬](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph)은 에이전트에게 스키마 우선 워크플로와 지원되는 Cypher 하위 집합을 가르칩니다.

## 명령 참조

| 명령 | 목적 |
| --- | --- |
| `khonsu graph init DIR` | 빈 그래프를 만듭니다 |
| `khonsu schema --db DIR` | 레이블, 관계, 속성, 테이블을 확인합니다 |
| `khonsu query --db DIR --cypher "…"` | 읽기 전용 Cypher 문 하나를 실행합니다 |
| `khonsu query --db DIR --sql "…"` | 읽기 전용 SQL 문 하나를 실행합니다 |
| `khonsu query --db DIR --file query.cypher` | 쿼리 파일을 실행합니다. `.sql`이면 SQL을 선택합니다 |
| `khonsu query --db DIR --semantic --cypher "…"` | [온톨로지의 용어로 쿼리](./ontology#semantic): `Device`, `Account`, `runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | 문장을 그래프와 대조해 [확인](./ontology#validate)하고 실행하지 않음 |
| `khonsu graph explain --db DIR --cypher "…"` | 쿼리를 설명합니다 |
| `khonsu graph ontology describe [--db DIR]` | [개념](./ontology)과 그것이 다루는 그래프 레이블 나열 |
| `khonsu graph ontology resolve WORD…` | 단어의 의미: 개념, 동의어, 해당 레이블 |
| `khonsu graph ontology check --db DIR --entities a,b` | 질문이 다루는 각 대상의 레코드가 그래프에 있는지 확인 |
| `khonsu graph ontology path --from A --to B [--db DIR]` | 두 개념이 연결되는 방식을 Cypher 패턴으로 표시 |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [노드에서 바깥으로 걸어가며](./investigations#explore) 경로를 보고합니다 |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | [레코드를 뒷받침하는 근거](./investigations#evidence)를 표시합니다 |
| `khonsu graph analyze ALGORITHM --db DIR` | [그래프 알고리즘](./analysis)을 실행합니다. PageRank, 커뮤니티, 연결 요소 등 |
| `khonsu investigate save FILE --db DIR --from NODE` | [조사를 저장합니다](./investigations#saved-investigations). `reopen FILE`은 조사를 다시 실행합니다 |
| `khonsu graph snapshot save FILE --db DIR` | 그래프의 레코드를 보관합니다. [`snapshot diff A B`](./investigations#snapshots)는 두 스냅샷을 비교합니다 |
| `khonsu graph rebuild --db DIR` | 이전 형식 그래프를 데이터 소스에서 다시 만듭니다 |
| `khonsu plugin list` | 플러그인과 권한을 나열합니다 |
| `khonsu plugin describe ID` | 플러그인의 구성 필드와 출력 유형을 표시합니다 |
| `khonsu plugin search [WORDS]` | [마켓플레이스](./marketplace)에 있는 플러그인을 나열합니다 |
| `khonsu plugin install ID --yes` | 마켓플레이스에서 이름으로 플러그인을 설치하고 승인합니다 |
| `khonsu plugin install DIR --yes` | 플러그인 디렉터리나 ZIP을 설치하고 권한을 승인합니다 |
| `khonsu plugin update` | 마켓플레이스에서 설치한 플러그인을 업데이트합니다. `--dry-run`은 미리 보기만 합니다 |
| `khonsu plugin marketplace list` | 마켓플레이스를 나열합니다. `add`와 `remove`로 변경합니다 |
| `khonsu plugin sync --source ID` | 소스를 동기화합니다. `--dry-run`은 미리 보기, `--incremental`과 `--append`는 제거 없이 추가합니다 |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | AWS `exposure` 같은 [플러그인의 분석](./investigations#plugin-analyses)을 실행합니다 |
| `khonsu source list` | 구성된 소스를 나열합니다 |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | 소스를 구성합니다. `--test`로 먼저 검사합니다 |
| `khonsu source remove ID` | 소스를 제거합니다 |
| `khonsu dash check FILE --db DIR` | 대시보드를 그래프에 대해 검증합니다 |
| `khonsu dash comments FILE` | 플롯 댓글을 나열하고 답변하고 해결합니다 |
| `khonsu dash presence FILE --doing editing --plot NAME` | 창에 편집 중인 플롯을 표시합니다 |
| `khonsu open DIR` | 데스크톱 앱에서 그래프를 엽니다 |
| `khonsu open FILE.dash` | 대시보드를 엽니다 |
| `khonsu open --state` | 실행 중인 창의 그래프와 탭을 읽습니다 |

`--db`는 `KHONSU_DB`를 기본값으로 사용하고, 그다음으로 앱에서 마지막으로 연 그래프를 사용합니다. 자동화에서는 명시적인 경로를 사용하십시오. 쿼리 쓰기에는 `--write`가 필요합니다.

## 출력과 오류

각 명령은 stdout에 JSON 객체 하나를 출력하며, `--pretty`를 주면 들여쓴 형태로 출력합니다. 동기화 진행 상황은 JSON Lines로 stderr에 출력됩니다. 쿼리 결과에는 `columns`, `rows`, `row_count`, `truncated`, `elapsed_ms`가 포함되며, 노드나 관계가 반환되면 `graph`가 추가됩니다.

`--max-rows`의 기본값은 200이며 표시되는 결과를 잘라 냅니다. 쿼리 실행 작업량을 줄이지는 않습니다. 항상 `truncated`를 확인하고 범위가 제한된 쿼리를 사용하십시오.

실패 시에는 `kind`와 `message`, 그리고 선택적인 `detail`을 가진 `error` 객체가 있습니다. stdout을 해석하기 전에 종료 상태를 확인하십시오. 1은 실행 오류, 2는 사용법 또는 대시보드 명세 오류를 나타냅니다.

0.3.0 다음 릴리스부터 종료 코드 2는 쿼리가 [그래프와 맞지 않음](./ontology#validate)(`invalid_query`)도 뜻하고, 3은 질문이 다루는 대상의 레코드가 그래프에 없음(`not_investigable`), 4는 사람의 확인이 필요함(`needs_confirmation`)을 뜻합니다.

## 승인은 사람이 합니다 {#approval}

0.3.0 다음 릴리스부터 플러그인 권한 승인은 사람이 결정합니다. 에이전트가 `khonsu plugin install … --yes`, `plugin update`, `plugin approve`를 실행하면 플러그인은 설치되거나 업데이트되지만 승인되지 않으며, 명령은 종류 `needs_confirmation`으로 4를 반환하며 종료하고 해당 플러그인을 알려 줍니다. 사용자에게 앱이나 자신의 터미널에서 승인해 달라고 요청하십시오. 에이전트는 `KHONSU_AGENT` 또는 Claude Code, Codex, Cursor, Gemini CLI가 설정하는 환경 변수로 감지합니다.

## 검토 루프

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# .dash 파일을 편집한 뒤 검증합니다.
khonsu dash check overview.dash --db graphs/demo
# 첫 명령이 반환한 실제 댓글 ID를 사용합니다.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

앱이 그래프를 점유하고 있는 동안에는 읽기 쿼리, `dash check`, `plugin sync`가 해당 창을 통해 실행되고 `via_window: true`를 반환합니다. 쿼리 쓰기, `graph explore`, `investigate`은 그래프가 비어 있어야 합니다. 쓰기를 강제하려고 잠금을 제거하지 마십시오. [문제 해결](./troubleshooting)을 참고하십시오.
