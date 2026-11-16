# Open-source attack path analysis on your own machine

Import AWS configuration, a Cartography graph or your own CSV files. Trace candidate paths from an internet CIDR through security groups and load balancers to instances and the roles they assume, and cite the record behind every hop.

## Import the graph

The AWS plugin reads VPCs, subnets, security groups, instances, load balancers and IAM roles through the AWS CLI with a read-only profile. The Neo4j plugin copies a Cartography database, which covers AWS, GCP, Azure, Kubernetes, GitHub, Okta and more.

[Data sources](https://khonsugraph.com/docs/data-sources)

## Walk outward, within limits

khonsu explore (Path Explorer in the window) follows chosen relationship types up to 16 hops and reports a fewest-hops path to a target. complete says whether a cap cut the walk short.

[Follow a path](https://khonsugraph.com/docs/investigations#explore)

## Get rule-based findings

khonsu plugin analyze aws exposure returns potential_exposure, insufficient_data or not_indicated, with the rule, the fields it checked, what it could not evaluate, and a walk to pass to khonsu explore.

[Plugin analyses](https://khonsugraph.com/docs/investigations#plugin-analyses)

## Cite and re-check

khonsu evidence names the source, plugin and write time behind each record. Save the investigation, re-sync, and reopen it to see whether the path still rests on the same records.

[Saved investigations](https://khonsugraph.com/docs/investigations#saved-investigations)

## Trace exposure in the saved AWS fixture.

The application repository ships saved AWS CLI responses, so this runs offline. Run it from the root of a repository checkout.

```sh
# 01 — Import the saved AWS responses
$ khonsu init graphs/aws
$ khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
    -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
$ khonsu plugin sync --source aws-fixture

# 02 — Ask the exposure rules
$ khonsu plugin analyze aws exposure --db graphs/aws \
    --verdict potential-exposure --pretty

# 03 — Find stable IDs, then trace the path
$ khonsu query --db graphs/aws \
    --cypher "MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5"
$ khonsu explore --db graphs/aws --from <cidr-id> --to <instance-id> \
    --type ROUTES_TO,FORWARDS_TO

# 04 — Cite what the path rests on
$ khonsu evidence --db graphs/aws --node <instance-id>
```

- Each finding carries a walk you can pass straight to khonsu explore.
- The example dashboard examples/aws/exposure.dash draws Cidr → SecurityGroup ← Instance → Role from the same graph.

## What it does not claim

- A path is a candidate found in the data. It is not proof that anything can be reached, and the absence of a path is not proof of safety.
- An exposure finding describes configuration. It does not say a resource is reachable, or safe.
- A walk stops at its caps: at most 16 hops, 2,000 nodes and 5,000 relationships. When complete is false, a missing path means "not within these caps".
- The AWS plugin reads the resource types listed above. For other services and clouds, bring in a Cartography graph through the Neo4j plugin.
- khonsu explore needs the graph free; while the desktop window has it open, use Path Explorer there instead.

## Does KhonsuGraph need access to my AWS account?

Only if you sync a live account, and then through the AWS CLI with a profile you choose; a read-only profile is enough. The saved fixture in the application repository needs no account at all. Graph storage and queries stay on your machine.

## Can I analyze attack paths in a Cartography graph?

Yes. The Neo4j plugin copies the nodes and relationships of the Neo4j database Cartography fills into a local graph, over Neo4j's HTTP API with read queries only. A reader role is enough.

## Does it test whether a path is exploitable?

No. KhonsuGraph reads configuration and relationships and finds candidate paths in that data. It does not send traffic or test exploitability, and it says so in every finding.

## How do I keep a finding reproducible?

Save the walk with khonsu investigation save. Reopening it runs the walk again on the current graph and reports graph_state, whether the path still rests on the same records, and which sources had an incomplete last sync.

## Is it free?

Yes. KhonsuGraph is open source under the Apache-2.0 license, with release packaging for Apple silicon macOS and 64-bit Windows.

[Download](https://github.com/JetSquirrel/KhonsuGraph/releases) · [Documentation](https://khonsugraph.com/docs/)
