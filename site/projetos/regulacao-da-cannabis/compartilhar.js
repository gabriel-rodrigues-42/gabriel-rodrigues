// Frases para compartilhar (PT e EN). Cada .frase tem o texto em data-texto e um
// menu <details> com links de Threads, Facebook, X e WhatsApp, que funcionam sem JavaScript.
// Com JavaScript, o menu ganha "Copiar texto e link" e, onde houver Web Share API,
// "Outros apps" (o menu de compartilhar do celular). Clique fora ou Esc fecha o menu.
(() => {
  const ingles = document.documentElement.lang.startsWith("en");
  const copiado = ingles ? "Text and link copied. Paste it wherever you want." : "Texto e link copiados. É só colar onde quiser.";
  const url = location.origin + location.pathname;
  const menus = [...document.querySelectorAll(".menu-compartilhar")];

  document.querySelectorAll(".frase[data-texto]").forEach((frase) => {
    const texto = frase.dataset.texto;
    const aviso = frase.querySelector(".aviso-copiado");
    const menu = frase.querySelector(".menu-compartilhar");
    const copiar = async () => {
      try {
        await navigator.clipboard.writeText(`${texto} ${url}`);
        aviso.textContent = copiado;
      } catch {
        aviso.textContent = "";
      }
    };

    const botaoCopiar = frase.querySelector("[data-copiar]");
    if (navigator.clipboard) {
      botaoCopiar.hidden = false;
      botaoCopiar.addEventListener("click", () => { menu.open = false; copiar(); });
    }

    const botaoCompartilhar = frase.querySelector("[data-compartilhar]");
    if (navigator.share) {
      botaoCompartilhar.hidden = false;
      botaoCompartilhar.addEventListener("click", async () => {
        menu.open = false;
        try {
          await navigator.share({ text: texto, url });
        } catch (erro) {
          if (erro.name !== "AbortError") copiar();
        }
      });
    }

    menu.addEventListener("toggle", () => {
      if (menu.open) menus.forEach((outro) => { if (outro !== menu) outro.open = false; });
    });
  });

  document.addEventListener("click", (evento) => {
    menus.forEach((menu) => { if (!menu.contains(evento.target)) menu.open = false; });
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    menus.forEach((menu) => {
      if (menu.open) { menu.open = false; menu.querySelector("summary").focus(); }
    });
  });
})();
