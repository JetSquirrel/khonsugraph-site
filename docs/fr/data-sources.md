---
description: Transformez des fichiers CSV et des ressources AWS en nœuds et relations à l'aide de plugins de source.
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

Le plugin AWS utilise l'AWS CLI pour lire les VPC, les sous-réseaux, les groupes de sécurité, les instances, les équilibreurs de charge et les rôles IAM. Installez et configurez d'abord l'AWS CLI, puis utilisez un profil en lecture seule que vous contrôlez. `regions` est une liste séparée par des virgules, par exemple `us-east-1,eu-west-1`.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Cela accède au compte AWS configuré. Pour une démonstration hors ligne, utilisez plutôt les fixtures enregistrées dans le dépôt de l'application ; voir [exemples](./examples).

Le <a href="/docs/samples/exposure.dash" download>tableau de bord d'exposition AWS</a> retrace `Cidr → SecurityGroup ← Instance → Role` à l'aide des relations importées par ce plugin.

## Sémantique de synchronisation {#sync-semantics}

- Des ID stables permettent aux imports répétés de mettre à jour les enregistrements existants.
- Une synchronisation complète supprime les enregistrements précédemment importés depuis cette source qui sont absents du nouveau résultat.
- Une synchronisation incrémentale ajoute ou met à jour uniquement des enregistrements, lorsque le plugin le prend en charge.
- Une synchronisation échouée peut conserver des enregistrements déjà écrits. La prochaine synchronisation réussie les réconcilie.
- Une relation dont une extrémité est inconnue est ignorée et comptée dans `skipped_edges`.

Les enregistrements importés incluent `khonsu_id`, `khonsu_source`, `khonsu_plugin` et `khonsu_synced_at`. Les écritures dans le graphe et les synchronisations nécessitent un accès exclusif : fermez d'abord le graphe dans l'application.

## Autres systèmes

N'installez un plugin qu'après avoir examiné ses permissions. Les permissions sont des déclarations, et non un bac à sable du système d'exploitation. Les champs de configuration secrets sont stockés dans le trousseau du système. Voir [développement de plugins](./plugins).
