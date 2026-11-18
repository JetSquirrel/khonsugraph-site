---
description: Transformez des fichiers CSV, des comptes AWS et des bases Neo4j ou Cartography en un graphe local de nœuds et de relations à l'aide de plugins de source de données.
---
# Sources de données

Les plugins transforment un système externe en nœuds et relations. KhonsuGraph exécute le plugin comme un processus séparé et écrit les enregistrements dans le graphe.

## CSV

Le plugin CSV intégré transforme les lignes en nœuds et relations. Choisissez des colonnes d'ID, de source et de cible stables ; les autres colonnes deviennent des propriétés. Les valeurs numériques et booléennes sont déduites par défaut. Définissez `infer_types=false` pour conserver du texte.

Voir l'import complet dans [premiers pas](./getting-started). Pour des libellés de nœuds ou des types de relation mixtes, utilisez la configuration JSON `nodes` et `edges`. Les chemins à l'intérieur de ce JSON doivent être absolus : le plugin s'exécute depuis son propre dossier, et seuls les champs de fichier unique sont convertis en chemins absolus pour vous.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

À partir de la version qui suit la 0.3.0, le plugin AWS s'installe depuis la [marketplace](./marketplace) au lieu d'être livré avec l'application : `khonsu plugin install aws --yes`. Dans la 0.3.0, il est livré avec l'application.

Le plugin AWS utilise l'AWS CLI pour lire les VPC, les sous-réseaux, les groupes de sécurité, les instances, les équilibreurs de charge et les rôles IAM. Installez et configurez d'abord l'AWS CLI, puis utilisez un profil en lecture seule que vous contrôlez. `regions` est une liste séparée par des virgules, par exemple `us-east-1,eu-west-1`.

```sh
khonsu graph init graphs/aws
khonsu plugin install aws --yes
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Cette commande accède au compte AWS configuré. Pour un parcours hors ligne, utilisez plutôt les réponses enregistrées dans le dépôt [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace) ; voir les [exemples](./examples).

Le <a href="/docs/samples/exposure.dash" download>tableau de bord d'exposition AWS</a> retrace `Cidr → SecurityGroup ← Instance → Role` à l'aide des relations importées par ce plugin.

## Neo4j et Cartography {#neo4j}

À partir de la version qui suit la 0.3.0, le plugin Neo4j s'installe depuis la [marketplace](./marketplace) au lieu d'être livré avec l'application : `khonsu plugin install neo4j --yes`. Dans la 0.3.0, il est livré avec l'application.

Le plugin Neo4j, ajouté dans la 0.3.0, copie les nœuds et les relations d'une base Neo4j dans un graphe local via l'API HTTP de Neo4j. Il n'envoie que des requêtes de lecture. Son usage principal est [Cartography](https://github.com/cartography-cncf/cartography), qui importe AWS, GCP, Azure, Kubernetes, GitHub, Okta et d'autres systèmes dans Neo4j ; toute base Neo4j fonctionne.

```sh
khonsu graph init graphs/infra
khonsu plugin install neo4j --yes
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

L'adresse est l'adresse HTTP de Neo4j, 7474 par défaut, et non `bolt://`. Le mot de passe est conservé dans le trousseau du système, et un rôle de lecteur suffit.

HawDB ne gère qu'un libellé par nœud, donc chaque nœud prend l'un de ses libellés Neo4j, généralement le plus rare, et les conserve tous dans `neo4j_labels`. Lorsque `MATCH (p:AWSPrincipal)` ne renvoie rien, essayez `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`. Les requêtes écrites pour Neo4j peuvent nécessiter des modifications ; voir [limitations des requêtes](./queries#current-limitations) et le [README du plugin](https://github.com/JetSquirrel/khonsugraph-marketplace/tree/main/plugins/neo4j).

## Sémantique de synchronisation {#sync-semantics}

- Des ID stables permettent aux imports répétés de mettre à jour les enregistrements existants.
- Une synchronisation complète supprime les enregistrements précédemment importés depuis cette source qui sont absents du nouveau résultat.
- Une synchronisation incrémentale ajoute ou met à jour uniquement des enregistrements, lorsque le plugin le prend en charge. `--append` fait de même pour n'importe quelle source : utilisez-le lorsque les fichiers ne contiennent que ce qui est nouveau depuis la dernière synchronisation.
- Un enregistrement inchangé n'est pas réécrit, de sorte que `nodes_written` et `edges_written` du rapport de synchronisation comptent les changements.
- Une synchronisation échouée peut conserver des enregistrements déjà écrits. La prochaine synchronisation réussie les réconcilie.
- Une relation dont une extrémité est inconnue est ignorée et comptée dans `skipped_edges`.

Les enregistrements importés incluent `khonsu_id`, `khonsu_source`, `khonsu_plugin` et `khonsu_synced_at` ; [les preuves](./investigations#evidence) les relisent. Tant que l'application a le graphe ouvert, `khonsu plugin sync` s'exécute via la fenêtre, qui affiche la progression et relance ses tableaux de bord ouverts. Les écritures de requête exigent que le graphe y soit fermé.

## Autres systèmes

N'installez un plugin qu'après avoir examiné ses permissions. Les permissions sont des déclarations, et non un bac à sable du système d'exploitation. Les champs de configuration secrets sont stockés dans le trousseau du système. Voir [développement de plugins](./plugins).
