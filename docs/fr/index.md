---
description: Documentation de KhonsuGraph, l'atelier de bureau open source et local-first pour l'investigation de graphes. Interrogez en Cypher et en SQL, suivez des chemins, citez des preuves et construisez des tableaux de bord.
---
# Documentation de KhonsuGraph

KhonsuGraph est un atelier de bureau open source et local-first pour l'investigation de graphes, construit sur HawDB. Importez des données via des plugins, interrogez les relations en Cypher ou les tables en SQL de dialecte PostgreSQL, suivez des chemins sur un canevas de graphe, conservez la preuve derrière chaque enregistrement et transformez le résultat en tableau de bord.

C'est un projet indépendant construit sur HawDB, publié sous Apache-2.0.

## Commencez ici

- [Installez et exécutez votre première requête](./getting-started)
- [Importez un CSV, connectez AWS ou copiez une base Neo4j](./data-sources)
- [Comprenez la prise en charge de Cypher et les limites de requête](./queries)
- [Suivez un chemin, citez des preuves et enregistrez une investigation](./investigations)
- [Classez les nœuds et trouvez des communautés avec l'analyse de graphe](./analysis)
- [Construisez un tableau de bord .dash](./dashboards)
- [Travaillez avec un agent IA via la CLI](./cli)
- [Explorez les tableaux de bord d'exemple](./examples)

## Ce qui reste local

Le stockage du graphe et l'exécution des requêtes s'effectuent sur votre ordinateur. Les plugins de source contactent les systèmes que vous configurez. Un agent IA externe dispose de ses propres paramètres de traitement des données ; examinez-les lorsque vous partagez des résultats de requête avec lui.

Ces guides décrivent KhonsuGraph **0.3.0**, qui épingle HawDB à **0.29.0**. L'exploration de chemins, les preuves, les investigations enregistrées, les instantanés et le plugin Neo4j sont apparus dans la 0.3.0 ; une version antérieure ne les possède pas. Exécutez `khonsu --version` pour voir ce que vous avez, et consultez le [dépôt source](https://github.com/JetSquirrel/KhonsuGraph).
