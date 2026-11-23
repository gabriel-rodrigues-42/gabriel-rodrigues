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
    const [{ estilo: st, reserva }, osm, posicoes] = await Promise.all([
      estilo(), pegar(pasta + "osm.geojson"), pegar(pasta + "posicoes.json"),
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
      };
      const estado = { pontos: true, risco: true, agua: true, marcos: true };
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

  // ---------- Cenários da Marginal (ilustração fora de escala) ----------
  const palco = document.getElementById("palco");
  if (!palco) return;
  const faixa = document.getElementById("chuva");
  const rotulo = document.getElementById("chuva-rotulo");
  const situacao = document.getElementById("situacao");
  const botaoChover = document.getElementById("chover");
  const CEN = {
    hoje: {
      chao: "M0 110 H150 V170 H210 V110 H360 V200 H0 Z",
      nivel: (mm) => (mm <= 30 ? 170 - (mm / 30) * 60 : 110 - (mm - 30) * 0.3),
      pistas: [[30, 104, 115], [215, 104, 115]],
      estado: (mm) => (mm < 25 ? (EN ? "Road open" : "Pista aberta") : mm <= 35 ? (EN ? "Danger zone: the road usually closes between 25 and 35 mm" : "Zona de perigo: a via costuma fechar entre 25 e 35 mm") : (EN ? "Road closed, water over the lanes" : "Pista fechada, água por cima das faixas")),
    },
    piloto: {
      chao: "M0 130 H150 V170 H210 V100 H360 V200 H0 Z",
      nivel: (mm) => { const e = mm * 0.6; return e <= 30 ? 170 - (e / 30) * 40 : 130 - (e - 30) * 0.35; },
      pistas: [[215, 94, 115]],
      parque: [10, 140],
      estado: (mm) => (mm * 0.6 <= 30 ? (EN ? "Water stays in the channel; park and road open" : "A água fica no canal; parque e pista abertos") : (EN ? "The park floods on purpose; the road stays open" : "O parque alaga de propósito; a pista segue aberta")),
    },
    elevada: {
      chao: "M0 130 H150 V170 H210 V130 H360 V200 H0 Z",
      nivel: (mm) => (mm <= 30 ? 170 - (mm / 30) * 40 : 130 - (mm - 30) * 0.35),
      pistas: [[60, 44, 240]],
      viaduto: true,
      parque: [10, 140, 215, 140],
      estado: () => (EN ? "Cars pass above; the park floods below, in the shade" : "Os carros passam em cima; o parque alaga embaixo, na sombra"),
    },
  };
  let cenario = "hoje";

  function desenhar() {
    const c = CEN[cenario];
    const mm = Number(faixa.value);
    const y = Math.max(20, c.nivel(mm));
    const arvores = (c.parque || []).reduce((s, v, i, arr) => {
      if (i % 2) return s;
      const x0 = v, base = arr[i + 1] - 10;
      return s + [0, 45, 90].map((dx) => `<g><rect x="${x0 + dx + 18}" y="${base - 8}" width="4" height="12" fill="var(--carro-terracota)"/><circle cx="${x0 + dx + 20}" cy="${base - 14}" r="10" fill="var(--verde)"/></g>`).join("");
    }, "");
    const pistas = c.pistas.map(([x, yy, w]) => `<rect x="${x}" y="${yy}" width="${w}" height="6" fill="var(--carro-grafite)"/><rect x="${x + w / 2 - 20}" y="${yy + 2}" width="14" height="2" fill="var(--amarelo)"/><rect x="${x + 10}" y="${yy - 9}" width="22" height="9" rx="3" fill="var(--livre-coral)"/>`).join("");
    const viaduto = c.viaduto ? `<rect x="88" y="50" width="8" height="${130 - 50}" fill="var(--carro-prata)"/><rect x="264" y="50" width="8" height="${130 - 50}" fill="var(--carro-prata)"/><rect x="0" y="50" width="360" height="90" fill="var(--azul)" opacity=".06"/>` : "";
    palco.innerHTML = `
      <rect x="0" y="0" width="360" height="200" fill="var(--azul-claro)"/>
      ${mm > 0 ? Array.from({ length: Math.min(24, Math.ceil(mm / 4)) }, (_, i) => `<line class="gota" x1="${(i * 47) % 360}" y1="${(i * 13) % 40}" x2="${(i * 47) % 360 - 4}" y2="${(i * 13) % 40 + 10}" stroke="var(--azul-medio)" stroke-width="1.5" style="animation-delay:-${(i % 6) * 0.12}s"/>`).join("") : ""}
      <rect x="0" y="${y}" width="360" height="${200 - y}" fill="var(--azul-medio)" opacity=".75"/>
      <path d="${c.chao}" fill="var(--areia)"/>
      ${cenario === "hoje" ? '<path d="M150 110 V170 H210 V110" fill="none" stroke="var(--carro-prata)" stroke-width="4"/>' : '<path d="M150 130 V170 H210" fill="none" stroke="var(--verde-escuro)" stroke-width="3" opacity=".5"/>'}
      ${(c.parque || []).length ? (c.parque.reduce((s, v, i, a) => (i % 2 ? s : s + `<rect x="${v - 10}" y="${a[i + 1] - 10}" width="${cenario === "piloto" ? 160 : 140}" height="4" fill="var(--verde)"/>`), "")) : ""}
      ${arvores}${viaduto}${pistas}`;
    rotulo.textContent = T.chuva(mm);
    situacao.textContent = c.estado(mm);
  }

  document.querySelectorAll("[data-cenario]").forEach((b) => b.addEventListener("click", () => {
    cenario = b.dataset.cenario;
    document.querySelectorAll("[data-cenario]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    document.querySelectorAll("[data-legenda]").forEach((p) => { p.hidden = p.dataset.legenda !== cenario; });
    desenhar();
  }));
  faixa.addEventListener("input", desenhar);
  let animando = 0;
  botaoChover.addEventListener("click", () => {
    cancelAnimationFrame(animando);
    const alvo = 60;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { faixa.value = alvo; desenhar(); return; }
    const t0 = performance.now();
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / 3500);
      faixa.value = Math.round(alvo * p);
      desenhar();
      if (p < 1) animando = requestAnimationFrame(passo);
    };
    animando = requestAnimationFrame(passo);
  });
  desenhar();
})();
