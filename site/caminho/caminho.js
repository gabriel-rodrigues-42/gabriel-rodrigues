// Questionário "Qual caminho faz sentido pra mim?"
// Regras e perguntas: regras.js. Números de cada lugar: dados/*.json (gerados por scripts/caminho/gerar_dados.py).
// Tudo roda no navegador. As respostas ficam só no endereço da página, depois do #.

(() => {
  "use strict";
  const R = window.CAMINHO_REGRAS;
  const app = document.getElementById("app");
  const HOJE = new Date();
  // Idioma: inglês na versão /en/caminho/ (<html lang="en">). Os textos das regras em inglês
  // vêm de regras-en.js, que só troca os textos de regras.js (datas e idades ficam num lugar só).
  const EN = /^en\b/i.test(document.documentElement.lang);
  const num = (n) => Number(n).toLocaleString(EN ? "en-US" : "pt-BR");
  const MESES = EN
    ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    : ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dataBR = (iso) => {
    const [a, m, d] = iso.split("-").map(Number);
    return EN ? `${MESES[m - 1]} ${d}, ${a}` : `${d === 1 ? "1º" : d} de ${MESES[m - 1]} de ${a}`;
  };
  // Data sem o ano (para "de 20 de julho a 5 de agosto de 2028").
  const semAno = (iso) => dataBR(iso).replace(EN ? /, \d{4}$/ : / de \d{4}$/, "");
  const minusculo = (nome) => EN ? nome.replace(/^(\w)/, (l) => l.toLowerCase()) : nome.toLowerCase();

  const T = EN ? {
    passo: (a, b) => `Step ${a} of ${b}`, varias: "You can pick more than one", continuar: "Continue", voltar: "Back", pular: "Skip",
    notaDF: "The Federal District has no municipalities and no city councilors. Instead of state representatives it has district representatives.",
    placeholder: "Type the name of the city", ondeVota: "Where are you registered to vote?",
    titulo6: "To run, your voter registration must be in the place of the race at least 6 months before the election (Law 9.504, art. 9).",
    municipio: "Municipality ", todos: "(all in Brazil)",
    quaseLa: "Almost there. Two optional questions", idade: "How old are you? ", idadeDica: "(to check the minimum age)",
    nome: "How should your name appear in the link? ", nomeDica: "(first name or nickname)", exIdade: "e.g. 32", exNome: "e.g. Ana",
    nadaEnviado: "Nothing is sent to any server. Age and name only show up in the link if you copy it and send it to someone.",
    verResultado: "See my result",
    fit: ["Strong match", "Match", "Weak match"],
    eleitoPor: (uf) => `elected by ${uf}`,
    vagasEm: (a) => "Seats in " + a, de3: " of the state's 3 (Constitution, art. 46)",
    qe: (a) => `Electoral quotient in ${a}`, votos: " votes", qeDica: "for a party or federation to elect 1",
    menorEleito: (a) => `Elected with the fewest votes in ${a}`, minimo: "Individual minimum", minimoDica: "10% of the quotient (Electoral Code, art. 108)",
    validos: (a) => `Valid votes in ${a}`,
    menorOuEleito: (varios, a) => (varios ? "Elected with the fewest votes in " : "Votes of the winner in ") + a, segundoTurno: " (in the runoff)",
    validos1: (a) => `Valid votes in the first round in ${a}`, eleitores: (a) => "Eligible voters in " + a,
    turno2: "a runoff is possible (more than 200,000 voters, Constitution, art. 29, II)", turno1: "single round (up to 200,000 voters, Constitution, art. 29, II)",
    vencer1: "To win in the first round", vencer1Txt: "more than half of the valid votes (Constitution, arts. 28 and 77)",
    teraSim: (a) => ` · in ${a} you will be`, teraNao: (a) => ` in ${a} you won't be yet`, teraTalvez: (a) => ` · in ${a}, depends on your birthday`,
    idadeMin: "Minimum age", anos: (n) => `${n} years old `, ateRegistro: "by the registration deadline", naPosse: "when taking office",
    proxima: "Next election", filiacaoAte: "Party membership and voter registration in place by", meses6: " (6 months before)",
    registroAte: "Candidacy registration request by", mandato: "Term", mandatoTxt: (n, d) => `${n} years, starting ${d}`,
    anoEleicao: "Election year",
    fontes: (a, base) => ["Sources: TSE, Open Data, ", String(a), " election; ", base, "; Law 9.504, arts. 8, 9 and 11."],
    por: "Add to my path",
    renunciar: (cargo, a1, a2) => `If elected ${cargo} in ${a1}, you must resign at least 6 months before the ${a2} election to run for another office (Constitution, art. 14, § 6).`,
    semRenuncia: (c1, c2) => `Someone serving as ${c1} can run for ${c2} without resigning. The 6-month resignation rule only applies to president, governor and mayor (Constitution, art. 14, § 6).`,
    umaCandidatura: (a) => `In ${a} you can only register one candidacy (Electoral Code, art. 88). Pick one of these offices.`,
    tituloEx: (n) => `${n}'s path`, tituloNome: (n) => `${n}'s path`, meuCaminho: "My path",
    ondeMun: (m, uf) => `in ${m} (${uf})`, ondeExec: (uf) => `of ${uf}`, ondeLeg: (uf) => `for ${uf}`,
    filiacaoLi: "Party membership and voter registration in place by ", convencoes: "Party conventions: ", a: " to ",
    registroLi: "Candidacy registration request by ", eleicaoLi: "Election on ", tirar: "Remove from path",
    vazio: "Your path is still empty. Pick an office below and tap “Add to my path”. You can build a sequence, one office per election.",
    habitantes: (n) => ` · ${n} inhabitants (IBGE, 2022 Census)`,
    fazerMeu: "Build my own path", recomecar: "Start over", mudar: "Change answers",
    textoEx: "Gabriel's path, with data from Brazil's electoral court (TSE)", textoMeu: "I mapped my path into politics with data from Brazil's electoral court (TSE)",
    copiado: "Link copied", compartilhar: "Share link",
    erroDados: "Couldn't load the data. Try again in a moment.",
    cargosEx: (m) => "The offices for voters in " + m, cargos: "Offices you can run for",
    ordem: "From the best match with your answers to the weakest.",
    outros: (n) => `Other offices that match less (${n})`,
    rodape: (g, m, ge) => `Data generated on ${g} from TSE files (${m} and ${ge} elections) and IBGE. Always double-check with the TSE and your state's TRE. Nothing here is legal advice.`,
    faq: (g, lista) => `Data generated on ${g}. TSE files generated on: ${lista}.`, semData: "no date",
  } : {
    passo: (a, b) => `Passo ${a} de ${b}`, varias: "Pode marcar mais de uma", continuar: "Continuar", voltar: "Voltar", pular: "Pular",
    notaDF: "O Distrito Federal não tem municípios nem vereadores. No lugar de deputado estadual existe o deputado distrital.",
    placeholder: "Digite o nome da cidade", ondeVota: "Onde você vota?",
    titulo6: "Para se candidatar, o título de eleitor precisa estar no lugar da disputa pelo menos 6 meses antes da eleição (Lei 9.504, art. 9º).",
    municipio: "Município ", todos: "(todos os do Brasil)",
    quaseLa: "Quase lá. Duas perguntas opcionais", idade: "Quantos anos você tem? ", idadeDica: "(para conferir a idade mínima)",
    nome: "Como quer aparecer no link? ", nomeDica: "(primeiro nome ou apelido)", exIdade: "Ex.: 32", exNome: "Ex.: Ana",
    nadaEnviado: "Nada é enviado para servidor nenhum. Idade e nome só aparecem no link se você copiar e mandar para alguém.",
    verResultado: "Ver meu resultado",
    fit: ["Combina muito", "Combina", "Combina pouco"],
    eleitoPor: (uf) => `eleito por ${uf}`,
    vagasEm: (a) => "Vagas em " + a, de3: " de 3 do estado (CF, art. 46)",
    qe: (a) => `Quociente eleitoral em ${a}`, votos: " votos", qeDica: "para um partido ou federação eleger 1",
    menorEleito: (a) => `Eleito com menos votos em ${a}`, minimo: "Mínimo individual", minimoDica: "10% do quociente (Código Eleitoral, art. 108)",
    validos: (a) => `Votos válidos em ${a}`,
    menorOuEleito: (varios, a) => (varios ? "Eleito com menos votos em " : "Votos do eleito em ") + a, segundoTurno: " (no 2º turno)",
    validos1: (a) => `Votos válidos no 1º turno em ${a}`, eleitores: (a) => "Eleitores aptos em " + a,
    turno2: "pode ter 2º turno (mais de 200 mil eleitores, CF, art. 29, II)", turno1: "turno único (até 200 mil eleitores, CF, art. 29, II)",
    vencer1: "Para vencer no 1º turno", vencer1Txt: "mais da metade dos votos válidos (CF, art. 28 e 77)",
    teraSim: (a) => ` · em ${a} você terá`, teraNao: (a) => ` em ${a} você ainda não terá`, teraTalvez: (a) => ` · em ${a}, depende do seu aniversário`,
    idadeMin: "Idade mínima", anos: (n) => `${n} anos `, ateRegistro: "até o prazo do registro", naPosse: "na posse",
    proxima: "Próxima eleição", filiacaoAte: "Filiação e título no lugar até", meses6: " (6 meses antes)",
    registroAte: "Pedido de registro até", mandato: "Mandato", mandatoTxt: (n, d) => `${n} anos, a partir de ${d}`,
    anoEleicao: "Ano da eleição",
    fontes: (a, base) => ["Fontes: TSE, Dados Abertos, eleição de ", String(a), "; ", base, "; Lei 9.504, arts. 8º, 9º e 11."],
    por: "Pôr no meu caminho",
    renunciar: (cargo, a1, a2) => `Se for eleito ${cargo} em ${a1}, precisa renunciar até 6 meses antes da eleição de ${a2} para disputar outro cargo (CF, art. 14, § 6º).`,
    semRenuncia: (c1, c2) => `Quem tem mandato de ${c1} pode disputar ${c2} sem renunciar. A renúncia de 6 meses só vale para presidente, governador e prefeito (CF, art. 14, § 6º).`,
    umaCandidatura: (a) => `Em ${a} dá para registrar só uma candidatura (Código Eleitoral, art. 88). Escolha um destes cargos.`,
    tituloEx: (n) => `O caminho do ${n}`, tituloNome: (n) => `O caminho de ${n}`, meuCaminho: "Meu caminho",
    ondeMun: (m, uf) => `em ${m} (${uf})`, ondeExec: (uf) => `de ${uf}`, ondeLeg: (uf) => `por ${uf}`,
    filiacaoLi: "Filiação a um partido e título no lugar até ", convencoes: "Convenções do partido: ", a: " a ",
    registroLi: "Pedido de registro até ", eleicaoLi: "Eleição em ", tirar: "Tirar do caminho",
    vazio: "Seu caminho ainda está vazio. Escolha um cargo abaixo e toque em “Pôr no meu caminho”. Dá para montar uma sequência, um cargo por eleição.",
    habitantes: (n) => ` · ${n} habitantes (IBGE, Censo 2022)`,
    fazerMeu: "Fazer o meu caminho", recomecar: "Recomeçar", mudar: "Mudar respostas",
    textoEx: "O caminho do Gabriel, com dados do TSE", textoMeu: "Montei meu caminho na política com dados do TSE",
    copiado: "Link copiado", compartilhar: "Compartilhar link",
    erroDados: "Não consegui carregar os dados. Tente de novo em instantes.",
    cargosEx: (m) => "Os cargos para quem vota em " + m, cargos: "Cargos que você pode disputar",
    ordem: "Do que mais combina com suas respostas para o que menos combina.",
    outros: (n) => `Outros cargos que combinam menos (${n})`,
    rodape: (g, m, ge) => `Dados gerados em ${g} a partir dos arquivos do TSE (eleições de ${m} e ${ge}) e do IBGE. Confira sempre no TSE e no TRE do seu estado. Nada aqui é orientação jurídica.`,
    faq: (g, lista) => `Dados gerados em ${g}. Arquivos do TSE gerados em: ${lista}.`, semData: "sem data",
  };
  const UFS_NOMES = {
    AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal",
    ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
    PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
    RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
  };

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
  // Caminho absoluto: a versão em inglês (/en/caminho/) usa os mesmos dados.
  const brasil = () => json("/caminho/dados/brasil.json");
  const municipios = (uf) => json(`/caminho/dados/municipios-${uf}.json`);

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
      el("gr-progresso", { valor: passo, total: PASSOS, rotulo: T.passo(passo + 1, PASSOS) }),
      el("h2", { id: "pergunta" }, titulo),
      multipla ? el("p", { class: "dica" }, T.varias) : null,
    ].filter(Boolean);
  }
  function botoes(podeSeguir, textoSeguir = T.continuar) {
    return el("div", { class: "acoes" },
      el("button", { class: "botao secundario", type: "button", disabled: passo === 0, onclick: () => { passo--; render(); } }, T.voltar),
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

  // O seletor de cidade é o componente do site (design-system/cidade.js): busca em todos os
  // municípios, por nome, CEP ou localização. Ele devolve a UF junto, então não há passo de estado.
  async function passoLocal() {
    const notaDF = el("p", { class: "campo-info" }, T.notaDF);
    notaDF.hidden = E.uf !== "DF";
    const seletor = el("gr-cidade", { "id-campo": "municipio", ibge: E.uf && E.ibge ? E.ibge : null, placeholder: T.placeholder });
    seletor.addEventListener("gr-cidade", (e) => {
      const m = e.detail;
      const ibge = m && m.ibge ? m.ibge : null;
      if (ibge !== E.ibge) E.caminho = [];
      E.uf = ibge ? m.uf : "";
      E.ibge = ibge;
      salvar();
      notaDF.hidden = E.uf !== "DF";
      app.querySelector(".acoes .botao:not(.secundario)").disabled = !ibge;
    });
    app.append(
      ...cabecalhoPasso(T.ondeVota),
      el("p", { class: "campo-info" }, T.titulo6),
      el("label", { for: "municipio" }, T.municipio, el("small", {}, T.todos)),
      seletor,
      notaDF,
      botoes(!!(E.uf && E.ibge)),
    );
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
              app.querySelector(".acoes .botao:not(.secundario)").textContent = marcadas.size ? T.continuar : T.pular;
            },
          }, texto);
          return b;
        }),
      ),
      botoes(true, marcadas.size ? T.continuar : T.pular),
    );
  }

  function passoVoce() {
    const idade = el("input", { id: "idade", type: "number", inputmode: "numeric", min: 16, max: 110, value: E.idade ?? "", placeholder: T.exIdade,
      oninput: () => { const v = Number(idade.value); E.idade = v >= 16 && v <= 110 ? Math.floor(v) : null; salvar(); } });
    const nome = el("input", { id: "nome", maxlength: 40, autocomplete: "given-name", value: E.nome, placeholder: T.exNome,
      oninput: () => { E.nome = limparNome(nome.value); salvar(); } });
    app.append(
      ...cabecalhoPasso(T.quaseLa),
      el("label", { for: "idade" }, T.idade, el("small", {}, T.idadeDica)), idade,
      el("label", { for: "nome" }, T.nome, el("small", {}, T.nomeDica)), nome,
      el("p", { class: "campo-info" }, T.nadaEnviado),
      botoes(true, T.verResultado),
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
    const fit = item.pontos >= 6 ? ["alto", T.fit[0]] : item.pontos >= 4 ? ["medio", T.fit[1]] : ["", T.fit[2]];
    const onde = c.tipo === "municipal" ? `${local.municipio} (${local.uf})` : c.nivel === "pais" ? T.eleitoPor(local.nomeUF) : local.nomeUF;
    const linhas = [];
    const vg = vagasProxima(cargo, ano, d);
    if (vg) linhas.push([T.vagasEm(ano), num(vg) + (cargo === "senador" ? T.de3 : "")]);
    if (d && c.sistema === "proporcional") {
      if (d.qe) linhas.push([T.qe(d.ano), el("span", {}, num(d.qe) + T.votos + " ", el("small", {}, T.qeDica))]);
      if (d.menor_eleito != null) linhas.push([T.menorEleito(d.ano), num(d.menor_eleito) + T.votos]);
      if (d.qe) linhas.push([T.minimo, el("span", {}, num(Math.ceil(d.qe * 0.1)) + T.votos + " ", el("small", {}, T.minimoDica))]);
      if (d.validos) linhas.push([T.validos(d.ano), num(d.validos)]);
    } else if (d) {
      if (d.menor_eleito != null) linhas.push([T.menorOuEleito(d.vagas > 1, d.ano), num(d.menor_eleito) + T.votos + (d.segundo_turno ? T.segundoTurno : "")]);
      if (d.validos && cargo !== "senador") linhas.push([T.validos1(d.ano), num(d.validos)]);
      if (cargo === "prefeito" && d.eleitores) linhas.push([T.eleitores(d.ano), el("span", {}, num(d.eleitores) + " ", el("small", {}, d.eleitores > 200000 ? T.turno2 : T.turno1))]);
      if (cargo === "governador") linhas.push([T.vencer1, T.vencer1Txt]);
    }
    const idade = idadeNa(cargo, ano);
    const txtIdade = !idade ? null
      : idade.ok === "sim" ? el("small", {}, T.teraSim(ano))
      : idade.ok === "nao" ? el("span", { class: "idade-nao" }, T.teraNao(ano))
      : el("small", {}, T.teraTalvez(ano));
    linhas.push([T.idadeMin, el("span", {}, T.anos(c.idade), el("small", {}, c.idadeNa === "registro" ? T.ateRegistro : T.naPosse), txtIdade)]);
    linhas.push([T.proxima, dataBR(ele.data)]);
    linhas.push([T.filiacaoAte, dataBR(ele.filiacao) + T.meses6]);
    linhas.push([T.registroAte, dataBR(ele.registro)]);
    linhas.push([T.mandato, T.mandatoTxt(c.mandato, dataBR(`${ano + 1}-${c.posse}`))]);

    const noCaminho = E.caminho.some(([cc]) => cc === cargo);
    const selAno = el("select", { "aria-label": T.anoEleicao }, anos.map((a) => el("option", { value: a }, String(a))));
    return el("article", { class: "cargo" + (noCaminho ? " no-caminho" : "") },
      el("div", { class: "cargo-topo" },
        el("div", {}, el("h3", {}, c.nome), el("p", { class: "onde" }, `${c.casa}, ${onde}`)),
        el("span", { class: "selo-fit " + fit[0] }, fit[1]),
      ),
      el("p", {}, c.faz),
      el("dl", {}, linhas.map(([a, b]) => [el("dt", {}, a), el("dd", {}, b)])),
      el("p", { class: "fonte" }, ...T.fontes(d ? d.ano : "", c.base)),
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
          } }, T.por),
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
          notas.set(i, ["alerta", T.renunciar(minusculo(cAnt.nome), ant[1], a)]);
        } else if (cAnt.poder === "legislativo") {
          notas.set(i, ["", T.semRenuncia(minusculo(cAnt.nome), minusculo(R.cargos[c].nome))]);
        }
      }
    });
    for (const [a, cs] of Object.entries(porAno)) {
      if (cs.length > 1) {
        const i = E.caminho.findIndex(([, aa]) => String(aa) === a);
        notas.set(i, ["alerta", T.umaCandidatura(a)]);
      }
    }
    return notas;
  }

  function blocoCaminho(local) {
    const titulo = E.exemplo ? T.tituloEx(E.nome) : E.nome ? T.tituloNome(E.nome) : T.meuCaminho;
    const notas = notasDoCaminho();
    const lista = E.caminho.length
      ? el("ol", { class: "linha-tempo" }, E.caminho.map(([cargo, ano], i) => {
        const c = R.cargos[cargo], ele = R.eleicoes[ano];
        const onde = c.tipo === "municipal" ? T.ondeMun(local.municipio, local.uf) : c.poder === "executivo" ? T.ondeExec(local.nomeUF) : T.ondeLeg(local.nomeUF);
        const nota = notas.get(i);
        return el("li", { class: "passo" },
          el("span", { class: "ano", "aria-hidden": "true" }, String(ano)),
          el("h3", {}, `${c.nome} ${onde}`),
          el("ul", {},
            el("li", {}, T.filiacaoLi, el("strong", {}, dataBR(ele.filiacao))),
            el("li", {}, T.convencoes, semAno(ele.convencoes[0]), T.a, dataBR(ele.convencoes[1])),
            el("li", {}, T.registroLi, dataBR(ele.registro)),
            el("li", {}, T.eleicaoLi, el("strong", {}, dataBR(ele.data))),
          ),
          nota ? el("p", { class: "nota-passo " + nota[0] }, nota[1]) : null,
          E.exemplo ? null : el("button", { class: "botao secundario remover", type: "button",
            onclick: () => { E.caminho.splice(i, 1); salvar(); render(); } }, T.tirar),
        );
      }))
      : el("p", { class: "vazio" }, T.vazio);
    const copiado = el("span", { class: "copiado", role: "status" });
    return el("section", { id: "meu-caminho" },
      el("h2", {}, titulo),
      el("p", { class: "local" }, `${local.municipio} (${local.uf})` + (local.pop ? T.habitantes(num(local.pop)) : "")),
      lista,
      el("div", { class: "acoes" },
        el("button", { class: "botao secundario", type: "button", onclick: () => { E = vazio(); passo = 0; history.replaceState(null, "", location.pathname); render(true); } },
          E.exemplo ? T.fazerMeu : T.recomecar),
        E.exemplo ? null : el("button", { class: "botao secundario", type: "button", onclick: () => { passo = 0; render(true); } }, T.mudar),
        el("button", { class: "botao", type: "button", onclick: async () => {
          const url = location.origin + location.pathname + hashDe(E);
          const texto = E.exemplo ? T.textoEx : T.textoMeu;
          try {
            if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ title: document.title, text: texto, url }); return; }
            await navigator.clipboard.writeText(url); copiado.textContent = T.copiado;
          } catch { copiado.textContent = url; }
        } }, T.compartilhar),
        copiado,
      ),
    );
  }

  async function resultado() {
    let B, lista;
    try { [B, lista] = await Promise.all([brasil(), municipios(E.uf)]); }
    catch { app.append(el("p", {}, T.erroDados)); return; }
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
        el("button", { class: "botao", type: "button", onclick: () => { E = vazio(); passo = 0; history.replaceState(null, "", location.pathname); render(true); } }, T.fazerMeu)));
    }
    app.append(blocoCaminho(local));
    app.append(
      el("h2", { style: "margin-top:var(--espaco-6)" }, E.exemplo ? T.cargosEx(m.nome) : T.cargos),
      el("p", { class: "local" }, T.ordem),
      el("div", { class: "cargos" }, (fortes.length ? fortes : itens).map((x) => cartaoCargo(x, local))),
      fortes.length && fracos.length ? el("details", { class: "outros-cargos" },
        el("summary", {}, T.outros(fracos.length)),
        el("div", { class: "cargos" }, fracos.map((x) => cartaoCargo(x, local)))) : null,
      el("p", { class: "fonte" }, T.rodape(dataBR(B.gerado_em), B.eleicao_municipal, B.eleicao_geral)),
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
    if (f) f.textContent = T.faq(dataBR(B.gerado_em),
      Object.entries(B.arquivos_tse_gerados_em).map(([a, d]) => `${a}, ${d ? dataBR(d) : T.semData}`).join("; "));
  }).catch(() => {});
  iniciar();
})();
