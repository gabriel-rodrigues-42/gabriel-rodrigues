// POST /api/apoio — guarda o apoio de quem acredita que o Gabriel deve tentar.
// Roda como Cloudflare Pages Function. Precisa de um banco D1 ligado ao projeto com o nome DB
// (Pages > Settings > Bindings) e da tabela de db/apoios.sql.
// Guarda só o necessário (LGPD, art. 6º, III): email, nome, cidade, UF e quando a pessoa consentiu.
// Não guarda CPF, telefone nem IP.

const VERSAO_PRIVACIDADE = "2026-11-19";
const UFS = new Set("AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO EX".split(" "));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function responder(request, status, corpo) {
  const tipo = request.headers.get("Content-Type") || "";
  // Sem JavaScript o formulário chega como form-urlencoded: volta para a página.
  if (!tipo.includes("application/json") && status === 200) {
    return Response.redirect(new URL("/?apoio=ok#apoiar", request.url).toString(), 303);
  }
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

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
  if (limpar(dados.site, 200)) return responder(request, 200, { ok: true });

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

  await env.DB.prepare(
    `INSERT INTO apoios (email, nome, cidade, uf, consentido_em, versao_privacidade)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(email) DO UPDATE SET
       nome = excluded.nome, cidade = excluded.cidade, uf = excluded.uf,
       consentido_em = excluded.consentido_em, versao_privacidade = excluded.versao_privacidade`
  ).bind(email, nome || null, cidade || null, uf || null, new Date().toISOString(), VERSAO_PRIVACIDADE).run();

  return responder(request, 200, { ok: true });
}

export function onRequest() {
  return new Response("Use POST.", { status: 405, headers: { Allow: "POST" } });
}
