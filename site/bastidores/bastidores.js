// Bastidores: mostra, só para leitura, os blocos de fala e os roteiros do estúdio de vídeo (videos/estudio/).
// Não é segredo. A "senha" é 42 e está aqui no código de propósito: o aviso existe só para
// quem chegou por engano não achar que esta é a parte principal do site.
// Os dados vêm de estudio.json, gerado por scripts/bastidores/juntar.py no deploy.
// Textos nos dois idiomas em T; o idioma vem do lang da página. As falas ficam em português.

(function () {
  "use strict";

  const EN = /^en\b/i.test(document.documentElement.lang);
  const SENHA = "42";
  const REPO = "https://github.com/gabriel-rodrigues-42/gabriel-rodrigues";

  const T = EN ? {
    erradas: [
      "That's not it. Hint: it's a number.",
      "Close. It's a two-digit number.",
      "Fine, I'll tell you: it's 42.",
    ],
    obvias: "That's the first password everyone tries. Not this one.",
    revelar: "It's 42. I told you it wasn't a secret.",
    url: {
      admin: "You typed /admin. There's no admin panel here, but there is a backstage.",
      "wp-admin": "This isn't WordPress. It's handwritten HTML, no panel at all.",
      senhaUrl: "Password in the address bar. Creative. Come on in.",
      outro: "Playing with the address? Fair enough. Nothing is hidden: the door was already open.",
    },
    devtools: "Skipped the password with DevTools? It works. But the password was just 42.",
    console: [
      "Hey, you opened the console.",
      "No need: the password is 42 and it's right there in the code.",
      "Found a real bug? Open an issue: " + REPO + "/issues",
    ],
    consoleSenha: "The password is 42. You didn't even need to ask.",
    consoleAdmin: "There's no admin. There's a backstage.",
    consoleHack: "Hacking a static page? The code is open on GitHub, it's faster.",
    carregando: "Loading…",
    semDados: "The lines file isn't here. To build it locally, run python3 scripts/bastidores/juntar.py.",
    todos: "All",
    fala: "Line",
    animacao: "Animation",
    formatos: { h: "Horizontal (YouTube)", v: "Vertical (Shorts)" },
    pagina: "Page",
    lugares: "Where to record",
    usadoEm: "Used in",
    nenhumRoteiro: "No video yet",
    segundos: (s) => `${s} s`,
    nBlocos: (n) => `${n} blocks`,
    e: " and ",
    fonte: "Source",
    trava: (n, t) => `Gets stuck at step ${n}: ${t}`,
    vinheta: "Opening",
    telaFinal: "End screen",
    fraseNaTela: "On screen",
    faltando: (id) => `Block "${id}" is missing from the library.`,
    total: (b, r) => `${b} blocks and ${r} video scripts.`,
  } : {
    erradas: [
      "Não é essa. Dica: é um número.",
      "Quase. É um número de dois dígitos.",
      "Tá bom, eu conto: é 42.",
    ],
    obvias: "Essa é a primeira senha que todo mundo tenta. Não é ela.",
    revelar: "É 42. Eu avisei que não era segredo.",
    url: {
      admin: "Você digitou /admin. Não tem painel de administrador aqui, mas tem os bastidores.",
      "wp-admin": "Isto aqui não é WordPress. É HTML escrito à mão, sem painel nenhum.",
      senhaUrl: "Senha pela barra de endereço. Criativo. Pode entrar.",
      outro: "Mexendo no endereço? Justo. Não tem nada escondido: a porta já estava aberta.",
    },
    devtools: "Pulou a senha pelo DevTools? Funciona. Mas a senha era só 42.",
    console: [
      "Opa, abriu o console.",
      "Não precisa: a senha é 42 e está no código.",
      "Achou um erro de verdade? Abre uma issue: " + REPO + "/issues",
    ],
    consoleSenha: "A senha é 42. Nem precisava perguntar.",
    consoleAdmin: "Não tem admin. Tem bastidores.",
    consoleHack: "Hackear uma página estática? O código está aberto no GitHub, é mais rápido.",
    carregando: "Carregando…",
    semDados: "O arquivo das falas não está aqui. Para gerar no computador, rode python3 scripts/bastidores/juntar.py.",
    todos: "Todos",
    fala: "Fala",
    animacao: "Animação",
    formatos: { h: "Horizontal (YouTube)", v: "Vertical (Shorts)" },
    pagina: "Página",
    lugares: "Onde gravar",
    usadoEm: "Usado em",
    nenhumRoteiro: "Ainda em nenhum vídeo",
    segundos: (s) => `${String(s).replace(".", ",")} s`,
    nBlocos: (n) => `${n} blocos`,
    e: " e ",
    fonte: "Fonte",
    trava: (n, t) => `Trava na etapa ${n}: ${t}`,
    vinheta: "Vinheta",
    telaFinal: "Tela final",
    fraseNaTela: "Na tela",
    faltando: (id) => `O bloco "${id}" não está na biblioteca.`,
    total: (b, r) => `${b} blocos e ${r} roteiros.`,
  };

  const $ = (s) => document.querySelector(s);

  // Cria um elemento com classe e texto. Texto sempre por textContent, nunca por innerHTML.
  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function lembrar() { try { sessionStorage.setItem("bastidores", "1"); } catch (_) {} }
  function lembrado() { try { return sessionStorage.getItem("bastidores") === "1"; } catch (_) { return false; } }

  function aviso(texto) {
    const caixa = $("#piada");
    caixa.textContent = texto;
    caixa.hidden = false;
  }

  let aberto = false;

  // focar: só depois de um clique da pessoa, para a página não pular sozinha ao abrir.
  function mostrar(etapa, focar) {
    for (const id of ["aviso", "senha", "conteudo"]) $("#" + id).hidden = id !== etapa;
    if (!focar) return;
    const foco = etapa === "senha" ? $("#campo-senha") : $("#" + etapa + " h1, #" + etapa + " h2");
    if (foco) foco.focus();
  }

  function abrir(focar) {
    if (aberto) return;
    aberto = true;
    lembrar();
    mostrar("conteudo", focar);
    carregar();
  }

  // ---------- 1. Aviso e senha ----------

  let tentativas = 0;
  function conferir(evento) {
    evento.preventDefault();
    const valor = $("#campo-senha").value.trim();
    const resposta = $("#resposta-senha");
    if (valor === SENHA) { abrir(true); return; }
    if (/^(admin|senha|password|123456?|1234|qwerty|root|abc123)$/i.test(valor)) {
      resposta.textContent = T.obvias;
    } else {
      resposta.textContent = T.erradas[Math.min(tentativas, T.erradas.length - 1)];
      tentativas++;
    }
  }

  // ---------- 2. Brincadeiras para quem mexe na URL, no console ou no DevTools ----------

  function lerUrl() {
    const p = new URLSearchParams(location.search);
    const de = p.get("de");
    const senhaUrl = p.get("senha") || p.get("password") || p.get("pass");
    const chaves = [...p.keys()].filter((k) => !/^utm_|^fbclid$|^gclid$/.test(k));
    let texto = null;
    if (de && T.url[de]) texto = T.url[de];
    else if (senhaUrl === SENHA) texto = T.url.senhaUrl;
    else if (chaves.length) texto = T.url.outro;
    if (chaves.length) history.replaceState(null, "", location.pathname + location.hash);
    if (texto) aviso(texto);
    return senhaUrl === SENHA;
  }

  function console_() {
    // A cor vem de tokens.css, como no resto do site.
    const azul = getComputedStyle(document.documentElement).getPropertyValue("--azul").trim();
    const estilo = `font: 700 16px system-ui, sans-serif; color: ${azul};`;
    console.log("%c" + T.console.join("\n"), estilo);
    // Digitou senha, admin ou hack no console? Responde.
    const respostas = { senha: [T.consoleSenha, 42], password: [T.consoleSenha, 42], admin: [T.consoleAdmin, "bastidores"], hack: [T.consoleHack, REPO] };
    for (const [nome, [texto, valor]] of Object.entries(respostas)) {
      // Só pula o que o próprio window já tem (o id="senha" da página não conta).
      if (Object.prototype.hasOwnProperty.call(window, nome)) continue;
      try {
        Object.defineProperty(window, nome, { configurable: true, get() { console.log("%c" + texto, estilo); return valor; } });
      } catch (_) {}
    }
  }

  // Alguém tirou o hidden do conteúdo pelo DevTools sem passar pela senha.
  function vigiarDevtools() {
    const alvo = $("#conteudo");
    new MutationObserver(() => {
      if (!alvo.hidden && !aberto) { aviso(T.devtools); abrir(); }
    }).observe(alvo, { attributes: true, attributeFilter: ["hidden"] });
  }

  // ---------- 3. Conteúdo ----------

  function descreverAnimacao(a) {
    if (!a) return "";
    const fonte = a.fonte ? ` ${T.fonte}: ${a.fonte}.` : "";
    switch (a.modelo) {
      case "titulo": return `${T.vinheta}: “${a.titulo}”. ${a.subtitulo || ""}`.trim();
      case "fim": return `${T.telaFinal}: ${a.titulo}. ${a.subtitulo || ""}`.trim();
      case "frase": return `${T.fraseNaTela}: “${a.frase}”`;
      case "numero": return `${a.valor} ${a.texto}.${fonte}`;
      case "fluxo": {
        const etapas = (a.etapas || []).map((e, i) => `${i + 1}. ${e}`).join("; ");
        const trava = a.trava ? ` ${T.trava(a.trava, a.texto_trava || "")}.` : "";
        return `${a.titulo}: ${etapas}.${trava}${fonte}`;
      }
      case "comparar": {
        const itens = (a.itens || []).map((i) => `${i.nome}, ${i.rotulo || i.valor}`).join("; ");
        return `${a.titulo}: ${itens}.${fonte}`;
      }
      default: return Object.entries(a).filter(([k]) => k !== "modelo").map(([, v]) => (typeof v === "string" ? v : "")).filter(Boolean).join(". ");
    }
  }

  function textoDoBloco(b) { return b.tipo === "animacao" ? descreverAnimacao(b.animacao) : b.texto || ""; }

  function seloTipo(b) {
    return el("span", "selo " + (b.tipo === "animacao" ? "amarelo" : "azul"), b.tipo === "animacao" ? T.animacao : T.fala);
  }

  // As etiquetas de blocos.json não têm acento (são ids). Na tela, volta o acento das palavras comuns.
  const ACENTOS = { historia: "história", bordao: "bordão", transicao: "transição", cartorio: "cartório", politico: "político", reindustrializacao: "reindustrialização" };
  function etiqueta(t) { return t.split("-").map((p) => ACENTOS[p] || p).join(" "); }

  function montarRoteiros(dados, porId) {
    const lista = $("#lista-roteiros");
    lista.replaceChildren();
    for (const r of dados.roteiros) {
      const item = el("details", "roteiro cartao");
      const resumo = el("summary");
      resumo.append(el("strong", null, r.titulo));
      const meta = el("span", "meta", [(r.formatos || []).map((f) => T.formatos[f] || f).join(T.e), T.nBlocos((r.blocos || []).length)].filter(Boolean).join(" · "));
      resumo.append(meta);
      item.append(resumo);
      if (r.pagina) {
        const p = el("p", "meta");
        const a = el("a", null, r.pagina);
        a.href = (EN ? "/en" : "") + r.pagina;
        p.append(T.pagina + ": ", a);
        item.append(p);
      }
      const ol = el("ol", "passos");
      for (const id of r.blocos || []) {
        const b = porId.get(id);
        const li = el("li");
        if (!b) { li.append(el("p", "meta", T.faltando(id))); ol.append(li); continue; }
        const topo = el("div", "passo-topo");
        topo.append(seloTipo(b), el("span", "passo-titulo", b.titulo));
        if (b.duracao) topo.append(el("span", "meta", T.segundos(b.duracao)));
        li.append(topo, el("p", b.tipo === "fala" ? "fala" : "descricao", textoDoBloco(b)));
        li.lang = "pt-BR";
        ol.append(li);
      }
      item.append(ol);
      lista.append(item);
    }
  }

  function montarBlocos(dados) {
    const lugares = new Map((dados.lugares || []).map((l) => [l.id, l.nome]));
    const usos = new Map();
    for (const r of dados.roteiros) for (const id of r.blocos || []) {
      if (!usos.has(id)) usos.set(id, []);
      if (!usos.get(id).includes(r.titulo)) usos.get(id).push(r.titulo);
    }

    const tags = [...new Set(dados.blocos.flatMap((b) => b.tags || []))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const filtros = $("#filtros");
    filtros.replaceChildren();
    let ativo = null;

    const lista = $("#lista-blocos");
    const cartoes = [];
    lista.replaceChildren();
    for (const b of dados.blocos) {
      const c = el("article", "bloco cartao");
      c.dataset.tags = (b.tags || []).join(" ");
      const topo = el("div", "passo-topo");
      topo.append(seloTipo(b));
      if (b.duracao) topo.append(el("span", "meta", T.segundos(b.duracao)));
      c.append(topo, el("h3", null, b.titulo));
      c.lang = "pt-BR";
      const corpo = el("p", b.tipo === "fala" ? "fala" : "descricao", textoDoBloco(b));
      c.append(corpo);
      const dl = el("dl", "detalhes");
      const linha = (rotulo, valor) => { if (!valor) return; dl.append(el("dt", null, rotulo), el("dd", null, valor)); };
      linha(T.lugares, (b.lugares || []).map((l) => lugares.get(l) || l).join(", "));
      linha(T.usadoEm, (usos.get(b.id) || []).join("; ") || T.nenhumRoteiro);
      for (const d of dl.querySelectorAll("dt")) d.lang = EN ? "en" : "pt-BR";
      c.append(dl);
      const tg = el("p", "tags");
      for (const t of b.tags || []) tg.append(el("span", "tag", "#" + etiqueta(t)));
      c.append(tg);
      lista.append(c);
      cartoes.push(c);
    }

    function filtrar(tag) {
      ativo = tag;
      for (const botao of filtros.children) botao.setAttribute("aria-pressed", String((botao.dataset.tag || null) === tag));
      for (const c of cartoes) c.hidden = tag !== null && !c.dataset.tags.split(" ").includes(tag);
    }

    const todos = el("button", "filtro", T.todos);
    todos.type = "button";
    todos.addEventListener("click", () => filtrar(null));
    filtros.append(todos);
    for (const t of tags) {
      const botao = el("button", "filtro", "#" + etiqueta(t));
      botao.type = "button";
      botao.dataset.tag = t;
      botao.lang = "pt-BR";
      botao.addEventListener("click", () => filtrar(ativo === t ? null : t));
      filtros.append(botao);
    }
    filtrar(null);
  }

  async function carregar() {
    const status = $("#status");
    status.textContent = T.carregando;
    try {
      const r = await fetch("/bastidores/estudio.json", { cache: "no-cache" });
      if (!r.ok) throw new Error(r.status);
      const dados = await r.json();
      const porId = new Map(dados.blocos.map((b) => [b.id, b]));
      montarRoteiros(dados, porId);
      montarBlocos(dados);
      $("#contagem-roteiros").textContent = dados.roteiros.length;
      $("#contagem-blocos").textContent = dados.blocos.length;
      status.textContent = T.total(dados.blocos.length, dados.roteiros.length);
    } catch (_) {
      status.textContent = T.semDados;
    }
  }

  // ---------- Início ----------

  function iniciar() {
    console_();
    vigiarDevtools();
    $("#sem-js").hidden = true;
    $("#botao-certeza").addEventListener("click", () => mostrar("senha", true));
    $("#form-senha").addEventListener("submit", conferir);
    $("#botao-revelar").addEventListener("click", () => {
      $("#resposta-senha").textContent = T.revelar;
      $("#campo-senha").value = SENHA;
      $("#campo-senha").focus();
    });
    const senhaNaUrl = lerUrl();
    if (senhaNaUrl || lembrado()) abrir(false);
    else mostrar("aviso", false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
