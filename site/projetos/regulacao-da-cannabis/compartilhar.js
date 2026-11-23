// Frases para compartilhar (PT e EN). Cada cartão tem o texto em data-texto.
// Os links de Threads, Facebook, X e WhatsApp funcionam sem JavaScript.
// Com JavaScript, aparecem mais dois botões:
// [data-compartilhar] abre o menu de compartilhar do celular (Web Share API) com texto e link;
// [data-copiar] copia o texto e o link para colar em qualquer rede.
(() => {
  const ingles = document.documentElement.lang.startsWith("en");
  const copiado = ingles ? "Text and link copied. Paste it wherever you want." : "Texto e link copiados. É só colar onde quiser.";
  const url = location.origin + location.pathname;

  document.querySelectorAll(".cartao-compartilhar").forEach((cartao) => {
    const texto = cartao.dataset.texto;
    const aviso = cartao.querySelector(".aviso-copiado");
    const copiar = async () => {
      try {
        await navigator.clipboard.writeText(`${texto} ${url}`);
        aviso.textContent = copiado;
      } catch {
        aviso.textContent = "";
      }
    };

    const botaoCopiar = cartao.querySelector("[data-copiar]");
    if (navigator.clipboard) {
      botaoCopiar.hidden = false;
      botaoCopiar.addEventListener("click", copiar);
    }

    const botaoCompartilhar = cartao.querySelector("[data-compartilhar]");
    if (navigator.share) {
      botaoCompartilhar.hidden = false;
      botaoCompartilhar.addEventListener("click", async () => {
        try {
          await navigator.share({ text: texto, url });
        } catch (erro) {
          if (erro.name !== "AbortError") copiar();
        }
      });
    }
  });
})();
