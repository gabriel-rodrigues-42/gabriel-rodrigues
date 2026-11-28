// /api/propostas — apoio anônimo às propostas, com um toque (componente <gr-apoiar>).
//   GET  devolve quantos apoios cada proposta tem: { "ok": true, "apoios": { "reindustrializacao": 12, ... } }
//        É o que a página /projetos/ usa para mostrar primeiro as mais apoiadas.
//   POST { "proposta": "reindustrializacao" } soma um apoio e devolve { "ok": true, "total": 13 }.
// Roda como Cloudflare Pages Function, com o D1 gabriel-rodrigues ligado como DB.
// As tabelas de db/apoios_propostas.sql são criadas aqui se ainda não existem. Mudou uma? Mude as duas.
//
// Privacidade (LGPD): apoio político é dado sensível, então o apoio não é ligado a ninguém.
// Guardo só a contagem de cada proposta. Nada de nome, email, IP ou lista de quem apoiou.
// Um apoio por aparelho fica a cargo do navegador (localStorage, ver design-system/apoiar.js).
// Para frear robô, conto quantos apoios cada rede manda por dia, pela chave SHA-256(sal do dia + IP),
// como na votação do lema (lema.js). O IP não é gravado e o sal de cada dia é apagado no dia seguinte.
// O limite é alto porque no Brasil muita gente divide o mesmo IP na rede do celular.
//
// Só vale proposta que está em /projetos/propostas.js (o id é o trecho do href depois de /projetos/).

const LIMITE_POR_REDE = 60;

const CRIAR = [
  "CREATE TABLE IF NOT EXISTS apoios_propostas (proposta TEXT PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS apoios_propostas_limite (chave TEXT PRIMARY KEY, dia TEXT NOT NULL, usados INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS apoios_propostas_sal (dia TEXT PRIMARY KEY, sal TEXT NOT NULL)",
];

function responder(corpo, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}

async function hash(texto) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function salNovo() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// As propostas que existem, lidas do próprio site (propostas.js), para ninguém criar linha com nome inventado.
let conhecidas = null;
async function propostasDoSite(env, request) {
  if (conhecidas) return conhecidas;
  try {
    const url = new URL("/projetos/propostas.js", request.url);
    const resp = env.ASSETS ? await env.ASSETS.fetch(url) : await fetch(url);
    const texto = resp.ok ? await resp.text() : "";
    const ids = [...texto.matchAll(/href:\s*"\/projetos\/([a-z0-9-]+)\/"/g)].map((m) => m[1]);
    if (ids.length) conhecidas = new Set(ids);
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function contagem(linhas) {
  const apoios = {};
  for (const l of linhas || []) apoios[l.proposta] = Number(l.total) || 0;
  return apoios;
}

export async function onRequestGet({ env }) {
  if (!env.DB) return responder({ ok: false, erro: "O apoio às propostas ainda está sendo ligado." }, 503);
  try {
    const { results } = await env.DB.prepare("SELECT proposta, total FROM apoios_propostas").all();
    return responder({ ok: true, apoios: contagem(results) }, 200, "public, max-age=60");
  } catch {
    // Tabela ainda não existe: ninguém apoiou.
    return responder({ ok: true, apoios: {} }, 200, "public, max-age=60");
  }
}

export async function onRequestPost({ request, env }) {
  const tipo = request.headers.get("Content-Type") || "";
  const json = tipo.includes("application/json");
  let dados;
  try {
    dados = json ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return responder({ ok: false, erro: "Não entendi o apoio." }, 400);
  }
  const proposta = String(dados.proposta || "");
  const idioma = dados.idioma === "en" ? "en" : "pt";
  if (!/^[a-z0-9-]{2,60}$/.test(proposta) || !(await propostasDoSite(env, request)).has(proposta)) {
    return responder({ ok: false, erro: "Não achei essa proposta." }, 400);
  }
  if (!env.DB) return responder({ ok: false, erro: "O apoio às propostas ainda está sendo ligado." }, 503);

  const db = env.DB;
  const dia = new Date().toISOString().slice(0, 10);
  let total;
  try {
    await db.batch([
      ...CRIAR.map((sql) => db.prepare(sql)),
      // Limpeza do dia anterior: sem o sal antigo, as chaves antigas não dizem mais nada.
      db.prepare("DELETE FROM apoios_propostas_sal WHERE dia <> ?1").bind(dia),
      db.prepare("DELETE FROM apoios_propostas_limite WHERE dia <> ?1").bind(dia),
      db.prepare("INSERT OR IGNORE INTO apoios_propostas_sal (dia, sal) VALUES (?1, ?2)").bind(dia, salNovo()),
    ]);
    const { sal } = await db.prepare("SELECT sal FROM apoios_propostas_sal WHERE dia = ?1").bind(dia).first();
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const chave = await hash(sal + "|" + ip);
    const linha = await db
      .prepare(
        `INSERT INTO apoios_propostas_limite (chave, dia, usados) VALUES (?1, ?2, 1)
         ON CONFLICT(chave) DO UPDATE SET usados = usados + 1 RETURNING usados`
      )
      .bind(chave, dia)
      .first();
    if ((linha?.usados ?? 0) > LIMITE_POR_REDE) {
      return responder({ ok: false, erro: "Recebi apoios demais desta rede hoje. Tente amanhã." }, 429);
    }
    const lida = await db
      .prepare(
        `INSERT INTO apoios_propostas (proposta, total) VALUES (?1, 1)
         ON CONFLICT(proposta) DO UPDATE SET total = total + 1 RETURNING total`
      )
      .bind(proposta)
      .first();
    total = Number(lida?.total) || 1;
  } catch (erro) {
    console.error("propostas: falha ao gravar no D1:", erro?.message || erro);
    return responder({ ok: false, erro: "Não consegui guardar o apoio agora. Tente de novo mais tarde." }, 500);
  }

  // Sem JavaScript o formulário chega como form-urlencoded: volta para a proposta, no idioma de origem.
  if (!json) {
    const pagina = (idioma === "en" ? "/en" : "") + `/projetos/${proposta}/`;
    return Response.redirect(new URL(`${pagina}?apoiou=1#apoiar-proposta`, request.url).toString(), 303);
  }
  return responder({ ok: true, total });
}

export function onRequest() {
  return new Response("Use GET ou POST.", { status: 405, headers: { Allow: "GET, POST" } });
}
