---
description: Resuelve comandos de CLI que faltan, bloqueos de grafos, paneles vacíos y errores de validación de consultas.
---
# Solución de problemas

## No se encuentra khonsu

Usa **Línea de comandos e IA** (el icono del robot) en la barra de título de la aplicación y vuelve a abrir tu terminal. En macOS puedes invocar directamente el binario de la aplicación:

```sh
/Applications/KhonsuGraph.app/Contents/MacOS/khonsugraph --version
```

En Windows, mantén `khonsu.exe` junto con el resto del paquete extraído y añade ese directorio al PATH, o invócalo por su ruta completa.

## El grafo está bloqueado

Un proceso posee un directorio de grafo de HawDB. Las lecturas y las comprobaciones de paneles se enrutan a través de la ventana en ejecución, pero las escrituras y las sincronizaciones de fuentes requieren que el grafo esté libre. Cierra el grafo en el otro proceso. Nunca elimines `khonsugraph.lock`, `owner.hawdb.lock` ni los archivos de base de datos para saltarte un bloqueo.

## El grafo informa old_format {#old-format}

HawDB 0.25 cambió su formato de almacenamiento y no lee ningún grafo anterior, así que un grafo escrito por KhonsuGraph 0.2.0 o anterior no se abre y falla con el tipo `old_format`. `khonsu rebuild --db DIR` lo vuelve a crear a partir de sus fuentes de datos y conserva el directorio antiguo junto a él como `DIR.hawdb-old`. Todo lo escrito a mano en lugar de sincronizado no se traslada.

## Un panel de grafo está vacío

Devuelve nodos y relaciones completos (`RETURN a, r, b`) en lugar de solo nombres. Comprueba que abriste el grafo para el que se escribió el panel. Usa `khonsu schema --db DIR` y ejecuta la consulta directamente para verificar las etiquetas y el resultado.

## Una consulta o un panel falla

Ejecuta `khonsu check FILE --db DIR` y lee todos los errores notificados. Un gráfico puede referirse a una columna que falta; un conjunto de datos importado puede usar etiquetas diferentes. Algunas funciones de Cypher no son compatibles: consulta [limitaciones de consulta](./queries#current-limitations).

Si una lectura supera su presupuesto, redúcela con predicados y `LIMIT`. Bajar solo `--max-rows` no reduce el coste de ejecución.

## Una fuente no se puede sincronizar

Ejecuta `khonsu plugin describe ID` y comprueba los campos de configuración. Asegúrate de que los plugins empaquetados permanecen junto al ejecutable. Las rutas de los CSV de archivo único se guardan como rutas absolutas al añadir la fuente. Las rutas dentro del JSON de `nodes` y `edges` se guardan tal como se dan y deben ser absolutas. AWS requiere la AWS CLI y un perfil configurado y accesible, salvo que uses fixtures. Escribe `regions` como texto separado por comas, no como un array JSON. Si no se encuentra el plugin de AWS o de Neo4j tras actualizar a una versión posterior a 0.3.0, instálalo desde el [marketplace](./marketplace#install).

Una sincronización fallida puede dejar registros ya escritos. Corrige la causa y vuelve a sincronizar para reconciliarlos. Inspecciona `skipped_edges` para ver los extremos sin resolver.

## Informa de un problema

Incluye la versión de la aplicación, el sistema operativo, el comando y el tipo de error en un [issue de GitHub](https://github.com/JetSquirrel/KhonsuGraph/issues). Elimina las credenciales y los valores privados del grafo de las reproducciones.
