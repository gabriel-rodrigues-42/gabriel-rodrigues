-- Tabela do formulário "Acredita que eu devo tentar?" (functions/api/apoio.js).
-- O banco D1 se chama gabriel-rodrigues e serve para o site todo: cada recurso novo ganha
-- a sua tabela e o seu arquivo em db/.
-- Rodar uma vez no console do D1 (Cloudflare > Storage & Databases > D1 > gabriel-rodrigues > Console)
-- ou: npx wrangler d1 execute gabriel-rodrigues --remote --file=db/apoios.sql
CREATE TABLE IF NOT EXISTS apoios (
  email              TEXT PRIMARY KEY,
  nome               TEXT,
  cidade             TEXT,
  uf                 TEXT,
  consentido_em      TEXT NOT NULL,  -- ISO 8601, prova do consentimento (LGPD, art. 8º, § 2º)
  versao_privacidade TEXT NOT NULL   -- qual texto de /privacidade/ a pessoa aceitou
);
