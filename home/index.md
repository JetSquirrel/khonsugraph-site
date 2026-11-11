# KhonsuGraph — Built for Hunters.

Follow the connections. Uncover the evidence.

An open-source, local-first graph investigation workbench for security, infrastructure, and beyond. Follow connections in HawDB graphs with Cypher and SQL, connect your data, and build dashboards with your AI agent.

## A STORY OF EXPLORATION

The history of exploring the unknown is also a history of following traces.

### THE ANCIENT WILDERNESS — Hunters followed tracks.

In a wilderness without maps, hunters read footprints in the soil, broken branches, and traces left by animals.

One footprint tells little. Connected to the next, those traces reveal a path — where an animal has been, and where it might go.

Connect the tracks. A direction begins to emerge.

### ANCIENT EGYPT — Travelers looked to the moon.

In ancient Egyptian mythology, Khonsu is the god of the moon, travel, and protection. His name means “traveler,” evoking the moon’s journey across the night sky.

When the sun sets, moonlight shows travelers a way through the darkness.

Darkness does not mean there is no path. Only that the path is yet to be found.

### THE AGE OF EXPLORATION — Explorers followed the stars.

Seeking spices and sea routes to the East, navigators sailed into unknown waters.

They read the positions of stars alongside winds, currents, and voyage records to find their bearings on the open ocean.

A lone star is a point of light. Connected, stars become a chart to navigate by.

### TODAY — We follow digital traces.

Today, threat hunters follow traces through the digital world. Its darkness hides in vast amounts of data.

Security analysts reconstruct attacks from logs. SREs trace service dependencies to locate root causes and understand their impact. Auditors follow transactions and entity relationships to uncover anomalies and risk.

Seemingly unrelated events, assets, and identities reveal their story through their connections.

From tracks in the wilderness to charts of the night sky and networks of digital relationships, we have always been doing the same thing: Connecting clues. Finding the truth.

This is KhonsuGraph. Built for Hunters.

- **Threat hunters**: Trace attack paths and threats.
- **SREs**: Trace root causes and dependencies.
- **Fraud investigators**: Trace anomalous transactions and hidden links.
- **Researchers**: Explore patterns in complex networks.

KhonsuGraph — Built for Hunters. Follow the connections. Uncover the evidence.

## Connect your sources

Import nodes and relationships from CSV, sync AWS resources, copy a Neo4j or Cartography database, or write a plugin for your own system.

[Data sources](https://khonsugraph.com/docs/data-sources)

## Ask in Cypher or SQL

Inspect the schema, write a query, and see the results as a table or a graph you can explore.

[Query your graph](https://khonsugraph.com/docs/queries)

## Follow the path

Walk outward from any node, bounded by hops and relationship types, and get the fewest-hops path to a target.

[Trace a path](https://khonsugraph.com/docs/investigations)

## Find what matters

Rank nodes with PageRank and betweenness, find communities and components, and measure shortest paths. Results match networkx.

[Analyze the graph](https://khonsugraph.com/docs/analysis)

## Keep the evidence

Every record says which source wrote it and when. Save an investigation, reopen it after the data changes, and see whether the conclusion still holds.

[Save an investigation](https://khonsugraph.com/docs/investigations#saved-investigations)

## Share the finding

Turn queries into a plain-text .dash file with graph panels, charts, tables, and shared filters.

[Build a dashboard](https://khonsugraph.com/docs/dashboards)

## What is KhonsuGraph?

KhonsuGraph is a free, open-source desktop workbench for local HawDB graphs. It combines Cypher and PostgreSQL-dialect SQL queries, a graph canvas, data-source plugins, and plain-text dashboards.

## Does my graph leave my machine?

Graph storage and queries stay on your computer. Source plugins can contact the systems you configure, such as AWS. If you use an external AI agent, its own data and privacy settings apply.

## Which platforms are supported?

The project has release packaging for Apple silicon macOS and 64-bit Windows. Check GitHub Releases for available packages. Windows packages are unsigned; the latest engine upgrade was validated on macOS.

## Is this an official HawDB product?

No. KhonsuGraph is an independent project built on HawDB. It is free and open source under the Apache-2.0 license.

## Can I use any Cypher query?

KhonsuGraph uses HawDB’s supported Cypher syntax, which differs from other graph databases. See the query guide for supported patterns and current limitations.

## How is it different from Neo4j Browser or Bloom?

KhonsuGraph is a desktop app with its own embedded graph engine, HawDB, so there is no database server to run. It adds path exploration, record-level evidence, graph algorithms, and a JSON command line for AI agents. Its Neo4j plugin can copy an existing Neo4j database, including one that Cartography fills, into a local graph.

## Does it work with Claude Code and other AI agents?

Yes. The khonsu command line prints structured JSON from every command, so any agent that can run shell commands can use it, and the app can install an agent skill for Claude Code. The agent reads the schema, runs queries, and writes dashboards; you review the result in the window.

[GitHub](https://github.com/JetSquirrel/KhonsuGraph)
