---
description: 使用 Cypher、SQL、插件和可审阅仪表盘探索本地 HawDB 图数据。
---
# KhonsuGraph 文档

KhonsuGraph 是本地优先的 HawDB 图数据桌面工作台。打开图目录，查看 Schema，使用 Cypher 查询关系、使用 PostgreSQL 方言 SQL 查询表，再将结果组织成仪表盘。

这是基于 HawDB 的独立项目，采用 Apache-2.0 协议开源。

## 从这里开始

- [安装与第一条查询](./getting-started)
- [导入 CSV 或连接 AWS](./data-sources)
- [了解 Cypher 支持范围与查询限制](./queries)
- [构建 .dash 仪表盘](./dashboards)
- [通过 CLI 与 AI Agent 协作](./cli)
- [探索示例仪表盘](./examples)

## 数据在哪里处理

图数据在本机存储和查询。数据源插件会访问你配置的系统。外部 AI Agent 有自己的数据处理设置，将查询结果交给它之前，应了解相应设置。

当前源码使用 **HawDB 0.12.0**。本文档依据该版本编写，已安装发行版的行为可能不同。参阅[源码仓库](https://github.com/JetSquirrel/KhonsuGraph)。
