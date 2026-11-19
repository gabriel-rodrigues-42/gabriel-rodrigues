-- Tabela do formulário "Acredita que eu devo tentar?" (functions/api/apoio.js).
-- Rodar uma vez no console do D1 (Cloudflare > Storage & Databases > D1 > apoios > Console)
-- ou: npx wrangler d1 execute apoios --remote --file=db/apoios.sql
CREATE TABLE IF NOT EXISTS apoios (
  email              TEXT PRIMARY KEY,
  nome               TEXT,
  cidade             TEXT,
  uf                 TEXT,
  consentido_em      TEXT NOT NULL,  -- ISO 8601, prova do consentimento (LGPD, art. 8º, § 2º)
  versao_privacidade TEXT NOT NULL   -- qual texto de /privacidade/ a pessoa aceitou
);
