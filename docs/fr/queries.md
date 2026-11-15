---
description: Interrogez des graphes en Cypher et des tables en SQL, comprenez le canevas et les limites actuelles de HawDB.
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

Cypher prend en charge `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH` et les motifs de longueur variable bornés. Avec `--write`, `CREATE`, `MERGE`, `SET`, `DELETE` et `DETACH DELETE` sont également disponibles. Par exemple, avec un graphe de services :

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Cela renvoie les extrémités. Interrogez séparément les relations à un saut pour dessiner les connexions intermédiaires.

## SQL et paramètres

Les requêtes SQL opèrent sur les tables du même répertoire HawDB, avec du SQL de dialecte PostgreSQL. Un import de graphe n'implique pas une table SQL de même nom. Inspectez d'abord le `schema`. L'exemple suivant nécessite une table `assets` :

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Les valeurs de `-p` sont analysées comme du JSON lorsque c'est possible, sinon comme des chaînes de caractères. SQL utilise des paramètres positionnels (`$1` avec `-p 1=value`).

## Limitations actuelles {#current-limitations}

La source vérifiée utilise HawDB 0.12.0 :

- Cypher `sum()`, `labels()`, `keys()`, `properties()`, `shortestPath`, les variables de chemin, `CALL db.*` et `SHOW` ne sont pas pris en charge par ce workflow. Utilisez `khonsu schema` pour les métadonnées.
- `count`, `collect`, `min`, `max` et `avg` sont les agrégats pris en charge.
- Les motifs de longueur variable exigent un type de relation et aucune variable de relation.
- `UNWIND` doit être suivi d'une clause d'écriture ; un `UNWIND` autonome en lecture seule et `WHERE true` ne sont pas pris en charge.
- `OPTIONAL MATCH`, `IN` scalaire, `json_value()` sur du texte JSON et `SET` sur une propriété de relation sont pris en charge.
- Les lectures ont un plafond d'exécution de 100 000 lignes. `--max-rows` ne limite que les lignes affichées après exécution, utilisez donc aussi `LIMIT` dans la requête.
- Les valeurs vectorielles sont renvoyées sous forme de tableaux de nombres JSON. Lisez les colonnes de résultat par leur nom ; le moteur peut les réordonner.

## Accès en lecture et en écriture

Les requêtes CLI sont en lecture seule par défaut. `--write` active explicitement les écritures. Un seul processus possède un répertoire de graphe à la fois. Tant que l'application a le graphe ouvert, les requêtes de lecture de la CLI et les vérifications de tableau de bord passent par cette fenêtre. Les écritures et les synchronisations exigent que le graphe y soit fermé.
