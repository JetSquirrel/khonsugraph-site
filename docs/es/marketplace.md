---
description: Busca, instala y actualiza plugins de KhonsuGraph por su nombre desde un marketplace, comprueba lo que descargas y publica tus propios plugins.
---
# Marketplace

Un marketplace lista plugins por su nombre. Para cada plugin indica la versión, los permisos declarados y un paquete por plataforma con su SHA-256. KhonsuGraph puede leer un marketplace desde una carpeta local, un repositorio de GitHub o una dirección HTTPS.

::: info En la próxima versión
El marketplace llega en la versión posterior a 0.3.0. A partir de esa versión, CSV es el único plugin incluido con la aplicación. AWS y Neo4j se instalan desde el marketplace oficial, igual que SQL y DuckLocal. En 0.3.0, AWS y Neo4j todavía se incluyen con la aplicación.
:::

## Instalar un plugin {#install}

```sh
khonsu plugin search              # lo que ofrecen los marketplaces
khonsu plugin install aws --yes   # descargar, comprobar, instalar y aprobar
khonsu plugin update              # actualizar los plugins instalados
```

En la aplicación, **Add Data Source… → More Plugins…** muestra la misma lista. Un plugin que instales o actualices ahí pasa al diálogo de aprobación y después a su formulario de fuente.

Cuando dos marketplaces listan el mismo ID, indica cuál quieres: `khonsu plugin install sql@official`. `khonsu plugin update --dry-run` solo informa de lo que cambiaría.

## Plugins oficiales {#official}

| Plugin | Qué lee |
| --- | --- |
| `sql` | Tablas de PostgreSQL, MySQL y SQLite, asignadas a mano o a partir de claves primarias y foráneas |
| `ducklocal` | Tablas Parquet, CSV, JSON y DuckDB, leídas a través de DuckLocal |
| `aws` | VPC, subredes, grupos de seguridad, instancias, balanceadores de carga y roles de IAM, mediante la AWS CLI de solo lectura. Ofrece el análisis de exposición y la plantilla `aws.exposure` |
| `neo4j` | Una base de datos Neo4j, como una que llena Cartography, copiada mediante su API HTTP |

Toda instalación empieza con el marketplace `official`. Se sirve desde `marketplace.khonsugraph.com` y se construye a partir del repositorio [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace), que contiene el código fuente y el README de cada plugin. El plugin CSV sigue integrado.

## Qué se comprueba {#checks}

- El paquete debe coincidir con el SHA-256 que lista el marketplace y contener el plugin y la versión listados. Si no, no se instala nada y lo que estaba instalado se mantiene.
- Los índices y paquetes se leen solo por HTTPS.
- Instalar no es aprobar. Un plugin de un marketplace necesita aprobación antes de ejecutarse, y otra vez tras actualizarse. `--yes` aprueba en el mismo paso. Si lo ejecuta un agente de IA, no aprueba nada y termina con 4; consulta [aprobación](./cli#approval).

Un marketplace dice dónde está un paquete y cuál es su hash. No hace que el plugin sea seguro. Revisa los permisos declarados antes de aprobar: son declaraciones, no un sandbox. Consulta [desarrollo de plugins](./plugins).

## Añadir un marketplace {#add}

```sh
khonsu plugin marketplace add acme/khonsu-plugins   # owner/repo en GitHub
khonsu plugin marketplace add https://plugins.example.com  # cualquier dirección HTTPS
khonsu plugin marketplace add ~/work/team-plugins   # una carpeta
khonsu plugin marketplace list
khonsu plugin marketplace remove team-plugins
```

`khonsu plugin marketplace remove official` desactiva el marketplace oficial y `khonsu plugin marketplace restore` lo restablece.

## Publicar un plugin {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

Esto empaqueta el plugin en la carpeta y lo añade al `marketplace.json` de esa carpeta. Haz commit y push de la carpeta, o súbela a un alojamiento estático. Los demás la añaden una vez con `khonsu plugin marketplace add` y después instalan por nombre. Publicar de nuevo la misma versión reemplaza el paquete de esa plataforma, así que cada plataforma puede publicar su propia compilación. Consulta la [referencia completa del marketplace](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md).
