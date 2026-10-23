---
description: Query graphs in Cypher and tables in SQL, understand the canvas and current HawDB limits.
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

Cypher supports `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH` and bounded variable-length patterns. With `--write`, `CREATE`, `MERGE`, `SET`, `DELETE` and `DETACH DELETE` are also available. For example, with a service graph:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

This returns endpoints. Query one-hop relationships separately to draw the intervening connections.

## SQL and parameters

SQL queries operate on tables in the same HawDB directory, using PostgreSQL-dialect SQL. A graph import does not imply a SQL table of the same name. Inspect `schema` first. The following example requires an `assets` table:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

`-p` values are parsed as JSON when possible, otherwise as strings. SQL uses positional parameters (`$1` with `-p 1=value`).

## Current limitations

The checked source uses HawDB 0.12.0:

- Cypher `sum()`, `labels()`, `keys()`, `properties()`, `shortestPath`, path variables, `CALL db.*` and `SHOW` are not supported by this workflow. Use `khonsu schema` for metadata.
- `count`, `collect`, `min`, `max` and `avg` are supported aggregates.
- Variable-length patterns require a relationship type and no relationship variable.
- `UNWIND` must be followed by a write clause; a standalone read-only `UNWIND` and `WHERE true` are not supported.
- `OPTIONAL MATCH`, scalar `IN`, `json_value()` on JSON text and relationship-property `SET` are supported.
- Reads have a 100,000-row execution ceiling. `--max-rows` only limits displayed rows after execution, so use `LIMIT` in the query as well.
- Vector values are returned as JSON number arrays. Read result columns by name; the engine can reorder them.

## Read and write access

CLI queries are read-only by default. `--write` explicitly enables writes. One process owns a graph directory at a time. While the app has the graph open, CLI read queries and dashboard checks route through that window. Writes and syncs require the graph to be closed there.
