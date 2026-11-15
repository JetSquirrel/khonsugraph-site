---
description: Example graph investigations on public datasets. An attack chain from Sysmon logs, a service blast radius, the ICIJ Offshore Leaks network, a Bitcoin trust network and AWS exposure.
---
# Examples

The [application repository](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) includes dashboards and scripts that prepare graphs from public datasets. A `.dash` file alone does not include its database.

## Public datasets

| Dashboard | Question | Source data | Graph |
| --- | --- | --- | --- |
| [Security attack chain](#attack-chain) | Which attack chain hides in noisy host logs? | MITRE ATT&CK and OTRF Security-Datasets | 1,838 nodes, 20,591 relationships |
| [SRE blast radius](#blast-radius) | What does a failing service take down? | Google Online Boutique service manifests | 12 services, 16 call paths |
| [Offshore company network](#offshore-network) | Who stands behind a set of companies? | ICIJ Offshore Leaks | 5,577 nodes, 6,515 relationships |
| [Account trust network](#trust-network) | Which accounts do others warn about? | SNAP Bitcoin OTC ratings | 5,881 accounts, 35,592 ratings |
| Renting near transit | Which homes are near an MTR station? | OpenStreetMap MTR data and Inside Airbnb Hong Kong | 5,730 nodes, 17,119 relationships |

Each source retains its own license. Appearance in the ICIJ dataset does not imply wrongdoing. See the repository's examples README for provenance and licensing.

## Attack chain {#attack-chain}

For a security engineer or threat hunter. `security/attack_chain.dash` joins MITRE ATT&CK (groups, software, techniques, mitigations) with two OTRF Sysmon recordings, Empire Mimikatz and Covenant PowerShell remoting. Process-create and LSASS-access events link to the techniques they indicate. Pick a technique to see which known groups use it and how to mitigate it; pick a process to see what it spawned and connected to.

Build it with the commands below, with `security` in place of `sre` and `attack_chain.dash` as the dashboard.

## Offshore network {#offshore-network}

For an investigator. `investigation/offshore_network.dash` maps officers, companies and intermediaries from the ICIJ Offshore Leaks database (Panama Papers, Hong Kong, 2012–2015). Pick an officer to see their companies, and find the intermediaries that set up the most.

Build it with `investigation` in place of `sre`.

## Trust network {#trust-network}

For an auditor. `audit/trust_network.dash` explores who rates whom in the Bitcoin OTC trust network. [Graph analysis](./analysis) finds the accounts the network rests on:

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Build it with `audit` in place of `sre`.

## Service blast radius {#blast-radius}

For an SRE: which services call a failing dependency, directly or through others. From an app repository checkout:

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

## AWS exposure without a live account {#aws-exposure}

For a cloud security engineer: what an AWS account's configuration opens to the internet, from an internet CIDR through security groups and load balancers to instances and the roles they assume.

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

From 0.3.0, `khonsu plugin analyze aws exposure --db graphs/aws` reports findings with the rule and fields behind each, and `khonsu explore` traces the path. See [investigations](./investigations).
