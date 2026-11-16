// Kit de animação clay.
// Uma cena é um HTML com <div class="palco"><svg class="cena">...</svg></div>.
// Os movimentos são animações CSS comuns. Este arquivo:
//  1. injeta os filtros SVG que dão o aspecto de massinha (filter="url(#clay)");
//  2. oferece peças prontas, como o personagem (Clay.personagem);
//  3. controla o tempo: no navegador mostra uma barra de play/pausa,
//     e na renderização o script chama window.seek(t) quadro a quadro.

(() => {
  const NS = "http://www.w3.org/2000/svg";

  // ---------- Filtros ----------
  // #clay: volume (luz e brilho suave) + bordas levemente irregulares + textura de digital.
  // #clay-plano: só textura e bordas, para fundos e peças grandes.
  // #sombra: sombra suave no chão.
  const FILTROS = `
  <filter id="clay" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" result="ondas"/>
    <feDisplacementMap in="SourceGraphic" in2="ondas" scale="7" xChannelSelector="R" yChannelSelector="G" result="forma"/>
    <feGaussianBlur in="forma" stdDeviation="7" result="borrado"/>
    <feDiffuseLighting in="borrado" surfaceScale="5" diffuseConstant="1.15" lighting-color="#ffffff" result="luz">
      <feDistantLight azimuth="235" elevation="58"/>
    </feDiffuseLighting>
    <feComposite in="forma" in2="luz" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="iluminado"/>
    <feSpecularLighting in="borrado" surfaceScale="5" specularConstant="0.45" specularExponent="22" lighting-color="#ffffff" result="brilho">
      <fePointLight x="-400" y="-500" z="700"/>
    </feSpecularLighting>
    <feComposite in="brilho" in2="forma" operator="in" result="brilhoDentro"/>
    <feComposite in="iluminado" in2="brilhoDentro" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="comBrilho"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grao"/>
    <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.35 0.18" result="graoSuave"/>
    <feComposite in="graoSuave" in2="forma" operator="in" result="graoDentro"/>
    <feMerge><feMergeNode in="comBrilho"/><feMergeNode in="graoDentro"/></feMerge>
  </filter>
  <filter id="clay-plano" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" seed="11" result="ondas"/>
    <feDisplacementMap in="SourceGraphic" in2="ondas" scale="12" xChannelSelector="R" yChannelSelector="G" result="forma"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" result="grao"/>
    <feColorMatrix in="grao" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.3 0.14" result="graoSuave"/>
    <feComposite in="graoSuave" in2="forma" operator="in" result="graoDentro"/>
    <feMerge><feMergeNode in="forma"/><feMergeNode in="graoDentro"/></feMerge>
  </filter>
  <filter id="sombra" x="-30%" y="-80%" width="160%" height="260%">
    <feGaussianBlur stdDeviation="10"/>
  </filter>`;

  function injetarFiltros() {
    document.querySelectorAll("svg.cena").forEach((svg) => {
      let defs = svg.querySelector("defs");
      if (!defs) { defs = document.createElementNS(NS, "defs"); svg.prepend(defs); }
      defs.insertAdjacentHTML("beforeend", FILTROS);
    });
  }

  // ---------- Peças ----------
  // Personagem em massinha. Retorna SVG (string) para colar dentro da cena.
  // A posição fica num grupo externo, então #<id> pode ser animado à vontade.
  // Opções: id, x, y (posição dos pés), escala, pele, cabelo, camisa, oculos (bool).
  // Partes animáveis: #<id>-corpo, #<id>-olhos, #<id>-boca, #<id>-braco-d, #<id>-braco-e.
  function personagem(o = {}) {
    const id = o.id || "gabriel";
    const pele = o.pele || "#d9a27a";
    const cabelo = o.cabelo || "#3b2a20";
    const camisa = o.camisa || "var(--verde)";
    const s = o.escala || 1;
    const x = o.x ?? 960, y = o.y ?? 900;
    const oculos = o.oculos !== false;
    return `
    <g transform="translate(${x} ${y}) scale(${s})"><g id="${id}">
      <ellipse cx="0" cy="6" rx="150" ry="22" fill="rgba(0,0,0,.18)" filter="url(#sombra)"/>
      <g id="${id}-corpo" class="pe">
        <g filter="url(#clay)">
          <rect x="-58" y="-120" width="44" height="120" rx="22" fill="var(--azul)"/>
          <rect x="14" y="-120" width="44" height="120" rx="22" fill="var(--azul)"/>
          <path d="M-110 -150 C-110 -300 110 -300 110 -150 L100 -95 C60 -80 -60 -80 -100 -95 Z" fill="${camisa}"/>
        </g>
        <g transform="translate(-100 -250)">
          <g id="${id}-braco-e" class="ombro" style="transform: rotate(160deg)">
            <g filter="url(#clay)">
              <rect x="0" y="-22" width="130" height="44" rx="22" fill="${camisa}"/>
              <circle cx="138" cy="0" r="26" fill="${pele}"/>
            </g>
          </g>
        </g>
        <g transform="translate(100 -250)">
          <g id="${id}-braco-d" class="ombro" style="transform: rotate(20deg)">
            <g filter="url(#clay)">
              <rect x="0" y="-22" width="130" height="44" rx="22" fill="${camisa}"/>
              <circle cx="138" cy="0" r="26" fill="${pele}"/>
            </g>
          </g>
        </g>
        <g filter="url(#clay)">
          <rect x="-26" y="-300" width="52" height="40" rx="18" fill="${pele}"/>
          <ellipse cx="0" cy="-400" rx="118" ry="128" fill="${pele}"/>
          <path d="M-126 -405 C-150 -600 150 -600 126 -405 C100 -470 40 -490 -10 -470 C-60 -495 -110 -470 -122 -410 Z" fill="${cabelo}"/>
          <ellipse cx="-118" cy="-395" rx="20" ry="28" fill="${pele}"/>
          <ellipse cx="118" cy="-395" rx="20" ry="28" fill="${pele}"/>
        </g>
        <g id="${id}-olhos">
          <ellipse cx="-42" cy="-405" rx="13" ry="17" fill="#1d1d1d"/>
          <ellipse cx="42" cy="-405" rx="13" ry="17" fill="#1d1d1d"/>
          <circle cx="-37" cy="-411" r="4.5" fill="#fff"/>
          <circle cx="47" cy="-411" r="4.5" fill="#fff"/>
        </g>
        ${oculos ? `<g fill="none" stroke="#1d1d1d" stroke-width="7" stroke-linecap="round">
          <rect x="-82" y="-436" width="76" height="62" rx="24"/>
          <rect x="6" y="-436" width="76" height="62" rx="24"/>
          <path d="M-6 -410 Q0 -418 6 -410"/>
        </g>` : ""}
        <ellipse cx="-72" cy="-360" rx="16" ry="9" fill="#e0707a" opacity=".45"/>
        <ellipse cx="72" cy="-360" rx="16" ry="9" fill="#e0707a" opacity=".45"/>
        <path id="${id}-boca" d="M-30 -345 Q0 -310 30 -345 Z" fill="#7a2e2e"/>
      </g>
    </g></g>`;
  }

  // Balão de fala em massinha. Retorna SVG (string).
  function balao({ id = "balao", x = 960, y = 200, largura = 700, altura = 170, texto = "", tamanho = 64, cor = "var(--branco)" } = {}) {
    return `
    <g transform="translate(${x} ${y})"><g id="${id}">
      <g filter="url(#clay)">
        <rect x="${-largura / 2}" y="${-altura / 2}" width="${largura}" height="${altura}" rx="${altura / 2.2}" fill="${cor}"/>
        <path d="M-30 ${altura / 2 - 10} L-70 ${altura / 2 + 60} L30 ${altura / 2 - 10} Z" fill="${cor}"/>
      </g>
      <text class="texto-cena" x="0" y="${tamanho * 0.35}" text-anchor="middle" font-size="${tamanho}">${texto}</text>
    </g></g>`;
  }

  // ---------- Tempo ----------
  const params = new URLSearchParams(location.search);
  const renderizando = params.has("render");

  function seek(t) {
    for (const a of document.getAnimations()) {
      a.pause();
      a.currentTime = t * 1000;
    }
  }

  function barraDePreview(duracao) {
    const barra = document.createElement("div");
    barra.className = "preview";
    barra.innerHTML = `<button type="button">Pausar</button><input type="range" min="0" max="${duracao}" step="0.01" value="0"><span>0.00s</span>`;
    document.body.append(barra);
    const [botao, faixa, rotulo] = barra.children;
    let tocando = true, inicio = performance.now(), t = 0;
    botao.onclick = () => {
      tocando = !tocando; botao.textContent = tocando ? "Pausar" : "Tocar";
      inicio = performance.now() - t * 1000;
    };
    faixa.oninput = () => { t = +faixa.value; inicio = performance.now() - t * 1000; seek(t); rotulo.textContent = t.toFixed(2) + "s"; };
    (function loop() {
      if (tocando) {
        t = ((performance.now() - inicio) / 1000) % duracao;
        seek(t); faixa.value = t; rotulo.textContent = t.toFixed(2) + "s";
      }
      requestAnimationFrame(loop);
    })();
  }

  function ajustarPalco() {
    const palco = document.querySelector(".palco");
    if (!palco || renderizando) return;
    const escala = Math.min(innerWidth / 1920, (innerHeight - 50) / 1080);
    const esquerda = Math.max(0, (innerWidth - 1920 * escala) / 2);
    palco.style.transform = `translateX(${esquerda}px) scale(${escala})`;
  }

  // Chame no fim da cena: Clay.iniciar({ duracao: 12 })
  function iniciar({ duracao }) {
    window.DURACAO = duracao;
    window.seek = seek;
    injetarFiltros();
    if (renderizando) {
      document.documentElement.classList.add("renderizando");
      seek(+params.get("t") || 0);
    } else {
      ajustarPalco(); addEventListener("resize", ajustarPalco);
      barraDePreview(duracao);
    }
    window.CENA_PRONTA = true;
  }

  window.Clay = { personagem, balao, iniciar, seek };
})();
