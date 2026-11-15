---
description: JSON Lines 프로토콜을 사용해 어떤 언어로든 데이터 소스 플러그인을 만듭니다.
---
# 플러그인 개발

플러그인은 JSON Lines를 사용해 stdin/stdout으로 노드와 관계를 내보내는 별도 실행 파일입니다. 호스트가 그 레코드를 HawDB에 기록합니다. 플러그인이 그래프를 직접 열 필요는 없습니다.

프로토콜 버전 1은 실험적이며 1.0 이전에 변경될 수 있습니다. [전체 프로토콜 참조](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md)는 애플리케이션과 함께 관리됩니다.

## 패키지 구조

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

실행 파일은 플러그인 폴더를 작업 디렉터리로 하여 실행됩니다. 가장 작은 완전한 예제는 리포지터리의 [Python folders 플러그인](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders)입니다.

## 작업

| 작업 | 입력 | 출력 |
| --- | --- | --- |
| `describe` | 없음 | 구성 스키마, 권한, 출력 유형 |
| `test` | 구성과 비밀 값을 담은 요청 | `test_result` 또는 `error` |
| `sync` | 구성, 비밀 값, 모드, 커서를 담은 요청 | 레코드와 진행 상황, 그다음 `done` 또는 `error` |

모든 메시지는 `type` 필드를 가진 JSON 객체이며 각자 한 줄을 차지합니다. 진단 정보는 stderr로 보내십시오. 동기화 사이에 ID를 안정적으로 유지하십시오. 관계 끝점은 같은 소스의 노드 ID를 참조합니다. 성공한 동기화는 `done`으로 끝내십시오.

## 권한과 비밀 값

매니페스트에 네트워크 접근, 파일 읽기, 명령을 선언하십시오. KhonsuGraph는 승인을 위해 이 선언을 보여 주지만 프로세스를 샌드박싱하지는 **않습니다**. 시스템 키체인을 사용하려면 비밀 구성 필드에 `secret: true`를 지정하십시오.

검토한 뒤 플러그인 디렉터리나 ZIP을 설치하십시오.

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes`는 선언된 권한을 승인합니다. 설치 프로그램은 플러그인을 복사하므로, 소스를 변경한 뒤에는 다시 설치하십시오. 전체 동기화나 증분 동기화를 구현하기 전에 [동기화 방식](./data-sources#sync-semantics)을 참고하십시오.
