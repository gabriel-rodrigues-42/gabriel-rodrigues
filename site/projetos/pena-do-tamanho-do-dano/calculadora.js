// Calculadora da página "Pena do tamanho do dano" (PT e EN usam o mesmo arquivo; o texto sai do lang da página).
// Compara três regras para o mesmo valor desviado: a lei de hoje (2 a 12 anos), a conta direta
// (um mês por Bolsa Família) e a proposta em degraus (mais anos a cada 10 vezes mais dinheiro).
// Simulação para debate, não sentença.
(() => {
  const BF = 690.01;  // benefício médio do Bolsa Família, MDS, fevereiro de 2026
  const TETO = 40;    // Código Penal, art. 75 (Lei 13.964/2019)
  const en = document.documentElement.lang.startsWith("en");
  const $ = (id) => document.getElementById(id);
  const el = { valor: $("valor"), meses: $("meses"), passo: $("passo") };
  if (!el.valor) return;

  const T = en ? {
    moeda: (v) => "R$ " + curto(v, " thousand", " million", " billion"),
    equivale: (n, fam) => `That is ${int(n)} Bolsa Família payments: enough to pay ${fam} for a year.`,
    familias: (f) => f < 1 ? "less than one family" : f === 1 ? "1 family" : `${int(f)} families`,
    mes: (m) => `${dec(m)} ${m === 1 ? "month" : "months"}`,
    anoPasso: (p) => `${p} ${p === 1 ? "year" : "years"}`,
    anos: (a) => anosTexto(a, "year", "years", "month", "months", "and"),
    faixa: (a, b) => inteiros(a, b) ? `${Math.round(a)} to ${Math.round(b)} years` : `${anosTexto(a, "year", "years", "month", "months", "and")} to ${anosTexto(b, "year", "years", "month", "months", "and")}`,
    direta: (n, m, bruto) => bruto > TETO ? `Capped at 40 years. The math alone would give ${int(Math.round(bruto))} years.` : `${int(n)} payments × ${dec(m)} ${m === 1 ? "month" : "months"} each.`,
    degrau: (k, de, ate) => `Step ${k + 1} of 7: ${ate ? `from ${de} to ${ate}` : `above ${de}`} stolen.`,
    ate: (ate) => `Step 1 of 7: up to ${ate} stolen.`,
  } : {
    moeda: (v) => "R$ " + curto(v, " mil", v < 2e6 ? " milhão" : " milhões", v < 2e9 ? " bilhão" : " bilhões"),
    equivale: (n, fam) => `São ${int(n)} Bolsas Família: daria para pagar ${fam} por um ano.`,
    familias: (f) => f < 1 ? "menos de uma família" : f === 1 ? "1 família" : `${int(f)} famílias`,
    mes: (m) => `${dec(m)} ${m < 2 ? "mês" : "meses"}`,
    anoPasso: (p) => `${p} ${p === 1 ? "ano" : "anos"}`,
    anos: (a) => anosTexto(a, "ano", "anos", "mês", "meses", "e"),
    faixa: (a, b) => inteiros(a, b) ? `${Math.round(a)} a ${Math.round(b)} anos` : `${anosTexto(a, "ano", "anos", "mês", "meses", "e")} a ${anosTexto(b, "ano", "anos", "mês", "meses", "e")}`,
    direta: (n, m, bruto) => bruto > TETO ? `Bateu no teto de 40 anos. Só a conta daria ${int(Math.round(bruto))} anos.` : `${int(n)} benefícios × ${dec(m)} ${m < 2 ? "mês" : "meses"} cada.`,
    degrau: (k, de, ate) => `Degrau ${k + 1} de 7: ${ate ? `de ${de} a ${ate}` : `acima de ${de}`} desviados.`,
    ate: (ate) => `Degrau 1 de 7: até ${ate} desviados.`,
  };

  const loc = en ? "en-US" : "pt-BR";
  function inteiros(a, b) { return [a, b].every((x) => Math.round(x * 12) % 12 === 0); }
  function int(n) { return Math.floor(n).toLocaleString(loc); }
  function dec(n) { return n.toLocaleString(loc, { maximumFractionDigits: 1 }); }
  function curto(v, mil, mi, bi) {
    const f = (x) => x.toLocaleString(loc, { maximumFractionDigits: x < 10 ? 1 : 0 });
    if (v >= 1e9) return f(v / 1e9) + bi;
    if (v >= 1e6) return f(v / 1e6) + mi;
    return f(v / 1e3) + mil;
  }
  function anosTexto(a, ano, anos, mes, meses, e) {
    const total = Math.round(a * 12);
    const y = Math.floor(total / 12), m = total % 12;
    const ty = y ? `${y} ${y === 1 ? ano : anos}` : "";
    const tm = m ? `${m} ${m === 1 ? mes : meses}` : "";
    return ty && tm ? `${ty} ${e} ${tm}` : ty || tm || `0 ${anos}`;
  }
  // Dois algarismos significativos, para o valor do controle ficar redondo.
  function redondo(x) { const p = 10 ** (Math.floor(Math.log10(x)) - 1); return Math.round(x / p) * p; }

  function desenhar(id, min, max, nota) {
    const caixa = $(id);
    const a = Math.min(min, TETO), b = Math.min(max, TETO);
    caixa.querySelector(".anos").textContent = Math.abs(a - b) < 1 / 24 ? T.anos(a) : T.faixa(a, b);
    const faixa = caixa.querySelector(".faixa");
    const largura = Math.max((b - a) / TETO * 100, 2);
    faixa.style.marginLeft = Math.min(a / TETO * 100, 100 - largura) + "%";
    faixa.style.width = largura + "%";
    faixa.classList.toggle("teto", b >= TETO);
    if (nota !== undefined) caixa.querySelector(".nota").textContent = nota;
  }

  function calcular() {
    const valor = redondo(10 ** (3 + el.valor.value / 20));
    const meses = el.meses.value / 10;
    const passo = Number(el.passo.value);
    const n = valor / BF;

    $("valor-saida").textContent = T.moeda(valor);
    el.valor.setAttribute("aria-valuetext", T.moeda(valor));
    $("meses-saida").textContent = T.mes(meses);
    $("passo-saida").textContent = T.anoPasso(passo);
    $("equivale").textContent = T.equivale(n, T.familias(Math.floor(n / 12)));

    const cargo = $("f-cargo").checked ? 4 / 3 : 1;
    const calam = $("f-calamidade").checked ? 7 / 6 : 1;
    const social = $("f-social").checked ? 4 / 3 : 1;
    const devolveu = $("f-devolveu").checked ? 2 / 3 : 1;
    const comum = cargo * calam * devolveu;

    // Lei de hoje: 2 a 12 anos, qualquer valor. O aumento para dinheiro social é proposta, não entra aqui.
    desenhar("r-hoje", 2 * comum, 12 * comum);

    // Conta direta: meses por benefício.
    const bruto = n * meses / 12 * comum * social;
    desenhar("r-direta", bruto, bruto, T.direta(n, meses, bruto));

    // Degraus: até 100 benefícios, 2 a 4 anos; cada 10 vezes mais, +passo anos; no máximo 7 degraus.
    const k = n < 100 ? 0 : Math.min(6, Math.floor(Math.log10(n / 100)) + 1);
    const f = comum * social;
    const de = 100 * 10 ** (k - 1) * BF, ate = k < 6 ? 100 * 10 ** k * BF : null;
    const nota = k === 0 ? T.ate(T.moeda(redondo(100 * BF))) : T.degrau(k, T.moeda(redondo(de)), ate && T.moeda(redondo(ate)));
    desenhar("r-degraus", (2 + passo * k) * f, (4 + passo * k) * f, nota);
  }

  document.querySelector(".calc").addEventListener("input", calcular);
  calcular();
})();
