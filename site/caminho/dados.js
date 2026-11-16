// Dados do questionário "Qual caminho faz sentido pra mim?"
// Para adaptar a outra cidade ou estado, edite apenas este arquivo.
// Números de referência levantados em novembro de 2026. Confira sempre no TSE e no TRE do seu estado.

window.CAMINHO = {
  atualizado: "novembro de 2026",

  caminhos: {
    vereador: {
      nome: "Vereador em Goiânia",
      quando: "Eleição em 1º de outubro de 2028",
      resumo:
        "Faz leis municipais, aprova o orçamento da cidade e fiscaliza a prefeitura. É o cargo mais próximo do dia a dia: transporte, posto de saúde, digitalização dos serviços da prefeitura.",
      fatos: [
        ["Cadeiras", "37 na Câmara Municipal"],
        ["Votos para o partido eleger 1", "cerca de 19 mil (quociente de 2020)"],
        ["Mínimo individual", "10% do quociente, cerca de 2 mil votos"],
        ["Idade mínima", "18 anos"],
        ["Filiação e domicílio em Goiânia", "até 6 meses antes, por volta de 1º de abril de 2028"],
      ],
      passos: [
        "Transferir o título de eleitor para Goiânia, se ainda não estiver lá.",
        "Escolher um partido e se filiar antes de abril de 2028.",
        "Escolher 2 ou 3 problemas da cidade e publicar conteúdo sobre eles toda semana.",
      ],
    },
    estadual: {
      nome: "Deputado estadual por Goiás",
      quando: "Eleição em 6 de outubro de 2030",
      resumo:
        "Faz leis estaduais e fiscaliza o governo do estado: segurança pública, ensino médio, ICMS, estradas estaduais.",
      fatos: [
        ["Cadeiras", "41 na Assembleia Legislativa (Alego)"],
        ["Votos para o partido eleger 1", "cerca de 82 mil (quociente de 2022)"],
        ["Mínimo individual", "10% do quociente, cerca de 8 mil votos"],
        ["Idade mínima", "21 anos"],
        ["Filiação e domicílio em Goiás", "até 6 meses antes, por volta de abril de 2030"],
      ],
      passos: [
        "Usar 2027 e 2028 para construir audiência no estado inteiro, não só na capital.",
        "Considerar disputar vereador em 2028 como teste e vitrine.",
        "Mapear quais deputados estaduais atuais trabalham nos seus temas.",
      ],
    },
    federal: {
      nome: "Deputado federal por Goiás",
      quando: "Eleição em 6 de outubro de 2030",
      resumo:
        "Faz leis para o Brasil inteiro: tributos federais, regras para empreender, internet, serviços digitais do governo. É eleito pelos votos de Goiás, mas legisla para o país. É o cargo de Legislativo com impacto nacional mais acessível.",
      fatos: [
        ["Cadeiras de Goiás", "17 na Câmara dos Deputados"],
        ["Votos para o partido eleger 1", "cerca de 202 mil (quociente de 2022)"],
        ["Mínimo individual", "10% do quociente, cerca de 20 mil votos"],
        ["Idade mínima", "21 anos"],
        ["Filiação e domicílio em Goiás", "até 6 meses antes, por volta de abril de 2030"],
      ],
      passos: [
        "Tratar 2027 a 2030 como construção de audiência nacional, com vídeos e projetos públicos.",
        "Escolher um partido com chance real de atingir o quociente em Goiás.",
        "Considerar vereador em 2028 como degrau: dá mandato, experiência e base de votos.",
      ],
    },
    civica: {
      nome: "Tecnologia cívica sem mandato",
      quando: "Pode começar hoje",
      resumo:
        "Construir ferramentas e conteúdo que mostram problemas e propõem soluções, e levar essas propostas a mandatos parceiros, audiências públicas e conselhos. Também existe o projeto de lei de iniciativa popular.",
      fatos: [
        ["Custo de entrada", "baixo, só tempo e hospedagem"],
        ["Iniciativa popular federal", "assinaturas de 1% do eleitorado nacional, em pelo menos 5 estados"],
        ["Renda", "pode andar junto com um produto, como o galera.club"],
        ["Risco", "baixo, e não fecha a porta para candidatura depois"],
      ],
      passos: [
        "Publicar um primeiro projeto cívico aberto, com dados e código.",
        "Oferecer o projeto a um mandato que já trabalha no tema.",
        "Participar de uma audiência pública ou conselho municipal em Goiânia.",
      ],
    },
    assessor: {
      nome: "Aprender por dentro primeiro",
      quando: "De 1 a 2 anos",
      resumo:
        "Trabalhar num gabinete, na Câmara, na prefeitura ou num laboratório de inovação do governo para entender como uma lei nasce, quem decide e onde os sistemas travam.",
      fatos: [
        ["Exemplos", "assessoria técnica de mandato, laboratórios de inovação pública, equipes de governo digital"],
        ["Rede de contatos", "a maior vantagem deste caminho"],
        ["Risco", "baixo, com renda durante o aprendizado"],
      ],
      passos: [
        "Listar 5 mandatos ou órgãos que trabalham com tecnologia e inovação.",
        "Pedir conversas de 30 minutos com quem trabalha lá.",
        "Decidir até o fim de 2027 se a candidatura de 2028 ou 2030 faz sentido.",
      ],
    },
  },

  // Cada opção soma pontos aos caminhos.
  perguntas: [
    {
      texto: "Onde você quer que suas ideias tenham efeito?",
      opcoes: [
        ["Na minha cidade", { vereador: 3 }],
        ["No meu estado", { estadual: 3 }],
        ["No país inteiro", { federal: 3, civica: 1 }],
        ["Tanto faz o cargo, quero resolver o problema", { civica: 2, assessor: 1 }],
      ],
    },
    {
      texto: "Que tipo de mudança você mais quer fazer?",
      opcoes: [
        ["Melhorar serviços da prefeitura, como transporte e saúde básica", { vereador: 3 }],
        ["Mudar regras do estado, como segurança, ensino médio e ICMS", { estadual: 3 }],
        ["Mudar regras nacionais, como impostos, empreendedorismo e internet", { federal: 3 }],
        ["Construir ferramentas que mostram o problema e a solução", { civica: 3 }],
      ],
    },
    {
      texto: "Em quanto tempo você quer estar disputando uma eleição?",
      opcoes: [
        ["Em 2 anos, na eleição de 2028", { vereador: 3 }],
        ["Em 4 anos, na eleição de 2030", { estadual: 2, federal: 2 }],
        ["Sem prazo, primeiro quero aprender", { assessor: 3, civica: 1 }],
        ["Talvez nunca, quero mudar as coisas de fora", { civica: 3 }],
      ],
    },
    {
      texto: "Quantas pessoas já acompanham o que você publica?",
      opcoes: [
        ["Menos de mil", { assessor: 2, civica: 1, vereador: 1 }],
        ["Entre mil e 10 mil", { vereador: 2, civica: 1 }],
        ["Entre 10 mil e 100 mil", { vereador: 1, estadual: 2, federal: 1 }],
        ["Mais de 100 mil", { federal: 3, estadual: 1 }],
      ],
    },
    {
      texto: "Quanto tempo e dinheiro você consegue colocar numa campanha?",
      opcoes: [
        ["Pouco, preciso manter minha renda", { civica: 2, assessor: 2 }],
        ["Uma reserva para alguns meses de dedicação", { vereador: 2, civica: 1 }],
        ["Bastante, e tenho quem possa apoiar", { estadual: 2, federal: 2 }],
      ],
    },
    {
      texto: "Qual é sua relação com partidos hoje?",
      opcoes: [
        ["Já sou filiado ou conheço gente de dentro", { vereador: 1, estadual: 1, federal: 1 }],
        ["Nenhuma, mas estou aberto a conhecer", { vereador: 1, assessor: 1 }],
        ["Nenhuma, e prefiro manter distância", { civica: 3 }],
      ],
    },
    {
      texto: "Como você prefere trabalhar?",
      opcoes: [
        ["Conversando, negociando e falando em público", { vereador: 1, estadual: 1, federal: 2 }],
        ["Construindo coisas e mostrando dados", { civica: 3 }],
        ["Ensinando e explicando temas difíceis", { federal: 1, vereador: 1, civica: 1 }],
        ["Observando por dentro antes de agir", { assessor: 3 }],
      ],
    },
  ],
};
