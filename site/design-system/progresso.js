// Barra de progresso que fica à vista: <gr-progresso>. Use em questionário, wizard ou formulário em passos.
// Quando a pessoa rola para responder a próxima pergunta, a barra gruda no topo da tela
// (logo abaixo do cabeçalho, quando ele também fica fixo) e só solta no fim do bloco que a contém.
//
// Uso, no <head> (sem defer), depois de tokens.css e componentes.css:
//   <link rel="stylesheet" href="/design-system/progresso.css">
//   <script src="/design-system/progresso.js"></script>
// e no começo do bloco do questionário (um .cartao, uma <section>):
//   <gr-progresso valor="3" total="10" rotulo="3 de 10 respondidas"></gr-progresso>
// Mude os atributos pelo JS (el.setAttribute("valor", 4)) e a barra anda, sem redesenhar a página.
// O que for posto dentro do elemento (um link "Ver resultado", por exemplo) aparece à direita do rótulo.
// Sem rotulo, o texto é "valor de total". Dentro de um .cartao, a faixa vai de borda a borda.
// O modo leitura pula a barra.

(function () {
  "use strict";
  if (customElements.get("gr-progresso")) return;

  const raiz = document.documentElement;

  // A barra gruda logo abaixo do cabeçalho enquanto ele estiver à vista; quando ele sai da tela
  // (ou some ao rolar, na versão "topo" do menu), gruda no topo.
  function medirTopo() {
    const topo = document.querySelector(".moldura-topo");
    const fim = topo ? Math.max(0, Math.ceil(topo.getBoundingClientRect().bottom)) : 0;
    raiz.style.setProperty("--progresso-topo", fim + "px");
  }
  let medida = false;
  function vigiarTopo() {
    if (medida) return;
    medida = true;
    medirTopo();
    addEventListener("scroll", medirTopo, { passive: true });
    addEventListener("resize", medirTopo, { passive: true });
    // O cabeçalho chega pelo moldura.js; mede de novo quando ele aparecer ou mudar de tamanho.
    const ro = new ResizeObserver(medirTopo);
    const achar = () => { const t = document.querySelector(".moldura-topo"); if (t) { ro.observe(t); t.addEventListener("transitionend", medirTopo); medirTopo(); } else requestAnimationFrame(achar); };
    achar();
  }

  class GrProgresso extends HTMLElement {
    static get observedAttributes() { return ["valor", "total", "rotulo"]; }

    connectedCallback() {
      // Escrito direto no HTML, o elemento conecta antes dos filhos: espera a página terminar de chegar.
      if (!this.dentro && document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.isConnected && this.connectedCallback(), { once: true });
        return;
      }
      if (!this.dentro) {
        const extra = [...this.childNodes];
        this.dentro = document.createElement("div");
        this.dentro.className = "gr-progresso-dentro";
        this.texto = document.createElement("span");
        this.texto.className = "gr-progresso-texto";
        this.texto.id = "gr-progresso-" + Math.random().toString(36).slice(2, 8);
        const acao = document.createElement("span");
        acao.className = "gr-progresso-acao";
        acao.append(...extra);
        this.barra = document.createElement("div");
        this.barra.className = "progresso";
        this.barra.setAttribute("role", "progressbar");
        this.barra.setAttribute("aria-valuemin", "0");
        this.barra.setAttribute("aria-labelledby", this.texto.id);
        this.preenchido = document.createElement("div");
        this.barra.append(this.preenchido);
        const linha = document.createElement("div");
        linha.className = "gr-progresso-linha";
        linha.append(this.texto, acao);
        this.dentro.append(linha, this.barra);
        this.append(this.dentro);
        this.setAttribute("data-leitura", "pular");
      }
      this.atualizar();
      vigiarTopo();
      // Marca quando a barra está grudada, para ganhar a sombra.
      if (this.olhar) removeEventListener("scroll", this.olhar);
      addEventListener("scroll", this.olhar = () => this.conferir(), { passive: true });
      this.conferir();
    }

    disconnectedCallback() { removeEventListener("scroll", this.olhar); }

    conferir() {
      const topo = parseFloat(getComputedStyle(this).top) || 0;
      const r = this.getBoundingClientRect();
      const pai = this.parentElement.getBoundingClientRect();
      this.toggleAttribute("fixo", Math.abs(r.top - topo) < 1.5 && pai.top < topo - 1);
    }

    attributeChangedCallback() { if (this.dentro) this.atualizar(); }

    atualizar() {
      const total = Math.max(0, Number(this.getAttribute("total")) || 0);
      const valor = Math.min(total, Math.max(0, Number(this.getAttribute("valor")) || 0));
      const rotulo = this.getAttribute("rotulo") || `${valor} / ${total}`;
      this.texto.textContent = rotulo;
      this.barra.setAttribute("aria-valuemax", String(total));
      this.barra.setAttribute("aria-valuenow", String(valor));
      this.barra.setAttribute("aria-valuetext", rotulo);
      this.preenchido.style.width = (total ? (100 * valor) / total : 0) + "%";
      this.toggleAttribute("completo", total > 0 && valor >= total);
    }
  }

  customElements.define("gr-progresso", GrProgresso);
})();
