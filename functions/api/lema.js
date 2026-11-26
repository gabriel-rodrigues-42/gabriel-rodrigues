// /api/lema — votação anônima entre os dois lemas da página inicial.
//   GET  devolve a porcentagem de cada frase: { "ok": true, "pct": { "entrega": 62, "conversa": 38 } }
//   POST { "opcao": "entrega" | "conversa" } soma um voto e devolve o mesmo formato.
// Roda como Cloudflare Pages Function, com o D1 gabriel-rodrigues ligado como DB.
// As tabelas de db/votos_lema.sql são criadas aqui se ainda não existem. Mudou uma? Mude as duas.
//
// Privacidade (LGPD): o voto não é ligado a ninguém. Guardo só a contagem de cada frase.
// Um voto por aparelho fica a cargo do navegador (localStorage, ver index.html).
// Para frear robô, conto quantos votos cada rede manda por dia, pela chave SHA-256(sal do dia + IP).
// O IP não é gravado e o sal de cada dia é apagado no dia seguinte, junto com as chaves.
// O limite é alto porque no Brasil muita gente divide o mesmo IP na rede do celular.
// O total de votos não sai daqui, só a porcentagem.

const OPCOES = ["entrega", "conversa"];
const LIMITE_POR_REDE = 30;

const CRIAR = [
  "CREATE TABLE IF NOT EXISTS votos_lema (opcao TEXT PRIMARY KEY, total INTEGER NOT NULL DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS votos_lema_limite (chave TEXT PRIMARY KEY, dia TEXT NOT NULL, usados INTEGER NOT NULL)",
  "CREATE TABLE IF NOT EXISTS votos_lema_sal (dia TEXT PRIMARY KEY, sal TEXT NOT NULL)",
];

function responder(corpo, status = 200, cache = "no-store") {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}

// Porcentagens inteiras que somam 100 (a maior sobra vai para quem tem mais votos).
function porcentagens(linhas) {
  const votos = Object.fromEntries(OPCOES.map((o) => [o, 0]));
  for (const l of linhas || []) if (l.opcao in votos) votos[l.opcao] = Number(l.total) || 0;
  const total = OPCOES.reduce((s, o) => s + votos[o], 0);
  if (!total) return Object.fromEntries(OPCOES.map((o) => [o, 0]));
  const pct = Object.fromEntries(OPCOES.map((o) => [o, Math.floor((votos[o] * 100) / total)]));
  const sobra = 100 - OPCOES.reduce((s, o) => s + pct[o], 0);
  const maior = OPCOES.reduce((a, b) => ((votos[b] * 100) % total > (votos[a] * 100) % total ? b : a));
  pct[maior] += sobra;
  return pct;
}

const LER = "SELECT opcao, total FROM votos_lema";

async function hash(texto) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function salNovo() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet({ env }) {
  if (!env.DB) return responder({ ok: false, erro: "A votação ainda está sendo ligada." }, 503);
  try {
    const { results } = await env.DB.prepare(LER).all();
    return responder({ ok: true, pct: porcentagens(results) }, 200, "public, max-age=30");
  } catch {
    // Tabela ainda não existe: ninguém votou.
    return responder({ ok: true, pct: porcentagens([]) }, 200, "public, max-age=30");
  }
}

export async function onRequestPost({ request, env }) {
  const tipo = request.headers.get("Content-Type") || "";
  const json = tipo.includes("application/json");
  let dados;
  try {
    dados = json ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return responder({ ok: false, erro: "Não entendi o voto." }, 400);
  }
  const opcao = String(dados.opcao || "");
  const idioma = dados.idioma === "en" ? "en" : "pt";
  if (!OPCOES.includes(opcao)) return responder({ ok: false, erro: "Escolha uma das duas frases." }, 400);
  if (!env.DB) return responder({ ok: false, erro: "A votação ainda está sendo ligada." }, 503);

  const db = env.DB;
  const dia = new Date().toISOString().slice(0, 10);
  let pct;
  try {
    await db.batch([
      ...CRIAR.map((sql) => db.prepare(sql)),
      // Limpeza do dia anterior: sem o sal antigo, as chaves antigas não dizem mais nada.
      db.prepare("DELETE FROM votos_lema_sal WHERE dia <> ?1").bind(dia),
      db.prepare("DELETE FROM votos_lema_limite WHERE dia <> ?1").bind(dia),
      db.prepare("INSERT OR IGNORE INTO votos_lema_sal (dia, sal) VALUES (?1, ?2)").bind(dia, salNovo()),
    ]);
    const { sal } = await db.prepare("SELECT sal FROM votos_lema_sal WHERE dia = ?1").bind(dia).first();
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const chave = await hash(sal + "|" + ip);
    const linha = await db
      .prepare(
        `INSERT INTO votos_lema_limite (chave, dia, usados) VALUES (?1, ?2, 1)
         ON CONFLICT(chave) DO UPDATE SET usados = usados + 1 RETURNING usados`
      )
      .bind(chave, dia)
      .first();
    if ((linha?.usados ?? 0) > LIMITE_POR_REDE) {
      return responder({ ok: false, erro: "Recebi votos demais desta rede hoje. Tente amanhã." }, 429);
    }
    const [, lidos] = await db.batch([
      db
        .prepare("INSERT INTO votos_lema (opcao, total) VALUES (?1, 1) ON CONFLICT(opcao) DO UPDATE SET total = total + 1")
        .bind(opcao),
      db.prepare(LER),
    ]);
    pct = porcentagens(lidos.results);
  } catch (erro) {
    console.error("lema: falha ao gravar no D1:", erro?.message || erro);
    return responder({ ok: false, erro: "Não consegui guardar o voto agora. Tente de novo mais tarde." }, 500);
  }

  // Sem JavaScript o formulário chega como form-urlencoded: volta para a página, no idioma de origem.
  if (!json) {
    const pagina = idioma === "en" ? "/en/" : "/";
    return Response.redirect(new URL(`${pagina}?lema=${opcao}#lema`, request.url).toString(), 303);
  }
  return responder({ ok: true, pct });
}

export function onRequest() {
  return new Response("Use GET ou POST.", { status: 405, headers: { Allow: "GET, POST" } });
}
