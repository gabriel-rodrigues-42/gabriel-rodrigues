// Portfólio de ideias do Gabriel.
// A página /ideias/ lê este arquivo, mostra cada ideia e lê tudo em voz alta com legendas.
//
// COMO EDITAR
// - Cada ideia é um bloco { ... } dentro da lista. A ordem aqui é a ordem na página e no "Ouvir todas".
// - Escreva frases curtas. Cada frase vira uma legenda na tela, então uma frase longa vira uma legenda longa.
// - Cada item de "problema" e "proposta" é um parágrafo.
// - "criticas" é a parte que deixa a ideia à prova de crítica: escreva a crítica mais dura que alguém
//   faria nos comentários e a sua resposta honesta. Se ainda não tem resposta, deixe resposta: "" e a
//   página mostra "Resposta em construção".
// - "pergunta" fecha a ideia com uma pergunta para puxar conversa nas redes.
// - "hashtag" fecha a ideia: é a tag para as pessoas postarem e conversarem sobre ela. Uma por ideia,
//   sem espaço e sem acento (ex.: "#GaleraClub"). A HASHTAG_GERAL entra junto em todas.
// - "estado" aparece no selo: "rascunho", "em teste" ou "pronta para postar".
// - Números sempre com fonte e ano, no próprio texto.
// - Pré-campanha: nada de pedido de voto, número de urna ou ataque a pessoas e partidos. Critique sistemas.

// Hashtag comum a todas as ideias, para juntar a conversa num lugar só.
window.HASHTAG_GERAL = "#SistemasMelhores";

