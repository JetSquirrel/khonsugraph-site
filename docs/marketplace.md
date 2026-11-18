---
description: Find, install and update KhonsuGraph plugins by name from a marketplace, check what you download, and publish your own plugins.
---
# Marketplace

A marketplace lists plugins by name. For each plugin it gives the version, the declared permissions, and one package per platform with its SHA-256. KhonsuGraph can read a marketplace from a folder on disk, a GitHub repository or an HTTPS address.

::: info Coming in the next release
The marketplace arrives in the release after 0.3.0. From that release, CSV is the only plugin that ships with the app. AWS and Neo4j are installed from the official marketplace, like SQL and DuckLocal. In 0.3.0, AWS and Neo4j still ship with the app.
:::

## Install a plugin {#install}

```sh
khonsu plugin search              # what the marketplaces offer
khonsu plugin install aws --yes   # download, check, install and approve
khonsu plugin update              # bring installed plugins up to date
```

In the app, **Add Data Source… → More Plugins…** shows the same list. Install or update a plugin there, and it goes on to the approval dialog, then to its source form.

When two marketplaces list the same ID, name the one you want: `khonsu plugin install sql@official`. `khonsu plugin update --dry-run` only reports what would change.

## Official plugins {#official}

| Plugin | What it reads |
| --- | --- |
| `sql` | PostgreSQL, MySQL and SQLite tables, mapped by hand or from primary and foreign keys |
| `ducklocal` | Parquet, CSV, JSON and DuckDB tables, read through DuckLocal |
| `aws` | VPCs, subnets, security groups, instances, load balancers and IAM roles, through the read-only AWS CLI. It offers the exposure analysis and the `aws.exposure` template |
| `neo4j` | A Neo4j database, such as one Cartography fills, copied over its HTTP API |

Every installation starts with the `official` marketplace. It is served from `marketplace.khonsugraph.com` and built from the [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) repository, which holds each plugin's source and README. The CSV plugin stays built in.

## What is checked {#checks}

- The package must match the SHA-256 the marketplace lists, and hold the plugin and version listed. Otherwise nothing is installed, and what was installed before stays.
- Indexes and packages are read over HTTPS only.
- Installing is not approving. A plugin from a marketplace needs approval before it runs, and an updated one needs it again. `--yes` approves in the same step. Run by an AI agent, it approves nothing and exits 4; see [approval](./cli#approval).

A marketplace says where a package is and what its hash is. It does not make the plugin safe. Review the declared permissions before you approve; they are declarations, not a sandbox. See [plugin development](./plugins).

## Add a marketplace {#add}

```sh
khonsu plugin marketplace add acme/khonsu-plugins   # owner/repo on GitHub
khonsu plugin marketplace add https://plugins.example.com  # any HTTPS address
khonsu plugin marketplace add ~/work/team-plugins   # a folder
khonsu plugin marketplace list
khonsu plugin marketplace remove team-plugins
```

`khonsu plugin marketplace remove official` turns the official marketplace off, and `khonsu plugin marketplace restore` brings it back.

## Publish a plugin {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

This packs the plugin into the folder and lists it in that folder's `marketplace.json`. Commit and push the folder, or upload it to a static host. Others add it once with `khonsu plugin marketplace add` and then install by name. Publishing the same version again replaces that platform's package, so each platform can publish its own build. See the [full marketplace reference](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md).
