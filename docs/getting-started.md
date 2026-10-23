---
description: Install KhonsuGraph, create a graph and import a small CSV example.
---
# Getting started

## Install

Find available packages on [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). The release workflow builds an Apple silicon macOS DMG and a 64-bit Windows ZIP. Windows packages are unsigned; the latest engine upgrade was validated on macOS, not Windows.

On macOS, open the DMG and copy the app into Applications. On Windows, extract the entire ZIP, preserving the `plugins` folder beside the executable.

The **Command line & AI** button (the robot icon) in the app title bar installs the `khonsu` command on PATH and can add the agent skill to Claude Code. The app executable also accepts CLI subcommands directly.

```sh
khonsu --version
```

## Create a small graph

Download [hosts.csv](/samples/hosts.csv) and [dependencies.csv](/samples/dependencies.csv) into the same working folder. They describe three hosts and two dependencies.

Run these commands in that folder. Keep the graph closed in the desktop app during the import.

```sh
khonsu init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

The first sync previews counts and samples without writing; the second imports the graph. `source add` stores the CSV paths as absolute paths, so later syncs work from any folder.

## Query and explore

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

In the desktop query editor, run the same Cypher query. Returning whole nodes and relationships gives the graph canvas the information it needs to show connections.

Continue with [queries](./queries) or [your first dashboard](./dashboards).

## Build from source

From a checkout of the app repository:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

The app uses Rust, GPUI and HawDB. See the repository README for release packaging and platform-specific setup.
