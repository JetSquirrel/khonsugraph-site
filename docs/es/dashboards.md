---
description: Escribe paneles de grafo como archivos .dash de texto plano y revísalos con un agente.
---
# Paneles

Un archivo `.dash` es texto plano: consultas con nombre, gráficos y filtros. Lee el grafo abierto actualmente en la aplicación. Los datos se importan por separado mediante plugins; no hay bloque `source`.

## Tu primer panel de grafo

Después de completar [primeros pasos](./getting-started), guarda esto como `overview.dash`:

```hcl
query "dependencies" {
  cypher = "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
}

plot "dependencies" {
  type = "graph"
  query = query.dependencies
  caption = name
  width = 12
}
```

```sh
khonsu check overview.dash --db graphs/demo
khonsu open graphs/demo
khonsu open overview.dash
```

`check` ejecuta cada consulta en solo lectura, valida las columnas de los gráficos y prueba los filtros con valores reales. Corrige todos los errores notificados antes de abrir o compartir el panel.

## Gráficos y diseño

Los tipos de gráfico incluyen `table`, `bar`, `line`, `area`, `scatter`, `pie`, `map`, `card`, `text` y `graph`. `width` abarca de 1 a 12 columnas. Las consultas de grafo devuelven nodos y relaciones completos; `caption` selecciona la propiedad del nodo que se muestra como su etiqueta. `group` puede agrupar nodos por una propiedad.

## Filtros compartidos

Una fila de tabla, una barra o un nodo del grafo pueden activar un filtro. En este ejemplo, una consulta de tabla devuelve `service`, y otra consulta usa `WHERE $service`:

```hcl
filter "service" {
  plot = plot.services
  column = service
  match = "s.name"
}
```

El marcador de posición debe ser una condición `WHERE` completa, opcionalmente unida con `AND`. En Cypher, el valor elegido se compara con la expresión `match`; en SQL, se compara con la propia columna, así que `match` no es necesario. Una condición sin elegir se elimina; el gráfico de origen no se filtra a sí mismo. Los [ejemplos del repositorio](./examples) completos incluyen estas consultas y gráficos enlazados.

## Revisa con un agente

Comenta un gráfico en la aplicación. Un agente lee los comentarios, edita el archivo, ejecuta `check` y responde. Los comentarios viven junto al panel en `FILE.comments.json`. La presencia puede identificar los gráficos que el agente está editando, y la ventana se redibuja cuando cambia el archivo.

```sh
khonsu comments overview.dash
khonsu presence overview.dash --doing editing --plot dependencies
khonsu check overview.dash --db graphs/demo
khonsu presence overview.dash --doing idle
```

El formato no tiene funciones arbitrarias, condicionales ni estilos que dependan de los datos. Consulta [CLI y agentes](./cli) para los comandos de revisión.
