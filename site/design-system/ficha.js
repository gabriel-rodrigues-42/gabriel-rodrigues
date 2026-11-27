// Cartão "Apoio nº" em tela cheia, depois que a pessoa envia o formulário de apoio (página inicial, PT e EN).
// A página escreve os textos do cartão e chama grFicha.abrir(dialog, numero, formatar).
// O cartão aparece sozinho na tela (bom para print), o número sobe de 0 até o da pessoa
// e os botões compartilham ou salvam uma imagem do cartão. Sem animação com prefers-reduced-motion.
//
// Marcação (dentro de um <dialog class="ficha">):
//   .ficha-cartao com .ficha-rotulo, .ficha-numero, .ficha-frase e .ficha-rodape
//   [data-ficha="compartilhar"]  aparece só se o navegador compartilha arquivos (Web Share)
//   [data-ficha="salvar"]        baixa a imagem; some quando o compartilhar aparece
//   <form method="dialog"> com o botão de fechar
//   data-texto no <dialog>: texto que vai junto da imagem ao compartilhar
//   data-arquivo no <dialog>: nome do arquivo da imagem

(function () {
  "use strict";

  const calmo = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  function contar(alvo, numero, formatar) {
    if (calmo() || numero < 2) { alvo.textContent = formatar(numero); return; }
    const duracao = Math.min(1400, 600 + numero * 40);
    const inicio = performance.now();
    alvo.textContent = formatar(0);
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      const suave = 1 - Math.pow(1 - t, 3);
      alvo.textContent = formatar(Math.round(numero * suave));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // ------------------------------------------------------------ imagem do cartão (1080×1350, formato de post)
  function caminhoArredondado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function quebrar(ctx, texto, largura) {
    const linhas = [];
    let linha = "";
    for (const palavra of texto.split(" ")) {
      const teste = linha ? linha + " " + palavra : palavra;
      if (ctx.measureText(teste).width > largura && linha) { linhas.push(linha); linha = palavra; }
      else linha = teste;
    }
    if (linha) linhas.push(linha);
    return linhas;
  }

  async function desenhar(dialog, numeroFinal) {
    const css = getComputedStyle(document.documentElement);
    const cor = (nome, reserva) => css.getPropertyValue(nome).trim() || reserva;
    const azul = cor("--azul", "#002776"), amarelo = cor("--amarelo", "#ffdf00");
    const fonte = cor("--fonte", "sans-serif");
    try { await document.fonts.ready; } catch { /* segue com a fonte do sistema */ }

    const q = (s) => dialog.querySelector(s).textContent.trim();
    const W = 1080, H = 1350, M = 90, P = 70;
    const tela = document.createElement("canvas");
    tela.width = W; tela.height = H;
    const ctx = tela.getContext("2d");
    ctx.fillStyle = azul;
    ctx.fillRect(0, 0, W, H);

    // Textos medidos antes, para centralizar o cartão na altura
    const largura = W - 2 * M - 2 * P;
    ctx.font = `700 52px ${fonte}`;
    const frase = quebrar(ctx, q(".ficha-frase"), largura);
    let tamanhoNumero = 300;
    ctx.font = `900 ${tamanhoNumero}px ${fonte}`;
    while (ctx.measureText(numeroFinal).width > largura && tamanhoNumero > 80) {
      tamanhoNumero -= 10;
      ctx.font = `900 ${tamanhoNumero}px ${fonte}`;
    }
    const alturaCartao = P + 50 + 30 + tamanhoNumero + 50 + frase.length * 68 + 40 + 40 + P;
    const y0 = (H - alturaCartao) / 2;

    ctx.fillStyle = "rgba(0, 0, 0, .25)";
    caminhoArredondado(ctx, M, y0 + 16, W - 2 * M, alturaCartao, 56);
    ctx.fill();
    ctx.fillStyle = amarelo;
    caminhoArredondado(ctx, M, y0, W - 2 * M, alturaCartao, 56);
    ctx.fill();

    ctx.fillStyle = azul;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    let y = y0 + P + 50;
    ctx.font = `800 50px ${fonte}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
    ctx.fillText(q(".ficha-rotulo").toUpperCase(), W / 2, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    y += 30 + tamanhoNumero * 0.86;
    ctx.font = `900 ${tamanhoNumero}px ${fonte}`;
    ctx.fillText(numeroFinal, W / 2, y);
    y += tamanhoNumero * 0.14 + 50;
    ctx.font = `700 52px ${fonte}`;
    for (const linha of frase) { y += 68; ctx.fillText(linha, W / 2, y - 16); }
    y += 40 + 40;
    ctx.font = `400 40px ${fonte}`;
    ctx.fillText(q(".ficha-rodape"), W / 2, y - 10);

    return new Promise((ok) => tela.toBlob(ok, "image/png"));
  }

  function abrir(dialog, numero, formatar = (n) => String(n)) {
    const final = formatar(numero);
    const compartilhar = dialog.querySelector('[data-ficha="compartilhar"]');
    const salvar = dialog.querySelector('[data-ficha="salvar"]');
    const nomeArquivo = dialog.dataset.arquivo || "apoio.png";
    let imagem = null;
    const pegarImagem = async () => (imagem ||= new File([await desenhar(dialog, final)], nomeArquivo, { type: "image/png" }));

    // Compartilhar só aparece se o navegador aceita mandar arquivo; senão, fica o salvar.
    let podeCompartilhar = false;
    try { podeCompartilhar = !!navigator.canShare && navigator.canShare({ files: [new File([""], nomeArquivo, { type: "image/png" })] }); } catch { /* sem Web Share */ }
    if (compartilhar) compartilhar.hidden = !podeCompartilhar;
    if (salvar) salvar.hidden = podeCompartilhar;

    if (compartilhar) compartilhar.onclick = async () => {
      try {
        await navigator.share({ files: [await pegarImagem()], text: dialog.dataset.texto || "" });
      } catch (e) {
        if (e && e.name !== "AbortError" && salvar) { salvar.hidden = false; compartilhar.hidden = true; }
      }
    };
    if (salvar) salvar.onclick = async () => {
      const url = URL.createObjectURL(await pegarImagem());
      const a = Object.assign(document.createElement("a"), { href: url, download: nomeArquivo });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    dialog.querySelector(".ficha-numero").textContent = calmo() ? final : formatar(0);
    dialog.showModal();
    // Foco no cartão, não no primeiro botão: assim nenhum contorno de foco aparece no print.
    dialog.querySelector(".ficha-cartao").focus({ preventScroll: true });
    contar(dialog.querySelector(".ficha-numero"), numero, formatar);
  }

  window.grFicha = { abrir };
})();
