---
description: Suivez des chemins dans un graphe avec khonsu explore, citez la preuve derrière chaque enregistrement, enregistrez une investigation et vérifiez-la à nouveau après l'évolution des données.
---
# Investigations

Une investigation suit des relations depuis un point de départ vers une réponse : quel chemin mène d'Internet à cette instance, ce qu'un service en échec entraîne avec lui, qui se tient derrière une société. KhonsuGraph sépare quatre choses pour que la réponse puisse être vérifiée plus tard : le chemin, la preuve de chaque enregistrement qu'il contient, l'investigation enregistrée, et ce qui a changé dans le graphe depuis.

Ces commandes sont apparues dans KhonsuGraph 0.3.0. Exécutez `khonsu --version` pour voir ce que vous avez.

## Suivre un chemin {#explore}

`khonsu explore` part d'un ou plusieurs nœuds vers l'extérieur sans charger tout le graphe. Dans la fenêtre, la même exploration s'appelle **Path Explorer** et s'effectue sur un canevas de graphe.

```sh
khonsu explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` et `--to` prennent un `khonsu_id` (l'ID stable que porte chaque enregistrement synchronisé) ou un ID de nœud numérique. Les ID ci-dessus sont illustratifs, issus d'un graphe AWS comme dans [les exemples](./examples#aws-exposure) ; lisez les vôtres avec une requête telle que `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5`.

| Option | Signification | Valeur par défaut |
| --- | --- | --- |
| `--from NODE` | Un nœud de départ. Répétez l'option pour plusieurs nœuds | Requis |
| `--to NODE` | Signaler un chemin au plus petit nombre de sauts vers ce nœud parmi ceux trouvés par l'exploration | Aucun |
| `--direction out\|in\|both` | Le long des flèches, à contresens, ou les deux | `out` |
| `--type A,B` | Ne suivre que ces types de relation | Tous les types |
| `--max-hops N` | Sauts depuis un départ, au maximum 16 | 3 |
| `--max-nodes N` | Nœuds renvoyés, au maximum 2 000 | 200 |
| `--max-edges N` | Relations renvoyées, au maximum 5 000 | 500 |

Chaque saut dans la sortie comporte un `text` tel que `Internet -[ROUTES_TO]-> shop`. Lisez d'abord `complete`. Lorsqu'il est faux, `limits` nomme le plafond qui a interrompu l'exploration, de sorte qu'un chemin manquant signifie « absent dans ces limites », et non « aucun chemin ». Une valeur supérieure à un plafond est refusée plutôt qu'abaissée.

Un chemin est un candidat trouvé dans les données. Ce n'est pas la preuve que quelque chose est accessible, et l'absence de chemin n'est pas une preuve de sécurité.

## Preuves {#evidence}

`khonsu evidence` indique ce qui soutient un nœud ou une relation : quelle source et quel plugin l'ont écrit, quand il a changé pour la dernière fois, et si la dernière synchronisation de cette source était complète.

```sh
khonsu evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| Champ | Signification |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` ou `rel:<khonsu_id>`. Citez-le lorsque vous rapportez une conclusion |
| `source`, `plugin` | Ce qui a écrit l'enregistrement |
| `record_written_at` | Quand l'enregistrement a changé pour la dernière fois, et non quand il a été vu pour la dernière fois |
| `source_last_successful_sync` | Inconnu lorsque la dernière synchronisation de la source a échoué |
| `source_coverage` | La dernière exécution de la source : `complete`, `partial`, `failed` ou `cancelled`, et les lacunes éventuelles |
| `assertion` | `explicit` (une source l'a rapporté), `derived` ou `unknown` |
| `properties`, `redacted` | Les propriétés de l'enregistrement lui-même, et les noms masqués comme secrets possibles |

Un champ de provenance est soit connu avec une valeur, soit explicitement inconnu ; rien n'est estimé. Avec `--to`, `khonsu explore` ajoute `path.evidence`, un enregistrement dérivé qui liste les ID de preuve sur lesquels repose le chemin.

La force avec laquelle une relation est connue est une convention portée par ses propres propriétés. `confidence` vaut `confirmed`, `inferred` ou `unconfirmed`, et `evidence` indique ce qui l'a montré. Un chemin est aussi solide que son saut le plus faible : une seule relation `unconfirmed` rend le chemin non confirmé.

## Analyses de plugin {#plugin-analyses}

Un plugin peut fournir des règles propres à son domaine. `khonsu plugin describe ID` les liste, et `khonsu plugin analyze` en exécute une :

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

L'analyse `exposure` d'AWS renvoie des constats avec un verdict `potential_exposure`, `insufficient_data` ou `not_indicated`. Chaque constat nomme sa règle, les conditions vérifiées avec les champs qui les sous-tendent, ce qu'il n'a pas pu évaluer (`unknowns`), ce que la règle ne lit pas (`assumptions`), et une `walk` que vous pouvez passer à `khonsu explore`. Un constat décrit une configuration. Il ne dit pas qu'une ressource est accessible, ni qu'elle est sûre.

## Investigations enregistrées {#saved-investigations}

Une investigation enregistrée conserve les points de départ et les filtres d'une exploration, le chemin que vous avez choisi, une requête et un tableau de bord dans un fichier qui lui est propre. L'enregistrement n'écrit rien dans le graphe.

```sh
khonsu investigation save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigation reopen web.investigation
```

La réouverture exécute à nouveau l'exploration sur le graphe tel qu'il est maintenant et indique en quoi cela diffère de l'état au moment de l'enregistrement. Lisez d'abord `graph_state` :

| `graph_state` | Signification |
| --- | --- |
| `unchanged` | Le graphe contient ce qu'il contenait lors de l'enregistrement |
| `changed` | Quelque chose diffère. `differences` indique ce qu'il peut, et n'est pas une liste complète |
| `not_compared` | Le graphe contient plus de 200 000 nœuds ou relations, il n'a donc pas été haché, et les comptages concordent |

Une réponse modifiée ne remplace jamais silencieusement celle qui a été enregistrée. `path_same` indique si le chemin repose toujours sur les mêmes enregistrements. `missing_seeds` et `target_missing` nomment des enregistrements enregistrés qui ont disparu. `unsure` liste les enregistrements retrouvés uniquement par un ID interne sur un graphe modifié. `incomplete_sources` nomme les sources dont la dernière synchronisation n'était pas complète.

Une nouvelle synchronisation qui ne change rien laisse le graphe `unchanged` : la comparaison couvre les libellés, les types, les extrémités et les propriétés, et laisse de côté les ID internes et les heures de synchronisation.

Le fichier est du JSON. Il contient le chemin du graphe, les ID des sources de données, les ID stables des enregistrements et les filtres. Il ne contient jamais la configuration des sources ni des identifiants. Le chemin du graphe peut inclure un nom d'utilisateur, vérifiez-le donc avant de partager un fichier.

## Instantanés et diff {#snapshots}

Un instantané conserve les enregistrements d'un graphe dans un fichier, par ID stable, afin que vous puissiez demander plus tard ce qui a changé. Les instantanés sont pris manuellement ; rien n'en prend lors d'une synchronisation.

```sh
khonsu snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu snapshot save tuesday.snapshot.json --db graphs/aws
khonsu snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu snapshot check monday.snapshot.json --db graphs/aws
```

| Liste | Signification |
| --- | --- |
| `added` | Présent uniquement dans l'instantané le plus récent |
| `removed` | Disparu, et la dernière synchronisation de la source était complète dans l'instantané le plus récent |
| `not_seen` | Absent de l'instantané le plus récent, sans rien pour montrer que la source a été lue complètement. Il peut encore exister |
| `changed` | Le même ID stable avec des propriétés, des libellés ou des extrémités différents |

Un enregistrement n'est `removed` que lorsque l'instantané le plus récent peut le corroborer. Après une synchronisation partielle ou échouée, il reste dans `not_seen`, et `warnings` en explique la raison.

Un instantané ne contient pas le chemin du graphe, la configuration des sources ni les identifiants, et tout ce qui ressemble à un secret est masqué. Il contient en revanche les autres propriétés de vos données, traitez donc le fichier comme vous traiteriez le graphe.

## Dans la fenêtre

Sélectionnez un nœud sur un canevas de graphe et utilisez **Path Explorer** pour partir de celui-ci. **Enregistrer l'investigation…** conserve les filtres actuels, les points de départ de la dernière exploration, le chemin vers le nœud sélectionné et la requête de l'onglet. **Graphe > Ouvrir une investigation…**, ou `khonsu open web.investigation`, en rouvre une dans un nouvel onglet. Tout ce qui diffère de l'état de l'enregistrement apparaît comme un avertissement sur le canevas.

## Limites

- `khonsu explore` et `khonsu investigation` ont besoin du graphe libre. Ils échouent avec le type `locked` tant que la fenêtre le garde ouvert ; utilisez plutôt Path Explorer dans la fenêtre.
- Un graphe de plus de 200 000 nœuds ou relations ne peut pas être instantané et échoue avec le type `too_large`.
- Les enregistrements écrits à la main n'ont pas d'ID stable. Ils sont comptés mais non comparés dans un diff.
- La fenêtre n'a pas encore de vue d'instantané ni de diff.

La [référence de la CLI](./cli) liste toutes les commandes. Pour la centralité, les communautés et les chemins les plus courts sur l'ensemble du graphe, voir [analyse de graphe](./analysis).
