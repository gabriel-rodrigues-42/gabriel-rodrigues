// GET /api/apoios — quantas pessoas já mandaram o formulário "Acredita que eu devo tentar?".
// Lê só a contagem da tabela apoios (db/apoios.sql), nunca uma linha de alguém (LGPD).
// Devolve um número arredondado para baixo em centenas, e só quando passa de 1.000:
//   { "mostrar": true, "mais_de": 1200 }   ou   { "mostrar": false }
// O total exato não sai daqui. A página escreve "Mais de 1.200 pessoas…".
// Cache: a resposta fica 10 minutos no cache da Cloudflare e no navegador, então o D1
// é consultado no máximo algumas vezes por hora, por mais visitas que a página tenha.

const MINIMO = 1000;
const CACHE_SEGUNDOS = 600;

function responder(corpo, segundos) {
  return new Response(JSON.stringify(corpo), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${segundos}`,
    },
  });
}

// 1.050 vira 1.000; 1.200 vira 1.100 (para que "mais de" seja sempre verdade).
function arredondar(total) {
  const n = Math.floor((Number(total) - 1) / 100) * 100;
  return n >= MINIMO ? n : null;
}

export async function onRequestGet({ request, env, waitUntil }) {
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const chave = new Request(new URL("/api/apoios", request.url).toString());
  if (cache) {
    const guardada = await cache.match(chave);
    if (guardada) return guardada;
  }

  if (!env.DB) return responder({ mostrar: false }, 60);

  let total = 0;
  try {
    const linha = await env.DB.prepare("SELECT COUNT(*) AS total FROM apoios").first();
    total = linha?.total ?? 0;
  } catch (erro) {
    // Tabela ainda não existe (ninguém enviou) ou o banco falhou: só esconde a frase.
    console.error("apoios: falha ao contar no D1:", erro?.message || erro);
    return responder({ mostrar: false }, 60);
  }

  const maisDe = arredondar(total);
  const resposta = responder(maisDe ? { mostrar: true, mais_de: maisDe } : { mostrar: false }, CACHE_SEGUNDOS);
  if (cache) waitUntil(cache.put(chave, resposta.clone()));
  return resposta;
}

export function onRequest() {
  return new Response("Use GET.", { status: 405, headers: { Allow: "GET" } });
}
