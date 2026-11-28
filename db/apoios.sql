-- Tabela do formulário "Acredita que eu devo tentar?" (functions/api/apoio.js).
-- O banco D1 se chama gabriel-rodrigues e serve para o site todo: cada recurso novo ganha
-- a sua tabela e o seu arquivo em db/.
-- A função functions/api/apoio.js cria esta tabela sozinha no primeiro envio (CREATE TABLE IF NOT EXISTS).
-- Se quiser criar antes, rode no console do D1 (Cloudflare > Storage & Databases > D1 > gabriel-rodrigues > Console)
-- ou: npx wrangler d1 execute gabriel-rodrigues --remote --file=db/apoios.sql
CREATE TABLE IF NOT EXISTS apoios (
  email              TEXT PRIMARY KEY,
  nome               TEXT,
  cidade             TEXT,
  uf                 TEXT,
  consentido_em      TEXT NOT NULL,  -- ISO 8601, prova do consentimento (LGPD, art. 8º, § 2º)
  versao_privacidade TEXT NOT NULL   -- qual texto de /privacidade/ a pessoa aceitou
);

-- Número do cartão "Apoio nº" (functions/api/apoio.js). Uma linha só, com o último número dado.
-- Cada envio do formulário soma 1, mesmo quando o email já está em apoios, e o número nunca
-- se repete. Não é a contagem de pessoas: reenviar o mesmo email gera um número novo, para a
-- resposta não revelar quem já apoiou (LGPD, art. 5º, II).
-- A contagem oficial é SELECT COUNT(*) FROM apoios (um email = um apoio).
CREATE TABLE IF NOT EXISTS apoios_numero (
  id     INTEGER PRIMARY KEY CHECK (id = 1),
  ultimo INTEGER NOT NULL
);
