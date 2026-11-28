// Prévia: três animações para o botão Apoiar. Página de teste, fora do menu e do sitemap.
// Todo link para #apoiar (o Apoiar do cabeçalho, o do texto e o do rodapé) passa por aqui.
// A rolagem é feita à mão (requestAnimationFrame) para cada animação saber onde e quando o formulário chega.
// Com movimento reduzido, a página só pula para o formulário, sem efeito.

(function () {
  "use strict";

  const DURACAO_ROLAGEM = 700;
  const sistemaReduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const opcoes = document.querySelectorAll('input[name="animacao"]');
  const simularReduzido = document.getElementById("simular-reduzido");
  const aviso = document.getElementById("aviso-previa");

  // A escolha fica na URL (?opcao=b), para dar para mandar o link de uma delas.
  const daUrl = new URLSearchParams(location.search).get("opcao");
  if (daUrl) opcoes.forEach((o) => { o.checked = o.value === daUrl; });
  opcoes.forEach((o) => o.addEventListener("change", () => {
    const url = new URL(location.href);
    url.searchParams.set("opcao", o.value);
    history.replaceState(null, "", url);
  }));

  const escolhida = () => [...opcoes].find((o) => o.checked)?.value || "a";
  const menosMovimento = () => sistemaReduzido.matches || simularReduzido.checked;

  const suave = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // Onde a página precisa parar para o formulário ficar logo abaixo do topo (respeita o scroll-padding do moldura.css).
  function destino(alvo) {
    const folga = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    return Math.max(0, Math.min(max, scrollY + alvo.getBoundingClientRect().top - folga));
  }

  function rolar(ate, duracao) {
    const de = scrollY;
    return new Promise((pronto) => {
      if (duracao <= 0 || Math.abs(ate - de) < 2) { scrollTo(0, ate); pronto(); return; }
      const inicio = performance.now();
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        scrollTo(0, de + (ate - de) * suave(t));
        if (t < 1) requestAnimationFrame(passo); else pronto();
      };
      requestAnimationFrame(passo);
    });
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const animar = (el, quadros, opcoes) => el.animate(quadros, { fill: "both", ...opcoes }).finished;

  // ---------- A. Aperto e destaque ----------
  // O botão afunda como um botão de verdade, a página desce e o cartão do formulário acende uma vez em amarelo.
  async function destaque(botao, cartao) {
    animar(botao, [{ transform: "scale(1)" }, { transform: "scale(.9)" }, { transform: "scale(1)" }], { duration: 260, easing: "ease-out", fill: "none" });
    await rolar(destino(cartao), DURACAO_ROLAGEM);
    cartao.classList.add("anim-acender");
    const email = cartao.querySelector(".campo-email input");
    email.classList.add("anim-campo");
    await esperar(1100);
    cartao.classList.remove("anim-acender");
    email.classList.remove("anim-campo");
  }

  // ---------- B. O botão vira o formulário ----------
  // Uma pílula verde sai do botão, cresce até cobrir a tela, vira azul e encolhe no formato do cartão.
  // Por trás, a página já foi para o formulário. Depois os campos sobem um a um.
  async function cortina(botao, cartao) {
    const raio = getComputedStyle(cartao).borderRadius;
    const cor = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
    const b = botao.getBoundingClientRect();
    // Duas camadas: a verde sai primeiro e a azul vem logo atrás, deixando uma borda verde passar pela tela.
    const nova = (cor) => {
      const el = document.createElement("div");
      el.className = "anim-capa";
      el.style.backgroundColor = cor;
      el.setAttribute("aria-hidden", "true");
      document.body.append(el);
      return el;
    };
    const verde = nova(cor("--verde-fundo"));
    const capa = nova(cor("--azul"));
    const recorte = (r, borda) => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${borda})`;
    const tela = { top: 0, left: 0, right: innerWidth, bottom: innerHeight };
    const crescer = [{ clipPath: recorte(b, "999px") }, { clipPath: recorte(tela, "0px") }];

    await Promise.all([
      animar(verde, crescer, { duration: 360, easing: "cubic-bezier(.6, 0, .4, 1)" }),
      animar(capa, crescer, { duration: 360, delay: 110, easing: "cubic-bezier(.6, 0, .4, 1)" }),
    ]);
    verde.remove();

    scrollTo(0, destino(cartao));
    const filhos = [...cartao.querySelectorAll("h2, .lead, .campos > *, .consentimento, .botao")];
    filhos.forEach((f) => { f.style.opacity = "0"; });
    const c = cartao.getBoundingClientRect();
    const fim = { top: c.top, left: c.left, right: c.right, bottom: Math.min(c.bottom, innerHeight) };

    await animar(capa, [
      { clipPath: recorte(tela, "0px") },
      { clipPath: recorte(fim, raio) },
    ], { duration: 420, easing: "cubic-bezier(.3, 0, .2, 1)" });
    capa.remove();

    filhos.forEach((f, i) => {
      f.style.opacity = "";
      f.animate([{ opacity: 0, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }],
        { duration: 320, delay: i * 55, easing: "ease-out", fill: "backwards" });
    });
  }

  // ---------- C. Estrela-guia ----------
  // Uma das estrelas do logo sai do botão, faz uma curva e pousa na palavra "tentar" do título,
  // que ganha um sublinhado amarelo desenhado da esquerda para a direita.
  async function estrela(botao, cartao) {
    const palavra = cartao.querySelector("h2 .destaque");
    const b = botao.getBoundingClientRect();
    const para = destino(cartao);
    const p = palavra.getBoundingClientRect();
    const x0 = b.left + b.width / 2, y0 = b.top + b.height / 2;
    // A estrela anda presa à tela; o ponto final é onde a palavra vai estar quando a rolagem acabar
    // (a pontinha de cima, à direita, como as estrelas do logo em volta das pessoas).
    const x1 = p.right + 6, y1 = p.top - (para - scrollY) + 4;
    const astro = document.createElement("span");
    astro.className = "anim-estrela";
    astro.setAttribute("aria-hidden", "true");
    astro.innerHTML = '<svg viewBox="0 0 20 20"><path d="M10 0Q11.4 8.6 20 10Q11.4 11.4 10 20Q8.6 11.4 0 10Q8.6 8.6 10 0Z"/></svg>';
    document.body.append(astro);

    // Curva de Bézier: sai para a esquerda e para baixo, depois vem por cima até a palavra.
    const cx = Math.min(innerWidth * .2, x1 - 60), cy = (y0 + y1) / 2 + innerHeight * .15;
    const quadros = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
      const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      const escala = 1 + Math.sin(t * Math.PI) * .9;
      quadros.push({ transform: `translate(${x - 10}px, ${y - 10}px) rotate(${t * 360}deg) scale(${escala})`, offset: t });
    }
    animar(botao, [{ transform: "scale(1)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }], { duration: 240, easing: "ease-out", fill: "none" });
    await Promise.all([
      animar(astro, quadros, { duration: DURACAO_ROLAGEM + 150, easing: "cubic-bezier(.45, 0, .25, 1)" }),
      rolar(para, DURACAO_ROLAGEM),
    ]);
    palavra.classList.add("anim-sublinhado");
    await animar(astro, [
      { opacity: 1, transform: `translate(${x1 - 10}px, ${y1 - 10}px) rotate(360deg) scale(1)` },
      { opacity: 1, transform: `translate(${x1 - 10}px, ${y1 - 10}px) rotate(400deg) scale(1.5)`, offset: .4 },
      { opacity: 0, transform: `translate(${x1 - 10}px, ${y1 - 10}px) rotate(450deg) scale(.4)` },
    ], { duration: 520, easing: "ease-out" });
    astro.remove();
    await esperar(1400);
    palavra.classList.remove("anim-sublinhado");
  }

  const ANIMACOES = { a: destaque, b: cortina, c: estrela };
  let rodando = false;

  document.addEventListener("click", async (e) => {
    const link = e.target.closest('a[href$="#apoiar"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (rodando) return;
    rodando = true;
    const secao = document.getElementById("apoiar");
    const cartao = secao.querySelector(".apoio");
    try {
      if (menosMovimento()) scrollTo(0, destino(cartao));
      else await ANIMACOES[escolhida()](link, cartao);
    } finally {
      history.replaceState(null, "", location.pathname + location.search + "#apoiar");
      // O foco vai para o título do formulário, para quem usa teclado ou leitor de tela continuar dali.
      const titulo = document.getElementById("titulo-apoio");
      titulo.setAttribute("tabindex", "-1");
      titulo.focus({ preventScroll: true });
      aviso.hidden = false;
      rodando = false;
    }
  });

  document.getElementById("voltar-topo").addEventListener("click", () => {
    scrollTo(0, 0);
    history.replaceState(null, "", location.pathname + location.search);
  });

  // O formulário é só para ver: nada é enviado.
  document.getElementById("form-apoio").addEventListener("submit", (e) => e.preventDefault());
})();
