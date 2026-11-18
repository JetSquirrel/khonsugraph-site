---
description: Indica qué significan las etiquetas de un grafo con archivos de ontología y de mapeo, comprueba si un grafo puede responder una pregunta, averigua cómo se conectan los conceptos y consulta con las palabras de la ontología.
---
# Ontología

Las etiquetas de un grafo dicen de dónde vienen los registros: `Host`, `EntraUser`, `WazuhAgent`. La ontología dice qué son: un `Device`, una `Account`. Con ella, una pregunta se hace con las mismas palabras sean cuales sean las fuentes que construyeron el grafo, y, antes de escribir una consulta, tú o un agente de IA podéis averiguar si un grafo puede responderla.

::: info En la próxima versión
Los comandos de ontología, `--semantic` y `--validate-only` llegan en la versión posterior a 0.3.0.
:::

La ontología vive en archivos, nunca en el grafo. Un grafo contiene lo que escribieron sus fuentes de datos, y [`khonsu graph rebuild`](./troubleshooting#old-format) lo vuelve a construir a partir de ellas, así que lo que estuviera solo en el grafo se perdería.

## Conceptos y mapeos {#files}

**Un archivo de ontología** (`*.ontology.json`) declara conceptos y las relaciones permitidas entre ellos:

```json
{
  "format": "khonsu-ontology",
  "version": 1,
  "id": "attack",
  "revision": "0.1.0",
  "concepts": [
    { "name": "Technique", "description": "An ATT&CK technique.", "synonyms": ["ttp"] }
  ],
  "relationships": [
    { "name": "indicates", "from": "Entity", "to": "Technique" }
  ]
}
```

Un concepto puede extender (`extends`) otros, y una relación vale para todo lo que extienda sus extremos: `holds` de `Agent` a `Account` también une una `Person` con una `Account`.

**Un archivo de mapeo** (`*.mapping.json`) dice qué son las etiquetas y los tipos de relación de un grafo:

```json
{
  "format": "khonsu-mapping",
  "version": 1,
  "id": "security-example",
  "revision": "1",
  "status": "draft",
  "labels": [{ "label": "Host", "concept": "Device" }],
  "relationship_types": [{ "type": "RAN_ON", "relationship": "runs_on" }]
}
```

Todo es `draft` hasta que una persona lo revisa y pone `"status": "certified"`. Las respuestas enumeran en `drafts` los borradores en los que se basan.

## De dónde sale la biblioteca {#library}

En este orden, y gana la primera copia de cada ID:

1. **Incorporada**: unos veinte conceptos que comparte cualquier investigación, como `Person`, `Organization`, `Account`, `Device`, `Process`, `IPAddress`, `Domain`, `Event` y `Observation`, y las relaciones entre ellos.
2. `ontology/` en la carpeta de configuración de KhonsuGraph.
3. `ontology/` en la carpeta de cada plugin instalado, para que un plugin incluya el significado de las etiquetas que escribe.
4. Cada `--ontology PATH` que pases, un archivo o una carpeta.

Un archivo que no se puede usar se informa en `problems` y se omite; el resto se carga igualmente. El ejemplo de seguridad del repositorio incluye un [paquete ATT&CK y un mapeo](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/security/ontology).

## Pregunta antes de consultar {#commands}

```sh
khonsu graph ontology describe --db graphs/sec            # qué está mapeado y qué no
khonsu graph ontology resolve machine login ip            # qué significan las palabras
khonsu graph ontology check --db graphs/sec --entities account,device,ip
khonsu graph ontology path --from Account --to Device --db graphs/sec
```

- **describe** enumera los conceptos y las relaciones, o uno completo con `--concept`. Con `--db` compara la biblioteca con el grafo: etiquetas mapeadas (con recuentos), etiquetas y tipos de relación sin mapear, y etiquetas mapeadas pero ausentes.
- **resolve** dice qué significa cada palabra: un concepto o una relación por nombre o sinónimo, o una etiqueta a la que un mapeo da significado. Una palabra que no significa nada recibe `suggestions`.
- **check** dice si el grafo tiene registros de cada cosa sobre la que trata una pregunta. Un término aparece en `missing` como `unknown_term`, `no_mapping` o `not_in_graph`, y entonces el comando termina con **3** y el tipo `not_investigable`.
- **path** da las formas con menos saltos de ir de un concepto a otro: por las relaciones declaradas y, con `--db`, por los patrones que el grafo contiene de verdad, cada una como un `pattern` de Cypher listo para `MATCH`. Un camino es una forma en que se conectan los datos, no la prueba de que algo ocurriera a lo largo de él.

Cada respuesta incluye `ontology_versions`: los archivos usados, por ID, revisión y origen.

## Consulta con las palabras de la ontología {#semantic}

```sh
khonsu query --db graphs/sec --semantic --cypher \
  "MATCH (t:Technique)<-[:indicates]-(p:Process)-[:runs_on]->(d:Device) RETURN t.name, d.name"
```

Con `--semantic`, un concepto usado como etiqueta se convierte en todas las etiquetas de este grafo mapeadas a él o a lo que lo extiende, y una relación en los tipos mapeados a ella: `(d:Device)` pasa a ser `(d:Host:Server)` y `[:runs_on]` pasa a ser `[:EXEC_ON|RAN_ON]`. Las etiquetas que el grafo ya tiene se dejan como están. Un concepto que nada del grafo contiene termina con 3 en lugar de devolver cero filas. El resultado tiene `semantic`, con la sentencia que se ejecutó, cada sustitución y los borradores usados. Una consulta semántica solo lee.

## Comprueba una consulta sin ejecutarla {#validate}

```sh
khonsu query --db graphs/sec --validate-only --cypher "MATCH (h:Host)-[:RAN_ON]->(p:Process) RETURN p"
```

`--validate-only` comprueba una sentencia contra el grafo y no ejecuta nada; `--semantic` hace la misma comprobación antes de cada consulta.

| Tipo | Gravedad | Qué significa |
| --- | --- | --- |
| `unknown_label`, `unknown_type` | error | El grafo no tiene esa etiqueta ni ese tipo de relación; `suggestions` trae nombres parecidos |
| `wrong_direction` | error | El grafo solo contiene el patrón en sentido contrario |
| `no_such_pattern` | error | El grafo no contiene el patrón en ningún sentido |
| `unbounded` | advertencia | Un patrón de longitud variable sin límite superior |
| `cartesian` | advertencia | Partes de un mismo `MATCH` no comparten ninguna variable, así que vuelven todas las parejas de sus filas |

Un error termina con 2, el tipo `invalid_query` y los problemas en `error.detail`; las advertencias se informan y la sentencia se ejecuta. La referencia completa está en el [repositorio de código](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/ontology.md).
