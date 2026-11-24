// Galeria de propostas: cartões no estilo "seleção de fase" de videogame, com miniatura, selo,
// status (no ar ou em construção) e um medidor de fase. Usada na página inicial e em /projetos/.
//
// Uso, no <head> (sem defer), depois de tokens.css e componentes.css:
//   <link rel="stylesheet" href="/design-system/galeria.css?v=2026-11-22">
//   <script src="/projetos/propostas.js"></script>
//   <script src="/design-system/galeria.js"></script>
// e no corpo: <gr-propostas></gr-propostas>
// Se a página carregar /ideias/ideias.js (ou ideias-en.js), as ideias que ainda não estão em
// propostas.js entram no fim da galeria. Os textos seguem o lang da página (pt ou en).

(function () {
  "use strict";

  const EN = /^en\b/i.test(document.documentElement.lang);
  const L = EN ? "en" : "pt";
  const T = EN ? {
    fases: ["Idea", "Research", "Proposal", "Live"],
    fase: (n, nome) => `Stage ${n} of 4: ${nome}`,
    tipos: { projeto: "Project", ferramenta: "Tool", ideia: "Idea", audio: "Listen" },
    noAr: "Live",
    construcao: "In progress",
    todas: { titulo: "Listen to every idea", gancho: "All the ideas, to read or listen to with captions. Each one with the toughest criticism and my answer.", acao: "Read or listen" },
  } : {
    fases: ["Ideia", "Estudo", "Proposta", "No ar"],
    fase: (n, nome) => `Fase ${n} de 4: ${nome}`,
    tipos: { projeto: "Projeto", ferramenta: "Ferramenta", ideia: "Ideia", audio: "Ouvir" },
    noAr: "No ar",
    construcao: "Em construção",
    todas: { titulo: "Ouça todas as ideias", gancho: "Todas as ideias, para ler ou ouvir com legendas. Cada uma com as críticas mais duras e a minha resposta.", acao: "Ler ou ouvir" },
  };

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
    if (p.tipo === "audio") a.dataset.modoLeitura = ""; // abre já com o modo leitura ligado (moldura.js)

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
      lista.push({ href: "/ideias/", img: IMG_PADRAO, cor: "amarelo", tipo: "audio", acao: T.todas.acao, titulo: T.todas.titulo, gancho: T.todas.gancho });

      const ul = el("ul", "galeria");
      lista.forEach((p, i) => ul.append(cartao(p, i === 0)));
      this.replaceChildren(ul);
    }
  }

  customElements.define("gr-propostas", Propostas);
})();
