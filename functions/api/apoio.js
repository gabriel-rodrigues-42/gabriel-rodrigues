// POST /api/apoio — guarda o apoio de quem acredita que o Gabriel deve tentar.
// Roda como Cloudflare Pages Function. Precisa do banco D1 gabriel-rodrigues ligado ao projeto
// com o nome DB (Pages > Settings > Bindings). A tabela de db/apoios.sql é criada aqui mesmo
// se ainda não existir, então não precisa rodar o SQL à mão. Mudou a tabela? Mude os dois.
// Guarda só o necessário (LGPD, art. 6º, III): email, nome, cidade, UF e quando a pessoa consentiu.
// Não guarda CPF, telefone nem IP.

const VERSAO_PRIVACIDADE = "2026-11-27";
const UFS = new Set("AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO EX".split(" "));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function responder(request, status, corpo, idioma) {
  const tipo = request.headers.get("Content-Type") || "";
  // Sem JavaScript o formulário chega como form-urlencoded: volta para a página, no idioma de origem.
  if (!tipo.includes("application/json") && status === 200) {
    const pagina = idioma === "en" ? "/en/" : "/";
    return Response.redirect(new URL(pagina + "?apoio=ok#apoiar", request.url).toString(), 303);
  }
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

const CRIAR_TABELA = `CREATE TABLE IF NOT EXISTS apoios (
  email TEXT PRIMARY KEY,
  nome TEXT,
  cidade TEXT,
  uf TEXT,
  consentido_em TEXT NOT NULL,
  versao_privacidade TEXT NOT NULL
)`;

const limpar = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let dados;
  try {
    const tipo = request.headers.get("Content-Type") || "";
    dados = tipo.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return responder(request, 400, { ok: false, erro: "Não entendi o envio." });
  }

  // Armadilha para robôs: campo escondido que pessoas não preenchem.
  // A versão em inglês do formulário (/en/) manda idioma=en. Só serve para o redirecionamento; não é guardado.
  const idioma = dados.idioma === "en" ? "en" : "pt";
  if (limpar(dados.site, 200)) return responder(request, 200, { ok: true }, idioma);

  const email = limpar(dados.email, 254).toLowerCase();
  const nome = limpar(dados.nome, 80);
  const cidade = limpar(dados.cidade, 80);
  const uf = limpar(dados.uf, 2).toUpperCase();

  if (!EMAIL.test(email)) return responder(request, 400, { ok: false, erro: "Confira o email." });
  if (uf && !UFS.has(uf)) return responder(request, 400, { ok: false, erro: "Confira a UF." });
  if (dados.consentimento !== "sim") {
    return responder(request, 400, { ok: false, erro: "Marque a autorização para eu poder guardar seu email." });
  }

  if (!env.DB) return responder(request, 503, { ok: false, erro: "O formulário ainda está sendo ligado." });

  let posicao = null;
  try {
    // Cria a tabela (se ainda não existe), grava e conta, numa transação só.
    // Quem reenvia o mesmo email sai e entra de novo no fim da fila: o número devolvido é sempre
    // o total depois deste envio. Assim a resposta não revela se um email já estava na lista
    // (apoio político é dado sensível, LGPD art. 5º, II): quem testar o email de outra pessoa
    // só descobre o total, que já aparece na página a partir de 1.000.
    const resultados = await env.DB.batch([
      env.DB.prepare(CRIAR_TABELA),
      env.DB.prepare("DELETE FROM apoios WHERE email = ?1").bind(email),
      env.DB.prepare(
        `INSERT INTO apoios (email, nome, cidade, uf, consentido_em, versao_privacidade)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
      ).bind(email, nome || null, cidade || null, uf || null, new Date().toISOString(), VERSAO_PRIVACIDADE),
      env.DB.prepare("SELECT COUNT(*) AS total FROM apoios"),
    ]);
    posicao = resultados.at(-1)?.results?.[0]?.total ?? null;
  } catch (erro) {
    // Aparece em Workers & Pages > gabriel-rodrigues > Functions > Real-time logs (sem dados da pessoa).
    console.error("apoio: falha ao gravar no D1:", erro?.message || erro);
    return responder(request, 500, { ok: false, erro: "Não consegui guardar agora. Tente de novo em alguns minutos." });
  }

  // Só o número da própria pessoa, para ela guardar ("Apoio nº 1"). Nenhum dado de outra pessoa sai daqui.
  return responder(request, 200, { ok: true, posicao }, idioma);
}

export function onRequest() {
  return new Response("Use POST.", { status: 405, headers: { Allow: "POST" } });
}
