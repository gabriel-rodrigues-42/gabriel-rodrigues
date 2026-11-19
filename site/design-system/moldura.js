// Moldura do site: o cabeçalho e o rodapé que levam o contexto do Gabriel para todas as páginas.
// Para mudar o menu, a frase de missão ou os links do rodapé, edite só este arquivo.
// Carregue no <head> (sem defer) junto com moldura.css e use <gr-cabecalho> e <gr-rodape> no corpo.

(function () {
  "use strict";

  const MISSAO = "Desenvolvedor de software em Goiânia (GO). Estudo política para levar o jeito de trabalhar da engenharia de software para o governo: medir, testar, corrigir e mostrar o código.";

  const MENU = [
    { href: "/#publicacoes", texto: "Projetos e ideias", ativo: (p) => p.startsWith("/projetos/") || p.startsWith("/ideias/") },
    { href: "/caminho/", texto: "Caminho", ativo: (p) => p.startsWith("/caminho/") },
    { href: "/#sobre", texto: "Sobre", ativo: () => false },
  ];

  // Logo do Gabriel: um G com duas pessoas e estrelas. As cores vêm de tokens.css
  // (--logo-g, --logo-pessoas, --logo-estrelas). Cópia em arquivo: /design-system/img/logo.svg.
  const LOGO = `
  <g fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <g class="logo-g" stroke="var(--logo-g, #009c3b)">
      <path d="M45.15 34.99H57.78A25.83 25.83 0 1 1 44.91 11.1C40.1 12.69 36.58 15.04 32.82 17.38C28.13 21.14 22.26 20.91 14.39 21.84"/>
      <path d="M30.24 11.28C23.66 12.45 17.56 15.86 13.98 21.97A21.25 21.25 0 1 0 52.29 39.57H45.15"/>
    </g>
    <g class="logo-pessoas" stroke="var(--logo-pessoas, #002776)">
      <path d="M29.65 32.76H23.9A3.99 3.99 0 0 0 19.91 36.75V43.21A1.41 1.41 0 0 0 22.73 43.21M22.73 38.28V52.25M26.6 45.44V53.78"/>
      <path d="M33.53 36.17V54.01M33.53 42.98A1.41 1.41 0 0 1 30.71 42.98M30.71 53.54V36.17C30.71 32.29 32.82 30.3 36.93 30.06C41.04 29.83 44.33 27.01 46.68 23.49C47.61 22.08 49.96 22.78 49.02 24.66C47.14 28.18 43.97 31.71 43.15 32.65C42.45 33.58 42.33 34.64 42.33 35.46V51.66M37.64 44.27V53.54"/>
      <circle cx="26.31" cy="28.07" r="2.76"/>
      <circle cx="37.17" cy="25.37" r="2.76"/>
    </g>
  </g>
  <g class="logo-estrelas" fill="var(--logo-estrelas, #c9a800)">
    <path d="M50.43 10.1Q51.02 12.81 53.72 13.39Q51.02 13.98 50.43 16.68Q49.84 13.98 47.14 13.39Q49.84 12.81 50.43 10.1Z"/>
    <path d="M54.42 18.32Q54.78 19.85 56.3 20.2Q54.78 20.55 54.42 22.08Q54.07 20.55 52.55 20.2Q54.07 19.85 54.42 18.32Z"/>
    <path d="M44.56 15.74Q44.91 17.27 46.44 17.62Q44.91 17.97 44.56 19.5Q44.21 17.97 42.68 17.62Q44.21 17.27 44.56 15.74Z"/>
  </g>
`;

  const caminho = location.pathname;

  class Cabecalho extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      const links = MENU.map((m) =>
        `<a href="${m.href}"${m.ativo(caminho) ? ' aria-current="page"' : ""}>${m.texto}</a>`
      ).join("");
      this.innerHTML = `
        <header class="moldura-topo">
          <div class="moldura-topo-dentro">
            <a class="moldura-marca" href="/" aria-label="Gabriel Rodrigues, página inicial">
              <svg class="moldura-logo" viewBox="4 5 56 55" aria-hidden="true" focusable="false">${LOGO}</svg>
              <span class="moldura-oculto">Gabriel Rodrigues</span>
            </a>
            <nav class="moldura-menu" aria-label="Menu principal">${links}</nav>
            <a class="moldura-apoiar" href="/#apoiar">Apoiar</a>
          </div>
        </header>`;
    }
  }

  class Rodape extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      this.innerHTML = `
        <footer class="moldura-rodape">
          <div class="moldura-rodape-dentro">
            <div>
              <strong>Gabriel Rodrigues</strong>
              <p>${MISSAO}</p>
            </div>
            <ul>
              <li><a href="/#apoiar">Acredita que eu devo tentar?</a></li>
              <li><a href="https://galera.club/gabriel">galera.club/gabriel</a></li>
              <li><a href="https://github.com/gabriel-rodrigues-42/gabriel-rodrigues">Código aberto no GitHub</a></li>
              <li><a href="/privacidade/">Privacidade</a> · <a href="#" data-cookies>Cookies</a> · <a href="/design-system/">Design system</a></li>
            </ul>
            <p class="moldura-aviso">Site pessoal e informativo de pré-campanha. Não há pedido de voto. Ideias em construção, abertas a crítica.</p>
          </div>
        </footer>`;
    }
  }

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
    aviso.setAttribute("aria-label", "Cookies de medição");
    aviso.innerHTML = `
      <p>Posso contar as visitas com o Google Analytics para saber quais ideias interessam mais? Sem anúncios. <a href="/privacidade/#cookies">Saiba mais</a></p>
      <div class="moldura-cookies-botoes">
        <button type="button" data-escolha="recusado">Recusar</button>
        <button type="button" data-escolha="aceito">Aceitar</button>
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
    if (!e.target.closest("[data-cookies]")) return;
    e.preventDefault();
    mostrarAviso();
  });

  if (!customElements.get("gr-cabecalho")) customElements.define("gr-cabecalho", Cabecalho);
  if (!customElements.get("gr-rodape")) customElements.define("gr-rodape", Rodape);
})();
