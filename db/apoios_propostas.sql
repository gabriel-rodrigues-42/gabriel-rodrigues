-- Apoio às propostas com um toque (<gr-apoiar>, functions/api/propostas.js).
-- O apoio é anônimo: guardo só quantos apoios cada proposta tem. Nada de nome, email ou IP.
-- A função cria as tabelas sozinha no primeiro apoio (CREATE TABLE IF NOT EXISTS).
-- Para criar antes: npx wrangler d1 execute gabriel-rodrigues --remote --file=db/apoios_propostas.sql
-- Mudou uma tabela? Mude aqui e em functions/api/propostas.js.

-- A contagem: uma linha por proposta (o slug de /projetos/<slug>/, o mesmo em PT e EN).
CREATE TABLE IF NOT EXISTS apoios_propostas (
  proposta TEXT PRIMARY KEY,
  total    INTEGER NOT NULL DEFAULT 0
);

-- Freio contra robô: quantos apoios cada rede mandou hoje.
-- A chave é um hash (SHA-256) do IP com o sal do dia. O IP nunca é gravado.
-- As linhas de dias anteriores são apagadas no primeiro apoio do dia seguinte.
CREATE TABLE IF NOT EXISTS apoios_propostas_limite (
  chave  TEXT PRIMARY KEY,
  dia    TEXT NOT NULL,              -- AAAA-MM-DD (UTC)
  usados INTEGER NOT NULL
);

-- Um sal aleatório por dia. Quando o dia acaba, o sal é apagado e o hash não
-- pode mais ser ligado a um IP, nem por quem tem acesso ao banco.
CREATE TABLE IF NOT EXISTS apoios_propostas_sal (
  dia TEXT PRIMARY KEY,
  sal TEXT NOT NULL
);
