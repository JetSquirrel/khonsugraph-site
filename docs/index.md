---
description: Explore local HawDB graphs with Cypher, SQL, plugins and reviewable dashboards.
---
# KhonsuGraph documentation

KhonsuGraph is a local-first desktop workbench for HawDB graphs. Open a graph directory, inspect its schema, query relationships in Cypher or tables in PostgreSQL-dialect SQL, and turn the result into a dashboard.

It is an independent project built on HawDB, released under Apache-2.0.

## Start here

- [Install and run your first query](./getting-started)
- [Import CSV or connect AWS](./data-sources)
- [Understand Cypher support and query limits](./queries)
- [Build a .dash dashboard](./dashboards)
- [Work with an AI agent through the CLI](./cli)
- [Explore the example dashboards](./examples)

## What stays local

Graph storage and query execution run on your computer. Source plugins contact the systems you configure. An external AI agent has its own data-handling settings; review those when sharing query results with it.

The current source pins HawDB to **0.12.0**. These guides describe that checkout; installed release behavior may differ. See the [source repository](https://github.com/JetSquirrel/KhonsuGraph).
