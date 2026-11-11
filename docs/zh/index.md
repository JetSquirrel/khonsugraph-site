---
description: KhonsuGraph 文档。开源的图调查桌面工作台：用 Cypher 和 SQL 查询，追踪路径，查看证据，构建仪表盘。
---
# KhonsuGraph 文档

KhonsuGraph 是开源、本地优先的图调查桌面工作台，基于 HawDB 构建。通过插件接入数据，使用 Cypher 查询关系、使用 PostgreSQL 方言 SQL 查询表，在图画布上追踪路径，保留每条记录背后的证据，再将结果组织成仪表盘。

这是基于 HawDB 的独立项目，采用 Apache-2.0 协议开源。

## 从这里开始

- [安装与第一条查询](./getting-started)
- [导入 CSV、连接 AWS 或复制 Neo4j 数据库](./data-sources)
- [了解 Cypher 支持范围与查询限制](./queries)
- [追踪路径、查看证据并保存调查](./investigations)
- [用图分析为节点排序、发现社区](./analysis)
- [构建 .dash 仪表盘](./dashboards)
- [通过 CLI 与 AI Agent 协作](./cli)
- [探索示例仪表盘](./examples)

## 数据在哪里处理

图数据在本机存储和查询。数据源插件会访问你配置的系统。外部 AI Agent 有自己的数据处理设置，将查询结果交给它之前，应了解相应设置。

本文档依据 KhonsuGraph **0.3.0** 编写，该版本使用 **HawDB 0.29.0**。路径探索、证据、保存调查、快照和 Neo4j 插件从 0.3.0 开始提供，更早的版本没有这些功能。运行 `khonsu --version` 查看当前版本，或参阅[源码仓库](https://github.com/JetSquirrel/KhonsuGraph)。
