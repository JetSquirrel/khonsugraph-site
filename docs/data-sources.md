---
description: Turn CSV files and AWS resources into nodes and relationships using source plugins.
---
# Data sources

Plugins turn an outside system into nodes and relationships. KhonsuGraph runs the plugin as a separate process and writes the records into the graph.

## CSV

The built-in CSV plugin maps rows to nodes and relationships. Choose stable ID, source and target columns; other columns become properties. Numeric and boolean values are inferred by default. Set `infer_types=false` to keep text.

See the complete import in [getting started](./getting-started). For mixed node labels or relationship types, use the `nodes` and `edges` JSON configuration. Paths inside this JSON must be absolute: the plugin runs from its own folder, and only the single-file fields are converted to absolute paths for you.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

The AWS plugin uses the AWS CLI to read VPCs, subnets, security groups, instances, load balancers and IAM roles. Install and configure the AWS CLI first, then use a read-only profile you control. `regions` is a comma-separated list, such as `us-east-1,eu-west-1`.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

This accesses the configured AWS account. For an offline walkthrough, use the saved fixtures in the app repository instead; see [examples](./examples).

The <a href="/docs/samples/exposure.dash" download>AWS exposure dashboard</a> traces `Cidr → SecurityGroup ← Instance → Role` using the relationships imported by this plugin.

## Sync semantics

- Stable IDs let repeated imports update existing records.
- A full sync removes previously imported records from this source that are absent from the new result.
- Incremental sync only adds or updates records, when the plugin supports it.
- A failed sync can retain records already written. The next successful sync reconciles them.
- An edge with an unknown endpoint is skipped and counted in `skipped_edges`.

Imported records include `khonsu_id`, `khonsu_source`, `khonsu_plugin` and `khonsu_synced_at`. Graph writes and syncs require exclusive access: close the graph in the app first.

## Other systems

Install a plugin only after reviewing its permissions. Permissions are declarations, not an operating-system sandbox. Secret configuration fields are stored in the system keychain. See [plugin development](./plugins).
