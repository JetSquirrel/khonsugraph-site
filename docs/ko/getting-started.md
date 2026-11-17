---
description: KhonsuGraph를 설치하고 그래프를 만들고 작은 CSV 예제를 가져옵니다.
---
# 시작하기

## 설치

사용 가능한 패키지는 [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases)에서 확인할 수 있습니다. 릴리스 워크플로는 Apple silicon macOS DMG와 64비트 Windows ZIP을 빌드합니다. Windows 패키지는 서명되지 않으며, 최근 엔진 업그레이드는 Windows가 아니라 macOS에서 검증되었습니다.

macOS에서는 DMG를 열고 앱을 Applications 폴더로 복사하십시오. Windows에서는 ZIP 전체를 압축 해제하고, 실행 파일 옆에 `plugins` 폴더를 그대로 유지하십시오.

앱 제목 표시줄의 **명령줄 및 AI** 버튼(로봇 아이콘)은 `khonsu` 명령을 PATH에 설치하고 Claude Code에 에이전트 스킬을 추가할 수 있습니다. 앱 실행 파일은 CLI 하위 명령도 직접 받아들입니다.

```sh
khonsu --version
```

## 작은 그래프 만들기

[hosts.csv](/samples/hosts.csv)와 [dependencies.csv](/samples/dependencies.csv)를 같은 작업 폴더에 내려받으십시오. 두 파일은 세 개의 호스트와 두 개의 의존성을 설명합니다.

그 폴더에서 다음 명령을 실행하십시오. 가져오는 동안 데스크톱 앱에서는 그래프를 닫아 두십시오.

```sh
khonsu graph init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

첫 번째 동기화는 아무것도 쓰지 않고 개수와 샘플만 미리 보여 주며, 두 번째 동기화가 그래프를 가져옵니다. `source add`는 CSV 경로를 절대 경로로 저장하므로 이후 동기화는 어느 폴더에서든 동작합니다.

## 쿼리하고 탐색하기

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

데스크톱 쿼리 편집기에서 같은 Cypher 쿼리를 실행해 보십시오. 노드와 관계 전체를 반환하면 그래프 캔버스가 연결을 표시하는 데 필요한 정보를 얻을 수 있습니다.

[쿼리](./queries) 또는 [첫 대시보드](./dashboards)로 이어서 진행하십시오.

## 소스에서 빌드하기

앱 리포지터리의 체크아웃에서 다음을 실행하십시오.

```sh
cargo build --workspace
cargo run -p khonsugraph
```

이 앱은 Rust, GPUI, HawDB를 사용합니다. 릴리스 패키징과 플랫폼별 설정은 리포지터리 README를 참고하십시오.
