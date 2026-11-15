---
description: Documentation for KhonsuGraph, the open-source desktop workbench for graph investigation. Query in Cypher and SQL, trace paths, cite evidence and build dashboards.
---
# KhonsuGraph documentation

KhonsuGraph is an open-source, local-first desktop workbench for graph investigation, built on HawDB. Bring data in through plugins, query relationships in Cypher or tables in PostgreSQL-dialect SQL, follow paths on a graph canvas, keep the evidence behind each record, and turn the result into a dashboard.

It is an independent project built on HawDB, released under Apache-2.0.

## Start here

- [Install and run your first query](./getting-started)
- [Import CSV, connect AWS or copy a Neo4j database](./data-sources)
- [Understand Cypher support and query limits](./queries)
- [Trace a path, cite evidence and save an investigation](./investigations)
- [Rank nodes and find communities with graph analysis](./analysis)
- [Build a .dash dashboard](./dashboards)
- [Work with an AI agent through the CLI](./cli)
- [Explore the example dashboards](./examples)

## What stays local

Graph storage and query execution run on your computer. Source plugins contact the systems you configure. An external AI agent has its own data-handling settings; review those when sharing query results with it.

These guides describe KhonsuGraph **0.3.0**, which pins HawDB to **0.29.0**. Path exploration, evidence, saved investigations, snapshots and the Neo4j plugin arrived in 0.3.0; an earlier release does not have them. Run `khonsu --version` to see what you have, and see the [source repository](https://github.com/JetSquirrel/KhonsuGraph).
