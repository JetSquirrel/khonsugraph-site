---
description: Investigações de grafo de exemplo em conjuntos de dados públicos. Uma cadeia de ataque a partir de logs do Sysmon, um raio de impacto de serviço, a rede do ICIJ Offshore Leaks, uma rede de confiança de Bitcoin e exposição na AWS.
---
# Exemplos

O [repositório da aplicação](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples) inclui painéis e scripts que preparam grafos a partir de conjuntos de dados públicos. Um arquivo `.dash` sozinho não inclui seu banco de dados.

## Conjuntos de dados públicos

| Painel | Pergunta | Dados de origem | Grafo |
| --- | --- | --- | --- |
| [Cadeia de ataque](#attack-chain) | Qual cadeia de ataque se esconde em logs de host ruidosos? | MITRE ATT&CK e OTRF Security-Datasets | 1.838 nós, 20.591 relacionamentos |
| [Raio de impacto de SRE](#blast-radius) | O que um serviço com falha derruba? | Manifestos de serviço do Google Online Boutique | 12 serviços, 16 caminhos de chamada |
| [Rede de empresas offshore](#offshore-network) | Quem está por trás de um conjunto de empresas? | ICIJ Offshore Leaks | 5.577 nós, 6.515 relacionamentos |
| [Rede de confiança de contas](#trust-network) | Sobre quais contas os outros alertam? | Avaliações do SNAP Bitcoin OTC | 5.881 contas, 35.592 avaliações |
| Aluguel perto do transporte | Quais imóveis ficam perto de uma estação de MTR? | Dados de MTR do OpenStreetMap e Inside Airbnb Hong Kong | 5.730 nós, 17.119 relacionamentos |

Cada origem mantém sua própria licença. A presença no conjunto de dados do ICIJ não implica irregularidade. Veja o README de exemplos do repositório para procedência e licenciamento.

## Cadeia de ataque {#attack-chain}

Para um engenheiro de segurança ou caçador de ameaças. `security/attack_chain.dash` une o MITRE ATT&CK (grupos, software, técnicas, mitigações) com duas gravações do Sysmon do OTRF, Empire Mimikatz e Covenant PowerShell remoting. Eventos de criação de processo e de acesso ao LSASS se vinculam às técnicas que indicam. Escolha uma técnica para ver quais grupos conhecidos a usam e como mitigá-la; escolha um processo para ver o que ele gerou e a que se conectou.

Monte-o com os comandos abaixo, usando `security` no lugar de `sre` e `attack_chain.dash` como painel.

## Rede offshore {#offshore-network}

Para um investigador. `investigation/offshore_network.dash` mapeia dirigentes, empresas e intermediários do banco de dados ICIJ Offshore Leaks (Panama Papers, Hong Kong, 2012–2015). Escolha um dirigente para ver suas empresas, e encontre os intermediários que mais constituíram empresas.

Monte-o com `investigation` no lugar de `sre`.

## Rede de confiança {#trust-network}

Para um auditor. `audit/trust_network.dash` explora quem avalia quem na rede de confiança do Bitcoin OTC. A [análise de grafos](./analysis) encontra as contas nas quais a rede se apoia:

```sh
khonsu graph analyze pagerank --db graphs/audit --type TRUSTS --top 10
```

Monte-o com `audit` no lugar de `sre`.

## Raio de impacto de serviço {#blast-radius}

Para um SRE: quais serviços chamam uma dependência com falha, direta ou indiretamente por meio de outros. A partir de um checkout do repositório do app:

```sh
sh examples/datasets/fetch.sh scratch/datasets/raw
node examples/datasets/build.mjs sre scratch/datasets/raw scratch/datasets/sre
khonsu graph init graphs/sre
khonsu source add --db graphs/sre --plugin csv --name sre-data \
  -c 'nodes=[{"path":"'"$PWD"'/scratch/datasets/sre/nodes.csv","label_column":"label","id_column":"id"}]' \
  -c 'edges=[{"path":"'"$PWD"'/scratch/datasets/sre/edges.csv","type_column":"type","source_column":"source","target_column":"target","id_column":"id"}]'
khonsu plugin sync --source sre-data
khonsu dash check examples/sre/blast_radius.dash --db graphs/sre
khonsu open graphs/sre
khonsu open examples/sre/blast_radius.dash
```

O script de download baixa dados públicos. `$PWD` mantém os caminhos dos CSV absolutos, o que o plugin CSV exige para `nodes` e `edges`. Substitua `sre` pelos outros diretórios de história conforme descrito no README de exemplos.

## Exposição na AWS sem uma conta ativa {#aws-exposure}

Para um engenheiro de segurança de nuvem: o que a configuração de uma conta AWS abre para a internet, de um CIDR de internet passando por security groups e load balancers até instâncias e as roles que elas assumem.

As respostas salvas da AWS CLI do plugin AWS ficam no repositório [khonsugraph-marketplace](https://github.com/JetSquirrel/khonsugraph-marketplace). Com um clone dele ao lado do repositório do app, execute a partir da raiz do repositório do app:

```sh
khonsu graph init graphs/aws
khonsu plugin install aws --yes
khonsu source add --db graphs/aws --plugin aws --name aws-fixture \
  -c "fixture_dir=$PWD/../khonsugraph-marketplace/plugins/aws/tests/fixture" -c regions=us-east-1
khonsu plugin sync --source aws-fixture
khonsu dash check examples/aws/exposure.dash --db graphs/aws
khonsu open graphs/aws
khonsu open examples/aws/exposure.dash
```

Você também pode <a href="/docs/samples/exposure.dash" download>baixar o painel de exposição</a>. Ele exige o grafo AWS importado.

A partir da 0.3.0, `khonsu plugin analyze aws exposure --db graphs/aws` relata achados com a regra e os campos por trás de cada um, e `khonsu graph explore` traça o caminho. Veja [investigações](./investigations).
