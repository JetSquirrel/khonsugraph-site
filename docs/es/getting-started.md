---
description: Instala KhonsuGraph, crea un grafo e importa un pequeño ejemplo en CSV.
---
# Primeros pasos

## Instalación

Encuentra los paquetes disponibles en [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). El flujo de publicación genera un DMG para macOS en Apple silicon y un ZIP de 64 bits para Windows. Los paquetes de Windows no están firmados; la última actualización del motor se validó en macOS, no en Windows.

En macOS, abre el DMG y copia la aplicación a Applications. En Windows, extrae todo el ZIP y conserva la carpeta `plugins` junto al ejecutable.

El botón **Línea de comandos e IA** (el icono del robot) de la barra de título de la aplicación instala el comando `khonsu` en el PATH y puede añadir la skill de agente a Claude Code. El ejecutable de la aplicación también acepta subcomandos de la CLI directamente.

```sh
khonsu --version
```

## Crea un grafo pequeño

Descarga [hosts.csv](/samples/hosts.csv) y [dependencies.csv](/samples/dependencies.csv) en la misma carpeta de trabajo. Describen tres hosts y dos dependencias.

Ejecuta estos comandos en esa carpeta. Mantén el grafo cerrado en la aplicación de escritorio durante la importación.

```sh
khonsu init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

La primera sincronización previsualiza recuentos y muestras sin escribir nada; la segunda importa el grafo. `source add` guarda las rutas de los CSV como rutas absolutas, así que las sincronizaciones posteriores funcionan desde cualquier carpeta.

## Consulta y explora

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

En el editor de consultas de escritorio, ejecuta la misma consulta Cypher. Devolver nodos y relaciones completos proporciona al lienzo del grafo la información que necesita para mostrar las conexiones.

Continúa con [consultas](./queries) o [tu primer panel](./dashboards).

## Compila desde el código fuente

Desde una copia local del repositorio de la aplicación:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

La aplicación usa Rust, GPUI y HawDB. Consulta el README del repositorio para el empaquetado de versiones y la configuración específica de cada plataforma.
