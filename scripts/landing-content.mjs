// English landing pages for specific search intents. Each is generated at /<slug>/ by generate-home.mjs.
// Every claim here must be backed by the documentation in docs/; keep commands identical to the docs.
// Text fields are plain text: `code` becomes <code>, everything else is escaped.
export const landingPages = [
  {
    slug: 'use-cases/attack-path-analysis',
    crumb: 'Attack path analysis',
    metaTitle: 'Open-Source Attack Path Analysis | KhonsuGraph',
    metaDescription: 'Trace attack paths from the internet to instances and IAM roles on your own machine. Open-source graph investigation with path walks and record-level evidence.',
    eyebrow: 'USE CASE · CLOUD SECURITY',
    h1: 'Open-source attack path analysis on your own machine',
    lead: 'Import AWS configuration, a Cartography graph or your own CSV files. Trace candidate paths from an internet CIDR through security groups and load balancers to instances and the roles they assume, and cite the record behind every hop.',
    capsEye: 'WHAT YOU CAN DO', capsTitle: 'From configuration<br>to a path you can defend.',
    capsLead: 'Each step is a command with structured JSON output, and the same walk is available on the desktop graph canvas.',
    caps: [
      ['Import the graph', 'The AWS plugin reads VPCs, subnets, security groups, instances, load balancers and IAM roles through the AWS CLI with a read-only profile. The Neo4j plugin copies a Cartography database, which covers AWS, GCP, Azure, Kubernetes, GitHub, Okta and more.', 'Data sources', 'data-sources'],
      ['Walk outward, within limits', '`khonsu explore` (Path Explorer in the window) follows chosen relationship types up to 16 hops and reports a fewest-hops path to a target. `complete` says whether a cap cut the walk short.', 'Follow a path', 'investigations#explore'],
      ['Get rule-based findings', '`khonsu plugin analyze aws exposure` returns `potential_exposure`, `insufficient_data` or `not_indicated`, with the rule, the fields it checked, what it could not evaluate, and a walk to pass to `khonsu explore`.', 'Plugin analyses', 'investigations#plugin-analyses'],
      ['Cite and re-check', '`khonsu evidence` names the source, plugin and write time behind each record. Save the investigation, re-sync, and reopen it to see whether the path still rests on the same records.', 'Saved investigations', 'investigations#saved-investigations'],
    ],
    walkEye: 'TRY IT WITHOUT A LIVE ACCOUNT', walkTitle: 'Trace exposure in the<br>saved AWS fixture.',
    walkLead: 'The application repository ships saved AWS CLI responses, so this runs offline. Run it from the root of a repository checkout.',
    terminal: 'aws-exposure', commands: `# 01 — Import the saved AWS responses
$ khonsu init graphs/aws
$ khonsu source add --db graphs/aws --plugin aws --name aws-fixture \\
    -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
$ khonsu plugin sync --source aws-fixture

# 02 — Ask the exposure rules
$ khonsu plugin analyze aws exposure --db graphs/aws \\
    --verdict potential-exposure --pretty

# 03 — Find stable IDs, then trace the path
$ khonsu query --db graphs/aws \\
    --cypher "MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5"
$ khonsu explore --db graphs/aws --from <cidr-id> --to <instance-id> \\
    --type ROUTES_TO,FORWARDS_TO

# 04 — Cite what the path rests on
$ khonsu evidence --db graphs/aws --node <instance-id>`,
    terminalNote: 'Every command prints JSON an agent or a script can read.',
    walkNotes: ['Each finding carries a `walk` you can pass straight to `khonsu explore`.', 'The example dashboard `examples/aws/exposure.dash` draws `Cidr → SecurityGroup ← Instance → Role` from the same graph.'],
    limitsTitle: 'What it does not claim',
    limits: [
      'A path is a candidate found in the data. It is not proof that anything can be reached, and the absence of a path is not proof of safety.',
      'An exposure finding describes configuration. It does not say a resource is reachable, or safe.',
      'A walk stops at its caps: at most 16 hops, 2,000 nodes and 5,000 relationships. When `complete` is false, a missing path means "not within these caps".',
      'The AWS plugin reads the resource types listed above. For other services and clouds, bring in a Cartography graph through the Neo4j plugin.',
      '`khonsu explore` needs the graph free; while the desktop window has it open, use Path Explorer there instead.',
    ],
    faq: [
      ['Does KhonsuGraph need access to my AWS account?', 'Only if you sync a live account, and then through the AWS CLI with a profile you choose; a read-only profile is enough. The saved fixture in the application repository needs no account at all. Graph storage and queries stay on your machine.'],
      ['Can I analyze attack paths in a Cartography graph?', 'Yes. The Neo4j plugin copies the nodes and relationships of the Neo4j database Cartography fills into a local graph, over Neo4j\'s HTTP API with read queries only. A reader role is enough.'],
      ['Does it test whether a path is exploitable?', 'No. KhonsuGraph reads configuration and relationships and finds candidate paths in that data. It does not send traffic or test exploitability, and it says so in every finding.'],
      ['How do I keep a finding reproducible?', 'Save the walk with `khonsu investigation save`. Reopening it runs the walk again on the current graph and reports `graph_state`, whether the path still rests on the same records, and which sources had an incomplete last sync.'],
      ['Is it free?', 'Yes. KhonsuGraph is open source under the Apache-2.0 license, with release packaging for Apple silicon macOS and 64-bit Windows.'],
    ],
    related: [['Investigations guide', '/docs/investigations'], ['AWS exposure example', '/docs/examples#aws-exposure'], ['Attack chain from Sysmon logs', '/docs/examples#attack-chain'], ['Blast radius analysis', '/use-cases/sre-dependency-analysis/'], ['Neo4j Browser alternative', '/compare/neo4j-browser-alternative/']],
  },
  {
    slug: 'use-cases/sre-dependency-analysis',
    crumb: 'Blast radius analysis',
    metaTitle: 'Blast Radius & Service Dependency Analysis | KhonsuGraph',
    metaDescription: 'Map service dependencies and find the blast radius of a failing service in a local graph. Open-source, with Cypher paths, graph algorithms and dashboards.',
    eyebrow: 'USE CASE · SRE',
    h1: 'Service dependency and blast radius analysis',
    lead: 'Load your service call graph and ask what a failing dependency takes down, directly or through other services. Answer with Cypher paths, bounded walks and centrality, then share the result as a plain-text dashboard.',
    capsEye: 'WHAT YOU CAN DO', capsTitle: 'One failing service.<br>Everything it touches.',
    capsLead: 'Bring the dependency graph you already have; KhonsuGraph does not instrument your services.',
    caps: [
      ['Load the call graph', 'Import services and calls from CSV with stable IDs, so a repeated sync updates the same records. A Cartography graph in Neo4j, including Kubernetes, comes in through the Neo4j plugin.', 'Data sources', 'data-sources'],
      ['Ask who depends on it', 'A bounded variable-length pattern such as `[:CALLS*1..4]` finds every service that reaches a dependency within four calls. `khonsu explore --direction in` walks callers from the failing service.', 'Cypher & SQL', 'queries'],
      ['Find load-bearing services', '`khonsu analyze` ranks services by betweenness and PageRank, finds components and communities, and computes weighted shortest paths. Results match networkx on the same graph.', 'Graph analysis', 'analysis'],
      ['Share it as a file', 'A `.dash` file holds queries, graph panels, tables and shared filters as plain text. `khonsu check` runs every query read-only before you share it.', 'Dashboards', 'dashboards'],
    ],
    walkEye: 'A REAL EXAMPLE', walkTitle: 'The Online Boutique<br>blast radius.',
    walkLead: 'The application repository builds a 12-service graph with 16 call paths from Google\'s public Online Boutique manifests. Run it from a repository checkout.',
    terminal: 'blast-radius', commands: `# 01 — Build the graph from public manifests
$ sh examples/datasets/fetch.sh scratch/datasets/raw
$ node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
$ khonsu init graphs/sre
$ khonsu source add --db graphs/sre --plugin csv --name sre-data \\
    -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \\
    -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
$ khonsu plugin sync --source sre-data

# 02 — Read the schema, then find the services on most paths
$ khonsu schema --db graphs/sre
$ khonsu analyze betweenness --db graphs/sre --label Service

# 03 — Validate and open the dashboard
$ khonsu check examples/sre/blast_radius.dash --db graphs/sre
$ khonsu open graphs/sre
$ khonsu open examples/sre/blast_radius.dash`,
    terminalNote: 'Plain files. Versionable. Reviewable.',
    walkNotes: ['`$PWD` keeps the CSV paths absolute, which the CSV plugin needs for `nodes` and `edges`.', 'Use the label and relationship names `khonsu schema` reports in your own queries rather than assuming them.'],
    limitsTitle: 'Know the limits',
    limits: [
      'Variable-length patterns need a relationship type and no relationship variable, and return the endpoints. Query one-hop relationships separately to draw the services in between.',
      'Reads stop at 100,000 rows. Put a `LIMIT` in the query; `--max-rows` only trims what is displayed.',
      'The example graph comes from service manifests, not from live traffic. Your blast radius is only as complete as the dependency data you import.',
      'Snapshots and diffs cover graphs up to 200,000 nodes or relationships.',
    ],
    faq: [
      ['Does KhonsuGraph collect traces or metrics from my services?', 'No. It does not instrument services. You bring the dependency graph in through CSV, the Neo4j plugin, or a plugin you write for your own system.'],
      ['How do I find everything that depends on a failing service?', 'Match callers with a bounded pattern such as `MATCH (a:Service)-[:CALLS*1..4]->(b:Service) WHERE b.name = $name RETURN DISTINCT a`, or walk against the arrows with `khonsu explore --direction in`. Adjust the label and type to your schema.'],
      ['Can it weight dependencies?', 'Yes. `--weight PROP` reads a numeric relationship property as weight for PageRank, or as length for paths, betweenness and closeness. A missing value counts as 1.'],
      ['Can I see what changed after a deploy?', 'Save a snapshot before and after a sync, then run `khonsu snapshot diff`. A record counts as removed only when the later sync was complete; otherwise it is listed as not seen.'],
      ['Can an AI agent run this analysis?', 'Yes. Every khonsu command prints structured JSON, so an agent that can run shell commands can read the schema, run queries and write a dashboard for you to review.'],
    ],
    related: [['Graph analysis guide', '/docs/analysis'], ['Blast radius example', '/docs/examples#blast-radius'], ['Dashboards guide', '/docs/dashboards'], ['Attack path analysis', '/use-cases/attack-path-analysis/'], ['CLI & AI agents', '/docs/cli']],
  },
  {
    slug: 'compare/neo4j-browser-alternative',
    crumb: 'Neo4j Browser alternative',
    metaTitle: 'Neo4j Browser Alternative for Local Graphs | KhonsuGraph',
    metaDescription: 'A free, open-source desktop alternative to Neo4j Browser for investigation: an embedded graph engine, path walks, record-level evidence and an agent CLI.',
    eyebrow: 'COMPARISON',
    h1: 'A local, serverless alternative to Neo4j Browser',
    lead: 'KhonsuGraph is a desktop investigation workbench with its own embedded engine, HawDB. Copy a Neo4j or Cartography database into a local graph, then walk paths, cite evidence and save investigations without running a database server.',
    capsEye: 'WHAT CHANGES', capsTitle: 'Built for investigating,<br>not administering.',
    capsLead: 'Neo4j Browser is the query console for a Neo4j server. KhonsuGraph is a workbench around a graph that lives in a folder on your disk.',
    caps: [
      ['No server to run', 'The graph is a HawDB directory opened by the desktop app or the khonsu CLI. One process owns a graph at a time; while the window has it open, CLI reads route through the window.', 'Getting started', 'getting-started'],
      ['Cypher and SQL side by side', 'Query relationships in HawDB\'s Cypher and tables in PostgreSQL-dialect SQL in the same directory, with results as a table or an explorable graph.', 'Cypher & SQL', 'queries'],
      ['Evidence for every record', 'Synced records carry their source, plugin and write time. `khonsu evidence` reports them, along with whether the source\'s last sync was complete.', 'Evidence', 'investigations#evidence'],
      ['Investigations that re-check', 'A saved investigation keeps the walk, the chosen path, a query and a dashboard. Reopening it after the data changes says what differs instead of replacing the answer silently.', 'Saved investigations', 'investigations#saved-investigations'],
    ],
    table: {
      title: 'Side by side', note: 'Neo4j Browser and Neo4j Bloom are products of Neo4j, Inc. This table lists only what the KhonsuGraph documentation covers; check Neo4j\'s documentation for its current features.',
      head: ['', 'KhonsuGraph', 'Neo4j Browser'],
      rows: [
        ['Where the graph lives', 'An embedded HawDB directory on your machine', 'A Neo4j database server it connects to'],
        ['Query languages', 'HawDB Cypher and PostgreSQL-dialect SQL', 'Neo4j Cypher'],
        ['Bounded path walks', '`khonsu explore` and Path Explorer, with hop and size caps and a `complete` flag', 'Written as Cypher queries'],
        ['Record provenance', 'Source, plugin, write time and sync coverage per record', 'Whatever properties your data carries'],
        ['Re-checking a saved result', 'Saved investigations report what changed in the graph', 'Not covered here'],
        ['Automation', 'A JSON CLI for scripts and AI agents', 'Not covered here'],
      ],
    },
    walkEye: 'BRING YOUR NEO4J DATA', walkTitle: 'Copy a Neo4j database<br>into a local graph.',
    walkLead: 'The Neo4j plugin, added in 0.3.0, copies nodes and relationships over Neo4j\'s HTTP API and sends read queries only.',
    terminal: 'neo4j-import', commands: `# 01 — Copy the database (HTTP port 7474, not bolt://)
$ khonsu init graphs/infra
$ khonsu source add --db graphs/infra --plugin neo4j --name infra \\
    -c url=http://127.0.0.1:7474 -c password=... --test
$ khonsu plugin sync --source infra

# 02 — Read the schema KhonsuGraph sees
$ khonsu schema --db graphs/infra

# 03 — Match on any of a node's original labels
$ khonsu query --db graphs/infra --cypher \\
    "MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels RETURN p LIMIT 25"
$ khonsu open graphs/infra`,
    terminalNote: 'The password is kept in the system keychain. A reader role is enough.',
    walkNotes: ['HawDB has one label per node. Each node takes one of its Neo4j labels, usually the rarest, and keeps all of them in `neo4j_labels`.', 'Run the sync again to refresh the copy; a full sync removes records that are gone from the source.'],
    limitsTitle: 'When to keep using Neo4j Browser',
    limits: [
      'You rely on Cypher that HawDB does not support: `labels()`, `keys()`, `properties()`, `CALL db.*`, `SHOW`, string concatenation with `+`, `toLower`, `toUpper`, or path variables outside `shortestPath`.',
      'You need several labels on one node. HawDB keeps one, and the rest in `neo4j_labels`.',
      'You want to edit a shared, live database. KhonsuGraph works on a local copy and its plugin only reads from Neo4j.',
      'Your reads return more than 100,000 rows; that is HawDB\'s execution ceiling.',
    ],
    faq: [
      ['Does KhonsuGraph replace Neo4j?', 'No. It is a desktop investigation workbench with its own embedded engine. It can read from Neo4j, and Neo4j stays the source; KhonsuGraph never writes to it.'],
      ['Will my existing Cypher queries work?', 'Many will, but HawDB\'s Cypher differs from Neo4j\'s. Variable-length patterns need a relationship type, some functions are missing, and a read starts with MATCH or UNWIND. The query guide lists the current limits.'],
      ['How is it different from Neo4j Bloom?', 'KhonsuGraph runs without a database server and adds bounded path walks, record-level evidence, graph algorithms and a JSON command line for AI agents. It does not reproduce Bloom\'s features.'],
      ['Does it work with Cartography?', 'Yes. Cartography fills a Neo4j database, and the Neo4j plugin copies it into a local graph. Match on `neo4j_labels` when a label you expect returns nothing.'],
      ['Is it free?', 'Yes. KhonsuGraph is open source under Apache-2.0. It is an independent project built on HawDB and is not affiliated with Neo4j, Inc.'],
    ],
    related: [['Neo4j and Cartography import', '/docs/data-sources#neo4j'], ['Cypher limitations', '/docs/queries#current-limitations'], ['Attack path analysis', '/use-cases/attack-path-analysis/'], ['Blast radius analysis', '/use-cases/sre-dependency-analysis/'], ['Getting started', '/docs/getting-started']],
  },
];
