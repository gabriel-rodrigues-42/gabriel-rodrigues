// Galeria de propostas: cartões no estilo "seleção de fase" de videogame, com miniatura, selo,
// status (no ar ou em construção) e um medidor de fase. Usada na página inicial e em /projetos/.
//
// Uso, no <head> (sem defer), depois de tokens.css e componentes.css:
//   <link rel="stylesheet" href="/design-system/galeria.css">
//   <script src="/projetos/propostas.js"></script>
//   <script src="/design-system/galeria.js"></script>
// e no corpo: <gr-propostas></gr-propostas>
// Se a página carregar /ideias/ideias.js (ou ideias-en.js), as ideias que ainda não estão em
// propostas.js entram no fim da galeria. Os textos seguem o lang da página (pt ou en).
//
// Com o atributo ordem="apoios" (em /projetos/), a galeria busca em /api/propostas quantos apoios
// cada proposta tem (o polegar de <gr-apoiar>, apoiar.js) e mostra primeiro as mais apoiadas.
// Empate fica na ordem de propostas.js. Aparece um seletor para voltar à ordem "Em destaque".
// O número só aparece no cartão a partir de 10 apoios. Prévia com números de exemplo: ?apoio=demo.

(function () {
  "use strict";

  const EN = /^en\b/i.test(document.documentElement.lang);
  const L = EN ? "en" : "pt";
  const T = EN ? {
    fases: ["Idea", "Research", "Proposal", "Live"],
    fase: (n, nome) => `Stage ${n} of 4: ${nome}`,
    tipos: { projeto: "Project", ferramenta: "Tool", ideia: "Idea" },
    noAr: "Live",
    construcao: "In progress",
    ordem: "Order",
    maisApoiadas: "Most supported",
    destaque: "Featured",
    apoios: (n) => `${n.toLocaleString("en")} supports`,
  } : {
    fases: ["Ideia", "Estudo", "Proposta", "No ar"],
    fase: (n, nome) => `Fase ${n} de 4: ${nome}`,
    tipos: { projeto: "Projeto", ferramenta: "Ferramenta", ideia: "Ideia" },
    noAr: "No ar",
    construcao: "Em construção",
    ordem: "Ordem",
    maisApoiadas: "Mais apoiadas",
    destaque: "Em destaque",
    apoios: (n) => `${n.toLocaleString("pt-BR")} apoios`,
  };
  const MINIMO_PARA_MOSTRAR = 10; // o mesmo de apoiar.js
  const POLEGAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z"/></svg>';
  const slug = (href) => (href.match(/^\/projetos\/([a-z0-9-]+)\//) || [])[1] || "";

  const IMG_PADRAO = "/projetos/img/ideia.svg";
  const local = (href) => (EN && href.startsWith("/") ? "/en" + href : href);

  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function cartao(p, destaque) {
    const li = el("li", "slot" + (destaque ? " slot-destaque" : ""));
    li.dataset.cor = p.cor || "azul";
    const a = el("a");
    a.href = local(p.href);

    const palco = el("div", "slot-palco");
    const img = el("img");
    img.src = p.img || IMG_PADRAO;
    img.alt = "";
    img.width = 700; img.height = 560;
    img.loading = destaque ? "eager" : "lazy";
    img.decoding = "async";
    palco.append(img, el("span", "slot-tipo", T.tipos[p.tipo] || T.tipos.ideia));
    if (p.fase) {
      const noAr = p.fase >= 4;
      palco.append(el("span", "slot-status" + (noAr ? " no-ar" : ""), noAr ? T.noAr : T.construcao));
    }
    if (p.apoios >= MINIMO_PARA_MOSTRAR) {
      const ap = el("span", "slot-apoios");
      ap.innerHTML = POLEGAR;
      ap.append(el("span", "", T.apoios(p.apoios)));
      palco.append(ap);
    }

    const corpo = el("div", "slot-corpo");
    corpo.append(el("strong", "slot-titulo", p.titulo), el("p", "slot-gancho", p.gancho));
    if (p.fase) {
      const fase = el("div", "slot-fase");
      const nome = T.fases[p.fase - 1];
      const barras = el("span", "slot-barras");
      barras.setAttribute("role", "img");
      barras.setAttribute("aria-label", T.fase(p.fase, nome));
      for (let i = 1; i <= 4; i++) barras.append(el("i", i <= p.fase ? "cheia" : ""));
      fase.append(barras, el("span", "slot-fase-nome", nome));
      corpo.append(fase);
    } else if (p.acao) {
      corpo.append(el("span", "slot-acao", p.acao + " →"));
    }
    a.append(palco, corpo, el("span", "slot-ir"));
    a.lastChild.setAttribute("aria-hidden", "true");
    li.append(a);
    return li;
  }

  class Propostas extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.connectedCallback(), { once: true });
        return;
      }
      this.dataset.pronto = "1";

      const lista = (window.PROPOSTAS || []).map((p) => ({ ...p, titulo: p.titulo[L], gancho: p.gancho[L] }));
      const ja = new Set(lista.map((p) => p.id));
      (window.IDEIAS || []).filter((i) => !ja.has(i.id)).forEach((i) => lista.push({
        id: i.id, href: "/ideias/#" + encodeURIComponent(i.id), cor: "azul", tipo: "ideia", fase: 1,
        titulo: i.titulo, gancho: i.gancho,
      }));

      this.lista = lista;
      this.ul = el("ul", "galeria");
      this.desenhar(lista);
      if (this.getAttribute("ordem") === "apoios") this.ordenarPorApoios();
      else this.replaceChildren(this.ul);
    }

    desenhar(lista) {
      this.ul.replaceChildren(...lista.map((p, i) => cartao(p, i === 0)));
    }

    async ordenarPorApoios() {
      const opcoes = el("div", "galeria-ordem");
      opcoes.setAttribute("role", "group");
      opcoes.setAttribute("aria-label", T.ordem);
      const botoes = [["apoios", T.maisApoiadas], ["destaque", T.destaque]].map(([valor, texto]) => {
        const b = el("button", "galeria-ordem-opcao", texto);
        b.type = "button";
        b.dataset.ordem = valor;
        b.setAttribute("aria-pressed", String(valor === "apoios"));
        b.addEventListener("click", () => {
          botoes.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          this.desenhar(valor === "apoios" ? this.porApoios : this.lista);
        });
        return b;
      });
      opcoes.append(...botoes);
      this.porApoios = this.lista;
      this.replaceChildren(this.ul);

      let apoios = {};
      // Prévia (/previa-apoio/): ?apoio=demo usa números de exemplo, para ver a ordem mudar.
      if (new URLSearchParams(location.search).has("apoio")) {
        apoios = { "cidade-esponja": 128, "regulacao-da-cannabis": 87, "moradia-que-vira-sua": 54, "reindustrializacao": 31, "cartorio-digital": 9 };
      } else try {
        const dados = await (await fetch("/api/propostas")).json();
        if (dados.ok) apoios = dados.apoios || {};
      } catch { return; } // sem servidor: fica a ordem em destaque, sem seletor
      this.lista = this.lista.map((p) => ({ ...p, apoios: apoios[slug(p.href)] || 0 }));
      this.porApoios = this.lista.map((p, i) => [p, i])
        .sort((a, b) => b[0].apoios - a[0].apoios || a[1] - b[1]).map(([p]) => p);
      this.desenhar(this.porApoios);
      this.prepend(opcoes);
    }
  }

  customElements.define("gr-propostas", Propostas);
})();
