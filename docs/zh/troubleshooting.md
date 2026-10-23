---
description: 排查 CLI 找不到、图锁定、空白画布、查询或仪表盘验证失败等问题。
---
# 常见问题

## 找不到 khonsu

使用应用标题栏中的 **命令行与 AI**（机器人图标），然后重新打开终端。macOS 也可直接调用应用可执行文件：

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

Windows 中保留完整解压目录，将 `khonsu.exe` 所在目录加入 PATH，或通过完整路径调用。

## 图被锁定

HawDB 图目录同一时间只能由一个进程持有。只读查询和仪表盘检查可通过运行中的窗口执行，写入和数据源同步则需要图空闲。请在占用它的进程中关闭该图。不要删除 `khonsugraph.lock`、`owner.hawdb.lock` 或数据库文件来绕过锁。

## 关系图面板为空

请返回完整节点和关系（`RETURN a, r, b`），而不是只返回名称。确认打开的图与仪表盘匹配。使用 `khonsu schema --db DIR` 查看标签，并直接运行查询核对结果。

## 查询或仪表盘失败

执行 `khonsu check FILE --db DIR` 并阅读所有错误。图表可能引用了缺失的列，或导入数据使用了不同标签。部分 Cypher 功能尚不支持，见[查询限制](./queries#当前限制)。

读取超出预算时，请通过条件与 `LIMIT` 缩小查询范围。单独减小 `--max-rows` 不会降低执行成本。

## 数据源无法同步

执行 `khonsu plugin describe ID` 核对配置字段，确认内置插件仍在可执行文件旁。单文件 CSV 路径会在添加数据源时保存为绝对路径；`nodes` 和 `edges` JSON 中的路径按原样保存，必须写成绝对路径。除固定测试数据模式外，AWS 需要已安装的 AWS CLI 和可访问的配置。`regions` 请写成逗号分隔的文本，不要写成 JSON 数组。

失败的同步可能保留已写入记录。解决原因后再次同步以重新对齐。通过 `skipped_edges` 查看是否存在找不到端点的关系。

## 反馈问题

在 [GitHub issue](https://github.com/JetSquirrel/KhonsuGraph/issues) 中提供应用版本、系统、命令和错误类型。复现资料中请移除凭证和私有图数据。
