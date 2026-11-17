---
description: 마켓플레이스에서 KhonsuGraph 플러그인을 이름으로 찾고, 설치하고, 업데이트하며, 내려받은 내용을 검증하고, 직접 만든 플러그인을 게시합니다.
---
# 마켓플레이스

마켓플레이스는 플러그인을 이름으로 나열합니다. 각 플러그인의 버전, 선언된 권한, 플랫폼별 패키지와 그 SHA-256을 제공합니다. KhonsuGraph는 로컬 폴더, GitHub 리포지터리, HTTPS 주소에서 마켓플레이스를 읽을 수 있습니다.

::: info 다음 릴리스에서 제공
마켓플레이스는 0.3.0 다음 릴리스에서 제공됩니다. 그 릴리스부터 앱에 포함되는 플러그인은 CSV뿐입니다. AWS와 Neo4j는 SQL, DuckLocal과 마찬가지로 공식 마켓플레이스에서 설치합니다. 0.3.0에서는 AWS와 Neo4j가 아직 앱에 포함되어 있습니다.
:::

## 플러그인 설치 {#install}

```sh
khonsu plugin search              # 마켓플레이스에 있는 플러그인
khonsu plugin install aws --yes   # 내려받기, 검증, 설치, 승인
khonsu plugin update              # 설치된 플러그인을 최신으로 유지
```

앱에서는 **Add Data Source… → More Plugins…**에 같은 목록이 표시됩니다. 그곳에서 플러그인을 설치하거나 업데이트하면 승인 대화 상자로, 이어서 소스 양식으로 넘어갑니다.

두 마켓플레이스가 같은 ID를 나열하면 원하는 쪽을 지정하십시오: `khonsu plugin install sql@official`. `khonsu plugin update --dry-run`은 바뀔 내용만 보고합니다.

## 공식 플러그인 {#official}

| 플러그인 | 읽는 내용 |
| --- | --- |
| `sql` | PostgreSQL, MySQL, SQLite 테이블. 직접 매핑하거나 기본 키와 외래 키로 매핑합니다 |
| `ducklocal` | DuckLocal로 읽는 Parquet, CSV, JSON, DuckDB 테이블 |
| `aws` | 읽기 전용 AWS CLI를 통한 VPC, 서브넷, 보안 그룹, 인스턴스, 로드 밸런서, IAM 역할. 노출 분석과 `aws.exposure` 템플릿을 제공합니다 |
| `neo4j` | Cartography가 채운 것과 같은 Neo4j 데이터베이스를 HTTP API로 복사합니다 |

모든 설치에는 처음부터 `official` 마켓플레이스가 있습니다. `marketplace.khonsugraph.com`에서 제공되며, 각 플러그인의 소스와 README가 있는 [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) 리포지터리에서 빌드됩니다. CSV 플러그인은 계속 내장됩니다.

## 검증 내용 {#checks}

- 패키지는 마켓플레이스에 나열된 SHA-256과 일치해야 하고, 나열된 플러그인과 버전을 담고 있어야 합니다. 그렇지 않으면 아무것도 설치되지 않으며 이전에 설치된 것이 그대로 남습니다.
- 인덱스와 패키지는 HTTPS로만 읽습니다.
- 설치는 승인이 아닙니다. 마켓플레이스의 플러그인은 실행 전에 승인이 필요하고, 업데이트되면 다시 승인해야 합니다. `--yes`는 같은 단계에서 승인합니다.

마켓플레이스는 패키지의 위치와 해시를 알려 줄 뿐, 플러그인이 안전하다고 보장하지 않습니다. 승인하기 전에 선언된 권한을 검토하십시오. 권한은 선언일 뿐 샌드박스가 아닙니다. [플러그인 개발](./plugins)을 참고하십시오.

## 마켓플레이스 추가 {#add}

```sh
khonsu marketplace add acme/khonsu-plugins          # GitHub의 owner/repo
khonsu marketplace add https://plugins.example.com  # 임의의 HTTPS 주소
khonsu marketplace add ~/work/team-plugins          # 폴더
khonsu marketplace list
khonsu marketplace remove team-plugins
```

`khonsu marketplace remove official`은 공식 마켓플레이스를 끄고, `khonsu marketplace restore`는 다시 켭니다.

## 플러그인 게시 {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

플러그인을 그 폴더에 패키징하고 폴더의 `marketplace.json`에 등록합니다. 폴더를 커밋해 푸시하거나 정적 호스팅에 업로드하십시오. 다른 사람은 `khonsu marketplace add`로 한 번 추가한 뒤 이름으로 설치할 수 있습니다. 같은 버전을 다시 게시하면 해당 플랫폼의 패키지가 교체되므로, 플랫폼마다 자체 빌드를 게시할 수 있습니다. [전체 마켓플레이스 참조](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md)를 참고하십시오.
