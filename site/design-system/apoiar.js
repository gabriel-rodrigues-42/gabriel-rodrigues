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
// Três formatos (atributo layout), para o Gabriel escolher:
//   polegar    botão em pílula logo depois da abertura (o componente se muda para lá sozinho)
//   cartao     cartão no fim da página, com a pergunta "Esta proposta faz sentido para você?" (padrão)
//   flutuante  botão redondo que acompanha a leitura no canto da tela
// Prévia: ?apoio=a|b|c em qualquer proposta troca o formato e liga o modo demonstração
// (não grava nada, o número é de exemplo). Página com os links: /previa-apoio/.
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
  const LETRAS = { a: "polegar", b: "cartao", c: "flutuante" };

  const T = EN ? {
    botao: "I support this proposal",
    botaoCurto: "Support",
    apoiado: "You support this proposal",
    apoiadoCurto: "Supported",
    selo: "Your support",
    titulo: "Does this proposal make sense to you?",
    texto: "The proposals with the most support move up the list.",
    nota: "Anonymous, once per device.",
    como: "How it works",
    obrigado: "Thank you for your support.",
    contado: "Your support was counted.",
    pessoas: (n) => n === 1 ? "You and 1 other person support this proposal." : `You and ${n.toLocaleString("en")} other people support this proposal.`,
    convite: "Send it to someone who should read it:",
    compartilhar: "Share",
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
    privacidade: "/en/privacidade/#propostas",
  } : {
    botao: "Apoio esta proposta",
    botaoCurto: "Apoiar",
    apoiado: "Você apoia esta proposta",
    apoiadoCurto: "Apoiada",
    selo: "Seu apoio",
    titulo: "Esta proposta faz sentido para você?",
    texto: "As propostas mais apoiadas sobem na lista.",
    nota: "Anônimo, um por aparelho.",
    como: "Como funciona",
    obrigado: "Obrigado pelo apoio.",
    contado: "Seu apoio foi contado.",
    pessoas: (n) => n === 1 ? "Você e mais 1 pessoa apoiam esta proposta." : `Você e mais ${n.toLocaleString("pt-BR")} pessoas apoiam esta proposta.`,
    convite: "Mande para alguém que precisa ler:",
    compartilhar: "Compartilhar",
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
    privacidade: "/privacidade/#propostas",
  };

  const calmo = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ICONE = {
    polegar: '<svg viewBox="0 0 24 24" aria-hidden="true" class="icone-polegar"><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9Z"/></svg>',
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

  // Estrelas do logo que saem do polegar (só a festa; nada depende delas).
  function estrelas(alvo) {
    if (calmo()) return;
    const caixa = el("span", "apoiar-estrelas");
    caixa.setAttribute("aria-hidden", "true");
    const n = 6;
    for (let i = 0; i < n; i++) {
      const s = el("span", "apoiar-estrela");
      s.innerHTML = ICONE.estrela;
      const ang = (-90 + (i - (n - 1) / 2) * 34) * Math.PI / 180;
      const dist = 34 + (i % 2) * 14;
      s.style.setProperty("--x", `${Math.cos(ang) * dist}px`);
      s.style.setProperty("--y", `${Math.sin(ang) * dist}px`);
      s.style.setProperty("--atraso", `${i * 25}ms`);
      caixa.append(s);
    }
    alvo.append(caixa);
    setTimeout(() => caixa.remove(), 1000);
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
      const letra = (params.get("apoio") || "").toLowerCase();
      this.demo = letra in LETRAS;
      this.layout = this.demo ? LETRAS[letra] : (this.getAttribute("layout") || "cartao");
      if (!Object.values(LETRAS).includes(this.layout)) this.layout = "cartao";
      this.id_ = this.getAttribute("proposta") || slugDaPagina();
      if (!this.id_) return;
      this.titulo = (document.title.split(" · ")[0] || "").trim();

      // Voltou do envio sem JavaScript.
      if (params.get("apoiou") === "1" && !this.demo) guardar(this.id_, false);
      this.apoiado = guardado(this.demo).has(this.id_);

      if (this.layout === "polegar") this.mudarParaAbertura();
      this.montar();
      if (this.apoiado) this.mostrarDepois(null, false);
    }

    // No formato polegar, o botão fica logo depois da abertura (lead e cartão de vídeo).
    mudarParaAbertura() {
      const lead = document.querySelector("main .lead");
      if (!lead) return;
      let depois = lead;
      while (depois.nextElementSibling && depois.nextElementSibling.matches(".video-curto")) depois = depois.nextElementSibling;
      depois.after(this);
    }

    montar() {
      const L = this.layout;
      const secao = el("section", `apoiar apoiar-${L}`);
      secao.id = "apoiar-proposta";
      secao.setAttribute("aria-label", T.botao);

      if (L === "cartao") {
        secao.removeAttribute("aria-label");
        secao.setAttribute("aria-labelledby", "apoiar-titulo");
        secao.append(el("span", "selo", T.selo));
        const h2 = el("h2", "apoiar-titulo", T.titulo);
        h2.id = "apoiar-titulo";
        h2.dataset.leitura = "pular";
        const p = el("p", "apoiar-texto frases", T.texto);
        if (window.grFrases) window.grFrases(p);
        secao.append(h2, p);
      }

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
      const rotulo = el("span", "apoiar-rotulo", L === "flutuante" ? T.botaoCurto : T.botao);
      botao.append(rotulo);
      form.append(campo, idioma, botao);
      this.botao = botao; this.rotulo = rotulo;

      form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        if (this.apoiado) { if (L === "flutuante") this.abrirPainel(); return; }
        this.apoiar();
      });
      secao.append(form);

      if (L !== "flutuante") {
        const nota = el("p", "apoiar-nota", T.nota + " ");
        const a = el("a", "", T.como); a.href = T.privacidade;
        nota.append(a);
        this.nota = nota;
        secao.append(nota);
      }

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
      depois.append(convite, acoes);
      if (this.demo) depois.append(el("p", "apoiar-demo", T.demo));
      this.depois = depois; this.status = status;

      if (L === "flutuante") {
        // Painel que abre em cima do botão, com o agradecimento e o compartilhar.
        const painel = el("div", "apoiar-painel");
        painel.hidden = true;
        const fechar = el("button", "apoiar-fechar");
        fechar.type = "button"; fechar.innerHTML = ICONE.fechar;
        fechar.setAttribute("aria-label", T.fechar);
        fechar.addEventListener("click", () => this.fecharPainel());
        depois.hidden = false;
        painel.append(fechar, depois);
        secao.prepend(painel);
        this.painel = painel;
        this.observarLeitura(secao);
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !painel.hidden) this.fecharPainel(); });
      } else {
        secao.append(depois);
      }

      this.secao = secao;
      this.replaceChildren(secao);
    }

    // Flutuante: aparece quando o título sai da tela e some perto do rodapé, para não cobrir os links.
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
    fecharPainel() {
      this.painel.hidden = true;
      this.atualizarVisivel?.();
      this.botao.focus();
    }

    async apoiar() {
      const b = this.botao;
      b.disabled = true;
      b.classList.add("apertado");
      let total = null;
      if (this.demo) {
        total = DEMO_TOTAL;
        await new Promise((r) => setTimeout(r, 250));
      } else {
        try {
          const resp = await fetch("/api/propostas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proposta: this.id_, idioma: EN ? "en" : "pt" }),
          });
          const dados = await resp.json().catch(() => ({}));
          if (!resp.ok || !dados.ok) throw new Error(dados.erro || T.erro);
          total = dados.total;
        } catch (erro) {
          b.disabled = false;
          b.classList.remove("apertado");
          this.mostrarErro(erro.message || T.erro);
          return;
        }
      }
      guardar(this.id_, this.demo);
      this.apoiado = true;
      this.mostrarDepois(total, true);
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
      b.disabled = false;
      b.classList.remove("apertado");
      b.classList.add("apoiado");
      b.setAttribute("aria-pressed", "true");
      this.rotulo.textContent = this.layout === "flutuante" ? T.apoiadoCurto : T.apoiado;
      this.secao.classList.add("feito");
      this.depois.classList.remove("so-erro");
      if (animar) {
        estrelas(b);
        if (!calmo()) {
          b.classList.add("festa");
          setTimeout(() => b.classList.remove("festa"), 700);
        }
      }
      if (this.layout === "flutuante") {
        if (animar) this.abrirPainel();
      } else {
        this.depois.hidden = false;
      }
      this.escreverStatus(total, animar);
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
      // Na volta à página, o botão já diz "Você apoia": aqui fica só o número, se houver.
      this.status.replaceChildren();
      if (agora) this.status.append(el("strong", "", T.obrigado));
      const resto = total != null && total >= MINIMO_PARA_MOSTRAR ? T.pessoas(total - 1) : (agora ? T.contado : "");
      if (resto) this.status.append(agora ? " " : "", resto);
    }
  }

  if (!customElements.get("gr-apoiar")) customElements.define("gr-apoiar", Apoiar);
})();
