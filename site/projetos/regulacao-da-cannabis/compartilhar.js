// Cartões para compartilhar (PT e EN). Cada botão [data-compartilhar] tenta, nesta ordem:
// 1. compartilhar a imagem do cartão pelo menu do celular (Web Share API com arquivo);
// 2. compartilhar só o texto e o link;
// 3. copiar o texto e o link para a área de transferência.
// O link do WhatsApp ao lado funciona sempre, sem JavaScript.
(() => {
  const ingles = document.documentElement.lang.startsWith("en");
  const copiado = ingles ? "Text and link copied. Paste it wherever you want." : "Texto e link copiados. É só colar onde quiser.";
  const url = location.origin + location.pathname;

  document.querySelectorAll("[data-compartilhar]").forEach((botao) => {
    const cartao = botao.closest(".cartao-compartilhar");
    const texto = cartao.querySelector("img").alt;
    const aviso = cartao.querySelector(".aviso-copiado");
    botao.hidden = false;
    botao.addEventListener("click", async () => {
      try {
        const resposta = await fetch(botao.dataset.compartilhar);
        const arquivo = new File([await resposta.blob()], botao.dataset.compartilhar.split("/").pop(), { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
          await navigator.share({ files: [arquivo], text: `${texto} ${url}` });
          return;
        }
        if (navigator.share) {
          await navigator.share({ text: texto, url });
          return;
        }
        await navigator.clipboard.writeText(`${texto} ${url}`);
        aviso.textContent = copiado;
      } catch (erro) {
        if (erro.name === "AbortError") return;
        try {
          await navigator.clipboard.writeText(`${texto} ${url}`);
          aviso.textContent = copiado;
        } catch {
          aviso.textContent = "";
        }
      }
    });
  });
})();
