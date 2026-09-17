const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const pastaBanco = path.join(raiz, 'banco');
const arquivoBanco = path.join(pastaBanco, 'brasileirao.db');

fs.mkdirSync(pastaBanco, { recursive: true });

function lerSql(nome) {
  return fs.readFileSync(path.join(raiz, 'sql', nome), 'utf8');
}

function criarBanco() {
  const banco = new DatabaseSync(arquivoBanco);
  banco.exec(lerSql('01_estrutura.sql'));
  banco.exec(lerSql('02_dados.sql'));
  banco.close();
  console.log(`Banco criado em: ${arquivoBanco}`);
}

function mostrarConsultas() {
  criarBanco();
  const banco = new DatabaseSync(arquivoBanco, { readOnly: true });

  const jogos = banco.prepare(`
    SELECT j.rodada, j.data_jogo,
           m.nome AS mandante,
           CASE
             WHEN j.status = 'finalizado'
             THEN j.gols_mandante || ' x ' || j.gols_visitante
             ELSE 'a disputar'
           END AS placar,
           v.nome AS visitante
    FROM jogos j
    JOIN times m ON m.id = j.mandante_id
    JOIN times v ON v.id = j.visitante_id
    ORDER BY j.rodada, j.data_jogo
  `).all();

  const classificacao = banco.prepare(`
    WITH desempenhos AS (
      SELECT
        mandante_id AS time_id,
        gols_mandante AS gols_pro,
        gols_visitante AS gols_contra,
        CASE WHEN gols_mandante > gols_visitante THEN 1 ELSE 0 END AS vitorias,
        CASE WHEN gols_mandante = gols_visitante THEN 1 ELSE 0 END AS empates,
        CASE WHEN gols_mandante < gols_visitante THEN 1 ELSE 0 END AS derrotas,
        CASE
          WHEN gols_mandante > gols_visitante THEN 3
          WHEN gols_mandante = gols_visitante THEN 1
          ELSE 0
        END AS pontos
      FROM jogos
      WHERE status = 'finalizado'

      UNION ALL

      SELECT
        visitante_id AS time_id,
        gols_visitante AS gols_pro,
        gols_mandante AS gols_contra,
        CASE WHEN gols_visitante > gols_mandante THEN 1 ELSE 0 END AS vitorias,
        CASE WHEN gols_visitante = gols_mandante THEN 1 ELSE 0 END AS empates,
        CASE WHEN gols_visitante < gols_mandante THEN 1 ELSE 0 END AS derrotas,
        CASE
          WHEN gols_visitante > gols_mandante THEN 3
          WHEN gols_visitante = gols_mandante THEN 1
          ELSE 0
        END AS pontos
      FROM jogos
      WHERE status = 'finalizado'
    )
    SELECT
      t.nome AS time,
      COUNT(d.time_id) AS J,
      COALESCE(SUM(d.pontos), 0) AS P,
      COALESCE(SUM(d.vitorias), 0) AS V,
      COALESCE(SUM(d.empates), 0) AS E,
      COALESCE(SUM(d.derrotas), 0) AS D,
      COALESCE(SUM(d.gols_pro), 0) AS GP,
      COALESCE(SUM(d.gols_contra), 0) AS GC,
      COALESCE(SUM(d.gols_pro - d.gols_contra), 0) AS SG
    FROM times t
    LEFT JOIN desempenhos d ON d.time_id = t.id
    GROUP BY t.id, t.nome
    ORDER BY P DESC, V DESC, SG DESC, GP DESC, time
  `).all().map((linha, indice) => ({
    posicao: indice + 1,
    ...linha,
  }));

  console.log('\nJOGOS DO CAMPEONATO');
  console.table(jogos);
  console.log('\nCLASSIFICACAO');
  console.table(classificacao);
  banco.close();
}

const comando = process.argv[2];

if (comando === 'criar') {
  criarBanco();
} else if (comando === 'consultar') {
  mostrarConsultas();
} else {
  console.log('Use: npm run criar-banco ou npm run consultar');
}
