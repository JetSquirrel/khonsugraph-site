---
description: Installez KhonsuGraph, créez un graphe et importez un petit exemple CSV.
---
# Premiers pas

## Installation

Les paquets disponibles se trouvent sur [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). Le workflow de publication construit un DMG macOS pour Apple silicon et un ZIP Windows 64 bits. Les paquets Windows ne sont pas signés ; la dernière mise à niveau du moteur a été validée sur macOS, pas sur Windows.

Sous macOS, ouvrez le DMG et copiez l'application dans Applications. Sous Windows, extrayez l'intégralité du ZIP en conservant le dossier `plugins` à côté de l'exécutable.

Le bouton **Ligne de commande et IA** (l'icône robot) dans la barre de titre de l'application installe la commande `khonsu` dans le PATH et peut ajouter la compétence d'agent à Claude Code. L'exécutable de l'application accepte aussi directement les sous-commandes de la CLI.

```sh
khonsu --version
```

## Créer un petit graphe

Téléchargez [hosts.csv](/samples/hosts.csv) et [dependencies.csv](/samples/dependencies.csv) dans un même dossier de travail. Ils décrivent trois hôtes et deux dépendances.

Exécutez ces commandes dans ce dossier. Gardez le graphe fermé dans l'application de bureau pendant l'import.

```sh
khonsu graph init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

La première synchronisation prévisualise des comptages et des échantillons sans rien écrire ; la seconde importe le graphe. `source add` enregistre les chemins des CSV comme chemins absolus, de sorte que les synchronisations ultérieures fonctionnent depuis n'importe quel dossier.

## Interroger et explorer

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

Dans l'éditeur de requêtes de l'application de bureau, exécutez la même requête Cypher. Renvoyer des nœuds et des relations complets fournit au canevas du graphe les informations dont il a besoin pour afficher les connexions.

Poursuivez avec [les requêtes](./queries) ou [votre premier tableau de bord](./dashboards).

## Construire depuis les sources

Depuis une copie du dépôt de l'application :

```sh
cargo build --workspace
cargo run -p khonsugraph
```

L'application utilise Rust, GPUI et HawDB. Consultez le README du dépôt pour l'empaquetage des versions et la configuration propre à chaque plateforme.
