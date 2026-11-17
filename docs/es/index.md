---
description: Documentación de KhonsuGraph, el banco de trabajo de escritorio de código abierto para la investigación en grafos. Consulta en Cypher y SQL, traza rutas, cita evidencia y crea paneles.
---
# Documentación de KhonsuGraph

KhonsuGraph es un banco de trabajo de escritorio de código abierto y local-first para la investigación en grafos, construido sobre HawDB. Incorpora datos mediante plugins, consulta relaciones en Cypher o tablas en SQL con dialecto PostgreSQL, sigue rutas en un lienzo de grafo, conserva la evidencia detrás de cada registro y convierte el resultado en un panel.

Es un proyecto independiente construido sobre HawDB, publicado bajo Apache-2.0.

## Empieza aquí

- [Instala y ejecuta tu primera consulta](./getting-started)
- [Importa CSV, conecta AWS o copia una base de datos Neo4j](./data-sources)
- [Instala plugins por su nombre desde un marketplace](./marketplace)
- [Entiende la compatibilidad de Cypher y los límites de las consultas](./queries)
- [Traza una ruta, cita evidencia y guarda una investigación](./investigations)
- [Clasifica nodos y encuentra comunidades con el análisis de grafos](./analysis)
- [Crea un panel .dash](./dashboards)
- [Trabaja con un agente de IA a través de la CLI](./cli)
- [Explora los paneles de ejemplo](./examples)

## Lo que permanece local

El almacenamiento del grafo y la ejecución de consultas se ejecutan en tu ordenador. Los plugins de origen contactan con los sistemas que configures. Un agente de IA externo tiene sus propios ajustes de tratamiento de datos; revísalos cuando compartas resultados de consultas con él.

Estas guías describen KhonsuGraph **0.3.0**, que fija HawDB en **0.29.0**. La exploración de rutas, la evidencia, las investigaciones guardadas, las instantáneas y el plugin de Neo4j llegaron en 0.3.0; una versión anterior no los tiene. Ejecuta `khonsu --version` para ver qué tienes, y consulta el [repositorio de código fuente](https://github.com/JetSquirrel/KhonsuGraph).
