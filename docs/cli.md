---
description: Use the khonsu JSON CLI to inspect graphs, query data and collaborate on dashboards.
---
# CLI & AI agents

The desktop app and CLI share one executable. With no arguments, `khonsugraph` opens the app; with a subcommand, it executes the command and exits. The title bar's **Command line & AI** button (the robot icon) installs `khonsu` on PATH and can install the skill for Claude Code.

The [agent skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) teaches agents the schema-first workflow and the supported Cypher subset.

## Command reference

| Command | Purpose |
| --- | --- |
| `khonsu init DIR` | Create an empty graph |
| `khonsu schema --db DIR` | Inspect labels, relationships, properties and tables |
| `khonsu query --db DIR --cypher "…"` | Execute one read-only Cypher statement |
| `khonsu query --db DIR --sql "…"` | Execute one read-only SQL statement |
| `khonsu query --db DIR --file query.cypher` | Run a query file; `.sql` selects SQL |
| `khonsu explain --db DIR --cypher "…"` | Explain a query |
| `khonsu plugin list` | List plugins and permissions |
| `khonsu plugin describe ID` | Show a plugin's configuration fields and output types |
| `khonsu plugin install DIR --yes` | Install a plugin directory or ZIP and approve its permissions |
| `khonsu plugin sync --source ID` | Sync a source; add `--dry-run` to preview or `--incremental` |
| `khonsu source list` | List configured sources |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configure a source; `--test` checks it first |
| `khonsu source remove ID` | Remove a source |
| `khonsu check FILE --db DIR` | Validate a dashboard against a graph |
| `khonsu comments FILE` | List, reply to and resolve plot comments |
| `khonsu presence FILE --doing editing --plot NAME` | Show the window which plots you are editing |
| `khonsu open DIR` | Open a graph in the desktop app |
| `khonsu open FILE.dash` | Open a dashboard |
| `khonsu open --state` | Read the running window's graph and tabs |

`--db` defaults to `KHONSU_DB`, then the graph last opened in the app. Use an explicit path in automation. Query writes require `--write`.

## Output and errors

Each command prints one JSON object on stdout; `--pretty` indents it. Sync progress goes to stderr as JSON lines. Query results contain `columns`, `rows`, `row_count`, `truncated` and `elapsed_ms`, plus `graph` when nodes or relationships are returned.

`--max-rows` defaults to 200 and truncates the displayed result. It does not reduce query execution work. Always inspect `truncated` and use bounded queries.

Failures have an `error` object with `kind` and `message`, and optional `detail`. Check the exit status before interpreting stdout: 1 indicates an execution error; 2 indicates a usage or dashboard specification error.

## A review loop

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
# Edit the .dash file, then validate it.
khonsu check overview.dash --db graphs/demo
# Use an actual comment ID returned by the first command.
khonsu comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu presence overview.dash --doing idle
```

While the app holds a graph, read queries and `check` run through the window and return `via_window: true`. Do not remove locks to force a write. See [troubleshooting](./troubleshooting).
