// Convite para contribuir: um cartão que leva ao formulário de issue do GitHub, já com o link da página.
// Usado no fim de cada proposta, em /projetos/ e em /ideias/.
//
// Uso, no <head> (sem defer), depois de tokens.css e componentes.css:
//   <link rel="stylesheet" href="/design-system/contribuir.css">
//   <script src="/design-system/contribuir.js"></script>
// e no corpo, antes de <gr-rodape>:
//   <gr-contribuir></gr-contribuir>              numa página de proposta: "melhorar esta" + "mandar nova"
//   <gr-contribuir tipo="nova"></gr-contribuir>  numa listagem: só "mandar nova"
// O nome da proposta vem do atributo titulo ou do <title> (o trecho antes de " · "); o link, do <link rel="canonical">.
// Os formulários ficam em .github/ISSUE_TEMPLATE/ e as regras em CONTRIBUTING.md. Textos pelo lang da página.

(function () {
  "use strict";

  const REPO = "https://github.com/gabriel-rodrigues-42/gabriel-rodrigues";
  const EN = /^en\b/i.test(document.documentElement.lang);

  const T = EN ? {
    selo: "Open to your ideas",
    tituloPagina: "Help improve this proposal",
    tituloNova: "Do you have a proposal?",
    textoPagina: "Every proposal here is built in the open. Bring newer data, a correction, the toughest criticism or a better idea. I read everything and answer.",
    textoNova: "Send your idea to improve a public system in Brazil. I read everything, answer, and the best ideas become pages here, with credit to you.",
    regrasRotulo: "What is non-negotiable",
    regras: ["Source and year for every number", "Solutions, not blame: criticize systems, not people", "Data and estimated impact", "No campaigning and no personal data"],
    melhorar: "Suggest an improvement",
    nova: "Send a new proposal",
    regrasLink: "Read the rules",
    nota: "Opens on GitHub (free account). The form is in Portuguese, but you can write in English. Everything there is public.",
    prefixoMelhoria: "[Melhoria] ",
  } : {
    selo: "Aberta à sua ideia",
    tituloPagina: "Ajude a melhorar esta proposta",
    tituloNova: "Tem uma proposta?",
    textoPagina: "Toda proposta daqui é construída em público. Traga um dado mais recente, uma correção, a crítica mais dura ou uma ideia melhor. Eu leio tudo e respondo.",
    textoNova: "Mande sua ideia para melhorar um sistema público do Brasil. Eu leio tudo, respondo, e as melhores viram página aqui, com crédito a você.",
    regrasRotulo: "O que é inegociável",
    regras: ["Fonte e ano em todo número", "Solução, não culpado: critique sistemas, não pessoas", "Dados e impacto estimado", "Sem pedido de voto e sem dados pessoais"],
    melhorar: "Sugerir uma melhoria",
    nova: "Mandar uma proposta nova",
    regrasLink: "Ler as regras",
    nota: "Abre no GitHub (conta gratuita). Tudo lá é público: não escreva dados pessoais.",
    prefixoMelhoria: "[Melhoria] ",
  };

  function formulario(modelo, campos) {
    const url = new URL(REPO + "/issues/new");
    url.searchParams.set("template", modelo);
    for (const [k, v] of Object.entries(campos || {})) if (v) url.searchParams.set(k, v);
    return url.href;
  }

  function enderecoDaPagina() {
    const canonico = document.querySelector('link[rel="canonical"]');
    return canonico ? canonico.href : location.origin + location.pathname;
  }

  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto) e.textContent = texto;
    return e;
  }

  class Contribuir extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      const nova = this.getAttribute("tipo") === "nova";
      const nome = (this.getAttribute("titulo") || document.title.split(" · ")[0] || "").replace(/\s+/g, " ").trim();

      const secao = el("section", "contribuir");
      secao.setAttribute("aria-labelledby", "contribuir-titulo");
      const cartao = el("div", "contribuir-cartao");
      cartao.append(el("span", "selo amarelo", T.selo));
      const h2 = el("h2", "contribuir-titulo", nova ? T.tituloNova : T.tituloPagina);
      h2.id = "contribuir-titulo";
      const texto = el("p", "contribuir-texto frases", nova ? T.textoNova : T.textoPagina);
      if (window.grFrases) window.grFrases(texto); // uma frase por linha (moldura.js)
      cartao.append(h2, texto);

      const rotulo = el("p", "contribuir-rotulo", T.regrasRotulo);
      rotulo.id = "contribuir-regras";
      const lista = el("ul", "contribuir-regras");
      lista.setAttribute("aria-labelledby", "contribuir-regras");
      for (const r of T.regras) lista.append(el("li", "", r));
      cartao.append(rotulo, lista);

      const acoes = el("div", "contribuir-acoes");
      if (!nova) {
        const a = el("a", "botao verde", T.melhorar);
        a.href = formulario("2-melhorar-proposta.yml", { title: T.prefixoMelhoria + nome, proposta: enderecoDaPagina() });
        acoes.append(a);
      }
      const b = el("a", nova ? "botao verde" : "botao secundario", T.nova);
      b.href = formulario("1-nova-proposta.yml", nova ? {} : { relacionada: enderecoDaPagina() });
      acoes.append(b);
      cartao.append(acoes);

      const nota = el("p", "contribuir-nota", T.nota + " ");
      const regras = el("a", "", T.regrasLink);
      regras.href = REPO + "/blob/main/CONTRIBUTING.md";
      nota.append(regras);
      cartao.append(nota);

      secao.append(cartao);
      this.replaceChildren(secao);
    }
  }

  if (!customElements.get("gr-contribuir")) customElements.define("gr-contribuir", Contribuir);
})();
