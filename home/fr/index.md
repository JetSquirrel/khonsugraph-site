# KhonsuGraph — Conçu pour les chasseurs.

Suivez les connexions. Découvrez les preuves.

Un atelier d’investigation par graphe, open source et local-first, pour la sécurité, l’infrastructure et au-delà. Suivez les connexions dans les graphes HawDB avec Cypher et SQL, connectez vos données et construisez des tableaux de bord avec votre agent IA.

## UNE HISTOIRE D’EXPLORATION

L’histoire de l’exploration de l’inconnu est aussi une histoire de pistes suivies.

### LA NATURE SAUVAGE ANCIENNE — Les chasseurs suivaient les traces.

Dans une nature sans cartes, les chasseurs lisaient les empreintes dans la terre, les branches brisées et les traces laissées par les animaux.

Une empreinte seule dit peu. Reliée à la suivante, elle révèle un chemin : par où l’animal est passé et où il pourrait aller.

Reliez les traces. Une direction commence à apparaître.

### ÉGYPTE ANTIQUE — Les voyageurs levaient les yeux vers la lune.

Dans la mythologie égyptienne, Khonsu est le dieu de la lune, du voyage et de la protection. Son nom signifie « voyageur », évoquant le périple de la lune dans le ciel nocturne.

Quand le soleil se couche, le clair de lune montre aux voyageurs un chemin dans l’obscurité.

L’obscurité ne signifie pas qu’il n’y a pas de chemin. Seulement qu’il reste à trouver.

### L’ÈRE DES GRANDES DÉCOUVERTES — Les explorateurs suivaient les étoiles.

En quête d’épices et de routes maritimes vers l’Est, les navigateurs s’aventuraient dans des eaux inconnues.

Ils lisaient la position des étoiles avec les vents, les courants et les carnets de voyage pour s’orienter en pleine mer.

Une étoile isolée n’est qu’un point de lumière. Reliées, les étoiles deviennent une carte pour naviguer.

### AUJOURD’HUI — Nous suivons les traces numériques.

Aujourd’hui, les chasseurs de menaces suivent des traces dans le monde numérique. Son obscurité se cache dans des masses de données.

Les analystes de sécurité reconstituent les attaques à partir des journaux. Les SRE tracent les dépendances entre services pour localiser les causes racines et comprendre leur impact. Les auditeurs suivent les transactions et les relations entre entités pour révéler anomalies et risques.

Des événements, des actifs et des identités apparemment sans lien révèlent leur histoire à travers leurs connexions.

Des traces dans la nature aux cartes du ciel nocturne, puis aux réseaux de relations numériques, nous avons toujours fait la même chose : Relier les indices. Trouver la vérité.

C’est KhonsuGraph. Conçu pour les chasseurs.

- **Chasseurs de menaces**: Tracer les chemins d’attaque et les menaces.
- **SRE**: Tracer les causes racines et les dépendances.
- **Enquêteurs fraude**: Tracer les transactions anormales et les liens cachés.
- **Chercheurs**: Explorer les motifs des réseaux complexes.

KhonsuGraph — Built for Hunters. Conçu pour les chasseurs.

## Connectez vos sources

Importez des nœuds et des relations depuis un CSV, synchronisez vos ressources AWS, copiez une base Neo4j ou Cartography, ou écrivez un plugin pour votre propre système.

[Sources de données](https://khonsugraph.com/docs/fr/data-sources)

## Interrogez en Cypher ou en SQL

Inspectez le schéma, écrivez une requête et affichez le résultat sous forme de tableau ou de graphe à explorer.

[Interroger votre graphe](https://khonsugraph.com/docs/fr/queries)

## Suivez le chemin

Partez de n’importe quel nœud, en limitant la marche par nombre de sauts et par types de relations, et obtenez le chemin le plus court vers une cible.

[Tracer un chemin](https://khonsugraph.com/docs/fr/investigations)

## Trouvez l’essentiel

Classez les nœuds avec PageRank et la betweenness, trouvez les communautés et les composantes, et mesurez les plus courts chemins. Les résultats concordent avec networkx.

[Analyser le graphe](https://khonsugraph.com/docs/fr/analysis)

## Conservez les preuves

Chaque enregistrement indique quelle source l’a écrit et quand. Enregistrez une investigation, rouvrez-la après une mise à jour des données et vérifiez si la conclusion tient toujours.

[Enregistrer une investigation](https://khonsugraph.com/docs/fr/investigations#saved-investigations)

## Partagez la conclusion

Transformez vos requêtes en un fichier .dash en texte brut avec des panneaux de graphe, des graphiques, des tableaux et des filtres partagés.

[Créer un tableau de bord](https://khonsugraph.com/docs/fr/dashboards)

## Qu’est-ce que KhonsuGraph ?

KhonsuGraph est un atelier de bureau gratuit et open source pour les graphes HawDB locaux. Il réunit des requêtes Cypher et SQL au dialecte PostgreSQL, un canevas de graphe, des plugins de sources de données et des tableaux de bord en texte brut.

## Mon graphe quitte-t-il ma machine ?

Le stockage et les requêtes restent sur votre ordinateur. Les plugins de sources peuvent contacter les systèmes que vous configurez, comme AWS. Si vous utilisez un agent IA externe, ses propres paramètres de données et de confidentialité s’appliquent.

## Quelles plateformes sont prises en charge ?

Le projet fournit des paquets de version pour macOS sur Apple silicon et Windows 64 bits. Consultez GitHub Releases pour les paquets disponibles. Les paquets Windows ne sont pas signés ; la dernière mise à niveau du moteur a été validée sur macOS.

## S’agit-il d’un produit officiel HawDB ?

Non. KhonsuGraph est un projet indépendant construit sur HawDB. Il est gratuit et open source sous licence Apache-2.0.

## Puis-je utiliser n’importe quelle requête Cypher ?

KhonsuGraph utilise la syntaxe Cypher prise en charge par HawDB, qui diffère des autres bases de données de graphes. Consultez le guide des requêtes pour les motifs pris en charge et les limites actuelles.

## Quelle différence avec Neo4j Browser ou Bloom ?

KhonsuGraph est une application de bureau dotée de son propre moteur de graphe embarqué, HawDB : aucun serveur de base de données à exploiter. Elle ajoute l’exploration de chemins, des preuves au niveau des enregistrements, des algorithmes de graphe et une ligne de commande JSON pour les agents IA. Son plugin Neo4j peut copier une base Neo4j existante, y compris une base remplie par Cartography, dans un graphe local.

## Fonctionne-t-il avec Claude Code et d’autres agents IA ?

Oui. La ligne de commande khonsu imprime du JSON structuré pour chaque commande ; tout agent capable d’exécuter des commandes shell peut donc l’utiliser, et l’application peut installer une compétence d’agent pour Claude Code. L’agent lit le schéma, exécute des requêtes et rédige des tableaux de bord ; vous vérifiez le résultat dans la fenêtre.

[GitHub](https://github.com/JetSquirrel/KhonsuGraph)
