---
description: 安装 KhonsuGraph，创建图并导入一个小型 CSV 示例。
---
# 快速开始

## 安装

在 [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases) 查看可用安装包。发布流程构建 Apple 芯片 macOS DMG 和 64 位 Windows ZIP。Windows 包未签名；最近的引擎升级在 macOS 上验证，尚未在 Windows 上验证。

macOS 用户打开 DMG，将应用复制到 Applications。Windows 用户解压完整 ZIP，保留可执行文件旁的 `plugins` 文件夹。

应用标题栏中的 **命令行与 AI** 按钮（机器人图标）可以将 `khonsu` 加入 PATH，并为 Claude Code 安装 Agent Skill。应用可执行文件本身也接受 CLI 子命令。

```sh
khonsu --version
```

## 创建一个小型图

下载 [hosts.csv](/samples/hosts.csv) 和 [dependencies.csv](/samples/dependencies.csv)，放入同一工作目录。它们描述三个主机和两条依赖关系。

在该目录执行以下命令。导入时不要在桌面应用中打开该图。

```sh
khonsu init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

第一次同步仅预览数量和样本，不写入数据；第二次正式导入。`source add` 会把 CSV 路径保存为绝对路径，之后可以从任意目录同步。

## 查询与探索

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

在桌面查询编辑器运行相同 Cypher。返回完整节点和关系，画布才能绘制它们之间的连接。

接下来可以阅读[查询指南](./queries)，或[构建第一个仪表盘](./dashboards)。

## 从源码构建

在应用源码仓库中执行：

```sh
cargo build --workspace
cargo run -p khonsugraph
```

应用使用 Rust、GPUI 和 HawDB。打包与平台相关设置请参阅源码仓库 README。
