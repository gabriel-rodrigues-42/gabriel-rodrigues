/* Página "Qual partido vota como você?". Tudo roda no navegador: as respostas
   ficam só no endereço (#r=...) e não são enviadas a lugar nenhum. */
(() => {
  const EN = document.documentElement.lang.startsWith("en");
  const L = EN ? "en" : "pt";
  const T = EN ? {
    carregando: "Loading the votes…", erro: "Could not load the votes. Reload the page.",
    sim: "Yes", nao: "No", pular: "Skip", contador: (n, t) => `${n} of ${t} answered`,
    resultado: "Parties that voted most like you", vazio: "Answer at least 3 questions to see the result.",
    concordancia: "agreement", em: n => `in ${n} vote${n > 1 ? "s" : ""}`,
    detalhe: "See how it voted", votaram: (s, t) => `${s} of ${t} deputies voted Yes`,
    voce: r => `You: ${r === "s" ? "Yes" : "No"}`, placar: (s, n) => `Result: ${s} Yes, ${n} No`,
    copiar: "Copy link with my answers", copiado: "Link copied.", limpar: "Clear answers",
    poucos: "Parties with fewer than 3 deputies voting in most of these votes are left out.",
    fonte: "See the bill", verResultado: "See result ↓",
  } : {
    carregando: "Carregando as votações…", erro: "Não deu para carregar as votações. Recarregue a página.",
    sim: "Sim", nao: "Não", pular: "Pular", contador: (n, t) => `${n} de ${t} respondidas`,
    resultado: "Partidos que mais votaram como você", vazio: "Responda pelo menos 3 perguntas para ver o resultado.",
    concordancia: "de acordo", em: n => `em ${n} votaç${n > 1 ? "ões" : "ão"}`,
    detalhe: "Ver como votou", votaram: (s, t) => `${s} de ${t} deputados votaram Sim`,
    voce: r => `Você: ${r === "s" ? "Sim" : "Não"}`, placar: (s, n) => `Placar: ${s} Sim, ${n} Não`,
    copiar: "Copiar link com minhas respostas", copiado: "Link copiado.", limpar: "Limpar respostas",
    poucos: "Ficam de fora partidos com menos de 3 deputados votando na maioria destas votações.",
    fonte: "Ver a proposta", verResultado: "Ver resultado ↓",
  };
  const app = document.getElementById("app");
  const res = document.getElementById("resultado");
  const fmtData = d => d ? new Date(d + "T12:00:00").toLocaleDateString(EN ? "en-GB" : "pt-BR", { month: "long", year: "numeric" }) : "";
  let temas = [], resp = {};

  function lerHash() {
    const m = location.hash.match(/r=([snx]+)/);
    resp = {};
    if (m) [...m[1]].forEach((c, i) => { if (temas[i] && c !== "x") resp[temas[i].id] = c; });
  }
  function gravarHash() {
    const s = temas.map(t => resp[t.id] || "x").join("");
    history.replaceState(null, "", /[sn]/.test(s) ? `#r=${s}` : location.pathname);
  }

  function desenharPerguntas() {
    app.innerHTML = `<gr-progresso id="progresso" total="${temas.length}"><a href="#resultado" id="ver-resultado"></a></gr-progresso>
      <ol class="temas">${temas.map((t, i) => `
        <li class="tema" data-leitura-parte>
          <h3 id="p-${t.id}">${i + 1}. ${t.txt.pergunta}</h3>
          <p class="contexto">${t.txt.contexto} <a href="${t.link_proposicao}" rel="noopener">${T.fonte}</a></p>
          <div class="escolhas" role="group" aria-labelledby="p-${t.id}" data-leitura="pular">
            ${["s", "n", "x"].map(v => `<button type="button" class="opcao" data-tema="${t.id}" data-v="${v}" aria-pressed="${v !== "x" && resp[t.id] === v}">${v === "s" ? T.sim : v === "n" ? T.nao : T.pular}</button>`).join("")}
          </div>
        </li>`).join("")}</ol>
      <div class="acoes" data-leitura="pular">
        <button type="button" class="botao secundario" id="limpar">${T.limpar}</button>
        <button type="button" class="botao" id="copiar">${T.copiar}</button>
        <span class="copiado" id="copiado" aria-live="polite"></span>
      </div>`;
    contar();
  }

  // Atualiza a barra fixa sem redesenhar as perguntas: a pessoa continua onde estava na tela.
  function contar() {
    const n = Object.keys(resp).length, barra = document.getElementById("progresso");
    if (!barra) return;
    barra.setAttribute("valor", n);
    barra.setAttribute("rotulo", T.contador(n, temas.length));
    const ver = document.getElementById("ver-resultado");
    ver.textContent = n >= 3 ? T.verResultado : "";
    ver.hidden = n < 3;
  }

  function calcular() {
    const respondidas = temas.filter(t => resp[t.id]);
    if (respondidas.length < 3) { res.innerHTML = `<h2>${T.resultado}</h2><p class="vazio">${T.vazio}</p>`; return; }
    const siglas = new Set(); temas.forEach(t => Object.keys(t.partidos).forEach(s => siglas.add(s)));
    const lista = [];
    siglas.forEach(s => {
      let soma = 0, n = 0; const det = [];
      respondidas.forEach(t => {
        const p = t.partidos[s]; if (!p || p.sim + p.nao < 3) return;
        const pos = p.sim / (p.sim + p.nao), voce = resp[t.id] === "s" ? 1 : 0;
        soma += 1 - Math.abs(voce - pos); n++;
        det.push({ t, p, acordo: 1 - Math.abs(voce - pos) });
      });
      if (n >= Math.ceil(respondidas.length / 2)) lista.push({ s, pct: Math.round(100 * soma / n), n, det });
    });
    lista.sort((a, b) => b.pct - a.pct || b.n - a.n);
    res.innerHTML = `<h2>${T.resultado}</h2>
      <ol class="ranking">${lista.map((x, i) => `
        <li class="partido${i < 3 ? " alto" : ""}">
          <div class="partido-topo"><strong>${x.s}</strong><span class="pct">${x.pct}% <small>${T.concordancia}</small></span></div>
          <div class="progresso${i < 3 ? "" : " amarelo"}" aria-hidden="true"><div style="width:${x.pct}%"></div></div>
          <details><summary>${T.detalhe} <small>(${T.em(x.n)})</small></summary>
            <ul>${x.det.map(d => `<li><strong>${d.t.txt.pergunta}</strong><br>${T.voce(resp[d.t.id])} · ${T.votaram(d.p.sim, d.p.sim + d.p.nao)}</li>`).join("")}</ul>
          </details>
        </li>`).join("")}</ol>
      <p class="pequeno">${T.poucos}</p>`;
  }

  function atualizar() { gravarHash(); desenharPerguntas(); calcular(); }

  app.addEventListener("click", e => {
    // O link da barra rola até o resultado sem trocar o endereço, que guarda as respostas.
    if (e.target.closest("#ver-resultado")) {
      e.preventDefault();
      res.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.tema) {
      const id = b.dataset.tema;
      if (b.dataset.v === "x") delete resp[id]; else resp[id] = b.dataset.v;
      app.querySelectorAll(`[data-tema="${id}"]`).forEach(o => o.setAttribute("aria-pressed", String(o.dataset.v !== "x" && resp[id] === o.dataset.v)));
      gravarHash(); contar(); calcular();
    } else if (b.id === "limpar") { resp = {}; atualizar(); }
    else if (b.id === "copiar") {
      const ok = () => { document.getElementById("copiado").textContent = T.copiado; };
      navigator.clipboard?.writeText(location.href).then(ok, () => {});
    }
  });

  app.textContent = T.carregando;
  fetch("/partidos/dados/votacoes.json").then(r => r.json()).then(d => {
    const porId = Object.fromEntries(d.temas.map(t => [t.id, t]));
    temas = (window.TEMAS_PARTIDOS || []).filter(t => porId[t.id]).map(t => ({ ...porId[t.id], txt: t[L] }));
    lerHash(); desenharPerguntas(); calcular();
    const f = document.getElementById("fonte-datas");
    if (f) f.textContent = (EN ? "Votes from " : "Votações de ") + fmtData(temas[0]?.data) + (EN ? " to " : " a ") + fmtData(temas[temas.length - 1]?.data) + (EN ? ". Data generated on " : ". Dados gerados em ") + new Date(d.gerado_em).toLocaleDateString(EN ? "en-GB" : "pt-BR") + ".";
  }).catch(() => { app.textContent = T.erro; });
  window.addEventListener("hashchange", () => { lerHash(); desenharPerguntas(); calcular(); });
})();
