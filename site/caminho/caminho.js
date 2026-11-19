// Questionário "Qual caminho faz sentido pra mim?"
// Regras e perguntas: regras.js. Números de cada lugar: dados/*.json (gerados por scripts/caminho/gerar_dados.py).
// Tudo roda no navegador. As respostas ficam só no endereço da página, depois do #.

(() => {
  "use strict";
  const R = window.CAMINHO_REGRAS;
  const app = document.getElementById("app");
  const HOJE = new Date();
  const num = (n) => Number(n).toLocaleString("pt-BR");
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dataBR = (iso) => {
    const [a, m, d] = iso.split("-").map(Number);
    return `${d === 1 ? "1º" : d} de ${MESES[m - 1]} de ${a}`;
  };
  const UFS_NOMES = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
    ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
    PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
  };
  const chave = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

  // ---------------------------------------------------------------- estado e link
  const vazio = () => ({ uf: "", ibge: null, efeito: [], poder: [], quando: [], idade: null, nome: "", caminho: [], exemplo: null });
  let E = vazio();
  let passo = 0;
  const PASSOS = 2 + R.perguntas.length; // local, perguntas, sobre você

  function lerHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    const ex = p.get("exemplo");
    if (ex && R.exemplos[ex]) {
      const x = R.exemplos[ex];
      return { ...vazio(), ...structuredClone(x), exemplo: ex };
    }
    const lista = (k) => (p.get(k) || "").split(".").filter(Boolean);
    const e = vazio();
    e.uf = (p.get("uf") || "").toUpperCase();
    if (!UFS_NOMES[e.uf]) e.uf = "";
    e.ibge = Number(p.get("m")) || null;
    for (const q of R.perguntas) {
      const validas = q.opcoes.map((o) => o[0]);
      e[q.id] = lista(q.id).filter((v) => validas.includes(v));
    }
    const idade = Number(p.get("idade"));
    e.idade = idade >= 16 && idade <= 110 ? Math.floor(idade) : null;
    e.nome = limparNome(p.get("nome") || "");
    e.caminho = lista("caminho")
      .map((s) => { const i = s.lastIndexOf("-"); return [s.slice(0, i), Number(s.slice(i + 1))]; })
      .filter(([c, a]) => R.cargos[c] && R.eleicoes[a] && R.eleicoes[a].tipo === R.cargos[c].tipo);
    return e;
  }

  function hashDe(e) {
    if (e.exemplo) return "#exemplo=" + e.exemplo;
    const p = new URLSearchParams();
    if (e.uf) p.set("uf", e.uf);
    if (e.ibge) p.set("m", e.ibge);
    for (const q of R.perguntas) if (e[q.id].length) p.set(q.id, e[q.id].join("."));
    if (e.idade) p.set("idade", e.idade);
    if (e.nome) p.set("nome", e.nome);
    if (e.caminho.length) p.set("caminho", e.caminho.map(([c, a]) => `${c}-${a}`).join("."));
    if (passo >= PASSOS) p.set("ver", "1");
    return "#" + p.toString();
  }
  function salvar() { history.replaceState(null, "", location.pathname + hashDe(E)); }
  function limparNome(s) { return s.replace(/[^\p{L}\p{M} '.-]/gu, "").trim().slice(0, 40); }

  // ---------------------------------------------------------------- dados
  const cache = {};
  async function json(url) {
    if (!cache[url]) cache[url] = fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); });
    return cache[url];
  }
  const brasil = () => json("dados/brasil.json");
  const municipios = (uf) => json(`dados/municipios-${uf}.json`);

  // ---------------------------------------------------------------- utilidades de DOM
  function el(tag, attrs = {}, ...filhos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const f of filhos.flat(Infinity)) if (f != null && f !== false) n.append(f);
    return n;
  }
  const link = (fonte) => el("a", { href: R.fontes[fonte].url, rel: "noopener" }, R.fontes[fonte].nome);
  function cabecalhoPasso(titulo, multipla) {
    return [
      el("div", { class: "progresso" }, el("div", { style: `width:${(passo / PASSOS) * 100}%` })),
      el("div", { class: "contador" }, `Passo ${passo + 1} de ${PASSOS}`),
      el("h2", { id: "pergunta" }, titulo),
      multipla ? el("p", { class: "dica" }, "Pode marcar mais de uma") : null,
    ].filter(Boolean);
  }
  function botoes(podeSeguir, textoSeguir = "Continuar") {
    return el("div", { class: "acoes" },
      el("button", { class: "botao secundario", type: "button", disabled: passo === 0, onclick: () => { passo--; render(); } }, "Voltar"),
      el("button", { class: "botao", type: "button", disabled: !podeSeguir, onclick: () => { passo++; render(true); } }, textoSeguir),
    );
  }

  // ---------------------------------------------------------------- passos
  async function render(focar) {
    app.replaceChildren();
    app.className = "cartao";
    if (passo === 0) await passoLocal();
    else if (passo <= R.perguntas.length) passoPergunta(R.perguntas[passo - 1]);
    else if (passo === PASSOS - 1) passoVoce();
    else await resultado();
    if (focar) {
      const alvo = app.querySelector("h2");
      if (alvo) { alvo.setAttribute("tabindex", "-1"); alvo.focus({ preventScroll: true }); }
      app.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function passoLocal() {
    const info = el("p", { class: "campo-info" });
    const selUF = el("select", { id: "uf", onchange: async () => { E.uf = selUF.value; E.ibge = null; E.caminho = []; salvar(); await render(); document.getElementById(E.uf === "DF" ? "uf" : "municipio")?.focus(); } },
      el("option", { value: "" }, "Escolha o estado"),
      Object.entries(UFS_NOMES).sort((a, b) => a[1].localeCompare(b[1])).map(([s, n]) => el("option", { value: s, selected: s === E.uf }, `${n} (${s})`)),
    );
    app.append(
      ...cabecalhoPasso("Onde você vota?"),
      el("p", { class: "campo-info" }, "Para se candidatar, o título de eleitor precisa estar no lugar da disputa pelo menos 6 meses antes da eleição (Lei 9.504, art. 9º)."),
      el("label", { for: "uf" }, "Estado"), selUF,
    );
    let seguir = !!(E.uf && E.ibge);
    if (E.uf) {
      let lista;
      try { lista = await municipios(E.uf); }
      catch { app.append(el("p", { class: "campo-info" }, "Não consegui carregar os municípios. Tente de novo em instantes.")); app.append(botoes(false)); return; }
      if (lista.length === 1) { E.ibge = lista[0].ibge; seguir = true; salvar(); }
      const atual = lista.find((m) => m.ibge === E.ibge);
      const entrada = el("input", {
        id: "municipio", list: "lista-municipios", autocomplete: "off", placeholder: "Digite o nome da cidade",
        value: atual ? atual.nome : "",
        oninput: () => {
          const k = chave(entrada.value);
          const achou = lista.find((m) => chave(m.nome) === k);
          E.ibge = achou ? achou.ibge : null;
          salvar();
          info.textContent = achou ? `${achou.nome} (${E.uf})` + (achou.pop ? `, ${num(achou.pop)} habitantes (IBGE, Censo 2022)` : "") : (k.length > 2 ? "Escolha um nome da lista." : "");
          info.className = "campo-info" + (achou ? " ok" : "");
          app.querySelector(".acoes .botao:not(.secundario)").disabled = !achou;
        },
      });
      app.append(
        el("label", { for: "municipio" }, "Município ", el("small", {}, `(${num(lista.length)} em ${UFS_NOMES[E.uf]})`)),
        entrada,
        el("datalist", { id: "lista-municipios" }, lista.map((m) => el("option", { value: m.nome }))),
        info,
      );
      if (atual) { info.textContent = `${atual.nome} (${E.uf})` + (atual.pop ? `, ${num(atual.pop)} habitantes (IBGE, Censo 2022)` : ""); info.className = "campo-info ok"; }
      if (E.uf === "DF") app.append(el("p", { class: "campo-info" }, "O Distrito Federal não tem municípios nem vereadores. No lugar de deputado estadual existe o deputado distrital."));
    }
    app.append(botoes(seguir));
  }

  function passoPergunta(q) {
    const marcadas = new Set(E[q.id]);
    app.append(
      ...cabecalhoPasso(q.texto, q.multipla),
      el("div", { class: "opcoes", role: "group", "aria-labelledby": "pergunta" },
        q.opcoes.map(([valor, texto]) => {
          const b = el("button", {
            class: "opcao", type: "button", "aria-pressed": String(marcadas.has(valor)),
            onclick: () => {
              if (!q.multipla) marcadas.clear();
              marcadas.has(valor) ? marcadas.delete(valor) : marcadas.add(valor);
              E[q.id] = q.opcoes.map((o) => o[0]).filter((v) => marcadas.has(v));
              salvar();
              app.querySelectorAll(".opcao").forEach((o, i) => o.setAttribute("aria-pressed", String(marcadas.has(q.opcoes[i][0]))));
              app.querySelector(".acoes .botao:not(.secundario)").textContent = marcadas.size ? "Continuar" : "Pular";
            },
          }, texto);
          return b;
        }),
      ),
      botoes(true, marcadas.size ? "Continuar" : "Pular"),
    );
  }

  function passoVoce() {
    const idade = el("input", { id: "idade", type: "number", inputmode: "numeric", min: 16, max: 110, value: E.idade ?? "", placeholder: "Ex.: 32",
      oninput: () => { const v = Number(idade.value); E.idade = v >= 16 && v <= 110 ? Math.floor(v) : null; salvar(); } });
    const nome = el("input", { id: "nome", maxlength: 40, autocomplete: "given-name", value: E.nome, placeholder: "Ex.: Ana",
      oninput: () => { E.nome = limparNome(nome.value); salvar(); } });
    app.append(
      ...cabecalhoPasso("Quase lá. Duas perguntas opcionais"),
      el("label", { for: "idade" }, "Quantos anos você tem? ", el("small", {}, "(para conferir a idade mínima)")), idade,
      el("label", { for: "nome" }, "Como quer aparecer no link? ", el("small", {}, "(primeiro nome ou apelido)")), nome,
      el("p", { class: "campo-info" }, "Nada é enviado para servidor nenhum. Idade e nome só aparecem no link se você copiar e mandar para alguém."),
      botoes(true, "Ver meu resultado"),
    );
  }

  // ---------------------------------------------------------------- resultado
  function proximos(cargo) {
    const tipo = R.cargos[cargo].tipo;
    return Object.keys(R.eleicoes).map(Number).filter((a) => R.eleicoes[a].tipo === tipo && new Date(R.eleicoes[a].data) > HOJE).slice(0, 2);
  }

  function pontos(cargo, ano) {
    const c = R.cargos[cargo];
    const tem = (lista, v) => !lista.length || lista.includes(v);
    let p = 0;
    if (tem(E.efeito, c.nivel)) p += 3;
    if (tem(E.poder, c.poder)) p += 2;
    if (tem(E.quando, String(ano))) p += 2;
    else if (E.quando.includes("depois")) p += 1;
    return p;
  }

  function idadeNa(cargo, ano) {
    if (!E.idade) return null;
    const c = R.cargos[cargo];
    const data = c.idadeNa === "registro" ? R.eleicoes[ano].registro : `${ano + 1}-${c.posse}`;
    const anos = (new Date(data) - HOJE) / (365.25 * 864e5);
    const min = E.idade + Math.floor(anos), max = E.idade + Math.ceil(anos);
    return { min, max, ok: min >= c.idade ? "sim" : max < c.idade ? "nao" : "talvez", data };
  }

  function vagasProxima(cargo, ano, d) {
    const c = R.cargos[cargo];
    if (c.vagasPorAno && c.vagasPorAno[ano]) return c.vagasPorAno[ano];
    return d && d.vagas;
  }

  function cartaoCargo(item, local) {
    const { cargo, d, anos } = item;
    const c = R.cargos[cargo];
    const ano = anos[0];
    const ele = R.eleicoes[ano];
    const fit = item.pontos >= 6 ? ["alto", "Combina muito"] : item.pontos >= 4 ? ["medio", "Combina"] : ["", "Combina pouco"];
    const onde = c.tipo === "municipal" ? `${local.municipio} (${local.uf})` : c.nivel === "pais" ? `eleito por ${local.nomeUF}` : local.nomeUF;
    const linhas = [];
    const vg = vagasProxima(cargo, ano, d);
    if (vg) linhas.push(["Vagas em " + ano, num(vg) + (cargo === "senador" ? ` de 3 do estado (CF, art. 46)` : "")]);
    if (d && c.sistema === "proporcional") {
      if (d.qe) linhas.push([`Quociente eleitoral em ${d.ano}`, el("span", {}, num(d.qe) + " votos ", el("small", {}, "para um partido ou federação eleger 1"))]);
      if (d.menor_eleito != null) linhas.push([`Eleito com menos votos em ${d.ano}`, num(d.menor_eleito) + " votos"]);
      if (d.qe) linhas.push(["Mínimo individual", el("span", {}, num(Math.ceil(d.qe * 0.1)) + " votos ", el("small", {}, "10% do quociente (Código Eleitoral, art. 108)"))]);
      if (d.validos) linhas.push([`Votos válidos em ${d.ano}`, num(d.validos)]);
    } else if (d) {
      if (d.menor_eleito != null) linhas.push([(d.vagas > 1 ? "Eleito com menos votos em " : "Votos do eleito em ") + d.ano, num(d.menor_eleito) + " votos" + (d.segundo_turno ? " (no 2º turno)" : "")]);
      if (d.validos && cargo !== "senador") linhas.push([`Votos válidos no 1º turno em ${d.ano}`, num(d.validos)]);
      if (cargo === "prefeito" && d.eleitores) linhas.push(["Eleitores aptos em " + d.ano, el("span", {}, num(d.eleitores) + " ", el("small", {}, d.eleitores > 200000 ? "pode ter 2º turno (mais de 200 mil eleitores, CF, art. 29, II)" : "turno único (até 200 mil eleitores, CF, art. 29, II)"))]);
      if (cargo === "governador") linhas.push(["Para vencer no 1º turno", "mais da metade dos votos válidos (CF, art. 28 e 77)"]);
    }
    const idade = idadeNa(cargo, ano);
    const txtIdade = !idade ? null
      : idade.ok === "sim" ? el("small", {}, ` · em ${ano} você terá`)
      : idade.ok === "nao" ? el("span", { class: "idade-nao" }, ` em ${ano} você ainda não terá`)
      : el("small", {}, ` · em ${ano}, depende do seu aniversário`);
    linhas.push(["Idade mínima", el("span", {}, `${c.idade} anos `, el("small", {}, c.idadeNa === "registro" ? "até o prazo do registro" : "na posse"), txtIdade)]);
    linhas.push(["Próxima eleição", dataBR(ele.data)]);
    linhas.push(["Filiação e título no lugar até", dataBR(ele.filiacao) + " (6 meses antes)"]);
    linhas.push(["Pedido de registro até", dataBR(ele.registro)]);
    linhas.push(["Mandato", `${c.mandato} anos, a partir de ${dataBR(`${ano + 1}-${c.posse}`)}`]);

    const noCaminho = E.caminho.some(([cc]) => cc === cargo);
    const selAno = el("select", { "aria-label": "Ano da eleição" }, anos.map((a) => el("option", { value: a }, String(a))));
    return el("article", { class: "cargo" + (noCaminho ? " no-caminho" : "") },
      el("div", { class: "cargo-topo" },
        el("div", {}, el("h3", {}, c.nome), el("p", { class: "onde" }, `${c.casa}, ${onde}`)),
        el("span", { class: "selo-fit " + fit[0] }, fit[1]),
      ),
      el("p", {}, c.faz),
      el("dl", {}, linhas.map(([a, b]) => [el("dt", {}, a), el("dd", {}, b)])),
      el("p", { class: "fonte" }, "Fontes: TSE, Dados Abertos, eleição de ", String(d ? d.ano : ""), "; ", c.base, "; Lei 9.504, arts. 8º, 9º e 11."),
      E.exemplo ? null : el("div", { class: "adicionar" },
        anos.length > 1 ? selAno : null,
        el("button", { class: "botao" + (noCaminho ? " secundario" : " verde"), type: "button",
          onclick: () => {
            const a = Number(anos.length > 1 ? selAno.value : anos[0]);
            E.caminho = E.caminho.filter(([cc, aa]) => !(cc === cargo && aa === a));
            E.caminho.push([cargo, a]);
            E.caminho.sort((x, y) => x[1] - y[1]);
            salvar(); render();
            setTimeout(() => document.getElementById("meu-caminho")?.scrollIntoView({ behavior: "smooth" }), 50);
          } }, "Pôr no meu caminho"),
      ),
    );
  }

  function notasDoCaminho() {
    const notas = new Map();
    const porAno = {};
    E.caminho.forEach(([c, a], i) => {
      (porAno[a] ||= []).push(c);
      const ant = E.caminho[i - 1];
      if (!ant || ant[1] === a) return;
      const cAnt = R.cargos[ant[0]];
      const eleito = ant[1] + 1;
      if (Number(a) < eleito + cAnt.mandato) {
        if (cAnt.poder === "executivo" && ant[0] !== c) {
          notas.set(i, ["alerta", `Se for eleito ${cAnt.nome.toLowerCase()} em ${ant[1]}, precisa renunciar até 6 meses antes da eleição de ${a} para disputar outro cargo (CF, art. 14, § 6º).`]);
        } else if (cAnt.poder === "legislativo") {
          notas.set(i, ["", `Quem tem mandato de ${cAnt.nome.toLowerCase()} pode disputar ${R.cargos[c].nome.toLowerCase()} sem renunciar. A renúncia de 6 meses só vale para presidente, governador e prefeito (CF, art. 14, § 6º).`]);
        }
      }
    });
    for (const [a, cs] of Object.entries(porAno)) {
      if (cs.length > 1) {
        const i = E.caminho.findIndex(([, aa]) => String(aa) === a);
        notas.set(i, ["alerta", `Em ${a} dá para registrar só uma candidatura (Código Eleitoral, art. 88). Escolha um destes cargos.`]);
      }
    }
    return notas;
  }

  function blocoCaminho(local) {
    const titulo = E.exemplo ? `O caminho do ${E.nome}` : E.nome ? `O caminho de ${E.nome}` : "Meu caminho";
    const notas = notasDoCaminho();
    const lista = E.caminho.length
      ? el("ol", { class: "linha-tempo" }, E.caminho.map(([cargo, ano], i) => {
        const c = R.cargos[cargo], ele = R.eleicoes[ano];
        const onde = c.tipo === "municipal" ? `em ${local.municipio} (${local.uf})` : c.poder === "executivo" ? `de ${local.nomeUF}` : `por ${local.nomeUF}`;
        const nota = notas.get(i);
        return el("li", { class: "passo" },
          el("span", { class: "ano", "aria-hidden": "true" }, String(ano)),
          el("h3", {}, `${c.nome} ${onde}`),
          el("ul", {},
            el("li", {}, "Filiação a um partido e título no lugar até ", el("strong", {}, dataBR(ele.filiacao))),
            el("li", {}, "Convenções do partido: ", dataBR(ele.convencoes[0]).replace(/ de \d{4}$/, ""), " a ", dataBR(ele.convencoes[1])),
            el("li", {}, "Pedido de registro até ", dataBR(ele.registro)),
            el("li", {}, "Eleição em ", el("strong", {}, dataBR(ele.data))),
          ),
          nota ? el("p", { class: "nota-passo " + nota[0] }, nota[1]) : null,
          E.exemplo ? null : el("button", { class: "botao secundario remover", type: "button",
            onclick: () => { E.caminho.splice(i, 1); salvar(); render(); } }, "Tirar do caminho"),
        );
      }))
      : el("p", { class: "vazio" }, "Seu caminho ainda está vazio. Escolha um cargo abaixo e toque em “Pôr no meu caminho”. Dá para montar uma sequência, um cargo por eleição.");
    const copiado = el("span", { class: "copiado", role: "status" });
    return el("section", { id: "meu-caminho" },
      el("h2", {}, titulo),
      el("p", { class: "local" }, `${local.municipio} (${local.uf})` + (local.pop ? ` · ${num(local.pop)} habitantes (IBGE, Censo 2022)` : "")),
      lista,
      el("div", { class: "acoes" },
        el("button", { class: "botao secundario", type: "button", onclick: () => { E = vazio(); passo = 0; history.replaceState(null, "", location.pathname); render(true); } },
          E.exemplo ? "Fazer o meu caminho" : "Recomeçar"),
        E.exemplo ? null : el("button", { class: "botao secundario", type: "button", onclick: () => { passo = 0; render(true); } }, "Mudar respostas"),
        el("button", { class: "botao", type: "button", onclick: async () => {
          const url = location.origin + location.pathname + hashDe(E);
          const texto = E.exemplo ? "O caminho do Gabriel, com dados do TSE" : "Montei meu caminho na política com dados do TSE";
          try {
            if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ title: document.title, text: texto, url }); return; }
            await navigator.clipboard.writeText(url); copiado.textContent = "Link copiado";
          } catch { copiado.textContent = url; }
        } }, "Compartilhar link"),
        copiado,
      ),
    );
  }

  async function resultado() {
    let B, lista;
    try { [B, lista] = await Promise.all([brasil(), municipios(E.uf)]); }
    catch { app.append(el("p", {}, "Não consegui carregar os dados. Tente de novo em instantes.")); return; }
    const m = lista.find((x) => x.ibge === E.ibge);
    if (!m) { passo = 0; return render(); }
    const est = B.estados[E.uf] || {};
    const local = { municipio: m.nome, uf: E.uf, nomeUF: UFS_NOMES[E.uf], pop: m.pop };
    salvar();

    const disponiveis = E.uf === "DF"
      ? ["deputado_distrital", "governador", "deputado_federal", "senador"]
      : ["vereador", "prefeito", "deputado_estadual", "governador", "deputado_federal", "senador"];
    const itens = disponiveis
      .map((cargo) => ({ cargo, d: R.cargos[cargo].tipo === "municipal" ? m[cargo] : est[cargo], anos: proximos(cargo) }))
      .filter((x) => x.anos.length && (x.d || R.cargos[x.cargo].tipo === "geral"))
      .map((x) => ({ ...x, pontos: Math.max(...x.anos.map((a) => pontos(x.cargo, a))) }))
      .sort((a, b) => b.pontos - a.pontos);

    const fortes = itens.filter((x) => x.pontos >= 4);
    const fracos = itens.filter((x) => x.pontos < 4);
    app.className = "cartao";
    if (E.exemplo) {
      const x = R.exemplos[E.exemplo];
      app.append(el("div", { class: "aviso" }, el("p", {}, x.nota),
        el("button", { class: "botao", type: "button", onclick: () => { E = vazio(); passo = 0; history.replaceState(null, "", location.pathname); render(true); } }, "Fazer o meu caminho")));
    }
    app.append(blocoCaminho(local));
    app.append(
      el("h2", { style: "margin-top:var(--espaco-6)" }, E.exemplo ? "Os cargos para quem vota em " + m.nome : "Cargos que você pode disputar"),
      el("p", { class: "local" }, "Do que mais combina com suas respostas para o que menos combina."),
      el("div", { class: "cargos" }, (fortes.length ? fortes : itens).map((x) => cartaoCargo(x, local))),
      fortes.length && fracos.length ? el("details", { class: "outros-cargos" },
        el("summary", {}, `Outros cargos que combinam menos (${fracos.length})`),
        el("div", { class: "cargos" }, fracos.map((x) => cartaoCargo(x, local)))) : null,
      el("p", { class: "fonte" }, `Dados gerados em ${dataBR(B.gerado_em)} a partir dos arquivos do TSE (eleições de ${B.eleicao_municipal} e ${B.eleicao_geral}) e do IBGE. Confira sempre no TSE e no TRE do seu estado. Nada aqui é orientação jurídica.`),
    );
  }

  // ---------------------------------------------------------------- início
  function iniciar() {
    E = lerHash();
    const respondeu = E.exemplo || (E.uf && E.ibge && new URLSearchParams(location.hash.slice(1)).get("ver") === "1");
    passo = respondeu ? PASSOS : 0;
    render();
  }
  window.addEventListener("hashchange", () => { if (location.hash !== hashDe(E)) { iniciar(); app.scrollIntoView({ behavior: "smooth" }); } });
  brasil().then((B) => {
    document.querySelectorAll("[data-ano-geral]").forEach((n) => (n.textContent = B.eleicao_geral));
    const f = document.getElementById("faq-datas");
    if (f) f.textContent = `Dados gerados em ${dataBR(B.gerado_em)}. Arquivos do TSE gerados em: ` +
      Object.entries(B.arquivos_tse_gerados_em).map(([a, d]) => `${a}, ${d ? dataBR(d) : "sem data"}`).join("; ") + ".";
  }).catch(() => {});
  iniciar();
})();
