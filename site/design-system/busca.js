// Busca do site: a lupa do cabeçalho (e o "Buscar" da barra de baixo) abre esta tela.
// Carregado por moldura.js só quando a pessoa toca na lupa. Roda todo no navegador, sem servidor:
// lê /busca/indice-pt.json ou /busca/indice-en.json, gerados no deploy por scripts/busca/gerar_indice.py.
// API: window.GRBusca.abrir(). Os textos seguem o lang da página.

(function () {
  "use strict";
  if (window.GRBusca) return;

  const EN = /^en\b/i.test(document.documentElement.lang);
  const RAIZ = EN ? "/en/" : "/";
  const T = EN ? {
    rotulo: "Search the site",
    campo: "What are you looking for?",
    fechar: "Close",
    sugestoes: "Try",
    termos: ["floods", "notary", "cannabis", "industry", "car", "parties"],
    propostas: "Proposals",
    ferramentas: "Tools",
    nada: (q) => `Nothing found for “${q}”. Try another word or`,
    verTodas: "see all proposals",
    achou: (n) => n === 1 ? "1 result" : `${n} results`,
    secao: "Section",
    tipos: { proposta: "Proposal", ferramenta: "Tool", ideia: "Idea", pagina: "Page" },
    erro: "The search did not load. Check your connection and try again.",
    ferramentaDescricao: "Searches the pages of gabriel-rodrigues.com (proposals, tools and about) and lists the results.",
    termoDescricao: "Words to search for, in English",
  } : {
    rotulo: "Buscar no site",
    campo: "O que você procura?",
    fechar: "Fechar",
    sugestoes: "Experimente",
    termos: ["alagamento", "cartório", "cannabis", "indústria", "carro", "partidos"],
    propostas: "Propostas",
    ferramentas: "Ferramentas",
    nada: (q) => `Nada encontrado para “${q}”. Tente outra palavra ou`,
    verTodas: "veja todas as propostas",
    achou: (n) => n === 1 ? "1 resultado" : `${n} resultados`,
    secao: "Seção",
    tipos: { proposta: "Proposta", ferramenta: "Ferramenta", ideia: "Ideia", pagina: "Página" },
    erro: "A busca não carregou. Confira a internet e tente de novo.",
    ferramentaDescricao: "Busca nas páginas de gabriel-rodrigues.com (propostas, ferramentas e sobre) e lista os resultados.",
    termoDescricao: "Palavras para buscar, em português",
  };

  const LUPA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>';
  const ICONES = {
    proposta: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8.5 12h7M8.5 16h5"/>',
    ferramenta: '<circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4z"/>',
    ideia: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    pagina: '<path d="M6 3h12v18H6z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  };

  const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let indice = null;
  let carregando = null;
  function carregar() {
    if (indice) return Promise.resolve(indice);
    if (!carregando) {
      carregando = fetch(`/busca/indice-${EN ? "en" : "pt"}.json`)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((itens) => {
          indice = itens.map((it) => ({
            ...it,
            _t: sem(it.t), _d: sem(it.d || ""), _x: sem(it.x || ""),
            _s: (it.s || []).map(([h]) => sem(h)),
          }));
          return indice;
        })
        .catch((e) => { carregando = null; throw e; });
    }
    return carregando;
  }

  // Pontua cada página: todas as palavras precisam aparecer em algum lugar.
  // Título vale mais que seção, que vale mais que descrição, que vale mais que o texto.
  function buscar(q) {
    const palavras = sem(q).split(/[^a-z0-9$%,.]+/).map((p) => p.replace(/^[,.]+|[,.]+$/g, "")).filter((p) => p.length > 1 || /\d/.test(p));
    if (!palavras.length) return [];
    const achados = [];
    for (const it of indice) {
      let pontos = 0;
      let secao = -1;
      let ok = true;
      for (const p of palavras) {
        const inicio = new RegExp("(^|[^a-z0-9])" + p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        let pp = 0;
        if (it._t.includes(p)) pp += inicio.test(it._t) ? 12 : 6;
        const s = it._s.findIndex((h) => h.includes(p));
        if (s >= 0) { pp += 5; if (secao < 0) secao = s; }
        if (it._d.includes(p)) pp += 3;
        if (it._x.includes(p)) pp += inicio.test(it._x) ? 2 : 1;
        if (!pp) { ok = false; break; }
        pontos += pp;
      }
      if (!ok) continue;
      if (it.k === "proposta" || it.k === "ferramenta") pontos += 1;
      achados.push({ it, pontos, secao, palavras });
    }
    return achados.sort((a, b) => b.pontos - a.pontos).slice(0, 12);
  }

  // Trecho do texto em volta da primeira palavra achada, com as palavras marcadas.
  function trecho(texto, palavras) {
    if (!texto) return "";
    const base = sem(texto);
    let pos = -1;
    for (const p of palavras) { const i = base.indexOf(p); if (i >= 0 && (pos < 0 || i < pos)) pos = i; }
    let ini = 0, fim = Math.min(texto.length, 150);
    if (pos > 60) { ini = texto.lastIndexOf(" ", pos - 50) + 1; fim = Math.min(texto.length, ini + 150); }
    fim = fim < texto.length ? texto.lastIndexOf(" ", fim) : fim;
    return (ini > 0 ? "… " : "") + marcar(texto.slice(ini, fim), palavras) + (fim < texto.length ? " …" : "");
  }

  function marcar(texto, palavras) {
    const base = sem(texto);
    const marcas = [];
    for (const p of palavras) {
      let i = base.indexOf(p);
      while (i >= 0) { marcas.push([i, i + p.length]); i = base.indexOf(p, i + p.length); }
    }
    marcas.sort((a, b) => a[0] - b[0]);
    let saida = "", ult = 0;
    for (const [a, b] of marcas) {
      if (a < ult) continue;
      saida += esc(texto.slice(ult, a)) + "<mark>" + esc(texto.slice(a, b)) + "</mark>";
      ult = b;
    }
    return saida + esc(texto.slice(ult));
  }

  // Leva direto para a seção achada: pelo id do h2 ou, sem id, por fragmento de texto.
  function destino(it, secao) {
    if (secao < 0 || it.u.includes("#")) return it.u;
    const [titulo, id] = it.s[secao];
    return it.u + (id ? "#" + id : "#:~:text=" + encodeURIComponent(titulo));
  }

  function icone(it) {
    if (it.i) return `<img src="${esc(it.i)}" alt="" width="56" height="45" loading="lazy">`;
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONES[it.k] || ICONES.pagina}</svg>`;
  }

  function item(it, extra = "", href = it.u) {
    return `<li><a class="busca-item" href="${esc(href)}" data-tipo="${it.k}">
      <span class="busca-icone">${icone(it)}</span>
      <span class="busca-texto">
        <span class="busca-tipo">${T.tipos[it.k] || T.tipos.pagina}</span>
        <span class="busca-titulo">${extra ? marcar(it.t, extra.palavras) : esc(it.t)}</span>
        ${extra ? extra.html : ""}
      </span></a></li>`;
  }

  let dialogo, campo, corpo, aviso;

  function montar() {
    dialogo = document.createElement("dialog");
    dialogo.className = "busca";
    dialogo.setAttribute("aria-label", T.rotulo);
    dialogo.innerHTML = `
      <form class="busca-form" role="search" toolname="buscar_no_site" tooldescription="${esc(T.ferramentaDescricao)}">
        <label class="busca-campo">
          <span class="moldura-oculto">${T.rotulo}</span>
          ${LUPA}
          <input type="search" name="q" placeholder="${T.campo}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" toolparamdescription="${esc(T.termoDescricao)}">
        </label>
        <button type="button" class="busca-fechar" data-fechar>${T.fechar}</button>
      </form>
      <p class="moldura-oculto" aria-live="polite" data-aviso></p>
      <div class="busca-corpo" data-corpo></div>`;
    document.body.appendChild(dialogo);
    campo = dialogo.querySelector("input");
    corpo = dialogo.querySelector("[data-corpo]");
    aviso = dialogo.querySelector("[data-aviso]");

    let espera;
    campo.addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(desenhar, 80); });
    dialogo.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      const primeiro = corpo.querySelector(".busca-item");
      if (primeiro && campo.value.trim()) location.href = primeiro.href;
    });
    dialogo.addEventListener("click", (e) => {
      if (e.target === dialogo || e.target.closest("[data-fechar]")) { dialogo.close(); return; }
      const termo = e.target.closest("[data-termo]");
      if (termo) { campo.value = termo.dataset.termo; desenhar(); campo.focus(); return; }
      // Link para a página atual com # só rola: fecha a busca para mostrar.
      if (e.target.closest("a")) setTimeout(() => dialogo.open && dialogo.close(), 0);
    });
    dialogo.addEventListener("close", () => {
      document.documentElement.classList.remove("busca-aberta");
      document.dispatchEvent(new CustomEvent("gr-busca", { detail: { aberta: false } }));
    });
    // Setas para descer e subir pelos resultados.
    dialogo.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const itens = [campo, ...corpo.querySelectorAll(".busca-item")];
      const i = itens.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const prox = itens[Math.max(0, Math.min(itens.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))];
      prox.focus();
    });
  }

  function desenhar() {
    const q = campo.value.trim();
    if (!indice) {
      corpo.innerHTML = '<div class="busca-carregando" aria-hidden="true"><span></span><span></span><span></span></div>';
      carregar().then(desenhar, () => { corpo.innerHTML = `<p class="busca-vazio">${T.erro}</p>`; });
      return;
    }
    if (!q) { inicial(); aviso.textContent = ""; return; }
    const achados = buscar(q);
    aviso.textContent = T.achou(achados.length);
    if (!achados.length) {
      corpo.innerHTML = `<p class="busca-vazio">${esc(T.nada(q))} <a href="${RAIZ}projetos/">${T.verTodas}</a>.</p>`;
      return;
    }
    corpo.innerHTML = `<p class="busca-contagem">${T.achou(achados.length)}</p><ul class="busca-lista">${achados.map(({ it, secao, palavras }) => {
      const sec = secao >= 0 ? `<span class="busca-secao">${T.secao}: ${marcar(it.s[secao][0], palavras)}</span>` : "";
      const txt = trecho(it.x || it.d, palavras) || esc(it.d || "");
      return item(it, { palavras, html: sec + `<span class="busca-trecho">${txt}</span>` }, destino(it, secao));
    }).join("")}</ul>`;
  }

  function inicial() {
    const propostas = indice.filter((it) => it.k === "proposta");
    const ferramentas = indice.filter((it) => it.k === "ferramenta");
    corpo.innerHTML = `
      <p class="busca-subtitulo">${T.sugestoes}</p>
      <div class="busca-termos">${T.termos.map((t) => `<button type="button" data-termo="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      <p class="busca-subtitulo">${T.propostas}</p>
      <ul class="busca-lista busca-lista-curta">${propostas.map((it) => item(it)).join("")}</ul>
      <p class="busca-subtitulo">${T.ferramentas}</p>
      <ul class="busca-lista busca-lista-curta">${ferramentas.map((it) => item(it)).join("")}</ul>`;
  }

  function abrir(textoInicial) {
    if (!dialogo) montar();
    if (typeof textoInicial === "string") campo.value = textoInicial;
    document.documentElement.classList.add("busca-aberta");
    dialogo.showModal();
    document.dispatchEvent(new CustomEvent("gr-busca", { detail: { aberta: true } }));
    desenhar();
    campo.focus();
    campo.select();
  }

  window.GRBusca = { abrir, carregar };
})();
