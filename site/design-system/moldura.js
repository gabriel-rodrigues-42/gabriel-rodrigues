// Moldura do site: o cabeçalho e o rodapé que levam o contexto do Gabriel para todas as páginas.
// O seletor PT/EN fica no rodapé. Para mudar o menu, a frase de missão ou os links do rodapé, edite só este arquivo (nos dois idiomas, em T).
// Carregue no <head> (sem defer) junto com moldura.css e use <gr-cabecalho> e <gr-rodape> no corpo.

(function () {
  "use strict";

  // Idioma: português é o padrão. A versão em inglês de /x/ fica em /en/x/ e tem <html lang="en">.
  const EN = /^en\b/i.test(document.documentElement.lang) || location.pathname === "/en" || location.pathname.startsWith("/en/");
  const RAIZ = EN ? "/en/" : "/";
  // Pasta deste arquivo: o leitor (modo leitura) mora ao lado.
  const PASTA = document.currentScript ? new URL(".", document.currentScript.src).pathname : "/design-system/";
  // Caminho sem o /en, para marcar o item do menu da página atual nos dois idiomas.
  const semIdioma = location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";

  const T = EN ? {
    missao: "Software developer in Goiânia, Brazil. I study politics to bring the way software engineering works into government: measure, test, fix and show the code.",
    menu: ["Proposals", "Path", "About"],
    menuRotulo: "Main menu",
    apoiar: "Support",
    marca: "Gabriel Rodrigues, home page",
    rodape: ["Do you think I should try?", "Open source on GitHub", "Privacy", "Cookies", "Design system"],
    aviso: "Personal, informational pre-campaign website. No request for votes. Ideas under construction, open to criticism.",
    cookiesRotulo: "Analytics cookies",
    cookies: "May I count visits with Google Analytics to learn which ideas interest people most? No ads.",
    saibaMais: "How cookies are used",
    recusar: "Decline",
    aceitar: "Accept",
    idiomaRotulo: "Language",
    leitura: "Reading mode",
    leituraTitulo: "Adds a play button to every page and section, to listen with captions",
    buscar: "Search",
    buscarRotulo: "Search the site",
    menuAtalhos: "Shortcuts",
  } : {
    missao: "Desenvolvedor de software em Goiânia (GO). Estudo política para levar o jeito de trabalhar da engenharia de software para o governo: medir, testar, corrigir e mostrar o código.",
    menu: ["Propostas", "Caminho", "Sobre"],
    menuRotulo: "Menu principal",
    apoiar: "Apoiar",
    marca: "Gabriel Rodrigues, página inicial",
    rodape: ["Acredita que eu devo tentar?", "Código aberto no GitHub", "Privacidade", "Cookies", "Design system"],
    aviso: "Site pessoal e informativo de pré-campanha. Não há pedido de voto. Ideias em construção, abertas a crítica.",
    cookiesRotulo: "Cookies de medição",
    cookies: "Posso contar as visitas com o Google Analytics para saber quais ideias interessam mais? Sem anúncios.",
    saibaMais: "Como uso cookies",
    recusar: "Recusar",
    aceitar: "Aceitar",
    idiomaRotulo: "Idioma",
    leitura: "Modo leitura",
    leituraTitulo: "Coloca um botão de play em cada página e seção, para ouvir com legendas",
    buscar: "Buscar",
    buscarRotulo: "Buscar no site",
    menuAtalhos: "Atalhos",
  };

  // Ícones do menu (traço, herdam a cor do texto).
  const ICONE = {
    propostas: '<path d="M4 5.5h7v6H4zM13 5.5h7v6h-7zM4 13.5h7v6H4zM13 13.5h7v6h-7z"/>',
    caminho: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
    sobre: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
    buscar: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
  };
  const svg = (nome) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONE[nome]}</svg>`;

  const MENU = [
    { href: RAIZ + "projetos/", icone: "propostas", texto: T.menu[0], ativo: (p) => p.startsWith("/projetos/") || p.startsWith("/ideias/") },
    { href: RAIZ + "caminho/", icone: "caminho", texto: T.menu[1], ativo: (p) => p.startsWith("/caminho/") },
    { href: RAIZ + "sobre/", icone: "sobre", texto: T.menu[2], ativo: (p) => p.startsWith("/sobre/") },
  ];

  // Endereço da mesma página no outro idioma. Vem do <link rel="alternate" hreflang> do <head>
  // (toda página traduzida tem); sem ele, vai para a página inicial do outro idioma.
  function outroIdioma() {
    const alvo = document.querySelector(`link[rel="alternate"][hreflang="${EN ? "pt-BR" : "en"}"]`);
    let url = alvo ? new URL(alvo.href, location.href) : new URL(EN ? "/" : "/en/", location.href);
    if (url.hostname === "gabriel-rodrigues.com" || url.hostname === "www.gabriel-rodrigues.com") url = new URL(url.pathname, location.origin);
    return url.pathname + (url.pathname === location.pathname ? "" : location.hash);
  }

  // Logo do Gabriel: um G com duas pessoas e estrelas. As cores vêm de tokens.css
  // (--logo-g, --logo-pessoas, --logo-estrelas). Cópia em arquivo: /design-system/img/logo.svg.
  const LOGO = `
  <g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <g class="logo-g" stroke="var(--logo-g, #009c3b)">
      <path pathLength="1" d="M45.15 34.99H57.78A25.83 25.83 0 1 1 44.91 11.1C40.1 12.69 36.58 15.04 32.82 17.38C28.13 21.14 22.26 20.91 14.39 21.84"/>
      <path pathLength="1" d="M30.24 11.28C23.66 12.45 17.56 15.86 13.98 21.97A21.25 21.25 0 1 0 52.29 39.57H45.15"/>
    </g>
    <g class="logo-pessoas" stroke="var(--logo-pessoas, #002776)">
      <g class="logo-pessoa-1">
      <path d="M29.65 32.76H23.9A3.99 3.99 0 0 0 19.91 36.75V43.21A1.41 1.41 0 0 0 22.73 43.21M22.73 38.28V52.25M26.6 45.44V53.78"/>
      <circle cx="26.31" cy="28.07" r="2.76"/>
      </g>
      <g class="logo-pessoa-2">
      <path d="M33.53 36.17V54.01M33.53 42.98A1.41 1.41 0 0 1 30.71 42.98M30.71 53.54V36.17C30.71 32.29 32.82 30.3 36.93 30.06C41.04 29.83 44.33 27.01 46.68 23.49C47.61 22.08 49.96 22.78 49.02 24.66C47.14 28.18 43.97 31.71 43.15 32.65C42.45 33.58 42.33 34.64 42.33 35.46V51.66M37.64 44.27V53.54"/>
      <circle cx="37.17" cy="25.37" r="2.76"/>
      </g>
    </g>
  </g>
  <g class="logo-estrelas" fill="var(--logo-estrelas, #c9a800)">
    <path d="M50.43 10.1Q51.02 12.81 53.72 13.39Q51.02 13.98 50.43 16.68Q49.84 13.98 47.14 13.39Q49.84 12.81 50.43 10.1Z"/>
    <path d="M54.42 18.32Q54.78 19.85 56.3 20.2Q54.78 20.55 54.42 22.08Q54.07 20.55 52.55 20.2Q54.07 19.85 54.42 18.32Z"/>
    <path d="M44.56 15.74Q44.91 17.27 46.44 17.62Q44.91 17.97 44.56 19.5Q44.21 17.97 42.68 17.62Q44.21 17.27 44.56 15.74Z"/>
  </g>
`;


  class Cabecalho extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      // Os mesmos links vão no topo (computador) e na barra de baixo (celular).
      const links = (icone) => MENU.map((m) =>
        `<a href="${m.href}"${m.ativo(semIdioma) ? ' aria-current="page"' : ""}>${icone ? `<span class="moldura-barra-icone">${svg(m.icone)}</span>` : ""}${m.texto}</a>`
      ).join("");
      this.innerHTML = `
        <header class="moldura-topo">
          <div class="moldura-topo-dentro">
            <a class="moldura-marca" href="${RAIZ}" aria-label="${T.marca}">
              <svg class="moldura-logo" viewBox="4 5 56 55" aria-hidden="true" focusable="false">${LOGO}</svg>
              <span class="moldura-oculto">Gabriel Rodrigues</span>
            </a>
            <nav class="moldura-menu" aria-label="${T.menuRotulo}">${links(false)}</nav>
            <div class="moldura-acoes">
              <button type="button" class="moldura-buscar" data-buscar aria-label="${T.buscarRotulo}" title="${T.buscarRotulo}" aria-haspopup="dialog">${svg("buscar")}</button>
              <a class="moldura-apoiar" href="${RAIZ}#apoiar">${T.apoiar}</a>
            </div>
          </div>
        </header>
        <nav class="moldura-barra" aria-label="${T.menuAtalhos}">
          ${links(true)}
          <button type="button" data-buscar aria-haspopup="dialog"><span class="moldura-barra-icone">${svg("buscar")}</span>${T.buscar}</button>
        </nav>`;
    }
  }

  // ---------- Animação do logo ----------
  // Ao tocar no logo, o G se desenha em volta das pessoas, a da frente sobe e as estrelas piscam.
  // Depois a página vai para o início. Quem pediu menos movimento não vê animação.
  const menosMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animarLogo(marca) {
    const logo = marca.querySelector(".moldura-logo");
    logo.removeAttribute("data-anima");
    void logo.getBoundingClientRect(); // reinicia a animação se a pessoa tocar de novo
    logo.setAttribute("data-anima", "");
    return new Promise((ok) => setTimeout(() => { logo.removeAttribute("data-anima"); ok(); }, 950));
  }

  document.addEventListener("click", (e) => {
    const marca = e.target.closest(".moldura-marca");
    if (!marca || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || menosMovimento()) return;
    e.preventDefault();
    const noInicio = location.pathname === marca.pathname;
    if (noInicio) scrollTo({ top: 0, behavior: "smooth" });
    const fim = animarLogo(marca);
    // Fora do início, a animação toca e logo depois a página muda.
    if (!noInicio) fim.then(() => { location.href = marca.href; });
  });

  // ---------- Revelar ao rolar ----------
  // Todo elemento com .revelar aparece quando entra na tela (o CSS está em componentes.css).
  function revelarAoRolar() {
    const itens = document.querySelectorAll(".revelar");
    if (!itens.length) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); }
    }), { threshold: .12 });
    itens.forEach((el) => io.observe(el));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", revelarAoRolar);
  else revelarAoRolar();

  // ---------- Módulos carregados sob demanda (busca e modo leitura) ----------
  // Põe nome.css e nome.js na página uma vez só e espera os dois.
  // Se o script falhar, a próxima chamada tenta de novo.
  const carregando = {};
  function carregarModulo(nome, versao) {
    if (carregando[nome]) return carregando[nome];
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = PASTA + nome + ".css?v=" + versao;
    const cssPronto = new Promise((ok) => { css.onload = ok; css.onerror = ok; });
    document.head.appendChild(css);
    carregando[nome] = Promise.all([cssPronto, new Promise((ok, erro) => {
      const s = document.createElement("script");
      s.src = PASTA + nome + ".js?v=" + versao;
      s.onload = ok;
      s.onerror = () => { carregando[nome] = null; css.remove(); erro(); };
      document.head.appendChild(s);
    })]);
    return carregando[nome];
  }

  // ---------- Busca ----------
  // A lupa carrega busca.js + busca.css só no primeiro toque.
  const VERSAO_BUSCA = "dev"; // o deploy troca pelo hash (scripts/versao/carimbar.py)
  const carregarBusca = () => carregarModulo("busca", VERSAO_BUSCA);
  function abrirBusca() {
    carregarBusca().then(() => window.GRBusca.abrir(), () => { location.href = RAIZ + "projetos/"; });
  }
  // Adianta o download quando o dedo ou o mouse chega perto da lupa.
  // Os ouvintes saem assim que o índice começa a baixar.
  const adiantar = new AbortController();
  ["pointerover", "touchstart", "focusin"].forEach((ev) => document.addEventListener(ev, (e) => {
    if (!e.target.closest || !e.target.closest("[data-buscar]")) return;
    adiantar.abort();
    carregarBusca().then(() => window.GRBusca.carregar()).catch(() => {});
  }, { passive: true, signal: adiantar.signal }));
  // Atalho de teclado: "/" abre a busca (fora de campos de texto).
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    abrirBusca();
  });

  class Rodape extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      this.innerHTML = `
        <footer class="moldura-rodape">
          <div class="moldura-rodape-dentro">
            <div>
              <strong>Gabriel Rodrigues</strong>
              <p>${T.missao}</p>
            </div>
            <ul>
              <li><a href="${RAIZ}#apoiar">${T.rodape[0]}</a></li>
              <li><a href="https://galera.club/gabriel">galera.club/gabriel</a></li>
              <li><a href="https://github.com/gabriel-rodrigues-42/gabriel-rodrigues">${T.rodape[1]}</a></li>
              <li><a href="${RAIZ}privacidade/">${T.rodape[2]}</a> · <a href="#" data-cookies>${T.rodape[3]}</a> · <a href="/design-system/">${T.rodape[4]}</a></li>
            </ul>
            <div class="moldura-ajustes">
              <div class="moldura-idioma" role="group" aria-label="${T.idiomaRotulo}">
                <a href="${EN ? outroIdioma() : location.pathname}" lang="pt-BR" hreflang="pt-BR" title="Ler em português"${EN ? "" : ' aria-current="true"'} data-idioma="pt">PT</a>
                <a href="${EN ? location.pathname : outroIdioma()}" lang="en" hreflang="en" title="Read in English"${EN ? ' aria-current="true"' : ""} data-idioma="en">EN</a>
              </div>
              <button type="button" class="moldura-leitura" aria-pressed="${leituraLigada()}" title="${T.leituraTitulo}" data-modo-leitura-botao>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4z"/><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4M18.2 6.2a8.2 8.2 0 0 1 0 11.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <span>${T.leitura}</span>
                <span class="moldura-chave" aria-hidden="true"></span>
              </button>
            </div>
            <p class="moldura-aviso">${T.aviso}</p>
          </div>
        </footer>`;
    }
  }

  // ---------- Modo leitura ----------
  // Ligado no rodapé, carrega leitor.js + leitor.css, que põem um ▶ em cada página e seção
  // e mostram as legendas. A escolha fica no navegador (localStorage).
  const CHAVE_LEITURA = "gr-modo-leitura"; // "ligado" | ausente
  const VERSAO_LEITOR = "dev"; // o deploy troca pelo hash (scripts/versao/carimbar.py)
  function leituraLigada() { try { return localStorage.getItem(CHAVE_LEITURA) === "ligado"; } catch { return false; } }
  function salvarLeitura(ligada) {
    try { ligada ? localStorage.setItem(CHAVE_LEITURA, "ligado") : localStorage.removeItem(CHAVE_LEITURA); } catch { /* sem armazenamento: vale só nesta página */ }
  }

  const carregarLeitor = () => carregarModulo("leitor", VERSAO_LEITOR);

  function aplicarLeitura(ligada) {
    document.querySelectorAll("[data-modo-leitura-botao]").forEach((b) => b.setAttribute("aria-pressed", String(ligada)));
    if (ligada) carregarLeitor().then(() => window.GRLeitor.ligar(), () => {});
    else if (window.GRLeitor) window.GRLeitor.desligar();
  }

  if (leituraLigada()) aplicarLeitura(true);

  // ---------- Medição (Google Tag Manager) só com consentimento ----------
  // LGPD: nada de Google até a pessoa aceitar. Com o aceite, o GTM carrega e o Consent Mode
  // libera só a medição de visitas (analytics_storage); anúncios ficam sempre negados.
  // A escolha fica no navegador (localStorage) e pode ser mudada pelo link "Cookies" do rodapé.
  const GTM_ID = "GTM-KQKJVCCZ";
  const CHAVE = "gr-consentimento"; // "aceito" | "recusado"

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });

  const lerEscolha = () => { try { return localStorage.getItem(CHAVE); } catch { return null; } };
  const salvarEscolha = (v) => { try { localStorage.setItem(CHAVE, v); } catch { /* sem armazenamento: pergunta de novo na próxima visita */ } };

  let gtmCarregado = false;
  function carregarGtm() {
    if (gtmCarregado) return;
    gtmCarregado = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(s);
  }

  function mostrarAviso() {
    if (document.querySelector(".moldura-cookies")) return;
    const aviso = document.createElement("div");
    aviso.className = "moldura-cookies";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-label", T.cookiesRotulo);
    aviso.innerHTML = `
      <p>${T.cookies} <a href="${RAIZ}privacidade/#cookies">${T.saibaMais}</a></p>
      <div class="moldura-cookies-botoes">
        <button type="button" data-escolha="recusado">${T.recusar}</button>
        <button type="button" data-escolha="aceito">${T.aceitar}</button>
      </div>`;
    aviso.addEventListener("click", (e) => {
      const b = e.target.closest("[data-escolha]");
      if (!b) return;
      salvarEscolha(b.dataset.escolha);
      if (b.dataset.escolha === "aceito") carregarGtm();
      else if (gtmCarregado) location.reload(); // recusou depois de aceitar: recarrega sem o GTM
      aviso.remove();
    });
    document.body.appendChild(aviso);
  }

  const escolha = lerEscolha();
  if (escolha === "aceito") carregarGtm();
  document.addEventListener("DOMContentLoaded", () => { if (!lerEscolha()) mostrarAviso(); });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-buscar]")) { abrirBusca(); return; }
    const botaoLeitura = e.target.closest("[data-modo-leitura-botao]");
    if (botaoLeitura) {
      const ligada = botaoLeitura.getAttribute("aria-pressed") !== "true";
      salvarLeitura(ligada);
      aplicarLeitura(ligada);
      return;
    }
    // Troca de idioma: recalcula na hora, para levar junto o # atual (ex.: respostas do /caminho/).
    const idioma = e.target.closest(".moldura-idioma a:not([aria-current])");
    if (idioma) idioma.href = outroIdioma();
    if (!e.target.closest("[data-cookies]")) return;
    e.preventDefault();
    mostrarAviso();
  });

  if (!customElements.get("gr-cabecalho")) customElements.define("gr-cabecalho", Cabecalho);
  if (!customElements.get("gr-rodape")) customElements.define("gr-rodape", Rodape);
})();
