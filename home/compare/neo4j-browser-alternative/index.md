# A local, serverless alternative to Neo4j Browser

KhonsuGraph is a desktop investigation workbench with its own embedded engine, HawDB. Copy a Neo4j or Cartography database into a local graph, then walk paths, cite evidence and save investigations without running a database server.

## No server to run

The graph is a HawDB directory opened by the desktop app or the khonsu CLI. One process owns a graph at a time; while the window has it open, CLI reads route through the window.

[Getting started](https://khonsugraph.com/docs/getting-started)

## Cypher and SQL side by side

Query relationships in HawDB's Cypher and tables in PostgreSQL-dialect SQL in the same directory, with results as a table or an explorable graph.

[Cypher & SQL](https://khonsugraph.com/docs/queries)

## Evidence for every record

Synced records carry their source, plugin and write time. khonsu graph evidence reports them, along with whether the source's last sync was complete.

[Evidence](https://khonsugraph.com/docs/investigations#evidence)

## Investigations that re-check

A saved investigation keeps the walk, the chosen path, a query and a dashboard. Reopening it after the data changes says what differs instead of replacing the answer silently.

[Saved investigations](https://khonsugraph.com/docs/investigations#saved-investigations)

## Side by side

|  | KhonsuGraph | Neo4j Browser |
| --- | --- | --- |
| Where the graph lives | An embedded HawDB directory on your machine | A Neo4j database server it connects to |
| Query languages | HawDB Cypher and PostgreSQL-dialect SQL | Neo4j Cypher |
| Bounded path walks | khonsu graph explore and Path Explorer, with hop and size caps and a complete flag | Written as Cypher queries |
| Record provenance | Source, plugin, write time and sync coverage per record | Whatever properties your data carries |
| Re-checking a saved result | Saved investigations report what changed in the graph | Not covered here |
| Automation | A JSON CLI for scripts and AI agents | Not covered here |

Neo4j Browser and Neo4j Bloom are products of Neo4j, Inc. This table lists only what the KhonsuGraph documentation covers; check Neo4j's documentation for its current features.

## Copy a Neo4j database into a local graph.

The Neo4j plugin, added in 0.3.0, copies nodes and relationships over Neo4j's HTTP API and sends read queries only.

```sh
# 01 — Copy the database (HTTP port 7474, not bolt://)
$ khonsu graph init graphs/infra
$ khonsu source add --db graphs/infra --plugin neo4j --name infra \
    -c url=http://127.0.0.1:7474 -c password=... --test
$ khonsu plugin sync --source infra

# 02 — Read the schema KhonsuGraph sees
$ khonsu schema --db graphs/infra

# 03 — Match on any of a node's original labels
$ khonsu query --db graphs/infra --cypher \
    "MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels RETURN p LIMIT 25"
$ khonsu open graphs/infra
```

- HawDB has one label per node. Each node takes one of its Neo4j labels, usually the rarest, and keeps all of them in neo4j_labels.
- Run the sync again to refresh the copy; a full sync removes records that are gone from the source.

## When to keep using Neo4j Browser

- You rely on Cypher that HawDB does not support: labels(), keys(), properties(), CALL db.*, SHOW, string concatenation with +, toLower, toUpper, or path variables outside shortestPath.
- You need several labels on one node. HawDB keeps one, and the rest in neo4j_labels.
- You want to edit a shared, live database. KhonsuGraph works on a local copy and its plugin only reads from Neo4j.
- Your reads return more than 100,000 rows; that is HawDB's execution ceiling.

## Does KhonsuGraph replace Neo4j?

No. It is a desktop investigation workbench with its own embedded engine. It can read from Neo4j, and Neo4j stays the source; KhonsuGraph never writes to it.

## Will my existing Cypher queries work?

Many will, but HawDB's Cypher differs from Neo4j's. Variable-length patterns need a relationship type, some functions are missing, and a read starts with MATCH or UNWIND. The query guide lists the current limits.

## How is it different from Neo4j Bloom?

KhonsuGraph runs without a database server and adds bounded path walks, record-level evidence, graph algorithms and a JSON command line for AI agents. It does not reproduce Bloom's features.

## Does it work with Cartography?

Yes. Cartography fills a Neo4j database, and the Neo4j plugin copies it into a local graph. Match on neo4j_labels when a label you expect returns nothing.

## Is it free?

Yes. KhonsuGraph is open source under Apache-2.0. It is an independent project built on HawDB and is not affiliated with Neo4j, Inc.

[Download](https://github.com/JetSquirrel/KhonsuGraph/releases) · [Documentation](https://khonsugraph.com/docs/)
