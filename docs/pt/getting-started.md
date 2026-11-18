---
description: Instale o KhonsuGraph, crie um grafo e importe um pequeno exemplo em CSV.
---
# Primeiros passos

## Instalação

Encontre os pacotes disponíveis em [GitHub Releases](https://github.com/JetSquirrel/KhonsuGraph/releases). O fluxo de release gera um DMG para macOS em Apple silicon e um ZIP de 64 bits para Windows. Os pacotes para Windows não são assinados; a última atualização do motor foi validada no macOS, não no Windows.

No macOS, abra o DMG e copie o app para Aplicativos. No Windows, extraia o ZIP inteiro, mantendo a pasta `plugins` ao lado do executável.

O botão **Command line & AI** (o ícone do robô) na barra de título do app instala o comando `khonsu` no PATH e pode adicionar a skill de agente ao Claude Code. O executável do app também aceita subcomandos da CLI diretamente.

```sh
khonsu --version
```

## Crie um grafo pequeno

Baixe [hosts.csv](/samples/hosts.csv) e [dependencies.csv](/samples/dependencies.csv) na mesma pasta de trabalho. Eles descrevem três hosts e duas dependências.

Execute estes comandos nessa pasta. Mantenha o grafo fechado no app desktop durante a importação.

```sh
khonsu graph init graphs/demo
khonsu source add --db graphs/demo --plugin csv --name demo \
  -c node_file=hosts.csv -c node_label=Host -c node_id_column=id \
  -c edge_file=dependencies.csv -c edge_type=DEPENDS_ON \
  -c edge_source_column=source -c edge_target_column=target --test
khonsu plugin sync --source demo --dry-run
khonsu plugin sync --source demo
```

A primeira sincronização mostra contagens e amostras sem gravar; a segunda importa o grafo. O `source add` armazena os caminhos dos CSV como caminhos absolutos, então sincronizações posteriores funcionam de qualquer pasta.

## Consulte e explore

```sh
khonsu schema --db graphs/demo
khonsu query --db graphs/demo --cypher \
  "MATCH (a:Host)-[r:DEPENDS_ON]->(b:Host) RETURN a, r, b"
khonsu open graphs/demo
```

No editor de consultas do desktop, execute a mesma consulta Cypher. Retornar nós e relacionamentos inteiros dá à tela do grafo a informação de que ela precisa para mostrar as conexões.

Continue com [consultas](./queries) ou [seu primeiro painel](./dashboards).

## Compile a partir do código-fonte

A partir de um checkout do repositório do app:

```sh
cargo build --workspace
cargo run -p khonsugraph
```

O app usa Rust, GPUI e HawDB. Consulte o README do repositório para empacotamento de release e configuração específica de plataforma.
