// Textos em inglês do questionário, para /en/caminho/. Carregue depois de regras.js.
// Só troca textos: datas, idades, prazos e números continuam vindo de regras.js e de dados/.
// Mudou um texto em regras.js? Mude aqui também.

(() => {
  const R = window.CAMINHO_REGRAS;

  const fontes = {
    cf: "Federal Constitution of Brazil",
    lei9504: "Elections Law (Law 9.504/1997)",
    ce: "Electoral Code (Law 4.737/1965)",
    lc78: "Complementary Law 78/1993 (size of state delegations)",
    tse: "TSE (Superior Electoral Court), Open Data Portal",
    divulga: "TSE, DivulgaCandContas",
    ibge: "IBGE, 2022 Census (table 4709)",
    calendario: "TSE, electoral calendar",
  };
  for (const [k, nome] of Object.entries(fontes)) R.fontes[k].nome = nome;

  const cargos = {
    vereador: {
      nome: "City councilor", casa: "City Council",
      faz: "Writes the city's laws, votes on the city budget and oversees the mayor. Public transport, health clinics, zoning and the city's digital services all go through here.",
      base: "Constitution, art. 29 and art. 14, § 3, VI, d",
    },
    prefeito: {
      nome: "Mayor", casa: "City Hall",
      faz: "Runs the city: executes the budget, hires, and manages primary schools, basic health care, garbage collection and transport.",
      base: "Constitution, art. 29 and art. 14, § 3, VI, c",
    },
    deputado_estadual: {
      nome: "State representative", casa: "State Legislative Assembly",
      faz: "Writes the state's laws and oversees the governor: public security, high schools, the ICMS sales tax, state roads.",
      base: "Constitution, art. 27 and art. 14, § 3, VI, c",
    },
    deputado_distrital: {
      nome: "District representative", casa: "Legislative Chamber of the Federal District",
      faz: "Writes the laws of the Federal District, which combine state and city matters, and oversees the Federal District's governor.",
      base: "Constitution, art. 32 and art. 14, § 3, VI, c",
    },
    governador: {
      nome: "Governor", casa: "State government",
      faz: "Runs the state: the police, high schools, state hospitals, roads and the collection of the ICMS sales tax.",
      base: "Constitution, art. 28 and art. 14, § 3, VI, b",
    },
    deputado_federal: {
      nome: "Federal representative", casa: "Chamber of Deputies",
      faz: "Writes laws for all of Brazil: federal taxes, rules for starting a business, the internet, the government's digital services. Elected by the votes of their state, legislates for the whole country.",
      base: "Constitution, art. 45 and art. 14, § 3, VI, c",
    },
    senador: {
      nome: "Senator", casa: "Federal Senate",
      faz: "Reviews and votes on national laws, approves appointments and represents the state in Congress. Each state has 3 senators.",
      base: "Constitution, art. 46 and art. 14, § 3, VI, a",
    },
  };
  for (const [k, t] of Object.entries(cargos)) Object.assign(R.cargos[k], t);

  const perguntas = {
    efeito: ["Where do you want your ideas to have an effect?", { cidade: "In my city", estado: "In my state", pais: "In all of Brazil" }],
    poder: ["How do you prefer to change things?", {
      legislativo: "Writing laws and overseeing those who govern",
      executivo: "Administering: running the public machine and the budget",
    }],
    quando: ["Which election are you thinking of running in?", {
      2028: "2028, municipal election (October 1)",
      2030: "2030, general election (October 6)",
      depois: "Later, in 2032 or 2034",
    }],
  };
  for (const q of R.perguntas) {
    const [texto, opcoes] = perguntas[q.id];
    q.texto = texto;
    q.opcoes = q.opcoes.map(([valor, pt]) => [valor, opcoes[valor] || pt]);
  }

  R.exemplos.gabriel.nota = "Gabriel wants to write laws for Brazil as a federal representative for Goiás in 2030. Running for city councilor in Goiânia in 2028 could be a stepping stone: it brings experience in office and shows the work earlier. It's a plan under study, not a request for votes.";
})();
