# Service dependency and blast radius analysis

Load your service call graph and ask what a failing dependency takes down, directly or through other services. Answer with Cypher paths, bounded walks and centrality, then share the result as a plain-text dashboard.

## Load the call graph

Import services and calls from CSV with stable IDs, so a repeated sync updates the same records. A Cartography graph in Neo4j, including Kubernetes, comes in through the Neo4j plugin.

[Data sources](https://khonsugraph.com/docs/data-sources)

## Ask who depends on it

A bounded variable-length pattern such as [:CALLS*1..4] finds every service that reaches a dependency within four calls. khonsu explore --direction in walks callers from the failing service.

[Cypher & SQL](https://khonsugraph.com/docs/queries)

## Find load-bearing services

khonsu analyze ranks services by betweenness and PageRank, finds components and communities, and computes weighted shortest paths. Results match networkx on the same graph.

[Graph analysis](https://khonsugraph.com/docs/analysis)

## Share it as a file

A .dash file holds queries, graph panels, tables and shared filters as plain text. khonsu check runs every query read-only before you share it.

[Dashboards](https://khonsugraph.com/docs/dashboards)

## The Online Boutique blast radius.

The application repository builds a 12-service graph with 16 call paths from Google's public Online Boutique manifests. Run it from a repository checkout.

```sh
# 01 — Build the graph from public manifests
$ sh examples/datasets/fetch.sh scratch/datasets/raw
$ node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
$ khonsu init graphs/sre
$ khonsu source add --db graphs/sre --plugin csv --name sre-data \
    -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
    -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
$ khonsu plugin sync --source sre-data

# 02 — Read the schema, then find the services on most paths
$ khonsu schema --db graphs/sre
$ khonsu analyze betweenness --db graphs/sre --label Service

# 03 — Validate and open the dashboard
$ khonsu check examples/sre/blast_radius.dash --db graphs/sre
$ khonsu open graphs/sre
$ khonsu open examples/sre/blast_radius.dash
```

- $PWD keeps the CSV paths absolute, which the CSV plugin needs for nodes and edges.
- Use the label and relationship names khonsu schema reports in your own queries rather than assuming them.

## Know the limits

- Variable-length patterns need a relationship type and no relationship variable, and return the endpoints. Query one-hop relationships separately to draw the services in between.
- Reads stop at 100,000 rows. Put a LIMIT in the query; --max-rows only trims what is displayed.
- The example graph comes from service manifests, not from live traffic. Your blast radius is only as complete as the dependency data you import.
- Snapshots and diffs cover graphs up to 200,000 nodes or relationships.

## Does KhonsuGraph collect traces or metrics from my services?

No. It does not instrument services. You bring the dependency graph in through CSV, the Neo4j plugin, or a plugin you write for your own system.

## How do I find everything that depends on a failing service?

Match callers with a bounded pattern such as MATCH (a:Service)-[:CALLS*1..4]->(b:Service) WHERE b.name = $name RETURN DISTINCT a, or walk against the arrows with khonsu explore --direction in. Adjust the label and type to your schema.

## Can it weight dependencies?

Yes. --weight PROP reads a numeric relationship property as weight for PageRank, or as length for paths, betweenness and closeness. A missing value counts as 1.

## Can I see what changed after a deploy?

Save a snapshot before and after a sync, then run khonsu snapshot diff. A record counts as removed only when the later sync was complete; otherwise it is listed as not seen.

## Can an AI agent run this analysis?

Yes. Every khonsu command prints structured JSON, so an agent that can run shell commands can read the schema, run queries and write a dashboard for you to review.

[Download](https://github.com/JetSquirrel/KhonsuGraph/releases) · [Documentation](https://khonsugraph.com/docs/)
