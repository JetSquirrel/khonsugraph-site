---
description: Ejecuta PageRank, intermediación, comunidades de Louvain, componentes conexas, k-core y rutas más cortas en un grafo local con khonsu graph analyze.
---
# Análisis de grafos

Una consulta Cypher responde a lo que preguntas sobre patrones con nombre. `khonsu graph analyze` responde a preguntas sobre la forma del grafo: qué nodo es más central, qué grupos se forman, cómo se conectan dos nodos. Calcula en memoria y sigue las definiciones de networkx, así que los resultados coinciden con networkx en el mismo grafo.

```sh
khonsu graph analyze summary --db graphs/audit
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS --top 10
khonsu graph analyze communities --db graphs/investigation
```

Empieza con `summary` en un grafo que no conozcas.

## Algoritmos

| Comando | Responde | Opciones |
| --- | --- | --- |
| `summary` | Tamaño, densidad, componentes, agrupamiento, núcleo más grande y diámetro | |
| `degree` | Qué nodos tienen más relaciones | `--top N` |
| `pagerank` | A qué nodos apunta el resto del grafo | `--alpha 0.85`, `--weight PROP` |
| `betweenness` | Qué nodos están en más rutas más cortas | `--sample K` |
| `closeness` | Qué nodos están a menos saltos de todo lo demás | `--undirected` |
| `components` | Qué partes del grafo están desconectadas | `--strong` |
| `communities` | Qué grupos están densamente conectados (Louvain) | `--resolution 1.0`, `--seed 42` |
| `clustering` | Con qué frecuencia se conocen los vecinos de un nodo | |
| `kcore` | El núcleo densamente conectado del grafo | |
| `path` | La ruta más corta entre dos nodos | `--from ID --to ID` |

`path` acepta ID de nodo numéricos: devuelve `id(n)` desde una consulta o lee `_id` en un resultado.

## Elige el subgrafo

Por defecto, un algoritmo lee todo el grafo. Redúcelo de tres formas:

```sh
khonsu graph analyze betweenness --db graphs/sre --label Service
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS
khonsu graph analyze pagerank --db graphs/security \
  --cypher "MATCH (a:Process)-[r:SPAWNED]->(b:Process) RETURN a, r, b"
```

- `--label` conserva los nodos con esas etiquetas y las relaciones entre ellos.
- `--type` conserva esas relaciones y, sin `--label`, solo los nodos que unen.
- `--cypher` analiza exactamente los nodos y relaciones que una consulta devuelve completos.

Las relaciones son dirigidas a menos que pases `--undirected`. El agrupamiento, los núcleos y las comunidades siempre las leen en ambos sentidos. `--weight PROP` lee una propiedad numérica de relación como peso para PageRank, o como longitud para rutas, intermediación y cercanía. Un valor ausente cuenta como 1.

## Salida

Cada ejecución imprime un objeto JSON con `algorithm`, el `graph` que leyó (`nodes`, `relationships`, `directed`, `weighted`), `load_ms`, `elapsed_ms` y `rows`.

Las filas de nodo son `{id, labels, name, <score>}`, primero las mejores, limitadas por `--top`. `components` y `communities` devuelven grupos con su `size` y sus diez primeros `members`; communities añade `modularity`. `path` devuelve `found`, `hops`, `length` y los nodos de la ruta.

La intermediación es exacta hasta 5.000 nodos y se muestrea desde 500 fuentes por encima de eso. `sampled_sources` es null cuando el resultado es exacto; dilo cuando informes de un resultado muestreado.

## ¿Análisis o Cypher?

Cypher tiene `shortestPath` y `allShortestPaths` entre dos nodos ligados; consulta [Cypher y SQL](./queries). Usa `khonsu graph analyze path` cuando la ruta deba respetar un peso, y los demás algoritmos cuando la pregunta sea sobre todo el grafo y no sobre un patrón. Para recorrer hacia fuera desde un nodo con límites de saltos y tamaño, usa [`khonsu graph explore`](./investigations#explore).
