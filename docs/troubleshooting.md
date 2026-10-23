---
description: Resolve missing CLI commands, graph locks, empty panels and query validation errors.
---
# Troubleshooting

## khonsu is not found

Use **Command line & AI** (the robot icon) in the app title bar and reopen your terminal. On macOS you can invoke the app binary directly:

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

On Windows, keep `khonsu.exe` with the rest of the extracted package and add that directory to PATH, or invoke it by full path.

## The graph is locked

One process owns a HawDB graph directory. Reads and dashboard checks route through the running window, but writes and source syncs require the graph to be free. Close the graph in the other process. Never delete `khonsugraph.lock`, `owner.hawdb.lock` or database files to bypass a lease.

## A graph panel is empty

Return whole nodes and relationships (`RETURN a, r, b`) instead of only names. Check that you opened the graph the dashboard was written for. Use `khonsu schema --db DIR` and run the query directly to verify the labels and result.

## A query or dashboard fails

Run `khonsu check FILE --db DIR` and read all reported errors. A plot may reference a missing column; an imported dataset may use different labels. Some Cypher features are unsupported: see [query limitations](./queries#current-limitations).

If a read exceeds its budget, narrow it using predicates and `LIMIT`. Lowering `--max-rows` alone does not reduce execution cost.

## A source cannot sync

Run `khonsu plugin describe ID` and check configuration fields. Ensure the packaged plugins remain beside the executable. Single-file CSV paths are stored as absolute paths when the source is added. Paths inside `nodes` and `edges` JSON are stored as given and must be absolute. AWS requires the AWS CLI and an accessible configured profile, unless using fixtures. Write `regions` as comma-separated text, not a JSON array.

A failed sync may leave already written records. Correct the cause, then sync again to reconcile. Inspect `skipped_edges` for unresolved endpoints.

## Report an issue

Include the app version, operating system, command and error kind in a [GitHub issue](https://github.com/JetSquirrel/KhonsuGraph/issues). Remove credentials and private graph values from reproductions.
