// Monta a página de ideias a partir de window.IDEIAS e lê tudo em voz alta com legendas.
// Usa a Web Speech API do navegador (speechSynthesis). Sem voz disponível, as legendas
// passam sozinhas no ritmo de leitura, então a página funciona em qualquer navegador.
// Para editar o conteúdo, mexa só em ideias.js.

(function () {
  "use strict";

  const IDEIAS = window.IDEIAS || [];
  const ESTADOS = { "rascunho": "", "em teste": "azul", "pronta para postar": "amarelo" };
  const PALAVRAS_POR_MINUTO = 165; // ritmo das legendas quando não há voz

  const $ = (id) => document.getElementById(id);
  const falas = []; // { fala, el, ideia }
  const porIdeia = []; // índices de falas de cada ideia
  const botoes = [];

  // ---------- Montagem da página ----------

  function criar(tag, classe, pai) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (pai) pai.appendChild(el);
    return el;
  }

  function dividirFrases(texto) {
    return String(texto).trim().split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ú0-9"“])/u).filter(Boolean);
  }

  // Coloca o texto em `pai`, uma <span> por frase, e registra cada frase como fala.
  // `prefixo` é dito só na primeira frase (ex.: "Crítica:"), sem aparecer no texto.
  function escrever(pai, texto, ideia, prefixo) {
    dividirFrases(texto).forEach((frase, i) => {
      if (i > 0) pai.appendChild(document.createTextNode(" "));
      const span = criar("span", "frase", pai);
      span.textContent = frase;
      registrar(span, (i === 0 && prefixo ? prefixo + " " : "") + frase, ideia);
    });
  }

  function registrar(el, fala, ideia) {
    porIdeia[ideia].push(falas.length);
    falas.push({ fala, el, ideia });
  }

  function montar() {
    const lista = $("ideias");
    const indice = $("indice");

    IDEIAS.forEach((ideia, n) => {
      porIdeia[n] = [];
      const art = criar("article", "cartao ideia", lista);
      art.id = ideia.id;

      const li = criar("li", "", indice);
      const a = criar("a", "", li);
      a.href = "#" + ideia.id;
      a.textContent = ideia.titulo;

      const topo = criar("div", "ideia-topo", art);
      const cab = criar("div", "", topo);
      const selo = criar("span", "selo " + (ESTADOS[ideia.estado] || ""), cab);
      selo.textContent = ideia.estado || "rascunho";
      const h2 = criar("h2", "frase", cab);
      h2.textContent = ideia.titulo;
      registrar(h2, ideia.titulo + ".", n);

      const btn = criar("button", "tocar", topo);
      btn.type = "button";
      btn.setAttribute("aria-label", "Ouvir a ideia " + ideia.titulo);
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = '<svg class="icone"><use href="#i-play"/></svg>';
      btn.addEventListener("click", () => alternar(porIdeia[n], n));
      botoes[n] = btn;

      if (ideia.gancho) escrever(criar("p", "gancho", art), ideia.gancho, n);

      secao(art, "O problema", n);
      (ideia.problema || []).forEach((p) => escrever(criar("p", "", art), p, n));

      secao(art, "A proposta", n);
      (ideia.proposta || []).forEach((p) => escrever(criar("p", "", art), p, n));

      if (ideia.criticas && ideia.criticas.length) {
        secao(art, "Críticas e respostas", n);
        ideia.criticas.forEach((c) => {
          const box = criar("div", "critica", art);
          criar("span", "rotulo", box).textContent = "Crítica";
          escrever(criar("p", "pergunta-critica", box), c.critica, n, "Crítica:");
          criar("span", "rotulo", box).textContent = "Resposta";
          if (c.resposta) {
            escrever(criar("p", "", box), c.resposta, n, "Resposta:");
          } else {
            escrever(criar("p", "pendente", box), "Resposta em construção.", n);
          }
        });
      }

      if (ideia.pergunta) {
        const conversa = criar("div", "conversa", art);
        const h3 = criar("h3", "frase", conversa);
        h3.textContent = "Pra conversar";
        h3.style.marginTop = "0";
        registrar(h3, "Pra conversar.", n);
        escrever(criar("p", "", conversa), ideia.pergunta, n);
      }

      if (ideia.links && ideia.links.length) {
        const links = criar("div", "links", art);
        ideia.links.forEach((l) => {
          const link = criar("a", "", links);
          link.href = l.url;
          link.textContent = l.texto + " →";
        });
      }
    });
  }

  function secao(art, titulo, n) {
    const h3 = criar("h3", "frase", art);
    h3.textContent = titulo;
    registrar(h3, titulo + ".", n);
  }

  // ---------- Vozes ----------

  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let vozes = [];
  let voz = null;

  function pontuar(v) {
    let p = 0;
    if (/^pt[-_]BR$/i.test(v.lang)) p += 10;
    else if (/^pt/i.test(v.lang)) p += 5;
    if (/natural|online|neural|google|luciana|francisca|thalita/i.test(v.name)) p += 2;
    return p;
  }

  function carregarVozes() {
    if (!synth) return;
    vozes = synth.getVoices().filter((v) => /^pt/i.test(v.lang)).sort((a, b) => pontuar(b) - pontuar(a));
    const sel = $("c-voz");
    const atual = voz && voz.name;
    sel.innerHTML = "";
    vozes.forEach((v, i) => {
      const op = criar("option", "", sel);
      op.value = i;
      op.textContent = v.name.replace(/^Microsoft |^Google /, "").slice(0, 32);
    });
    sel.hidden = vozes.length < 2;
    voz = vozes.find((v) => v.name === atual) || vozes[0] || null;
    if (voz) sel.value = vozes.indexOf(voz);
    avisar();
  }

  function avisar() {
    const aviso = $("aviso");
    if (!synth) aviso.textContent = "Seu navegador não lê em voz alta. As legendas passam sozinhas no ritmo de leitura.";
    else if (synth.getVoices().length && !vozes.length) aviso.textContent = "Não achei uma voz em português neste aparelho. Vou tentar ler mesmo assim.";
    else aviso.textContent = "";
  }

  // ---------- Leitura ----------

  const estado = { fila: [], pos: 0, tocando: false, ideiaBotao: null, token: 0, timer: null, utterance: null };

  function alternar(fila, ideiaBotao) {
    const mesma = estado.fila.length && estado.ideiaBotao === ideiaBotao;
    if (mesma && estado.tocando) return pausar();
    if (mesma && !estado.tocando && estado.pos < estado.fila.length) return continuar();
    iniciar(fila, ideiaBotao);
  }

  function iniciar(fila, ideiaBotao) {
    estado.fila = fila;
    estado.pos = 0;
    estado.ideiaBotao = ideiaBotao;
    $("legenda").classList.add("aberta");
    continuar();
  }

  function continuar() {
    estado.tocando = true;
    falar();
    atualizarBotoes();
  }

  function pausar() {
    estado.tocando = false;
    silenciar();
    atualizarBotoes();
  }

  function parar() {
    pausar();
    estado.fila = [];
    estado.ideiaBotao = null;
    marcar(null);
    $("legenda").classList.remove("aberta");
    atualizarBotoes();
  }

  function silenciar() {
    estado.token++;
    clearTimeout(estado.timer);
    if (synth) synth.cancel();
  }

  function pular(delta) {
    if (!estado.fila.length) return;
    estado.pos = Math.max(0, Math.min(estado.fila.length - 1, estado.pos + delta));
    if (estado.tocando) falar();
    else mostrar(falas[estado.fila[estado.pos]]);
  }

  function avancar() {
    estado.pos++;
    if (estado.pos >= estado.fila.length) {
      estado.tocando = false;
      estado.pos = estado.fila.length;
      marcar(null);
      $("legenda-texto").textContent = "Fim. Obrigado por ouvir!";
      $("legenda-barra").style.width = "100%";
      atualizarBotoes();
      return;
    }
    falar();
  }

  function falar() {
    silenciar();
    if (estado.pos >= estado.fila.length) estado.pos = 0;
    const item = falas[estado.fila[estado.pos]];
    const palavras = mostrar(item);
    const token = estado.token;
    const rate = parseFloat($("c-velocidade").value) || 1;

    if (synth) {
      const u = new SpeechSynthesisUtterance(item.fala);
      u.lang = "pt-BR";
      if (voz) u.voice = voz;
      u.rate = rate;
      let teveFronteira = false;
      u.onboundary = (e) => {
        if (token !== estado.token || e.name === "sentence") return;
        teveFronteira = true;
        destacarAte(palavras, e.charIndex);
      };
      u.onend = () => {
        if (token !== estado.token) return;
        if (!teveFronteira) destacarAte(palavras, Infinity);
        estado.timer = setTimeout(() => token === estado.token && avancar(), 120);
      };
      u.onerror = (e) => {
        if (token !== estado.token || e.error === "interrupted" || e.error === "canceled") return;
        // Sem permissão ou sem voz: segue no ritmo de leitura.
        porTempo(palavras, token, rate);
      };
      estado.utterance = u; // evita que o Chrome descarte a fala antes do fim
      // O Chrome às vezes ignora um speak() logo depois de cancel().
      estado.timer = setTimeout(() => token === estado.token && synth.speak(u), 60);
    } else {
      porTempo(palavras, token, rate);
    }
  }

  function porTempo(palavras, token, rate) {
    const passo = 60000 / (PALAVRAS_POR_MINUTO * rate);
    let i = 0;
    const tique = () => {
      if (token !== estado.token) return;
      if (i < palavras.length) {
        destacarAte(palavras, palavras[i].inicio);
        i++;
        estado.timer = setTimeout(tique, passo);
      } else {
        estado.timer = setTimeout(() => token === estado.token && avancar(), 250);
      }
    };
    tique();
  }

  // Escreve a fala na barra de legendas, uma <span> por palavra, e devolve as palavras.
  function mostrar(item) {
    const caixa = $("legenda-texto");
    caixa.textContent = "";
    const palavras = [];
    const re = /\S+/g;
    let m;
    let ultimo = 0;
    while ((m = re.exec(item.fala))) {
      if (m.index > ultimo) caixa.appendChild(document.createTextNode(item.fala.slice(ultimo, m.index)));
      const span = criar("span", "palavra", caixa);
      span.textContent = m[0];
      palavras.push({ el: span, inicio: m.index });
      ultimo = m.index + m[0].length;
    }
    $("legenda-titulo").textContent = IDEIAS[item.ideia].titulo;
    const n = estado.fila.length;
    $("legenda-barra").style.width = (n ? (estado.pos / n) * 100 : 0) + "%";
    const ideias = [...new Set(estado.fila.map((i) => falas[i].ideia))];
    $("legenda-progresso").textContent =
      (ideias.length > 1 ? "Ideia " + (ideias.indexOf(item.ideia) + 1) + " de " + ideias.length + " · " : "") +
      "frase " + (estado.pos + 1) + " de " + n;
    marcar(item);
    return palavras;
  }

  function destacarAte(palavras, charIndex) {
    palavras.forEach((p) => p.el.classList.toggle("dita", p.inicio <= charIndex));
  }

  let marcado = null;
  function marcar(item) {
    if (marcado) marcado.classList.remove("atual");
    document.querySelectorAll(".ideia.tocando").forEach((el) => el.classList.remove("tocando"));
    marcado = item ? item.el : null;
    if (!item) return;
    marcado.classList.add("atual");
    const cartao = marcado.closest(".ideia");
    cartao.classList.add("tocando");
    const r = marcado.getBoundingClientRect();
    const alturaLegenda = $("legenda").offsetHeight;
    if (r.top < 60 || r.bottom > window.innerHeight - alturaLegenda - 20) {
      const destino = window.scrollY + r.top - (window.innerHeight - alturaLegenda) / 2 + r.height / 2;
      window.scrollTo({ top: Math.max(0, destino), behavior: "smooth" });
    }
  }

  function atualizarBotoes() {
    const tocandoIdeia = estado.tocando && typeof estado.ideiaBotao === "number" ? estado.ideiaBotao : null;
    botoes.forEach((b, n) => {
      const ativo = tocandoIdeia === n;
      b.setAttribute("aria-pressed", String(ativo));
      b.innerHTML = '<svg class="icone"><use href="#i-' + (ativo ? "pause" : "play") + '"/></svg>';
    });
    const todas = $("ouvir-todas");
    const tocandoTodas = estado.tocando && estado.ideiaBotao === "todas";
    todas.innerHTML = '<svg class="icone"><use href="#i-' + (tocandoTodas ? "pause" : "play") + '"/></svg>' +
      (tocandoTodas ? "Pausar" : estado.ideiaBotao === "todas" && estado.pos < estado.fila.length ? "Continuar" : "Ouvir todas");
    const pausa = $("c-pausa");
    pausa.innerHTML = '<svg class="icone"><use href="#i-' + (estado.tocando ? "pause" : "play") + '"/></svg><span>' +
      (estado.tocando ? "Pausar" : estado.pos >= estado.fila.length ? "De novo" : "Continuar") + "</span>";
  }

  // ---------- Início ----------

  montar();
  const todasFalas = falas.map((_, i) => i);
  $("ouvir-todas").addEventListener("click", () => alternar(todasFalas, "todas"));
  $("c-pausa").addEventListener("click", () => (estado.tocando ? pausar() : continuar()));
  $("c-parar").addEventListener("click", parar);
  $("c-anterior").addEventListener("click", () => pular(-1));
  $("c-proxima").addEventListener("click", () => pular(1));
  $("c-velocidade").addEventListener("change", () => estado.tocando && falar());
  $("c-voz").addEventListener("change", (e) => {
    voz = vozes[+e.target.value] || null;
    if (estado.tocando) falar();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && estado.fila.length) parar();
  });
  // Clicar numa frase começa a leitura dali.
  document.getElementById("ideias").addEventListener("click", (e) => {
    const el = e.target.closest(".frase");
    if (!el || e.target.closest("button, a")) return;
    const i = falas.findIndex((f) => f.el === el);
    if (i < 0) return;
    const fila = estado.ideiaBotao === "todas" ? todasFalas : porIdeia[falas[i].ideia];
    const marcaBotao = estado.ideiaBotao === "todas" ? "todas" : falas[i].ideia;
    estado.fila = fila;
    estado.ideiaBotao = marcaBotao;
    estado.pos = fila.indexOf(i);
    $("legenda").classList.add("aberta");
    continuar();
  });

  if (synth) {
    carregarVozes();
    synth.addEventListener ? synth.addEventListener("voiceschanged", carregarVozes) : (synth.onvoiceschanged = carregarVozes);
  } else {
    avisar();
  }
  atualizarBotoes();
  window.addEventListener("pagehide", () => synth && synth.cancel());
})();
