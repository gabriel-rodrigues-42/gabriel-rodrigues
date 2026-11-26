// Modo leitura: lê em voz alta o texto de qualquer página do site, com legendas.
// A pessoa liga no rodapé (moldura.js), que carrega este arquivo e o leitor.css e chama GRLeitor.ligar().
// Ligado, aparece um botão "Ouvir a página" depois do <h1> e um ▶ em cada parte: cada <h2> do <main>,
// ou cada elemento com data-leitura-parte (ex.: cada ideia em /ideias/; o valor é o nome da parte, "Ideia").
// O ▶ começa a ler dali e segue até o fim da página.
//
// O que é lido: todo texto visível do <main>, na ordem da página, inclusive o que está dentro de
// <details> fechado (abre na hora de ler). Ficam de fora formulários, botões, menus, selos e o que
// tiver data-leitura="pular". Atributos opcionais:
//   data-leitura-fala="..."     fala este texto no lugar do conteúdo do elemento
//   data-leitura-prefixo="..."  diz isto antes da primeira frase (ex.: "Crítica:"), sem mostrar no texto
// Usa a Web Speech API (speechSynthesis). Sem voz, as legendas passam sozinhas no ritmo de leitura.

(function () {
  "use strict";
  if (window.GRLeitor) return;

  const EN = /^en\b/i.test(document.documentElement.lang);
  const T = EN ? {
    regiao: "Captions", pagina: "Listen to the page", todas: "Listen to all", ouvirParte: "Read aloud from here: ",
    pausar: "Pause", continuar: "Resume", deNovo: "Again", parar: "Stop",
    anterior: "Previous sentence", proxima: "Next sentence", voz: "Voice", velocidade: "Speed",
    parte: "Part", frase: "sentence", de: "of", fim: "The end. Thanks for listening!",
    dicaBotao: "Robotic voice? See how to get a better one", fechar: "Close", outroPais: "",
    dicaTitulo: "You can install a better voice for free",
    dica: [
      "<strong>Chrome</strong> (any computer): pick the <strong>Google US</strong> or <strong>Google UK</strong> voice in the caption bar. It needs internet.",
      "<strong>Edge</strong> (Windows or Mac): pick <strong>Aria (natural)</strong>, <strong>Jenny (natural)</strong> or <strong>Guy (natural)</strong>. They are the most natural English voices.",
      "<strong>Mac and iPhone</strong> (Safari): open System Settings › Accessibility › Spoken Content › System Voice › Manage Voices, look for English and download a <strong>Premium</strong> or <strong>Enhanced</strong> voice, such as Ava or Zoe. Then reload the page.",
      "<strong>Android</strong>: in Settings › Text-to-speech output, use Google's engine and download the English voice.",
    ],
  } : {
    regiao: "Legendas", pagina: "Ouvir a página", todas: "Ouvir todas", ouvirParte: "Ouvir a partir daqui: ",
    pausar: "Pausar", continuar: "Continuar", deNovo: "De novo", parar: "Parar",
    anterior: "Frase anterior", proxima: "Próxima frase", voz: "Voz", velocidade: "Velocidade",
    parte: "Parte", frase: "frase", de: "de", fim: "Fim. Obrigado por ouvir!",
    dicaBotao: "Voz robótica? Veja como ter uma melhor", fechar: "Fechar", outroPais: " · Portugal",
    dicaTitulo: "Dá para instalar uma voz melhor, de graça",
    dica: [
      "<strong>Chrome</strong> (qualquer computador): escolha a voz <strong>Google (natural)</strong> na barra de legendas. Ela precisa de internet.",
      "<strong>Edge</strong> (Windows ou Mac): escolha <strong>Francisca (natural)</strong> ou <strong>Antonio (natural)</strong>. São as vozes mais naturais em português do Brasil.",
      "<strong>Mac e iPhone</strong> (Safari): abra Ajustes do Sistema › Acessibilidade › Conteúdo Falado › Voz do Sistema › Gerenciar Vozes, procure Português (Brasil) e baixe <strong>Luciana (Premium)</strong> ou <strong>Felipe (Melhorada)</strong>. Depois recarregue a página.",
      "<strong>Android</strong>: em Configurações › Conversão de texto em voz, use o mecanismo do Google e baixe a voz em Português (Brasil).",
    ],
  };
  const PALAVRAS_POR_MINUTO = 165; // ritmo das legendas quando não há voz
  const VELOCIDADES = [["0.85", EN ? "0.85×" : "0,85×"], ["1", "1×"], ["1.2", EN ? "1.2×" : "1,2×"], ["1.5", EN ? "1.5×" : "1,5×"]];

  // Blocos de texto (cada um vira uma ou mais falas) e o que nunca é lido.
  const BLOCO = "h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,summary,dt,dd,caption,tr,[data-leitura-fala]";
  const FORA = "form,button,input,select,textarea,label,nav,script,style,svg,noscript,template,dialog," +
    "[aria-hidden='true'],[data-leitura='pular'],.selo,.leitor-tocar,.leitor-pagina,gr-contribuir,gr-cabecalho,gr-rodape";
  const realce = !!(window.CSS && CSS.highlights && window.Highlight);

  const ICONES = {
    play: '<path d="M8 5.5c0-1.1 1.2-1.8 2.2-1.2l9 6.5c.8.6.8 1.8 0 2.4l-9 6.5c-1 .6-2.2-.1-2.2-1.2z"/>',
    pause: '<rect x="6" y="5" width="4.5" height="14" rx="2"/><rect x="13.5" y="5" width="4.5" height="14" rx="2"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="3"/>',
    prev: '<rect x="5" y="5" width="3" height="14" rx="1.5"/><path d="M19 6.5c0-.9-1-1.4-1.7-.9l-7.5 5.5c-.6.4-.6 1.4 0 1.8l7.5 5.5c.7.5 1.7 0 1.7-.9z"/>',
    next: '<rect x="16" y="5" width="3" height="14" rx="1.5"/><path d="M5 6.5c0-.9 1-1.4 1.7-.9l7.5 5.5c.6.4.6 1.4 0 1.8l-7.5 5.5c-.7.5-1.7 0-1.7-.9z"/>',
    dica: '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 14.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm1.3-4.6v.6h-2.5v-.9c0-1.3.8-1.9 1.5-2.4.6-.4 1-.7 1-1.3 0-.7-.6-1.1-1.3-1.1-.8 0-1.4.5-1.5 1.3L8 8.6C8.3 6.8 9.9 5.8 12 5.8c2.2 0 3.8 1.2 3.8 3 0 1.4-.9 2.1-1.6 2.6-.5.4-.9.6-.9 1.2z"/>',
  };
  const icone = (nome) => `<svg class="leitor-icone" viewBox="0 0 24 24" aria-hidden="true">${ICONES[nome]}</svg>`;

  function criar(tag, classe, pai, html) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (html != null) el.innerHTML = html;
    if (pai) pai.appendChild(el);
    return el;
  }

  // ---------- O que ler ----------

  const main = () => document.querySelector("main") || document.body;

  // Partes da página: cada [data-leitura-parte] ou, sem elas, cada <h2>. O texto antes da primeira parte
  // é a "abertura" (título é o <h1>).
  function partesMarcadas() { return [...main().querySelectorAll("[data-leitura-parte]")]; }
  function cabecasDasPartes() {
    const marcadas = partesMarcadas();
    if (marcadas.length) return marcadas.map((p) => p.querySelector("h2, h3")).filter(Boolean);
    return [...main().querySelectorAll("h2")].filter((h) => !h.closest(FORA) && visivel(h));
  }
  function nomeDaParte() {
    const marcada = partesMarcadas()[0];
    return (marcada && marcada.dataset.leituraParte) || T.parte;
  }

  function visivel(el) {
    if (el.getClientRects().length) return true;
    // Dentro de <details> fechado: conta como visível se o <details> está na tela.
    const det = el.closest("details:not([open])");
    return !!det && det.getClientRects().length > 0 && !el.closest("summary");
  }

  // Bloco de um nó de texto: o BLOCO mais próximo ou, sem ele, o primeiro ancestral que não é "inline".
  function blocoDe(no, raiz) {
    let el = no.parentElement;
    const marcado = el.closest(BLOCO);
    if (marcado && raiz.contains(marcado)) return marcado;
    while (el && el !== raiz && getComputedStyle(el).display === "inline") el = el.parentElement;
    return el || raiz;
  }

  // Lê o <main> na hora (assim pega o resultado atual das calculadoras) e devolve as falas, em ordem.
  function coletar() {
    const raiz = main();
    const blocos = new Map(); // elemento -> nós de texto
    const andar = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode(no) {
        if (!/[\p{L}\p{N}]/u.test(no.nodeValue)) return NodeFilter.FILTER_REJECT;
        const pai = no.parentElement;
        if (!pai || pai.closest(FORA)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    let no;
    while ((no = andar.nextNode())) {
      const bloco = blocoDe(no, raiz);
      const fala = bloco.closest("[data-leitura-fala]");
      const chave = fala && raiz.contains(fala) ? fala : bloco;
      if (!blocos.has(chave)) blocos.set(chave, []);
      blocos.get(chave).push(no);
    }
    // Elementos com fala própria e sem texto visível (ex.: só ícones) também entram.
    raiz.querySelectorAll("[data-leitura-fala]").forEach((el) => { if (!el.closest(FORA) && !blocos.has(el)) blocos.set(el, []); });

    const cabecas = cabecasDasPartes();
    const marcadas = partesMarcadas();
    const titulo = (document.querySelector("main h1") || document.querySelector("h1") || {}).textContent || document.title;
    const ordem = [...blocos.keys()].filter((el) => visivel(el) || el.hasAttribute("data-leitura-fala"))
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

    const falas = [];
    ordem.forEach((el) => {
      // Parte do bloco: a parte marcada que o contém ou o último <h2> antes dele.
      let parte = -1;
      if (marcadas.length) parte = marcadas.findIndex((p) => p.contains(el));
      else cabecas.forEach((h, i) => { if (h === el || (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) parte = i; });
      const tituloParte = parte >= 0 ? limpar(cabecas[parte] ? cabecas[parte].textContent : titulo) : limpar(titulo);
      frasesDo(el, blocos.get(el)).forEach((f) => falas.push(Object.assign(f, { el, parte, titulo: tituloParte })));
    });
    return { falas, partes: cabecas.length };
  }

  const limpar = (s) => String(s).replace(/\s+/g, " ").trim();
  const pontuado = (s) => (/[.!?…:;]["”)]*$/.test(s) ? s : s + ".");

  // Dois pedaços de texto precisam de espaço entre eles? Sim se há um <br> no meio
  // ou se estão em caixas diferentes (ex.: <span> com display: block dentro do título).
  function separados(a, b) {
    const r = new Range();
    r.setStartAfter(a);
    r.setEndBefore(b);
    if (r.cloneContents().querySelector("br")) return true;
    const caixa = (n) => { let el = n.parentElement; while (el && getComputedStyle(el).display === "inline") el = el.parentElement; return el; };
    return caixa(a) !== caixa(b);
  }

  // Divide o texto do bloco em frases. Cada frase guarda onde começa e termina no texto bruto,
  // para virar um Range e ser realçada na página (CSS Custom Highlight, quando o navegador tem).
  function frasesDo(el, nos) {
    if (el.hasAttribute("data-leitura-fala")) return [{ fala: el.dataset.leituraFala, faixa: null }];
    if (el.tagName === "TR") {
      const cab = [...(el.closest("table") || el).querySelectorAll("thead th")].map((th) => limpar(th.textContent));
      const celulas = [...el.cells].map((c) => limpar(c.textContent)).filter(Boolean);
      const fala = celulas.map((c, i) => (cab[i] && el.parentElement.tagName !== "THEAD" ? cab[i] + ": " + c : c)).join(", ");
      return fala ? [{ fala: pontuado(fala), faixa: null }] : [];
    }
    let bruto = "";
    const mapa = nos.map((n, i) => {
      if (i > 0 && separados(nos[i - 1], n) && !/\s$/.test(bruto)) bruto += " ";
      const ini = bruto.length;
      bruto += n.nodeValue;
      return { n, ini };
    });
    const onde = (i) => {
      let k = mapa.length - 1;
      while (k > 0 && mapa[k].ini > i) k--;
      return [mapa[k].n, Math.min(i - mapa[k].ini, mapa[k].n.nodeValue.length)];
    };
    const frases = [];
    const fim = /[.!?…]+["”)]*\s+(?=[\p{Lu}\p{N}"“(])/gu;
    let ini = 0;
    let m;
    const pegar = (a, b) => {
      const trecho = bruto.slice(a, b);
      if (!/[\p{L}\p{N}]/u.test(trecho)) return;
      const esq = a + (trecho.length - trecho.trimStart().length);
      const dir = b - (trecho.length - trecho.trimEnd().length);
      frases.push({ fala: limpar(trecho), ini: esq, fim: dir });
    };
    while ((m = fim.exec(bruto))) { pegar(ini, m.index + m[0].trimEnd().length); ini = m.index + m[0].length; }
    pegar(ini, bruto.length);
    if (!frases.length) return [];
    frases[frases.length - 1].fala = pontuado(frases[frases.length - 1].fala);
    if (el.dataset.leituraPrefixo) frases[0].fala = el.dataset.leituraPrefixo + " " + frases[0].fala;
    return frases.map((f) => {
      let faixa = null;
      if (realce && nos.length) {
        try {
          faixa = new Range();
          faixa.setStart(...onde(f.ini));
          faixa.setEnd(...onde(f.fim));
        } catch (e) { faixa = null; }
      }
      return { fala: f.fala, faixa };
    });
  }

  // ---------- Barra de legendas ----------

  let barra = null;
  const $ = (sel) => barra.querySelector(sel);

  function montarBarra() {
    barra = criar("div", "leitor");
    barra.setAttribute("role", "region");
    barra.setAttribute("aria-label", T.regiao);
    barra.setAttribute("lang", EN ? "en" : "pt-BR");
    barra.inert = true;
    barra.innerHTML = `
      <div class="leitor-dentro">
        <div class="leitor-barra"><div></div></div>
        <div class="leitor-titulo"></div>
        <div class="leitor-texto" aria-live="polite"></div>
        <div class="leitor-controles">
          <button type="button" class="leitor-botao leitor-so-icone" data-acao="anterior" aria-label="${T.anterior}">${icone("prev")}</button>
          <button type="button" class="leitor-botao leitor-pausa" data-acao="pausa">
            <span class="leitor-pilha"><span data-icone="pause">${icone("pause")}</span><span data-icone="play">${icone("play")}</span></span>
            <span class="leitor-pilha"><span data-rotulo="pausar">${T.pausar}</span><span data-rotulo="continuar">${T.continuar}</span><span data-rotulo="deNovo">${T.deNovo}</span></span>
          </button>
          <button type="button" class="leitor-botao leitor-so-icone" data-acao="proxima" aria-label="${T.proxima}">${icone("next")}</button>
          <button type="button" class="leitor-botao leitor-parar" data-acao="parar">${icone("stop")}<span>${T.parar}</span></button>
        </div>
        <div class="leitor-opcoes">
          <select class="leitor-voz" aria-label="${T.voz}"></select>
          <select class="leitor-velocidade" aria-label="${T.velocidade}">${VELOCIDADES.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>
          <button type="button" class="leitor-botao leitor-so-icone leitor-dica-botao" data-acao="dica" aria-label="${T.dicaBotao}" title="${T.dicaBotao}" hidden>${icone("dica")}</button>
          <span class="leitor-progresso"><span class="leitor-longo"></span><span class="leitor-curto" aria-hidden="true"></span></span>
        </div>
      </div>
      <dialog class="leitor-dica" aria-labelledby="leitor-dica-titulo">
        <h2 id="leitor-dica-titulo">${T.dicaTitulo}</h2>
        <ul>${T.dica.map((d) => `<li>${d}</li>`).join("")}</ul>
        <form method="dialog"><button class="botao verde">${T.fechar}</button></form>
      </dialog>`;
    document.body.appendChild(barra);

    barra.addEventListener("click", (e) => {
      const b = e.target.closest("[data-acao]");
      if (!b) return;
      ({
        anterior: () => pular(-1),
        proxima: () => pular(1),
        pausa: () => (estado.tocando ? pausar() : continuar()),
        parar,
        dica: () => $(".leitor-dica").showModal(),
      })[b.dataset.acao]();
    });
    const vel = $(".leitor-velocidade");
    vel.value = lerPref("velocidade") || "1";
    vel.addEventListener("change", () => { salvarPref("velocidade", vel.value); if (estado.tocando) falar(); });
    $(".leitor-voz").addEventListener("change", (e) => {
      voz = vozes[+e.target.value] || null;
      if (voz) salvarPref("voz", voz.name);
      if (estado.tocando) falar();
    });
    carregarVozes();
  }

  // ---------- Vozes ----------

  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let vozes = [];
  let voz = null;

  // Vozes "de brincadeira" do macOS (e algumas antigas): ficam fora da lista, ninguém entende.
  const NOVIDADE = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Fred|Good News|Grandma|Grandpa|Jester|Junior|Kathy|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/i;
  // Idioma principal de cada versão: pt-BR (Portugal no fim da lista) ou inglês (EUA e Reino Unido primeiro).
  const PRINCIPAL = EN ? /^en[-_](US|GB)$/i : /^pt[-_]BR$/i;

  const chave = (nome) => "gr-leitor-" + nome + (EN ? "-en" : "");
  function lerPref(nome) {
    try {
      return localStorage.getItem(chave(nome)) || (nome === "voz" ? localStorage.getItem(EN ? "ideias-voz-en" : "ideias-voz") : null);
    } catch (e) { return null; }
  }
  function salvarPref(nome, valor) { try { localStorage.setItem(chave(nome), valor); } catch (e) { /* sem armazenamento: tudo bem */ } }

  // Quanto maior, melhor. As vozes neurais (Edge, Chrome, macOS Premium) vêm primeiro;
  // as de Portugal ficam no fim, mas continuam na lista.
  function pontuar(v) {
    const nome = v.name;
    let p = PRINCIPAL.test(v.lang) ? 50 : 10;
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

  function carregarVozes() {
    if (!barra) return;
    const sel = $(".leitor-voz");
    if (!synth) { sel.hidden = true; return; }
    vozes = synth.getVoices()
      .filter((v) => (EN ? /^en/i : /^pt/i).test(v.lang) && !NOVIDADE.test(v.name))
      .sort((a, b) => pontuar(b) - pontuar(a));
    const atual = (voz && voz.name) || lerPref("voz");
    sel.innerHTML = vozes.map((v, i) => `<option value="${i}">${rotulo(v).replace(/</g, "&lt;")}</option>`).join("");
    sel.hidden = vozes.length < 2;
    voz = vozes.find((v) => v.name === atual) || vozes[0] || null;
    if (voz) sel.value = vozes.indexOf(voz);
    // Só vozes simples (sem neural/Premium)? Mostra o botão com a dica de como instalar uma melhor.
    $(".leitor-dica-botao").hidden = vozes.some((v) => pontuar(v) >= 80);
  }

  // ---------- Leitura ----------

  const estado = { falas: [], partes: 0, pos: 0, tocando: false, aberto: false, token: 0, timer: null, utterance: null };

  function abrir() {
    if (!barra) montarBarra();
    estado.aberto = true;
    barra.inert = false;
    barra.classList.add("aberta");
    document.documentElement.classList.add("leitor-aberto");
    document.documentElement.style.setProperty("--leitor-altura", barra.offsetHeight + "px");
  }

  // Começa a ler a página a partir da parte `parte` (-1: do começo).
  function iniciar(parte) {
    const lido = coletar();
    estado.falas = lido.falas;
    estado.partes = lido.partes;
    if (!estado.falas.length) return;
    const i = parte >= 0 ? estado.falas.findIndex((f) => f.parte === parte) : 0;
    estado.pos = Math.max(0, i);
    abrir();
    continuar();
  }

  // Começa a ler a partir de um bloco que a pessoa clicou.
  function iniciarEm(el) {
    const lido = coletar();
    const i = lido.falas.findIndex((f) => f.el === el || el.contains(f.el) || f.el.contains(el));
    if (i < 0) return false;
    estado.falas = lido.falas;
    estado.partes = lido.partes;
    estado.pos = i;
    abrir();
    continuar();
    return true;
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
    estado.falas = [];
    estado.aberto = false;
    marcar(null);
    if (barra) {
      barra.classList.remove("aberta");
      barra.inert = true;
    }
    document.documentElement.classList.remove("leitor-aberto");
    atualizarBotoes();
  }

  function silenciar() {
    estado.token++;
    clearTimeout(estado.timer);
    if (synth) synth.cancel();
  }

  function pular(delta) {
    if (!estado.falas.length) return;
    estado.pos = Math.max(0, Math.min(estado.falas.length - 1, estado.pos + delta));
    if (estado.tocando) falar();
    else { mostrar(estado.falas[estado.pos]); atualizarBotoes(); }
  }

  function avancar() {
    estado.pos++;
    if (estado.pos >= estado.falas.length) {
      estado.tocando = false;
      estado.pos = estado.falas.length;
      marcar(null);
      $(".leitor-texto").textContent = T.fim;
      $(".leitor-barra > div").style.width = "100%";
      atualizarBotoes();
      return;
    }
    falar();
  }

  function falar() {
    silenciar();
    if (estado.pos >= estado.falas.length) estado.pos = 0;
    const item = estado.falas[estado.pos];
    const palavras = mostrar(item);
    const token = estado.token;
    const rate = parseFloat($(".leitor-velocidade").value) || 1;

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
        porTempo(palavras, token, rate); // sem permissão ou sem voz: segue no ritmo de leitura
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

  // Escreve a fala na legenda, uma <span> por palavra, e devolve as palavras.
  function mostrar(item) {
    const caixa = $(".leitor-texto");
    caixa.textContent = "";
    caixa.scrollTop = 0;
    const palavras = [];
    const re = /\S+/g;
    let m;
    let ultimo = 0;
    while ((m = re.exec(item.fala))) {
      if (m.index > ultimo) caixa.appendChild(document.createTextNode(item.fala.slice(ultimo, m.index)));
      const span = criar("span", "leitor-palavra", caixa);
      span.textContent = m[0];
      palavras.push({ el: span, inicio: m.index });
      ultimo = m.index + m[0].length;
    }
    $(".leitor-titulo").textContent = item.titulo;
    const n = estado.falas.length;
    $(".leitor-barra > div").style.width = (n ? (estado.pos / n) * 100 : 0) + "%";
    const frase = estado.pos + 1;
    const nome = nomeDaParte();
    const parte = item.parte + 1;
    const temPartes = estado.partes > 1 && parte > 0;
    $(".leitor-longo").textContent = (temPartes ? `${nome} ${parte} ${T.de} ${estado.partes} · ` : "") + `${T.frase} ${frase} ${T.de} ${n}`;
    $(".leitor-curto").textContent = (temPartes ? `${nome} ${parte}/${estado.partes} · ` : "") + `${T.frase} ${frase}/${n}`;
    marcar(item);
    return palavras;
  }

  // Pinta as palavras já ditas e rola a legenda (altura fixa) para a palavra atual ficar à vista.
  function destacarAte(palavras, charIndex) {
    let ultima = null;
    palavras.forEach((p) => {
      const dita = p.inicio <= charIndex;
      p.el.classList.toggle("dita", dita);
      if (dita) ultima = p.el;
    });
    if (!ultima) return;
    const caixa = $(".leitor-texto");
    const linha = parseFloat(getComputedStyle(caixa).lineHeight) || 24;
    const alvo = Math.max(0, ultima.offsetTop - linha);
    if (Math.abs(caixa.scrollTop - alvo) > linha / 2 && (ultima.offsetTop + linha > caixa.scrollTop + caixa.clientHeight || ultima.offsetTop < caixa.scrollTop)) {
      caixa.scrollTo({ top: alvo, behavior: "smooth" });
    }
  }

  let marcado = null;
  function marcar(item) {
    if (marcado) marcado.classList.remove("leitor-atual", "leitor-atual-inteiro");
    document.querySelectorAll(".leitor-parte-atual").forEach((el) => el.classList.remove("leitor-parte-atual"));
    if (realce) CSS.highlights.delete("leitor-frase");
    marcado = item ? item.el : null;
    if (!item) return;
    // Frase dentro de <details> fechado: abre para a pessoa acompanhar.
    let det = marcado.closest("details:not([open])");
    while (det) { if (!marcado.closest("summary") || marcado.closest("summary").parentElement !== det) det.open = true; det = det.parentElement && det.parentElement.closest("details:not([open])"); }
    marcado.classList.add("leitor-atual");
    if (item.faixa) CSS.highlights.set("leitor-frase", new Highlight(item.faixa));
    else marcado.classList.add("leitor-atual-inteiro");
    const parte = marcado.closest("[data-leitura-parte]");
    if (parte) parte.classList.add("leitor-parte-atual");
    const r = (item.faixa || marcado).getBoundingClientRect();
    const alturaBarra = barra.offsetHeight;
    if (r.top < 70 || r.bottom > window.innerHeight - alturaBarra - 20) {
      const destino = window.scrollY + r.top - (window.innerHeight - alturaBarra) / 2 + Math.min(r.height, 200) / 2;
      window.scrollTo({ top: Math.max(0, destino), behavior: "smooth" });
    }
  }
  function atualizarBotoes() {
    const fim = estado.pos >= estado.falas.length;
    if (barra) {
      const p = $(".leitor-pausa");
      p.dataset.estado = estado.tocando ? "pausar" : fim ? "deNovo" : "continuar";
      p.setAttribute("aria-label", estado.tocando ? T.pausar : fim ? T.deNovo : T.continuar);
    }
    const atual = estado.tocando && estado.falas[estado.pos] ? estado.falas[estado.pos].parte : null;
    document.querySelectorAll(".leitor-tocar").forEach((b) => {
      const ativo = atual !== null && +b.dataset.parte === atual;
      b.setAttribute("aria-pressed", String(ativo));
      b.innerHTML = icone(ativo ? "pause" : "play");
    });
    document.querySelectorAll(".leitor-pagina").forEach((b) => {
      b.dataset.estado = estado.tocando ? "pausar" : estado.aberto && !fim ? "continuar" : "ouvir";
    });
  }

  // ---------- Botões na página ----------

  function rotuloPagina() { return partesMarcadas().length ? T.todas : T.pagina; }

  function colocarBotoes() {
    const raiz = main();
    const h1 = raiz.querySelector("h1") || document.querySelector("h1");
    if (h1 && !document.querySelector(".leitor-pagina")) {
      const b = criar("button", "botao verde leitor-pagina");
      b.type = "button";
      b.innerHTML = `<span class="leitor-pilha"><span data-icone="ouvir">${icone("play")}</span><span data-icone="pausar">${icone("pause")}</span><span data-icone="continuar">${icone("play")}</span></span>` +
        `<span class="leitor-pilha"><span data-rotulo="ouvir">${rotuloPagina()}</span><span data-rotulo="pausar">${T.pausar}</span><span data-rotulo="continuar">${T.continuar}</span></span>`;
      b.addEventListener("click", () => {
        if (estado.tocando) pausar();
        else if (estado.aberto && estado.pos < estado.falas.length) continuar();
        else iniciar(-1);
      });
      // Logo depois do <h1> e da linha de apoio (.lead), se houver.
      const depois = h1.nextElementSibling && h1.nextElementSibling.matches(".lead, .intro, p") ? h1.nextElementSibling : h1;
      depois.after(b);
    }
    cabecasDasPartes().forEach((h, i) => {
      let b = h.querySelector(":scope > .leitor-tocar");
      if (!b) {
        b = criar("button", "leitor-tocar");
        b.type = "button";
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          const parte = +b.dataset.parte;
          const atual = estado.falas[estado.pos];
          if (estado.tocando && atual && atual.parte === parte) pausar();
          else if (!estado.tocando && estado.aberto && atual && atual.parte === parte) continuar();
          else iniciar(parte);
        });
        h.prepend(b);
      }
      b.dataset.parte = i;
      b.setAttribute("aria-label", T.ouvirParte + limpar(h.textContent));
    });
    atualizarBotoes();
  }

  function tirarBotoes() {
    document.querySelectorAll(".leitor-tocar, .leitor-pagina").forEach((b) => b.remove());
  }

  // Conteúdo que aparece depois (ex.: resultado do /caminho/) também ganha ▶.
  let observador = null;
  let agendado = 0;
  function observar() {
    observador = new MutationObserver((mudancas) => {
      if (mudancas.every((m) => [...m.addedNodes, ...m.removedNodes].every((n) => n.nodeType !== 1 || n.matches(".leitor-tocar, .leitor-pagina, .leitor-icone")))) return;
      cancelAnimationFrame(agendado);
      agendado = requestAnimationFrame(colocarBotoes);
    });
    observador.observe(main(), { childList: true, subtree: true });
  }

  // Com a leitura aberta, clicar num trecho do texto lê dali.
  function cliqueNoTexto(e) {
    if (!estado.aberto || e.target.closest("a, button, input, select, textarea, label, summary, .leitor")) return;
    if (!main().contains(e.target) || window.getSelection().toString()) return;
    const el = e.target.closest(BLOCO) || e.target;
    iniciarEm(el);
  }
  function tecla(e) { if (e.key === "Escape" && estado.aberto && !document.querySelector(".leitor-dica[open]")) parar(); }

  let ligado = false;
  function ligar() {
    if (ligado) return;
    ligado = true;
    const comecar = () => {
      if (!ligado) return;
      colocarBotoes();
      observar();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", comecar, { once: true });
    else comecar();
    document.addEventListener("click", cliqueNoTexto);
    document.addEventListener("keydown", tecla);
  }

  function desligar() {
    if (!ligado) return;
    ligado = false;
    parar();
    tirarBotoes();
    if (observador) observador.disconnect();
    document.removeEventListener("click", cliqueNoTexto);
    document.removeEventListener("keydown", tecla);
  }

  if (synth) synth.addEventListener ? synth.addEventListener("voiceschanged", carregarVozes) : (synth.onvoiceschanged = carregarVozes);
  window.addEventListener("pagehide", () => synth && synth.cancel());

  window.GRLeitor = { ligar, desligar };
})();
