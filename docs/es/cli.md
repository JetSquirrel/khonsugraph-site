---
description: El comando khonsu imprime JSON en cada comando, para que Claude Code y otros agentes de IA puedan inspeccionar un grafo, consultarlo, trazar rutas y escribir paneles.
---
# CLI y agentes de IA

La aplicación de escritorio y la CLI comparten un solo ejecutable. Sin argumentos, `khonsugraph` abre la aplicación; con un subcomando, ejecuta el comando y sale. El botón **Línea de comandos e IA** de la barra de título (el icono del robot) instala `khonsu` en el PATH y puede instalar la skill para Claude Code.

La [skill de agente](https://github.com/JetSquirrel/KhonsuGraph/tree/main/skills/khonsugraph) enseña a los agentes el flujo de trabajo que empieza por el esquema y el subconjunto de Cypher compatible.

## Referencia de comandos

| Comando | Propósito |
| --- | --- |
| `khonsu graph init DIR` | Crear un grafo vacío |
| `khonsu schema --db DIR` | Inspeccionar etiquetas, relaciones, propiedades y tablas |
| `khonsu query --db DIR --cypher "…"` | Ejecutar una instrucción Cypher de solo lectura |
| `khonsu query --db DIR --sql "…"` | Ejecutar una instrucción SQL de solo lectura |
| `khonsu query --db DIR --file query.cypher` | Ejecutar un archivo de consulta; `.sql` selecciona SQL |
| `khonsu graph explain --db DIR --cypher "…"` | Explicar una consulta |
| `khonsu graph explore --db DIR --from NODE [--to NODE]` | [Recorrer hacia fuera desde un nodo](./investigations#explore) e informar de una ruta |
| `khonsu graph evidence --db DIR --node NODE --rel REL` | Mostrar [qué respalda un registro](./investigations#evidence) |
| `khonsu graph analyze ALGORITHM --db DIR` | Ejecutar un [algoritmo de grafos](./analysis): PageRank, comunidades, componentes y más |
| `khonsu investigate save FILE --db DIR --from NODE` | [Guardar una investigación](./investigations#saved-investigations); `reopen FILE` la ejecuta de nuevo |
| `khonsu graph snapshot save FILE --db DIR` | Conservar los registros del grafo; [`snapshot diff A B`](./investigations#snapshots) compara dos |
| `khonsu graph rebuild --db DIR` | Reconstruir un grafo de formato antiguo a partir de sus fuentes de datos |
| `khonsu plugin list` | Enumerar plugins y permisos |
| `khonsu plugin describe ID` | Mostrar los campos de configuración y los tipos de salida de un plugin |
| `khonsu plugin search [WORDS]` | Listar lo que ofrecen los [marketplaces](./marketplace) |
| `khonsu plugin install ID --yes` | Instalar un plugin por su nombre desde un marketplace y aprobarlo |
| `khonsu plugin install DIR --yes` | Instalar un directorio o ZIP de plugin y aprobar sus permisos |
| `khonsu plugin update` | Actualizar los plugins instalados desde un marketplace; `--dry-run` previsualiza |
| `khonsu plugin marketplace list` | Listar los marketplaces; `add` y `remove` los modifican |
| `khonsu plugin sync --source ID` | Sincronizar una fuente; `--dry-run` previsualiza, `--incremental` y `--append` añaden sin eliminar |
| `khonsu plugin analyze ID ANALYSIS --db DIR` | Ejecutar el [análisis de un plugin](./investigations#plugin-analyses), como `exposure` de AWS |
| `khonsu source list` | Enumerar las fuentes configuradas |
| `khonsu source add --db DIR --plugin ID --name NAME -c key=value` | Configurar una fuente; `--test` la comprueba primero |
| `khonsu source remove ID` | Eliminar una fuente |
| `khonsu dash check FILE --db DIR` | Validar un panel contra un grafo |
| `khonsu dash comments FILE` | Enumerar, responder y resolver comentarios de gráficos |
| `khonsu dash presence FILE --doing editing --plot NAME` | Mostrar a la ventana qué gráficos estás editando |
| `khonsu open DIR` | Abrir un grafo en la aplicación de escritorio |
| `khonsu open FILE.dash` | Abrir un panel |
| `khonsu open --state` | Leer el grafo y las pestañas de la ventana en ejecución |

`--db` toma por defecto `KHONSU_DB` y, después, el último grafo abierto en la aplicación. Usa una ruta explícita en la automatización. Las escrituras de consultas requieren `--write`.

## Salida y errores

Cada comando imprime un objeto JSON en stdout; `--pretty` lo indenta. El progreso de la sincronización va a stderr como líneas JSON. Los resultados de consulta contienen `columns`, `rows`, `row_count`, `truncated` y `elapsed_ms`, además de `graph` cuando se devuelven nodos o relaciones.

`--max-rows` toma 200 por defecto y trunca el resultado mostrado. No reduce el trabajo de ejecución de la consulta. Inspecciona siempre `truncated` y usa consultas acotadas.

Los fallos tienen un objeto `error` con `kind` y `message`, y un `detail` opcional. Comprueba el estado de salida antes de interpretar stdout: 1 indica un error de ejecución; 2 indica un error de uso o de especificación del panel.

## Un ciclo de revisión

```sh
khonsu dash comments overview.dash
khonsu dash presence overview.dash --doing editing --plot dependencies
# Edita el archivo .dash y luego valídalo.
khonsu dash check overview.dash --db graphs/demo
# Usa un ID de comentario real devuelto por el primer comando.
khonsu dash comments overview.dash --reply c1 --text "Updated the graph panel" --resolve
khonsu dash presence overview.dash --doing idle
```

Mientras la aplicación tiene un grafo, las consultas de lectura, `dash check` y `plugin sync` se ejecutan a través de la ventana y devuelven `via_window: true`. Las escrituras de consultas, `graph explore` e `investigate` necesitan el grafo libre. No elimines bloqueos para forzar una escritura. Consulta [solución de problemas](./troubleshooting).
