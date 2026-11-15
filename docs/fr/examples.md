---
description: Explorez les tableaux de bord du dépôt pour l'exposition AWS, les dépendances de services, la sécurité et les réseaux de confiance.
---
# Exemples

Le [dépôt de l'application](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) inclut des tableaux de bord et des scripts qui préparent des graphes à partir de jeux de données publics. Un fichier `.dash` seul n'inclut pas sa base de données.

## Jeux de données publics

| Tableau de bord | Données source |
| --- | --- |
| Chaîne d'attaque de sécurité | MITRE ATT&CK et OTRF Security-Datasets |
| Rayon d'impact SRE | Manifestes de service Google Online Boutique |
| Réseau de sociétés offshore | ICIJ Offshore Leaks |
| Réseau de confiance de comptes | Évaluations SNAP Bitcoin OTC |
| Location près des transports | Données MTR OpenStreetMap et Inside Airbnb Hong Kong |

Chaque source conserve sa propre licence. Une présence dans le jeu de données ICIJ n'implique pas un acte répréhensible. Voir le README des exemples du dépôt pour la provenance et les licences.

## Construire un graphe de services

Depuis une copie du dépôt de l'application :

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

## AWS sans compte actif

Le dépôt de l'application contient des réponses AWS CLI enregistrées. Exécutez les commandes depuis sa racine :

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
