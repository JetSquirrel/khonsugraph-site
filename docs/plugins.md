---
description: Build a data-source plugin in any language using the JSON Lines protocol.
---
# Plugin development

A plugin is a separate executable that emits nodes and relationships over stdin/stdout using JSON Lines. The host writes the records into HawDB. A plugin does not need to open the graph itself.

Protocol version 1 is experimental and may change before 1.0. The [full protocol reference](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) is maintained with the application.

## Package layout

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

The executable runs with the plugin folder as its working directory. The smallest complete example is the repository's [Python folders plugin](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders).

## Operations

| Operation | Input | Output |
| --- | --- | --- |
| `describe` | None | Configuration schema, permissions and output types |
| `test` | Request with config and secrets | `test_result` or `error` |
| `sync` | Request with config, secrets, mode and cursor | Records and progress, then `done` or `error` |

Every message is a JSON object on its own line with a `type` field. Diagnostics belong on stderr. Keep IDs stable between syncs; relationship endpoints refer to node IDs from the same source. Finish successful syncs with `done`.

## Permissions and secrets

Declare network access, file reads and commands in the manifest. KhonsuGraph shows these declarations for approval, but does **not** sandbox the process. Mark secret configuration fields with `secret: true` to use the system keychain.

Install a plugin directory or ZIP after reviewing it:

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` approves declared permissions. The installer copies the plugin; reinstall after changing the source. See [sync semantics](./data-sources#sync-semantics) before implementing full or incremental sync.
