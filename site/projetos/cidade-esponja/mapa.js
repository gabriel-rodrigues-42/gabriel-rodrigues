// Mapa da cidade esponja de Goiânia. Monta o mapa (MapLibre), as fichas e os cenários da Marginal.
// Os textos das fichas vêm de areas.js; os da interface ficam aqui, nos dois idiomas, escolhidos
// pelo lang da página. Mapa base: OpenFreeMap (dados do OpenStreetMap). Se ele não carregar, o
// mapa usa as camadas de dados/osm.geojson como base reserva.
(() => {
  const EN = document.documentElement.lang.startsWith("en");
  const L = (o) => (o && typeof o === "object" ? (EN ? o.en : o.pt) : o || "");
  const T = EN ? {
    camadas: "Layers",
    pontos: "Flood points",
    risco: "Risk areas",
    agua: "Streams and parks",
    marcos: "Memory Markers",
    critico: "Among the 10 worst",
    "muito-alto": "Very high risk",
    alto: "High risk",
    medio: "Medium risk",
    evento: "Flooded (news)",
    alagamento: "Street flooding",
    enxurrada: "Flash flood",
    inundacao: "River flooding",
    erosao: "Erosion",
    plano: "Official plan:",
    eventos: "What happened",
    opcoes: "What can be done",
    governo: "Cost to the government",
    morador: "Cost to residents",
    caso: "Who already did it",
    fontes: "Sources",
    fonte: "Source",
    aviso: "An estimate for debate, not a technical report. Risk is shown by area, never by address. The criticism is of the drainage system, not of the neighbourhood.",
    cenarios: "See the three Marginal scenarios",
    inicioTitulo: "Tap a point on the map",
    inicioTexto: "Each point opens a card with the problem, what can be done and how much it costs the city and the people who live there.",
    marcoSelo: "Proposed marker",
    marcoTexto: "There is no plaque or measured water height yet. The proposal is to record it after every flood.",
    analiseTitulo: { fundo: "Our analysis: valley bottom", beira: "Our analysis: valley edge" },
    analiseTexto: {
      fundo: "This area is up to 2 metres above the nearest stream. In a flood, water gets here first.",
      beira: "This area is 2 to 5 metres above the nearest stream. In a big flood, water can get here.",
    },
    analiseAviso: "This is our own screening, made from an open 30-metre terrain model. It points to where to look. It does not say that a street floods, and it does not replace the official maps.",
    metodo: "How we did it",
    reserva: "The online base map did not load. Showing streams, parks and main roads only.",
    compartilhar: "Copy link to this card",
    copiado: "Link copied",
    fechar: "Back to the map",
    chuva: (mm) => `Rain in one hour: ${mm} mm`,
  } : {
    camadas: "Camadas",
    pontos: "Pontos de alagamento",
    risco: "Áreas de risco",
    agua: "Córregos e parques",
    marcos: "Marcos da Memória",
    critico: "Entre os 10 piores",
    "muito-alto": "Risco muito alto",
    alto: "Risco alto",
    medio: "Risco médio",
    evento: "Alagou (notícia)",
    alagamento: "Alagamento de via",
    enxurrada: "Enxurrada",
    inundacao: "Inundação",
    erosao: "Erosão",
    plano: "Plano oficial:",
    eventos: "O que aconteceu",
    opcoes: "O que dá para fazer",
    governo: "Custo para o governo",
    morador: "Custo para quem mora ali",
    caso: "Quem já fez",
    fontes: "Fontes",
    fonte: "Fonte",
    aviso: "Estimativa para debate, não laudo. O risco aparece por área, nunca por endereço. A crítica é ao sistema de drenagem, não ao bairro.",
    cenarios: "Veja os três cenários da Marginal",
    inicioTitulo: "Toque num ponto do mapa",
    inicioTexto: "Cada ponto abre uma ficha com o problema, o que dá para fazer e quanto custa para a Prefeitura e para quem mora ali.",
    marcoSelo: "Marco proposto",
    marcoTexto: "Ainda não existe placa nem altura da água medida. A proposta é registrar depois de cada enchente.",
    analiseTitulo: { fundo: "Análise própria: fundo de vale", beira: "Análise própria: beira de vale" },
    analiseTexto: {
      fundo: "Este trecho fica até 2 metros acima do córrego mais próximo. Numa cheia, a água chega aqui primeiro.",
      beira: "Este trecho fica de 2 a 5 metros acima do córrego mais próximo. Numa cheia grande, a água pode chegar aqui.",
    },
    analiseAviso: "É uma triagem nossa, feita com um modelo de terreno aberto de 30 metros. Mostra onde olhar. Não diz que uma rua alaga e não substitui os mapas oficiais.",
    metodo: "Como fizemos",
    reserva: "O mapa base on-line não carregou. Mostrando só córregos, parques e avenidas principais.",
    compartilhar: "Copiar link desta ficha",
    copiado: "Link copiado",
    fechar: "Voltar ao mapa",
    chuva: (mm) => `Chuva em uma hora: ${mm} mm`,
  };

  const D = window.CIDADE_ESPONJA;
  const css = getComputedStyle(document.documentElement);
  const cor = (n) => css.getPropertyValue(`--${n}`).trim();
  const CORES = {
    critico: cor("livre-coral"),
    "muito-alto": cor("livre-roxo"),
    alto: cor("livre-terra"),
    medio: cor("livre-turquesa"),
    evento: cor("azul-medio"),
  };
  const RISCO = ["muito-alto", "alto", "medio"];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const fonteLink = (id) => {
    const f = D.fontes[id];
    return f ? `<a href="${esc(f.u)}" rel="noopener" target="_blank">${esc(f.t)}</a>` : "";
  };

  const ficha = document.getElementById("ficha");
  const elMapa = document.getElementById("mapa");
  if (!ficha || !elMapa) return;

  // ---------- Fichas ----------
  function fichaInicio() {
    const total = D.areas.length;
    ficha.innerHTML = `
      <h2 class="ficha-titulo">${T.inicioTitulo}</h2>
      <p>${T.inicioTexto}</p>
      <ul class="legenda" aria-label="${T.camadas}">
        ${["critico", "muito-alto", "alto", "medio", "evento"].map((g) => `<li><span class="bola" style="background:${CORES[g]}"></span>${T[g]}</li>`).join("")}
        <li><span class="bola marco"></span>${T.marcos}</li>
      </ul>
      <p class="fontes">${total} ${EN ? "areas from Civil Defense lists and the press (2025–2026)." : "áreas das listas da Defesa Civil e da imprensa (2025–2026)."}</p>`;
  }

  function fichaArea(a) {
    const opcoes = a.opcoes.map((id, i) => {
      const o = D.opcoes[id];
      return `<details class="ficha-opcao"${i === 0 ? " open" : ""}>
        <summary>${esc(L(o.nome))}</summary>
        <p>${esc(L(o.oque))}</p>
        <dl>
          <dt>${T.governo}</dt><dd>${esc(L(o.governo))}</dd>
          <dt>${T.morador}</dt><dd>${esc(L(o.morador))}</dd>
          <dt>${T.caso}</dt><dd>${esc(L(o.caso))}</dd>
        </dl>
        <p class="fontes">${T.fontes}: ${o.fontes.map(fonteLink).join(" · ")}</p>
      </details>`;
    }).join("");
    ficha.innerHTML = `
      <p class="selos"><span class="selo-grau" style="--c:${CORES[a.grau]}">${T[a.grau]}</span>${a.tipo.map((t) => `<span class="selo-tipo">${T[t]}</span>`).join("")}</p>
      <h2 class="ficha-titulo" tabindex="-1">${esc(L(a.nome))}</h2>
      <p class="bairro">${esc(L(a.bairro))}</p>
      <p>${esc(L(a.resumo))}</p>
      ${a.plano ? `<p class="plano"><strong>${T.plano}</strong> ${esc(L(a.plano))}</p>` : ""}
      ${a.eventos.length ? `<h3>${T.eventos}</h3><ul class="eventos">${a.eventos.map((e) => `<li>${esc(L(e))}</li>`).join("")}</ul>` : ""}
      ${a.destaque ? `<p><a class="botao-cenarios" href="#cenarios">${T.cenarios} ↓</a></p>` : ""}
      <h3>${T.opcoes}</h3>
      ${opcoes}
      <p class="fontes">${T.fontes}: ${a.fontes.map(fonteLink).join(" · ")}</p>
      <p class="aviso">${T.aviso}</p>
      <p class="acoes-ficha"><button type="button" class="link-ficha">${T.compartilhar}</button><a href="#mapa" class="voltar">${T.fechar} ↑</a></p>`;
    ligarCompartilhar(a.id);
  }

  function fichaMarco(m) {
    ficha.innerHTML = `
      <p class="selos"><span class="selo-grau marco">${T.marcoSelo}</span></p>
      <h2 class="ficha-titulo" tabindex="-1">${esc(L(m.nome))}</h2>
      <p>${esc(L(m.texto))}</p>
      <p>${T.marcoTexto}</p>
      <p><a href="#marcos">${T.marcos} ↓</a></p>
      <p class="fontes">${T.fontes}: ${m.fontes.map(fonteLink).join(" · ")}</p>
      <p class="acoes-ficha"><button type="button" class="link-ficha">${T.compartilhar}</button><a href="#mapa" class="voltar">${T.fechar} ↑</a></p>`;
    ligarCompartilhar(m.id);
  }

  function fichaAnalise(classe) {
    ficha.innerHTML = `
      <p class="selos"><span class="selo-grau analise">${EN ? "Screening" : "Triagem"}</span></p>
      <h2 class="ficha-titulo" tabindex="-1">${T.analiseTitulo[classe]}</h2>
      <p>${T.analiseTexto[classe]}</p>
      <p class="aviso">${T.analiseAviso}</p>
      <p><a href="#metodo">${T.metodo} ↓</a></p>`;
    ficha.querySelector(".ficha-titulo")?.focus({ preventScroll: true });
  }

  function ligarCompartilhar(id) {
    const b = ficha.querySelector(".link-ficha");
    b.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#${id}`;
      try { await navigator.clipboard.writeText(url); b.textContent = T.copiado; } catch { location.hash = id; }
    });
  }

  // ---------- Dados ----------
  const pegar = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const pasta = "/projetos/cidade-esponja/dados/";

  function pontosGeo(posicoes) {
    const areas = D.areas.map((a) => ({
      type: "Feature", id: a.id,
      properties: { id: a.id, grau: a.grau, risco: RISCO.includes(a.grau) ? 1 : 0, destaque: a.destaque ? 1 : 0 },
      geometry: { type: "Point", coordinates: posicoes[a.id] || a.pos },
    }));
    const marcos = D.marcos.map((m) => ({
      type: "Feature", id: m.id, properties: { id: m.id },
      geometry: { type: "Point", coordinates: posicoes[m.id] || m.pos },
    }));
    return { areas: { type: "FeatureCollection", features: areas }, marcos: { type: "FeatureCollection", features: marcos } };
  }

  const ESTILO_ONLINE = "https://tiles.openfreemap.org/styles/positron";
  const estiloReserva = () => ({
    version: 8, sources: {},
    layers: [{ id: "fundo", type: "background", paint: { "background-color": cor("creme") } }],
  });

  async function estilo() {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    try {
      const r = await fetch(ESTILO_ONLINE, { signal: ctl.signal });
      if (!r.ok) throw new Error(r.status);
      return { estilo: await r.json(), reserva: false };
    } catch {
      return { estilo: estiloReserva(), reserva: true };
    } finally { clearTimeout(t); }
  }

  // ---------- Mapa ----------
  async function iniciar() {
    fichaInicio();
    const [{ estilo: st, reserva }, osm, posicoes, analise] = await Promise.all([
      estilo(), pegar(pasta + "osm.geojson"), pegar(pasta + "posicoes.json"), pegar(pasta + "analise.geojson"),
    ]);
    const geo = pontosGeo(posicoes || {});
    const map = new maplibregl.Map({
      container: elMapa, style: st, center: [-49.27, -16.68], zoom: 11.2, minZoom: 9, maxZoom: 17,
      maxBounds: [[-49.75, -16.95], [-48.85, -16.35]],
      attributionControl: { compact: true, customAttribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' + (reserva ? "" : ' · <a href="https://openfreemap.org">OpenFreeMap</a>') },
      cooperativeGestures: matchMedia("(pointer: coarse)").matches,
      locale: EN ? {} : {
        "NavigationControl.ZoomIn": "Aproximar", "NavigationControl.ZoomOut": "Afastar",
        "NavigationControl.ResetBearing": "Voltar ao norte", "GeolocateControl.FindMyLocation": "Onde estou",
        "GeolocateControl.LocationNotAvailable": "Localização indisponível", "FullscreenControl.Enter": "Tela cheia",
        "FullscreenControl.Exit": "Sair da tela cheia", "CooperativeGesturesHandler.MobileHelpText": "Use dois dedos para mover o mapa",
        "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl + rolagem para dar zoom", "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + rolagem para dar zoom",
      },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: false } }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");
    if (reserva) {
      const aviso = document.getElementById("aviso-reserva");
      if (aviso) { aviso.textContent = T.reserva; aviso.hidden = false; }
    }

    map.on("load", () => {
      if (osm) {
        map.addSource("osm", { type: "geojson", data: osm });
        if (reserva) {
          map.addLayer({ id: "limite-fundo", type: "fill", source: "osm", filter: ["==", ["get", "camada"], "limite"], paint: { "fill-color": cor("branco") } });
          map.addLayer({ id: "vias", type: "line", source: "osm", filter: ["==", ["get", "camada"], "via"], paint: { "line-color": cor("carro-prata"), "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 15, 3] } });
        }
        map.addLayer({ id: "parques", type: "fill", source: "osm", filter: ["==", ["get", "camada"], "parque"], paint: { "fill-color": cor("verde"), "fill-opacity": 0.28 } });
        map.addLayer({ id: "limite", type: "line", source: "osm", filter: ["==", ["get", "camada"], "limite"], paint: { "line-color": cor("azul"), "line-width": 1.5, "line-dasharray": [3, 2], "line-opacity": 0.6 } });
        map.addLayer({ id: "marginal", type: "line", source: "osm", filter: ["==", ["get", "camada"], "marginal"], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": cor("livre-coral"), "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 15, 7], "line-opacity": 0.55 } });
        map.addLayer({ id: "corregos", type: "line", source: "osm", filter: ["==", ["get", "camada"], "corrego"], layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": cor("azul-medio"), "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.5, 15, 5] } });
      }
      if (analise) {
        map.addSource("analise", { type: "geojson", data: analise });
        const antes = map.getLayer("corregos") ? "corregos" : undefined;
        map.addLayer({ id: "analise", type: "fill", source: "analise", layout: { visibility: "none" }, paint: {
          "fill-color": cor("azul-medio"), "fill-opacity": ["match", ["get", "classe"], "fundo", 0.42, 0.16],
        } }, antes);
      }
      map.addSource("areas", { type: "geojson", data: geo.areas, promoteId: "id" });
      map.addSource("marcos", { type: "geojson", data: geo.marcos, promoteId: "id" });
      const raioCom = (e) => ["interpolate", ["linear"], ["zoom"], 10, ["case", ["==", ["get", "destaque"], 1], 9 + e, 6 + e], 15, ["case", ["==", ["get", "destaque"], 1], 20 + e, 14 + e]];
      const raio = raioCom(0);
      map.addLayer({ id: "areas-halo", type: "circle", source: "areas", paint: {
        "circle-radius": raioCom(7), "circle-color": ["match", ["get", "grau"], ...Object.entries(CORES).flat(), "#888"],
        "circle-opacity": ["case", ["boolean", ["feature-state", "ativa"], false], 0.45, 0.18],
      } });
      map.addLayer({ id: "areas", type: "circle", source: "areas", paint: {
        "circle-radius": raio, "circle-color": ["match", ["get", "grau"], ...Object.entries(CORES).flat(), "#888"],
        "circle-stroke-color": cor("branco"), "circle-stroke-width": ["case", ["boolean", ["feature-state", "ativa"], false], 4, 2],
      } });
      map.addLayer({ id: "marcos", type: "circle", source: "marcos", paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 12], "circle-color": cor("amarelo"),
        "circle-stroke-color": cor("azul"), "circle-stroke-width": ["case", ["boolean", ["feature-state", "ativa"], false], 5, 3],
      } });

      let ativa = null;
      const marcar = (fonte, id) => {
        if (ativa) map.setFeatureState(ativa, { ativa: false });
        ativa = id ? { source: fonte, id } : null;
        if (ativa) map.setFeatureState(ativa, { ativa: true });
      };
      const abrir = (id, voar = true) => {
        const a = D.areas.find((x) => x.id === id);
        const m = D.marcos.find((x) => x.id === id);
        if (!a && !m) return;
        const f = (a ? geo.areas : geo.marcos).features.find((x) => x.id === id);
        marcar(a ? "areas" : "marcos", id);
        a ? fichaArea(a) : fichaMarco(m);
        if (voar) map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 13), duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900 });
        history.replaceState(null, "", `#${id}`);
        if (matchMedia("(max-width: 899px)").matches) ficha.scrollIntoView({ behavior: "smooth", block: "start" });
        ficha.querySelector(".ficha-titulo")?.focus({ preventScroll: true });
      };
      window.abrirAreaCidadeEsponja = abrir;

      map.on("click", "analise", (e) => {
        if (map.queryRenderedFeatures(e.point, { layers: ["areas", "marcos"].filter((l) => map.getLayer(l)) }).length) return;
        marcar(null);
        fichaAnalise(e.features[0].properties.classe);
        if (matchMedia("(max-width: 899px)").matches) ficha.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      for (const camada of ["areas", "marcos"]) {
        map.on("click", camada, (e) => abrir(e.features[0].properties.id));
        map.on("mouseenter", camada, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", camada, () => { map.getCanvas().style.cursor = ""; });
      }

      // Camadas ligáveis
      const grupos = {
        pontos: [["areas", ["==", ["get", "risco"], 0]], ["areas-halo", ["==", ["get", "risco"], 0]]],
        risco: [["areas", ["==", ["get", "risco"], 1]], ["areas-halo", ["==", ["get", "risco"], 1]]],
        agua: [["corregos"], ["parques"], ["marginal"]],
        marcos: [["marcos"]],
        analise: [["analise"]],
      };
      const estado = { pontos: true, risco: true, agua: true, marcos: true, analise: false };
      const aplicar = () => {
        for (const camada of ["areas", "areas-halo"]) {
          const mostrar = [];
          if (estado.pontos) mostrar.push(["==", ["get", "risco"], 0]);
          if (estado.risco) mostrar.push(["==", ["get", "risco"], 1]);
          map.setFilter(camada, mostrar.length ? ["any", ...mostrar] : ["==", 1, 0]);
        }
        for (const [g, lista] of Object.entries(grupos)) {
          if (g === "pontos" || g === "risco") continue;
          for (const [id] of lista) if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", estado[g] ? "visible" : "none");
        }
      };
      document.querySelectorAll("[data-camada]").forEach((b) => {
        b.addEventListener("click", () => {
          const g = b.dataset.camada;
          estado[g] = !estado[g];
          b.setAttribute("aria-pressed", String(estado[g]));
          aplicar();
        });
      });

      // Lista acessível de áreas
      document.querySelectorAll("[data-area]").forEach((b) => b.addEventListener("click", () => {
        elMapa.scrollIntoView({ behavior: "smooth", block: "center" });
        abrir(b.dataset.area);
      }));

      const todos = [...geo.areas.features, ...geo.marcos.features].map((f) => f.geometry.coordinates);
      const caixa = todos.reduce((b, [x, y]) => [[Math.min(b[0][0], x), Math.min(b[0][1], y)], [Math.max(b[1][0], x), Math.max(b[1][1], y)]], [[180, 90], [-180, -90]]);
      map.fitBounds(caixa, { padding: { top: 30, bottom: 30, left: 30, right: 60 }, duration: 0 });
      const inicial = decodeURIComponent(location.hash.slice(1));
      if (inicial) abrir(inicial, true);
      document.documentElement.classList.add("mapa-pronto");
    });
  }

  // Lista de áreas (botões), montada antes do mapa para funcionar mesmo sem WebGL.
  const lista = document.getElementById("lista-areas");
  if (lista) {
    lista.innerHTML = D.areas.map((a) => `<li><button type="button" data-area="${a.id}"><span class="bola" style="background:${CORES[a.grau]}"></span>${esc(L(a.nome))}<small>${T[a.grau]}</small></button></li>`).join("")
      + D.marcos.map((m) => `<li><button type="button" data-area="${m.id}"><span class="bola marco"></span>${esc(L(m.nome))}<small>${T.marcoSelo}</small></button></li>`).join("");
  }

  if (window.maplibregl && maplibregl.supported?.() !== false) iniciar().catch(() => fichaInicio());
  else fichaInicio();

  // ---------- Cenários da Marginal (ilustração em perspectiva, fora de escala) ----------
  // O bloco é um pedaço da Marginal visto de lado e de cima. As pistas e o canal correm para o
  // fundo; os carros entram pela frente ou pelo fundo do bloco e saem pelo outro lado.
  const palco = document.getElementById("palco");
  if (!palco) return;
  const faixa = document.getElementById("chuva");
  const rotulo = document.getElementById("chuva-rotulo");
  const situacao = document.getElementById("situacao");
  const botaoChover = document.getElementById("chover");
  const parado = matchMedia("(prefers-reduced-motion: reduce)");

  // Projeção oblíqua: x atravessa a via, z é a altura, d é a profundidade (ao longo do córrego).
  const W = 280, FUNDO = 110, KX = 0.6, KY = 0.45, X0 = 10, Y0 = 228;
  const P = (x, z, d) => `${(X0 + x + d * KX).toFixed(1)},${(Y0 - z - d * KY).toFixed(1)}`;
  const poli = (pts, cor, extra = "") => `<polygon points="${pts.join(" ")}" fill="${cor}" ${extra}/>`;
  const sombra = (pts, o) => `<polygon points="${pts.join(" ")}" fill="#000" opacity="${o}"/>`;
  const topo = (x1, x2, z, d1 = 0, d2 = FUNDO) => [P(x1, z, d1), P(x2, z, d1), P(x2, z, d2), P(x1, z, d2)];
  const lado = (x, z1, z2, d1 = 0, d2 = FUNDO) => [P(x, z1, d1), P(x, z2, d1), P(x, z2, d2), P(x, z1, d2)];
  const frente = (x1, x2, z1, z2, d = 0) => [P(x1, z1, d), P(x2, z1, d), P(x2, z2, d), P(x1, z2, d)];

  // Caixa (carro, pilar, tabuleiro): frente, topo e lado direito, que são as faces visíveis.
  function caixa(x, z, d, w, h, l, cor) {
    const f = frente(x, x + w, z, z + h, d), t = topo(x, x + w, z + h, d, d + l), s = lado(x + w, z, z + h, d, d + l);
    return poli(t, cor) + poli(s, cor) + sombra(s, 0.22) + poli(f, cor) + sombra(f, 0.1);
  }
  function carro(x, z, d, cor, opacidade, rumo) {
    const w = 15, h = 7, l = 22;
    const vidro = rumo > 0 ? [d + l - 9, d + l - 3] : [d + 3, d + 9];
    return `<g opacity="${opacidade.toFixed(2)}">${caixa(x, z, d, w, h, l, cor)}${poli(topo(x + 2, x + w - 2, z + h, vidro[0], vidro[1]), "var(--carro-vidro)")}</g>`;
  }
  function arvore(x, z, d) {
    const [bx, by] = P(x, z, d).split(",").map(Number);
    return `<rect x="${bx - 1.5}" y="${by - 12}" width="3" height="12" fill="var(--carro-terracota)"/><circle cx="${bx}" cy="${by - 17}" r="8" fill="var(--verde)"/><circle cx="${bx + 2.5}" cy="${by - 19}" r="3.5" fill="#fff" opacity=".18"/>`;
  }

  // Perfil de cada cenário, da esquerda para a direita: trechos planos com altura z.
  // tipo: pista, grama, parque, calcada, canal. faixas: [centro da faixa, rumo] (+1 vai para o fundo, -1 vem).
  const CEN = {
    hoje: {
      perfil: [
        { x1: 0, x2: 14, z: 70, tipo: "grama" }, { x1: 14, x2: 112, z: 70, tipo: "pista" }, { x1: 112, x2: 122, z: 70, tipo: "calcada" },
        { x1: 122, x2: 168, z: 16, tipo: "canal" },
        { x1: 168, x2: 178, z: 70, tipo: "calcada" }, { x1: 178, x2: 276, z: 70, tipo: "pista" }, { x1: 276, x2: W, z: 70, tipo: "grama" },
      ],
      faixas: [[22, 1, 70], [70, 1, 70], [186, -1, 70], [234, -1, 70]],
      nivel: (mm) => (mm <= 30 ? 18 + (mm / 30) * 52 : 70 + (mm - 30) * 0.5),
      transito: (mm) => (mm < 25 ? 1 : mm <= 35 ? 0.5 : 0),
      estado: (mm) => (mm < 25 ? (EN ? "Road open" : "Pista aberta") : mm <= 35 ? (EN ? "Danger zone: the road usually closes between 25 and 35 mm" : "Zona de perigo: a via costuma fechar entre 25 e 35 mm") : (EN ? "Road closed, water over the lanes. Cars that were on it drive out slowly" : "Pista fechada, água por cima das faixas. Quem estava nela sai devagar")),
    },
    piloto: {
      perfil: [
        { x1: 0, x2: 122, z: 44, tipo: "parque" },
        { x1: 122, x2: 168, z: 16, tipo: "canal" },
        { x1: 168, x2: 178, z: 80, tipo: "calcada" }, { x1: 178, x2: 276, z: 80, tipo: "pista" }, { x1: 276, x2: W, z: 80, tipo: "grama" },
      ],
      arvores: [[18, 44], [55, 44], [92, 44]],
      trilha: [40, 52, 44],
      faixas: [[186, 1, 80], [210, 1, 80], [234, -1, 80], [258, -1, 80]],
      nivel: (mm) => { const e = mm * 0.6; return e <= 30 ? 18 + (e / 30) * 26 : 44 + (e - 30) * 0.6; },
      transito: () => 1,
      estado: (mm) => (mm * 0.6 <= 30 ? (EN ? "Water stays in the channel; park and road open" : "A água fica no canal; parque e pista abertos") : (EN ? "The park floods on purpose; the road stays open" : "O parque alaga de propósito; a pista segue aberta")),
    },
    elevada: {
      perfil: [
        { x1: 0, x2: 122, z: 50, tipo: "parque" },
        { x1: 122, x2: 168, z: 16, tipo: "canal" },
        { x1: 168, x2: W, z: 50, tipo: "parque" },
      ],
      arvores: [[16, 50], [200, 50], [252, 50]],
      trilha: [30, 42, 50],
      viaduto: { x1: 46, x2: 238, z: 132, pilares: [96, 182] },
      faixas: [[54, 1, 140], [94, 1, 140], [174, -1, 140], [214, -1, 140]],
      nivel: (mm) => (mm <= 30 ? 18 + (mm / 30) * 32 : 50 + (mm - 30) * 0.35),
      transito: () => 1,
      estado: () => (EN ? "Cars pass above; the park floods below, in the shade" : "Os carros passam em cima; o parque alaga embaixo, na sombra"),
    },
  };
  const CORES_CARRO = ["var(--livre-coral)", "var(--carro-branco)", "var(--azul-medio)", "var(--carro-prata)", "var(--carro-amarelo-ipe)", "var(--carro-verde-mata)"];
  const CORES_CHAO = { pista: "var(--carro-grafite)", grama: "var(--verde-claro)", parque: "var(--verde-claro)", calcada: "var(--carro-areia)", canal: "var(--carro-prata)" };
  const L_CARRO = 22;

  let cenario = "hoje";
  let carros = [];
  let semente = 7;
  const sorte = () => ((semente = (semente * 9301 + 49297) % 233280) / 233280);

  function povoar() {
    const c = CEN[cenario];
    carros = [];
    c.faixas.forEach(([x, rumo, z], i) => {
      for (let k = 0; k < 2; k++) {
        carros.push({ x, z, rumo, d: 10 + k * 48 + i * 11, v: 16 + sorte() * 8, cor: CORES_CARRO[(i * 2 + k) % CORES_CARRO.length] });
      }
    });
  }

  // Desenha só os trechos que passam no filtro: os que ficam abaixo da água vêm antes dela,
  // os que ficam acima vêm depois, para a lâmina não aparecer por cima de um bloco mais alto.
  function solo(c, filtro) {
    let s = "";
    c.perfil.filter(filtro).forEach((t) => {
      s += poli(topo(t.x1, t.x2, t.z), CORES_CHAO[t.tipo]);
      if (t.tipo === "pista") {
        const meio = (t.x1 + t.x2) / 2;
        s += `<polyline points="${P(meio, t.z, 0)} ${P(meio, t.z, FUNDO)}" stroke="var(--amarelo)" stroke-width="1.4" fill="none"/>`;
        [t.x1 + (meio - t.x1) / 2, meio + (t.x2 - meio) / 2].forEach((xm) => {
          s += `<polyline points="${P(xm, t.z, 0)} ${P(xm, t.z, FUNDO)}" stroke="#fff" stroke-width="1" stroke-dasharray="6 6" fill="none" opacity=".8"/>`;
        });
      }
    });
    // Paredes visíveis: as que olham para a direita (degrau que desce da esquerda para a direita).
    for (let i = 0; i < c.perfil.length - 1; i++) {
      const a = c.perfil[i], b = c.perfil[i + 1];
      if (a.z > b.z && filtro(a)) {
        const parede = lado(a.x2, b.z, a.z);
        s += poli(parede, b.tipo === "canal" || a.tipo === "calcada" ? "var(--carro-prata)" : "var(--carro-areia)") + sombra(parede, 0.25);
      }
    }
    if (c.trilha && filtro({ z: c.trilha[2] })) {
      const [x1, x2, z] = c.trilha;
      s += poli(topo(x1, x2, z), "var(--areia)");
    }
    return s;
  }

  function frenteSolo(c) {
    let pts = [P(0, 0, 0)];
    c.perfil.forEach((t) => { pts.push(P(t.x1, t.z, 0), P(t.x2, t.z, 0)); });
    pts.push(P(W, 0, 0));
    const lado_dir = [P(W, 0, 0), P(W, c.perfil[c.perfil.length - 1].z, 0), P(W, c.perfil[c.perfil.length - 1].z, FUNDO), P(W, 0, FUNDO)];
    return poli(lado_dir, "var(--carro-areia)") + sombra(lado_dir, 0.3) + poli(pts, "var(--carro-areia)")
      // camadas de terra, para ler como um corte
      + `<polyline points="${P(0, 8, 0)} ${P(W, 8, 0)}" stroke="var(--carro-terracota)" stroke-width="1" opacity=".25"/>`;
  }

  // Água: em cada trecho mais baixo que o nível, uma lâmina (topo) e a face da frente.
  function agua(c, h) {
    let topoA = "", frenteA = "";
    let i = 0;
    const p = c.perfil;
    while (i < p.length) {
      if (p[i].z < h) {
        let j = i;
        while (j + 1 < p.length && p[j + 1].z < h) j++;
        const x1 = p[i].x1, x2 = p[j].x2;
        topoA += poli(topo(x1, x2, h), "var(--azul-medio)", 'opacity=".72"');
        const pts = [P(x1, h, 0)];
        for (let k = i; k <= j; k++) pts.push(P(p[k].x1, p[k].z, 0), P(p[k].x2, p[k].z, 0));
        pts.push(P(x2, h, 0));
        frenteA += poli(pts, "var(--azul-medio)", 'opacity=".85"');
        // lado direito da lâmina na borda do bloco
        if (x2 === W) { const sd = [P(W, p[j].z, 0), P(W, h, 0), P(W, h, FUNDO), P(W, p[j].z, FUNDO)]; frenteA += poli(sd, "var(--azul-medio)", 'opacity=".85"'); }
        i = j + 1;
      } else i++;
    }
    return [topoA, frenteA];
  }

  function viaduto(c) {
    const v = c.viaduto;
    if (!v) return ["", ""];
    const chao = c.perfil[0].z;
    let pilares = "";
    [100, 60, 20].forEach((d) => v.pilares.forEach((x) => { pilares += caixa(x - 5, chao, d, 10, v.z - chao, 8, "var(--carro-prata)"); }));
    const deck = caixa(v.x1, v.z, 0, v.x2 - v.x1, 8, FUNDO, "var(--carro-prata)");
    const meio = (v.x1 + v.x2) / 2;
    let faixas = poli(topo(v.x1 + 2, v.x2 - 2, v.z + 8), "var(--carro-grafite)")
      + `<polyline points="${P(meio, v.z + 8, 0)} ${P(meio, v.z + 8, FUNDO)}" stroke="var(--amarelo)" stroke-width="1.4" fill="none"/>`;
    [v.x1 + (meio - v.x1) / 2, meio + (v.x2 - meio) / 2].forEach((xm) => {
      faixas += `<polyline points="${P(xm, v.z + 8, 0)} ${P(xm, v.z + 8, FUNDO)}" stroke="#fff" stroke-width="1" stroke-dasharray="6 6" fill="none" opacity=".8"/>`;
    });
    // guarda-corpo
    faixas += `<polyline points="${P(v.x1, v.z + 11, 0)} ${P(v.x1, v.z + 11, FUNDO)}" stroke="var(--carro-aro-claro)" stroke-width="1.5"/><polyline points="${P(v.x2, v.z + 11, 0)} ${P(v.x2, v.z + 11, FUNDO)}" stroke="var(--carro-aro-claro)" stroke-width="1.5"/>`;
    return [pilares, deck + faixas];
  }

  function cancelas(c, fechada) {
    if (!fechada) return "";
    let s = "";
    c.perfil.filter((t) => t.tipo === "pista").forEach((t) => {
      // na entrada de cada sentido: frente para quem vai ao fundo, fundo para quem vem
      [[t.x1, 2], [t.x1, FUNDO - 4]].forEach(([x, d]) => {
        const w = t.x2 - t.x1;
        for (let k = 0; k < 6; k++) {
          s += poli(frente(x + (k * w) / 6, x + ((k + 1) * w) / 6, t.z + 6, t.z + 10, d), k % 2 ? "#fff" : "var(--vermelho-fundo)");
        }
      });
    });
    return s;
  }

  let ultimo = 0, rodando = 0, visivel = true;
  function quadro(agora) {
    const c = CEN[cenario];
    const mm = Number(faixa.value);
    const h = Math.min(c.nivel(mm), 120);
    const fluxo = c.transito(mm);
    const dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 0;
    ultimo = agora;

    // Carros andam; quem sai do bloco volta pela entrada se a pista estiver aberta.
    const lento = fluxo === 0 ? 0.35 : fluxo < 1 ? 0.6 : 1;
    carros.forEach((k) => {
      if (k.fora) {
        k.espera -= dt;
        if (fluxo > 0 && k.espera <= 0) { k.fora = false; k.d = k.rumo > 0 ? 0 : FUNDO - L_CARRO; k.cor = CORES_CARRO[Math.floor(sorte() * CORES_CARRO.length)]; }
        return;
      }
      k.d += k.rumo * k.v * lento * dt;
      if (k.d > FUNDO - L_CARRO || k.d < 0) { k.fora = true; k.espera = (0.4 + sorte() * 1.6) / Math.max(fluxo, 0.5); }
    });

    const [aguaTopo, aguaFrente] = agua(c, h);
    const [pilares, deck] = viaduto(c);
    const naPista = carros.filter((k) => !k.fora).sort((a, b) => b.d - a.d);
    const opac = (k) => Math.max(0, Math.min(1, k.d / 8, (FUNDO - L_CARRO - k.d) / 8));
    const desenhaCarros = (lista) => lista.map((k) => carro(k.x, k.z, k.d, k.cor, opac(k), k.rumo)).join("");
    const submersos = desenhaCarros(naPista.filter((k) => !c.viaduto && k.z < h));
    const secos = desenhaCarros(naPista.filter((k) => !c.viaduto && k.z >= h));
    const emCima = desenhaCarros(naPista.filter(() => c.viaduto));
    const baixo = (t) => t.z < h, alto = (t) => t.z >= h;
    const todasArvores = (c.arvores || []).flatMap(([x, z]) => [90, 50, 12].map((d) => [x + (d % 3) * 4, z, d]));
    const arvores = (seco) => todasArvores.filter(([, z]) => (z >= h) === seco).map(([x, z, d]) => arvore(x, z, d)).join("");
    const t = agora / 1000;
    const gotas = mm > 0 ? Array.from({ length: Math.min(36, Math.ceil(mm / 2.5)) }, (_, i) => {
      const x = (i * 53) % 360, y = ((i * 37 + t * 260) % 240) - 20;
      return `<line x1="${x}" y1="${y.toFixed(1)}" x2="${x - 3}" y2="${(y + 9).toFixed(1)}" stroke="var(--azul-medio)" stroke-width="1.3" opacity=".7"/>`;
    }).join("") : "";

    palco.innerHTML = `
      <rect x="0" y="0" width="360" height="240" fill="var(--azul-claro)"/>
      ${solo(c, baixo)}${arvores(false)}${submersos}${aguaTopo}${solo(c, alto)}${arvores(true)}${secos}${frenteSolo(c)}${aguaFrente}${pilares}${deck}${emCima}${cancelas(c, fluxo === 0)}${gotas}`;
    rotulo.textContent = T.chuva(mm);
    situacao.textContent = c.estado(mm);
    if (!parado.matches && visivel) rodando = requestAnimationFrame(quadro);
    else rodando = 0;
  }
  function desenhar() {
    if (!rodando) quadro(performance.now());
  }
  new IntersectionObserver((e) => {
    visivel = e[0].isIntersecting;
    if (visivel) { ultimo = 0; desenhar(); }
  }).observe(palco);
  parado.addEventListener?.("change", desenhar);

  document.querySelectorAll("[data-cenario]").forEach((b) => b.addEventListener("click", () => {
    cenario = b.dataset.cenario;
    document.querySelectorAll("[data-cenario]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelectorAll("[data-legenda]").forEach((p) => { p.hidden = p.dataset.legenda !== cenario; });
    povoar();
    desenhar();
  }));
  faixa.addEventListener("input", desenhar);
  let animando = 0;
  botaoChover.addEventListener("click", () => {
    cancelAnimationFrame(animando);
    const alvo = 60;
    if (parado.matches) { faixa.value = alvo; desenhar(); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / 3500);
      faixa.value = Math.round(alvo * p);
      desenhar();
      if (p < 1) animando = requestAnimationFrame(passo);
    };
    animando = requestAnimationFrame(passo);
  });
  povoar();
  desenhar();
})();
