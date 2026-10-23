---
description: Explore repository dashboards for AWS exposure, service dependencies, security and trust networks.
---
# Examples

The [application repository](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) includes dashboards and scripts that prepare graphs from public datasets. A `.dash` file alone does not include its database.

## Public datasets

| Dashboard | Source data |
| --- | --- |
| Security attack chain | MITRE ATT&CK and OTRF Security-Datasets |
| SRE blast radius | Google Online Boutique service manifests |
| Offshore company network | ICIJ Offshore Leaks |
| Account trust network | SNAP Bitcoin OTC ratings |
| Renting near transit | OpenStreetMap MTR data and Inside Airbnb Hong Kong |

Each source retains its own license. Appearance in the ICIJ dataset does not imply wrongdoing. See the repository's examples README for provenance and licensing.

## Build a service graph

From an app repository checkout:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

The fetch script downloads public data. `$PWD` keeps the CSV paths absolute, which the CSV plugin needs for `nodes` and `edges`. Replace `sre` with the other story directories as described in the examples README.

## AWS without a live account

The app repository contains saved AWS CLI responses. Run from its root:

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

You can also <a href="/docs/samples/exposure.dash" download>download the exposure dashboard</a>. It requires the imported AWS graph.
