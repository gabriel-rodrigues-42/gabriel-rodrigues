-- Votação "Ajude a escolher o meu lema" da página inicial (functions/api/lema.js).
-- O voto é anônimo: guardo só quantos votos cada frase tem. Nada de nome, email ou IP.
-- A função cria as tabelas sozinha no primeiro voto (CREATE TABLE IF NOT EXISTS).
-- Para criar antes: npx wrangler d1 execute gabriel-rodrigues --remote --file=db/votos_lema.sql
-- Mudou uma tabela? Mude aqui e em functions/api/lema.js.

-- A contagem: uma linha por frase.
CREATE TABLE IF NOT EXISTS votos_lema (
  opcao TEXT PRIMARY KEY,           -- "entrega" ou "conversa"
  total INTEGER NOT NULL DEFAULT 0
);

-- Freio contra robô: quantos votos cada rede mandou hoje.
-- A chave é um hash (SHA-256) do IP com o sal do dia. O IP nunca é gravado.
-- As linhas de dias anteriores são apagadas no primeiro voto do dia seguinte.
CREATE TABLE IF NOT EXISTS votos_lema_limite (
  chave  TEXT PRIMARY KEY,
  dia    TEXT NOT NULL,              -- AAAA-MM-DD (UTC)
  usados INTEGER NOT NULL
);

-- Um sal aleatório por dia. Quando o dia acaba, o sal é apagado e o hash não
-- pode mais ser ligado a um IP, nem por quem tem acesso ao banco.
CREATE TABLE IF NOT EXISTS votos_lema_sal (
  dia TEXT PRIMARY KEY,
  sal TEXT NOT NULL
);
