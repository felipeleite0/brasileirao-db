const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const pastaBanco = path.join(raiz, 'banco');
const arquivoBanco = path.join(pastaBanco, 'brasileirao.db');
const pastaPublica = path.join(raiz, 'public');
const porta = 3210;

fs.mkdirSync(pastaBanco, { recursive: true });

const banco = new DatabaseSync(arquivoBanco);
banco.exec('PRAGMA foreign_keys = ON');
banco.exec(fs.readFileSync(path.join(raiz, 'sql', '01_estrutura.sql'), 'utf8'));
banco.exec(fs.readFileSync(path.join(raiz, 'sql', '02_dados.sql'), 'utf8'));

const consultas = {
  jogos: banco.prepare(`
    SELECT j.id, j.rodada, j.data_jogo, j.gols_mandante,
           j.gols_visitante, j.status, m.nome AS mandante,
           v.nome AS visitante
    FROM jogos j
    JOIN times m ON m.id = j.mandante_id
    JOIN times v ON v.id = j.visitante_id
    ORDER BY j.rodada, j.data_jogo, j.id
  `),
  atualizarJogo: banco.prepare(`
    UPDATE jogos
    SET gols_mandante = ?, gols_visitante = ?, status = ?
    WHERE id = ?
  `),
  classificacao: banco.prepare(`
    WITH desempenhos AS (
      SELECT mandante_id AS time_id,
             gols_mandante AS gols_pro,
             gols_visitante AS gols_contra,
             CASE WHEN gols_mandante > gols_visitante THEN 1 ELSE 0 END AS v,
             CASE WHEN gols_mandante = gols_visitante THEN 1 ELSE 0 END AS e,
             CASE WHEN gols_mandante < gols_visitante THEN 1 ELSE 0 END AS d,
             CASE WHEN gols_mandante > gols_visitante THEN 3
                  WHEN gols_mandante = gols_visitante THEN 1 ELSE 0 END AS p
      FROM jogos WHERE status = 'finalizado'
      UNION ALL
      SELECT visitante_id, gols_visitante, gols_mandante,
             CASE WHEN gols_visitante > gols_mandante THEN 1 ELSE 0 END,
             CASE WHEN gols_visitante = gols_mandante THEN 1 ELSE 0 END,
             CASE WHEN gols_visitante < gols_mandante THEN 1 ELSE 0 END,
             CASE WHEN gols_visitante > gols_mandante THEN 3
                  WHEN gols_visitante = gols_mandante THEN 1 ELSE 0 END
      FROM jogos WHERE status = 'finalizado'
    )
    SELECT t.nome AS time, COUNT(d.time_id) AS jogos,
           COALESCE(SUM(d.p), 0) AS pontos,
           COALESCE(SUM(d.v), 0) AS vitorias,
           COALESCE(SUM(d.e), 0) AS empates,
           COALESCE(SUM(d.d), 0) AS derrotas,
           COALESCE(SUM(d.gols_pro), 0) AS gols_pro,
           COALESCE(SUM(d.gols_contra), 0) AS gols_contra,
           COALESCE(SUM(d.gols_pro - d.gols_contra), 0) AS saldo
    FROM times t
    LEFT JOIN desempenhos d ON d.time_id = t.id
    GROUP BY t.id, t.nome
    ORDER BY pontos DESC, vitorias DESC, saldo DESC, gols_pro DESC, time
  `),
};

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function responderJson(resposta, status, dados) {
  resposta.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  resposta.end(JSON.stringify(dados));
}

function lerCorpo(requisicao) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    requisicao.on('data', (parte) => {
      corpo += parte;
      if (corpo.length > 10000) requisicao.destroy();
    });
    requisicao.on('end', () => {
      try {
        resolve(JSON.parse(corpo || '{}'));
      } catch (erro) {
        reject(erro);
      }
    });
    requisicao.on('error', reject);
  });
}

function numeroDeGol(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
}

async function tratarApi(requisicao, resposta, url) {
  if (requisicao.method === 'GET' && url.pathname === '/api/dados') {
    return responderJson(resposta, 200, {
      jogos: consultas.jogos.all(),
      classificacao: consultas.classificacao.all(),
    });
  }

  const partida = url.pathname.match(/^\/api\/jogos\/(\d+)$/);
  if (requisicao.method === 'PUT' && partida) {
    try {
      const corpo = await lerCorpo(requisicao);
      const statusPermitidos = ['agendado', 'finalizado', 'adiado'];
      const status = corpo.status;
      let golsMandante = numeroDeGol(corpo.gols_mandante);
      let golsVisitante = numeroDeGol(corpo.gols_visitante);

      if (!statusPermitidos.includes(status)) {
        return responderJson(resposta, 400, { erro: 'Status invalido.' });
      }

      if (status !== 'finalizado') {
        golsMandante = null;
        golsVisitante = null;
      } else if (golsMandante === null || golsVisitante === null) {
        return responderJson(resposta, 400, { erro: 'Informe os dois placares.' });
      }

      const resultado = consultas.atualizarJogo.run(
        golsMandante,
        golsVisitante,
        status,
        Number(partida[1]),
      );

      if (resultado.changes === 0) {
        return responderJson(resposta, 404, { erro: 'Jogo nao encontrado.' });
      }

      return responderJson(resposta, 200, { ok: true });
    } catch (erro) {
      return responderJson(resposta, 400, { erro: 'Dados invalidos.' });
    }
  }

  return responderJson(resposta, 404, { erro: 'Endereco nao encontrado.' });
}

function servirArquivo(resposta, url) {
  const solicitado = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const arquivo = path.resolve(pastaPublica, solicitado);

  if (!arquivo.startsWith(`${pastaPublica}${path.sep}`) || !fs.existsSync(arquivo)) {
    resposta.writeHead(404);
    resposta.end('Arquivo nao encontrado');
    return;
  }

  resposta.writeHead(200, {
    'Content-Type': tipos[path.extname(arquivo)] || 'application/octet-stream',
  });
  fs.createReadStream(arquivo).pipe(resposta);
}

const servidor = http.createServer(async (requisicao, resposta) => {
  const url = new URL(requisicao.url, `http://${requisicao.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    await tratarApi(requisicao, resposta, url);
  } else {
    servirArquivo(resposta, url);
  }
});

servidor.listen(porta, '127.0.0.1', () => {
  console.log(`Painel disponivel em http://127.0.0.1:${porta}`);
  console.log('Mantenha esta janela aberta enquanto estiver usando o painel.');
});

