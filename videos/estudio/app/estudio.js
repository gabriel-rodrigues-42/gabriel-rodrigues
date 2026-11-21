// Estúdio: painel local de gravação. Conversa com o estudio.py pela /api/.

const $ = (s) => document.querySelector(s);
let E = null; // estado vindo do servidor

function el(tag, attrs = {}, ...filhos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (k in e && typeof v !== "string") e[k] = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  e.append(...filhos.flat().filter((f) => f != null && f !== false));
  return e;
}
const opcao = (valor, texto, selecionada) => el("option", { value: valor, selected: !!selecionada }, texto);
const blocoPorId = (id) => E.blocos.find((b) => b.id === id);
const lugarNome = (id) => E.lugares.find((l) => l.id === id)?.nome || id || "sem lugar";
const segundos = (s) => (s == null ? "" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`);
const tamanho = (b) => (b > 1e9 ? (b / 1e9).toFixed(1) + " GB" : Math.round(b / 1e6) + " MB");

async function api(rota, corpo) {
  const r = await fetch(rota, corpo ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) } : {});
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.mensagem || r.statusText);
  return dados;
}
async function atualizar() {
  E = await api("/api/estado");
  desenharTudo();
}

// Trechos etiquetados de cada bloco, no mesmo formato que o comum.py lê.
function trechosDe(arquivo) {
  const e = E.etiquetas[arquivo];
  if (!e) return [];
  return e.trechos || (e.bloco ? [e] : []);
}
function tomadas(blocoId) {
  const lista = [];
  for (const arquivo of Object.keys(E.etiquetas)) {
    trechosDe(arquivo).forEach((t, i) => {
      if (t.bloco !== blocoId || t.descartar) return;
      const base = `${arquivo.replace(/\.[^.]+$/, "")}-${i + 1}`;
      const feitos = E.tratados[blocoId] || [];
      lista.push({ arquivo, i, nota: Number(t.nota || 0), h: feitos.includes(`${base}-h.mp4`), v: feitos.includes(`${base}-v.mp4`) });
    });
  }
  return lista;
}
function situacao(b, formato = "h") {
  if (b.tipo === "animacao") return E.animacoes.includes(`${b.id}-${formato}.mp4`) ? "anim-ok" : "anim";
  const t = tomadas(b.id);
  if (t.some((x) => x[formato])) return "ok";
  if (t.length) return "tratar";
  return "falta";
}
const ROTULO = { ok: "Gravado", tratar: "Etiquetado, falta tratar", falta: "Falta gravar", anim: "Animação, falta gerar", "anim-ok": "Animação pronta" };
const CLASSE = { ok: "ok", tratar: "", falta: "falta", anim: "anim", "anim-ok": "ok" };

// ---- Abas --------------------------------------------------------------------
function mostrarAba() {
  const id = location.hash.slice(1) || "blocos";
  for (const s of document.querySelectorAll(".aba")) s.hidden = s.id !== id;
  for (const a of document.querySelectorAll(".topo nav a")) {
    if (a.hash === "#" + id) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  if (id === "gravar") ligarCamera();
}
addEventListener("hashchange", mostrarAba);

function desenharTudo() {
  desenharBlocos();
  desenharGravar();
  desenharBrutos();
  desenharMontar();
}

// ---- Blocos ------------------------------------------------------------------
function desenharBlocos() {
  const tags = [...new Set(E.blocos.flatMap((b) => b.tags || []))].sort();
  const fTag = $("#f-tag");
  if (fTag.options.length === 1) tags.forEach((t) => fTag.append(opcao(t, t)));
  const tipo = $("#f-tipo").value, tag = fTag.value, sit = $("#f-situacao").value;
  const lista = $("#lista-blocos");
  lista.replaceChildren();
  for (const b of E.blocos) {
    const s = situacao(b);
    if (tipo && b.tipo !== tipo) continue;
    if (tag && !(b.tags || []).includes(tag)) continue;
    if (sit === "falta" && (s === "ok" || s === "anim-ok")) continue;
    if (sit === "ok" && !(s === "ok" || s === "anim-ok")) continue;
    const n = b.tipo === "fala" ? tomadas(b.id).length : 0;
    const texto = b.tipo === "fala" ? b.texto : resumoAnimacao(b.animacao);
    lista.append(el("article", { class: "cartao bloco" },
      el("div", { class: "meta" },
        el("span", { class: "chip " + CLASSE[s] }, ROTULO[s]),
        n ? el("span", { class: "chip" }, `${n} tomada${n > 1 ? "s" : ""}`) : null,
        ...(b.tags || []).map((t) => el("span", { class: "chip" }, "#" + t))),
      el("h3", {}, b.titulo),
      el("p", { class: "texto" }, texto),
      b.tipo === "fala" ? el("p", { class: "suave pequeno" }, "Onde: " + (b.lugares || []).map(lugarNome).join(", ")) : null,
      el("div", { class: "botoes" },
        b.tipo === "fala"
          ? el("a", { class: "botao", href: "#gravar", onclick: () => escolherParaGravar(b.id) }, "Gravar")
          : el("button", { class: "botao secundario", type: "button", onclick: () => verAnimacao(b, "h") }, "Ver animação"),
        el("button", { class: "botao secundario", type: "button", title: "Copia o id para colar num roteiro", onclick: () => navigator.clipboard?.writeText(b.id) }, "Copiar id")),
    ));
  }
}
function resumoAnimacao(a) {
  return [a.titulo, a.valor, a.texto, a.frase, (a.etapas || []).join(" → "), a.fonte && `Fonte: ${a.fonte}`].filter(Boolean).join(" · ");
}
for (const id of ["#f-tipo", "#f-tag", "#f-situacao"]) $(id).addEventListener("change", desenharBlocos);

// Prévia de animação ao vivo, sem precisar gerar o MP4.
let animAtual = null;
function verAnimacao(b, formato) {
  animAtual = b;
  const caixa = $(".previa-animacao");
  caixa.classList.toggle("v", formato === "v");
  const iframe = $("#iframe-animacao");
  const [w, h] = formato === "v" ? [1080, 1920] : [1920, 1080];
  iframe.width = w;
  iframe.height = h;
  iframe.src = `/animacoes/index.html?${Date.now()}#${encodeURIComponent(JSON.stringify({ ...b.animacao, formato }))}`;
  const d = $("#dialogo-animacao");
  if (!d.open) d.showModal();
  requestAnimationFrame(() => (iframe.style.transform = `scale(${caixa.clientWidth / w})`));
}
$("#dialogo-animacao").addEventListener("close", (ev) => {
  const v = ev.target.returnValue;
  if ((v === "h" || v === "v") && animAtual) verAnimacao(animAtual, v);
  else $("#iframe-animacao").src = "about:blank";
});

