---
description: 使用 JSON Lines 协议，以任意语言编写 KhonsuGraph 数据源插件。
---
# 插件开发

插件是独立可执行程序，通过标准输入输出使用 JSON Lines 传递节点与关系。宿主负责写入 HawDB，插件本身不需要打开图。

协议版本 1 仍为实验性，可能在 1.0 前变化。[完整协议说明](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md)随应用源码维护。

## 文件结构

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

程序以插件目录为工作目录。最小的完整实现可参考仓库中的 [Python folders 插件](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders)。

## 三种操作

| 操作 | 输入 | 输出 |
| --- | --- | --- |
| `describe` | 无 | 配置 Schema、权限与输出类型 |
| `test` | 包含配置与秘密的请求 | `test_result` 或 `error` |
| `sync` | 包含配置、秘密、模式与游标的请求 | 记录与进度，最后 `done` 或 `error` |

每条消息独占一行，是带 `type` 字段的 JSON 对象。诊断信息写入 stderr。不同同步之间应保持 ID 稳定，关系端点引用同一数据源中的节点 ID。同步成功必须发送 `done`。

## 权限与秘密

在清单中声明网络访问、文件读取和外部命令。KhonsuGraph 展示这些声明供用户批准，但**不会**将进程放入沙箱。配置字段标记 `secret: true` 时使用系统钥匙串保存。

审阅插件后，可从目录或 ZIP 安装：

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` 表示批准声明的权限。安装操作会复制插件，修改源码后需要重新安装。实现全量或增量同步前，请阅读[同步规则](./data-sources#同步规则)。
