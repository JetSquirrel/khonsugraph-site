---
description: Encontre, instale e atualize plugins do KhonsuGraph pelo nome a partir de um marketplace, verifique o que você baixa e publique seus próprios plugins.
---
# Marketplace

Um marketplace lista plugins pelo nome. Para cada plugin, ele informa a versão, as permissões declaradas e um pacote por plataforma com seu SHA-256. O KhonsuGraph pode ler um marketplace a partir de uma pasta local, de um repositório no GitHub ou de um endereço HTTPS.

::: info Na próxima versão
O marketplace chega na versão seguinte à 0.3.0. A partir dela, o CSV é o único plugin que acompanha o app. AWS e Neo4j passam a ser instalados pelo marketplace oficial, como SQL e DuckLocal. Na 0.3.0, AWS e Neo4j ainda acompanham o app.
:::

## Instalar um plugin {#install}

```sh
khonsu plugin search              # o que os marketplaces oferecem
khonsu plugin install aws --yes   # baixar, verificar, instalar e aprovar
khonsu plugin update              # atualizar os plugins instalados
```

No app, **Add Data Source… → More Plugins…** mostra a mesma lista. Um plugin instalado ou atualizado ali segue para o diálogo de aprovação e depois para o formulário da fonte.

Quando dois marketplaces listam o mesmo ID, indique qual você quer: `khonsu plugin install sql@official`. `khonsu plugin update --dry-run` apenas informa o que mudaria.

## Plugins oficiais {#official}

| Plugin | O que ele lê |
| --- | --- |
| `sql` | Tabelas de PostgreSQL, MySQL e SQLite, mapeadas manualmente ou a partir de chaves primárias e estrangeiras |
| `ducklocal` | Tabelas Parquet, CSV, JSON e DuckDB, lidas pelo DuckLocal |
| `aws` | VPCs, sub-redes, security groups, instâncias, load balancers e roles do IAM, pela AWS CLI somente leitura. Oferece a análise de exposição e o template `aws.exposure` |
| `neo4j` | Um banco Neo4j, como um preenchido pelo Cartography, copiado pela sua API HTTP |

Toda instalação começa com o marketplace `official`. Ele é servido em `marketplace.khonsugraph.com` e gerado a partir do repositório [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace), que guarda o código-fonte e o README de cada plugin. O plugin CSV continua embutido.

## O que é verificado {#checks}

- O pacote precisa corresponder ao SHA-256 listado pelo marketplace e conter o plugin e a versão listados. Caso contrário, nada é instalado e o que já estava instalado permanece.
- Índices e pacotes são lidos somente por HTTPS.
- Instalar não é aprovar. Um plugin de marketplace precisa de aprovação antes de rodar, e de novo depois de atualizado. `--yes` aprova na mesma etapa.

Um marketplace diz onde está um pacote e qual é o seu hash. Ele não torna o plugin seguro. Revise as permissões declaradas antes de aprovar: são declarações, não um sandbox. Veja [desenvolvimento de plugins](./plugins).

## Adicionar um marketplace {#add}

```sh
khonsu plugin marketplace add acme/khonsu-plugins   # owner/repo no GitHub
khonsu plugin marketplace add https://plugins.example.com  # qualquer endereço HTTPS
khonsu plugin marketplace add ~/work/team-plugins   # uma pasta
khonsu plugin marketplace list
khonsu plugin marketplace remove team-plugins
```

`khonsu plugin marketplace remove official` desativa o marketplace oficial, e `khonsu plugin marketplace restore` o traz de volta.

## Publicar um plugin {#publish}

```sh
khonsu plugin publish ./my-plugin --to ~/work/team-plugins
```

Isso empacota o plugin na pasta e o lista no `marketplace.json` dela. Faça commit e push da pasta, ou envie-a para uma hospedagem estática. Outras pessoas a adicionam uma vez com `khonsu plugin marketplace add` e depois instalam pelo nome. Publicar a mesma versão de novo substitui o pacote daquela plataforma, então cada plataforma pode publicar a própria build. Veja a [referência completa do marketplace](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/marketplace.md).