// ---- Gravar ------------------------------------------------------------------
let stream = null, gravador = null, pedacos = [], inicioGravacao = 0, rolagem = null;

function falasDoRoteiro() {
  const slug = $("#g-roteiro").value;
  const falas = E.blocos.filter((b) => b.tipo === "fala");
  if (!slug) return falas;
  const r = E.roteiros.find((x) => x.slug === slug);
  return [...new Set(r.blocos)].map(blocoPorId).filter((b) => b && b.tipo === "fala");
}
function desenharGravar() {
  const sel = $("#g-roteiro");
  const atual = sel.value;
  sel.replaceChildren(opcao("", "Todos os blocos"), ...E.roteiros.map((r) => opcao(r.slug, r.titulo, r.slug === atual)));
  preencherBlocosGravar();
}
function preencherBlocosGravar(escolhido) {
  const sel = $("#g-bloco");
  const atual = escolhido || sel.value;
  // Agrupa por lugar sugerido: grave tudo de um lugar de uma vez.
  const grupos = new Map();
  for (const b of falasDoRoteiro()) {
    const lugar = (b.lugares || [""])[0];
    if (!grupos.has(lugar)) grupos.set(lugar, []);
    grupos.get(lugar).push(b);
  }
  sel.replaceChildren(...[...grupos].map(([lugar, bs]) => el("optgroup", { label: lugarNome(lugar) },
    ...bs.map((b) => opcao(b.id, `${situacao(b) === "falta" ? "○" : "✓"} ${b.titulo}`, b.id === atual)))));
  aoMudarBloco();
}
function aoMudarBloco() {
  const b = blocoPorId($("#g-bloco").value);
  if (!b) return;
  const p = $("#prompter-texto");
  p.textContent = b.texto;
  p.style.transform = "";
  const selLugar = $("#g-lugar");
  const atual = selLugar.value;
  const ordem = [...(b.lugares || []), ...E.lugares.map((l) => l.id).filter((id) => !(b.lugares || []).includes(id))];
  selLugar.replaceChildren(...ordem.map((id) => opcao(id, lugarNome(id), id === atual && (b.lugares || []).includes(id))));
  aoMudarLugar();
}
function aoMudarLugar() {
  $("#g-dica").textContent = E.lugares.find((l) => l.id === $("#g-lugar").value)?.dica || "";
}
function escolherParaGravar(id) {
  $("#g-roteiro").value = "";
  preencherBlocosGravar(id);
}
$("#g-roteiro").addEventListener("change", () => preencherBlocosGravar());
$("#g-bloco").addEventListener("change", aoMudarBloco);
$("#g-lugar").addEventListener("change", aoMudarLugar);
$("#g-tamanho").addEventListener("input", (e) => $("#prompter").style.setProperty("--tamanho-prompter", e.target.value + "px"));
$("#g-espelhar").addEventListener("change", (e) => $("#prompter").classList.toggle("espelhado", e.target.checked));
$("#g-so-texto").addEventListener("change", (e) => {
  $(".camera-area").classList.toggle("desligada", e.target.checked);
  if (e.target.checked) desligarCamera(); else ligarCamera();
});
for (const id of ["#g-camera", "#g-mic", "#g-qualidade"]) $(id).addEventListener("change", () => ligarCamera(true));

function desligarCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}
async function ligarCamera(trocar) {
  if ($("#g-so-texto").checked || (stream && !trocar) || gravador) return;
  desligarCamera();
  const altura = Number($("#g-qualidade").value);
  const camera = $("#g-camera").value, mic = $("#g-mic").value;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: camera ? { exact: camera } : undefined, height: { ideal: altura }, width: { ideal: altura * 16 / 9 }, frameRate: { ideal: 30 } },
      // Som cru: o tratar.py limpa e iguala depois. O filtro do navegador estraga a voz do mic DJI.
      audio: { deviceId: mic ? { exact: mic } : undefined, echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 2 },
    });
    $("#previa").srcObject = stream;
    await listarDispositivos();
    const s = stream.getVideoTracks()[0].getSettings();
    status(`Câmera em ${s.width}x${s.height}, ${Math.round(s.frameRate || 30)} quadros por segundo.`);
  } catch (err) {
    status("Não consegui abrir a câmera: " + err.message);
  }
}
async function listarDispositivos() {
  const dispositivos = await navigator.mediaDevices.enumerateDevices();
  const usar = (tipo, sel, faixa) => {
    const atual = faixa?.getSettings().deviceId;
    sel.replaceChildren(...dispositivos.filter((d) => d.kind === tipo).map((d, i) => opcao(d.deviceId, d.label || `${tipo} ${i + 1}`, d.deviceId === atual)));
  };
  usar("videoinput", $("#g-camera"), stream?.getVideoTracks()[0]);
  usar("audioinput", $("#g-mic"), stream?.getAudioTracks()[0]);
}
function status(texto) { $("#g-status").textContent = texto; }

function formatoGravacao() {
  const tipos = ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];
  return tipos.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}
