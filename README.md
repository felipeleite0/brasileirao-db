# Brasileirao DB

Projeto didatico de banco de dados para cadastrar times e jogos do Campeonato
Brasileiro. Os dados de partidas sao ficticios e existem apenas para estudo.

## O que voce vai aprender

- Criar tabelas e definir tipos de dados.
- Usar uma chave primaria para identificar cada registro.
- Relacionar jogos aos times com chaves estrangeiras.
- Impedir dados invalidos com regras de validacao.
- Consultar partidas usando `JOIN`.
- Calcular uma classificacao usando resultados dos jogos.

## Estrutura do projeto

```text
brasileirao-db/
|-- banco/                 # Banco gerado; nao vai para o GitHub
|-- sql/
|   |-- 01_estrutura.sql   # Cria as tabelas e os relacionamentos
|   |-- 02_dados.sql       # Insere dados ficticios para teste
|   `-- 03_consultas.sql   # Exemplos de consultas SQL
|-- src/
|   `-- app.js             # Gera e consulta o banco SQLite
|-- .gitignore
|-- package.json
`-- README.md
```

## Como executar

No Windows, a forma mais simples e dar dois cliques em `abrir-painel.bat`.
O navegador abrira um painel no qual os resultados podem ser alterados e a
classificacao sera recalculada na hora.

O arquivo `consultar.bat` continua disponivel para visualizar os dados no
terminal.

No terminal, entre na pasta do projeto e execute:

```powershell
node src/app.js criar
node src/app.js consultar
```

O primeiro comando cria `banco/brasileirao.db`. O segundo mostra as partidas
cadastradas e a classificacao calculada no terminal.

Se o `npm` estiver instalado, tambem podem ser usados os atalhos
`npm run criar-banco` e `npm run consultar`.

## Modelo inicial

Um time pode participar de muitos jogos. Cada jogo possui dois relacionamentos
com a tabela `times`: um para o mandante e outro para o visitante.

```text
times (1) ----< jogos >---- (1) times
              mandante
              visitante
```

## Proximas etapas sugeridas

1. Executar o projeto e observar os resultados.
2. Cadastrar mais times e jogos ficticios.
3. Entender e executar as consultas de `03_consultas.sql`.
4. Adicionar jogadores e estadios em novas tabelas.
5. Criar uma interface simples para cadastrar e listar os jogos.
