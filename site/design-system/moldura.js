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
              <img src="/design-system/img/gabriel-avatar.jpg" alt="" width="40" height="40">
              <span><strong>Gabriel Rodrigues</strong><span>Engenharia de software no serviço público</span></span>
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
              <li><a href="/privacidade/">Privacidade</a> · <a href="/design-system/">Design system</a></li>
            </ul>
            <p class="moldura-aviso">Site pessoal e informativo de pré-campanha. Não há pedido de voto. Ideias em construção, abertas a crítica.</p>
          </div>
        </footer>`;
    }
  }

  if (!customElements.get("gr-cabecalho")) customElements.define("gr-cabecalho", Cabecalho);
  if (!customElements.get("gr-rodape")) customElements.define("gr-rodape", Rodape);
})();