window.IDEIAS = [
  {
    id: "reindustrializacao",
    hashtag: "#ReindustrializaBrasil",
    titulo: "Reindustrializar o Brasil com o dinheiro que já existe",
    estado: "rascunho",
    gancho: "O dinheiro para reindustrializar o Brasil já existe. Ele só está parado.",
    problema: [
      "O Brasil depende de fora para o que é estratégico. Chips, equipamentos médicos, baterias, plataformas digitais. Quando a gente compra pronto, o valor, as patentes e os bons empregos ficam lá fora.",
      "Quem tem um patrimônio muito grande quase nunca vende as próprias ações. Usa as ações como garantia, pega crédito no banco e vive desse crédito. Assim quase não paga imposto.",
      "Taxar grandes fortunas costuma esbarrar em duas paredes. O capital muda de país, e patrimônio em ações não vira imposto fácil sem ser vendido.",
    ],
    proposta: [
      "Criar o Fundo Soberano de Reindustrialização e Inovação, o FSRI. O investidor continua tomando crédito com as ações como garantia. A diferença é que o dinheiro vai para indústrias e plataformas novas no Brasil.",
      "Em troca, ele ganha isenção progressiva no imposto sobre ganho de capital e sobre dividendos. Só se o dinheiro ficar investido pelo prazo mínimo, em produção real no país.",
      "Os projetos ficam em três faixas de risco. Plataformas digitais, indústria de base e tecnologia de ponta, como chips. O Estado garante parte do prejuízo: até 20%, 35% ou 50%, conforme a faixa.",
      "Cada aporte precisa ter um projeto de retorno rápido e um de longo prazo. O rápido paga os juros do empréstimo. O longo constrói o futuro.",
      "O dinheiro chega por um funil público. Hackathon nacional, quatro meses de aceleração, banca transmitida ao vivo e liberação só por metas auditadas.",
    ],
    criticas: [
      {
        critica: "Isso é isenção de imposto para rico.",
        resposta: "Esse patrimônio já paga pouco hoje, porque não é vendido. A isenção do fundo só existe se o dinheiro virar fábrica, patente ou plataforma nova no Brasil.",
      },
      {
        critica: "O Estado vai pagar a conta quando der errado.",
        resposta: "O investidor arca com pelo menos metade do prejuízo, mesmo no pior caso. O seguro só paga em falência auditada, sem má-fé. E quando um projeto de alto risco dá certo, o Estado fica com 10% a 15%.",
      },
      {
        critica: "Vai virar cabide para os mesmos grupos de sempre.",
        resposta: "A seleção é pública e transmitida ao vivo. E o investidor não pode aplicar dinheiro incentivado em empresa ou setor onde já tem controle. O fundo existe para criar concorrentes.",
      },
      {
        critica: "O Brasil não tem como competir em chip.",
        resposta: "Por isso a faixa de chips tem o prazo mais longo, de 10 a 15 anos, e a maior proteção. E é obrigatória, senão ninguém escolheria a aposta difícil.",
      },
    ],
    pergunta: "Se você pudesse escolher um produto que o Brasil passasse a fabricar aqui, qual seria?",
    links: [{ texto: "Ler a história completa", url: "/projetos/reindustrializacao/" }],
  },

  {
    id: "galera-club",
    hashtag: "#GaleraClub",
    titulo: "galera.club",
    estado: "rascunho",
    gancho: "E se o link na bio do pequeno negócio já vendesse pelo WhatsApp e pelo Pix?",
    problema: [
      "Quem vende no Brasil vende pelo Instagram e pelo WhatsApp. O cliente vê a foto, chama no privado, pergunta o preço e espera a resposta.",
      "As ferramentas de link na bio mais usadas foram feitas lá fora. Elas mostram uma lista de links, mas não sabem o que é Pix, não montam um pedido e não ajudam ninguém a ser encontrado na própria cidade.",
    ],
    proposta: [
      "O galera.club é uma página para cada pessoa ou negócio. Ela mostra o catálogo, monta o pedido e manda tudo pronto para o WhatsApp, com o pagamento por Pix.",
      "Além da página, existe um mural da cidade, onde as pessoas descobrem quem vende perto delas. O mural é moderado com ajuda de inteligência artificial, com regras públicas.",
      "A ideia começa por Goiânia. Primeiro dar certo numa cidade, depois crescer.",
    ],
    criticas: [
      {
        critica: "Já existe Linktree e um monte de concorrente. Por que mais um?",
        resposta: "Porque nenhum deles foi pensado para o jeito que o brasileiro compra. Pedido no WhatsApp, pagamento no Pix e descoberta local são o centro do produto, não um extra.",
      },
      {
        critica: "Moderação por inteligência artificial é censura disfarçada.",
        resposta: "As regras do mural ficam públicas, e qualquer decisão da máquina pode ser revista por uma pessoa. A inteligência artificial filtra golpe e spam, não opinião.",
      },
      {
        critica: "Por que alguém pagaria por isso, se o WhatsApp é de graça?",
        resposta: "",
      },
    ],
    pergunta: "Você compraria de uma loja que só tem um link na bio? O que faria você confiar nela?",
    links: [{ texto: "galera.club/gabriel", url: "https://galera.club/gabriel" }],
  },

  {
    id: "leis-com-mentalidade-de-software",
    hashtag: "#LeiComMeta",
    titulo: "Leis com mentalidade de software",
    estado: "rascunho",
    gancho: "No software, ninguém coloca uma mudança no ar sem saber como medir se ela funcionou. Por que com as leis é diferente?",
    problema: [
      "Uma lei é aprovada, vira manchete e depois quase ninguém acompanha. Raramente se diz, antes, qual resultado ela precisa entregar.",
      "Quando dá errado, a lei continua lá. Não existe um momento marcado para olhar os dados e decidir se ela fica, muda ou sai.",
    ],
    proposta: [
      "Levar para o serviço público o que funciona em engenharia de software. Toda proposta com um objetivo que dá para medir, com os dados abertos e com uma data marcada para revisão.",
      "O texto das propostas fica público e versionado, como código. Qualquer pessoa pode ver o que mudou de uma versão para outra e por quê.",
      "Meu plano é me preparar para disputar uma vaga de deputado federal por Goiás em 2030. Até lá, o trabalho é construir isso em público, com projetos e explicações abertas.",
    ],
    criticas: [
      {
        critica: "Lei não é código. Sociedade não é sistema.",
        resposta: "Concordo que pessoas não são máquinas. Mas toda lei tem um objetivo, e um objetivo pode ser medido. Medir não é desumanizar, é levar a sério quem a lei deveria ajudar.",
      },
      {
        critica: "Todo político promete modernizar e nada muda.",
        resposta: "Por isso o trabalho começa antes de qualquer mandato, aberto e verificável. Se o que eu publico não fizer sentido, dá para ver e criticar desde já.",
      },
      {
        critica: "Um desenvolvedor não entende de política.",
        resposta: "",
      },
    ],
    pergunta: "Qual sistema público mais te faz perder tempo? Se você pudesse consertar um, qual seria?",
  },

  {
    id: "qual-caminho",
    hashtag: "#QualCaminho",
    titulo: "Qual caminho faz sentido pra mim?",
    estado: "em teste",
    gancho: "Muita gente quer melhorar o Brasil e não sabe por onde começar. E se existisse um questionário honesto, com dados de verdade?",
    problema: [
      "Quem quer mudar alguma coisa costuma ouvir dois conselhos: entra na política ou esquece. Quase ninguém mostra os caminhos do meio, nem quanto custa cada um.",
      "Os dados existem, mas estão espalhados. Quantos votos são precisos, quando é preciso se filiar a um partido, o que cada cargo realmente faz.",
    ],
    proposta: [
      "Um questionário aberto que pergunta sobre o seu tempo, a sua renda, o seu perfil e os temas que te movem. No fim, ele mostra os caminhos que combinam com você, com os números do Tribunal Superior Eleitoral.",
      "Os caminhos vão de vereador a deputado federal, mas também incluem tecnologia cívica sem mandato e trabalhar por dentro do governo antes de qualquer candidatura.",
      "Os dados ficam num único arquivo. Qualquer pessoa pode adaptar o questionário para a própria cidade ou estado.",
    ],
    criticas: [
      {
        critica: "Um questionário não decide a vida de ninguém.",
        resposta: "Não decide mesmo. Ele organiza a conversa e coloca os números na mesa. A decisão continua sendo de quem responde.",
      },
      {
        critica: "Isso é propaganda disfarçada de ferramenta.",
        resposta: "O questionário mostra caminhos que não passam por candidatura nenhuma, e o código é aberto para quem quiser conferir ou copiar.",
      },
    ],
    pergunta: "Se você fosse mudar uma única coisa no Brasil, por onde começaria?",
    links: [{ texto: "Responder o questionário", url: "/caminho/" }],
  },

  {
    id: "canal-do-youtube",
    hashtag: "#BrasilExplicado",
    titulo: "O Brasil explicado de um jeito simples",
    estado: "rascunho",
    gancho: "Você sabe como nasce uma lei? Quase ninguém aprendeu isso na escola, e isso decide a vida de todo mundo.",
    problema: [
      "Os sistemas que mais afetam a nossa vida são os que menos entendemos. Imposto, eleição, saúde pública, como uma lei é votada.",
      "Quando ninguém entende o sistema, fica fácil culpar uma pessoa em vez de consertar o processo.",
    ],
    proposta: [
      "Um canal que explica um sistema do Brasil por vez, de forma simples, como um professor explicaria. Sempre com fonte, e sem atacar pessoas ou partidos.",
      "O formato começa leve. Primeiro o texto lido em voz alta com legendas, como nesta página. A animação em massinha vem depois, quando as ideias estiverem afiadas.",
      "Cada vídeo ganha uma página de referência no site, para quem quiser consultar e compartilhar.",
    ],
    criticas: [
      {
        critica: "Simples demais vira raso.",
        resposta: "Simples não é raso quando cada afirmação tem fonte. O objetivo é que a pessoa entenda o bastante para ir atrás do resto.",
      },
      {
        critica: "Mais um canal de política no YouTube.",
        resposta: "A proposta é explicar sistemas, não comentar briga. Se um vídeo não ensina como algo funciona, ele não sai.",
      },
    ],
    pergunta: "Que tema do Brasil você nunca entendeu direito e gostaria que alguém explicasse?",
  },
];
