---
description: 通过数据源插件将 CSV 和 AWS 资源转换成节点与关系。
---
# 数据源

插件将外部系统转换为节点和关系。KhonsuGraph 将插件作为独立进程运行，并把它输出的记录写入图。

## CSV

内置 CSV 插件将每一行映射为节点或关系。指定稳定 ID、起点与终点列，其余列作为属性。默认推断数字和布尔值；设置 `infer_types=false` 可保留文本。

完整导入步骤见[快速开始](./getting-started)。包含多种标签或关系类型时，可以使用 `nodes` 和 `edges` JSON 配置。JSON 中的路径必须是绝对路径：插件在自己的目录中运行，只有单文件字段会自动转换为绝对路径。

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

AWS 插件通过 AWS CLI 读取 VPC、子网、安全组、实例、负载均衡器与 IAM 角色。先安装和配置 AWS CLI，再使用自己的只读配置。`regions` 使用逗号分隔，例如 `us-east-1,eu-west-1`。

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

这会访问配置的 AWS 账户。离线体验可以使用源码仓库中的固定测试数据，参见[示例](./examples)。

<a href="/docs/samples/exposure.dash" download>AWS 暴露面仪表盘</a> 使用插件导入的关系，展示 `Cidr → SecurityGroup ← Instance → Role`。

## 同步规则

- 稳定 ID 使重复导入能够更新已有记录。
- 全量同步会删除此前由该数据源导入、但本次未返回的记录。
- 插件支持增量同步时，增量操作只新增和更新。
- 同步失败时可能保留已写入记录，下次成功同步会重新对齐。
- 端点不存在的边会跳过，并计入 `skipped_edges`。

导入记录包含 `khonsu_id`、`khonsu_source`、`khonsu_plugin` 和 `khonsu_synced_at`。写入与同步需要独占访问，请先在应用中关闭该图。

## 其他系统

安装插件前请查看其声明的权限。权限声明并不构成操作系统沙箱。标记为秘密的配置字段保存在系统钥匙串中。参见[插件开发](./plugins)。
