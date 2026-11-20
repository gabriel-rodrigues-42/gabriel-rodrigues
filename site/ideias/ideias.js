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
// - "estado" aparece no selo: "rascunho", "em teste", "pronta para postar" ou "no ar" (já funciona de verdade).
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
      "O dinheiro chega por um funil público. Maratona nacional de inovação, quatro meses de aceleração, banca transmitida ao vivo e liberação só por metas auditadas.",
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
    titulo: "galera.club: uma plataforma brasileira que já está no ar",
    estado: "no ar",
    gancho: "Uma página de link na bio feita no Brasil, com Pix na página e sem taxa por venda. Eu construí, e ela já está no ar.",
    problema: [
      "Quem vende no Brasil vende pelo Instagram e pelo WhatsApp. O link na bio, que é a vitrine dessa pessoa, quase sempre é de uma empresa de fora.",
      "As ferramentas estrangeiras cobram em dólar e vendem pelo cartão. No Linktree, toda venda paga 2,9% mais 30 centavos de dólar ao Stripe, em qualquer plano, segundo a central de ajuda do próprio Linktree, atualizada em outubro de 2026.",
      "Enquanto isso, o Brasil criou um dos melhores sistemas de pagamento do mundo. O Pix tem 154 milhões de usuários pessoas físicas, segundo o Banco Central, em outubro de 2026. A maioria das plataformas de fora não foi feita em volta dele.",
    ],
    proposta: [
      "O galera.club é uma página de link na bio feita no Brasil. Cada pessoa ganha um endereço com o próprio nome, com links, produtos e preços.",
      "O Pix é gerado na própria página, no padrão do Banco Central. O dinheiro vai direto do comprador para o vendedor, sem intermediário. A plataforma não cobra nada por venda.",
      "O pedido chega pronto no WhatsApp ou num chat próprio da página, com respostas que o dono escreve. E existe o Mercado, onde as pessoas descobrem quem vende na própria cidade.",
      "A versão 2.60 foi publicada em galera.club em 16 de novembro de 2026. Foram 67 versões desde agosto. Cada publicação faz backup do banco antes e volta sozinha se algo der errado.",
      "É o tipo de plataforma que o Fundo Soberano de Reindustrialização foi pensado para multiplicar. Quanto mais o dinheiro do brasileiro passa por ferramentas brasileiras, mais renda e mais dados ficam aqui.",
    ],
    criticas: [
      {
        critica: "Já existe Linktree e um monte de concorrente. Por que mais um?",
        resposta: "Porque o centro do produto é o jeito que o brasileiro compra. Pix sem taxa da plataforma, pedido no WhatsApp e descoberta por cidade. Nas ferramentas de fora, isso é extra ou não existe.",
      },
      {
        critica: "Por que alguém pagaria por isso, se o WhatsApp é de graça?",
        resposta: "Hoje ninguém paga. Tudo que ajuda a vender é grátis e vai continuar grátis. O plano pago planejado vende aparência e espaço, como tirar a marca da página. Nunca a ferramenta de ganhar dinheiro.",
      },
      {
        critica: "Plataforma brasileira usando WhatsApp, que é americano?",
        resposta: "É justo. O WhatsApp é onde o cliente já está, então ele é uma opção. Mas a página tem um chat próprio, e o dono escolhe. O pagamento, que é o que mais importa, passa pelo Pix, que é brasileiro.",
      },
      {
        critica: "Então tudo já é brasileiro?",
        resposta: "Ainda não, e eu prefiro dizer. Os backups do banco ficam na Cloudflare, uma empresa americana. A moderação usa inteligência artificial de fora. Trocar isso por nuvem e modelos nacionais custa dinheiro, e é exatamente o que a primeira faixa do fundo deveria financiar.",
      },
      {
        critica: "Moderação por inteligência artificial é censura disfarçada.",
        resposta: "No galera.club a máquina só sinaliza. Quem decide são pessoas da comunidade, e uma pessoa sozinha não derruba a publicação de ninguém. A inteligência artificial procura golpe, ódio e spam, não opinião.",
      },
      {
        critica: "Plataforma pronta sem gente usando não prova nada.",
        resposta: "Verdade. O código está pronto e no ar, o que falta é gente. A próxima meta é ter muitas páginas numa mesma cidade, começando por Goiânia, e mostrar os números em público.",
      },
    ],
    pergunta: "Se uma ferramenta brasileira fizesse o mesmo que uma estrangeira, sem cobrar por venda, você trocaria? O que te faria ficar na de fora?",
    links: [
      { texto: "Ler o projeto completo", url: "/projetos/galera-club/" },
      { texto: "Ver galera.club/gabriel", url: "https://galera.club/gabriel" },
    ],
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
        resposta: "Concordo que pessoas não são máquinas. Mas toda lei tem um objetivo, e um objetivo pode ser medido. Medir é levar a sério quem a lei deveria ajudar.",
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
