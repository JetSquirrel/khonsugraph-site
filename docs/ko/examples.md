---
description: 공개 데이터셋을 사용한 예제 그래프 조사입니다. Sysmon 로그에서 찾은 공격 체인, 서비스 영향 범위, ICIJ Offshore Leaks 네트워크, Bitcoin 신뢰 네트워크, AWS 노출을 다룹니다.
---
# 예제

[애플리케이션 리포지터리](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples)에는 공개 데이터셋으로 그래프를 준비하는 대시보드와 스크립트가 포함되어 있습니다. `.dash` 파일만으로는 그 데이터베이스가 포함되지 않습니다.

## 공개 데이터셋

| 대시보드 | 질문 | 원본 데이터 | 그래프 |
| --- | --- | --- | --- |
| [보안 공격 체인](#attack-chain) | 잡음이 많은 호스트 로그 속에 어떤 공격 체인이 숨어 있습니까? | MITRE ATT&CK 및 OTRF Security-Datasets | 1,838개 노드, 20,591개 관계 |
| [SRE 영향 범위](#blast-radius) | 실패한 서비스가 무엇을 함께 무너뜨립니까? | Google Online Boutique 서비스 매니페스트 | 서비스 12개, 호출 경로 16개 |
| [역외 기업 네트워크](#offshore-network) | 기업 집합 뒤에는 누가 있습니까? | ICIJ Offshore Leaks | 5,577개 노드, 6,515개 관계 |
| [계정 신뢰 네트워크](#trust-network) | 다른 계정들이 경고하는 계정은 무엇입니까? | SNAP Bitcoin OTC 평점 | 계정 5,881개, 평점 35,592개 |
| 대중교통 인근 임대 | MTR 역 근처에 있는 주택은 무엇입니까? | OpenStreetMap MTR 데이터 및 Inside Airbnb Hong Kong | 5,730개 노드, 17,119개 관계 |

각 소스는 자체 라이선스를 유지합니다. ICIJ 데이터셋에 등장한다고 해서 위법 행위를 의미하지는 않습니다. 출처와 라이선스는 리포지터리의 examples README를 참고하십시오.

## 공격 체인 {#attack-chain}

보안 엔지니어나 위협 헌터를 위한 예제입니다. `security/attack_chain.dash`는 MITRE ATT&CK(그룹, 소프트웨어, 기법, 완화책)을 두 개의 OTRF Sysmon 기록, 즉 Empire Mimikatz와 Covenant PowerShell 원격 접속과 결합합니다. 프로세스 생성 이벤트와 LSASS 접근 이벤트는 그것이 가리키는 기법과 연결됩니다. 기법을 선택하면 어떤 알려진 그룹이 그 기법을 사용하는지와 어떻게 완화하는지 볼 수 있고, 프로세스를 선택하면 그 프로세스가 생성하고 연결한 대상을 볼 수 있습니다.

아래 명령에서 `sre` 대신 `security`를, 대시보드로 `attack_chain.dash`를 사용해 만드십시오.

## 역외 네트워크 {#offshore-network}

조사자를 위한 예제입니다. `investigation/offshore_network.dash`는 ICIJ Offshore Leaks 데이터베이스(파나마 문서, 홍콩, 2012–2015)의 임원, 기업, 중개인을 매핑합니다. 임원을 선택하면 그 사람의 기업을 볼 수 있고, 가장 많이 설립한 중개인을 찾을 수 있습니다.

`sre` 대신 `investigation`을 사용해 만드십시오.

## 신뢰 네트워크 {#trust-network}

감사자를 위한 예제입니다. `audit/trust_network.dash`는 Bitcoin OTC 신뢰 네트워크에서 누가 누구를 평가하는지 탐색합니다. [그래프 분석](./analysis)은 네트워크가 의존하는 계정을 찾아냅니다.

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

`sre` 대신 `audit`을 사용해 만드십시오.

## 서비스 영향 범위 {#blast-radius}

SRE를 위한 예제입니다. 어떤 서비스가 실패한 의존성을 직접 또는 다른 서비스를 통해 호출하는지 보여 줍니다. 앱 리포지터리 체크아웃에서 다음을 실행하십시오.

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

fetch 스크립트는 공개 데이터를 내려받습니다. `$PWD`는 CSV 경로를 절대 경로로 유지하며, CSV 플러그인은 `nodes`와 `edges`에 대해 절대 경로를 필요로 합니다. examples README에 설명된 대로 `sre`를 다른 스토리 디렉터리로 바꾸십시오.

## 실제 계정 없이 AWS 노출 살펴보기 {#aws-exposure}

클라우드 보안 엔지니어를 위한 예제입니다. AWS 계정 구성이 인터넷에 무엇을 열어 두는지를 인터넷 CIDR에서 보안 그룹과 로드 밸런서를 거쳐 인스턴스와 그들이 수임하는 역할까지 보여 줍니다.

AWS 플러그인의 저장된 AWS CLI 응답은 [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) 리포지터리에 있습니다. 앱 리포지터리 옆에 체크아웃한 뒤 앱 리포지터리 루트에서 다음을 실행하십시오.

```sh
khonsu init graphs/aws
khonsu plugin install aws --yes
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/../khonsugraph-marketplace/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

<a href="/docs/samples/exposure.dash" download>노출 대시보드</a>를 내려받을 수도 있습니다. 이 대시보드는 가져온 AWS 그래프를 필요로 합니다.

0.3.0부터 `khonsu plugin analyze aws exposure --db graphs/aws`는 각 발견의 근거가 되는 규칙과 필드를 함께 보고하고, `khonsu explore`는 경로를 추적합니다. [조사](./investigations)를 참고하십시오.
