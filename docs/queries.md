---
description: Query a local graph in Cypher and tables in PostgreSQL SQL. Supported Cypher clauses, shortest paths, parameters and current HawDB limits.
---
# Cypher & SQL

## Inspect before querying

```sh
khonsu schema --db graphs/demo
```

The result lists labels, relationship types, property names, counts, relationship patterns and SQL tables. Use these names instead of assuming another graph's schema.

## Return connections

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

Returning whole nodes and relationships supplies both table values and graph elements. Returning only `a.name` gives a scalar column, not a connected graph. In the CLI, graph elements appear in a separate `graph` object.

Cypher supports `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE` and bounded variable-length patterns. With `--write`, `CREATE`, `MERGE`, `SET`, `DELETE` and `DETACH DELETE` are also available. For example, with a service graph:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

This returns endpoints. Query one-hop relationships separately to draw the intervening connections.

## Shortest paths

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)` and `relationships(p)` also work. Both endpoints must be bound by a property map, a `WHERE` or an earlier clause. Returning `p` draws the path on the canvas. An unbounded `*` stops at 256 hops and fails rather than report that no path exists.

To walk outward from a node with caps on hops and size, use [`khonsu explore`](./investigations#explore). For weighted paths, centrality and communities, see [graph analysis](./analysis).

## SQL and parameters

SQL queries operate on tables in the same HawDB directory, using PostgreSQL-dialect SQL. A graph import does not imply a SQL table of the same name. Inspect `schema` first. The following example requires an `assets` table:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` values are parsed as JSON when possible, otherwise as strings. SQL uses positional parameters (`$1` with `-p 1=value`).

## Current limitations {#current-limitations}

KhonsuGraph 0.3.0 uses HawDB 0.29.0, whose Cypher differs from other graph databases:

- `labels()`, `keys()`, `properties()`, `CALL db.*` and `SHOW` are not supported. Use `khonsu schema` for metadata.
- `count`, `sum`, `collect`, `min`, `max` and `avg` are the supported aggregates, also over expressions.
- A read starts with `MATCH` or `UNWIND`. A bare `RETURN 1` does not parse, and `OPTIONAL MATCH` cannot be the first clause.
- Variable-length patterns require a relationship type and no relationship variable. An untyped relationship pattern works for one hop only.
- Path variables work only on `shortestPath` and `allShortestPaths`.
- Strings cannot be concatenated with `+`, and `toLower`, `toUpper`, `reduce`, `any`, `all`, `none` and `exists` are not available.
- `CREATE` takes one pattern per statement. `LOAD CSV` is switched off; bring files in with a [data source](./data-sources).
- Scalar `IN`, list comprehensions, `json_value()` on JSON text, dates and durations, and relationship-property `SET` are supported.
- Reads have a 100,000-row execution ceiling. `--max-rows` only limits displayed rows after execution, so use `LIMIT` in the query as well.
- Vector values are returned as JSON number arrays. Columns come back in `RETURN` order; still read them by name.
- `WHERE true` works in Cypher but not in SQL.

A graph written before HawDB 0.25, by KhonsuGraph 0.2.0 or earlier, cannot be read by this version; see [troubleshooting](./troubleshooting#old-format).

## Read and write access

CLI queries are read-only by default. `--write` explicitly enables writes. One process owns a graph directory at a time. While the app has the graph open, CLI read queries and dashboard checks route through that window. Writes and syncs require the graph to be closed there.
