# KhonsuGraph — Creado para cazadores.

Sigue las conexiones. Descubre la evidencia.

Un banco de trabajo de investigación con grafos, open source y local-first, para seguridad, infraestructura y más allá. Sigue las conexiones en grafos HawDB con Cypher y SQL, conecta tus datos y crea paneles con tu agente de IA.

## UNA HISTORIA DE EXPLORACIÓN

La historia de explorar lo desconocido también es la historia de seguir rastros.

### LA ANTIGUA NATURALEZA SALVAJE — Los cazadores seguían rastros.

En una naturaleza sin mapas, los cazadores leían las huellas en el suelo, las ramas rotas y los rastros que dejaban los animales.

Una huella sola dice poco. Unida a la siguiente, esas huellas revelan un camino: por dónde ha pasado un animal y hacia dónde podría ir.

Conecta los rastros. Una dirección empieza a emerger.

### EL ANTIGUO EGIPTO — Los viajeros miraban la luna.

En la mitología del antiguo Egipto, Khonsu es el dios de la luna, los viajes y la protección. Su nombre significa «viajero», y evoca el recorrido de la luna por el cielo nocturno.

Cuando cae el sol, la luz de la luna muestra a los viajeros un camino entre la oscuridad.

La oscuridad no significa que no haya camino. Solo que aún está por encontrar.

### LA ERA DE LAS EXPLORACIONES — Los exploradores seguían las estrellas.

En busca de especias y rutas marítimas hacia Oriente, los navegantes se adentraban en aguas desconocidas.

Leían la posición de las estrellas junto con los vientos, las corrientes y los registros de viaje para orientarse en mar abierto.

Una estrella solitaria es solo un punto de luz. Conectadas, las estrellas se convierten en una carta para navegar.

### HOY — Seguimos rastros digitales.

Hoy, los cazadores de amenazas siguen rastros por el mundo digital. Su oscuridad se esconde en cantidades ingentes de datos.

Los analistas de seguridad reconstruyen ataques a partir de registros. Los SRE trazan dependencias entre servicios para localizar causas raíz y entender su impacto. Los auditores siguen transacciones y relaciones entre entidades para descubrir anomalías y riesgos.

Eventos, activos e identidades en apariencia inconexos revelan su historia a través de sus conexiones.

De las huellas en la naturaleza a las cartas del cielo nocturno y a las redes de relaciones digitales, siempre hemos hecho lo mismo: Conectar pistas. Encontrar la verdad.

Esto es KhonsuGraph. Creado para cazadores.

- **Cazadores de amenazas**: Traza rutas de ataque y amenazas.
- **SRE**: Traza causas raíz y dependencias.
- **Investigadores de fraude**: Traza transacciones anómalas y vínculos ocultos.
- **Investigadores**: Explora patrones en redes complejas.

KhonsuGraph — Built for Hunters. Creado para cazadores.

## Conecta tus fuentes

Importa nodos y relaciones desde CSV, sincroniza recursos de AWS, copia una base de datos Neo4j o Cartography, o escribe un plugin para tu propio sistema.

[Fuentes de datos](https://khonsugraph.com/docs/es/data-sources)

## Pregunta en Cypher o SQL

Inspecciona el esquema, escribe una consulta y ve los resultados como tabla o como grafo que puedes explorar.

[Consulta tu grafo](https://khonsugraph.com/docs/es/queries)

## Sigue la ruta

Recorre hacia fuera desde cualquier nodo, limitado por saltos y tipos de relación, y obtén la ruta con menos saltos hasta un objetivo.

[Traza una ruta](https://khonsugraph.com/docs/es/investigations)

## Encuentra lo importante

Clasifica nodos con PageRank y betweenness, encuentra comunidades y componentes, y mide rutas más cortas. Los resultados coinciden con networkx.

[Analiza el grafo](https://khonsugraph.com/docs/es/analysis)

## Conserva la evidencia

Cada registro indica qué fuente lo escribió y cuándo. Guarda una investigación, vuelve a abrirla tras cambiar los datos y comprueba si la conclusión sigue siendo válida.

[Guarda una investigación](https://khonsugraph.com/docs/es/investigations#saved-investigations)

## Comparte el hallazgo

Convierte consultas en un archivo .dash de texto plano con paneles de grafo, gráficos, tablas y filtros compartidos.

[Crea un panel](https://khonsugraph.com/docs/es/dashboards)

## ¿Qué es KhonsuGraph?

KhonsuGraph es un banco de trabajo de escritorio gratuito y open source para grafos HawDB locales. Combina consultas Cypher y SQL con dialecto PostgreSQL, un lienzo de grafo, plugins de fuentes de datos y paneles en texto plano.

## ¿Mi grafo sale de mi equipo?

El almacenamiento y las consultas se quedan en tu ordenador. Los plugins de fuentes pueden contactar con los sistemas que configures, como AWS. Si usas un agente de IA externo, se aplican sus propios ajustes de datos y privacidad.

## ¿Qué plataformas son compatibles?

El proyecto publica paquetes para macOS en Apple silicon y Windows de 64 bits. Consulta GitHub Releases para ver los paquetes disponibles. Los paquetes de Windows no están firmados; la última actualización del motor se validó en macOS.

## ¿Es un producto oficial de HawDB?

No. KhonsuGraph es un proyecto independiente construido sobre HawDB. Es gratuito y open source bajo la licencia Apache-2.0.

## ¿Puedo usar cualquier consulta Cypher?

KhonsuGraph usa la sintaxis Cypher compatible con HawDB, que difiere de la de otras bases de datos de grafos. Consulta la guía de consultas para ver los patrones compatibles y las limitaciones actuales.

## ¿En qué se diferencia de Neo4j Browser o Bloom?

KhonsuGraph es una app de escritorio con su propio motor de grafo integrado, HawDB, así que no hay que ejecutar un servidor de base de datos. Añade exploración de rutas, evidencia a nivel de registro, algoritmos de grafos y una línea de comandos JSON para agentes de IA. Su plugin de Neo4j puede copiar una base de datos Neo4j existente, incluida una que Cartography rellene, a un grafo local.

## ¿Funciona con Claude Code y otros agentes de IA?

Sí. La línea de comandos khonsu imprime JSON estructurado en cada comando, así que cualquier agente que pueda ejecutar comandos de shell puede usarla, y la app puede instalar una habilidad de agente para Claude Code. El agente lee el esquema, ejecuta consultas y escribe paneles; tú revisas el resultado en la ventana.

[GitHub](https://github.com/JetSquirrel/KhonsuGraph)
