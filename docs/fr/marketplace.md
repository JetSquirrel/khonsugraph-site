---
description: Trouvez, installez et mettez à jour les plugins KhonsuGraph par leur nom depuis une marketplace, vérifiez ce que vous téléchargez et publiez vos propres plugins.
---
# Marketplace

Une marketplace liste des plugins par leur nom. Pour chaque plugin, elle indique la version, les permissions déclarées et un paquet par plateforme avec son SHA-256. KhonsuGraph peut lire une marketplace depuis un dossier local, un dépôt GitHub ou une adresse HTTPS.

::: info Dans la prochaine version
La marketplace arrive dans la version qui suit la 0.3.0. À partir de cette version, CSV est le seul plugin livré avec l'application. AWS et Neo4j s'installent depuis la marketplace officielle, comme SQL et DuckLocal. Dans la 0.3.0, AWS et Neo4j sont encore livrés avec l'application.
:::

## Installer un plugin {#install}

```sh
khonsu plugin search              # ce que proposent les marketplaces
khonsu plugin install aws --yes   # télécharger, vérifier, installer et approuver
khonsu plugin update              # mettre à jour les plugins installés
```

Dans l'application, **Add Data Source… → More Plugins…** affiche la même liste. Un plugin installé ou mis à jour là passe ensuite par la boîte de dialogue d'approbation, puis par son formulaire de source.

Lorsque deux marketplaces listent le même ID, précisez laquelle utiliser : `khonsu plugin install sql@official`. `khonsu plugin update --dry-run` indique seulement ce qui changerait.

## Plugins officiels {#official}

| Plugin | Ce qu'il lit |
| --- | --- |
| `sql` | Des tables PostgreSQL, MySQL et SQLite, associées à la main ou à partir des clés primaires et étrangères |
| `ducklocal` | Des tables Parquet, CSV, JSON et DuckDB, lues via DuckLocal |
| `aws` | Les VPC, sous-réseaux, groupes de sécurité, instances, équilibreurs de charge et rôles IAM, via l'AWS CLI en lecture seule. Il propose l'analyse d'exposition et le modèle `aws.exposure` |
| `neo4j` | Une base Neo4j, par exemple remplie par Cartography, copiée via son API HTTP |

Chaque installation démarre avec la marketplace `official`. Elle est servie depuis `marketplace.khonsugraph.com` et construite à partir du dépôt [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace), qui contient le code source et le README de chaque plugin. Le plugin CSV reste intégré.

## Ce qui est vérifié {#checks}

- Le paquet doit correspondre au SHA-256 indiqué par la marketplace et contenir le plugin et la version listés. Sinon, rien n'est installé et ce qui l'était déjà reste en place.
- Les index et les paquets sont lus uniquement en HTTPS.
- Installer n'est pas approuver. Un plugin issu d'une marketplace doit être approuvé avant de s'exécuter, puis à nouveau après une mise à jour. `--yes` approuve dans la même étape.

Une marketplace indique où se trouve un paquet et quelle est son empreinte. Elle ne rend pas le plugin sûr. Examinez les permissions déclarées avant d'approuver : ce sont des déclarations, pas un bac à sable. Voir [développement de plugins](./plugins).

## Ajouter une marketplace {#add}

```sh
khonsu marketplace add acme/khonsu-plugins          # owner/repo sur GitHub
khonsu marketplace add https://plugins.example.com  # n'importe quelle adresse HTTPS
khonsu marketplace add ~/work/team-plugins          # un dossier
khonsu marketplace list
khonsu marketplace remove team-plugins
```

`khonsu marketplace remove official` désactive la marketplace officielle, et `khonsu marketplace restore` la rétablit.

## Publier un plugin {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

Cette commande empaquette le plugin dans le dossier et l'ajoute au `marketplace.json` de ce dossier. Validez et poussez le dossier, ou envoyez-le sur un hébergement statique. Les autres l'ajoutent une fois avec `khonsu marketplace add`, puis installent par nom. Publier à nouveau la même version remplace le paquet de cette plateforme : chaque plateforme peut donc publier sa propre compilation. Voir la [référence complète de la marketplace](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md).