async function contagem() {
  if (!$("#g-contagem").checked) return;
  const c = $("#contagem");
  c.hidden = false;
  for (const n of [3, 2, 1]) {
    c.textContent = n;
    await new Promise((r) => setTimeout(r, 1000));
  }
  c.hidden = true;
}
function rolarTexto() {
  const caixa = $("#prompter"), p = $("#prompter-texto");
  const sobra = p.scrollHeight - caixa.clientHeight + 48;
  const velocidade = Number($("#g-velocidade").value);
  const t0 = performance.now() + 1500; // dá um respiro antes de rolar
  const passo = (agora) => {
    const y = Math.min(sobra, Math.max(0, ((agora - t0) / 1000) * velocidade));
    p.style.transform = `translateY(${-y}px)`;
    rolagem = requestAnimationFrame(passo);
  };
  if (sobra > 0 && velocidade > 0) rolagem = requestAnimationFrame(passo);
}
async function alternarGravacao() {
  if (gravador) return parar();
  if ($("#g-so-texto").checked) {
    // Só teleprompter: rola o texto e pronto.
    $("#prompter-texto").style.transform = "";
    await contagem();
    cancelAnimationFrame(rolagem);
    return rolarTexto();
  }
  if (!stream) await ligarCamera();
  if (!stream) return;
  const tipo = formatoGravacao();
  const altura = stream.getVideoTracks()[0].getSettings().height || 1080;
  $("#prompter-texto").style.transform = "";
  await contagem();
  pedacos = [];
  gravador = new MediaRecorder(stream, { mimeType: tipo || undefined, videoBitsPerSecond: altura > 1500 ? 40e6 : 16e6, audioBitsPerSecond: 256e3 });
  gravador.ondataavailable = (e) => e.data.size && pedacos.push(e.data);
  gravador.onstop = enviar;
  gravador.start(1000);
  inicioGravacao = performance.now();
  $("#gravando").hidden = false;
  $("#b-gravar").textContent = "Parar (espaço)";
  $("#b-gravar").classList.add("ativo");
  rolarTexto();
}
function parar() {
  cancelAnimationFrame(rolagem);
  gravador?.stop();
}
async function enviar() {
  const tipo = gravador.mimeType || "video/webm";
  const bloco = $("#g-bloco").value, lugar = $("#g-lugar").value;
  gravador = null;
  $("#gravando").hidden = true;
  $("#b-gravar").textContent = "Gravar (espaço)";
  $("#b-gravar").classList.remove("ativo");
  const blob = new Blob(pedacos, { type: tipo });
  const ext = tipo.includes("mp4") ? "mp4" : "webm";
  const agora = new Date();
  const carimbo = agora.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
  const nome = `${bloco}__${lugar}__${carimbo}.${ext}`;
  status(`Salvando ${tamanho(blob.size)}...`);
  const r = await fetch(`/api/gravar?nome=${encodeURIComponent(nome)}&bloco=${bloco}&lugar=${lugar}`, { method: "POST", body: blob });
  const dados = await r.json();
  status(`Tomada salva: ${dados.arquivo} (${((performance.now() - inicioGravacao) / 1000).toFixed(0)}s). Dê a nota na aba Etiquetar.`);
  await atualizar();
}
function proximo() {
  const sel = $("#g-bloco");
  const ops = [...sel.querySelectorAll("option")];
  const i = ops.findIndex((o) => o.value === sel.value);
  if (i < ops.length - 1) {
    sel.value = ops[i + 1].value;
    aoMudarBloco();
  }
}
$("#b-gravar").addEventListener("click", alternarGravacao);
$("#b-proximo").addEventListener("click", proximo);
addEventListener("keydown", (e) => {
  if ($("#gravar").hidden || e.target.closest("input, select, textarea")) return;
  if (e.code === "Space") { e.preventDefault(); alternarGravacao(); }
  if (e.code === "ArrowRight" && !gravador) proximo();
});

// ---- Etiquetar ---------------------------------------------------------------
let brutoAtual = null;

