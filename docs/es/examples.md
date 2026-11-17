---
description: Ejemplos de investigaciones en grafos sobre conjuntos de datos públicos. Una cadena de ataque a partir de registros de Sysmon, el radio de impacto de un servicio, la red de Offshore Leaks del ICIJ, una red de confianza de Bitcoin y la exposición en AWS.
---
# Ejemplos

El [repositorio de la aplicación](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) incluye paneles y scripts que preparan grafos a partir de conjuntos de datos públicos. Un archivo `.dash` por sí solo no incluye su base de datos.

## Conjuntos de datos públicos

| Panel | Pregunta | Datos de origen | Grafo |
| --- | --- | --- | --- |
| [Cadena de ataque](#attack-chain) | ¿Qué cadena de ataque se esconde en registros de host ruidosos? | MITRE ATT&CK y OTRF Security-Datasets | 1.838 nodos, 20.591 relaciones |
| [Radio de impacto de SRE](#blast-radius) | ¿Qué se lleva por delante un servicio que falla? | Manifiestos de servicio de Google Online Boutique | 12 servicios, 16 rutas de llamada |
| [Red de empresas offshore](#offshore-network) | ¿Quién está detrás de un conjunto de empresas? | ICIJ Offshore Leaks | 5.577 nodos, 6.515 relaciones |
| [Red de confianza entre cuentas](#trust-network) | ¿De qué cuentas advierten otras? | Valoraciones de SNAP Bitcoin OTC | 5.881 cuentas, 35.592 valoraciones |
| Alquiler cerca del transporte | ¿Qué viviendas están cerca de una estación de MTR? | Datos de MTR de OpenStreetMap e Inside Airbnb Hong Kong | 5.730 nodos, 17.119 relaciones |

Cada fuente conserva su propia licencia. Aparecer en el conjunto de datos del ICIJ no implica irregularidades. Consulta el README de ejemplos del repositorio para la procedencia y las licencias.

## Cadena de ataque {#attack-chain}

Para un ingeniero de seguridad o un cazador de amenazas. `security/attack_chain.dash` combina MITRE ATT&CK (grupos, software, técnicas, mitigaciones) con dos grabaciones de Sysmon de OTRF, Empire Mimikatz y Covenant PowerShell remoting. Los eventos de creación de procesos y de acceso a LSASS enlazan con las técnicas que indican. Elige una técnica para ver qué grupos conocidos la usan y cómo mitigarla; elige un proceso para ver qué generó y a qué se conectó.

Constrúyelo con los comandos de abajo, con `security` en lugar de `sre` y `attack_chain.dash` como panel.

## Red offshore {#offshore-network}

Para un investigador. `investigation/offshore_network.dash` cartografía directivos, empresas e intermediarios de la base de datos ICIJ Offshore Leaks (Panama Papers, Hong Kong, 2012–2015). Elige un directivo para ver sus empresas, y encuentra los intermediarios que constituyeron más sociedades.

Constrúyelo con `investigation` en lugar de `sre`.

## Red de confianza {#trust-network}

Para un auditor. `audit/trust_network.dash` explora quién valora a quién en la red de confianza de Bitcoin OTC. El [análisis de grafos](./analysis) encuentra las cuentas en las que se apoya la red:

```sh
khonsu analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Constrúyelo con `audit` en lugar de `sre`.

## Radio de impacto de servicios {#blast-radius}

Para un SRE: qué servicios llaman a una dependencia que falla, directamente o a través de otros. Desde una copia local del repositorio de la aplicación:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

El script de descarga obtiene datos públicos. `$PWD` mantiene absolutas las rutas de los CSV, que el plugin CSV necesita para `nodes` y `edges`. Sustituye `sre` por los demás directorios de historia como se describe en el README de ejemplos.

## Exposición en AWS sin una cuenta activa {#aws-exposure}

Para un ingeniero de seguridad en la nube: qué abre a internet la configuración de una cuenta de AWS, desde un CIDR de internet pasando por grupos de seguridad y balanceadores de carga hasta instancias y los roles que asumen.

Las respuestas guardadas de la AWS CLI del plugin de AWS están en el repositorio [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace). Con una copia junto al repositorio de la aplicación, ejecuta desde la raíz del repositorio de la aplicación:

```sh
khonsu init graphs/aws
khonsu plugin install aws --yes
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/../khonsugraph-marketplace/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

También puedes <a href="/docs/samples/exposure.dash" download>descargar el panel de exposición</a>. Requiere el grafo de AWS importado.

Desde 0.3.0, `khonsu plugin analyze aws exposure --db graphs/aws` informa de hallazgos con la regla y los campos detrás de cada uno, y `khonsu explore` traza la ruta. Consulta [investigaciones](./investigations).
