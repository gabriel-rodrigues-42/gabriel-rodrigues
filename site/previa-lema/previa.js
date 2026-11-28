// Prévia temporária: três animações para o botão "Prefiro este" da votação do lema.
// Nada é enviado: os números são de exemplo. Quem pede menos movimento vê o resultado direto.
(() => {
  const en = document.documentElement.lang === "en";
  const PCT = { entrega: 41, conversa: 59 };
  const calmo = matchMedia("(prefers-reduced-motion: reduce)");
  const css = getComputedStyle(document.documentElement);
  const cor = (n) => css.getPropertyValue(n).trim();
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  function mostrar(demo, escolha, { encher = true } = {}) {
    for (const c of demo.querySelectorAll(".voto")) {
      const o = c.dataset.opcao;
      c.querySelector(".botao").hidden = true;
      c.querySelector(".voto-pct").textContent = PCT[o].toLocaleString(en ? "en" : "pt-BR") + "%";
      c.querySelector(".voto-resultado").hidden = false;
      c.classList.toggle("escolhido", o === escolha);
      c.querySelector(".voto-seu").hidden = o !== escolha;
      const barra = c.querySelector(".voto-barra span");
      if (encher) requestAnimationFrame(() => barra.style.setProperty("--pct", PCT[o]));
    }
  }

  function encher(demo) {
    for (const c of demo.querySelectorAll(".voto")) c.querySelector(".voto-barra span").style.setProperty("--pct", PCT[c.dataset.opcao]);
  }

  function zerar(demo) {
    for (const c of demo.querySelectorAll(".voto")) {
      c.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      c.querySelector(".confete")?.remove();
      c.querySelector(".botao").hidden = false;
      c.querySelector(".voto-resultado").hidden = true;
      c.querySelector(".voto-seu").hidden = true;
      c.classList.remove("escolhido");
      c.querySelector(".voto-barra span").style.removeProperty("--pct");
    }
  }

  // A. Carimbo: o botão afunda, o selo "Seu voto" cai na borda como um carimbo e o contorno amarelo se fecha.
  async function carimbo(demo, cartao, botao) {
    await botao.animate([{ transform: "scale(1)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }], { duration: 180, easing: "ease-out" }).finished;
    mostrar(demo, cartao.dataset.opcao);
    cartao.animate(
      [{ outlineOffset: "16px", outlineColor: "transparent" }, { outlineOffset: "2px", outlineColor: cor("--amarelo") }],
      { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    cartao.querySelector(".voto-seu").animate(
      [
        { transform: "translateY(-50%) scale(2.4) rotate(-14deg)", opacity: 0 },
        { transform: "translateY(-50%) scale(.9) rotate(3deg)", opacity: 1, offset: 0.7 },
        { transform: "translateY(-50%) scale(1) rotate(0)", opacity: 1 },
      ],
      { duration: 440, delay: 140, easing: "cubic-bezier(.3,.7,.3,1)", fill: "backwards" }
    );
    cartao.animate([{ transform: "none" }, { transform: "translateY(3px)" }, { transform: "none" }], { duration: 220, delay: 420 });
  }

  // B. O botão vira a barra: cada botão encolhe até virar a barra de resultado, e a barra enche.
  async function viraBarra(demo, cartao) {
    const cartoes = [...demo.querySelectorAll(".voto")];
    const antes = cartoes.map((c) => c.querySelector(".botao").getBoundingClientRect());
    const cores = cartoes.map((c) => getComputedStyle(c.querySelector(".botao")).backgroundColor);
    mostrar(demo, cartao.dataset.opcao, { encher: false });
    const animacoes = cartoes.map((c, i) => {
      const barra = c.querySelector(".voto-barra");
      const depois = barra.getBoundingClientRect();
      const a = antes[i];
      const atraso = c === cartao ? 0 : 90;
      c.querySelector(".voto-pct").animate([{ opacity: 0, transform: "translateX(-8px)" }, { opacity: 1, transform: "none" }], { duration: 300, delay: atraso + 380, fill: "backwards" });
      return barra.animate(
        [
          { transformOrigin: "0 0", transform: `translate(${a.left - depois.left}px, ${a.top - depois.top}px) scale(${a.width / depois.width}, ${a.height / depois.height})`, background: cores[i] },
          { transformOrigin: "0 0", transform: "none", background: cor("--azul-claro") },
        ],
        { duration: 420, delay: atraso, easing: "cubic-bezier(.5,0,.2,1)", fill: "backwards" }
      ).finished;
    });
    cartao.querySelector(".voto-seu").animate(
      [{ transform: "translateY(-160%)", opacity: 0 }, { transform: "translateY(-50%)", opacity: 1 }],
      { duration: 360, delay: 300, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "backwards" }
    );
    cartao.animate([{ outlineColor: "transparent" }, { outlineColor: cor("--amarelo") }], { duration: 300, delay: 300, fill: "backwards" });
    await Promise.all(animacoes);
    encher(demo);
  }

  // C. Confete: pedacinhos verdes, amarelos e azuis saem do botão e o selo aparece com um leve salto.
  async function confete(demo, cartao, botao) {
    const r = cartao.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    const x = b.left - r.left + b.width / 2;
    const y = b.top - r.top + b.height / 2;
    await botao.animate([{ transform: "scale(1)" }, { transform: "scale(.92)" }, { transform: "scale(1)" }], { duration: 160 }).finished;
    const camada = document.createElement("div");
    camada.className = "confete";
    camada.setAttribute("aria-hidden", "true");
    const cores = [cor("--verde"), cor("--amarelo"), cor("--azul-medio"), cor("--verde-fundo"), cor("--amarelo-escuro")];
    const formas = ["", "tira", "estrela"];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement("i");
      p.className = formas[i % 3];
      p.style.background = cores[i % cores.length];
      p.style.left = x - 5 + "px";
      p.style.top = y - 5 + "px";
      camada.append(p);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
      const dist = 60 + Math.random() * 80;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      const giro = (Math.random() - 0.5) * 540;
      p.animate(
        [
          { transform: "translate(0,0) rotate(0) scale(.4)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${giro / 2}deg) scale(1)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${dx * 1.15}px, ${dy + 40}px) rotate(${giro}deg) scale(.8)`, opacity: 0 },
        ],
        { duration: 800 + Math.random() * 300, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }
      );
    }
    cartao.append(camada);
    mostrar(demo, cartao.dataset.opcao);
    cartao.querySelector(".voto-seu").animate(
      [{ transform: "translateY(-50%) scale(0)" }, { transform: "translateY(-50%) scale(1.15)", offset: 0.6 }, { transform: "translateY(-50%) scale(1)" }],
      { duration: 380, delay: 120, easing: "ease-out", fill: "backwards" }
    );
    setTimeout(() => camada.remove(), 1300);
  }

  const ANIMACOES = { carimbo, "vira-barra": viraBarra, confete };

  for (const demo of document.querySelectorAll(".demo")) {
    demo.addEventListener("click", (e) => {
      const botao = e.target.closest(".voto .botao");
      if (botao) {
        const cartao = botao.closest(".voto");
        if (demo.dataset.votou) return;
        demo.dataset.votou = "1";
        if (calmo.matches) return mostrar(demo, cartao.dataset.opcao);
        ANIMACOES[demo.dataset.animacao](demo, cartao, botao);
      }
      if (e.target.closest("[data-repetir]")) { zerar(demo); delete demo.dataset.votou; }
    });
  }
})();