function desenharBrutos() {
  const ul = $("#lista-brutos");
  ul.replaceChildren();
  if (!E.brutos.length) ul.append(el("li", { class: "suave" }, "Nenhum vídeo em midia/brutos/ ainda."));
  for (const b of E.brutos) {
    const t = trechosDe(b.arquivo);
    const resumo = t.length ? t.map((x) => blocoPorId(x.bloco)?.titulo || x.bloco).join(", ") : "Sem etiqueta";
    const nota = Math.max(0, ...t.map((x) => Number(x.nota || 0)));
    ul.append(el("li", {}, el("button", { type: "button", "aria-current": b.arquivo === brutoAtual ? "true" : null, onclick: () => abrirBruto(b.arquivo) },
      el("b", {}, b.arquivo),
      el("span", { class: "suave pequeno" }, [segundos(b.info?.duracao), b.info && `${b.info.largura}x${b.info.altura}`, tamanho(b.tamanho)].filter(Boolean).join(" · ")),
      el("span", { class: "meta" }, el("span", { class: "chip " + (t.length ? "ok" : "falta") }, resumo), nota ? el("span", { class: "chip" }, "★".repeat(nota)) : null))));
  }
}

function abrirBruto(arquivo) {
  brutoAtual = arquivo;
  const b = E.brutos.find((x) => x.arquivo === arquivo);
  const e = E.etiquetas[arquivo] || {};
  $("#editor").hidden = false;
  const v = $("#bruto");
  v.src = `/midia/brutos/${encodeURIComponent(arquivo)}`;
  const info = b?.info;
  $("#bruto-info").textContent = info
    ? `${info.largura}x${info.altura}, ${segundos(info.duracao)}${info.hdr ? ", HDR (o tratar.py converte)" : ""}${info.tem_audio ? "" : ", sem som"}`
    : "Não consegui ler este vídeo com o ffprobe.";
  // Vídeo gravado pelo estúdio já vem com bloco e lugar no nome.
  const [blocoNome, lugarNomeArq] = arquivo.split("__");
  const lugarSel = $("#e-lugar");
  lugarSel.replaceChildren(opcao("", "Escolha..."), ...E.lugares.map((l) => opcao(l.id, l.nome, l.id === (e.lugar || lugarNomeArq))));
  $("#e-camera").value = e.camera || (/\.(mov|heic)$/i.test(arquivo) ? "iphone" : "webcam");
  const lista = trechosDe(arquivo);
  $("#trechos").replaceChildren();
  if (lista.length) lista.forEach((t) => addTrecho(t));
  else addTrecho({ bloco: blocoPorId(blocoNome) ? blocoNome : "", inicio: 0, fim: info?.duracao });
  $("#e-status").textContent = "";
  desenharBrutos();
}

