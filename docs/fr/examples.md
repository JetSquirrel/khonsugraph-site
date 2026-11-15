---
description: Des investigations de graphe d'exemple sur des jeux de données publics. Une chaîne d'attaque issue des journaux Sysmon, un rayon d'impact de service, le réseau ICIJ Offshore Leaks, un réseau de confiance Bitcoin et l'exposition AWS.
---
# Exemples

Le [dépôt de l'application](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) inclut des tableaux de bord et des scripts qui préparent des graphes à partir de jeux de données publics. Un fichier `.dash` seul n'inclut pas sa base de données.

## Jeux de données publics

| Tableau de bord | Question | Données source | Graphe |
| --- | --- | --- | --- |
| [Chaîne d'attaque de sécurité](#attack-chain) | Quelle chaîne d'attaque se cache dans des journaux d'hôtes bruyants ? | MITRE ATT&CK et OTRF Security-Datasets | 1 838 nœuds, 20 591 relations |
| [Rayon d'impact SRE](#blast-radius) | Qu'entraîne la défaillance d'un service ? | Manifestes de service Google Online Boutique | 12 services, 16 chemins d'appel |
| [Réseau de sociétés offshore](#offshore-network) | Qui se tient derrière un ensemble de sociétés ? | ICIJ Offshore Leaks | 5 577 nœuds, 6 515 relations |
| [Réseau de confiance de comptes](#trust-network) | Quels comptes les autres signalent-ils ? | Évaluations SNAP Bitcoin OTC | 5 881 comptes, 35 592 évaluations |
| Location près des transports | Quels logements sont près d'une station MTR ? | Données MTR OpenStreetMap et Inside Airbnb Hong Kong | 5 730 nœuds, 17 119 relations |

Chaque source conserve sa propre licence. Une présence dans le jeu de données ICIJ n'implique pas un acte répréhensible. Voir le README des exemples du dépôt pour la provenance et les licences.

## Chaîne d'attaque {#attack-chain}

Pour un ingénieur sécurité ou un chasseur de menaces. `security/attack_chain.dash` joint MITRE ATT&CK (groupes, logiciels, techniques, mesures d'atténuation) à deux enregistrements OTRF Sysmon, Empire Mimikatz et Covenant PowerShell remoting. Les événements de création de processus et d'accès à LSASS se lient aux techniques qu'ils indiquent. Choisissez une technique pour voir quels groupes connus l'utilisent et comment l'atténuer ; choisissez un processus pour voir ce qu'il a engendré et à quoi il s'est connecté.

Construisez-le avec les commandes ci-dessous, avec `security` à la place de `sre` et `attack_chain.dash` comme tableau de bord.

## Réseau offshore {#offshore-network}

Pour un investigateur. `investigation/offshore_network.dash` cartographie les dirigeants, les sociétés et les intermédiaires de la base ICIJ Offshore Leaks (Panama Papers, Hong Kong, 2012–2015). Choisissez un dirigeant pour voir ses sociétés, et trouvez les intermédiaires qui en ont créé le plus.

Construisez-le avec `investigation` à la place de `sre`.

## Réseau de confiance {#trust-network}

Pour un auditeur. `audit/trust_network.dash` explore qui évalue qui dans le réseau de confiance Bitcoin OTC. [L'analyse de graphe](./analysis) trouve les comptes sur lesquels repose le réseau :

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Construisez-le avec `audit` à la place de `sre`.

## Rayon d'impact du service {#blast-radius}

Pour un SRE : quels services appellent une dépendance défaillante, directement ou par l'intermédiaire d'autres. Depuis une copie du dépôt de l'application :

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

Le script de récupération télécharge des données publiques. `$PWD` maintient les chemins CSV absolus, ce dont le plugin CSV a besoin pour `nodes` et `edges`. Remplacez `sre` par les autres répertoires d'histoire comme décrit dans le README des exemples.

## Exposition AWS sans compte actif {#aws-exposure}

Pour un ingénieur en sécurité cloud : ce que la configuration d'un compte AWS ouvre à Internet, depuis un CIDR Internet en passant par les groupes de sécurité et les équilibreurs de charge jusqu'aux instances et aux rôles qu'elles assument.

Le dépôt de l'application contient des réponses AWS CLI enregistrées. Exécutez depuis sa racine :

```sh
khonsu init graphs/aws
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

Vous pouvez aussi <a href="/docs/samples/exposure.dash" download>télécharger le tableau de bord d'exposition</a>. Il nécessite le graphe AWS importé.

À partir de la 0.3.0, `khonsu plugin analyze aws exposure --db graphs/aws` rapporte des constats avec la règle et les champs derrière chacun, et `khonsu explore` trace le chemin. Voir [investigations](./investigations).
