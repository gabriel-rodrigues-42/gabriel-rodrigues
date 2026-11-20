// Portfólio de ideias em inglês, para /en/ideias/ e a página inicial em inglês (/en/).
// É a tradução de ideias.js: mesmos ids, mesma ordem, mesmas hashtags. Mudou uma ideia em ideias.js?
// Mude aqui também. O formato é o mesmo (veja o topo de ideias.js). "estado" fica em português,
// porque o leitor usa ele para escolher a cor do selo e traduz o nome na tela.

window.HASHTAG_GERAL = "#SistemasMelhores";

window.IDEIAS = [
  {
    id: "reindustrializacao",
    hashtag: "#ReindustrializaBrasil",
    titulo: "Reindustrializing Brazil with money that already exists",
    estado: "rascunho",
    gancho: "The money to reindustrialize Brazil already exists. It's just sitting still.",
    problema: [
      "Brazil depends on other countries for what is strategic. Chips, medical equipment, batteries, digital platforms. When we buy them ready-made, the value, the patents and the good jobs stay abroad.",
      "People with very large fortunes almost never sell their own shares. They use the shares as collateral, borrow from the bank and live on that credit. That way they pay almost no tax.",
      "Taxing large fortunes usually hits two walls. Capital moves to another country, and wealth held in shares doesn't easily turn into tax without being sold.",
    ],
    proposta: [
      "Create the Sovereign Fund for Reindustrialization and Innovation, the FSRI. Investors keep borrowing with their shares as collateral. The difference is that the money goes to new industries and platforms in Brazil.",
      "In return, they get a progressive exemption on capital gains and dividend taxes. Only if the money stays invested for the minimum period, in real production in the country.",
      "Projects fall into three risk tiers. Digital platforms, basic industry and cutting-edge technology, such as chips. The State guarantees part of the loss: up to 20%, 35% or 50%, depending on the tier.",
      "Each contribution must pair a quick-return project with a long-term one. The quick one pays the loan interest. The long one builds the future.",
      "The money arrives through a public funnel. A national hackathon, four months of acceleration, a judging panel streamed live and funds released only against audited milestones.",
    ],
    criticas: [
      {
        critica: "This is a tax break for the rich.",
        resposta: "That wealth already pays little today, because it isn't sold. The fund's exemption only exists if the money turns into a new factory, patent or platform in Brazil.",
      },
      {
        critica: "The State will foot the bill when it goes wrong.",
        resposta: "Investors bear at least half of the loss, even in the worst case. The insurance only pays out on an audited bankruptcy, with no bad faith. And when a high-risk project succeeds, the State keeps 10% to 15%.",
      },
      {
        critica: "It will become a handout for the same old groups.",
        resposta: "Selection is public and streamed live. And investors can't put incentivized money into a company or sector they already control. The fund exists to create competitors.",
      },
      {
        critica: "Brazil can't compete in chips.",
        resposta: "That's why the chip tier has the longest term, 10 to 15 years, and the most protection. And it's mandatory, otherwise nobody would choose the hard bet.",
      },
    ],
    pergunta: "If you could choose one product for Brazil to start making here, what would it be?",
    links: [{ texto: "Read the full story", url: "/en/projetos/reindustrializacao/" }],
  },

  {
    id: "galera-club",
    hashtag: "#GaleraClub",
    titulo: "galera.club: a Brazilian platform that is already live",
    estado: "no ar",
    gancho: "A link-in-bio page made in Brazil, with Pix payments on the page and no fee per sale. I built it, and it is already live.",
    problema: [
      "People who sell in Brazil sell through Instagram and WhatsApp. The link in bio, which is that person's storefront, almost always belongs to a foreign company.",
      "Foreign tools charge in dollars and sell through credit cards. On Linktree, every sale pays 2.9% plus 30 US cents to Stripe, on any plan, according to Linktree's own help center, updated in October 2026.",
      "Meanwhile, Brazil created one of the best payment systems in the world. Pix has 154 million individual users, according to the Central Bank of Brazil, in October 2026. Most foreign platforms weren't built around it.",
    ],
    proposta: [
      "galera.club is a link-in-bio page made in Brazil. Each person gets an address with their own name, with links, products and prices.",
      "The Pix payment is generated on the page itself, following the Central Bank standard. The money goes straight from buyer to seller, with no middleman. The platform charges nothing per sale.",
      "The order arrives ready on WhatsApp or in the page's own chat, with answers the owner writes. And there's the Market, where people discover who sells in their own city.",
      "Version 2.60 was published at galera.club on November 16, 2026. There have been 67 versions since August. Every release backs up the database first and rolls back on its own if something goes wrong.",
      "It's the kind of platform the Sovereign Fund for Reindustrialization was designed to multiply. The more Brazilians' money flows through Brazilian tools, the more income and data stay here.",
    ],
    criticas: [
      {
        critica: "Linktree and lots of competitors already exist. Why one more?",
        resposta: "Because the product is centered on the way Brazilians buy. Pix with no platform fee, orders on WhatsApp and discovery by city. In foreign tools, that's an add-on or doesn't exist.",
      },
      {
        critica: "Why would anyone pay for this, if WhatsApp is free?",
        resposta: "Today nobody pays. Everything that helps you sell is free and will stay free. The planned paid plan sells looks and space, like removing the brand from the page. Never the tool for making money.",
      },
      {
        critica: "A Brazilian platform using WhatsApp, which is American?",
        resposta: "Fair point. WhatsApp is where customers already are, so it's an option. But the page has its own chat, and the owner chooses. The payment, which matters most, goes through Pix, which is Brazilian.",
      },
      {
        critica: "So is everything already Brazilian?",
        resposta: "Not yet, and I'd rather say so. Database backups live on Cloudflare, an American company. Moderation uses foreign artificial intelligence. Replacing that with national cloud and models costs money, and that's exactly what the fund's first tier should finance.",
      },
      {
        critica: "Moderation by artificial intelligence is censorship in disguise.",
        resposta: "On galera.club the machine only flags. People from the community decide, and no single person can take down anyone's post. The artificial intelligence looks for scams, hate and spam, not opinions.",
      },
      {
        critica: "A finished platform with no users proves nothing.",
        resposta: "True. The code is ready and live, what's missing is people. The next goal is to have many pages in a single city, starting with Goiânia, and to show the numbers in public.",
      },
    ],
    pergunta: "If a Brazilian tool did the same as a foreign one, without charging per sale, would you switch? What would make you stay with the foreign one?",
    links: [
      { texto: "Read the full project", url: "/en/projetos/galera-club/" },
      { texto: "See galera.club/gabriel", url: "https://galera.club/gabriel" },
    ],
  },

  {
    id: "leis-com-mentalidade-de-software",
    hashtag: "#LeiComMeta",
    titulo: "Laws with a software mindset",
    estado: "rascunho",
    gancho: "In software, nobody ships a change without knowing how to measure whether it worked. Why is it different with laws?",
    problema: [
      "A law is passed, makes headlines and then almost nobody follows up. Rarely does anyone say, beforehand, what result it needs to deliver.",
      "When it goes wrong, the law stays there. There is no scheduled moment to look at the data and decide whether it stays, changes or goes.",
    ],
    proposta: [
      "Bring into public service what works in software engineering. Every proposal with a measurable goal, with open data and a scheduled review date.",
      "The text of proposals stays public and versioned, like code. Anyone can see what changed from one version to the next and why.",
      "My plan is to prepare to run for a seat as federal representative for Goiás in 2030. Until then, the work is to build this in public, with open projects and explanations.",
    ],
    criticas: [
      {
        critica: "Law isn't code. Society isn't a system.",
        resposta: "I agree that people aren't machines. But every law has a goal, and a goal can be measured. Measuring means taking seriously the people the law is supposed to help.",
      },
      {
        critica: "Every politician promises to modernize and nothing changes.",
        resposta: "That's why the work starts before any term in office, open and verifiable. If what I publish doesn't make sense, you can see it and criticize it right now.",
      },
      {
        critica: "A developer doesn't understand politics.",
        resposta: "",
      },
    ],
    pergunta: "Which public system wastes most of your time? If you could fix one, which would it be?",
  },

  {
    id: "qual-caminho",
    hashtag: "#QualCaminho",
    titulo: "Which path makes sense for me?",
    estado: "em teste",
    gancho: "Lots of people want to improve Brazil and don't know where to start. What if there were an honest questionnaire, with real data?",
    problema: [
      "People who want to change something usually hear two pieces of advice: get into politics or forget about it. Almost nobody shows the paths in between, or what each one costs.",
      "The data exists, but it's scattered. How many votes you need, when you have to join a party, what each office really does.",
    ],
    proposta: [
      "An open questionnaire that asks about your time, your income, your profile and the issues that move you. At the end, it shows the paths that suit you, with numbers from Brazil's Superior Electoral Court.",
      "The paths go from city councilor to federal representative, but also include civic tech without an elected office and working inside government before any candidacy.",
      "The data lives in a single file. Anyone can adapt the questionnaire to their own city or state.",
    ],
    criticas: [
      {
        critica: "A questionnaire doesn't decide anyone's life.",
        resposta: "It really doesn't. It organizes the conversation and puts the numbers on the table. The decision is still up to whoever answers.",
      },
      {
        critica: "This is propaganda disguised as a tool.",
        resposta: "The questionnaire shows paths that involve no candidacy at all, and the code is open for anyone who wants to check or copy it.",
      },
    ],
    pergunta: "If you were to change a single thing in Brazil, where would you start?",
    links: [{ texto: "Take the questionnaire", url: "/en/caminho/" }],
  },

  {
    id: "canal-do-youtube",
    hashtag: "#BrasilExplicado",
    titulo: "Brazil explained simply",
    estado: "rascunho",
    gancho: "Do you know how a law is born? Almost nobody learned that in school, and it shapes everyone's life.",
    problema: [
      "The systems that affect our lives the most are the ones we understand the least. Taxes, elections, public health, how a law gets voted on.",
      "When nobody understands the system, it's easy to blame a person instead of fixing the process.",
    ],
    proposta: [
      "A channel that explains one Brazilian system at a time, simply, the way a teacher would. Always with sources, and without attacking people or parties.",
      "The format starts light. First the text read aloud with captions, like on this page. Clay animation comes later, once the ideas are sharp.",
      "Each video gets a reference page on the site, for anyone who wants to look it up and share it.",
    ],
    criticas: [
      {
        critica: "Too simple becomes shallow.",
        resposta: "Simple isn't shallow when every claim has a source. The goal is for people to understand enough to go look for the rest.",
      },
      {
        critica: "Yet another politics channel on YouTube.",
        resposta: "The idea is to explain systems, not comment on fights. If a video doesn't teach how something works, it doesn't go out.",
      },
    ],
    pergunta: "What topic about Brazil have you never quite understood and would like someone to explain?",
  },
];
