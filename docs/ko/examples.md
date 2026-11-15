---
description: AWS 노출, 서비스 의존성, 보안 및 신뢰 네트워크를 위한 리포지터리 대시보드를 살펴봅니다.
---
# 예제

[애플리케이션 리포지터리](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples)에는 공개 데이터셋으로 그래프를 준비하는 대시보드와 스크립트가 포함되어 있습니다. `.dash` 파일만으로는 그 데이터베이스가 포함되지 않습니다.

## 공개 데이터셋

| 대시보드 | 원본 데이터 |
| --- | --- |
| 보안 공격 체인 | MITRE ATT&CK 및 OTRF Security-Datasets |
| SRE 영향 범위 | Google Online Boutique 서비스 매니페스트 |
| 역외 기업 네트워크 | ICIJ Offshore Leaks |
| 계정 신뢰 네트워크 | SNAP Bitcoin OTC 평점 |
| 대중교통 인근 임대 | OpenStreetMap MTR 데이터 및 Inside Airbnb Hong Kong |

각 소스는 자체 라이선스를 유지합니다. ICIJ 데이터셋에 등장한다고 해서 위법 행위를 의미하지는 않습니다. 출처와 라이선스는 리포지터리의 examples README를 참고하십시오.

## 서비스 그래프 만들기

앱 리포지터리 체크아웃에서 다음을 실행하십시오.

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

## 실제 계정 없이 AWS 사용하기

앱 리포지터리에는 저장된 AWS CLI 응답이 포함되어 있습니다. 리포지터리 루트에서 다음을 실행하십시오.

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

<a href="/docs/samples/exposure.dash" download>노출 대시보드</a>를 내려받을 수도 있습니다. 이 대시보드는 가져온 AWS 그래프를 필요로 합니다.
