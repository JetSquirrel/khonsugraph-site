---
description: 基于公开数据集的图调查示例：Sysmon 日志中的攻击链、服务故障影响面、ICIJ 离岸公司网络、比特币信任网络和 AWS 暴露面。
---
# 示例

[应用仓库](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples)包含示例仪表盘，以及从公开数据构建图的脚本。单独的 `.dash` 文件不包含数据库。

## 公开数据集

| 仪表盘 | 要回答的问题 | 数据来源 | 图规模 |
| --- | --- | --- | --- |
| [安全攻击链](#attack-chain) | 繁杂的主机日志里藏着怎样的攻击链？ | MITRE ATT&CK 和 OTRF Security-Datasets | 1,838 个节点，20,591 条关系 |
| [SRE 影响范围](#blast-radius) | 一个服务故障会波及哪些服务？ | Google Online Boutique 服务清单 | 12 个服务，16 条调用路径 |
| [离岸公司网络](#offshore-network) | 一批公司背后是谁？ | ICIJ Offshore Leaks | 5,577 个节点，6,515 条关系 |
| [账户信任网络](#trust-network) | 哪些账户被其他人警告？ | SNAP Bitcoin OTC 评价 | 5,881 个账户，35,592 条评价 |
| 地铁附近租房 | 哪些房源靠近港铁站？ | OpenStreetMap MTR 数据和 Inside Airbnb 香港数据 | 5,730 个节点，17,119 条关系 |

每个数据源保留自身许可。出现在 ICIJ 数据中并不意味着存在不当行为。来源与许可详情请阅读仓库 examples README。

## 攻击链 {#attack-chain}

面向安全工程师和威胁猎人。`security/attack_chain.dash` 把 MITRE ATT&CK（组织、软件、技术、缓解措施）与两段 OTRF Sysmon 攻击录像（Empire Mimikatz 和 Covenant PowerShell 远程执行）连接起来，进程创建和 LSASS 访问事件指向它们所对应的技术。选择一项技术，查看哪些已知组织使用它以及如何缓解；选择一个进程，查看它启动和连接了什么。

构建方式见下方命令，把 `sre` 换成 `security`，仪表盘换成 `attack_chain.dash`。

## 离岸公司网络 {#offshore-network}

面向调查人员。`investigation/offshore_network.dash` 梳理 ICIJ Offshore Leaks 数据库（巴拿马文件，香港，2012–2015）中的高管、公司与中介。选择一位高管查看其名下的公司，并找出设立公司最多的中介。

构建时把 `sre` 换成 `investigation`。

## 信任网络 {#trust-network}

面向审计人员。`audit/trust_network.dash` 探索 Bitcoin OTC 信任网络中谁评价了谁。[图分析](./analysis)可以找出支撑整个网络的账户：

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

构建时把 `sre` 换成 `audit`。

## 服务故障影响面 {#blast-radius}

面向 SRE：哪些服务直接或间接调用了出故障的依赖。在应用源码仓库根目录执行：

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

## 不连接真实账户体验 AWS 暴露面 {#aws-exposure}

面向云安全工程师：AWS 账户的配置向互联网开放了什么，从互联网 CIDR 经过安全组和负载均衡器，到实例及其可使用的角色。

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

从 0.3.0 开始，`khonsu plugin analyze aws exposure --db graphs/aws` 会给出带有规则和依据字段的发现，`khonsu explore` 可以追踪路径。见[调查](./investigations)。
