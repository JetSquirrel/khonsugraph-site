---
description: CLI 명령 누락, 그래프 잠금, 빈 패널, 쿼리 검증 오류를 해결합니다.
---
# 문제 해결

## khonsu를 찾을 수 없습니다

앱 제목 표시줄의 **명령줄 및 AI**(로봇 아이콘)를 사용한 뒤 터미널을 다시 여십시오. macOS에서는 앱 바이너리를 직접 실행할 수 있습니다.

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

Windows에서는 `khonsu.exe`를 압축을 푼 패키지의 나머지 파일과 함께 두고 해당 디렉터리를 PATH에 추가하거나, 전체 경로로 실행하십시오.

## 그래프가 잠겨 있습니다

하나의 프로세스가 HawDB 그래프 디렉터리를 소유합니다. 읽기와 대시보드 검사는 실행 중인 창을 통해 라우팅되지만, 쓰기와 소스 동기화는 그래프가 비어 있어야 합니다. 다른 프로세스에서 그래프를 닫으십시오. 임대를 우회하려고 `khonsugraph.lock`, `owner.hawdb.lock` 또는 데이터베이스 파일을 삭제하지 마십시오.

## 그래프가 old_format을 보고합니다 {#old-format}

HawDB 0.25에서 저장 형식이 바뀌어 그 이전 그래프는 읽지 못하므로, KhonsuGraph 0.2.0 이하에서 작성한 그래프는 종류 `old_format`과 함께 열기에 실패합니다. `khonsu graph rebuild --db DIR`을 실행하면 데이터 소스에서 그래프를 다시 만들고, 이전 디렉터리는 `DIR.hawdb-old`로 옆에 보관합니다. 동기화가 아니라 직접 작성한 내용은 이전되지 않습니다.

## 그래프 패널이 비어 있습니다

이름만 반환하지 말고 노드와 관계 전체(`RETURN a, r, b`)를 반환하십시오. 대시보드가 작성된 대상 그래프를 열었는지 확인하십시오. `khonsu schema --db DIR`을 사용하고 쿼리를 직접 실행해 레이블과 결과를 검증하십시오.

## 쿼리나 대시보드가 실패합니다

`khonsu dash check FILE --db DIR`을 실행하고 보고된 오류를 모두 읽으십시오. 플롯이 없는 열을 참조할 수도 있고, 가져온 데이터셋이 다른 레이블을 사용할 수도 있습니다. 일부 Cypher 기능은 지원되지 않습니다. [쿼리 제한 사항](./queries#current-limitations)을 참고하십시오.

읽기가 예산을 초과하면 조건자와 `LIMIT`으로 범위를 좁히십시오. `--max-rows`만 낮추는 것으로는 실행 비용이 줄지 않습니다.

## 소스가 동기화되지 않습니다

`khonsu plugin describe ID`를 실행하고 구성 필드를 확인하십시오. 패키징된 플러그인이 실행 파일 옆에 그대로 있는지 확인하십시오. 단일 파일 CSV 경로는 소스를 추가할 때 절대 경로로 저장됩니다. `nodes`와 `edges` JSON 안의 경로는 입력한 그대로 저장되며 절대 경로여야 합니다. AWS는 픽스처를 사용하지 않는 경우 AWS CLI와 접근 가능한 구성 프로파일을 필요로 합니다. `regions`는 JSON 배열이 아니라 쉼표로 구분한 텍스트로 작성하십시오. 0.3.0 이후 릴리스로 업데이트한 뒤 AWS나 Neo4j 플러그인을 찾을 수 없다면 [마켓플레이스](./marketplace#install)에서 설치하십시오.

동기화가 실패하면 이미 기록된 레코드가 남을 수 있습니다. 원인을 수정한 뒤 다시 동기화해 정리하십시오. 해결되지 않은 끝점은 `skipped_edges`에서 확인하십시오.

## 에이전트가 설치한 플러그인이 승인되지 않음 {#needs-confirmation}

종류 `needs_confirmation`(종료 코드 4)은 AI 에이전트가 플러그인 승인을 요청했다는 뜻입니다. 플러그인은 설치되었지만 승인은 사람만 할 수 있습니다. 앱에서 승인하거나 자신의 터미널에서 `khonsu plugin approve ID`를 실행하십시오. [승인](./cli#approval)을 참고하십시오.

## 문제 보고하기

앱 버전, 운영체제, 명령, 오류 종류를 [GitHub 이슈](https://github.com/JetSquirrel/KhonsuGraph/issues)에 포함하십시오. 재현 자료에서는 자격 증명과 비공개 그래프 값을 제거하십시오.
