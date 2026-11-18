---
description: 从插件市场按名称查找、安装和更新 KhonsuGraph 插件，校验下载内容，并发布你自己的插件。
---
# 插件市场

插件市场按名称列出插件，给出每个插件的版本、声明的权限，以及每个平台一个安装包及其 SHA-256。KhonsuGraph 可以从本地文件夹、GitHub 仓库或 HTTPS 地址读取插件市场。

::: info 下一个版本提供
插件市场将在 0.3.0 之后的版本中提供。从该版本起，随应用附带的插件只有 CSV；AWS 和 Neo4j 与 SQL、DuckLocal 一样，从官方插件市场安装。在 0.3.0 中，AWS 和 Neo4j 仍随应用附带。
:::

## 安装插件 {#install}

```sh
khonsu plugin search              # 查看插件市场提供的插件
khonsu plugin install aws --yes   # 下载、校验、安装并批准
khonsu plugin update              # 更新已安装的插件
```

在应用中，**添加数据源… → 更多插件…** 显示同样的列表。在那里安装或更新插件后，会依次进入批准对话框和数据源表单。

当两个插件市场列出同一个 ID 时，请指明要用哪一个：`khonsu plugin install sql@official`。`khonsu plugin update --dry-run` 只报告将要发生的变化。

## 官方插件 {#official}

| 插件 | 读取内容 |
| --- | --- |
| `sql` | PostgreSQL、MySQL 和 SQLite 表，可手动映射，也可根据主键和外键映射 |
| `ducklocal` | 通过 DuckLocal 读取 Parquet、CSV、JSON 和 DuckDB 表 |
| `aws` | 通过只读 AWS CLI 读取 VPC、子网、安全组、实例、负载均衡器和 IAM 角色，并提供暴露面分析和 `aws.exposure` 模板 |
| `neo4j` | 通过 HTTP API 复制 Neo4j 数据库，例如由 Cartography 填充的数据库 |

每次安装都会预置 `official` 插件市场。它由 `marketplace.khonsugraph.com` 提供，由 [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) 仓库构建，该仓库包含每个插件的源码和 README。CSV 插件仍内置在应用中。

## 校验内容 {#checks}

- 安装包必须与插件市场列出的 SHA-256 一致，且包含所列的插件和版本；否则不会安装，之前安装的版本保持不变。
- 索引和安装包只通过 HTTPS 读取。
- 安装不等于批准。来自插件市场的插件在运行前需要批准，更新后需要再次批准。`--yes` 会在同一步中批准。由 AI Agent 运行时不会批准任何插件，并以 4 退出，参见[批准](./cli#approval)。

插件市场只说明安装包在哪里、哈希是什么，并不能保证插件安全。批准前请检查声明的权限：它们是声明，而不是沙箱。见[插件开发](./plugins)。

## 添加插件市场 {#add}

```sh
khonsu plugin marketplace add acme/khonsu-plugins   # GitHub 上的 owner/repo
khonsu plugin marketplace add https://plugins.example.com  # 任意 HTTPS 地址
khonsu plugin marketplace add ~/work/team-plugins   # 本地文件夹
khonsu plugin marketplace list
khonsu plugin marketplace remove team-plugins
```

`khonsu plugin marketplace remove official` 会关闭官方插件市场，`khonsu plugin marketplace restore` 可将其恢复。

## 发布插件 {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

该命令把插件打包到该文件夹，并写入文件夹中的 `marketplace.json`。提交并推送这个文件夹，或上传到静态托管服务；其他人用 `khonsu plugin marketplace add` 添加一次后，就能按名称安装。再次发布同一版本会替换该平台的安装包，因此每个平台都可以发布自己的构建。见[完整的插件市场参考](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md)。
