---
description: Écrivez des tableaux de bord de graphe sous forme de fichiers .dash en texte brut et révisez-les avec un agent.
---
# Tableaux de bord

Un fichier `.dash` est du texte brut : des requêtes nommées, des graphiques et des filtres. Il lit le graphe actuellement ouvert dans l'application. Les données sont importées séparément via des plugins ; il n'existe pas de bloc `source`.

## Votre premier panneau de graphe

Après avoir terminé [premiers pas](./getting-started), enregistrez ceci sous le nom `overview.dash` :

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu dash check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`dash check` exécute chaque requête en lecture seule, valide les colonnes des graphiques et essaie les filtres avec des valeurs réelles. Corrigez chaque erreur signalée avant d'ouvrir ou de partager le tableau de bord.

## Graphiques et mise en page

Les types de graphique incluent `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text` et `graph`. `width` s'étend sur 1 à 12 colonnes. Les requêtes de graphe renvoient des nœuds et des relations complets ; `caption` sélectionne la propriété de nœud affichée comme son libellé. `group` peut regrouper les nœuds par une propriété.

## Filtres partagés

Une ligne de tableau, une barre ou un nœud de graphe peut piloter un filtre. Dans cet exemple, une requête de tableau renvoie `service`, et une autre requête utilise `WHERE $service` :

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

L'espace réservé doit être une condition `WHERE` entière, éventuellement jointe par `AND`. En Cypher, la valeur choisie est comparée à l'expression `match` ; en SQL, elle est comparée à la colonne elle-même, donc `match` n'est pas nécessaire. Une condition non choisie est supprimée ; le graphique source ne se filtre pas lui-même. Les [exemples du dépôt](./examples) complets incluent ces requêtes et graphiques liés.

## Réviser avec un agent

Commentez un graphique dans l'application. Un agent lit les commentaires, modifie le fichier, exécute `dash check` et répond. Les commentaires résident à côté du tableau de bord dans `FILE.comments.json`. La présence permet d'identifier les graphiques que l'agent modifie, et la fenêtre se redessine lorsque le fichier change.

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
khonsu dash check overview.dash --db graphs/demo
khonsu dash presence overview.dash --doing idle
```

Le format ne comporte ni fonctions arbitraires, ni conditionnelles, ni style dépendant des données. Voir [CLI et agents](./cli) pour les commandes de révision.
