/* Sem citar nomes: escolhe a situação, sorteia uma saída e monta o dicionário de arquétipos.
   Textos em saidas.js (PT) ou saidas-en.js (EN), escolhidos pelo <html lang>. */
(function () {
  const D = window.SEM_NOMES;
  const en = document.documentElement.lang.startsWith("en");
  const T = en ? {
    escolha: "What did they say to you?",
    sortear: "Get a comeback", outra: "Another one", copiar: "Copy", copiado: "Copied",
    serio: "Then, to get serious:", ver: "See it in the dictionary",
    jeito: "How they operate", piada: "The joke", sistema: "The real problem"
  } : {
    escolha: "O que falaram para você?",
    sortear: "Sortear uma saída", outra: "Sortear outra", copiar: "Copiar", copiado: "Copiado",
    serio: "Se quiser puxar para o sério:", ver: "Ver no dicionário",
    jeito: "O jeito", piada: "A piada", sistema: "O sistema"
  };
  const arq = Object.fromEntries(D.arquetipos.map(a => [a.id, a]));
  const app = document.getElementById("sorteio");
  const lista = document.getElementById("lista-arquetipos");
  let atual = null, ultima = -1;

  const el = (tag, attrs = {}, ...filhos) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) k === "class" ? e.className = v : e.setAttribute(k, v);
    for (const f of filhos) e.append(f);
    return e;
  };

  // Situações
  const grade = el("div", { class: "situacoes", role: "group", "aria-label": T.escolha });
  D.situacoes.forEach(s => {
    const b = el("button", { type: "button", class: "opcao", "aria-pressed": "false", "data-id": s.id }, s.rotulo);
    b.addEventListener("click", () => { escolher(s); });
    grade.append(b);
  });
  const resposta = el("div", { class: "resposta", "aria-live": "polite" });
  app.replaceChildren(el("p", { class: "pergunta" }, T.escolha), grade, resposta);

  function escolher(s) {
    atual = s; ultima = -1;
    grade.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.id === s.id)));
    sortear();
    const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
    resposta.scrollIntoView({ block: "nearest", behavior: reduz ? "auto" : "smooth" });
  }

  function sortear() {
    const n = atual.saidas.length;
    let i = Math.floor(Math.random() * n);
    if (n > 1 && i === ultima) i = (i + 1 + Math.floor(Math.random() * (n - 1))) % n;
    ultima = i;
    const s = atual.saidas[i];
    const acoes = el("div", { class: "acoes", "data-leitura": "pular" });
    const outra = el("button", { type: "button", class: "botao" }, T.outra);
    outra.addEventListener("click", sortear);
    const copiar = el("button", { type: "button", class: "botao secundario" }, T.copiar);
    copiar.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(s.piada + " " + s.fecho); copiar.textContent = "✓ " + T.copiado; }
      catch { copiar.disabled = true; }
      setTimeout(() => { copiar.textContent = T.copiar; copiar.disabled = false; }, 2000);
    });
    acoes.append(outra, copiar);
    const bloco = el("figure", { class: "saida" },
      el("blockquote", {}, el("p", { class: "piada" }, s.piada)),
      el("figcaption", {}, el("span", { class: "serio" }, T.serio + " "), s.fecho));
    resposta.replaceChildren(bloco);
    const a = arq[s.ref];
    if (a) resposta.append(el("p", { class: "ref" }, el("a", { class: "link-seta", href: "#" + a.id }, T.ver + ": " + a.nome + " →")));
    resposta.append(acoes);
  }

  // Dicionário
  D.arquetipos.forEach(a => {
    lista.append(el("li", { class: "arquetipo cartao", id: a.id },
      el("h3", {}, a.nome),
      el("p", { class: "obra" }, a.obra),
      el("dl", {},
        el("dt", {}, T.jeito), el("dd", {}, a.jeito),
        el("dt", {}, T.piada), el("dd", {}, a.piada),
        el("dt", {}, T.sistema), el("dd", {}, a.sistema))));
  });
})();
