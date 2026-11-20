// Monta a página de ideias a partir de window.IDEIAS e lê tudo em voz alta com legendas.
// Usa a Web Speech API do navegador (speechSynthesis). Sem voz disponível, as legendas
// passam sozinhas no ritmo de leitura, então a página funciona em qualquer navegador.
// Para editar o conteúdo, mexa só em ideias.js.

(function () {
  "use strict";

  const IDEIAS = window.IDEIAS || [];
  // Idioma: inglês na versão /en/ideias/ (<html lang="en">), que carrega ideias-en.js no lugar de ideias.js.
  const EN = /^en\b/i.test(document.documentElement.lang);
  const ESTADOS = { "rascunho": "", "em teste": "azul", "pronta para postar": "amarelo", "no ar": "" };
  // Nome do estado como aparece no selo (em ideias-en.js o estado continua em português).
  const NOME_ESTADO = EN ? { "rascunho": "draft", "em teste": "testing", "pronta para postar": "ready to post", "no ar": "live" } : {};
  const T = EN ? {
    ouvir: "Listen to the idea ", problema: "The problem", proposta: "The proposal", criticas: "Criticism and answers",
    critica: "Criticism", resposta: "Answer", emConstrucao: "Answer under construction.", conversar: "Let's talk",
    copiar: "Copy to post", copiado: "Copied!", copie: "Copy the text:", hashtag: "To talk about it online, use the hashtag ",
    semVoz: "Your browser can't read aloud. The captions move on their own at reading pace.",
    semVozIdioma: "I couldn't find an English voice on this device. I'll try reading anyway.",
    fim: "The end. Thanks for listening!", ideia: (a, b) => `Idea ${a} of ${b} · `, frase: (a, b) => `sentence ${a} of ${b}`,
    pausar: "Pause", continuar: "Resume", todas: "Listen to all", deNovo: "Again", outroPais: "",
  } : {
    ouvir: "Ouvir a ideia ", problema: "O problema", proposta: "A proposta", criticas: "Críticas e respostas",
    critica: "Crítica", resposta: "Resposta", emConstrucao: "Resposta em construção.", conversar: "Pra conversar",
    copiar: "Copiar para postar", copiado: "Copiado!", copie: "Copie o texto:", hashtag: "Pra conversar nas redes, use a hashtag ",
    semVoz: "Seu navegador não lê em voz alta. As legendas passam sozinhas no ritmo de leitura.",
    semVozIdioma: "Não achei uma voz em português neste aparelho. Vou tentar ler mesmo assim.",
    fim: "Fim. Obrigado por ouvir!", ideia: (a, b) => `Ideia ${a} de ${b} · `, frase: (a, b) => `frase ${a} de ${b}`,
    pausar: "Pausar", continuar: "Continuar", todas: "Ouvir todas", deNovo: "De novo", outroPais: " · Portugal",
  };
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
      selo.textContent = NOME_ESTADO[ideia.estado || "rascunho"] || ideia.estado || "rascunho";
      const h2 = criar("h2", "frase", cab);
      h2.textContent = ideia.titulo;
      registrar(h2, ideia.titulo + ".", n);

      const btn = criar("button", "tocar", topo);
      btn.type = "button";
      btn.setAttribute("aria-label", T.ouvir + ideia.titulo);
      btn.setAttribute("aria-pressed", "false");
      btn.innerHTML = '<svg class="icone"><use href="#i-play"/></svg>';
      btn.addEventListener("click", () => alternar(porIdeia[n], n));
      botoes[n] = btn;

      if (ideia.gancho) escrever(criar("p", "gancho", art), ideia.gancho, n);

      secao(art, T.problema, n);
      (ideia.problema || []).forEach((p) => escrever(criar("p", "", art), p, n));

      secao(art, T.proposta, n);
      (ideia.proposta || []).forEach((p) => escrever(criar("p", "", art), p, n));

      if (ideia.criticas && ideia.criticas.length) {
        secao(art, T.criticas, n);
        ideia.criticas.forEach((c) => {
          const box = criar("div", "critica", art);
          criar("span", "rotulo", box).textContent = T.critica;
          escrever(criar("p", "pergunta-critica", box), c.critica, n, T.critica + ":");
          criar("span", "rotulo", box).textContent = T.resposta;
          if (c.resposta) {
            escrever(criar("p", "", box), c.resposta, n, T.resposta + ":");
          } else {
            escrever(criar("p", "pendente", box), T.emConstrucao, n);
          }
        });
      }

      if (ideia.pergunta) {
        const conversa = criar("div", "conversa", art);
        const h3 = criar("h3", "frase", conversa);
        h3.textContent = T.conversar;
        h3.style.marginTop = "0";
        registrar(h3, T.conversar + ".", n);
        escrever(criar("p", "", conversa), ideia.pergunta, n);
        if (ideia.hashtag) {
          const tags = criar("div", "hashtags", conversa);
          [ideia.hashtag, window.HASHTAG_GERAL].filter(Boolean).forEach((t) => {
            criar("span", "hashtag", tags).textContent = t;
          });
          const copiar = criar("button", "botao secundario copiar", tags);
          copiar.type = "button";
          copiar.textContent = T.copiar;
          copiar.addEventListener("click", () => copiarPost(ideia, copiar));
          registrarSo(tags, T.hashtag + falarHashtag(ideia.hashtag) + ".", n);
        }
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

  // Registra uma fala que destaca um elemento sem quebrar o texto dele em frases.
  function registrarSo(el, fala, ideia) {
    el.classList.add("frase");
    registrar(el, fala, ideia);
  }

  // "#ReindustrializaBrasil" vira "Reindustrializa Brasil" para a voz não soletrar.
  function falarHashtag(t) {
    return t.replace(/^#/, "").replace(/([a-zà-ú])([A-ZÀ-Ú0-9])/g, "$1 $2");
  }

  function textoDoPost(ideia) {
    const url = location.origin + (EN ? "/en" : "") + "/ideias/#" + ideia.id;
    const tags = [ideia.hashtag, window.HASHTAG_GERAL].filter(Boolean).join(" ");
    return ideia.titulo + "\n\n" + ideia.pergunta + "\n\n" + url + "\n\n" + tags;
  }

  function copiarPost(ideia, botao) {
    const texto = textoDoPost(ideia);
    const pronto = () => {
      botao.textContent = T.copiado;
      setTimeout(() => (botao.textContent = T.copiar), 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(pronto, () => copiarAntigo(texto, pronto));
    } else {
      copiarAntigo(texto, pronto);
    }
  }

  function copiarAntigo(texto, pronto) {
    const area = criar("textarea", "", document.body);
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.select();
    try { document.execCommand("copy"); pronto(); } catch (e) { window.prompt(T.copie, texto); }
    area.remove();
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

  // Vozes "de brincadeira" do macOS (e algumas antigas): ficam fora da lista, ninguém entende.
  const NOVIDADE = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Jester|Junior|Kathy|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
  const CHAVE_VOZ = EN ? "ideias-voz-en" : "ideias-voz";
  // Idioma principal de cada versão: pt-BR (Portugal no fim da lista) ou inglês (EUA e Reino Unido primeiro).
  const PRINCIPAL = EN ? /^en[-_](US|GB)$/i : /^pt[-_]BR$/i;

  // Quanto maior, melhor. As vozes neurais (Edge, Chrome, macOS Premium) vêm primeiro;
  // as de Portugal ficam no fim, mas continuam na lista.
  function pontuar(v) {
    const nome = v.name;
    const br = PRINCIPAL.test(v.lang);
    let p = br ? 50 : 10;
    if (/online|natural|neural/i.test(nome)) p += 50;          // Edge: Francisca, Antonio, Thalita
    else if (/^Google/i.test(nome)) p += 40;                    // Chrome: "Google português do Brasil"
    else if (/premium/i.test(nome)) p += 38;                    // macOS: Luciana (Premium)
    else if (/enhanced|melhorad|aprimorad/i.test(nome)) p += 30; // macOS: Luciana/Felipe (Enhanced)
    if (/luciana|francisca|thalita|aria|jenny|samantha/i.test(nome)) p += 2;
    if (v.localService === false) p += 1;
    return p;
  }

  function rotulo(v) {
    let nome = v.name
      .replace(/^(Microsoft|Google)\s+/i, "")
      .replace(/\s*[-–]\s*(Portugu[eê]s?e?|English).*$/i, "")
      .replace(/\s*\((Portugu[eê]s?e?|Português|English)[^)]*\)+\s*$/i, "")
      .replace(/\s*Online\s*\(Natural\)/i, " (natural)")
      .trim();
    if (/^(português do brasil|US English|UK English (Female|Male))$/i.test(nome)) nome = "Google " + (EN ? nome.replace(/ English/i, "") : "(natural)");
    if (!PRINCIPAL.test(v.lang)) nome += EN ? " · " + v.lang.replace("_", "-") : T.outroPais;
    return nome.slice(0, 36);
  }

  function lerPreferida() {
    try { return localStorage.getItem(CHAVE_VOZ); } catch (e) { return null; }
  }
  function salvarPreferida(nome) {
    try { localStorage.setItem(CHAVE_VOZ, nome); } catch (e) { /* sem armazenamento: tudo bem */ }
  }

  function carregarVozes() {
    if (!synth) return;
    vozes = synth.getVoices()
      .filter((v) => (EN ? /^en/i : /^pt/i).test(v.lang) && !NOVIDADE.test(v.name))
      .sort((a, b) => pontuar(b) - pontuar(a));
    const sel = $("c-voz");
    const atual = (voz && voz.name) || lerPreferida();
    sel.innerHTML = "";
    vozes.forEach((v, i) => {
      const op = criar("option", "", sel);
      op.value = i;
      op.textContent = rotulo(v);
    });
    sel.hidden = vozes.length < 2;
    voz = vozes.find((v) => v.name === atual) || vozes[0] || null;
    if (voz) sel.value = vozes.indexOf(voz);
    avisar();
  }

  function avisar() {
    const aviso = $("aviso");
    // Só vozes simples (sem neural/Premium)? Mostra a dica de como instalar uma melhor.
    $("dica-voz").hidden = !!synth && vozes.some((v) => pontuar(v) >= 80);
    if (!synth) aviso.textContent = T.semVoz;
    else if (synth.getVoices().length && !vozes.length) aviso.textContent = T.semVozIdioma;
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
      $("legenda-texto").textContent = T.fim;
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
      u.lang = EN ? "en-US" : "pt-BR";
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
      (ideias.length > 1 ? T.ideia(ideias.indexOf(item.ideia) + 1, ideias.length) : "") +
      T.frase(estado.pos + 1, n);
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
      (tocandoTodas ? T.pausar : estado.ideiaBotao === "todas" && estado.pos < estado.fila.length ? T.continuar : T.todas);
    const pausa = $("c-pausa");
    pausa.innerHTML = '<svg class="icone"><use href="#i-' + (estado.tocando ? "pause" : "play") + '"/></svg><span>' +
      (estado.tocando ? T.pausar : estado.pos >= estado.fila.length ? T.deNovo : T.continuar) + "</span>";
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
    if (voz) salvarPreferida(voz.name);
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
