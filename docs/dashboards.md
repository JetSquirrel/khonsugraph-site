---
description: Write graph dashboards as plain-text .dash files and review them with an agent.
---
# Dashboards

A `.dash` file is plain text: named queries, plots and filters. It reads the graph currently open in the app. Data is imported separately through plugins; there is no `source` block.

## Your first graph panel

After completing [getting started](./getting-started), save this as `overview.dash`:

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check` executes each query read-only, validates plot columns and tries filters with actual values. Fix every reported error before opening or sharing the dashboard.

## Plots and layout

Plot types include `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text` and `graph`. `width` spans 1–12 columns. Graph queries return whole nodes and relationships; `caption` selects the node property shown as its label. `group` can group nodes by a property.

## Shared filters

A table row, bar or graph node can drive a filter. In this example, a table query returns `service`, and another query uses `WHERE $service`:

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

The placeholder must be a whole `WHERE` condition, optionally joined by `AND`. In Cypher, the picked value is compared with the `match` expression; in SQL, it is compared with the column itself, so `match` is not needed. An unpicked condition is removed; the source plot does not filter itself. The complete [repository examples](./examples) include these linked queries and plots.

## Review with an agent

Comment on a plot in the app. An agent reads the comments, edits the file, runs `check` and replies. Comments live beside the dashboard in `FILE.comments.json`. Presence can identify the plots the agent is editing, and the window redraws when the file changes.

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

The format has no arbitrary functions, conditionals or data-dependent styling. See [CLI & agents](./cli) for the review commands.
