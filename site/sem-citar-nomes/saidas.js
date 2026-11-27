/*
  Sem citar nomes: textos em português.
  Regras (ver CLAUDE.md):
  - Nenhum nome de pessoa real. Cada arquétipo é um jeito de fazer política, e quem lê liga a quem quiser.
  - Zoar o jeito e o sistema, nunca insinuar crime (nada de "roubou", "desviou", "multiplicou dinheiro").
  - Referências de 1993 para cá, com obra e ano.
  - Toda saída tem a piada e um fecho que puxa a conversa para o sistema.
  A versão em inglês fica em saidas-en.js, com os mesmos ids.
*/
window.SEM_NOMES = {
  situacoes: [
    {
      id: "lado",
      rotulo: "Você é de esquerda ou de direita?",
      saidas: [
        { piada: "O Chapéu Seletor quis me pôr numa casa. Eu pedi a Lufa-Lufa, que é a casa de quem trabalha.", fecho: "Me pergunta o que eu faria com o imposto da sua conta de luz. Isso eu respondo.", ref: "harry-potter" },
        { piada: "Isso é Capitão América contra Homem de Ferro. Eu sou da turma que reconstrói a cidade depois da briga.", fecho: "A cidade quebrada é o hospital que demora e o cartório que cobra caro.", ref: "guerra-civil" },
        { piada: "Você quer saber se eu sou Pokémon de fogo ou de água. Eu quero saber quem apaga o incêndio.", fecho: "Lado não conserta fila do SUS. Conserta quem mede, testa e corrige.", ref: "pokemon" },
        { piada: "Se eu escolher um lado agora, vou ter que defender tudo que o time faz, até o gol contra.", fecho: "Prefiro escolher proposta por proposta e mostrar a conta de cada uma.", ref: "paredao" }
      ]
    },
    {
      id: "isentao",
      rotulo: "Me chamaram de isentão",
      saidas: [
        { piada: "Isentão eu queria ser no Imposto de Renda. Esse benefício ninguém me deu.", fecho: "Não fico em cima do muro. Fico em cima do problema, que é bem mais alto.", ref: "isentao" },
        { piada: "O Frodo também parecia isentão, quieto lá no Condado. E foi ele que topou levar o anel para destruir.", fecho: "O problema não é quem segura o anel. É um sistema que dá poder demais a qualquer um que segure.", ref: "anel" },
        { piada: "O Shrek também não queria entrar na briga do reino. Ele só queria o pântano dele em paz.", fecho: "No fim, quem resolveu a história foi quem estava longe da corte.", ref: "shrek" },
        { piada: "Não é isenção. É que eu leio a bula antes de tomar o remédio.", fecho: "Toda proposta que eu faço vem com a fonte e com as críticas mais duras junto.", ref: "nazare" }
      ]
    },
    {
      id: "governo",
      rotulo: "Fala mal do governo aí",
      saidas: [
        { piada: "Falar mal é fácil. Difícil é ser o Seu Barriga e cobrar 14 meses de aluguel sem ninguém se mudar da vila.", fecho: "O que eu critico é o imposto escondido no preço do arroz e da conta de luz. Esse vem de vários governos.", ref: "chaves" },
        { piada: "Todo governo tem um pouco de Buzz Lightyear: promete ir ao infinito e além e esquece de dizer quando.", fecho: "Quero promessa com prazo e com um número para conferir depois.", ref: "toy-story" },
        { piada: "Governo é igual Mágico de Oz: o bonito é o telão. Eu quero ver quem está puxando as alavancas.", fecho: "Conta pública aberta, na internet, para qualquer pessoa conferir.", ref: "oz" },
        { piada: "Eu falo igual ao crítico do Ratatouille: provo o prato e digo o que faltou.", fecho: "Crítica que não vem com receita de conserto é só reclamação.", ref: "ratatouille" }
      ]
    },
    {
      id: "outro-lado",
      rotulo: "E aquele outro lá, você defende?",
      saidas: [
        { piada: "Aquele-Que-Não-Deve-Ser-Nomeado? Toda família tem o seu, e cada um mora num lado da mesa.", fecho: "Não defendo pessoa. Defendo regra que vale para qualquer um que sentar na cadeira.", ref: "voldemort" },
        { piada: "Esse é o vilão do capítulo de hoje. Amanhã a novela congela a cara de outro, com o \"oi, oi, oi\" no fundo.", fecho: "Enquanto a gente assiste à novela, o problema de verdade fica sem capítulo.", ref: "avenida-brasil" },
        { piada: "Se eu falar o nome, ele aparece. É tipo Beetlejuice, mas no grupo da família.", fecho: "Quero falar do que muda na sua vida, não de quem está no meme.", ref: "voldemort" },
        { piada: "Eu não defendo nem ataco. Política virou paredão, e eu não quero ser eliminado no almoço de domingo.", fecho: "O que eu quero eliminar é fila, papelada e imposto escondido.", ref: "paredao" }
      ]
    },
    {
      id: "rico",
      rotulo: "E esse povo do mercado financeiro?",
      saidas: [
        { piada: "Você fala do Tio Patinhas? Ele nada na caixa-forte, mas a moeda nem sai de lá para virar fábrica.", fecho: "Dinheiro parado em juro alto não gera emprego em Goiás. Minha proposta é um fundo que investe em indústria.", ref: "tio-patinhas" },
        { piada: "O Tio Patinhas guarda a primeira moedinha até hoje. O brasileiro guarda o primeiro boleto.", fecho: "O juro é alto também porque ninguém confia que o governo entrega o que promete.", ref: "tio-patinhas" },
        { piada: "Não tenho nada contra quem tem caixa-forte. Tenho contra a regra que deixa só ele mergulhar.", fecho: "Crédito barato para quem produz é mudança de regra, não de pessoa.", ref: "tio-patinhas" }
      ]
    },
    {
      id: "salvador",
      rotulo: "Só fulano salva o Brasil",
      saidas: [
        { piada: "Salvador da pátria com estalo de dedo eu só vi no Thanos. E sumiu metade do universo.", fecho: "País não se conserta num estalo. Se conserta lei por lei, com resultado medido.", ref: "thanos" },
        { piada: "Toda eleição aparece um Neo dizendo que é o escolhido. Eu fico com o pessoal que conserta a nave.", fecho: "Quem salva o país é sistema que funciona mesmo quando o governante é ruim.", ref: "matrix" },
        { piada: "Os Simpsons já previram isso. Em todo episódio alguém promete resolver Springfield, e a usina continua igual.", fecho: "Me mostra o plano, o custo e como medir. Aí a gente conversa sobre quem.", ref: "simpsons" }
      ]
    },
    {
      id: "familia",
      rotulo: "O grupo da família pegou fogo",
      saidas: [
        { piada: "Grupo da família é Brasília em miniatura: um reino Tão Tão Distante onde todo mundo grita e ninguém vota projeto.", fecho: "Manda no grupo uma proposta com fonte. Briga com fonte rende muito menos.", ref: "shrek" },
        { piada: "Eu fiz igual ao Chaves: foi sem querer querendo, só mandei bom dia.", fecho: "Se quiser falar de política, me chama no privado e me diz qual problema te incomoda.", ref: "chaves" },
        { piada: "Antes de compartilhar, faz a cara da Nazaré fazendo conta. Se não fechar, não manda.", fecho: "Número sem fonte e sem ano é boato, venha de que lado vier.", ref: "nazare" },
        { piada: "Isso aqui virou Pokémon: cada um quer pegar todos para o seu lado.", fecho: "Eu não quero pegar ninguém. Quero que a pessoa saiba como cada partido votou e decida sozinha.", ref: "pokemon" }
      ]
    }
  ],
  arquetipos: [
    { id: "robin-hood", nome: "O Robin Hood", obra: "Shrek (2001)", jeito: "Promete tirar de quem tem muito para dar a quem tem pouco.", piada: "No Shrek ele chega cantando para salvar a princesa, e ela resolve sozinha.", sistema: "Distribuir sem saber quanto custa e de onde sai acaba pesando em quem trabalha." },
    { id: "tio-patinhas", nome: "O Tio Patinhas", obra: "DuckTales (2017)", jeito: "Acha que o país é uma caixa-forte e que bom mesmo é dinheiro guardado.", piada: "Nada nas moedas, mas a moeda não sai de lá.", sistema: "Dinheiro parado em juro alto não vira fábrica nem emprego." },
    { id: "voldemort", nome: "Aquele-Que-Não-Deve-Ser-Nomeado", obra: "Harry Potter (livro de 1997, filme de 2001)", jeito: "Qualquer nome que, só de falar, faz o almoço de domingo pegar fogo.", piada: "Toda família tem o seu, e cada um mora num lado da mesa.", sistema: "Quando a conversa é sobre uma pessoa, ninguém fala da regra que vale para todas." },
    { id: "harry-potter", nome: "O Chapéu Seletor", obra: "Harry Potter (livro de 1997, filme de 2001)", jeito: "Quem quer te pôr numa casa antes de você abrir a boca.", piada: "Eu peço a Lufa-Lufa, a casa de quem trabalha.", sistema: "Rótulo não diz o que a pessoa faria com o seu imposto." },
    { id: "thanos", nome: "O Thanos", obra: "Vingadores: Guerra Infinita (2018)", jeito: "Promete resolver tudo com um estalo de dedos.", piada: "Resolve, mas some metade de tudo que é vivo.", sistema: "Mudança grande sem teste e sem medir o custo é estalo no escuro." },
    { id: "oz", nome: "O Grande Oz", obra: "Oz: Mágico e Poderoso (2013)", jeito: "Discurso enorme, efeito especial, fumaça colorida.", piada: "Puxa a cortina e tem um senhor mexendo em alavanca.", sistema: "Conta pública aberta é a cortina puxada para todo mundo ver." },
    { id: "toy-story", nome: "O Buzz Lightyear", obra: "Toy Story (1995)", jeito: "Promete ir ao infinito e além.", piada: "Só esquece de dizer quando.", sistema: "Promessa boa tem prazo e um número para conferir depois." },
    { id: "chaves", nome: "O Seu Barriga", obra: "Chaves (no SBT desde 1984, na infância de quem nasceu nos anos 1990)", jeito: "Chega na vila sempre cobrando.", piada: "Cobra 14 meses de aluguel e ninguém se muda.", sistema: "O imposto vem escondido no preço de tudo, até do arroz, e quase ninguém sabe quanto paga." },
    { id: "anel", nome: "O Anel", obra: "O Senhor dos Anéis: A Sociedade do Anel (2001)", jeito: "O poder que muda qualquer um que segura.", piada: "Até o hobbit mais tranquilo fica esquisito.", sistema: "Em vez de procurar a pessoa certa para o anel, dá para fazer regra que limite o anel." },
    { id: "guerra-civil", nome: "O Time Cap contra o Time Homem de Ferro", obra: "Capitão América: Guerra Civil (2016)", jeito: "Dois heróis, cada um certo do seu jeito, quebrando a cidade.", piada: "Eu sou da turma que reconstrói depois.", sistema: "A conta da briga quem paga é quem mora na cidade." },
    { id: "avenida-brasil", nome: "O Vilão do Capítulo", obra: "Avenida Brasil (2012)", jeito: "Todo dia a política escolhe um vilão novo e congela a cara dele no fim.", piada: "Com o \"oi, oi, oi\" tocando no fundo.", sistema: "Novela prende a atenção, e o problema de verdade fica sem capítulo." },
    { id: "nazare", nome: "A Nazaré Fazendo Conta", obra: "Senhora do Destino (2004), que virou meme", jeito: "Quem joga um número no grupo sem dizer de onde veio.", piada: "Faz a cara da Nazaré: se a conta não fecha, não manda.", sistema: "Número sem fonte oficial e sem ano é boato." },
    { id: "pokemon", nome: "O Treinador Pokémon", obra: "Pokémon (na TV brasileira desde 1999)", jeito: "Quer pegar todos para o seu time.", piada: "E ainda pergunta se você é de fogo ou de água.", sistema: "Ninguém precisa de time. Precisa saber como cada partido votou de verdade." },
    { id: "matrix", nome: "O Escolhido", obra: "Matrix (1999)", jeito: "Aparece a cada eleição dizendo que só ele salva.", piada: "Eu fico com o pessoal que conserta a nave.", sistema: "País bom funciona mesmo quando o governante é ruim." },
    { id: "paredao", nome: "O Paredão", obra: "Big Brother Brasil (desde 2002)", jeito: "A política virou votar para eliminar alguém.", piada: "E eu não quero sair no almoço de domingo.", sistema: "Eliminar pessoa não muda a regra que fez o problema." }
  ]
};
