---
description: Dites ce que signifient les labels d'un graphe avec des fichiers d'ontologie et de mapping, vérifiez qu'un graphe peut répondre à une question, trouvez comment les concepts se relient et interrogez avec les mots de l'ontologie.
---
# Ontologie

Les labels d'un graphe disent d'où viennent les enregistrements : `Host`, `EntraUser`, `WazuhAgent`. L'ontologie dit ce qu'ils sont : un `Device`, un `Account`. Avec elle, une question se pose dans les mêmes mots quelles que soient les sources qui ont construit le graphe, et vous ou un agent IA pouvez savoir si un graphe peut y répondre avant d'écrire une requête.

::: info Dans la prochaine version
Les commandes d'ontologie, `--semantic` et `--validate-only` arrivent dans la version qui suit la 0.3.0.
:::

L'ontologie vit dans des fichiers, jamais dans le graphe. Un graphe contient ce que ses sources de données ont écrit, et [`khonsu graph rebuild`](./troubleshooting#old-format) le refait à partir d'elles : tout ce qui ne serait que dans le graphe serait perdu.

## Concepts et mappings {#files}

**Un fichier d'ontologie** (`*.ontology.json`) déclare des concepts et les relations permises entre eux :

```json
{
  "format": "khonsu-ontology",
  "version": 1,
  "id": "attack",
  "revision": "0.1.0",
  "concepts": [
    { "name": "Technique", "description": "An ATT&CK technique.", "synonyms": ["ttp"] }
  ],
  "relationships": [
    { "name": "indicates", "from": "Entity", "to": "Technique" }
  ]
}
```

Un concept peut étendre (`extends`) d'autres concepts, et une relation vaut pour tout ce qui étend ses extrémités : `holds` de `Agent` vers `Account` relie aussi une `Person` à un `Account`.

**Un fichier de mapping** (`*.mapping.json`) dit ce que sont les labels et les types de relation d'un graphe :

```json
{
  "format": "khonsu-mapping",
  "version": 1,
  "id": "security-example",
  "revision": "1",
  "status": "draft",
  "labels": [{ "label": "Host", "concept": "Device" }],
  "relationship_types": [{ "type": "RAN_ON", "relationship": "runs_on" }]
}
```

Tout est `draft` tant qu'une personne ne l'a pas relu et n'a pas mis `"status": "certified"`. Les réponses listent sous `drafts` les brouillons sur lesquels elles reposent.

## D'où vient la bibliothèque {#library}

Dans cet ordre, la première copie d'un ID l'emportant :

1. **Intégrée** : une vingtaine de concepts communs à toute investigation, comme `Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event` et `Observation`, et les relations entre eux.
2. `ontology/` dans le dossier de configuration de KhonsuGraph.
3. `ontology/` dans le dossier de chaque plugin installé : un plugin fournit ainsi le sens des labels qu'il écrit.
4. Chaque `--ontology PATH` passé, fichier ou dossier.

Un fichier inutilisable est signalé sous `problems` et ignoré ; le reste se charge quand même. L'exemple de sécurité du dépôt contient un [pack ATT&CK et un mapping](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology).

## Demander avant d'interroger {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # ce qui est mappé, et ce qui ne l'est pas
khonsu graph ontology resolve machine login ip            # ce que veulent dire des mots
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** liste les concepts et les relations, ou un concept en détail avec `--concept`. Avec `--db`, il compare la bibliothèque au graphe : labels mappés (avec leurs effectifs), labels et types de relation non mappés, et labels mappés mais absents.
- **resolve** dit ce que veut dire chaque mot : un concept ou une relation par nom ou synonyme, ou un label auquel un mapping donne un sens. Un mot qui ne veut rien dire reçoit des `suggestions`.
- **check** dit si le graphe contient des enregistrements de chaque chose dont parle une question. Un terme est `missing` en tant que `unknown_term`, `no_mapping` ou `not_in_graph`, et la commande se termine alors avec le code **3** et le type `not_investigable`.
- **path** donne les chemins les plus courts d'un concept à un autre : par les relations déclarées et, avec `--db`, par les motifs que le graphe contient réellement, chacun sous forme de `pattern` Cypher prêt pour `MATCH`. Un chemin est une façon dont les données se relient, pas la preuve que quelque chose s'est passé le long de ce chemin.

Chaque réponse porte `ontology_versions` : les fichiers utilisés, par ID, révision et origine.

## Interroger avec les mots de l'ontologie {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

Avec `--semantic`, un concept employé comme label devient tous les labels de ce graphe mappés vers lui ou vers ce qui l'étend, et une relation devient les types mappés vers elle : `(d:Device)` devient `(d:Host:Server)` et `[:runs_on]` devient `[:EXEC_ON|RAN_ON]`. Les labels que le graphe possède déjà restent tels quels. Un concept que rien ne porte dans le graphe se termine avec le code 3 au lieu de ne renvoyer aucune ligne. Le résultat contient `semantic`, avec l'instruction exécutée, chaque remplacement et les brouillons utilisés. Une requête sémantique ne fait que lire.

## Vérifier une requête sans l'exécuter {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` vérifie une instruction par rapport au graphe et n'exécute rien ; `--semantic` fait la même vérification avant chaque requête.

| Type | Gravité | Signification |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | erreur | Le graphe n'a pas ce label ou ce type de relation ; `suggestions` propose des noms proches |
| `wrong_direction` | erreur | Le graphe ne contient le motif que dans l'autre sens |
| `no_such_pattern` | erreur | Le graphe ne contient ce motif dans aucun sens |
| `unbounded` | avertissement | Un motif de longueur variable sans borne supérieure |
| `cartesian` | avertissement | Des parties d'un même `MATCH` ne partagent aucune variable, si bien que toutes les paires de leurs lignes reviennent |

Une erreur se termine avec le code 2, le type `invalid_query` et les problèmes sous `error.detail` ; les avertissements sont signalés et l'instruction s'exécute. La référence complète se trouve dans le [dépôt source](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md).
