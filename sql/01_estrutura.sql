PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    cidade TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (length(estado) = 2),
    estadio TEXT,
    fundacao INTEGER CHECK (fundacao BETWEEN 1800 AND 2100)
);

CREATE TABLE IF NOT EXISTS jogos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temporada INTEGER NOT NULL,
    rodada INTEGER NOT NULL CHECK (rodada BETWEEN 1 AND 38),
    data_jogo TEXT NOT NULL,
    mandante_id INTEGER NOT NULL,
    visitante_id INTEGER NOT NULL,
    gols_mandante INTEGER CHECK (gols_mandante >= 0),
    gols_visitante INTEGER CHECK (gols_visitante >= 0),
    status TEXT NOT NULL DEFAULT 'agendado'
        CHECK (status IN ('agendado', 'finalizado', 'adiado')),
    FOREIGN KEY (mandante_id) REFERENCES times(id),
    FOREIGN KEY (visitante_id) REFERENCES times(id),
    CHECK (mandante_id <> visitante_id),
    UNIQUE (temporada, rodada, mandante_id, visitante_id)
);

CREATE INDEX IF NOT EXISTS idx_jogos_temporada_rodada
    ON jogos (temporada, rodada);

