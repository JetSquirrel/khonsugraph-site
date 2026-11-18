---
description: Exécutez PageRank, betweenness, les communautés Louvain, les composantes connexes, le k-core et les chemins les plus courts sur un graphe local avec khonsu graph analyze.
---
# Analyse de graphe

Une requête Cypher répond à ce que vous demandez sur des motifs nommés. `khonsu graph analyze` répond à des questions sur la forme du graphe : quel nœud est le plus central, quels groupes se forment, comment deux nœuds se connectent. Il calcule en mémoire et suit les définitions de networkx, de sorte que les résultats correspondent à networkx sur le même graphe.

```sh
khonsu graph analyze summary --db graphs/audit
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu graph analyze communities --db graphs/investigation
```

Commencez par `summary` sur un graphe que vous ne connaissez pas.

## Algorithmes

| Commande | Répond à | Options |
| --- | --- | --- |
| `summary` | Taille, densité, composantes, clustering, plus grand cœur et diamètre | |
| `degree` | Quels nœuds ont le plus de relations | `--top N` |
| `pagerank` | Vers quels nœuds le reste du graphe pointe | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | Quels nœuds se trouvent sur le plus de chemins les plus courts | `--sample K` |
| `closeness` | Quels nœuds sont au plus petit nombre de sauts de tout le reste | `--undirected` |
| `components` | Quelles parties du graphe sont déconnectées | `--strong` |
| `communities` | Quels groupes sont densément connectés (Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | À quelle fréquence les voisins d'un nœud se connaissent | |
| `kcore` | Le cœur densément connecté du graphe | |
| `path` | Le chemin le plus court entre deux nœuds | `--from ID --to ID` |

`path` prend des ID de nœud numériques : renvoyez `id(n)` depuis une requête, ou lisez `_id` dans un résultat.

## Choisir le sous-graphe

Par défaut, un algorithme lit tout le graphe. Restreignez-le de trois manières :

```sh
khonsu graph analyze betweenness --db graphs/sre --label Service
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS
khonsu graph analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` conserve les nœuds portant ces libellés et les relations entre eux.
- `--type` conserve ces relations et, sans `--label`, uniquement les nœuds qu'elles joignent.
- `--cypher` analyse exactement les nœuds et les relations qu'une requête renvoie en entier.

Les relations sont orientées, sauf si vous passez `--undirected`. Le clustering, les cœurs et les communautés les lisent toujours dans les deux sens. `--weight PROP` lit une propriété de relation numérique comme poids pour PageRank, ou comme longueur pour les chemins, betweenness et closeness. Une valeur manquante compte pour 1.

## Sortie

Chaque exécution imprime un objet JSON avec `algorithm`, le `graph` lu (`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms` et `rows`.

Les lignes de nœuds sont `{id, labels, name, <score>}`, les meilleures d'abord, limitées par `--top`. `components` et `communities` renvoient des groupes avec leur `size` et leurs dix premiers `members` ; les communautés ajoutent `modularity`. `path` renvoie `found`, `hops`, `length` et les nœuds du chemin.

Betweenness est exact jusqu'à 5 000 nœuds et échantillonné à partir de 500 sources au-delà. `sampled_sources` vaut null lorsque le résultat est exact ; dites-le lorsque vous rapportez un résultat échantillonné.

## Analyse ou Cypher ?

Cypher dispose de `shortestPath` et `allShortestPaths` entre deux nœuds liés ; voir [Cypher et SQL](./queries). Utilisez `khonsu graph analyze path` lorsque le chemin doit respecter un poids, et les autres algorithmes lorsque la question porte sur l'ensemble du graphe plutôt que sur un motif. Pour partir d'un nœud vers l'extérieur avec des plafonds sur les sauts et la taille, utilisez [`khonsu graph explore`](./investigations#explore).
