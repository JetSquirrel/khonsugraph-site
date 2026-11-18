---
description: Créez un plugin de source de données dans n'importe quel langage à l'aide du protocole JSON Lines.
---
# Développement de plugins

Un plugin est un exécutable séparé qui émet des nœuds et des relations sur stdin/stdout au format JSON Lines. L'hôte écrit les enregistrements dans HawDB. Un plugin n'a pas besoin d'ouvrir lui-même le graphe.

La version 1 du protocole est expérimentale et peut changer avant la 1.0. La [référence complète du protocole](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) est maintenue avec l'application.

## Structure du paquet

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

L'exécutable s'exécute avec le dossier du plugin comme répertoire de travail. Le plus petit exemple complet est le [plugin Python folders](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders) du dépôt.

## Opérations

| Opération | Entrée | Sortie |
| --- | --- | --- |
| `describe` | Aucune | Schéma de configuration, permissions et types de sortie |
| `test` | Requête avec configuration et secrets | `test_result` ou `error` |
| `sync` | Requête avec configuration, secrets, mode et curseur | Enregistrements et progression, puis `done` ou `error` |

Chaque message est un objet JSON sur sa propre ligne avec un champ `type`. Les diagnostics appartiennent à stderr. Gardez les ID stables entre les synchronisations ; les extrémités des relations référencent les ID de nœud de la même source. Terminez les synchronisations réussies par `done`.

## Permissions et secrets

Déclarez l'accès réseau, les lectures de fichiers et les commandes dans le manifeste. KhonsuGraph affiche ces déclarations pour approbation, mais ne place **pas** le processus dans un bac à sable. Marquez les champs de configuration secrets avec `secret: true` pour utiliser le trousseau du système.

Installez un répertoire ou un ZIP de plugin après l'avoir examiné :

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` approuve les permissions déclarées. Exécuté par un agent IA, il [n'approuve rien](./cli#approval). L'installateur copie le plugin ; réinstallez-le après avoir modifié la source. Voir [sémantique de synchronisation](./data-sources#sync-semantics) avant d'implémenter une synchronisation complète ou incrémentale.

## Partager un plugin {#share}

Pour que d'autres puissent installer votre plugin par son nom, publiez-le dans une marketplace. Voir [publier un plugin](./marketplace#publish).
