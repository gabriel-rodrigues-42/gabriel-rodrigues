// Apoiar a proposta com um toque: <gr-apoiar>. Ideia da Kelli.
// A pessoa toca no polegar, o apoio vira +1 na contagem da proposta e aparecem botões para
// compartilhar. As propostas mais apoiadas sobem na galeria de /projetos/ (galeria.js).
//
// Uso, no <head> (sem defer), depois de tokens.css e componentes.css:
//   <link rel="stylesheet" href="/design-system/apoiar.css">
//   <script src="/design-system/apoiar.js"></script>
// e no corpo, antes de <gr-contribuir>:
//   <gr-apoiar></gr-apoiar>
// A proposta é o slug do endereço (/projetos/<slug>/ ou /en/projetos/<slug>/), o mesmo nos dois idiomas.
// Para outra, use o atributo proposta="slug". O slug precisa estar em /projetos/propostas.js.
//
// O botão acompanha a leitura (o Gabriel escolheu este formato, PR #85):
//   computador  botão "Apoiar" no canto de baixo, que aparece quando o título sai da tela e some
//               perto do rodapé, para não cobrir os links
//   celular     polegar no meio da barra de baixo (.moldura-barra), entre Caminho e Sobre, sem cobrir
//               o texto e sem tirar nenhum atalho da barra (CSS em apoiar.css)
// Depois do toque, abre um painel com o agradecimento e os botões de compartilhar.
// Teste sem gravar nada: ?apoio=demo em qualquer proposta (o número é de exemplo).
//
// Privacidade: o servidor (functions/api/propostas.js) guarda só a contagem de cada proposta.
// Um apoio por aparelho fica no localStorage deste navegador. Explicado em /privacidade/#propostas.
// Sem animação com prefers-reduced-motion. Textos pelo lang da página.