function addTrecho(t = {}) {
  const info = E.brutos.find((x) => x.arquivo === brutoAtual)?.info || {};
  const caixa = $("#trechos");
  const n = caixa.children.length + 1;
  const falas = E.blocos.filter((b) => b.tipo === "fala");
  const selBloco = el("select", { name: "bloco" }, opcao("", "Escolha o bloco..."), ...falas.map((b) => opcao(b.id, b.titulo, b.id === t.bloco)));
  const texto = el("p", { class: "texto-bloco" }, blocoPorId(t.bloco)?.texto || "");
  selBloco.addEventListener("change", () => (texto.textContent = blocoPorId(selBloco.value)?.texto || ""));
  const campoTempo = (nome, rotulo, valor) => {
    const input = el("input", { type: "number", name: nome, step: "0.1", min: "0", value: valor ?? "" });
    return el("div", { class: "tempo" },
      el("label", {}, rotulo, input),
      el("button", { type: "button", class: "botao secundario", onclick: () => (input.value = $("#bruto").currentTime.toFixed(1)) }, "Agora"));
  };
  const notas = el("fieldset", { class: "notas" }, el("legend", {}, "Nota da tomada"),
    ...[[0, "Sem nota"], [1, "Ruim"], [2, "Boa"], [3, "A melhor"]].map(([v, r]) =>
      el("label", {}, el("input", { type: "radio", name: `nota-${n}-${Date.now()}`, value: v, checked: Number(t.nota || 0) === v }), r)));
  const horizontal = !info.vertical;
  const posicao = el("input", { type: "range", name: "posicao_x", min: "0", max: "100", value: t.posicao_x ?? 50 });
  posicao.addEventListener("input", () => mostrarMoldura(posicao.value));
  posicao.addEventListener("focus", () => mostrarMoldura(posicao.value));
  posicao.addEventListener("blur", () => ($("#moldura-v").hidden = true));
  const encaixe = (formato, padrao) => el("label", {}, formato === "h" ? "No horizontal" : "No vertical",
    el("select", { name: `encaixe_${formato}` },
      opcao("", `Automático (${padrao})`), opcao("cortar", "Cortar a sobra", t[`encaixe_${formato}`] === "cortar"),
      opcao("desfocar", "Fundo desfocado", t[`encaixe_${formato}`] === "desfocar")));
  const sec = el("section", { class: "trecho" },
    el("header", {}, `Trecho ${n}`,
      el("span", { class: "botoes" },
        el("button", { type: "button", class: "botao secundario", onclick: () => tocarTrecho(sec) }, "Ver trecho"),
        el("button", { type: "button", class: "botao secundario", onclick: () => { sec.remove(); renumerar(); } }, "Tirar"))),
    el("label", {}, "Bloco", selBloco), texto,
    el("div", { class: "linha" }, campoTempo("inicio", "Começa em (s)", t.inicio ?? 0), campoTempo("fim", "Termina em (s)", t.fim ?? info.duracao)),
    notas,
    horizontal ? el("label", {}, "Posição do corte vertical (Shorts)", posicao) : null,
    el("div", { class: "linha" }, encaixe("h", info.vertical ? "fundo desfocado" : "cortar"), encaixe("v", "cortar")),
    el("label", { class: "marcar" }, el("input", { type: "checkbox", name: "descartar", checked: !!t.descartar }), "Descartar este trecho"),
    el("label", {}, "Observação", el("input", { type: "text", name: "obs", value: t.obs || "" })));
  caixa.append(sec);
}
function renumerar() {
  [...$("#trechos").children].forEach((s, i) => (s.querySelector("header").firstChild.textContent = `Trecho ${i + 1}`));
}
function tocarTrecho(sec) {
  const v = $("#bruto");
  const ini = Number(sec.querySelector("[name=inicio]").value || 0);
  const fim = Number(sec.querySelector("[name=fim]").value || v.duration);
  v.currentTime = ini;
  v.play();
  const vigiar = () => { if (v.currentTime >= fim) { v.pause(); v.removeEventListener("timeupdate", vigiar); } };
  v.addEventListener("timeupdate", vigiar);
}
// Mostra em amarelo o pedaço 9:16 que vai para o Shorts.
function mostrarMoldura(pos) {
  const v = $("#bruto"), m = $("#moldura-v");
  if (!v.videoWidth) return;
  const caixaW = v.clientWidth, caixaH = v.clientHeight - 40;
  const escala = Math.min(caixaW / v.videoWidth, v.clientHeight / v.videoHeight);
  const vw = v.videoWidth * escala, vh = v.videoHeight * escala;
  const x0 = (caixaW - vw) / 2;
  const largura = vh * 9 / 16;
  m.style.width = largura + "px";
  m.style.height = Math.min(vh, caixaH + 40) + "px";
  m.style.top = (v.clientHeight - vh) / 2 + "px";
  m.style.left = x0 + (vw - largura) * (pos / 100) + "px";
  m.hidden = false;
}
$("#b-trecho").addEventListener("click", () => {
  const v = $("#bruto");
  addTrecho({ inicio: Number(v.currentTime.toFixed(1)), fim: v.duration ? Number(v.duration.toFixed(1)) : undefined });
});
$("#b-salvar").addEventListener("click", async () => {
  const trechos = [...$("#trechos").children].map((s) => {
    const val = (n) => s.querySelector(`[name="${n}"]`)?.value;
    const t = {
      bloco: val("bloco"),
      inicio: Number(val("inicio") || 0),
      fim: val("fim") === "" ? null : Number(val("fim")),
      nota: Number(s.querySelector("input[type=radio]:checked")?.value || 0),
      posicao_x: val("posicao_x") != null ? Number(val("posicao_x")) : undefined,
      encaixe_h: val("encaixe_h") || undefined,
      encaixe_v: val("encaixe_v") || undefined,
      descartar: s.querySelector("[name=descartar]").checked || undefined,
      obs: val("obs") || undefined,
    };
    return Object.fromEntries(Object.entries(t).filter(([, v]) => v !== undefined));
  }).filter((t) => t.bloco);
  const etiqueta = trechos.length ? { lugar: $("#e-lugar").value, camera: $("#e-camera").value, trechos } : null;
  await api("/api/etiqueta", { arquivo: brutoAtual, etiqueta });
  $("#e-status").textContent = trechos.length ? `Salvo: ${trechos.length} trecho(s).` : "Etiqueta apagada (nenhum trecho com bloco).";
  await atualizar();
});

