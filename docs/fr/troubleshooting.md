---
description: Résolvez les commandes CLI introuvables, les verrous de graphe, les panneaux vides et les erreurs de validation de requête.
---
# Dépannage

## khonsu est introuvable

Utilisez **Ligne de commande et IA** (l'icône robot) dans la barre de titre de l'application, puis rouvrez votre terminal. Sous macOS, vous pouvez invoquer directement le binaire de l'application :

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

Sous Windows, conservez `khonsu.exe` avec le reste du paquet extrait et ajoutez ce répertoire au PATH, ou invoquez-le par son chemin complet.

## Le graphe est verrouillé

Un seul processus possède un répertoire de graphe HawDB. Les lectures et les vérifications de tableau de bord passent par la fenêtre en cours d'exécution, mais les écritures et les synchronisations de source exigent que le graphe soit libre. Fermez le graphe dans l'autre processus. Ne supprimez jamais `khonsugraph.lock`, `owner.hawdb.lock` ou des fichiers de base de données pour contourner un bail.

## Le graphe signale old_format {#old-format}

HawDB 0.25 a changé son format de stockage et ne lit aucun graphe plus ancien, de sorte qu'un graphe écrit par KhonsuGraph 0.2.0 ou une version antérieure échoue à l'ouverture avec le type `old_format`. `khonsu rebuild --db DIR` le reconstruit à partir de ses sources de données et conserve l'ancien répertoire à côté sous le nom `DIR.hawdb-old`. Tout ce qui a été écrit à la main plutôt que synchronisé n'est pas reporté.

## Un panneau de graphe est vide

Renvoyez des nœuds et des relations complets (`RETURN a, r, b`) au lieu de seulement des noms. Vérifiez que vous avez ouvert le graphe pour lequel le tableau de bord a été écrit. Utilisez `khonsu schema --db DIR` et exécutez la requête directement pour vérifier les libellés et le résultat.

## Une requête ou un tableau de bord échoue

Exécutez `khonsu check FILE --db DIR` et lisez toutes les erreurs signalées. Un graphique peut référencer une colonne manquante ; un jeu de données importé peut utiliser des libellés différents. Certaines fonctionnalités de Cypher ne sont pas prises en charge : voir [limitations des requêtes](./queries#current-limitations).

Si une lecture dépasse son budget, restreignez-la à l'aide de prédicats et de `LIMIT`. Réduire seulement `--max-rows` ne diminue pas le coût d'exécution.

## Une source ne parvient pas à se synchroniser

Exécutez `khonsu plugin describe ID` et vérifiez les champs de configuration. Assurez-vous que les plugins empaquetés restent à côté de l'exécutable. Les chemins CSV de fichier unique sont stockés comme chemins absolus lorsque la source est ajoutée. Les chemins à l'intérieur du JSON `nodes` et `edges` sont stockés tels quels et doivent être absolus. AWS nécessite l'AWS CLI et un profil configuré accessible, sauf si vous utilisez des fixtures. Écrivez `regions` sous forme de texte séparé par des virgules, et non de tableau JSON.

Une synchronisation échouée peut laisser des enregistrements déjà écrits. Corrigez la cause, puis synchronisez à nouveau pour réconcilier. Inspectez `skipped_edges` pour les extrémités non résolues.

## Signaler un problème

Incluez la version de l'application, le système d'exploitation, la commande et le type d'erreur dans un [ticket GitHub](https://github.com/JetSquirrel/KhonsuGraph/issues). Retirez les identifiants et les valeurs de graphe privées des reproductions.
