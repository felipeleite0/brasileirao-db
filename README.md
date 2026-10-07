# Brasileirão DB

Projeto didático de banco de dados para cadastrar times e jogos fictícios do Campeonato Brasileiro, consultar partidas e calcular a classificação automaticamente.

O objetivo é praticar modelagem relacional, SQL e integração simples entre Node.js, SQLite e uma interface web local.

## Destaques

- Criação de tabelas com SQL.
- Uso de chave primária e chave estrangeira.
- Relacionamento entre jogos e times.
- Consultas com `JOIN`.
- Cálculo de classificação com pontos, vitórias, empates, derrotas, gols e saldo.
- Painel local para atualizar resultados e recalcular a tabela.
- Scripts para consultar os dados pelo terminal.

## Tecnologias

- JavaScript
- Node.js
- SQLite
- SQL
- HTML
- CSS

## Estrutura

```text
brasileirao-db/
|-- public/
|   |-- index.html
|   |-- styles.css
|   `-- dashboard.js
|-- sql/
|   |-- 01_estrutura.sql
|   |-- 02_dados.sql
|   `-- 03_consultas.sql
|-- src/
|   |-- app.js
|   `-- server.js
|-- abrir-painel.bat
|-- consultar.bat
|-- package.json
`-- README.md
```

## Como executar

No Windows, é possível abrir o painel com dois cliques em:

```text
abrir-painel.bat
```

Também é possível executar pelo terminal:

```bash
npm run criar-banco
npm run consultar
npm run painel
```

O painel local fica disponível em:

```text
http://127.0.0.1:3210
```

## Modelo de dados

Um time pode participar de vários jogos. Cada jogo possui dois relacionamentos com a tabela `times`: mandante e visitante.

```text
times (1) ----< jogos >---- (1) times
              mandante
              visitante
```

## Consultas praticadas

O projeto inclui exemplos para:

- listar partidas;
- relacionar jogos com times;
- filtrar partidas por status;
- calcular classificação;
- ordenar tabela por pontos, vitórias, saldo de gols e gols pró.

## Aprendizados

- Criar e popular um banco SQLite.
- Separar scripts SQL por responsabilidade.
- Usar `JOIN` para combinar informações de tabelas relacionadas.
- Criar consultas para gerar relatórios.
- Conectar uma interface local a dados calculados no backend.

## Próximas melhorias

- Adicionar formulário para cadastrar times.
- Adicionar formulário para cadastrar novos jogos.
- Permitir edição de rodadas e datas.
- Incluir mais estatísticas na classificação.
- Criar testes automatizados para as consultas.