// ---- Montar ------------------------------------------------------------------
function desenharMontar() {
  const sel = $("#m-roteiro");
  const atual = sel.value || E.roteiros[0]?.slug;
  sel.replaceChildren(...E.roteiros.map((r) => opcao(r.slug, `${r.titulo} (${(r.formatos || ["h"]).join(" e ")})`, r.slug === atual)));
  const r = E.roteiros.find((x) => x.slug === sel.value);
  const lista = $("#m-blocos");
  lista.replaceChildren();
  const falta = new Map();
  if (r) {
    const formato = (r.formatos || ["h"])[0];
    for (const id of r.blocos) {
      const b = blocoPorId(id);
      if (!b) { lista.append(el("li", {}, id, el("span", { class: "chip falta" }, "não existe em blocos.json"))); continue; }
      const s = situacao(b, formato);
      lista.append(el("li", {}, b.titulo, el("span", { class: "chip " + CLASSE[s] }, ROTULO[s])));
      if (s === "falta") {
        const lugar = (b.lugares || [""])[0];
        if (!falta.has(lugar)) falta.set(lugar, []);
        falta.get(lugar).push(b);
      }
    }
  }
  $("#m-falta").replaceChildren(falta.size
    ? el("div", { class: "falta-lista" }, el("h2", {}, "Lista de gravação"),
        ...[...falta].flatMap(([lugar, bs]) => [el("h3", {}, lugarNome(lugar)), el("ul", {}, ...bs.map((b) => el("li", {}, b.texto)))]))
    : el("p", { class: "suave" }, "Tudo gravado para este roteiro."));
  const finais = $("#m-finais");
  finais.replaceChildren();
  for (const f of E.finais.filter((f) => f.endsWith(".mp4"))) {
    const srt = f.replace(/\.mp4$/, ".srt");
    finais.append(el("li", {},
      el("video", { src: `/midia/final/${f}?${Date.now()}`, controls: true, preload: "metadata" }),
      el("a", { href: `/midia/final/${f}`, download: f }, f), " · ",
      E.finais.includes(srt) ? el("a", { href: `/midia/final/${srt}`, download: srt }, "legenda .srt") : null));
  }
  if (!E.finais.length) finais.append(el("li", { class: "suave" }, "Nenhum ainda."));
  mostrarTarefa(E.tarefa);
}
$("#m-roteiro").addEventListener("change", desenharMontar);

let vigia = null;
function mostrarTarefa(t) {
  $("#m-log").textContent = t.log || "";
  $("#m-log").scrollTop = 1e9;
  for (const b of document.querySelectorAll("[data-acao]")) b.disabled = t.rodando;
}
async function acompanhar() {
  clearTimeout(vigia);
  const t = await api("/api/tarefa");
  mostrarTarefa(t);
  if (t.rodando) vigia = setTimeout(acompanhar, 1000);
  else await atualizar();
}
for (const b of document.querySelectorAll("[data-acao]")) {
  b.addEventListener("click", async () => {
    try {
      await api("/api/rodar", { acao: b.dataset.acao, roteiro: $("#m-roteiro").value, rascunho: $("#m-rascunho").checked, legenda_no_video: $("#m-legenda").checked });
      acompanhar();
    } catch (err) {
      $("#m-log").textContent = err.message;
    }
  });
}

await atualizar();
mostrarAba();
