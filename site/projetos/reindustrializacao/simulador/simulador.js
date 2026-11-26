/* Simulador de aporte do FSRI.
   Tudo roda no aparelho: nada é enviado nem guardado. O link e a imagem de
   compartilhar levam só a carteira (empresas e porcentagens) e o prazo,
   nunca o valor em reais nem a área de atuação.
   Os textos saem do lang da página (pt-BR ou en). */
(function () {
  const EN = document.documentElement.lang.startsWith('en');
  const L = EN ? 'en' : 'pt';

  // Regras da proposta (/projetos/reindustrializacao/, capítulos 3, 4 e 6)
  const FAIXAS = {
    1: { seguro: 0.20, prazo: '2–4' },
    2: { seguro: 0.35, prazo: '5–8' },
    3: { seguro: 0.50, prazo: '10–15' },
  };
  const MIN_F1 = 0.40;          // Faixa 1 com no mínimo 40% do aporte
  const TETO_MENOR = 20000;     // R$ 20 mil por ano (Resolução CVM 88/2022)
  const IR = 0.15;              // IR sobre o lucro em aplicação de mais de 2 anos
  // Fundos brasileiros de PE e VC, 1994-2022 (Insper, Spectra e ABVCAP):
  // média de 12,7% ao ano e 25,3 pontos entre os melhores e os piores fundos.
  const MEDIA = 0.127, DIFERENCA = 0.253;
  // Os quartis exatos estão só em imagem no estudo. Usamos a média mais ou menos
  // metade da diferença: 12,7 ± 12,65 ≈ 0% e 25% ao ano.
  const CENARIOS = { ruim: 0, medio: MEDIA, bom: 0.25 };
  const CDI_PADRAO = 13.65; // Selic de 13,75% (Copom, 4/11/2026) menos 0,10 ponto

  const AREAS = [
    ['nenhuma', 'Outra área, ou não tenho empresa', 'Another field, or I have no business'],
    ['agro', 'Agronegócio', 'Agribusiness'],
    ['comercio', 'Comércio e varejo', 'Retail and commerce'],
    ['eventos', 'Cultura e eventos', 'Culture and events'],
    ['energia', 'Energia', 'Energy'],
    ['financas', 'Bancos e pagamentos', 'Banking and payments'],
    ['industria', 'Indústria', 'Manufacturing'],
    ['mineracao', 'Mineração', 'Mining'],
    ['saude', 'Saúde', 'Health care'],
    ['tecnologia', 'Tecnologia e software', 'Technology and software'],
    ['transporte', 'Transporte e logística', 'Transportation and logistics'],
  ];
  const nomeArea = id => { const a = AREAS.find(x => x[0] === id); return a ? (EN ? a[2] : a[1]) : ''; };

  // Empresas fictícias. conc: áreas com quem ela concorre. forn: áreas para quem ela fornece.
  const EMPRESAS = [
    { id: 'rota', f: 1, nome: 'Rota Comum', conc: ['transporte'], forn: [],
      pt: ['Mobilidade urbana', 'Aplicativo de corridas que cobra taxa baixa do motorista.'],
      en: ['Urban mobility', 'Ride app that charges drivers a low fee.'] },
    { id: 'palco', f: 1, nome: 'Palco Aberto', conc: ['eventos'], forn: [],
      pt: ['Bilheteria de eventos', 'Venda de ingresso com Pix e taxa pequena para o produtor.'],
      en: ['Event ticketing', 'Ticket sales with Pix and a small fee for organizers.'] },
    { id: 'nuvem', f: 1, nome: 'Nuvem Ipê', conc: ['tecnologia'], forn: ['financas', 'comercio'],
      pt: ['Nuvem nacional', 'Guarda dados de empresas em servidores no Brasil.'],
      en: ['National cloud', 'Stores company data on servers in Brazil.'] },
    { id: 'credito', f: 1, nome: 'Crédito do Campo', conc: ['financas'], forn: ['agro'],
      pt: ['Crédito digital', 'Empréstimo pelo celular para pequeno produtor rural.'],
      en: ['Digital credit', 'Loans by phone for small farmers.'] },
    { id: 'balcao', f: 1, nome: 'Balcão Pequi', conc: ['tecnologia'], forn: ['comercio'],
      pt: ['Software para empresas', 'Sistema de caixa e estoque para comércio de bairro.'],
      en: ['Business software', 'Checkout and stock system for neighborhood stores.'] },
    { id: 'pulso', f: 2, nome: 'Pulso Vivo', conc: ['saude'], forn: ['saude'],
      pt: ['Equipamento médico', 'Sensores de monitoramento para leito de hospital.'],
      en: ['Medical equipment', 'Monitoring sensors for hospital beds.'] },
    { id: 'carga', f: 2, nome: 'Carga Boa', conc: ['energia'], forn: ['transporte', 'industria'],
      pt: ['Baterias', 'Baterias para guardar energia solar e mover frotas.'],
      en: ['Batteries', 'Batteries that store solar power and run fleets.'] },
    { id: 'voo', f: 2, nome: 'Voo Raso', conc: [], forn: ['agro'],
      pt: ['Drones agrícolas', 'Drones que aplicam defensivo só onde a lavoura precisa.'],
      en: ['Farm drones', 'Drones that spray crops only where needed.'] },
    { id: 'lavra', f: 2, nome: 'Lavra Limpa', conc: ['mineracao'], forn: ['industria', 'energia'],
      pt: ['Refino de minerais', 'Refina aqui minerais estratégicos que hoje saem brutos.'],
      en: ['Mineral refining', 'Refines strategic minerals here instead of exporting them raw.'] },
    { id: 'silicio', f: 3, nome: 'Silício do Planalto', conc: ['industria'], forn: ['tecnologia'],
      pt: ['Semicondutores', 'Chips simples para máquinas e carros, feitos no Brasil.'],
      en: ['Semiconductors', 'Simple chips for machines and cars, made in Brazil.'] },
    { id: 'genoma', f: 3, nome: 'Genoma Vivo', conc: ['saude'], forn: ['agro', 'saude'],
      pt: ['Biotecnologia', 'Vacinas e testes desenvolvidos em laboratório nacional.'],
      en: ['Biotechnology', 'Vaccines and tests developed in a Brazilian lab.'] },
    { id: 'trilho', f: 3, nome: 'Trilho Elétrico', conc: ['industria'], forn: ['transporte'],
      pt: ['Mobilidade elétrica', 'Ônibus elétrico com projeto e peças brasileiras.'],
      en: ['Electric mobility', 'Electric bus with Brazilian design and parts.'] },
    { id: 'orbita', f: 3, nome: 'Órbita Baixa', conc: ['tecnologia'], forn: ['agro'],
      pt: ['Aeroespacial', 'Satélites pequenos que acompanham lavoura e desmatamento.'],
      en: ['Aerospace', 'Small satellites that track crops and deforestation.'] },
  ];

  const T = {
    pt: {
      ficticia: 'Empresa fictícia', faixa: n => `Faixa ${n}`,
      retorno: 'Retorno em', anos: a => `${a} anos`, seguro: 'Seguro até',
      escolher: 'Escolher', escolhida: 'Na carteira ✓', peso: 'Parte do aporte',
      conc: a => `Tirada: concorre com quem atua em ${a.toLowerCase()}.`,
      forn: a => `Tirada: fornece para quem atua em ${a.toLowerCase()}.`,
      conflitos: (n, a) => n === 0 ? `Nenhuma empresa tem conflito com a sua área.` : `${n === 1 ? '1 empresa saiu' : n + ' empresas saíram'} da sua lista por conflito de interesse com a sua área (${a.toLowerCase()}).`,
      semArea: 'Escolha a sua área no passo 1 para o sistema tirar as empresas com conflito.',
      r1: 'Pelo menos 2 empresas',
      r2: 'Pelo menos uma da Faixa 1 e uma da Faixa 3',
      r3: p => `Faixa 1 com no mínimo 40% do aporte (agora: ${p})`,
      sim: 'Aporte incentivado. Depois de 5 anos, o lucro fica livre de imposto.',
      nao: 'Ainda sem incentivo. Assim, o lucro paga 15% de imposto. Cumpra as regras acima para ganhar a isenção.',
      vazio: 'Escolha pelo menos uma empresa no passo 2 para ver a simulação.',
      ruim: 'Cenário ruim', medio: 'Cenário médio', bom: 'Cenário bom', cdi: 'CDI',
      aa: v => `${fmtPct(v)} ao ano`,
      isento: 'Lucro livre de imposto (isento)', comIR: 'Já sem os 15% de imposto sobre o lucro',
      ruimNota: 'Fundos que ficaram entre os piores. O dinheiro só empata.',
      medioNota: 'A média de 387 fundos brasileiros, de 1994 a 2022.',
      bomNota: 'Fundos que ficaram entre os melhores.',
      cdiNota: c => `Supondo o CDI de hoje (${fmtPct(c / 100)}) por todo o prazo, sem risco de perder.`,
      quebraT: 'E se todas as empresas quebrarem?',
      quebra: (perde, volta) => `Você perde pelo menos <b>${perde}</b>. O seguro devolve no máximo <b>${volta}</b>, e só se a falência for comprovada por auditoria.`,
      quebraNota: 'Em startup, perder tudo é comum. Só entre com dinheiro que você não vai precisar numa data certa.',
      grande: 'Atenção: na porta grande você investe com dinheiro emprestado. A simulação não desconta os juros do empréstimo. E se o investimento der errado, você ainda deve ao banco.',
      teto: v => `O teto da porta menor é ${v} por ano. A simulação usa esse valor.`,
      pronta: 'Montamos uma carteira pronta, como faria um gestor. Você pode mudar à vontade.',
      prontaFalta: 'Não sobrou empresa da Faixa 1 e da Faixa 3 sem conflito para montar a carteira pronta.',
      recebida: 'Alguém compartilhou esta carteira com você. Os valores usam o padrão de R$ 10 mil. Ponha o seu valor e a sua área no passo 1.',
      linkOk: 'Link copiado.', linkErro: 'Não deu para copiar. O link está na barra do navegador.',
      imgOk: 'Imagem pronta.', baixada: 'Imagem baixada.',
      card: {
        titulo: 'Minha carteira no FSRI',
        sub: 'Simulador de aporte · empresas fictícias',
        cada: p => `Em ${p} anos, cada R$ 100 viraria:`,
        rodape1: 'Simulação com dados de fundos reais (Insper, Spectra e ABVCAP, 1994-2022).',
        rodape2: 'Não é promessa de retorno. Empresas inventadas.',
        incentivo: 'Aporte incentivado: lucro sem imposto depois de 5 anos',
        semIncentivo: 'Sem incentivo: lucro paga 15% de imposto',
        quebra: v => `Se todas quebrarem: perde pelo menos ${v} de cada R$ 100.`,
      },
      arquivo: 'minha-carteira-fsri.png',
    },
    en: {
      ficticia: 'Fictional company', faixa: n => `Tier ${n}`,
      retorno: 'Returns in', anos: a => `${a} years`, seguro: 'Insurance up to',
      escolher: 'Pick', escolhida: 'In portfolio ✓', peso: 'Share of the investment',
      conc: a => `Removed: competes with people in ${a.toLowerCase()}.`,
      forn: a => `Removed: supplies people in ${a.toLowerCase()}.`,
      conflitos: (n, a) => n === 0 ? `No company conflicts with your field.` : `${n === 1 ? '1 company was' : n + ' companies were'} removed from your list for a conflict of interest with your field (${a.toLowerCase()}).`,
      semArea: 'Pick your field in step 1 so the system removes companies with a conflict.',
      r1: 'At least 2 companies',
      r2: 'At least one from Tier 1 and one from Tier 3',
      r3: p => `Tier 1 with at least 40% of the investment (now: ${p})`,
      sim: 'Incentivized investment. After 5 years, the profit is tax-free.',
      nao: 'No incentive yet, so the profit pays 15% tax. Meet the rules above to get the exemption.',
      vazio: 'Pick at least one company in step 2 to see the simulation.',
      ruim: 'Bad scenario', medio: 'Average scenario', bom: 'Good scenario', cdi: 'CDI',
      aa: v => `${fmtPct(v)} a year`,
      isento: 'Tax-free profit (exempt)', comIR: 'After the 15% tax on the profit',
      ruimNota: 'Funds that ended up among the worst. The money only breaks even.',
      medioNota: 'The average of 387 Brazilian funds, from 1994 to 2022.',
      bomNota: 'Funds that ended up among the best.',
      cdiNota: c => `Assuming today's CDI (${fmtPct(c / 100)}) for the whole period, with no risk of loss.`,
      quebraT: 'What if every company goes under?',
      quebra: (perde, volta) => `You lose at least <b>${perde}</b>. Insurance pays back at most <b>${volta}</b>, and only if an audit confirms the bankruptcy.`,
      quebraNota: 'Losing everything is common with startups. Only put in money you won\'t need back on a set date.',
      grande: 'Heads up: through the large-wealth door you invest with borrowed money. The simulation does not subtract the loan interest. And if the investment goes wrong, you still owe the bank.',
      teto: v => `The smaller-wealth cap is ${v} a year. The simulation uses that amount.`,
      pronta: 'We built a ready-made portfolio, the way a manager would. Change it as you like.',
      prontaFalta: 'There is no Tier 1 and Tier 3 company left without a conflict to build the ready-made portfolio.',
      recebida: 'Someone shared this portfolio with you. Amounts use the R$ 10,000 default. Enter your own amount and field in step 1.',
      linkOk: 'Link copied.', linkErro: 'Could not copy. The link is in the address bar.',
      imgOk: 'Image ready.', baixada: 'Image downloaded.',
      card: {
        titulo: 'My FSRI portfolio',
        sub: 'Investment simulator · fictional companies',
        cada: p => `In ${p} years, every R$100 would become:`,
        rodape1: 'Simulation with data from real funds (Insper, Spectra and ABVCAP, 1994-2022).',
        rodape2: 'Not a promise of returns. Made-up companies.',
        incentivo: 'Incentivized: tax-free profit after 5 years',
        semIncentivo: 'No incentive: profit pays 15% tax',
        quebra: v => `If they all fail: lose at least ${v} of every R$100.`,
      },
      arquivo: 'my-fsri-portfolio.png',
    },
  }[L];

  const nf = new Intl.NumberFormat(EN ? 'en-US' : 'pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const pf = new Intl.NumberFormat(EN ? 'en-US' : 'pt-BR', { style: 'percent', maximumFractionDigits: 2 });
  const pf0 = new Intl.NumberFormat(EN ? 'en-US' : 'pt-BR', { style: 'percent', maximumFractionDigits: 0 });
  const fmtParte = v => pf0.format(v);
  const fmt = v => nf.format(Math.round(v));
  function fmtPct(v) { return pf.format(v); }
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Estado: tudo só na memória da página.
  const estado = { porta: 'menor', valor: 10000, area: '', sel: new Map(), prazo: 10, cdi: CDI_PADRAO };

  const form = $('#sim-form');
  const campoValor = $('#sim-valor');
  const campoArea = $('#sim-area');
  const campoPrazo = $('#sim-prazo');
  const campoCdi = $('#sim-cdi');

  campoArea.insertAdjacentHTML('beforeend', AREAS.map(a => `<option value="${a[0]}">${esc(EN ? a[2] : a[1])}</option>`).join(''));

  function conflito(e) {
    if (!estado.area || estado.area === 'nenhuma') return null;
    if (e.conc.includes(estado.area)) return T.conc(nomeArea(estado.area));
    if (e.forn.includes(estado.area)) return T.forn(nomeArea(estado.area));
    return null;
  }

  function lerValor() {
    const n = parseInt(String(campoValor.value).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : (estado.porta === 'menor' ? 10000 : 1000000);
  }

  function valorUsado() {
    return estado.porta === 'menor' ? Math.min(estado.valor, TETO_MENOR) : estado.valor;
  }

  // Passo 1
  form.addEventListener('change', ev => {
    if (ev.target.name === 'porta') {
      estado.porta = ev.target.value;
      campoValor.value = fmt(estado.porta === 'menor' ? 10000 : 1000000);
    }
    estado.valor = lerValor();
    estado.area = campoArea.value;
    // Tira da carteira o que passou a ter conflito
    for (const id of [...estado.sel.keys()]) {
      const e = EMPRESAS.find(x => x.id === id);
      if (conflito(e)) estado.sel.delete(id);
    }
    desenhar();
  });
  // Formata o campo como dinheiro enquanto a pessoa digita, sem mover o cursor.
  function formatarCampo() {
    const antes = campoValor.value;
    const pos = campoValor.selectionStart ?? antes.length;
    const digitosAntes = antes.slice(0, pos).replace(/\D/g, '').replace(/^0+/, '').length;
    const digitos = antes.replace(/\D/g, '').replace(/^0+/, '').slice(0, 13);
    const novo = digitos ? fmt(+digitos) : '';
    campoValor.value = novo;
    let cursor = novo.length, vistos = 0;
    if (digitosAntes === 0) cursor = novo.search(/\d/) < 0 ? novo.length : novo.search(/\d/);
    else for (let i = 0; i < novo.length; i++) { if (/\d/.test(novo[i]) && ++vistos === digitosAntes) { cursor = i + 1; break; } }
    if (document.activeElement === campoValor) campoValor.setSelectionRange(cursor, cursor);
  }
  campoValor.addEventListener('input', () => { formatarCampo(); estado.valor = lerValor(); desenharResultado(); desenharNotaValor(); atualizarPcts(); });
  campoValor.addEventListener('blur', () => { if (!campoValor.value) campoValor.value = fmt(lerValor()); });
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    estado.valor = lerValor(); estado.area = campoArea.value;
    desenhar();
    $('#passo-2').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  function desenharNotaValor() {
    const nota = $('#sim-nota-valor');
    const partes = [];
    if (estado.porta === 'menor' && estado.valor > TETO_MENOR) partes.push(`<span class="nota-teto">${esc(T.teto(fmt(TETO_MENOR)))}</span>`);
    if (estado.porta === 'grande') partes.push(esc(T.grande));
    nota.innerHTML = partes.join(' ');
    nota.hidden = partes.length === 0;
  }

  // Passo 2
  const lista = $('#sim-empresas');
  function desenharEmpresas() {
    const fora = EMPRESAS.filter(conflito);
    const aviso = $('#sim-conflitos');
    aviso.innerHTML = `<p>${esc(!estado.area ? T.semArea : T.conflitos(estado.area === 'nenhuma' ? 0 : fora.length, nomeArea(estado.area)))}</p>`;
    const total = totalPeso();
    // Disponíveis primeiro, depois as tiradas
    const ordem = [...EMPRESAS.filter(e => !conflito(e)), ...fora];
    lista.innerHTML = ordem.map(e => {
      const motivo = conflito(e);
      const tx = e[L];
      const naCarteira = estado.sel.has(e.id);
      const pct = naCarteira && total ? estado.sel.get(e.id) / total : 0;
      return `<article class="empresa${motivo ? ' conflito' : ''}${naCarteira ? ' escolhida' : ''}" data-id="${e.id}">
        <div class="empresa-topo"><span class="faixa f${e.f}">${esc(T.faixa(e.f))}</span><span class="ficticia">${esc(T.ficticia)}</span></div>
        <h3>${esc(e.nome)}</h3>
        <p class="setor">${esc(tx[0])}</p>
        <p>${esc(tx[1])}</p>
        <dl><div><dt>${esc(T.retorno)}</dt><dd>${esc(T.anos(FAIXAS[e.f].prazo))}</dd></div><div><dt>${esc(T.seguro)}</dt><dd>${fmtPct(FAIXAS[e.f].seguro)}</dd></div></dl>
        ${motivo ? `<p class="motivo">${esc(motivo)}</p>` : `
        <button type="button" class="botao${naCarteira ? '' : ' secundario'}" aria-pressed="${naCarteira}" data-acao="alternar">${esc(naCarteira ? T.escolhida : T.escolher)}<span class="visualmente-oculto"> ${esc(e.nome)}</span></button>
        ${naCarteira ? `<div class="peso"><label for="peso-${e.id}"><span>${esc(T.peso)}</span><span data-pct>${fmtParte(pct)} · ${fmt(pct * valorUsado())}</span></label>
          <input id="peso-${e.id}" type="range" min="5" max="100" step="5" value="${estado.sel.get(e.id)}" data-acao="peso"></div>` : ''}`}
      </article>`;
    }).join('');
  }

  lista.addEventListener('click', ev => {
    const b = ev.target.closest('[data-acao="alternar"]');
    if (!b) return;
    const id = b.closest('.empresa').dataset.id;
    if (estado.sel.has(id)) estado.sel.delete(id); else estado.sel.set(id, 50);
    desenhar();
    const novo = lista.querySelector(`[data-id="${id}"] [data-acao="alternar"]`);
    if (novo) novo.focus();
  });
  lista.addEventListener('input', ev => {
    if (ev.target.dataset.acao !== 'peso') return;
    estado.sel.set(ev.target.closest('.empresa').dataset.id, +ev.target.value);
    atualizarPcts();
    desenharRegras();
    desenharResultado();
  });

  function atualizarPcts() {
    const total = totalPeso();
    lista.querySelectorAll('.empresa.escolhida').forEach(el => {
      const p = estado.sel.get(el.dataset.id) / total;
      el.querySelector('[data-pct]').textContent = `${fmtParte(p)} · ${fmt(p * valorUsado())}`;
    });
  }

  $('#sim-pronta').addEventListener('click', () => {
    const livres = EMPRESAS.filter(e => !conflito(e));
    const f1 = livres.filter(e => e.f === 1).slice(0, 2);
    const f2 = livres.filter(e => e.f === 2).slice(0, 1);
    const f3 = livres.filter(e => e.f === 3).slice(0, 1);
    const status = $('#sim-status-carteira');
    if (!f1.length || !f3.length) { status.textContent = T.prontaFalta; return; }
    estado.sel.clear();
    f1.forEach(e => estado.sel.set(e.id, 50 / f1.length));
    if (f2.length) estado.sel.set(f2[0].id, 20);
    estado.sel.set(f3[0].id, f2.length ? 30 : 50);
    status.textContent = T.pronta;
    desenhar();
  });
  $('#sim-limpar').addEventListener('click', () => { estado.sel.clear(); $('#sim-status-carteira').textContent = ''; desenhar(); });

  // Regras
  function totalPeso() { let t = 0; estado.sel.forEach(v => { t += v; }); return t; }
  function analisar() {
    const total = totalPeso();
    const itens = [...estado.sel].map(([id, p]) => ({ e: EMPRESAS.find(x => x.id === id), w: total ? p / total : 0 }));
    const f1 = itens.filter(i => i.e.f === 1).reduce((s, i) => s + i.w, 0);
    const r1 = itens.length >= 2;
    const r2 = itens.some(i => i.e.f === 1) && itens.some(i => i.e.f === 3);
    const r3 = f1 >= MIN_F1 - 1e-9;
    return { itens, f1, r1, r2, r3, ok: r1 && r2 && r3 };
  }

  function desenharRegras() {
    const a = analisar();
    const li = (ok, txt) => `<li class="${ok ? 'ok' : ''}"><span class="marca" aria-hidden="true">${ok ? '✓' : '·'}</span><span><span class="visualmente-oculto">${ok ? (EN ? 'Done: ' : 'Cumprida: ') : (EN ? 'Missing: ' : 'Falta: ')}</span>${esc(txt)}</span></li>`;
    $('#sim-regras').innerHTML = li(a.r1, T.r1) + li(a.r2, T.r2) + li(a.r3, T.r3(fmtParte(Math.floor(a.f1 * 100) / 100)));
    const selo = $('#sim-incentivo');
    selo.className = 'selo-incentivo ' + (a.ok ? 'sim' : 'nao');
    selo.textContent = a.ok ? T.sim : T.nao;
  }

  // Passo 3
  function calcular() {
    const a = analisar();
    const V = valorUsado();
    const n = estado.prazo;
    const isento = a.ok && n >= 5;
    const fsri = r => { const g = V * (Math.pow(1 + r, n) - 1); return V + (isento ? g : g * (1 - IR)); };
    const cdiR = estado.cdi / 100;
    const cdi = V + V * (Math.pow(1 + cdiR, n) - 1) * (1 - IR);
    const seguro = a.itens.reduce((s, i) => s + V * i.w * FAIXAS[i.e.f].seguro, 0);
    return { a, V, n, isento, ruim: fsri(CENARIOS.ruim), medio: fsri(CENARIOS.medio), bom: fsri(CENARIOS.bom), cdi, cdiR, seguro, perde: V - seguro };
  }

  function desenharResultado() {
    const alvo = $('#sim-resultado');
    const comp = $('#sim-compartilhar');
    if (!estado.sel.size) { alvo.innerHTML = `<p class="vazio">${esc(T.vazio)}</p>`; comp.hidden = true; return; }
    const c = calcular();
    const max = Math.max(c.bom, c.cdi);
    const linha = (cls, nome, taxa, valor, nota, imp) => `<div class="cenario ${cls}">
      <div class="cenario-topo"><strong>${esc(nome)} · ${esc(T.aa(taxa))}</strong><b>${fmt(valor)}</b></div>
      <div class="barra" aria-hidden="true"><div style="width:${Math.max(2, valor / max * 100).toFixed(1)}%"></div></div>
      <p class="pequeno">${esc(nota)} ${esc(imp)}.</p></div>`;
    const impF = c.isento ? T.isento : T.comIR;
    alvo.innerHTML = `<div class="cenarios">
      ${linha('ruim', T.ruim, CENARIOS.ruim, c.ruim, T.ruimNota, impF)}
      ${linha('medio', T.medio, CENARIOS.medio, c.medio, T.medioNota, impF)}
      ${linha('bom', T.bom, CENARIOS.bom, c.bom, T.bomNota, impF)}
      ${linha('cdi', T.cdi, c.cdiR, c.cdi, T.cdiNota(estado.cdi), T.comIR)}
    </div>
    <div class="quebra"><h3>${esc(T.quebraT)}</h3><p>${T.quebra(fmt(c.perde), fmt(c.seguro))}</p><p>${esc(T.quebraNota)}</p></div>`;
    comp.hidden = false;
    atualizarLink();
    desenharCartao(c);
  }

  campoPrazo.addEventListener('change', () => { estado.prazo = +campoPrazo.value; desenharResultado(); });
  campoCdi.addEventListener('input', () => {
    const v = parseFloat(String(campoCdi.value).replace(',', '.'));
    estado.cdi = Number.isFinite(v) && v >= 0 && v < 100 ? v : CDI_PADRAO;
    desenharResultado();
  });

  function desenhar() {
    desenharNotaValor();
    desenharEmpresas();
    desenharRegras();
    desenharResultado();
  }

  // Compartilhar: link com a carteira (sem valor nem área)
  function linkCarteira() {
    const c = [...estado.sel].map(([id, p]) => `${id}.${Math.round(p)}`).join('-');
    const u = new URL(location.href);
    u.search = ''; u.hash = '';
    u.searchParams.set('c', c);
    u.searchParams.set('p', String(estado.prazo));
    return u.toString();
  }
  function atualizarLink() {
    try { history.replaceState(null, '', linkCarteira()); } catch (e) { /* sem histórico */ }
  }
  $('#sim-copiar').addEventListener('click', async () => {
    const st = $('#sim-status');
    try { await navigator.clipboard.writeText(linkCarteira()); st.textContent = T.linkOk; }
    catch (e) { st.textContent = T.linkErro; }
  });

  // Imagem para compartilhar, desenhada no aparelho (1080 x 1350)
  const canvas = $('#sim-cartao');
  function cor(nome) { return getComputedStyle(document.documentElement).getPropertyValue(nome).trim(); }
  function desenharCartao(c) {
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1350;
    const fonte = 'Nunito, system-ui, sans-serif';
    ctx.fillStyle = cor('--creme'); ctx.fillRect(0, 0, W, H);
    // Bolhas
    ctx.fillStyle = cor('--amarelo-claro'); ctx.beginPath(); ctx.ellipse(W - 60, 40, 300, 240, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cor('--verde-claro'); ctx.beginPath(); ctx.ellipse(40, H - 40, 260, 220, 0, 0, Math.PI * 2); ctx.fill();

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = cor('--verde-escuro'); ctx.font = `800 30px ${fonte}`;
    ctx.fillText(T.card.sub.toUpperCase(), 80, 120);
    ctx.fillStyle = cor('--azul'); ctx.font = `900 76px ${fonte}`;
    ctx.fillText(T.card.titulo, 80, 210);

    // Carteira
    let y = 290;
    const total = totalPeso();
    const itens = [...estado.sel].map(([id, p]) => ({ e: EMPRESAS.find(x => x.id === id), w: p / total })).sort((a, b) => a.e.f - b.e.f || b.w - a.w);
    const corFaixa = { 1: cor('--verde-fundo'), 2: cor('--azul'), 3: cor('--amarelo') };
    const alturaItem = itens.length > 6 ? 52 : 64;
    itens.slice(0, 8).forEach(i => {
      ctx.fillStyle = corFaixa[i.e.f];
      roundRect(ctx, 80, y - 34, 120, 44, 22); ctx.fill();
      ctx.fillStyle = i.e.f === 3 ? cor('--azul') : cor('--branco');
      ctx.font = `800 24px ${fonte}`; ctx.fillText(T.faixa(i.e.f), 96, y - 4);
      ctx.fillStyle = cor('--texto'); ctx.font = `800 36px ${fonte}`;
      ctx.fillText(i.e.nome, 220, y);
      ctx.textAlign = 'right'; ctx.fillText(fmtParte(i.w), W - 80, y); ctx.textAlign = 'left';
      y += alturaItem;
    });
    if (itens.length > 8) { ctx.fillStyle = cor('--texto-suave'); ctx.font = `700 28px ${fonte}`; ctx.fillText(`+ ${itens.length - 8}`, 220, y); y += 40; }

    // Selo do incentivo
    y += 10;
    ctx.fillStyle = c.isento ? cor('--verde-claro') : cor('--amarelo-claro');
    roundRect(ctx, 80, y, W - 160, 70, 35); ctx.fill();
    ctx.fillStyle = c.isento ? cor('--verde-escuro') : cor('--texto');
    ctx.font = `800 28px ${fonte}`; ctx.fillText(c.isento ? T.card.incentivo : T.card.semIncentivo, 110, y + 46);
    y += 130;

    // Cenários em R$ 100
    ctx.fillStyle = cor('--azul'); ctx.font = `800 34px ${fonte}`;
    ctx.fillText(T.card.cada(c.n), 80, y); y += 30;
    const por100 = v => fmt(v / c.V * 100);
    const linhas = [[T.ruim, c.ruim, cor('--amarelo-escuro')], [T.medio, c.medio, cor('--verde')], [T.bom, c.bom, cor('--verde-fundo')], [T.cdi, c.cdi, cor('--azul-medio')]];
    const max = Math.max(c.bom, c.cdi);
    linhas.forEach(([nome, v, cb]) => {
      y += 70;
      ctx.fillStyle = cor('--texto'); ctx.font = `700 30px ${fonte}`; ctx.fillText(nome, 80, y);
      ctx.textAlign = 'right'; ctx.font = `900 34px ${fonte}`; ctx.fillText(por100(v), W - 80, y); ctx.textAlign = 'left';
      ctx.fillStyle = cor('--azul-claro'); roundRect(ctx, 80, y + 14, W - 160, 16, 8); ctx.fill();
      ctx.fillStyle = cb; roundRect(ctx, 80, y + 14, Math.max(16, (W - 160) * v / max), 16, 8); ctx.fill();
    });

    // Pior caso
    y += 100;
    ctx.fillStyle = cor('--azul'); roundRect(ctx, 80, y - 50, W - 160, 76, 38); ctx.fill();
    ctx.fillStyle = cor('--branco'); ctx.font = `800 28px ${fonte}`;
    ctx.fillText(T.card.quebra(fmt(c.perde / c.V * 100)), 110, y - 2);

    // Rodapé
    ctx.fillStyle = cor('--texto-suave'); ctx.font = `700 24px ${fonte}`;
    ctx.fillText(T.card.rodape1, 80, H - 150);
    ctx.fillText(T.card.rodape2, 80, H - 116);
    ctx.fillStyle = cor('--azul'); ctx.font = `800 28px ${fonte}`;
    ctx.fillText(EN ? 'gabriel-rodrigues.com/en/projetos/reindustrializacao/simulador' : 'gabriel-rodrigues.com/projetos/reindustrializacao/simulador', 80, H - 64);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function blobCartao() { return new Promise(res => canvas.toBlob(res, 'image/png')); }
  $('#sim-imagem').addEventListener('click', async () => {
    const st = $('#sim-status');
    const blob = await blobCartao();
    if (!blob) return;
    const arquivo = new File([blob], T.arquivo, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      try { await navigator.share({ files: [arquivo], title: T.card.titulo, url: linkCarteira() }); st.textContent = T.imgOk; return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = T.arquivo;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    st.textContent = T.baixada;
  });

  // Carteira recebida por link
  (function lerLink() {
    const q = new URLSearchParams(location.search);
    const c = q.get('c');
    const p = +q.get('p');
    if ([5, 10, 15].includes(p)) { estado.prazo = p; campoPrazo.value = String(p); }
    if (!c) return;
    c.split('-').forEach(par => {
      const [id, peso] = par.split('.');
      const n = parseInt(peso, 10);
      if (EMPRESAS.some(e => e.id === id) && n >= 1 && n <= 100) estado.sel.set(id, n);
    });
    if (estado.sel.size) {
      const r = $('#sim-recebida');
      r.innerHTML = `<p>${esc(T.recebida)}</p>`;
      r.hidden = false;
    }
  })();

  campoCdi.value = String(CDI_PADRAO).replace('.', EN ? '.' : ',');
  desenhar();
  // Redesenha a imagem quando a fonte terminar de carregar
  if (document.fonts) document.fonts.ready.then(() => { if (estado.sel.size) desenharCartao(calcular()); });
})();
