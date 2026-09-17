-- Os dados abaixo sao ficticios e servem apenas para estudo.
INSERT OR IGNORE INTO times (nome, cidade, estado, estadio, fundacao) VALUES
    ('Flamengo', 'Rio de Janeiro', 'RJ', 'Maracana', 1895),
    ('Palmeiras', 'Sao Paulo', 'SP', 'Allianz Parque', 1914),
    ('Corinthians', 'Sao Paulo', 'SP', 'Neo Quimica Arena', 1910),
    ('Gremio', 'Porto Alegre', 'RS', 'Arena do Gremio', 1903),
    ('Bahia', 'Salvador', 'BA', 'Arena Fonte Nova', 1931),
    ('Cruzeiro', 'Belo Horizonte', 'MG', 'Mineirao', 1921);

INSERT OR IGNORE INTO jogos (
    temporada, rodada, data_jogo, mandante_id, visitante_id,
    gols_mandante, gols_visitante, status
) VALUES
    (2025, 1, '2025-04-05',
        (SELECT id FROM times WHERE nome = 'Flamengo'),
        (SELECT id FROM times WHERE nome = 'Bahia'), 2, 0, 'finalizado'),
    (2025, 1, '2025-04-06',
        (SELECT id FROM times WHERE nome = 'Palmeiras'),
        (SELECT id FROM times WHERE nome = 'Gremio'), 1, 1, 'finalizado'),
    (2025, 1, '2025-04-06',
        (SELECT id FROM times WHERE nome = 'Cruzeiro'),
        (SELECT id FROM times WHERE nome = 'Corinthians'), 0, 1, 'finalizado'),
    (2025, 2, '2025-04-12',
        (SELECT id FROM times WHERE nome = 'Corinthians'),
        (SELECT id FROM times WHERE nome = 'Flamengo'), 2, 2, 'finalizado'),
    (2025, 2, '2025-04-13',
        (SELECT id FROM times WHERE nome = 'Bahia'),
        (SELECT id FROM times WHERE nome = 'Palmeiras'), NULL, NULL, 'agendado'),
    (2025, 2, '2025-04-13',
        (SELECT id FROM times WHERE nome = 'Gremio'),
        (SELECT id FROM times WHERE nome = 'Cruzeiro'), NULL, NULL, 'agendado');

