---
description: 探索 AWS 暴露面、服务依赖、安全分析和信任网络示例仪表盘。
---
# 示例

[应用仓库](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples)包含示例仪表盘，以及从公开数据构建图的脚本。单独的 `.dash` 文件不包含数据库。

## 公开数据集

| 仪表盘 | 数据来源 |
| --- | --- |
| 安全攻击链 | MITRE ATT&CK 和 OTRF Security-Datasets |
| SRE 影响范围 | Google Online Boutique 服务清单 |
| 离岸公司网络 | ICIJ Offshore Leaks |
| 账户信任网络 | SNAP Bitcoin OTC 评价 |
| 地铁附近租房 | OpenStreetMap MTR 数据和 Inside Airbnb 香港数据 |

每个数据源保留自身许可。出现在 ICIJ 数据中并不意味着存在不当行为。来源与许可详情请阅读仓库 examples README。

## 构建服务关系图

在应用源码仓库根目录执行：

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

下载脚本会获取公开数据。`$PWD` 让 CSV 路径保持为绝对路径，CSV 插件读取 `nodes` 和 `edges` 时需要绝对路径。可按 examples README 将 `sre` 替换为其他场景目录。

## 不连接真实账户体验 AWS

应用仓库包含已保存的 AWS CLI 响应。在其根目录执行：

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

也可<a href="/docs/samples/exposure.dash" download>下载暴露面仪表盘</a>，它需要已导入的 AWS 图数据。
