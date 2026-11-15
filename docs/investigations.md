---
description: Trace paths through a graph with khonsu explore, cite the evidence behind each record, save an investigation and re-check it after the data changes.
---
# Investigations

An investigation follows relationships from a starting point to an answer: which path leads from the internet to this instance, what a failing service takes down with it, who stands behind a company. KhonsuGraph keeps four things apart so the answer can be checked later: the path, the evidence for each record on it, the saved investigation, and what changed in the graph since.

These commands arrived in KhonsuGraph 0.3.0. Run `khonsu --version` to see what you have.

## Follow a path {#explore}

`khonsu explore` walks outward from one or more nodes without loading the whole graph. In the window, the same walk is **Path Explorer** on a graph canvas.

```sh
khonsu explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` and `--to` take a `khonsu_id` (the stable ID every synced record carries) or a numeric node ID. The IDs above are illustrative, from an AWS graph like the one in [the examples](./examples#aws-exposure); read your own with a query such as `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5`.

| Option | Meaning | Default |
| --- | --- | --- |
| `--from NODE` | A starting node. Repeat for several | Required |
| `--to NODE` | Report a fewest-hops path to this node among what the walk found | None |
| `--direction out\|in\|both` | Along the arrows, against them, or both | `out` |
| `--type A,B` | Follow only these relationship types | Every type |
| `--max-hops N` | Steps from a start, at most 16 | 3 |
| `--max-nodes N` | Nodes returned, at most 2,000 | 200 |
| `--max-edges N` | Relationships returned, at most 5,000 | 500 |

Each hop in the output has a `text` such as `Internet -[ROUTES_TO]-> shop`. Read `complete` first. When it is false, `limits` names the cap that cut the walk short, so a missing path means "not within these caps", not "no path". A value above a ceiling is refused rather than lowered.

A path is a candidate found in the data. It is not proof that anything can be reached, and the absence of a path is not proof of safety.

## Evidence {#evidence}

`khonsu evidence` says what supports a node or a relationship: which source and plugin wrote it, when it last changed, and whether that source's last sync was complete.

```sh
khonsu evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| Field | Meaning |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` or `rel:<khonsu_id>`. Cite it when you report a finding |
| `source`, `plugin` | What wrote the record |
| `record_written_at` | When the record last changed, not when it was last seen |
| `source_last_successful_sync` | Unknown when the source's last sync failed |
| `source_coverage` | The source's last run: `complete`, `partial`, `failed` or `cancelled`, and any gaps |
| `assertion` | `explicit` (a source reported it), `derived` or `unknown` |
| `properties`, `redacted` | The record's own properties, and the names masked as possible secrets |

A provenance field is either known with a value or explicitly unknown; nothing is estimated. With `--to`, `khonsu explore` adds `path.evidence`, a derived record that lists the evidence IDs the path rests on.

How strongly a relationship is known is a convention in its own properties. `confidence` is `confirmed`, `inferred` or `unconfirmed`, and `evidence` says what showed it. A path is as strong as its weakest hop: one `unconfirmed` relationship makes the path unconfirmed.

## Plugin analyses {#plugin-analyses}

A plugin can ship rules for its own domain. `khonsu plugin describe ID` lists them, and `khonsu plugin analyze` runs one:

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

The AWS `exposure` analysis returns findings with a verdict of `potential_exposure`, `insufficient_data` or `not_indicated`. Each finding names its rule, the conditions it checked with the fields behind them, what it could not evaluate (`unknowns`), what the rule does not read (`assumptions`), and a `walk` you can pass to `khonsu explore`. A finding describes configuration. It does not say a resource is reachable, or safe.

## Saved investigations {#saved-investigations}

A saved investigation keeps a walk's starting points and filters, the path you chose, a query and a dashboard in a file of its own. Saving writes nothing to the graph.

```sh
khonsu investigation save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigation reopen web.investigation
```

Reopening runs the walk again on the graph as it is now and says how that differs from when it was saved. Read `graph_state` first:

| `graph_state` | Meaning |
| --- | --- |
| `unchanged` | The graph holds what it did when saved |
| `changed` | Something differs. `differences` gives what it can, and is not a full list |
| `not_compared` | The graph holds over 200,000 nodes or relationships, so it was not hashed, and the counts agree |

A changed answer never replaces the saved one silently. `path_same` says whether the path still rests on the same records. `missing_seeds` and `target_missing` name saved records that have gone. `unsure` lists records found only by an internal ID on a changed graph. `incomplete_sources` names sources whose last sync was not complete.

A re-sync that changes nothing leaves the graph `unchanged`: the comparison covers labels, types, ends and properties, and leaves out internal IDs and sync times.

The file is JSON. It holds the graph's path, data source IDs, stable record IDs and filters. It never holds source configuration or credentials. The graph's path can include a user name, so check it before sharing a file.

## Snapshots and diff {#snapshots}

A snapshot keeps a graph's records in a file, by stable ID, so you can ask later what changed. Snapshots are taken by hand; nothing takes one when a sync runs.

```sh
khonsu snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu snapshot save tuesday.snapshot.json --db graphs/aws
khonsu snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu snapshot check monday.snapshot.json --db graphs/aws
```

| List | Meaning |
| --- | --- |
| `added` | In the later snapshot only |
| `removed` | Gone, and the source's last sync was complete in the later snapshot |
| `not_seen` | Missing from the later snapshot, with nothing to show the source was read completely. It may still exist |
| `changed` | The same stable ID with different properties, labels or ends |

A record is `removed` only when the later snapshot can back that up. After a partial or failed sync it stays in `not_seen`, and `warnings` says why.

A snapshot does not hold the graph's path, source configuration or credentials, and anything that looks secret is masked. It does hold your data's other properties, so treat the file as you would the graph.

## In the window

Select a node on a graph canvas and use **Path Explorer** to walk from it. **Save investigation…** keeps the current filters, the last walk's starting points, the path to the selected node and the tab's query. **Graph > Open investigation…**, or `khonsu open web.investigation`, reopens one in a new tab. Anything that differs from when it was saved appears as a warning on the canvas.

## Limits

- `khonsu explore` and `khonsu investigation` need the graph free. They fail with kind `locked` while the window has it open; use Path Explorer in the window instead.
- A graph over 200,000 nodes or relationships cannot be snapshotted and fails with kind `too_large`.
- Records written by hand have no stable ID. They are counted but not compared in a diff.
- The window has no snapshot or diff view yet.

The [CLI reference](./cli) lists every command. For centrality, communities and shortest paths over the whole graph, see [graph analysis](./analysis).
