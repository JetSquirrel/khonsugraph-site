---
description: Consulta un grafo local en Cypher y tablas en SQL de PostgreSQL. Cláusulas de Cypher compatibles, rutas más cortas, parámetros y límites actuales de HawDB.
---
# Cypher y SQL

## Inspecciona antes de consultar

```sh
khonsu schema --db graphs/demo
```

El resultado enumera etiquetas, tipos de relación, nombres de propiedades, recuentos, patrones de relación y tablas SQL. Usa estos nombres en lugar de suponer el esquema de otro grafo.

## Devuelve conexiones

```cypher
MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host)
RETURN a, r, b
LIMIT 20
```

Devolver nodos y relaciones completos proporciona tanto valores de tabla como elementos de grafo. Devolver solo `a.name` da una columna escalar, no un grafo conectado. En la CLI, los elementos de grafo aparecen en un objeto `graph` aparte.

Cypher admite `MATCH`, `OPTIONAL MATCH`, `WHERE`, `RETURN [DISTINCT]`, `ORDER BY`, `SKIP`, `LIMIT`, `WITH`, `UNWIND`, `CASE` y patrones de longitud variable acotados. Con `--write`, también están disponibles `CREATE`, `MERGE`, `SET`, `DELETE` y `DETACH DELETE`. Por ejemplo, con un grafo de servicios:

```cypher
MATCH (a:Service)-[:CALLS*1..4]->(b:Service)
RETURN a, b
LIMIT 50
```

Esto devuelve los extremos. Consulta las relaciones de un salto por separado para dibujar las conexiones intermedias.

## Rutas más cortas

```cypher
MATCH p = shortestPath((a:Host {name: 'web'})-[:CALLS*..6]->(b:Host {name: 'db'}))
RETURN p, length(p) AS hops
```

`allShortestPaths`, `nodes(p)` y `relationships(p)` también funcionan. Ambos extremos deben estar ligados por un mapa de propiedades, un `WHERE` o una cláusula anterior. Devolver `p` dibuja la ruta en el lienzo. Un `*` sin límite se detiene a los 256 saltos y falla en lugar de informar de que no existe ninguna ruta.

Para recorrer hacia fuera desde un nodo con límites de saltos y tamaño, usa [`khonsu explore`](./investigations#explore). Para rutas ponderadas, centralidad y comunidades, consulta [análisis de grafos](./analysis).

## SQL y parámetros

Las consultas SQL operan sobre tablas en el mismo directorio de HawDB, usando SQL con dialecto PostgreSQL. Una importación de grafo no implica una tabla SQL con el mismo nombre. Inspecciona `schema` primero. El siguiente ejemplo requiere una tabla `assets`:

```sh
khonsu query --db graphs/demo --sql "SELECT * FROM assets LIMIT 20"
khonsu query --db graphs/demo --cypher \
  'MATCH (h:Host) WHERE h.name = $name RETURN h' -p name=web-01
```

Los valores de `-p` se analizan como JSON cuando es posible y, si no, como cadenas. SQL usa parámetros posicionales (`$1` con `-p 1=value`).

## Limitaciones actuales {#current-limitations}

KhonsuGraph 0.3.0 usa HawDB 0.29.0, cuyo Cypher difiere del de otras bases de datos de grafos:

- `labels()`, `keys()`, `properties()`, `CALL db.*` y `SHOW` no son compatibles. Usa `khonsu schema` para los metadatos.
- `count`, `sum`, `collect`, `min`, `max` y `avg` son las agregaciones compatibles, también sobre expresiones.
- Una lectura empieza con `MATCH` o `UNWIND`. Un `RETURN 1` suelto no se analiza, y `OPTIONAL MATCH` no puede ser la primera cláusula.
- Los patrones de longitud variable requieren un tipo de relación y ninguna variable de relación. Un patrón de relación sin tipo funciona solo para un salto.
- Las variables de ruta funcionan solo con `shortestPath` y `allShortestPaths`.
- Las cadenas no se pueden concatenar con `+`, y `toLower`, `toUpper`, `reduce`, `any`, `all`, `none` y `exists` no están disponibles.
- `CREATE` acepta un patrón por instrucción. `LOAD CSV` está desactivado; incorpora los archivos con una [fuente de datos](./data-sources).
- Se admiten `IN` escalar, las comprensiones de listas, `json_value()` sobre texto JSON, las fechas y duraciones, y `SET` de propiedades de relación.
- Las lecturas tienen un techo de ejecución de 100.000 filas. `--max-rows` solo limita las filas mostradas después de la ejecución, así que usa también `LIMIT` en la consulta.
- Los valores vectoriales se devuelven como arrays de números JSON. Las columnas vuelven en el orden de `RETURN`; aun así, léelas por nombre.
- `WHERE true` funciona en Cypher pero no en SQL.

Un grafo escrito antes de HawDB 0.25, por KhonsuGraph 0.2.0 o anterior, no se puede leer con esta versión; consulta [solución de problemas](./troubleshooting#old-format).

## Acceso de lectura y escritura

Las consultas de la CLI son de solo lectura por defecto. `--write` habilita explícitamente las escrituras. Un proceso posee un directorio de grafo a la vez. Mientras la aplicación tiene el grafo abierto, las consultas de lectura de la CLI y las comprobaciones de paneles se enrutan a través de esa ventana. Las escrituras y las sincronizaciones requieren que el grafo esté cerrado allí.
