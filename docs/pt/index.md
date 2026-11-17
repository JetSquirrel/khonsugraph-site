---
description: Documentação do KhonsuGraph, a bancada de trabalho desktop de código aberto para investigação em grafos. Consulte em Cypher e SQL, percorra caminhos, cite evidências e monte painéis.
---
# Documentação do KhonsuGraph

KhonsuGraph é uma bancada de trabalho desktop local-first e de código aberto para investigação em grafos, construída sobre o HawDB. Traga dados por meio de plugins, consulte relacionamentos em Cypher ou tabelas em SQL no dialeto PostgreSQL, siga caminhos em uma tela de grafo, guarde a evidência por trás de cada registro e transforme o resultado em um painel.

É um projeto independente construído sobre o HawDB, distribuído sob a Apache-2.0.

## Comece por aqui

- [Instale e execute sua primeira consulta](./getting-started)
- [Importe CSV, conecte a AWS ou copie um banco Neo4j](./data-sources)
- [Instale plugins pelo nome a partir de um marketplace](./marketplace)
- [Entenda o suporte a Cypher e os limites de consulta](./queries)
- [Percorra um caminho, cite evidências e salve uma investigação](./investigations)
- [Ranqueie os nós e encontre comunidades com a análise de grafos](./analysis)
- [Monte um painel .dash](./dashboards)
- [Trabalhe com um agente de IA pela CLI](./cli)
- [Explore os painéis de exemplo](./examples)

## O que permanece local

Armazenamento do grafo e execução de consultas rodam no seu computador. Os plugins de fontes contatam os sistemas que você configurar. Um agente de IA externo tem suas próprias configurações de tratamento de dados; reveja-as quando compartilhar resultados de consultas com ele.

Estes guias descrevem o KhonsuGraph **0.3.0**, que fixa o HawDB em **0.29.0**. A exploração de caminhos, as evidências, as investigações salvas, os snapshots e o plugin Neo4j chegaram na 0.3.0; uma versão anterior não os tem. Execute `khonsu --version` para ver o que você tem, e consulte o [repositório de código-fonte](https://github.com/JetSquirrel/KhonsuGraph).
