---
description: La ligne de commande khonsu imprime du JSON pour chaque commande, afin que Claude Code et d'autres agents IA puissent inspecter un graphe, l'interroger, suivre des chemins et écrire des tableaux de bord.
---
# CLI et agents IA

L'application de bureau et la CLI partagent un seul exécutable. Sans argument, `khonsugraph` ouvre l'application ; avec une sous-commande, il exécute la commande puis se termine. Le bouton **Ligne de commande et IA** de la barre de titre (l'icône robot) installe `khonsu` dans le PATH et peut installer la compétence pour Claude Code.

La [compétence d'agent](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) enseigne aux agents le workflow « schéma d'abord » et le sous-ensemble Cypher pris en charge.

## Référence des commandes

| Commande | Objet |
| --- | --- |
| `khonsu graph init DIR` | Créer un graphe vide |
| `khonsu schema --db DIR` | Inspecter les libellés, les relations, les propriétés et les tables |
| `khonsu query --db DIR --cypher "…"` | Exécuter une instruction Cypher en lecture seule |
| `khonsu query --db DIR --sql "…"` | Exécuter une instruction SQL en lecture seule |
| `khonsu query --db DIR --file query.cypher` | Exécuter un fichier de requête ; `.sql` sélectionne SQL |
| `khonsu query --db DIR --semantic --cypher "…"` | [Interroger avec les mots de l'ontologie](./ontology#semantic) : `Device`, `Account`, `runs_on` |
| `khonsu query --db DIR --validate-only --cypher "…"` | [Vérifier une instruction](./ontology#validate) par rapport au graphe sans rien exécuter |
| `khonsu graph explain --db DIR --cypher "…"` | Expliquer une requête |
| `khonsu graph ontology describe [--db DIR]` | Lister les [concepts](./ontology) et les labels du graphe qu'ils couvrent |
| `khonsu graph ontology resolve WORD…` | Dire ce que veulent dire des mots : concepts, synonymes et labels correspondants |
| `khonsu graph ontology check --db DIR --entities a,b` | Savoir si le graphe contient des enregistrements de chaque chose dont parle une question |
| `khonsu graph ontology path --from A --to B [--db DIR]` | Comment deux concepts se relient, sous forme de motifs Cypher |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [Partir d'un nœud vers l'extérieur](./investigations#explore) et signaler un chemin |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | Afficher [ce qui soutient un enregistrement](./investigations#evidence) |
| `khonsu graph analyze ALGORITHM --db DIR` | Exécuter un [algorithme de graphe](./analysis) : PageRank, communautés, composantes et plus |
| `khonsu investigate save FILE --db DIR --from NODE` | [Enregistrer une investigation](./investigations#saved-investigations) ; `reopen FILE` la réexécute |
| `khonsu graph snapshot save FILE --db DIR` | Conserver les enregistrements du graphe ; [`snapshot diff A B`](./investigations#snapshots) en compare deux |
| `khonsu graph rebuild --db DIR` | Reconstruire un graphe à l'ancien format depuis ses sources de données |
| `khonsu plugin list` | Lister les plugins et leurs permissions |
| `khonsu plugin describe ID` | Afficher les champs de configuration et les types de sortie d'un plugin |
| `khonsu plugin search [WORDS]` | Lister ce que proposent les [marketplaces](./marketplace) |
| `khonsu plugin install ID --yes` | Installer un plugin par son nom depuis une marketplace et l'approuver |
| `khonsu plugin install DIR --yes` | Installer un répertoire ou un ZIP de plugin et approuver ses permissions |
| `khonsu plugin update` | Mettre à jour les plugins installés depuis une marketplace ; `--dry-run` prévisualise |
| `khonsu plugin marketplace list` | Lister les marketplaces ; `add` et `remove` les modifient |
| `khonsu plugin sync --source ID` | Synchroniser une source ; `--dry-run` prévisualise, `--incremental` et `--append` ajoutent sans supprimer |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Exécuter [l'analyse d'un plugin](./investigations#plugin-analyses), telle que `exposure` d'AWS |
| `khonsu source list` | Lister les sources configurées |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configurer une source ; `--test` la vérifie d'abord |
| `khonsu source remove ID` | Supprimer une source |
| `khonsu dash check FILE --db DIR` | Valider un tableau de bord par rapport à un graphe |
| `khonsu dash comments FILE` | Lister, commenter en réponse et résoudre les commentaires de graphiques |
| `khonsu dash presence FILE --doing editing --plot NAME` | Indiquer à la fenêtre les graphiques que vous modifiez |
| `khonsu open DIR` | Ouvrir un graphe dans l'application de bureau |
| `khonsu open FILE.dash` | Ouvrir un tableau de bord |
| `khonsu open --state` | Lire le graphe et les onglets de la fenêtre en cours d'exécution |

`--db` prend par défaut la valeur de `KHONSU_DB`, puis le graphe ouvert en dernier dans l'application. Utilisez un chemin explicite dans l'automatisation. Les écritures de requête nécessitent `--write`.

## Sortie et erreurs

Chaque commande imprime un objet JSON sur stdout ; `--pretty` l'indente. La progression de la synchronisation va vers stderr sous forme de lignes JSON. Les résultats de requête contiennent `columns`, `rows`, `row_count`, `truncated` et `elapsed_ms`, plus `graph` lorsque des nœuds ou des relations sont renvoyés.

`--max-rows` vaut 200 par défaut et tronque le résultat affiché. Cela ne réduit pas le travail d'exécution de la requête. Inspectez toujours `truncated` et utilisez des requêtes bornées.

Les échecs comportent un objet `error` avec `kind` et `message`, et éventuellement `detail`. Vérifiez le code de sortie avant d'interpréter stdout : 1 indique une erreur d'exécution ; 2 indique une erreur d'utilisation ou de spécification de tableau de bord.

À partir de la version qui suit la 0.3.0, le code 2 signale aussi une requête qui [ne correspond pas au graphe](./ontology#validate) (`invalid_query`), 3 signifie que le graphe ne contient aucun enregistrement de ce dont parle la question (`not_investigable`), et 4 qu'une personne doit confirmer (`needs_confirmation`).

## L'approbation revient à une personne {#approval}

À partir de la version qui suit la 0.3.0, approuver les permissions d'un plugin est la décision d'une personne. Quand un agent exécute `khonsu plugin install … --yes`, `plugin update` ou `plugin approve`, le plugin est installé ou mis à jour mais pas approuvé, et la commande se termine avec le code 4 et le type `needs_confirmation`, en nommant les plugins. Demandez à la personne de les approuver dans l'application ou depuis son propre terminal. Un agent est détecté par `KHONSU_AGENT` ou par les variables que définissent Claude Code, Codex, Cursor et Gemini CLI.

## Une boucle de révision

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# Modifiez le fichier .dash, puis validez-le.
khonsu dash check overview.dash --db graphs/demo
# Utilisez un ID de commentaire réel renvoyé par la première commande.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

Lorsque l'application détient un graphe, les requêtes de lecture, `dash check` et `plugin sync` passent par la fenêtre et renvoient `via_window: true`. Les écritures de requête, `graph explore` et `investigate` exigent que le graphe soit libre. Ne supprimez pas de verrous pour forcer une écriture. Voir [dépannage](./troubleshooting).
