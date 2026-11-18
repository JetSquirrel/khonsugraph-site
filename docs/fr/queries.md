---
description: Interrogez un graphe local en Cypher et des tables en SQL PostgreSQL. Clauses Cypher prises en charge, chemins les plus courts, paramètres et limites actuelles de HawDB.
---
# Cypher et SQL

## Inspecter avant d'interroger

```sh
khonsu schema --db graphs/demo
```

Le résultat liste les libellés, les types de relation, les noms de propriétés, les comptages, les motifs de relation et les tables SQL. Utilisez ces noms au lieu de supposer le schéma d'un autre graphe.

## Renvoyer les connexions

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

Renvoyer des nœuds et des relations complets fournit à la fois les valeurs du tableau et les éléments du graphe. Renvoyer uniquement `a.name` donne une colonne scalaire, et non un graphe connecté. Dans la CLI, les éléments de graphe apparaissent dans un objet `graph` séparé.

Cypher prend en charge `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE` et les motifs de longueur variable bornés. Avec `--write`, `CREATE`, `MERGE`, `SET`, `DELETE` et `DETACH DELETE` sont également disponibles. Par exemple, avec un graphe de services :

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Cela renvoie les extrémités. Interrogez séparément les relations à un saut pour dessiner les connexions intermédiaires.

## Chemins les plus courts

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)` et `relationships(p)` fonctionnent également. Les deux extrémités doivent être liées par un ensemble de propriétés, un `WHERE` ou une clause antérieure. Renvoyer `p` dessine le chemin sur le canevas. Un `*` non borné s'arrête à 256 sauts et échoue au lieu de signaler qu'aucun chemin n'existe.

Pour partir d'un nœud vers l'extérieur avec des plafonds sur les sauts et la taille, utilisez [`khonsu graph explore`](./investigations#explore). Pour les chemins pondérés, la centralité et les communautés, voir [analyse de graphe](./analysis).

## SQL et paramètres

Les requêtes SQL opèrent sur les tables du même répertoire HawDB, avec du SQL de dialecte PostgreSQL. Un import de graphe n'implique pas une table SQL de même nom. Inspectez d'abord le `schema`. L'exemple suivant nécessite une table `assets` :

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Les valeurs de `-p` sont analysées comme du JSON lorsque c'est possible, sinon comme des chaînes de caractères. SQL utilise des paramètres positionnels (`$1` avec `-p 1=value`).

## Limitations actuelles {#current-limitations}

KhonsuGraph 0.3.0 utilise HawDB 0.29.0, dont le Cypher diffère de celui d'autres bases de graphes :

- `labels()`, `keys()`, `properties()`, `CALL db.*` et `SHOW` ne sont pas pris en charge. Utilisez `khonsu schema` pour les métadonnées.
- `count`, `sum`, `collect`, `min`, `max` et `avg` sont les agrégats pris en charge, y compris sur des expressions.
- Une lecture commence par `MATCH` ou `UNWIND`. Un `RETURN 1` seul ne s'analyse pas, et `OPTIONAL MATCH` ne peut pas être la première clause.
- Les motifs de longueur variable exigent un type de relation et aucune variable de relation. Un motif de relation sans type ne fonctionne que pour un saut.
- Les variables de chemin ne fonctionnent qu'avec `shortestPath` et `allShortestPaths`.
- Les chaînes de caractères ne peuvent pas être concaténées avec `+`, et `toLower`, `toUpper`, `reduce`, `any`, `all`, `none` et `exists` ne sont pas disponibles.
- `CREATE` prend un seul motif par instruction. `LOAD CSV` est désactivé ; importez les fichiers avec une [source de données](./data-sources).
- `IN` scalaire, les compréhensions de listes, `json_value()` sur du texte JSON, les dates et les durées, et `SET` sur une propriété de relation sont pris en charge.
- Les lectures ont un plafond d'exécution de 100 000 lignes. `--max-rows` ne limite que les lignes affichées après exécution, utilisez donc aussi `LIMIT` dans la requête.
- Les valeurs vectorielles sont renvoyées sous forme de tableaux de nombres JSON. Les colonnes reviennent dans l'ordre du `RETURN` ; lisez-les tout de même par leur nom.
- `WHERE true` fonctionne en Cypher mais pas en SQL.

Un graphe écrit avant HawDB 0.25, par KhonsuGraph 0.2.0 ou une version antérieure, ne peut pas être lu par cette version ; voir [dépannage](./troubleshooting#old-format).

## Vérifier une requête, ou interroger avec les mots de l'ontologie {#semantic}

`--validate-only` vérifie une instruction Cypher par rapport aux labels, types de relation et motifs du graphe, et n'exécute rien : un label mal orthographié, une relation suivie dans le mauvais sens ou un motif absent du graphe est signalé avec des noms proches. `--semantic` permet à une requête de nommer des concepts comme `Device` et `Account` au lieu des labels d'une source. Les deux arrivent dans la version qui suit la 0.3.0 ; voir [ontologie](./ontology#semantic).

## Accès en lecture et en écriture

Les requêtes CLI sont en lecture seule par défaut. `--write` active explicitement les écritures. Un seul processus possède un répertoire de graphe à la fois. Tant que l'application a le graphe ouvert, les requêtes de lecture de la CLI et les vérifications de tableau de bord passent par cette fenêtre. Les écritures et les synchronisations exigent que le graphe y soit fermé.

Une instruction exécutée avec `--write` ne vient d'aucune source de données, donc `khonsu graph rebuild` ne la reprend pas. À partir de la version qui suit la 0.3.0, chacune est consignée dans `writes.jsonl` dans le dossier de configuration (quand, quel graphe, l'instruction avec les éléments de clé masqués, et l'agent qui l'a exécutée), pour pouvoir la retrouver et la réécrire.
