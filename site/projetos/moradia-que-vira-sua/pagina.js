// Página "O aluguel que vira a sua casa" (PT e EN usam o mesmo arquivo; os textos seguem o lang da página).
// 1) Desenha os três modelos de prédio em SVG (fachada, ilustração editorial plana, cores de tokens.css).
// 2) Liga os botões que destacam cada parte do prédio (lojas, moradias, jardim, água, transporte, sol).
// 3) Calculadora: quanto a família pagaria e quanto vira compra.
(() => {
  const EN = document.documentElement.lang.startsWith("en");
  const T = EN ? {
    mercado: "Grocery", farmacia: "Pharmacy", padaria: "Bakery", creche: "Daycare", saude: "Clinic",
    lanchonete: "Snack bar", restaurante: "Diner", cafe: "Café", bicicleta: "Bike shop",
    estacao: "BRT", ponto: "Bus",
  } : {
    mercado: "Mercado", farmacia: "Farmácia", padaria: "Padaria", creche: "Creche", saude: "Saúde",
    lanchonete: "Lanches", restaurante: "Restaurante", cafe: "Café", bicicleta: "Bicicletas",
    estacao: "BRT", ponto: "Ônibus",
  };

  const C = (n) => `var(--${n})`;
  const r = (x, y, w, h, cor, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${C(cor)}" ${extra}/>`;
  const c = (x, y, raio, cor, extra = "") => `<circle cx="${x}" cy="${y}" r="${raio}" style="fill:${C(cor)}" ${extra}/>`;
  const p = (d, cor, extra = "") => `<path d="${d}" style="fill:${C(cor)}" ${extra}/>`;
  const l = (d, cor, w, extra = "") => `<path d="${d}" style="fill:none;stroke:${C(cor)};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round" ${extra}/>`;
  const txt = (x, y, s, cor, tam = 20) => `<text x="${x}" y="${y}" text-anchor="middle" style="fill:${C(cor)};font:800 ${tam}px var(--fonte)">${s}</text>`;
  const g = (parte, corpo) => `<g data-parte="${parte}">${corpo}</g>`;

  const CHAO = 450;      // linha da calçada
  const TERREO = 78;     // altura do térreo com lojas
  const ANDAR = 46;      // altura de cada andar de moradia

  const arvore = (x, y, raio, cor = "verde-escuro") => r(x - 4, y - raio * 1.5, 8, raio * 1.5, "azul") + c(x, y - raio * 1.7, raio, cor) + c(x - raio * .55, y - raio * 1.35, raio * .7, cor) + c(x + raio * .55, y - raio * 1.35, raio * .7, cor);

  // Uma loja do térreo: vitrine, porta, toldo e placa.
  function loja(x, w, nome, cor) {
    const topo = CHAO - TERREO;
    const n = Math.max(3, Math.round(w / 22));
    let toldo = r(x + 2, topo + 32, w - 4, 12, cor);
    for (let i = 0; i < n; i++) toldo += c(x + 2 + (w - 4) / n * (i + .5), topo + 44, (w - 4) / n / 2, cor);
    return r(x + 6, topo + 4, w - 12, 24, "branco", 'rx="4"') + txt(x + w / 2, topo + 23, nome, "azul", nome.length > 9 ? 15 : 17)
      + toldo
      + r(x + 10, topo + 50, w - 20, TERREO - 50, "azul-claro")
      + r(x + w / 2 - 12, topo + 52, 24, TERREO - 52, "azul-medio")
      + l(`M${x + 10},${topo + 50} h${w - 20}`, "branco", 2);
  }

  // Um bloco de moradia: térreo com lojas, andares com janelas e varandas, cobertura.
  function bloco(x, w, andares, o) {
    const topoTerreo = CHAO - TERREO;
    const topo = topoTerreo - andares * ANDAR;
    let s = "";
    // Corpo dos andares
    let mor = r(x, topo, w, andares * ANDAR, o.cor || "areia");
    const cols = Math.max(2, Math.floor((w - 20) / 52));
    const passo = (w - 20) / cols;
    for (let a = 0; a < andares; a++) {
      const y = topo + a * ANDAR + 9;
      for (let k = 0; k < cols; k++) {
        const jx = x + 10 + k * passo + (passo - 32) / 2;
        mor += r(jx, y, 32, 26, o.janela || "azul-claro", 'rx="3"') + l(`M${jx + 16},${y} v26`, "branco", 2);
        if ((a + k) % 3 === 0) mor += l(`M${jx - 4},${y + 30} h40`, o.varanda || "verde-escuro", 4) + c(jx + 6, y + 24, 6, "verde");
        else mor += l(`M${jx - 2},${y + 30} h36`, "texto-suave", 2);
      }
    }
    // Faixa entre o térreo e as moradias
    mor += r(x - 4, topoTerreo - 6, w + 8, 8, o.faixa || "azul");
    s += g("moradias", mor);
    // Cobertura
    s += r(x - 4, topo - 8, w + 8, 10, o.faixa || "azul");
    if (o.telhadoVerde) {
      let j = r(x, topo - 22, w, 14, "verde-claro");
      for (let k = 0; k < Math.floor(w / 70); k++) j += arvore(x + 35 + k * 70, topo - 10, 11, k % 2 ? "verde" : "verde-escuro");
      s += g("jardim", j);
    }
    if (o.solar) {
      let so = "";
      const n = Math.floor((w - 20) / 58);
      for (let k = 0; k < n; k++) {
        const sx = x + 14 + k * 58;
        so += p(`M${sx},${topo - 10} l12,-26 h36 l-12,26 z`, "azul-medio") + l(`M${sx + 6},${topo - 23} h36`, "azul-claro", 1.5);
      }
      s += g("sol", so);
    }
    // Térreo: lojas
    let lj = r(x, topoTerreo, w, TERREO, o.faixa || "azul");
    const lw = w / o.lojas.length;
    const cores = ["verde", "livre-coral", "amarelo-escuro", "livre-turquesa", "azul-medio"];
    o.lojas.forEach((nome, i) => { lj += loja(x + i * lw, lw, T[nome], cores[i % cores.length]); });
    s += g("lojas", lj);
    return s;
  }

  // Pátio aberto entre dois blocos: muro baixo, árvores, banco e parquinho.
  function patio(x, w) {
    let j = r(x, CHAO - 150, w, 150, "verde-claro");
    j += arvore(x + w * .25, CHAO - 10, 26) + arvore(x + w * .72, CHAO - 14, 32, "verde");
    j += l(`M${x + w * .38},${CHAO - 20} h${w * .22} M${x + w * .4},${CHAO - 20} v14 M${x + w * .58},${CHAO - 20} v14`, "azul", 4);
    j += l(`M${x + w * .08},${CHAO} l14,-46 l14,46 M${x + w * .08 + 7},${CHAO - 22} h14`, "livre-coral", 4);
    return g("jardim", j);
  }

  // Calçada, jardim de chuva, caixa que guarda água e a rua.
  function rua(o) {
    let s = r(0, CHAO, 800, 18, "areia") + r(0, CHAO + 18, 800, 52, "texto-suave") + `<rect x="0" y="${CHAO + 70}" width="800" height="60" style="fill:${C("livre-terra")};opacity:.35"/>`;
    for (let k = 0; k < 9; k++) s += r(20 + k * 90, CHAO + 42, 44, 4, "branco");
    let agua = "";
    (o.jardinsDeChuva || []).forEach((x) => {
      agua += r(x, CHAO + 2, 90, 14, "livre-turquesa", 'rx="4"') + l(`M${x + 10},${CHAO + 9} q10,-6 20,0 t20,0 t20,0`, "branco", 2);
    });
    if (o.cisterna) agua += r(o.cisterna, CHAO + 84, 140, 30, "livre-turquesa", 'rx="8"') + l(`M${o.cisterna + 14},${CHAO + 99} q12,-8 24,0 t24,0 t24,0 t24,0 t24,0`, "branco", 2) + l(`M${o.cisterna + 70},${CHAO + 16} v68`, "livre-turquesa", 4, 'stroke-dasharray="6 6"');
    s += g("agua", agua);
    let arv = "";
    (o.arvores || []).forEach((x, i) => { arv += arvore(x, CHAO + 4, 20, i % 2 ? "verde" : "verde-escuro"); });
    s += g("jardim", arv);
    return s;
  }

  // Ônibus ou BRT e a parada.
  function transporte(x, tipo) {
    const brt = tipo === "estacao";
    let s = "";
    if (brt) s += r(x, CHAO - 78, 150, 8, "azul") + r(x + 6, CHAO - 70, 6, 70, "azul") + r(x + 138, CHAO - 70, 6, 70, "azul") + r(x + 12, CHAO - 66, 126, 34, "azul-claro") + r(x + 40, CHAO - 104, 70, 24, "amarelo", 'rx="6"') + txt(x + 75, CHAO - 86, T.estacao, "azul", 17);
    else s += r(x + 30, CHAO - 74, 6, 74, "azul") + r(x - 6, CHAO - 102, 78, 30, "amarelo", 'rx="6"') + txt(x + 33, CHAO - 81, T.ponto, "azul", 16);
    const bx = Math.min(brt ? x - 20 : x + 60, 590);
    s += r(bx, CHAO + 10, 200, 52, brt ? "verde-fundo" : "azul-medio", 'rx="10"');
    for (let k = 0; k < 5; k++) s += r(bx + 14 + k * 36, CHAO + 18, 28, 20, "azul-claro", 'rx="3"');
    s += c(bx + 40, CHAO + 64, 10, "azul") + c(bx + 160, CHAO + 64, 10, "azul");
    return g("transporte", s);
  }

  function ceu() {
    return r(0, 0, 800, CHAO, "creme") + c(700, 70, 34, "amarelo-claro") + c(700, 70, 22, "amarelo");
  }

  // Prédio antigo do centro, reformado: fachada com moldura, coroamento e jardim vertical.
  function reforma(x, w, andares) {
    let s = bloco(x, w, andares, { cor: "livre-coral-claro", faixa: "livre-terra", varanda: "livre-terra", lojas: ["farmacia", "restaurante", "mercado"], telhadoVerde: true });
    const topo = CHAO - TERREO - andares * ANDAR;
    s += g("moradias", r(x - 12, topo - 6, w + 24, 12, "livre-terra") + r(x + w / 2 - 50, topo - 8, 100, 10, "livre-terra"));
    let jv = "";
    for (let a = 0; a < andares; a++) jv += c(x - 2, topo + a * ANDAR + 20, 10, a % 2 ? "verde" : "verde-escuro") + c(x + w + 2, topo + a * ANDAR + 30, 10, a % 2 ? "verde-escuro" : "verde");
    s += g("jardim", jv);
    return s;
  }

  // Prédio vizinho, só para dar contexto à rua.
  function vizinho(x, w, h, cor) {
    let v = r(x, CHAO - h, w, h, cor);
    for (let y = CHAO - h + 16; y < CHAO - 30; y += 40) for (let k = 0; k < Math.floor(w / 40); k++) v += r(x + 12 + k * 40, y, 22, 22, cor === "areia" ? "branco" : "branco", 'rx="2"');
    return v;
  }

  const MODELOS = {
    quadra: () => ceu() + bloco(40, 270, 4, { cor: "areia", lojas: ["mercado", "farmacia"], telhadoVerde: true })
      + patio(310, 150) + bloco(460, 200, 4, { cor: "amarelo-claro", faixa: "verde-fundo", lojas: ["padaria", "creche"], solar: true })
      + rua({ jardinsDeChuva: [70, 330, 480], cisterna: 320, arvores: [40, 300, 470, 660] }) + transporte(650, "estacao"),
    avenida: () => ceu() + bloco(30, 600, 6, { cor: "branco", janela: "azul-claro", faixa: "azul", varanda: "azul-medio", lojas: ["mercado", "farmacia", "saude", "lanchonete"], solar: true })
      + rua({ jardinsDeChuva: [60, 260, 460], cisterna: 140, arvores: [40, 240, 440, 640] }) + transporte(630, "estacao"),
    centro: () => ceu() + reforma(150, 380, 7)
      + g("moradias", vizinho(40, 100, 260, "areia") + vizinho(540, 110, 210, "azul-claro"))
      + rua({ jardinsDeChuva: [180, 420], arvores: [100, 560, 720] }) + transporte(660, "ponto"),
  };

  document.querySelectorAll("[data-modelo]").forEach((fig) => {
    const nome = fig.dataset.modelo;
    const svg = fig.querySelector("svg");
    svg.insertAdjacentHTML("beforeend", MODELOS[nome]());
  });

  // Abas dos modelos
  const abas = [...document.querySelectorAll(".abas-modelo [role=tab]")];
  function abrir(aba, focar) {
    abas.forEach((a) => {
      const sel = a === aba;
      a.setAttribute("aria-selected", sel);
      a.tabIndex = sel ? 0 : -1;
      document.getElementById(a.getAttribute("aria-controls")).hidden = !sel;
    });
    if (focar) aba.focus();
  }
  abas.forEach((a, i) => {
    a.addEventListener("click", () => abrir(a));
    a.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); abrir(abas[(i + d + abas.length) % abas.length], true); }
    });
  });

  // Destacar uma parte do prédio
  document.querySelectorAll(".partes").forEach((grupo) => {
    const painel = grupo.closest(".modelo-painel");
    const svg = painel.querySelector("svg");
    grupo.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        const ligar = b.getAttribute("aria-pressed") !== "true";
        grupo.querySelectorAll("button").forEach((o) => o.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", ligar);
        const parte = ligar ? b.dataset.parte : "";
        svg.querySelectorAll("[data-parte]").forEach((el) => el.classList.toggle("apagado", !!parte && el.dataset.parte !== parte));
        const nota = painel.querySelector(".parte-nota");
        nota.textContent = ligar ? b.dataset.nota : "";
      });
    });
  });

  // Calculadora
  const form = document.getElementById("calculadora");
  if (form) {
    const fmt = new Intl.NumberFormat(EN ? "en-US" : "pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    // Faixas de renda urbana da Lei 14.620/2023, art. 5º (valores da lei; o ministério atualiza todo ano).
    const pct = (renda) => renda <= 2640 ? .10 : renda <= 4400 ? .15 : renda <= 8000 ? .20 : .30;
    const calc = () => {
      const renda = Math.max(0, Number(form.renda.value) || 0);
      const anos = Number(form.anos.value);
      const p = pct(renda);
      const parcela = Math.round(renda * p);
      const compra = Math.round(parcela / 2);
      const meses = Math.max(0, (anos - 1) * 12);
      const juntou = compra * meses;
      const leva = anos < 5 ? Math.round(juntou * .9) : juntou;
      form.querySelector("[data-saida=pct]").textContent = Math.round(p * 100) + "%";
      form.querySelector("[data-saida=parcela]").textContent = fmt.format(parcela);
      form.querySelector("[data-saida=compra]").textContent = fmt.format(compra);
      form.querySelector("[data-saida=juntou]").textContent = fmt.format(juntou);
      form.querySelector("[data-saida=leva]").textContent = fmt.format(leva);
      form.querySelector("[data-saida=anos]").textContent = anos;
      form.querySelector("[data-saida=regra]").textContent = anos < 5
        ? (EN ? "Before 5 years, the family takes 90% to the next home." : "Antes de 5 anos, a família leva 90% para o próximo apartamento.")
        : (EN ? "After 5 years, the family takes all of it." : "Depois de 5 anos, a família leva tudo.");
    };
    form.addEventListener("input", calc);
    form.addEventListener("submit", (e) => e.preventDefault());
    calc();
  }

  // Revelar capítulos ao rolar
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visivel"); io.unobserve(e.target); } }), { threshold: .08 }) : null;
  document.querySelectorAll(".revelar").forEach((el) => io ? io.observe(el) : el.classList.add("visivel"));
})();
