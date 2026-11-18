---
description: Traza rutas por un grafo con khonsu graph explore, cita la evidencia detrás de cada registro, guarda una investigación y vuelve a comprobarla cuando cambien los datos.
---
# Investigaciones

Una investigación sigue relaciones desde un punto de partida hasta una respuesta: qué ruta lleva de internet a esta instancia, qué se lleva por delante un servicio que falla, quién está detrás de una empresa. KhonsuGraph mantiene cuatro cosas separadas para poder comprobar la respuesta más adelante: la ruta, la evidencia de cada registro en ella, la investigación guardada y lo que ha cambiado en el grafo desde entonces.

Estos comandos llegaron en KhonsuGraph 0.3.0. Ejecuta `khonsu --version` para ver qué tienes.

## Sigue una ruta {#explore}

`khonsu graph explore` recorre hacia fuera desde uno o varios nodos sin cargar el grafo entero. En la ventana, el mismo recorrido es **Path Explorer** sobre un lienzo de grafo.

```sh
khonsu graph explore --db graphs/aws \
  --from shop/cidr:internet \
  --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO
```

`--from` y `--to` aceptan un `khonsu_id` (el ID estable que lleva cada registro sincronizado) o un ID de nodo numérico. Los ID anteriores son ilustrativos, de un grafo de AWS como el de [los ejemplos](./examples#aws-exposure); lee los tuyos con una consulta como `MATCH (c:Cidr) RETURN c.khonsu_id LIMIT 5`.

| Opción | Significado | Valor predeterminado |
| --- | --- | --- |
| `--from NODE` | Un nodo de partida. Repítelo para varios | Obligatorio |
| `--to NODE` | Informa de una ruta con el menor número de saltos hasta este nodo entre lo que encontró el recorrido | Ninguno |
| `--direction out\|in\|both` | A favor de las flechas, en contra de ellas o en ambos sentidos | `out` |
| `--type A,B` | Sigue solo estos tipos de relación | Todos los tipos |
| `--max-hops N` | Pasos desde un inicio, como máximo 16 | 3 |
| `--max-nodes N` | Nodos devueltos, como máximo 2.000 | 200 |
| `--max-edges N` | Relaciones devueltas, como máximo 5.000 | 500 |

Cada salto de la salida tiene un `text` como `Internet -[ROUTES_TO]-> shop`. Lee primero `complete`. Cuando es false, `limits` nombra el límite que cortó el recorrido, así que una ruta ausente significa «no dentro de estos límites», no «no hay ruta». Un valor por encima de un techo se rechaza en lugar de rebajarse.

Una ruta es un candidato encontrado en los datos. No es prueba de que se pueda alcanzar algo, y la ausencia de una ruta no es prueba de seguridad.

## Evidencia {#evidence}

`khonsu graph evidence` dice qué respalda un nodo o una relación: qué fuente y plugin lo escribieron, cuándo cambió por última vez y si la última sincronización de esa fuente fue completa.

```sh
khonsu graph evidence --db graphs/aws --node shop/123456789012:us-east-1:i-web1
```

| Campo | Significado |
| --- | --- |
| `evidence_id` | `node:<khonsu_id>` o `rel:<khonsu_id>`. Cítalo cuando informes de un hallazgo |
| `source`, `plugin` | Qué escribió el registro |
| `record_written_at` | Cuándo cambió el registro por última vez, no cuándo se vio por última vez |
| `source_last_successful_sync` | Desconocido cuando la última sincronización de la fuente falló |
| `source_coverage` | La última ejecución de la fuente: `complete`, `partial`, `failed` o `cancelled`, y cualquier laguna |
| `assertion` | `explicit` (una fuente lo informó), `derived` o `unknown` |
| `properties`, `redacted` | Las propiedades del propio registro, y los nombres enmascarados por ser posibles secretos |

Un campo de procedencia o se conoce con un valor o es explícitamente desconocido; nada se estima. Con `--to`, `khonsu graph explore` añade `path.evidence`, un registro derivado que enumera los ID de evidencia en los que se apoya la ruta.

La fuerza con la que se conoce una relación es una convención en sus propias propiedades. `confidence` es `confirmed`, `inferred` o `unconfirmed`, y `evidence` dice qué la mostró. Una ruta es tan fuerte como su salto más débil: una relación `unconfirmed` hace que la ruta no esté confirmada.

## Análisis de plugins {#plugin-analyses}

Un plugin puede incluir reglas para su propio dominio. `khonsu plugin describe ID` las enumera, y `khonsu plugin analyze` ejecuta una:

```sh
khonsu plugin analyze aws exposure --db graphs/aws --verdict potential-exposure --pretty
```

El análisis `exposure` de AWS devuelve hallazgos con un veredicto `potential_exposure`, `insufficient_data` o `not_indicated`. Cada hallazgo nombra su regla, las condiciones que comprobó con los campos que las respaldan, lo que no pudo evaluar (`unknowns`), lo que la regla no lee (`assumptions`) y un `walk` que puedes pasar a `khonsu graph explore`. Un hallazgo describe configuración. No dice que un recurso sea alcanzable, ni seguro.

## Investigaciones guardadas {#saved-investigations}

Una investigación guardada conserva los puntos de partida y los filtros de un recorrido, la ruta que elegiste, una consulta y un panel en un archivo propio. Guardar no escribe nada en el grafo.

```sh
khonsu investigate save web.investigation --db graphs/aws \
  --from shop/cidr:internet --to shop/123456789012:us-east-1:i-web1 \
  --type ROUTES_TO,FORWARDS_TO --max-hops 4
khonsu investigate reopen web.investigation
```

Volver a abrirla ejecuta el recorrido de nuevo sobre el grafo tal como está ahora y dice en qué difiere de cuando se guardó. Lee primero `graph_state`:

| `graph_state` | Significado |
| --- | --- |
| `unchanged` | El grafo contiene lo mismo que cuando se guardó |
| `changed` | Algo difiere. `differences` indica lo que puede, y no es una lista completa |
| `not_compared` | El grafo tiene más de 200.000 nodos o relaciones, así que no se calculó su hash, y los recuentos coinciden |

Una respuesta cambiada nunca reemplaza la guardada en silencio. `path_same` dice si la ruta aún se apoya en los mismos registros. `missing_seeds` y `target_missing` nombran registros guardados que han desaparecido. `unsure` enumera registros encontrados solo por un ID interno en un grafo cambiado. `incomplete_sources` nombra fuentes cuya última sincronización no fue completa.

Una resincronización que no cambia nada deja el grafo `unchanged`: la comparación cubre etiquetas, tipos, extremos y propiedades, y deja fuera los ID internos y las horas de sincronización.

El archivo es JSON. Contiene la ruta del grafo, los ID de las fuentes de datos, los ID estables de los registros y los filtros. Nunca contiene la configuración de las fuentes ni credenciales. La ruta del grafo puede incluir un nombre de usuario, así que revísala antes de compartir un archivo.

## Instantáneas y diferencias {#snapshots}

Una instantánea guarda los registros de un grafo en un archivo, por ID estable, para que puedas preguntar más adelante qué cambió. Las instantáneas se toman a mano; nada toma una cuando se ejecuta una sincronización.

```sh
khonsu graph snapshot save monday.snapshot.json --db graphs/aws
khonsu plugin sync --source shop
khonsu graph snapshot save tuesday.snapshot.json --db graphs/aws
khonsu graph snapshot diff monday.snapshot.json tuesday.snapshot.json --pretty
khonsu graph snapshot check monday.snapshot.json --db graphs/aws
```

| Lista | Significado |
| --- | --- |
| `added` | Solo en la instantánea posterior |
| `removed` | Ha desaparecido, y la última sincronización de la fuente fue completa en la instantánea posterior |
| `not_seen` | Ausente de la instantánea posterior, sin nada que muestre que la fuente se leyó por completo. Puede que aún exista |
| `changed` | El mismo ID estable con propiedades, etiquetas o extremos diferentes |

Un registro es `removed` solo cuando la instantánea posterior puede respaldarlo. Tras una sincronización parcial o fallida permanece en `not_seen`, y `warnings` dice por qué.

Una instantánea no contiene la ruta del grafo, la configuración de las fuentes ni credenciales, y todo lo que parece un secreto se enmascara. Sí contiene las demás propiedades de tus datos, así que trata el archivo como tratarías el grafo.

## En la ventana

Selecciona un nodo en un lienzo de grafo y usa **Path Explorer** para recorrer desde él. **Save investigation…** conserva los filtros actuales, los puntos de partida del último recorrido, la ruta hasta el nodo seleccionado y la consulta de la pestaña. **Graph > Open investigation…**, o `khonsu open web.investigation`, vuelve a abrir una en una pestaña nueva. Todo lo que difiera de cuando se guardó aparece como una advertencia en el lienzo.

## Límites

- `khonsu graph explore` y `khonsu investigate` necesitan el grafo libre. Fallan con el tipo `locked` mientras la ventana lo tiene abierto; usa Path Explorer en la ventana en su lugar.
- Un grafo de más de 200.000 nodos o relaciones no admite instantáneas y falla con el tipo `too_large`.
- Los registros escritos a mano no tienen ID estable. Se cuentan, pero no se comparan en una diferencia.
- La ventana aún no tiene vista de instantáneas ni de diferencias.

La [referencia de la CLI](./cli) enumera todos los comandos. Para centralidad, comunidades y rutas más cortas sobre todo el grafo, consulta [análisis de grafos](./analysis).
