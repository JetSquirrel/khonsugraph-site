---
description: The khonsu command line prints JSON from every command, so Claude Code and other AI agents can inspect a graph, query it, trace paths and write dashboards.
---
# CLI & AI agents

The desktop app and CLI share one executable. With no arguments, `khonsugraph` opens the app; with a subcommand, it executes the command and exits. The title bar's **Command line & AI** button (the robot icon) installs `khonsu` on PATH and can install the skill for Claude Code.

The [agent skill](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) teaches agents the schema-first workflow and the supported Cypher subset.

## Command reference

| Command | Purpose |
| --- | --- |
| `khonsu graph init DIR` | Create an empty graph |
| `khonsu schema --db DIR` | Inspect labels, relationships, properties and tables |
| `khonsu query --db DIR --cypher "…"` | Execute one read-only Cypher statement |
| `khonsu query --db DIR --sql "…"` | Execute one read-only SQL statement |
| `khonsu query --db DIR --file query.cypher` | Run a query file; `.sql` selects SQL |
| `khonsu query --db DIR --semantic --cypher "…"` | [Query in the ontology's words](./ontology#semantic): `Device`, `Account`, `runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | [Check a statement](./ontology#validate) against the graph and run nothing |
| `khonsu graph explain --db DIR --cypher "…"` | Explain a query |
| `khonsu graph ontology describe [--db DIR]` | List [concepts](./ontology) and which of a graph's labels they cover |
| `khonsu graph ontology resolve WORD…` | Say what words mean: concepts, synonyms and the labels that hold them |
| `khonsu graph ontology check --db DIR --entities a,b` | Whether a graph holds records of each thing a question is about |
| `khonsu graph ontology path --from A --to B [--db DIR]` | How two concepts connect, as Cypher patterns |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [Walk outward from a node](./investigations#explore) and report a path |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | Show [what supports a record](./investigations#evidence) |
| `khonsu graph analyze ALGORITHM --db DIR` | Run a [graph algorithm](./analysis): PageRank, communities, components and more |
| `khonsu investigate save FILE --db DIR --from NODE` | [Save an investigation](./investigations#saved-investigations); `reopen FILE` runs it again |
| `khonsu graph snapshot save FILE --db DIR` | Keep the graph's records; [`snapshot diff A B`](./investigations#snapshots) compares two |
| `khonsu graph rebuild --db DIR` | Rebuild an old-format graph from its data sources |
| `khonsu plugin list` | List plugins and permissions |
| `khonsu plugin describe ID` | Show a plugin's configuration fields and output types |
| `khonsu plugin search [WORDS]` | List what the [marketplaces](./marketplace) offer |
| `khonsu plugin install ID --yes` | Install a plugin by name from a marketplace and approve it |
| `khonsu plugin install DIR --yes` | Install a plugin directory or ZIP and approve its permissions |
| `khonsu plugin update` | Update plugins installed from a marketplace; `--dry-run` previews |
| `khonsu plugin marketplace list` | List marketplaces; `add` and `remove` change them |
| `khonsu plugin sync --source ID` | Sync a source; `--dry-run` previews, `--incremental` and `--append` add without removing |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Run a [plugin's analysis](./investigations#plugin-analyses), such as AWS `exposure` |
| `khonsu source list` | List configured sources |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configure a source; `--test` checks it first |
| `khonsu source remove ID` | Remove a source |
| `khonsu dash check FILE --db DIR` | Validate a dashboard against a graph |
| `khonsu dash comments FILE` | List, reply to and resolve plot comments |
| `khonsu dash presence FILE --doing editing --plot NAME` | Show the window which plots you are editing |
| `khonsu open DIR` | Open a graph in the desktop app |
| `khonsu open FILE.dash` | Open a dashboard |
| `khonsu open --state` | Read the running window's graph and tabs |

`--db` defaults to `KHONSU_DB`, then the graph last opened in the app. Use an explicit path in automation. Query writes require `--write`.

## Output and errors

Each command prints one JSON object on stdout; `--pretty` indents it. Sync progress goes to stderr as JSON lines. Query results contain `columns`, `rows`, `row_count`, `truncated` and `elapsed_ms`, plus `graph` when nodes or relationships are returned.

`--max-rows` defaults to 200 and truncates the displayed result. It does not reduce query execution work. Always inspect `truncated` and use bounded queries.

Failures have an `error` object with `kind` and `message`, and optional `detail`. Check the exit status before interpreting stdout: 1 indicates an execution error; 2 indicates a usage or dashboard specification error.

From the release after 0.3.0, exit 2 also means a query that [doesn't fit the graph](./ontology#validate) (`invalid_query`), 3 means the graph holds no records of something the question is about (`not_investigable`), and 4 means a person has to confirm (`needs_confirmation`).

## Approval stays with a person {#approval}

From the release after 0.3.0, approving a plugin's permissions is a person's decision. When an agent runs `khonsu plugin install … --yes`, `plugin update` or `plugin approve`, the plugin is installed or updated but not approved, and the command exits 4 with kind `needs_confirmation`, naming the plugins. Ask the person to approve them in the app or from their own terminal. An agent is detected from `KHONSU_AGENT` or the variables Claude Code, Codex, Cursor and Gemini CLI set.

## A review loop

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# Edit the .dash file, then validate it.
khonsu dash check overview.dash --db graphs/demo
# Use an actual comment ID returned by the first command.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

While the app holds a graph, read queries, `dash check` and `plugin sync` run through the window and return `via_window: true`. Query writes, `graph explore` and `investigate` need the graph free. Do not remove locks to force a write. See [troubleshooting](./troubleshooting).
