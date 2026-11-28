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
    // Trilha Moradia: fora das faixas. Risco baixo (o prédio é a garantia e o governo paga a parte social),
    // prazo longo, renda desde o 2º ano. Não conta nos 40% da Faixa 1.
    4: { seguro: 0.10, prazo: '2–25' },
  };
  const MIN_F1 = 0.40;          // Faixa 1 com no mínimo 40% do aporte
  const TETO_MENOR = 20000;     // R$ 20 mil por ano (Resolução CVM 88/2022)
  const IR = 0.15;              // IR sobre o lucro em aplicação de mais de 2 anos
  // Fundos brasileiros de PE e VC, 1994-2022 (Insper, Spectra e ABVCAP): terminaram,
  // na média, com 1,1 vez o que o CDI daria no mesmo tempo, e 25,3 pontos por ano
  // separam os melhores dos piores. O cenário médio segue o CDI que a pessoa escolhe
  // (1,1 vez o CDI no fim do prazo); o ruim e o bom ficam a meia distância para cada lado.
  const VEZES_CDI = 1.1, MEIA_DIFERENCA = 0.253 / 2;
  // Desconto no imposto de renda (parâmetro da proposta): 2% do aporte por ano, por 5 anos,
  // até metade do IR do ano. Sai do IR total porque o imposto mínimo de muitos ricos fica perto de zero.
  const DESCONTO_ANO = 0.02, ANOS_DESCONTO = 5;
  // Outras aplicações. LCI/LCA: 85% do CDI, isenta, empata com o CDB de 100% do CDI depois
  // dos 15% (suposição, não média de mercado). Ações e fundos imobiliários: repetem o
  // Ibovespa (+35,4%) e o IFIX (+31,5%) de 2021 a 2025 (B3, via Monte Bravo/Bloomberg).
  const LCA_DO_CDI = 0.85;
  const IBOV_AA = Math.pow(1.354, 1 / 5) - 1, IFIX_AA = Math.pow(1.315, 1 / 5) - 1;
  // Referência levada ao G20 (relatório Zucman, 2024): piso de 2% ao ano, só para bilionários em dólar.
  const PISO_G20 = 0.02;
  const CDI_PADRAO = 13.65; // Selic de 13,75% (Copom, 4/11/2026) menos 0,10 ponto
  // Cenário "juros em queda": medianas da Selic no fim de 2027, 2028 e 2029 no Boletim Focus
  // de novembro de 2026 (Banco Central), menos 0,10 ponto para virar CDI. Depois de 2029, fica igual.
  const CDI_FOCUS = [12.90, 10.90, 10.40];

  const AREAS = [
    ['nenhuma', 'Outra área, ou não tenho empresa', 'Another field, or I have no business'],
    ['agro', 'Agronegócio', 'Agribusiness'],
    ['comercio', 'Comércio e varejo', 'Retail and commerce'],
    ['eventos', 'Cultura e eventos', 'Culture and events'],
    ['energia', 'Energia', 'Energy'],
    ['imobiliario', 'Construção e imóveis', 'Construction and real estate'],
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
    // Liga com a proposta /projetos/moradia-que-vira-sua/ (prop: link para a proposta)
    { id: 'morada', f: 4, nome: 'Morada Viva', conc: ['imobiliario'], forn: [], prop: 'moradia-que-vira-sua',
      pt: ['Moradia', 'Prédios perto do BRT, com lojas no térreo. Parte do aluguel vira a compra do apartamento. Funciona como um fundo imobiliário de renda: dinheiro todo mês desde o 2º ano, risco baixo e lucro menor.'],
      en: ['Housing', 'Buildings near the BRT, with shops on the ground floor. Part of the rent goes toward buying the flat. It works like an income real estate fund: money every month from year 2, low risk and lower profit.'] },
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
      ficticia: 'Empresa fictícia', faixa: n => n === 4 ? 'Trilha Moradia' : `Faixa ${n}`, faixaCurta: n => n === 4 ? 'Moradia' : `Faixa ${n}`,
      retorno: 'Retorno em', anos: a => `${a} anos`, seguro: 'Seguro até',
      faixaInfo: (f, a, s) => (f === 4 ? 'Fora das faixas. ' : '') + `Retorno em ${a} anos. Seguro até ${s}.` + (f === 1 ? ' Precisa ter pelo menos 40% do aporte.' : '') + (f === 3 ? ' Precisa ter pelo menos uma.' : ''),
      posicao: (i, n) => `${i} de ${n}`,
      escolher: 'Escolher', escolhida: 'Na carteira ✓', peso: 'Parte do aporte',
      conc: a => `Tirada: concorre com quem atua em ${a.toLowerCase()}.`,
      forn: a => `Tirada: fornece para quem atua em ${a.toLowerCase()}.`,
      conflitos: (n, a) => n === 0 ? `Nenhuma empresa tem conflito com a sua área.` : `${n === 1 ? '1 empresa saiu' : n + ' empresas saíram'} da sua lista por conflito de interesse com a sua área (${a.toLowerCase()}).`,
      semArea: 'Escolha a sua área no passo 1 para o sistema tirar as empresas com conflito.',
      r2: 'Pelo menos uma da Faixa 1 e uma da Faixa 3',
      r3: p => `Faixa 1 com no mínimo 40% do aporte (agora: ${p})`,
      sim: 'Aporte incentivado. Por 5 anos, ele abate parte do imposto de renda. Depois, o lucro fica livre de imposto.',
      nao: 'Ainda sem incentivo: sem desconto no imposto de renda, e o lucro paga 15% de imposto. Cumpra as regras acima.',
      vazio: 'Escolha pelo menos uma empresa no passo 2 para ver a simulação.',
      ruim: 'Cenário ruim', medio: 'Cenário médio', bom: 'Cenário bom', cdi: 'CDI',
      aa: v => `${fmtPct(v)} ao ano`,
      isento: 'Lucro livre de imposto (isento)', comIR: 'Já sem os 15% de imposto sobre o lucro',
      ruimNota: 'Como os fundos que ficaram entre os piores: 12,65 pontos por ano abaixo da média.',
      medioNota: 'Termina com 1,1 vez o que o CDI daria, como a média de 387 fundos brasileiros (1994 a 2022).',
      bomNota: 'Como os fundos que ficaram entre os melhores: 12,65 pontos por ano acima da média.',
      cdiNota: c => `Supondo o CDI de hoje (${fmtPct(c / 100)}) por todo o prazo, sem risco de perder.`,
      grupoFsri: 'FSRI, com a sua carteira', grupoOutras: 'O mesmo dinheiro em outras aplicações',
      lucroGrande: 'Quanto sobra ou falta no fim do prazo, depois do imposto e de pagar o banco.',
      lucroMenor: 'Quanto sobra no fim do prazo, depois do imposto.',
      cdb: 'Tesouro Selic ou CDB', lca: 'LCI, LCA ou debênture incentivada', fii: 'Fundo imobiliário', acoes: 'Ações',
      cdbNota: (c, g, q) => (q ? `Com os juros caindo, o CDI dá ${fmtPct(c / 100)} por ano, na média do prazo. ` : '') + (g ? `O CDB não perde dinheiro, mas rende 100% do CDI${q ? '' : ` (${fmtPct(c / 100)})`}, menos que os juros do banco.` : `Rende 100% do CDI${q ? '' : ` (${fmtPct(c / 100)})`}, sem risco de perder.`),
      quedaNota: 'Juros em queda: o CDI segue o que o mercado espera para a Selic (13% no fim de 2027, 11% em 2028 e 10,5% em 2029, Boletim Focus de novembro de 2026) e depois fica igual. É projeção, não promessa. O empréstimo, o CDB e a LCA seguem esse caminho. O retorno das empresas do FSRI fica igual ao do cenário de hoje, para mostrar só o efeito dos juros.',
      lcaNota: 'Supomos 85% do CDI, que empata com o CDB depois do imposto. O banco pode pagar mais ou menos.',
      fiiNota: 'Se repetir o IFIX de 2021 a 2025. Supõe rendimento isento: cotista com menos de 10% do fundo.',
      acoesNota: 'Se repetir o Ibovespa de 2021 a 2025.',
      isentoCurto: 'Isento',
      desconto: v => `Inclui ${v} de desconto no imposto (2% do aporte por ano, por 5 anos, corrigido pelo CDI até o fim do prazo). Só vale inteiro se o seu imposto de renda do ano for pelo menos o dobro desse desconto.`,
      exemploMargem: v => `Com o banco cobrando 2 pontos a mais que o CDI, o cenário médio ficaria em ${v}. A conta também não inclui o IOF do empréstimo nem o risco de o banco pedir mais garantia se as ações caírem.`,
      juros: (v, taxa) => `Os juros do empréstimo somam ${v} no prazo (${taxa} ao ano) e já saíram de cada linha. Pegar empréstimo para aplicar em CDB dá prejuízo, porque o banco cobra mais do que o CDB paga.`,
      quebraT: 'E se todas as empresas quebrarem?',
      quebra: (perde, volta) => `Você perde pelo menos <b>${perde}</b>. O seguro devolve no máximo <b>${volta}</b>, e só se a falência for comprovada por auditoria.`,
      quebraNota: 'Em startup, perder tudo é comum. Só entre com dinheiro que você não vai precisar numa data certa.',
      grande: 'Atenção: na porta grande você investe com dinheiro emprestado. O passo 3 desconta os juros do empréstimo. E se o investimento der errado, você ainda deve ao banco.',
      teto: v => `O teto da porta menor é ${v} por ano. A simulação usa esse valor.`,
      pronta: 'Montamos uma carteira pronta, como faria um gestor. Você pode mudar à vontade.',
      prontaFalta: 'Não sobrou empresa da Faixa 1 e da Faixa 3 sem conflito para montar a carteira pronta.',
      recebida: 'Alguém compartilhou esta carteira com você. Os valores usam o padrão de R$ 10 milhões. Ponha o seu valor e a sua área no passo 1.',
      deMoradia: 'Você veio da proposta de moradia. A carteira já tem a Morada Viva, uma construtora inventada da Trilha Moradia, mais uma empresa da Faixa 1 e uma da Faixa 3, que as regras exigem. A moradia não conta nos 40% da Faixa 1. Os cenários usam números de fundos de empresas: a moradia tende a render menos, com menos sobe e desce. Os valores usam o padrão de R$ 10 milhões. Ponha o seu valor e a sua área no passo 1.',
      proposta: 'Ver a proposta',
      linkOk: 'Link copiado.', linkErro: 'Não deu para copiar. O link está na barra do navegador.',
      imgOk: 'Imagem pronta.', baixada: 'Imagem baixada.',
      card: {
        titulo: 'Minha carteira no FSRI',
        sub: 'Simulador de aporte · empresas fictícias',
        cada: p => `Em ${p} anos, cada R$ 100 viraria:`,
        rodape1: 'Simulação com dados de fundos reais (Insper, Spectra e ABVCAP, 1994-2022).',
        rodape2: 'Não é promessa de retorno. Empresas inventadas.',
        incentivo: 'Aporte incentivado: desconto no imposto e lucro isento',
        semIncentivo: 'Sem incentivo: lucro paga 15% de imposto',
      },
      imp: {
        titulo: 'Imposto sobre fortuna ou FSRI?',
        intro: (v, n) => `Patrimônio de ${v}, em ${n} anos. Veja para onde vai o dinheiro e quem sai ganhando.`,
        g20: 'Imposto de 2% ao ano sobre o patrimônio',
        g20Sub: 'Referência levada ao G20 (2024)',
        fsri: 'Aporte no FSRI',
        fsriSub: 'Com as regras do incentivo',
        voce: 'Você', pais: 'O país',
        deVoce: 'Seu patrimônio', governo: 'Orçamento do governo', empresas: 'Empresas no Brasil', volta: 'lucro volta',
        perdeVoce: 'não volta',
        paisImp: 'entra no orçamento. Nenhuma fábrica nova.',
        ganhaVoce: 'no cenário médio, já pagando o banco',
        paisFsri: 'em fábrica, tecnologia e emprego. Empresas que pagam imposto.',
        perde: 'perde', ganha: 'ganha',
        veredito: 'Os dois podem ganhar',
        vereditoTexto: r => `No imposto, um lado perde para o outro ganhar. No FSRI, o investidor só ganha se as empresas derem certo, e aí o país ganha junto. No cenário ruim, você perde ${r}, mas o dinheiro foi para empresas no Brasil, não ficou parado.`,
        vereditoNao: 'Com esses juros, o cenário médio não fecha a conta para você. Mesmo assim, o dinheiro vira empresa no Brasil. Experimente juros caindo ou uma margem menor.',
        nota: 'Conta simplificada: o patrimônio fica igual todos os anos. O piso de 2% do G20 vale só para bilionários em dólar e desconta o imposto já pago; aqui serve só para comparar. A lei em vigor (Lei 15.270, de 2025) não cobra sobre o patrimônio, e sim até 10% sobre renda acima de R$ 600 mil por ano.',
      },
      arquivo: 'minha-carteira-fsri.png',
    },
    en: {
      ficticia: 'Fictional company', faixa: n => n === 4 ? 'Housing track' : `Tier ${n}`, faixaCurta: n => n === 4 ? 'Housing' : `Tier ${n}`,
      retorno: 'Returns in', anos: a => `${a} years`, seguro: 'Insurance up to',
      faixaInfo: (f, a, s) => (f === 4 ? 'Outside the tiers. ' : '') + `Returns in ${a} years. Insurance up to ${s}.` + (f === 1 ? ' Needs at least 40% of the investment.' : '') + (f === 3 ? ' Needs at least one.' : ''),
      posicao: (i, n) => `${i} of ${n}`,
      escolher: 'Pick', escolhida: 'In portfolio ✓', peso: 'Share of the investment',
      conc: a => `Removed: competes with people in ${a.toLowerCase()}.`,
      forn: a => `Removed: supplies people in ${a.toLowerCase()}.`,
      conflitos: (n, a) => n === 0 ? `No company conflicts with your field.` : `${n === 1 ? '1 company was' : n + ' companies were'} removed from your list for a conflict of interest with your field (${a.toLowerCase()}).`,
      semArea: 'Pick your field in step 1 so the system removes companies with a conflict.',
      r2: 'At least one from Tier 1 and one from Tier 3',
      r3: p => `Tier 1 with at least 40% of the investment (now: ${p})`,
      sim: 'Incentivized investment. For 5 years, it takes part off income tax. After that, the profit is tax-free.',
      nao: 'No incentive yet: no income-tax discount, and the profit pays 15% tax. Meet the rules above.',
      vazio: 'Pick at least one company in step 2 to see the simulation.',
      ruim: 'Bad scenario', medio: 'Average scenario', bom: 'Good scenario', cdi: 'CDI',
      aa: v => `${fmtPct(v)} a year`,
      isento: 'Tax-free profit (exempt)', comIR: 'After the 15% tax on the profit',
      ruimNota: 'Like the funds that ended up among the worst: 12.65 points a year below average.',
      medioNota: 'Ends with 1.1 times what the CDI would pay, like the average of 387 Brazilian funds (1994 to 2022).',
      bomNota: 'Like the funds that ended up among the best: 12.65 points a year above average.',
      cdiNota: c => `Assuming today's CDI (${fmtPct(c / 100)}) for the whole period, with no risk of loss.`,
      grupoFsri: 'FSRI, with your portfolio', grupoOutras: 'The same money in other investments',
      lucroGrande: 'What is left over, or missing, at the end of the period, after tax and after paying the bank.',
      lucroMenor: 'What is left over at the end of the period, after tax.',
      cdb: 'Treasury Selic or bank CD', lca: 'LCI, LCA or infrastructure bond', fii: 'Real-estate fund', acoes: 'Stocks',
      cdbNota: (c, g, q) => (q ? `With rates falling, the CDI pays ${fmtPct(c / 100)} a year on average over the period. ` : '') + (g ? `A bank CD doesn't lose money, but it earns 100% of the CDI${q ? '' : ` (${fmtPct(c / 100)})`}, less than the bank's interest.` : `Earns 100% of the CDI${q ? '' : ` (${fmtPct(c / 100)})`}, with no risk of loss.`),
      quedaNota: 'Falling rates: the CDI follows what the market expects for the Selic rate (13% at the end of 2027, 11% in 2028 and 10.5% in 2029, Banco Central Focus survey, November 2026) and then holds. It is a projection, not a promise. The loan, the bank CD and the LCA follow that path. FSRI company returns stay the same as in today\'s scenario, to show only the effect of interest rates.',
      lcaNota: 'We assume 85% of the CDI, which matches a bank CD after tax. Banks may pay more or less.',
      fiiNota: 'If it repeats the IFIX from 2021 to 2025. Assumes tax-exempt income: holder with less than 10% of the fund.',
      acoesNota: 'If it repeats the Ibovespa from 2021 to 2025.',
      isentoCurto: 'Tax-exempt',
      desconto: v => `Includes ${v} of tax discount (2% of the investment a year, for 5 years, grown at the CDI to the end of the period). It only applies in full if your yearly income tax is at least twice that discount.`,
      exemploMargem: v => `If the bank charges 2 points above the CDI, the average scenario would be ${v}. The math also leaves out the loan's IOF tax and the risk of the bank asking for more collateral if the shares fall.`,
      juros: (v, taxa) => `Loan interest adds up to ${v} over the period (${taxa} a year) and is already taken out of every line. Borrowing to buy a bank CD loses money, because the bank charges more than the CD pays.`,
      quebraT: 'What if every company goes under?',
      quebra: (perde, volta) => `You lose at least <b>${perde}</b>. Insurance pays back at most <b>${volta}</b>, and only if an audit confirms the bankruptcy.`,
      quebraNota: 'Losing everything is common with startups. Only put in money you won\'t need back on a set date.',
      grande: 'Heads up: through the large-wealth door you invest with borrowed money. Step 3 subtracts the loan interest. And if the investment goes wrong, you still owe the bank.',
      teto: v => `The smaller-wealth cap is ${v} a year. The simulation uses that amount.`,
      pronta: 'We built a ready-made portfolio, the way a manager would. Change it as you like.',
      prontaFalta: 'There is no Tier 1 and Tier 3 company left without a conflict to build the ready-made portfolio.',
      recebida: 'Someone shared this portfolio with you. Amounts use the R$ 10 million default. Enter your own amount and field in step 1.',
      deMoradia: 'You came from the housing proposal. The portfolio already has Morada Viva, a made-up builder in the Housing track, plus a Tier 1 and a Tier 3 company, as the rules require. Housing does not count toward the 40% in Tier 1. The scenarios use figures from company funds: housing tends to earn less, with fewer ups and downs. Amounts use the R$ 10 million default. Enter your own amount and field in step 1.',
      proposta: 'See the proposal',
      linkOk: 'Link copied.', linkErro: 'Could not copy. The link is in the address bar.',
      imgOk: 'Image ready.', baixada: 'Image downloaded.',
      card: {
        titulo: 'My FSRI portfolio',
        sub: 'Investment simulator · fictional companies',
        cada: p => `In ${p} years, every R$100 would become:`,
        rodape1: 'Simulation with data from real funds (Insper, Spectra and ABVCAP, 1994-2022).',
        rodape2: 'Not a promise of returns. Made-up companies.',
        incentivo: 'Incentivized: tax discount and tax-free profit',
        semIncentivo: 'No incentive: profit pays 15% tax',
      },
      imp: {
        titulo: 'Wealth tax or the FSRI?',
        intro: (v, n) => `Net worth of ${v}, over ${n} years. See where the money goes and who comes out ahead.`,
        g20: '2% yearly tax on net worth',
        g20Sub: 'Benchmark taken to the G20 (2024)',
        fsri: 'FSRI investment',
        fsriSub: 'Following the incentive rules',
        voce: 'You', pais: 'The country',
        deVoce: 'Your wealth', governo: 'Government budget', empresas: 'Companies in Brazil', volta: 'profit comes back',
        perdeVoce: 'never comes back',
        paisImp: 'goes into the budget. No new factory.',
        ganhaVoce: 'in the average scenario, after paying the bank',
        paisFsri: 'in factories, technology and jobs. Companies that pay taxes.',
        perde: 'loses', ganha: 'wins',
        veredito: 'Both sides can win',
        vereditoTexto: r => `With the tax, one side loses so the other gains. With the FSRI, investors only win if the companies succeed, and then the country wins too. In the bad scenario you lose ${r}, but the money went into companies in Brazil instead of sitting still.`,
        vereditoNao: "At these interest rates, the average scenario doesn't add up for you. Even so, the money becomes companies in Brazil. Try falling rates or a smaller margin.",
        nota: 'Simplified math: net worth stays the same every year. The G20 2% floor applies only to dollar billionaires and subtracts taxes already paid; it is shown only for comparison. The law in force (Law 15,270 of 2025) does not tax net worth but income: up to 10% above R$600,000 a year.',
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
  const estado = { porta: 'grande', valor: 10000000, patrimonio: 50000000, area: '', sel: new Map(), prazo: 10, cdi: CDI_PADRAO, margem: 0, juros: 'hoje' };

  const form = $('#sim-form');
  const campoValor = $('#sim-valor');
  const campoArea = $('#sim-area');
  const radios = nome => [...document.querySelectorAll(`input[name=${nome}]`)];
  const marcar = (nome, v) => radios(nome).forEach(r => { r.checked = r.value === v; });
  const campoCdi = $('#sim-cdi');
  const campoMargem = $('#sim-margem');
  function mostrarJuros() {
    $('#campo-cdi').hidden = estado.juros === 'focus';
    $('#campo-focus').hidden = estado.juros !== 'focus';
  }

  campoArea.insertAdjacentHTML('beforeend', AREAS.map(a => `<option value="${a[0]}">${esc(EN ? a[2] : a[1])}</option>`).join(''));

  function conflito(e) {
    if (!estado.area || estado.area === 'nenhuma') return null;
    if (e.conc.includes(estado.area)) return T.conc(nomeArea(estado.area));
    if (e.forn.includes(estado.area)) return T.forn(nomeArea(estado.area));
    return null;
  }

  function lerValor() {
    const n = parseInt(String(campoValor.value).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : (estado.porta === 'menor' ? 10000 : 10000000);
  }

  function valorUsado() {
    return estado.porta === 'menor' ? Math.min(estado.valor, TETO_MENOR) : estado.valor;
  }

  // Passo 1
  form.addEventListener('change', ev => {
    if (ev.target.name === 'porta') {
      estado.porta = ev.target.value;
      campoValor.value = fmt(estado.porta === 'menor' ? 10000 : 10000000);
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
  function formatarCampo(campo = campoValor) {
    const antes = campo.value;
    const pos = campo.selectionStart ?? antes.length;
    const digitosAntes = antes.slice(0, pos).replace(/\D/g, '').replace(/^0+/, '').length;
    const digitos = antes.replace(/\D/g, '').replace(/^0+/, '').slice(0, 13);
    const novo = digitos ? fmt(+digitos) : '';
    campo.value = novo;
    let cursor = novo.length, vistos = 0;
    if (digitosAntes === 0) cursor = novo.search(/\d/) < 0 ? novo.length : novo.search(/\d/);
    else for (let i = 0; i < novo.length; i++) { if (/\d/.test(novo[i]) && ++vistos === digitosAntes) { cursor = i + 1; break; } }
    if (document.activeElement === campo) campo.setSelectionRange(cursor, cursor);
  }
  const campoPatrimonio = $('#sim-patrimonio');
  function lerPatrimonio() {
    const n = parseInt(String(campoPatrimonio.value).replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : 50000000;
  }
  campoPatrimonio.addEventListener('input', () => { formatarCampo(campoPatrimonio); estado.patrimonio = lerPatrimonio(); desenharResultado(); });
  campoPatrimonio.addEventListener('blur', () => { if (!campoPatrimonio.value) campoPatrimonio.value = fmt(lerPatrimonio()); });
  campoValor.addEventListener('input', () => { formatarCampo(); estado.valor = lerValor(); desenharResultado(); desenharNotaValor(); atualizarPcts(); });
  campoValor.addEventListener('blur', () => { if (!campoValor.value) campoValor.value = fmt(lerValor()); });
  form.addEventListener('submit', ev => {
    ev.preventDefault();
    estado.valor = lerValor(); estado.area = campoArea.value;
    desenhar();
    $('#passo-2').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  function desenharNotaValor() {
    $('#campo-patrimonio').hidden = estado.porta !== 'grande';
    $('#campo-margem').hidden = estado.porta !== 'grande';
    const nota = $('#sim-nota-valor');
    const partes = [];
    if (estado.porta === 'menor' && estado.valor > TETO_MENOR) partes.push(`<span class="nota-teto">${esc(T.teto(fmt(TETO_MENOR)))}</span>`);
    if (estado.porta === 'grande') partes.push(esc(T.grande));
    nota.innerHTML = partes.join(' ');
    nota.hidden = partes.length === 0;
  }

  // Passo 2
  const lista = $('#sim-empresas');
  // Abas por faixa: uma faixa por vez, num carrossel que se arrasta para o lado.
  let faixaVista = 1, entrando = true, pulsar = new Set(), contasPop = false;
  const abasFaixa = $('#sim-faixas');
  abasFaixa.innerHTML = [1, 2, 3, 4].map(f => `<label><input type="radio" name="faixa-ver" value="${f}"${f === 1 ? ' checked' : ''}>${esc(T.faixaCurta(f))}<span class="conta" data-conta="${f}" hidden></span></label>`).join('');
  abasFaixa.addEventListener('change', ev => {
    faixaVista = +ev.target.value; entrando = true;
    lista.scrollLeft = 0;
    desenharEmpresas();
  });
  function mover(dir) {
    const card = lista.querySelector('.empresa');
    if (!card) return;
    const passo = card.getBoundingClientRect().width + parseFloat(getComputedStyle(lista).columnGap || 0);
    lista.scrollBy({ left: dir * passo, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('.carrossel .seta').forEach(b => b.addEventListener('click', () => mover(+b.dataset.dir)));
  function atualizarPosicao() {
    const cards = [...lista.querySelectorAll('.empresa')];
    const nav = $('.carrossel-nav');
    const cabe = lista.scrollWidth <= lista.clientWidth + 2;
    nav.hidden = cabe;
    if (cabe || !cards.length) return;
    const larg = cards[0].getBoundingClientRect().width;
    const i = Math.min(cards.length, Math.round(lista.scrollLeft / larg) + 1);
    $('#sim-posicao').textContent = T.posicao(i, cards.length);
    const [ant, prox] = nav.querySelectorAll('.seta');
    ant.disabled = lista.scrollLeft < 4;
    prox.disabled = lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 4;
  }
  lista.addEventListener('scroll', atualizarPosicao, { passive: true });
  // Com o mouse, dá para arrastar os cartões para o lado (fora de botões, links e da régua).
  // No toque, o próprio navegador já rola.
  (function arrastar() {
    let ini = null, moveu = false;
    lista.addEventListener('pointerdown', ev => {
      if (ev.pointerType !== 'mouse' || ev.button !== 0 || ev.target.closest('button, a, input, label')) return;
      ini = { x: ev.clientX, s: lista.scrollLeft }; moveu = false;
    });
    addEventListener('pointermove', ev => {
      if (!ini) return;
      const dx = ev.clientX - ini.x;
      if (!moveu && Math.abs(dx) < 5) return;
      if (!moveu) { moveu = true; lista.classList.add('arrastando'); }
      lista.scrollLeft = ini.s - dx;
      ev.preventDefault();
    });
    addEventListener('pointerup', () => {
      if (!ini) return;
      ini = null;
      if (!moveu) return;
      // Solta e deixa o carrossel encaixar no cartão mais perto.
      const card = lista.querySelector('.empresa');
      lista.classList.remove('arrastando');
      if (card) {
        const passo = card.getBoundingClientRect().width + parseFloat(getComputedStyle(lista).columnGap || 0);
        lista.scrollTo({ left: Math.round(lista.scrollLeft / passo) * passo, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    });
    // Evita que soltar o mouse depois de arrastar conte como clique.
    lista.addEventListener('click', ev => { if (moveu) { ev.stopPropagation(); ev.preventDefault(); moveu = false; } }, true);
  })();
  addEventListener('resize', atualizarPosicao, { passive: true });
  function desenharEmpresas() {
    const fora = EMPRESAS.filter(conflito);
    const aviso = $('#sim-conflitos');
    aviso.innerHTML = `<p>${esc(!estado.area ? T.semArea : T.conflitos(estado.area === 'nenhuma' ? 0 : fora.length, nomeArea(estado.area)))}</p>`;
    const total = totalPeso();
    // Contagem de escolhidas em cada aba
    [1, 2, 3, 4].forEach(f => {
      const n = EMPRESAS.filter(e => e.f === f && estado.sel.has(e.id)).length;
      const el = abasFaixa.querySelector(`[data-conta="${f}"]`);
      el.textContent = n; el.hidden = !n;
      el.classList.remove('pop');
      if (contasPop && n) { void el.offsetWidth; el.style.setProperty('--d', `${(f - 1) * 150}ms`); el.classList.add('pop'); }
    });
    $('#sim-faixa-info').textContent = T.faixaInfo(faixaVista, FAIXAS[faixaVista].prazo, fmtPct(FAIXAS[faixaVista].seguro));
    // Só a faixa da aba: disponíveis primeiro, depois as tiradas
    const daFaixa = e => e.f === faixaVista;
    const ordem = [...EMPRESAS.filter(e => daFaixa(e) && !conflito(e)), ...fora.filter(daFaixa)];
    const rolagem = lista.scrollLeft;
    lista.classList.toggle('entrando', entrando);
    lista.innerHTML = ordem.map((e, i) => {
      const motivo = conflito(e);
      const tx = e[L];
      const naCarteira = estado.sel.has(e.id);
      const pct = naCarteira && total ? estado.sel.get(e.id) / total : 0;
      return `<article class="empresa${motivo ? ' conflito' : ''}${naCarteira ? ' escolhida' : ''}${pulsar.has(e.id) ? ' acabou' : ''}" data-id="${e.id}" style="--i:${i}">
        <div class="empresa-topo"><span class="faixa f${e.f}">${esc(T.faixa(e.f))}</span><span class="ficticia">${esc(T.ficticia)}</span></div>
        <h3>${esc(e.nome)}</h3>
        <p class="setor">${esc(tx[0])}</p>
        <p>${esc(tx[1])}</p>
        ${e.prop ? `<a class="link-seta" href="${EN ? '/en' : ''}/projetos/${e.prop}/">${esc(T.proposta)} →</a>` : ''}
        ${motivo ? `<p class="motivo">${esc(motivo)}</p>` : `
        <button type="button" class="botao${naCarteira ? '' : ' secundario'}" aria-pressed="${naCarteira}" data-acao="alternar">${esc(naCarteira ? T.escolhida : T.escolher)}<span class="visualmente-oculto"> ${esc(e.nome)}</span></button>
        ${naCarteira ? `<div class="peso"><label for="peso-${e.id}"><span>${esc(T.peso)}</span><span data-pct>${fmtParte(pct)} · ${fmt(pct * valorUsado())}</span></label>
          <input id="peso-${e.id}" type="range" min="5" max="100" step="5" value="${estado.sel.get(e.id)}" data-acao="peso"></div>` : ''}`}
      </article>`;
    }).join('');
    lista.scrollLeft = rolagem;
    entrando = false; pulsar = new Set(); contasPop = false;
    atualizarPosicao();
  }

  lista.addEventListener('click', ev => {
    const b = ev.target.closest('[data-acao="alternar"]');
    if (!b) return;
    const id = b.closest('.empresa').dataset.id;
    if (estado.sel.has(id)) estado.sel.delete(id); else { estado.sel.set(id, 50); pulsar = new Set([id]); }
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
    // Mostra a escolha acontecendo: volta para a Faixa 1, os cartões entram e os escolhidos pulsam.
    faixaVista = 1; marcar('faixa-ver', '1');
    lista.scrollLeft = 0;
    entrando = true; contasPop = true;
    pulsar = new Set(estado.sel.keys());
    desenhar();
    // Rola até os botões, logo abaixo do cabeçalho e da barra de passos, para ver os cartões entrando.
    const fixos = [...document.querySelectorAll('.passos > gr-progresso, gr-cabecalho')].reduce((m, el) => Math.max(m, el.getBoundingClientRect().bottom), 0);
    const topo = $('#passo-2 .acoes').getBoundingClientRect().top + scrollY - fixos - 12;
    if (Math.abs(topo - scrollY) > 40) scrollTo({ top: topo, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  $('#sim-limpar').addEventListener('click', () => { estado.sel.clear(); $('#sim-status-carteira').textContent = ''; desenhar(); });

  // Regras
  function totalPeso() { let t = 0; estado.sel.forEach(v => { t += v; }); return t; }
  function analisar() {
    const total = totalPeso();
    const itens = [...estado.sel].map(([id, p]) => ({ e: EMPRESAS.find(x => x.id === id), w: total ? p / total : 0 }));
    const f1 = itens.filter(i => i.e.f === 1).reduce((s, i) => s + i.w, 0);
    const r2 = itens.some(i => i.e.f === 1) && itens.some(i => i.e.f === 3);
    const r3 = f1 >= MIN_F1 - 1e-9;
    return { itens, f1, r2, r3, ok: r2 && r3 };
  }

  function desenharRegras() {
    const a = analisar();
    const li = (ok, txt) => `<li class="${ok ? 'ok' : ''}"><span class="marca" aria-hidden="true">${ok ? '✓' : '·'}</span><span><span class="visualmente-oculto">${ok ? (EN ? 'Done: ' : 'Cumprida: ') : (EN ? 'Missing: ' : 'Falta: ')}</span>${esc(txt)}</span></li>`;
    $('#sim-regras').innerHTML = li(a.r2, T.r2) + li(a.r3, T.r3(fmtParte(Math.floor(a.f1 * 100) / 100)));
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
    const grande = estado.porta === 'grande';
    // Valor no fim do prazo, já sem o imposto sobre o lucro (prejuízo não paga imposto).
    const fim = (r, imp) => { const g = V * (Math.pow(1 + r, n) - 1); return V + (g > 0 ? g * (1 - imp) : g); };
    const cdiR = estado.cdi / 100;
    // CDI de cada ano: o de hoje o prazo todo, ou o caminho do Focus.
    const queda = estado.juros === 'focus';
    const cdiAno = k => (queda ? CDI_FOCUS[Math.min(k, CDI_FOCUS.length) - 1] : estado.cdi) / 100;
    // Quanto R$ 1 vira do ano de+1 até o ano ate, rendendo o CDI vezes m mais a margem.
    const fator = (de, ate, m = 1, extra = 0) => { let f = 1; for (let k = de + 1; k <= ate; k++) f *= 1 + cdiAno(k) * m + extra; return f; };
    const anual = f => Math.pow(f, 1 / n) - 1;
    // O retorno das empresas do FSRI fica preso ao CDI de hoje nos dois casos (suposição).
    const tx = { medio: Math.pow(VEZES_CDI, 1 / n) * (1 + cdiR) - 1 };
    tx.ruim = Math.max(-0.99, tx.medio - MEIA_DIFERENCA);
    tx.bom = tx.medio + MEIA_DIFERENCA;
    const impF = isento ? 0 : IR;
    // Cada desconto anual vira dinheiro na mão naquele ano; corrigimos pelo CDI até o fim do prazo.
    let desconto = 0;
    if (grande && a.ok) for (let k = 1; k <= ANOS_DESCONTO; k++) desconto += V * DESCONTO_ANO * fator(k, n);
    const fJuros = fator(0, n, 1, estado.margem / 100);
    const jurosR = anual(fJuros);
    const juros = grande ? V * (fJuros - 1) : 0;
    const cdiMedio = anual(fator(0, n)), lcaMedio = anual(fator(0, n, LCA_DO_CDI));
    const lucro = (v, extra = 0) => v + extra - V - juros;
    const ruim = fim(tx.ruim, impF), medio = fim(tx.medio, impF), bom = fim(tx.bom, impF), cdi = fim(cdiMedio, IR);
    const outras = [
      { cls: 'cdi', nome: T.cdb, taxa: cdiMedio, nota: T.cdbNota(cdiMedio * 100, grande, queda), imp: T.comIR, lucro: lucro(cdi) },
      { cls: 'outra', nome: T.lca, taxa: lcaMedio, nota: T.lcaNota, imp: T.isentoCurto, lucro: lucro(fim(lcaMedio, 0)) },
      { cls: 'outra', nome: T.fii, taxa: IFIX_AA, nota: T.fiiNota, imp: T.isentoCurto, lucro: lucro(fim(IFIX_AA, 0)) },
      { cls: 'outra', nome: T.acoes, taxa: IBOV_AA, nota: T.acoesNota, imp: T.comIR, lucro: lucro(fim(IBOV_AA, IR)) },
    ];
    const seguro = a.itens.reduce((s, i) => s + V * i.w * FAIXAS[i.e.f].seguro, 0);
    return { a, V, n, isento, grande, queda, tx, ruim, medio, bom, cdi, cdiR, jurosR, juros, desconto, outras,
      lucros: { ruim: lucro(ruim, desconto), medio: lucro(medio, desconto), bom: lucro(bom, desconto) },
      medioMargem2: medio + desconto - V - V * (fator(0, n, 1, 0.02) - 1),
      seguro, perde: V - seguro };
  }

  // Imposto ou FSRI: dois caminhos para o mesmo patrimônio, com placar para você e para o país.
  function blocoImposto(c) {
    const pat = estado.patrimonio, n = c.n;
    const g20 = pat * PISO_G20 * n;
    const I = T.imp;
    const sinal = v => (v < 0 ? '−' : '+') + fmt(Math.abs(v));
    const conta = (v, cls) => `<b class="${cls}" data-valor="${Math.round(v)}">${sinal(v)}</b>`;
    const ganhaMedio = c.lucros.medio >= 0;
    const placa = (quem, ok) => `<span class="placa ${ok ? 'ganha' : 'perde'}">${esc(quem)}: ${esc(ok ? I.ganha : I.perde)}</span>`;
    return `<div class="comparativo">
      <h3>${esc(I.titulo)}</h3>
      <p>${esc(I.intro(fmt(pat), n))}</p>
      <div class="dois-caminhos">
        <div class="caminho imposto">
          <strong>${esc(I.g20)}</strong><small>${esc(I.g20Sub)}</small>
          <div class="trilho" aria-hidden="true"><span class="ponta">${esc(I.deVoce)}</span><span class="linha"><i></i><i></i><i></i></span><span class="ponta">${esc(I.governo)}</span></div>
          <dl class="placar">
            <div><dt>${esc(I.voce)}</dt><dd>${conta(-g20, 'menos')}<small>${esc(I.perdeVoce)}</small></dd></div>
            <div><dt>${esc(I.pais)}</dt><dd>${conta(g20, 'mais')}<small>${esc(I.paisImp)}</small></dd></div>
          </dl>
          <p class="placas">${placa(I.voce, false)}${placa(I.pais, true)}</p>
        </div>
        <div class="caminho fsri">
          <strong>${esc(I.fsri)}</strong><small>${esc(I.fsriSub)}</small>
          <div class="trilho" aria-hidden="true"><span class="ponta">${esc(I.deVoce)}</span><span class="linha"><i></i><i></i><i></i><em class="retorno"><i></i><i></i><i></i></em></span><span class="ponta">${esc(I.empresas)}</span></div>
          <dl class="placar">
            <div><dt>${esc(I.voce)}</dt><dd>${conta(c.lucros.medio, ganhaMedio ? 'mais' : 'menos')}<small>${esc(I.ganhaVoce)}</small></dd></div>
            <div><dt>${esc(I.pais)}</dt><dd>${conta(c.V, 'mais')}<small>${esc(I.paisFsri)}</small></dd></div>
          </dl>
          <p class="placas">${placa(I.voce, ganhaMedio)}${placa(I.pais, true)}</p>
        </div>
      </div>
      <div class="veredito${ganhaMedio ? '' : ' nao'}">${ganhaMedio ? `<strong>${esc(I.veredito)}</strong>` : ''}<p>${esc(ganhaMedio ? I.vereditoTexto(fmt(Math.abs(c.lucros.ruim))) : I.vereditoNao)}</p></div>
      <p class="pequeno">${esc(I.nota)}</p>
    </div>`;
  }

  // Anima o quadro na primeira vez que ele aparece na tela: o dinheiro corre pelo trilho e os números sobem.
  let impostoVisto = false;
  function animarImposto() {
    const bloco = $('.comparativo');
    if (!bloco) return;
    if (impostoVisto || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { bloco.classList.add('parado'); return; }
    const obs = new IntersectionObserver(ent => {
      if (!ent[0].isIntersecting) return;
      obs.disconnect(); impostoVisto = true;
      bloco.classList.add('animar');
      const sinal = v => (v < 0 ? '−' : '+') + fmt(Math.abs(v));
      bloco.querySelectorAll('[data-valor]').forEach(el => {
        const alvo = +el.dataset.valor, t0 = performance.now(), dur = 1200;
        const passo = t => { const k = Math.min(1, (t - t0) / dur); el.textContent = sinal(alvo * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.35 });
    obs.observe(bloco);
  }

  function desenharResultado() {
    const alvo = $('#sim-resultado');
    const comp = $('#sim-compartilhar');
    if (!estado.sel.size) { alvo.innerHTML = `<p class="vazio">${esc(T.vazio)}</p>`; comp.hidden = true; return; }
    const c = calcular();
    const todos = [c.lucros.ruim, c.lucros.medio, c.lucros.bom, ...c.outras.map(o => o.lucro)];
    const max = Math.max(...todos.map(Math.abs)) || 1;
    const sinal = v => (v < 0 ? '−' : '+') + fmt(Math.abs(v));
    const linha = (cls, nome, taxa, valor, nota, imp) => `<div class="cenario ${cls}${valor < 0 ? ' negativo' : ''}">
      <div class="cenario-topo"><strong>${esc(nome)} · ${esc(T.aa(taxa))}</strong><b>${sinal(valor)}</b></div>
      <div class="barra" aria-hidden="true"><div style="width:${Math.max(2, Math.abs(valor) / max * 100).toFixed(1)}%"></div></div>
      <p class="pequeno">${esc(nota)} ${esc(imp)}.</p></div>`;
    const impF = c.isento ? T.isento : T.comIR;
    const notas = [];
    if (c.desconto) notas.push(T.desconto(fmt(c.desconto)));
    if (c.grande) notas.push(T.juros(fmt(c.juros), fmtPct(c.jurosR)));
    if (c.grande && estado.margem === 0) notas.push(T.exemploMargem(sinal(c.medioMargem2)));
    if (c.queda) notas.push(T.quedaNota);
    alvo.innerHTML = `<p class="pequeno">${esc(c.grande ? T.lucroGrande : T.lucroMenor)}</p>
    <h3 class="grupo">${esc(T.grupoFsri)}</h3>
    <div class="cenarios">
      ${linha('ruim', T.ruim, c.tx.ruim, c.lucros.ruim, T.ruimNota, impF)}
      ${linha('medio', T.medio, c.tx.medio, c.lucros.medio, T.medioNota, impF)}
      ${linha('bom', T.bom, c.tx.bom, c.lucros.bom, T.bomNota, impF)}
    </div>
    <h3 class="grupo">${esc(T.grupoOutras)}</h3>
    <div class="cenarios">
      ${c.outras.map(o => linha(o.cls, o.nome, o.taxa, o.lucro, o.nota, o.imp)).join('')}
    </div>
    ${notas.map(n => `<p class="pequeno nota-conta">${esc(n)}</p>`).join('')}
    <div class="quebra"><h3>${esc(T.quebraT)}</h3><p>${T.quebra(fmt(c.perde), fmt(c.seguro))}</p><p>${esc(T.quebraNota)}</p></div>`;
    if (estado.porta === 'grande') { alvo.insertAdjacentHTML('beforeend', blocoImposto(c)); animarImposto(); }
    comp.hidden = false;
    atualizarLink();
    desenharCartao(c);
  }

  radios('prazo').forEach(r => r.addEventListener('change', () => { estado.prazo = +r.value; desenharResultado(); }));
  campoCdi.addEventListener('input', () => {
    const v = parseFloat(String(campoCdi.value).replace(',', '.'));
    estado.cdi = Number.isFinite(v) && v >= 0 && v < 100 ? v : CDI_PADRAO;
    desenharResultado();
  });
  radios('juros').forEach(r => r.addEventListener('change', () => {
    estado.juros = r.value === 'focus' ? 'focus' : 'hoje';
    mostrarJuros();
    desenharResultado();
  }));
  campoMargem.addEventListener('input', () => {
    const v = parseFloat(String(campoMargem.value).replace(',', '.'));
    estado.margem = Number.isFinite(v) && v >= 0 && v < 50 ? v : 0;
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
    if (estado.juros === 'focus') u.searchParams.set('j', 'focus');
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
    const corFaixa = { 1: cor('--verde-fundo'), 2: cor('--azul'), 3: cor('--amarelo'), 4: cor('--verde-claro') };
    const alturaItem = itens.length > 5 ? 52 : 64;
    itens.slice(0, 6).forEach(i => {
      ctx.fillStyle = corFaixa[i.e.f];
      roundRect(ctx, 80, y - 34, 120, 44, 22); ctx.fill();
      ctx.fillStyle = i.e.f === 3 ? cor('--azul') : i.e.f === 4 ? cor('--verde-escuro') : cor('--branco');
      ctx.font = `800 24px ${fonte}`; ctx.fillText(T.faixaCurta(i.e.f), 96, y - 4);
      ctx.fillStyle = cor('--texto'); ctx.font = `800 36px ${fonte}`;
      ctx.fillText(i.e.nome, 220, y);
      ctx.textAlign = 'right'; ctx.fillText(fmtParte(i.w), W - 80, y); ctx.textAlign = 'left';
      y += alturaItem;
    });
    if (itens.length > 6) { ctx.fillStyle = cor('--texto-suave'); ctx.font = `700 28px ${fonte}`; ctx.fillText(`+ ${itens.length - 6}`, 220, y); y += 40; }

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
    if ([5, 10, 15].includes(p)) { estado.prazo = p; marcar('prazo', String(p)); }
    if (q.get('j') === 'focus') { estado.juros = 'focus'; marcar('juros', 'focus'); mostrarJuros(); }
    if (!c) return;
    c.split('-').forEach(par => {
      const [id, peso] = par.split('.');
      const n = parseInt(peso, 10);
      if (EMPRESAS.some(e => e.id === id) && n >= 1 && n <= 100) estado.sel.set(id, n);
    });
    if (estado.sel.size) {
      const r = $('#sim-recebida');
      r.innerHTML = `<p>${esc(q.get('de') === 'moradia' ? T.deMoradia : T.recebida)}</p>`;
      r.hidden = false;
    }
  })();

  // Barra fixa de passos (<gr-progresso>, do design system): mostra em que passo a pessoa está
  // enquanto rola, e o link leva ao passo seguinte.
  (function barraDePassos() {
    const barra = $('.passos > gr-progresso');
    if (!barra) return;
    const passos = [1, 2, 3].map(n => $('#passo-' + n));
    const proximo = $('#sim-proximo');
    let atual = 0;
    function olhar() {
      const limite = barra.getBoundingClientRect().bottom + 40;
      let n = 1;
      passos.forEach((p, i) => { if (p.getBoundingClientRect().top <= limite) n = i + 1; });
      if (n === atual) return;
      atual = n;
      const p = passos[n - 1];
      barra.setAttribute('valor', n);
      barra.setAttribute('rotulo', `${p.querySelector('.passo-num').textContent}: ${p.querySelector('h2').textContent}`);
      proximo.hidden = n === 3;
      proximo.href = '#passo-' + Math.min(3, n + 1);
    }
    proximo.addEventListener('click', ev => {
      ev.preventDefault();
      $(proximo.getAttribute('href')).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    addEventListener('scroll', olhar, { passive: true });
    addEventListener('resize', olhar, { passive: true });
    olhar();
  })();

  campoCdi.value = String(CDI_PADRAO).replace('.', EN ? '.' : ',');
  campoMargem.value = '0';
  desenhar();
  // Redesenha a imagem quando a fonte terminar de carregar
  if (document.fonts) document.fonts.ready.then(() => { if (estado.sel.size) desenharCartao(calcular()); });
})();
