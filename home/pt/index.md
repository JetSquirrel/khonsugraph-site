# KhonsuGraph — Feito para caçadores.

Siga as conexões. Descubra as evidências.

Uma bancada de trabalho de investigação com grafos, open source e local-first, para segurança, infraestrutura e além. Siga as conexões em grafos HawDB com Cypher e SQL, conecte seus dados e crie painéis com seu agente de IA.

## UMA HISTÓRIA DE EXPLORAÇÃO

A história de explorar o desconhecido também é uma história de seguir rastros.

### A ANTIGA NATUREZA SELVAGEM — Os caçadores seguiam rastros.

Numa natureza sem mapas, os caçadores liam as pegadas no solo, os galhos quebrados e os rastros deixados pelos animais.

Uma pegada sozinha diz pouco. Ligada à seguinte, esses rastros revelam um caminho: por onde um animal passou e para onde pode ir.

Conecte os rastros. Uma direção começa a surgir.

### O ANTIGO EGITO — Os viajantes olhavam para a lua.

Na mitologia do antigo Egito, Khonsu é o deus da lua, das viagens e da proteção. Seu nome significa «viajante» e evoca o percurso da lua pelo céu noturno.

Quando o sol se põe, o luar mostra aos viajantes um caminho pela escuridão.

A escuridão não significa que não há caminho. Apenas que ele ainda precisa ser encontrado.

### A ERA DAS GRANDES NAVEGAÇÕES — Os exploradores seguiam as estrelas.

Em busca de especiarias e rotas marítimas para o Oriente, os navegadores partiam para águas desconhecidas.

Eles liam a posição das estrelas junto com os ventos, as correntes e os registros de viagem para se orientar em alto-mar.

Uma estrela solitária é apenas um ponto de luz. Conectadas, as estrelas se tornam uma carta para navegar.

### HOJE — Seguimos rastros digitais.

Hoje, os caçadores de ameaças seguem rastros pelo mundo digital. Sua escuridão se esconde em enormes volumes de dados.

Analistas de segurança reconstroem ataques a partir de registros. SREs traçam dependências entre serviços para localizar causas raiz e entender seu impacto. Auditores seguem transações e relacionamentos entre entidades para revelar anomalias e riscos.

Eventos, ativos e identidades aparentemente sem ligação revelam sua história por meio de suas conexões.

Dos rastros na natureza às cartas do céu noturno e às redes de relacionamentos digitais, sempre fizemos a mesma coisa: Conectar pistas. Encontrar a verdade.

Este é o KhonsuGraph. Feito para caçadores.

- **Caçadores de ameaças**: Traçam caminhos de ataque e ameaças.
- **SREs**: Traçam causas raiz e dependências.
- **Investigadores de fraude**: Traçam transações anômalas e vínculos ocultos.
- **Pesquisadores**: Exploram padrões em redes complexas.

KhonsuGraph — Built for Hunters. Feito para caçadores.

## Conecte suas fontes

Importe nós e relacionamentos de um CSV, sincronize recursos da AWS, copie um banco Neo4j ou Cartography, ou escreva um plugin para o seu próprio sistema.

[Fontes de dados](https://khonsugraph.com/docs/pt/data-sources)

## Pergunte em Cypher ou SQL

Inspecione o esquema, escreva uma consulta e veja o resultado como tabela ou como grafo que você pode explorar.

[Consulte seu grafo](https://khonsugraph.com/docs/pt/queries)

## Siga o caminho

Percorra a partir de qualquer nó, limitado por saltos e tipos de relacionamento, e obtenha o caminho com menos saltos até um alvo.

[Traçar um caminho](https://khonsugraph.com/docs/pt/investigations)

## Encontre o que importa

Classifique nós com PageRank e betweenness, encontre comunidades e componentes e meça os caminhos mais curtos. Os resultados coincidem com o networkx.

[Analisar o grafo](https://khonsugraph.com/docs/pt/analysis)

## Preserve as evidências

Cada registro informa qual fonte o escreveu e quando. Salve uma investigação, reabra-a depois que os dados mudarem e veja se a conclusão ainda se sustenta.

[Salvar uma investigação](https://khonsugraph.com/docs/pt/investigations#saved-investigations)

## Compartilhe a descoberta

Transforme consultas em um arquivo .dash de texto simples com painéis de grafo, gráficos, tabelas e filtros compartilhados.

[Criar um painel](https://khonsugraph.com/docs/pt/dashboards)

## O que é o KhonsuGraph?

O KhonsuGraph é uma bancada de trabalho de desktop gratuita e open source para grafos HawDB locais. Ela combina consultas Cypher e SQL no dialeto PostgreSQL, uma tela de grafo, plugins de fontes de dados e painéis em texto simples.

## Meu grafo sai da minha máquina?

O armazenamento e as consultas ficam no seu computador. Os plugins de fontes podem acessar os sistemas que você configurar, como a AWS. Se você usar um agente de IA externo, valem as configurações de dados e privacidade dele.

## Quais plataformas são compatíveis?

O projeto publica pacotes para macOS em Apple silicon e Windows de 64 bits. Consulte o GitHub Releases para ver os pacotes disponíveis. Os pacotes para Windows não são assinados; a última atualização do mecanismo foi validada no macOS.

## Este é um produto oficial do HawDB?

Não. O KhonsuGraph é um projeto independente construído sobre o HawDB. É gratuito e open source sob a licença Apache-2.0.

## Posso usar qualquer consulta Cypher?

O KhonsuGraph usa a sintaxe Cypher compatível com o HawDB, que difere de outros bancos de dados de grafos. Consulte o guia de consultas para ver os padrões compatíveis e as limitações atuais.

## Qual é a diferença em relação ao Neo4j Browser ou ao Bloom?

O KhonsuGraph é um aplicativo de desktop com seu próprio mecanismo de grafo embutido, o HawDB, então não há servidor de banco de dados para executar. Ele adiciona exploração de caminhos, evidências no nível do registro, algoritmos de grafos e uma linha de comando JSON para agentes de IA. Seu plugin Neo4j pode copiar um banco Neo4j existente, inclusive um preenchido pelo Cartography, para um grafo local.

## Funciona com o Claude Code e outros agentes de IA?

Sim. A linha de comando khonsu imprime JSON estruturado em cada comando, então qualquer agente que consiga executar comandos de shell pode usá-la, e o aplicativo pode instalar uma skill de agente para o Claude Code. O agente lê o esquema, executa consultas e escreve painéis; você revisa o resultado na janela.

[GitHub](https://github.com/JetSquirrel/KhonsuGraph)
