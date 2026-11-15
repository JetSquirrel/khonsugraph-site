---
description: Turn CSV files, AWS accounts and Neo4j or Cartography databases into a local graph of nodes and relationships with data-source plugins.
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

## Neo4j and Cartography {#neo4j}

The Neo4j plugin, added in 0.3.0, copies the nodes and relationships of a Neo4j database into a local graph over Neo4j's HTTP API. It sends read queries only. Its main use is [Cartography](https://github.com/cartography-cncf/cartography), which pulls AWS, GCP, Azure, Kubernetes, GitHub, Okta and more into Neo4j; any Neo4j database works.

```sh
khonsu init graphs/infra
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

The address is Neo4j's HTTP one, 7474 by default, not `bolt://`. The password is kept in the system keychain, and a reader role is enough.

HawDB has one label per node, so each node takes one of its Neo4j labels, usually the rarest, and keeps all of them in `neo4j_labels`. When `MATCH (p:AWSPrincipal)` returns nothing, try `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`. Queries written for Neo4j may need changes; see [query limitations](./queries#current-limitations) and the [plugin's README](https://github.com/JetSquirrel/KhonsuGraph/tree/main/plugins/neo4j).

## Sync semantics

- Stable IDs let repeated imports update existing records.
- A full sync removes previously imported records from this source that are absent from the new result.
- Incremental sync only adds or updates records, when the plugin supports it. `--append` does the same for any source: use it when the files hold only what is new since the last sync.
- An unchanged record is not written again, so the sync report's `nodes_written` and `edges_written` count changes.
- A failed sync can retain records already written. The next successful sync reconciles them.
- An edge with an unknown endpoint is skipped and counted in `skipped_edges`.

Imported records include `khonsu_id`, `khonsu_source`, `khonsu_plugin` and `khonsu_synced_at`; [evidence](./investigations#evidence) reads them back. While the app has the graph open, `khonsu plugin sync` runs through the window, which shows progress and reruns its open dashboards. Query writes need the graph closed there.

## Other systems

Install a plugin only after reviewing its permissions. Permissions are declarations, not an operating-system sandbox. Secret configuration fields are stored in the system keychain. See [plugin development](./plugins).
