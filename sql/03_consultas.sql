-- 1. Todos os times cadastrados.
SELECT nome, cidade, estado, estadio
FROM times
ORDER BY nome;

-- 2. Jogos com os nomes dos times no lugar dos seus codigos.
SELECT
    j.rodada,
    j.data_jogo,
    mandante.nome AS mandante,
    j.gols_mandante,
    j.gols_visitante,
    visitante.nome AS visitante,
    j.status
FROM jogos AS j
JOIN times AS mandante ON mandante.id = j.mandante_id
JOIN times AS visitante ON visitante.id = j.visitante_id
ORDER BY j.rodada, j.data_jogo;

-- 3. Classificacao calculada a partir dos jogos finalizados.
WITH desempenhos AS (
    SELECT
        mandante_id AS time_id,
        gols_mandante AS gols_pro,
        gols_visitante AS gols_contra,
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
    COUNT(d.time_id) AS jogos,
    COALESCE(SUM(d.pontos), 0) AS pontos,
    COALESCE(SUM(d.gols_pro), 0) AS gols_pro,
    COALESCE(SUM(d.gols_contra), 0) AS gols_contra,
    COALESCE(SUM(d.gols_pro - d.gols_contra), 0) AS saldo
FROM times AS t
LEFT JOIN desempenhos AS d ON d.time_id = t.id
GROUP BY t.id, t.nome
ORDER BY pontos DESC, saldo DESC, gols_pro DESC, time;

