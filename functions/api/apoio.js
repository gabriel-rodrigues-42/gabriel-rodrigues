// POST /api/apoio — guarda o apoio de quem acredita que o Gabriel deve tentar.
// Roda como Cloudflare Pages Function. Precisa do banco D1 gabriel-rodrigues ligado ao projeto
// com o nome DB (Pages > Settings > Bindings). A tabela de db/apoios.sql é criada aqui mesmo
// se ainda não existir, então não precisa rodar o SQL à mão. Mudou a tabela? Mude os dois.
// Guarda só o necessário (LGPD, art. 6º, III): email, nome, cidade, UF e quando a pessoa consentiu.
// Não guarda CPF, telefone nem IP.

const VERSAO_PRIVACIDADE = "2026-11-28";
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

// Só um número: quantos envios o formulário já recebeu (o "Apoio nº" do cartão). Sem dado de ninguém.
const CRIAR_NUMERO = `CREATE TABLE IF NOT EXISTS apoios_numero (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  ultimo INTEGER NOT NULL
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
    // Tudo numa transação só (o batch do D1): cria as tabelas se faltarem, grava o apoio e
    // pega o número do cartão.
    //
    // Duas contas diferentes, de propósito:
    //
    // 1. O número do cartão "Apoio nº" é o número do ENVIO, não o da pessoa. Cada envio do
    //    formulário ganha o próximo número de apoios_numero, e esse número nunca volta para a
    //    fila. Dois cartões nunca mostram o mesmo número.
    //    Quem reenvia o mesmo email ganha um número novo, como qualquer pessoa. Isso é de
    //    propósito: se o reenvio devolvesse o número antigo (ou "você já apoiou"), qualquer um
    //    poderia digitar o email de outra pessoa e descobrir se ela apoia o Gabriel. Apoio
    //    político é dado sensível (LGPD, art. 5º, II). Por isso a resposta é igual para email
    //    novo e repetido, e o número do cartão pode passar do número de pessoas reais.
    //
    // 2. A contagem oficial é a de emails únicos: a tabela apoios tem o email como chave, então
    //    cada email aparece uma vez só, por mais que seja enviado. O reenvio só atualiza nome,
    //    cidade, UF e o consentimento, e mantém o lugar original da pessoa na ordem (rowid).
    //    O contador público (/api/apoios, "Mais de 1.000 pessoas") e qualquer número que o
    //    Gabriel divulgue vêm de SELECT COUNT(*) FROM apoios, nunca de apoios_numero.
    const resultados = await env.DB.batch([
      env.DB.prepare(CRIAR_TABELA),
      env.DB.prepare(CRIAR_NUMERO),
      // Na primeira vez, o contador começa do total de hoje, para não repetir números já mostrados.
      env.DB.prepare("INSERT OR IGNORE INTO apoios_numero (id, ultimo) SELECT 1, COUNT(*) FROM apoios"),
      env.DB.prepare(
        `INSERT INTO apoios (email, nome, cidade, uf, consentido_em, versao_privacidade)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(email) DO UPDATE SET
           nome = excluded.nome, cidade = excluded.cidade, uf = excluded.uf,
           consentido_em = excluded.consentido_em, versao_privacidade = excluded.versao_privacidade`
      ).bind(email, nome || null, cidade || null, uf || null, new Date().toISOString(), VERSAO_PRIVACIDADE),
      env.DB.prepare("UPDATE apoios_numero SET ultimo = ultimo + 1 WHERE id = 1 RETURNING ultimo"),
    ]);
    posicao = resultados.at(-1)?.results?.[0]?.ultimo ?? null;
  } catch (erro) {
    // Aparece em Workers & Pages > gabriel-rodrigues > Functions > Real-time logs (sem dados da pessoa).
    console.error("apoio: falha ao gravar no D1:", erro?.message || erro);
    return responder(request, 500, { ok: false, erro: "Não consegui guardar agora. Tente de novo em alguns minutos." });
  }

  // Só o número deste envio, para a pessoa guardar ("Apoio nº 9"). Nenhum dado de outra pessoa sai daqui.
  return responder(request, 200, { ok: true, posicao }, idioma);
}

export function onRequest() {
  return new Response("Use POST.", { status: 405, headers: { Allow: "POST" } });
}
