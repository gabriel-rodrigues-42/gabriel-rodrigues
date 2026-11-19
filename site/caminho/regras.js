// Regras do questionário "Qual caminho faz sentido pra mim?"
// Aqui ficam só regras que estão na lei e valem para o país inteiro.
// Os números de cada cidade e estado (vagas, votos, quociente) estão em dados/,
// gerados por scripts/caminho/gerar_dados.py a partir do TSE e do IBGE.

window.CAMINHO_REGRAS = {
  fontes: {
    cf: { nome: "Constituição Federal", url: "https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm" },
    lei9504: { nome: "Lei das Eleições (Lei 9.504/1997)", url: "https://www.planalto.gov.br/ccivil_03/leis/l9504.htm" },
    ce: { nome: "Código Eleitoral (Lei 4.737/1965)", url: "https://www.planalto.gov.br/ccivil_03/leis/l4737compilado.htm" },
    lc78: { nome: "Lei Complementar 78/1993 (tamanho das bancadas)", url: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp78.htm" },
    tse: { nome: "TSE, Portal de Dados Abertos", url: "https://dadosabertos.tse.jus.br/" },
    divulga: { nome: "TSE, DivulgaCandContas", url: "https://divulgacandcontas.tse.jus.br/" },
    ibge: { nome: "IBGE, Censo 2022 (tabela 4709)", url: "https://sidra.ibge.gov.br/tabela/4709" },
    calendario: { nome: "TSE, calendário eleitoral", url: "https://www.tse.jus.br/eleicoes/calendario-eleitoral" },
  },

  // Datas que a lei fixa: eleição no 1º domingo de outubro e 2º turno no último domingo
  // (CF arts. 28, 29 e 77; Lei 9.504, art. 1º). Filiação e domicílio: 6 meses antes (Lei 9.504, art. 9º).
  // Convenções de 20/7 a 5/8 (art. 8º). Registro até 15/8 (art. 11). O TSE publica o calendário oficial de cada ano.
  eleicoes: {
    2028: { tipo: "municipal", data: "2028-10-01", segundoTurno: "2028-10-29", filiacao: "2028-04-01", convencoes: ["2028-07-20", "2028-08-05"], registro: "2028-08-15" },
    2030: { tipo: "geral", data: "2030-10-06", segundoTurno: "2030-10-27", filiacao: "2030-04-06", convencoes: ["2030-07-20", "2030-08-05"], registro: "2030-08-15" },
    2032: { tipo: "municipal", data: "2032-10-03", segundoTurno: "2032-10-31", filiacao: "2032-04-03", convencoes: ["2032-07-20", "2032-08-05"], registro: "2032-08-15" },
    2034: { tipo: "geral", data: "2034-10-01", segundoTurno: "2034-10-29", filiacao: "2034-04-01", convencoes: ["2034-07-20", "2034-08-05"], registro: "2034-08-15" },
  },

  // nivel: onde a decisão tem efeito. poder: legislativo (faz leis e fiscaliza) ou executivo (administra).
  // idade: CF art. 14, § 3º, VI. Conferida na posse; a de 18 anos, no prazo do registro (Lei 9.504, art. 11, § 2º).
  cargos: {
    vereador: {
      nome: "Vereador", nivel: "cidade", poder: "legislativo", tipo: "municipal", sistema: "proporcional",
      casa: "Câmara Municipal", idade: 18, idadeNa: "registro", posse: "01-01", mandato: 4,
      faz: "Faz as leis da cidade, vota o orçamento da prefeitura e fiscaliza o prefeito. Transporte, posto de saúde, zoneamento e serviços digitais da prefeitura passam por aqui.",
      base: "CF, art. 29 e art. 14, § 3º, VI, d",
    },
    prefeito: {
      nome: "Prefeito", nivel: "cidade", poder: "executivo", tipo: "municipal", sistema: "majoritario",
      casa: "Prefeitura", idade: 21, idadeNa: "posse", posse: "01-01", mandato: 4,
      faz: "Administra a cidade: executa o orçamento, contrata, cuida de escolas de ensino fundamental, saúde básica, coleta de lixo e transporte.",
      base: "CF, art. 29 e art. 14, § 3º, VI, c",
    },
    deputado_estadual: {
      nome: "Deputado estadual", nivel: "estado", poder: "legislativo", tipo: "geral", sistema: "proporcional",
      casa: "Assembleia Legislativa", idade: 21, idadeNa: "posse", posse: "02-01", mandato: 4,
      faz: "Faz as leis do estado e fiscaliza o governador: segurança pública, ensino médio, ICMS, estradas estaduais.",
      base: "CF, art. 27 e art. 14, § 3º, VI, c",
    },
    deputado_distrital: {
      nome: "Deputado distrital", nivel: "estado", poder: "legislativo", tipo: "geral", sistema: "proporcional",
      casa: "Câmara Legislativa do DF", idade: 21, idadeNa: "posse", posse: "02-01", mandato: 4,
      faz: "Faz as leis do Distrito Federal, que juntam temas de estado e de cidade, e fiscaliza o governador do DF.",
      base: "CF, art. 32 e art. 14, § 3º, VI, c",
    },
    governador: {
      nome: "Governador", nivel: "estado", poder: "executivo", tipo: "geral", sistema: "majoritario",
      casa: "Governo do estado", idade: 30, idadeNa: "posse", posse: "01-06", mandato: 4,
      faz: "Administra o estado: polícias, ensino médio, hospitais estaduais, estradas e a arrecadação do ICMS.",
      base: "CF, art. 28 e art. 14, § 3º, VI, b",
    },
    deputado_federal: {
      nome: "Deputado federal", nivel: "pais", poder: "legislativo", tipo: "geral", sistema: "proporcional",
      casa: "Câmara dos Deputados", idade: 21, idadeNa: "posse", posse: "02-01", mandato: 4,
      faz: "Faz as leis do Brasil inteiro: tributos federais, regras para empreender, internet, serviços digitais do governo. É eleito pelos votos do seu estado e legisla para o país.",
      base: "CF, art. 45 e art. 14, § 3º, VI, c",
    },
    senador: {
      nome: "Senador", nivel: "pais", poder: "legislativo", tipo: "geral", sistema: "majoritario",
      casa: "Senado Federal", idade: 35, idadeNa: "posse", posse: "02-01", mandato: 8,
      faz: "Revisa e vota as leis nacionais, aprova autoridades e representa o estado no Congresso. Cada estado tem 3 senadores.",
      base: "CF, art. 46 e art. 14, § 3º, VI, a",
      // CF, art. 46, § 2º: renovação alternada de 1/3 e 2/3 a cada 4 anos. 2026 elegeu 2 por estado; 2030 elege 1.
      vagasPorAno: { 2030: 1, 2034: 2 },
    },
  },

  // Respostas que aceitam mais de uma opção têm multipla: true.
  perguntas: [
    {
      id: "efeito", multipla: true,
      texto: "Onde você quer que suas ideias tenham efeito?",
      opcoes: [
        ["cidade", "Na minha cidade"],
        ["estado", "No meu estado"],
        ["pais", "No Brasil inteiro"],
      ],
    },
    {
      id: "poder", multipla: true,
      texto: "Como você prefere mudar as coisas?",
      opcoes: [
        ["legislativo", "Escrevendo leis e fiscalizando quem governa"],
        ["executivo", "Administrando: tocando a máquina pública e o orçamento"],
      ],
    },
    {
      id: "quando", multipla: true,
      texto: "Em qual eleição você pensa em entrar?",
      opcoes: [
        ["2028", "2028, eleição municipal (1º de outubro)"],
        ["2030", "2030, eleição geral (6 de outubro)"],
        ["depois", "Mais para frente, em 2032 ou 2034"],
      ],
    },
  ],

  // Exemplo: o caminho que o Gabriel está estudando. Nada aqui é pedido de voto.
  exemplos: {
    gabriel: {
      nome: "Gabriel",
      uf: "GO", ibge: 5208707,
      efeito: ["cidade", "pais"], poder: ["legislativo"], quando: ["2028", "2030"],
      caminho: [["vereador", 2028], ["deputado_federal", 2030]],
      nota: "O Gabriel quer fazer leis para o Brasil como deputado federal por Goiás em 2030. Disputar vereador em Goiânia em 2028 pode ser um degrau: dá experiência de mandato e mostra o trabalho antes. É um plano em estudo, não um pedido de voto.",
    },
  },
};
