// Propostas: a galeria de cartões da página inicial e de /projetos/ (componente <gr-propostas>, em
// /design-system/galeria.js). Uma entrada por proposta, na ordem em que aparecem. A primeira ganha o
// cartão grande. Os textos ficam aqui nos dois idiomas: mudou o português, mude o inglês junto.
//
// Campos:
// - id: o mesmo id de ideias.js, quando existir (a galeria não repete a ideia que já está aqui).
// - href: endereço em português. Em inglês, a galeria põe /en na frente.
// - img: miniatura em /projetos/img/ (SVG 700x560, fundo transparente, ilustração editorial plana
//   desenhada por scripts/miniaturas/desenhar.py com as cores de tokens.css). Sem imagem, usa
//   /projetos/img/ideia.svg.
// - cor: fundo do palco da miniatura. Uma de: verde, amarelo, azul, coral, turquesa, roxo.
// - tipo: projeto, ferramenta ou ideia (vira o selo do cartão).
// - fase: em que ponto está. 1 Ideia, 2 Estudo, 3 Proposta, 4 No ar.
// - titulo, gancho: { pt, en }. Gancho curto: no celular aparecem só três linhas.
//
// Ideias novas de ideias.js entram sozinhas no fim da galeria (fase 1, imagem padrão).
// Quando ganharem página e miniatura própria, entram aqui.

window.PROPOSTAS = [
  {
    id: "galera-club",
    href: "/projetos/galera-club/",
    img: "/projetos/img/galera-club.svg",
    cor: "verde",
    tipo: "projeto",
    fase: 4,
    titulo: { pt: "galera.club: uma plataforma brasileira que já está no ar", en: "galera.club: a Brazilian platform that is already live" },
    gancho: {
      pt: "Uma plataforma brasileira de link na bio, com Pix na página e pedido no WhatsApp, sem taxa por venda.",
      en: "A Brazilian link-in-bio platform, with Pix payments on the page and orders via WhatsApp, with no fee per sale.",
    },
  },
  {
    id: "reindustrializacao",
    href: "/projetos/reindustrializacao/",
    img: "/projetos/img/reindustrializacao.svg",
    cor: "amarelo",
    tipo: "projeto",
    fase: 3,
    titulo: { pt: "Reindustrializar o Brasil com o dinheiro que já existe", en: "Reindustrializing Brazil with money that already exists" },
    gancho: {
      pt: "Como fazer o crédito que os grandes patrimônios já usam virar fábrica, patente e plataforma brasileira.",
      en: "How to turn the credit that large fortunes already use into Brazilian factories, patents and platforms.",
    },
  },
  {
    id: "desafio-dumont",
    href: "/projetos/desafio-dumont/",
    img: "/projetos/img/desafio-dumont.svg",
    cor: "coral",
    tipo: "projeto",
    fase: 3,
    titulo: { pt: "Desafio Dumont: um carro brasileiro modular", en: "Dumont Challenge: a modular Brazilian car" },
    gancho: {
      pt: "Um desafio aberto para criar um carro simples, fácil de consertar e de personalizar, com oficinas pelo país.",
      en: "An open challenge to build a simple car that is easy to repair and customize, with workshops across the country.",
    },
  },
  {
    id: "cartorio-digital",
    href: "/projetos/cartorio-digital/",
    img: "/projetos/img/cartorio-digital.svg",
    cor: "azul",
    tipo: "projeto",
    fase: 3,
    titulo: { pt: "Cartório digital: o imóvel no seu nome num balcão só", en: "Digital notary office: your property in your name at one counter" },
    gancho: {
      pt: "Passar um imóvel para o seu nome leva 14 etapas e uns 5% do valor. Para onde vai cada real, e como simplificar.",
      en: "Putting a property in your name takes 14 steps and about 5% of its value. Where each real goes, and how to simplify it.",
    },
  },
  {
    id: "qual-caminho",
    href: "/caminho/",
    img: "/projetos/img/qual-caminho.svg",
    cor: "turquesa",
    tipo: "ferramenta",
    fase: 4,
    titulo: { pt: "Qual caminho faz sentido pra mim?", en: "Which path makes sense for me?" },
    gancho: {
      pt: "Sete perguntas para quem quer melhorar o Brasil e não sabe por onde começar, com dados da sua cidade.",
      en: "Seven questions for anyone who wants to improve Brazil and doesn't know where to start, with data from their city.",
    },
  },
  {
    id: "leis-com-mentalidade-de-software",
    href: "/ideias/#leis-com-mentalidade-de-software",
    img: "/projetos/img/leis-com-mentalidade-de-software.svg",
    cor: "roxo",
    tipo: "ideia",
    fase: 1,
    titulo: { pt: "Leis com mentalidade de software", en: "Laws with a software mindset" },
    gancho: {
      pt: "Ninguém põe um sistema no ar sem saber medir se ele funcionou. Por que com as leis é diferente?",
      en: "Nobody ships software without knowing how to measure whether it worked. Why is it different with laws?",
    },
  },
  {
    id: "canal-do-youtube",
    href: "/ideias/#canal-do-youtube",
    img: "/projetos/img/canal-do-youtube.svg",
    cor: "amarelo",
    tipo: "ideia",
    fase: 2,
    titulo: { pt: "O Brasil explicado de um jeito simples", en: "Brazil explained simply" },
    gancho: {
      pt: "Você sabe como nasce uma lei? Vídeos curtos para entender os sistemas que decidem a vida de todo mundo.",
      en: "Do you know how a law is made? Short videos to understand the systems that shape everyone's life.",
    },
  },
];
