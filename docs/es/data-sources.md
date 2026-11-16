---
description: Convierte archivos CSV, cuentas de AWS y bases de datos Neo4j o Cartography en un grafo local de nodos y relaciones con plugins de fuentes de datos.
---
# Fuentes de datos

Los plugins convierten un sistema externo en nodos y relaciones. KhonsuGraph ejecuta el plugin como un proceso separado y escribe los registros en el grafo.

## CSV

El plugin CSV integrado asigna filas a nodos y relaciones. Elige columnas de ID, origen y destino estables; el resto de columnas se convierten en propiedades. Los valores numéricos y booleanos se infieren por defecto. Establece `infer_types=false` para conservarlos como texto.

Consulta la importación completa en [primeros pasos](./getting-started). Para etiquetas de nodo o tipos de relación mixtos, usa la configuración JSON `nodes` y `edges`. Las rutas dentro de este JSON deben ser absolutas: el plugin se ejecuta desde su propia carpeta y solo los campos de archivo único se convierten a rutas absolutas por ti.

```sh
khonsu plugin describe csv
khonsu source add --db graphs/demo --plugin csv --name mixed \
  -c 'nodes=[{"path":"'"$PWD"'/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
```

## AWS

El plugin de AWS usa la AWS CLI para leer VPC, subredes, grupos de seguridad, instancias, balanceadores de carga y roles de IAM. Instala y configura primero la AWS CLI y luego usa un perfil de solo lectura que controles. `regions` es una lista separada por comas, como `us-east-1,eu-west-1`.

```sh
khonsu init graphs/aws
khonsu plugin describe aws
khonsu source add --db graphs/aws --plugin aws --name aws-demo \
  -c profile=readonly -c regions=us-east-1 --test
khonsu plugin sync --source aws-demo --dry-run
khonsu plugin sync --source aws-demo
```

Esto accede a la cuenta de AWS configurada. Para un recorrido sin conexión, usa mejor las fixtures guardadas en el repositorio de la aplicación; consulta [ejemplos](./examples).

El <a href="/docs/samples/exposure.dash" download>panel de exposición de AWS</a> traza `Cidr → SecurityGroup ← Instance → Role` usando las relaciones importadas por este plugin.

## Neo4j y Cartography {#neo4j}

El plugin de Neo4j, añadido en 0.3.0, copia los nodos y relaciones de una base de datos Neo4j a un grafo local a través de la API HTTP de Neo4j. Solo envía consultas de lectura. Su uso principal es [Cartography](https://github.com/cartography-cncf/cartography), que lleva AWS, GCP, Azure, Kubernetes, GitHub, Okta y más a Neo4j; cualquier base de datos Neo4j funciona.

```sh
khonsu init graphs/infra
khonsu source add --db graphs/infra --plugin neo4j --name infra \
  -c url=http://127.0.0.1:7474 -c password=... --test
khonsu plugin sync --source infra
```

La dirección es la HTTP de Neo4j, 7474 por defecto, no `bolt://`. La contraseña se guarda en el llavero del sistema y basta con un rol de lector.

HawDB tiene una etiqueta por nodo, así que cada nodo toma una de sus etiquetas de Neo4j, normalmente la más rara, y las conserva todas en `neo4j_labels`. Cuando `MATCH (p:AWSPrincipal)` no devuelve nada, prueba `MATCH (p) WHERE 'AWSPrincipal' IN p.neo4j_labels`. Las consultas escritas para Neo4j pueden necesitar cambios; consulta [limitaciones de consulta](./queries#current-limitations) y el [README del plugin](https://github.com/JetSquirrel/KhonsuGraph/tree/main/plugins/neo4j).

## Semántica de sincronización {#sync-semantics}

- Los ID estables permiten que las importaciones repetidas actualicen los registros existentes.
- Una sincronización completa elimina los registros importados previamente de esta fuente que no aparecen en el nuevo resultado.
- La sincronización incremental solo añade o actualiza registros, cuando el plugin lo admite. `--append` hace lo mismo para cualquier fuente: úsalo cuando los archivos solo contengan lo nuevo desde la última sincronización.
- Un registro sin cambios no se vuelve a escribir, así que `nodes_written` y `edges_written` del informe de sincronización cuentan cambios.
- Una sincronización fallida puede conservar registros ya escritos. La siguiente sincronización correcta los reconcilia.
- Una arista con un extremo desconocido se omite y se cuenta en `skipped_edges`.

Los registros importados incluyen `khonsu_id`, `khonsu_source`, `khonsu_plugin` y `khonsu_synced_at`; la [evidencia](./investigations#evidence) los lee de vuelta. Mientras la aplicación tiene el grafo abierto, `khonsu plugin sync` se ejecuta a través de la ventana, que muestra el progreso y vuelve a ejecutar sus paneles abiertos. Las escrituras de consultas necesitan el grafo cerrado allí.

## Otros sistemas

Instala un plugin solo después de revisar sus permisos. Los permisos son declaraciones, no un entorno aislado del sistema operativo. Los campos de configuración secretos se guardan en el llavero del sistema. Consulta [desarrollo de plugins](./plugins).