(function () {
  "use strict";

  const EN = /^en\b/i.test(document.documentElement.lang);
  const CHAVE = "gr-apoio-propostas";
  const MINIMO_PARA_MOSTRAR = 10; // abaixo disso, não mostro o número (pouca gente ainda)
  const DEMO_TOTAL = 42;

  const T = EN ? {
    botao: "Support",
    rotuloBotao: "Support this proposal",
    rotuloApoiado: "You support this proposal. Share it",
    apoiado: "Supported",
    obrigado: "Thank you for your support.",
    contado: "Your support was counted.",
    pessoas: (n) => n === 1 ? "You and 1 other person support this proposal." : `You and ${n.toLocaleString("en")} other people support this proposal.`,
    convite: "Send it to someone who should read it:",
    compartilhar: "Share",
    nota: "Anonymous, once per device.",
    como: "How it works",
    privacidade: "/en/privacidade/#propostas",
    whatsapp: "WhatsApp",
    copiar: "Copy link",
    copiado: "Link copied",
    fechar: "Close",
    enviando: "Sending…",
    erro: "I couldn't save your support right now. Please try again later.",
    demo: "Preview: nothing is saved and the number is an example.",
    textoPartilha: (t) => `I read this proposal by Gabriel Rodrigues and I support it: ${t}`,
    ferramenta: "Adds one anonymous support to this proposal by Gabriel Rodrigues. Only do this when the person confirms they want to support it.",
    param: "The proposal's slug, as in /projetos/<slug>/.",
  } : {
    botao: "Apoiar",
    rotuloBotao: "Apoiar esta proposta",
    rotuloApoiado: "Você apoia esta proposta. Compartilhar",
    apoiado: "Apoiada",
    obrigado: "Obrigado pelo apoio.",
    contado: "Seu apoio foi contado.",
    pessoas: (n) => n === 1 ? "Você e mais 1 pessoa apoiam esta proposta." : `Você e mais ${n.toLocaleString("pt-BR")} pessoas apoiam esta proposta.`,
    convite: "Mande para alguém que precisa ler:",
    compartilhar: "Compartilhar",
    nota: "Anônimo, um por aparelho.",
    como: "Como funciona",
    privacidade: "/privacidade/#propostas",
    whatsapp: "WhatsApp",
    copiar: "Copiar link",
    copiado: "Link copiado",
    fechar: "Fechar",
    enviando: "Enviando…",
    erro: "Não consegui guardar o apoio agora. Tente de novo mais tarde.",
    demo: "Prévia: nada é gravado e o número é de exemplo.",
    textoPartilha: (t) => `Li esta proposta do Gabriel Rodrigues e apoio: ${t}`,
    ferramenta: "Soma um apoio anônimo a esta proposta de Gabriel Rodrigues. Só apoie com a confirmação da própria pessoa.",
    param: "O slug da proposta, como em /projetos/<slug>/.",
  };

  const calmo = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONE = {
    polegar: '<svg viewBox="0 0 24 24" aria-hidden="true" class="icone-polegar"><g class="polegar"><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z"/></g></svg>',
    estrela: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2Q13.3 10.7 22 12Q13.3 13.3 12 22Q10.7 13.3 2 12Q10.7 10.7 12 2Z"/></svg>',
    partilha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-4A8 8 0 1 1 8 18.8Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-1.8-.9-.8.8a4 4 0 0 1-2.3-2.3l.8-.8-.9-1.8z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  // Lista de propostas já apoiadas neste aparelho. Na prévia, fica só nesta aba (sessionStorage).
  function guardado(demo) {
    try {
      const s = demo ? sessionStorage : localStorage;
      return new Set(JSON.parse(s.getItem(CHAVE + (demo ? "-demo" : "")) || "[]"));
    } catch { return new Set(); }
  }
  function esquecer(id, demo) {
    try {
      const s = demo ? sessionStorage : localStorage;
      const lista = guardado(demo); lista.delete(id);
      s.setItem(CHAVE + (demo ? "-demo" : ""), JSON.stringify([...lista]));
    } catch { /* sem armazenamento */ }
  }
  function guardar(id, demo) {
    try {
      const s = demo ? sessionStorage : localStorage;
      const lista = guardado(demo); lista.add(id);
      s.setItem(CHAVE + (demo ? "-demo" : ""), JSON.stringify([...lista]));
    } catch { /* navegador sem armazenamento: o freio do servidor ainda vale */ }
  }

  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function slugDaPagina() {
    const m = location.pathname.match(/^(?:\/en)?\/projetos\/([a-z0-9-]+)\/?/);
    return m ? m[1] : "";
  }

  function enderecoDaPagina() {
    const c = document.querySelector('link[rel="canonical"]');
    return c ? c.href : location.origin + location.pathname;
  }

  // Animação do polegar ao apoiar (só enfeite; nada depende dela): pulo curto e uma estrela
  // do logo que sobe da ponta do polegar.
  function animar_(botao) {
    if (calmo()) return;
    botao.classList.remove("festa");
    void botao.offsetWidth; // reinicia a animação
    botao.classList.add("festa");
    const s = el("span", "apoiar-estrela");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONE.estrela;
    botao.append(s);
    setTimeout(() => s.remove(), 900);
    setTimeout(() => botao.classList.remove("festa"), 900);
  }

  class Apoiar extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.connectedCallback(), { once: true });
        return;
      }
      this.dataset.pronto = "1";

      const params = new URLSearchParams(location.search);
      this.demo = params.has("apoio");
      this.id_ = this.getAttribute("proposta") || slugDaPagina();
      if (!this.id_) return;
      this.titulo = (document.title.split(" · ")[0] || "").trim();

      // Voltou do envio sem JavaScript.
      if (params.get("apoiou") === "1" && !this.demo) guardar(this.id_, false);
      this.apoiado = guardado(this.demo).has(this.id_);

      this.montar();
      if (this.apoiado) this.mostrarDepois(null, false);
    }

    montar() {
      const secao = el("section", "apoiar apoiar-flutuante");
      secao.id = "apoiar-proposta";
      secao.setAttribute("aria-label", T.rotuloBotao);

      // Formulário de verdade: funciona sem JavaScript e declara a ferramenta para agentes (WebMCP).
      const form = el("form", "apoiar-form");
      form.action = "/api/propostas";
      form.method = "post";
      form.setAttribute("toolname", "apoiar_proposta");
      form.setAttribute("tooldescription", T.ferramenta);
      const campo = el("input");
      campo.type = "hidden"; campo.name = "proposta"; campo.value = this.id_;
      campo.setAttribute("toolparamdescription", T.param);
      const idioma = el("input");
      idioma.type = "hidden"; idioma.name = "idioma"; idioma.value = EN ? "en" : "pt";
      const botao = el("button", "apoiar-botao");
      botao.type = "submit";
      botao.innerHTML = ICONE.polegar;
      botao.setAttribute("aria-label", T.rotuloBotao);
      const rotulo = el("span", "apoiar-rotulo", T.botao);
      rotulo.setAttribute("aria-hidden", "true");
      botao.append(rotulo);
      form.append(campo, idioma, botao);
      this.botao = botao; this.rotulo = rotulo;

      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        if (this.apoiado) { this.painel.hidden ? this.abrirPainel() : this.fecharPainel(); return; }
        this.apoiar();
      });
      secao.append(form);

      // Depois de apoiar: agradecimento e botões para compartilhar.
      const depois = el("div", "apoiar-depois");
      depois.hidden = true;
      const status = el("p", "apoiar-status");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      depois.append(status);
      const convite = el("p", "apoiar-convite", T.convite);
      const acoes = el("div", "apoiar-acoes");
      if (navigator.share) {
        const b = el("button", "apoiar-acao principal");
        b.type = "button"; b.innerHTML = ICONE.partilha; b.append(el("span", "", T.compartilhar));
        b.addEventListener("click", () => navigator.share({ title: this.titulo, text: T.textoPartilha(this.titulo), url: enderecoDaPagina() }).catch(() => {}));
        acoes.append(b);
      }
      const wa = el("a", "apoiar-acao" + (navigator.share ? "" : " principal"));
      wa.href = "https://wa.me/?text=" + encodeURIComponent(T.textoPartilha(this.titulo) + " " + enderecoDaPagina());
      wa.target = "_blank"; wa.rel = "noopener";
      wa.innerHTML = ICONE.whatsapp; wa.append(el("span", "", T.whatsapp));
      const copiar = el("button", "apoiar-acao");
      copiar.type = "button"; copiar.innerHTML = ICONE.link;
      const copiarTexto = el("span", "", T.copiar);
      copiar.append(copiarTexto);
      copiar.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(enderecoDaPagina()); copiarTexto.textContent = T.copiado; }
        catch { prompt(T.copiar, enderecoDaPagina()); }
        setTimeout(() => (copiarTexto.textContent = T.copiar), 2500);
      });
      acoes.append(wa, copiar);
      const nota = el("p", "apoiar-nota", T.nota + " ");
      const como = el("a", "", T.como); como.href = T.privacidade;
      nota.append(como);
      depois.append(convite, acoes, nota);
      if (this.demo) depois.append(el("p", "apoiar-demo", T.demo));
      this.depois = depois; this.status = status;

      // Painel que abre em cima do botão, com o agradecimento e o compartilhar.
      {
        const painel = el("div", "apoiar-painel");
        painel.hidden = true;
        const fechar = el("button", "apoiar-fechar");
        fechar.type = "button"; fechar.innerHTML = ICONE.fechar;
        fechar.setAttribute("aria-label", T.fechar);
        // detail 0 = clique pelo teclado: só então o foco volta ao polegar (no toque, nada de contorno).
        fechar.addEventListener("click", (e) => this.fecharPainel(e.detail === 0));
        depois.hidden = false;
        painel.append(fechar, depois);
        secao.prepend(painel);
        this.painel = painel;
        this.observarLeitura(secao);
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !painel.hidden) this.fecharPainel(true); });
      }

      this.secao = secao;
      this.replaceChildren(secao);
    }

    // No computador, aparece quando o título sai da tela e some perto do rodapé, para não cobrir os links.
    observarLeitura(secao) {
      const h1 = document.querySelector("main h1");
      const rodape = document.querySelector("gr-rodape, gr-contribuir");
      let passouTitulo = !h1, noRodape = false;
      const atualizar = () => secao.classList.toggle("visivel", (passouTitulo && !noRodape) || !this.painel.hidden);
      if (!("IntersectionObserver" in window)) { secao.classList.add("visivel"); return; }
      if (h1) new IntersectionObserver(([e]) => { passouTitulo = !e.isIntersecting && e.boundingClientRect.top < 0; atualizar(); }).observe(h1);
      if (rodape) new IntersectionObserver(([e]) => { noRodape = e.isIntersecting; atualizar(); }).observe(rodape);
      this.atualizarVisivel = atualizar;
    }

    abrirPainel() {
      if (!this.painel) return;
      this.painel.hidden = false;
      this.atualizarVisivel?.();
    }
    fecharPainel(teclado) {
      this.painel.hidden = true;
      this.atualizarVisivel?.();
      if (teclado) this.botao.focus();
    }

    // Resposta na hora: o polegar muda e o painel abre no toque, sem esperar o servidor.
    // Se o servidor recusar, o botão volta ao normal e o painel mostra o erro.
    async apoiar() {
      const b = this.botao;
      guardar(this.id_, this.demo);
      this.apoiado = true;
      this.mostrarDepois(null, true);
      if (this.demo) { this.escreverStatus(DEMO_TOTAL, true); return; }
      try {
        const resp = await fetch("/api/propostas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposta: this.id_, idioma: EN ? "en" : "pt" }),
        });
        const dados = await resp.json().catch(() => ({}));
        if (!resp.ok || !dados.ok) throw new Error(dados.erro || T.erro);
        this.escreverStatus(dados.total, true);
      } catch (erro) {
        esquecer(this.id_, false);
        this.apoiado = false;
        b.classList.remove("apoiado");
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", T.rotuloBotao);
        this.rotulo.textContent = T.botao;
        this.secao.classList.remove("feito");
        this.mostrarErro(erro.message || T.erro);
      }
    }

    mostrarErro(msg) {
      this.status.textContent = msg;
      this.depois.hidden = false;
      this.depois.classList.add("so-erro");
      if (this.painel) this.abrirPainel();
    }

    // Estado de quem já apoiou. Na volta à página (animar = false), busca o número no servidor.
    async mostrarDepois(total, animar) {
      const b = this.botao;
      b.classList.add("apoiado");
      b.setAttribute("aria-pressed", "true");
      this.rotulo.textContent = T.apoiado;
      b.setAttribute("aria-label", T.rotuloApoiado);
      this.secao.classList.add("feito");
      this.depois.classList.remove("so-erro");
      if (animar) {
        animar_(b);
        this.abrirPainel();
      }
      this.escreverStatus(total, animar);
      if (animar) return; // o número vem da resposta do envio (apoiar)
      if (total == null && !this.demo) {
        try {
          const dados = await (await fetch("/api/propostas")).json();
          if (dados.ok) this.escreverStatus(dados.apoios?.[this.id_] ?? null, false);
        } catch { /* sem número: fica só o agradecimento */ }
      } else if (total == null && this.demo) {
        this.escreverStatus(DEMO_TOTAL, false);
      }
    }

    escreverStatus(total, agora) {
      // Na volta à página, o botão já diz "Apoiada": aqui fica só o número, se houver.
      this.status.replaceChildren();
      if (agora) this.status.append(el("strong", "", T.obrigado));
      const resto = total != null && total >= MINIMO_PARA_MOSTRAR ? T.pessoas(total - 1) : (agora ? T.contado : "");
      if (resto) this.status.append(agora ? " " : "", resto);
    }
  }

  if (!customElements.get("gr-apoiar")) customElements.define("gr-apoiar", Apoiar);
})();
