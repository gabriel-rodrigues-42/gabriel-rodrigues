// Cartão de vídeo curto: toca o YouTube Short dentro da página, sem mandar a pessoa embora.
//
// Uso, no <head>:
//   <link rel="stylesheet" href="/design-system/video-curto.css">
//   <script src="/design-system/video-curto.js" defer></script>
// e no lugar do cartão (de preferência logo depois da abertura):
//   <a class="video-curto" href="https://youtube.com/shorts/ID">
//     <span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
//     <span><strong>Prefere ver em vídeo?</strong><span class="suave">Assista ao vídeo curto.</span></span>
//   </a>
//
// Ao tocar, abre uma janela (<dialog>) com o player do youtube-nocookie.com.
// O player só carrega no toque: antes disso, nenhum peso e nenhum cookie do YouTube.
// Ao fechar, o player sai da página e o vídeo para. Sem JavaScript, o link abre no YouTube.
// Os textos seguem o lang da página (pt ou en).

(function () {
  "use strict";

  const en = document.documentElement.lang.startsWith("en");
  const T = en
    ? { fechar: "Close video", fora: "Open on YouTube", titulo: "Short video on YouTube" }
    : { fechar: "Fechar vídeo", fora: "Abrir no YouTube", titulo: "Vídeo curto no YouTube" };

  function idDoLink(href) {
    try {
      const u = new URL(href);
      const m = u.pathname.match(/^\/(?:shorts|embed)\/([\w-]{6,})/);
      if (m) return m[1];
      if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
      return u.searchParams.get("v");
    } catch { return null; }
  }

  let janela, tela, fora;
  function montarJanela() {
    janela = document.createElement("dialog");
    janela.className = "video-curto-janela";
    janela.setAttribute("aria-label", T.titulo);
    janela.innerHTML =
      '<div class="caixa"><div class="tela"></div><div class="acoes">' +
      '<button type="button" class="fechar"></button><a class="fora" rel="noopener"></a></div></div>';
    tela = janela.querySelector(".tela");
    fora = janela.querySelector(".fora");
    const fechar = janela.querySelector(".fechar");
    fechar.textContent = T.fechar;
    fora.textContent = T.fora;
    fechar.addEventListener("click", () => janela.close());
    // Tocar fora do vídeo também fecha.
    janela.addEventListener("click", (e) => { if (e.target === janela) janela.close(); });
    janela.addEventListener("close", () => { tela.replaceChildren(); });
    document.body.append(janela);
  }

  function abrir(link, id) {
    if (!janela) montarJanela();
    const quadro = document.createElement("iframe");
    quadro.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
      "?autoplay=1&playsinline=1&rel=0";
    quadro.title = T.titulo;
    quadro.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    quadro.allowFullscreen = true;
    quadro.referrerPolicy = "strict-origin-when-cross-origin";
    tela.replaceChildren(quadro);
    fora.href = link.href;
    janela.showModal();
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.video-curto");
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    if (typeof HTMLDialogElement !== "function") return;
    const id = idDoLink(link.href);
    if (!id) return;
    e.preventDefault();
    abrir(link, id);
  });
})();
