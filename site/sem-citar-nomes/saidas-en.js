/*
  No names: English texts. Same ids and rules as saidas.js (Portuguese is the source),
  but written for an English reader, not translated word for word.
  No real person's name. Mock the style and the system, never hint at a crime.
*/
window.SEM_NOMES = {
  situacoes: [
    {
      id: "lado",
      rotulo: "Are you left or right?",
      saidas: [
        { piada: "The Sorting Hat tried to put me in a house. I asked for Hufflepuff, the one that actually does the work.", fecho: "Ask me what I'd do about the tax on your power bill. That one I'll answer.", ref: "harry-potter" },
        { piada: "That's Team Cap versus Team Iron Man. I'm with the people who rebuild the city after the fight.", fecho: "The wrecked city is the hospital waiting list and the paperwork that costs a fortune.", ref: "guerra-civil" },
        { piada: "You want to know if I'm a fire type or a water type. I want to know who's putting out the fire.", fecho: "Picking a side doesn't shorten a hospital queue. Measuring, testing and fixing does.", ref: "pokemon" },
        { piada: "If I pick a side now, I have to defend everything my team does, own goals included.", fecho: "I'd rather judge one proposal at a time and show the numbers behind each one.", ref: "paredao" }
      ]
    },
    {
      id: "isentao",
      rotulo: "They called me a fence-sitter",
      saidas: [
        { piada: "In Portuguese the word is \"isentão\", the exempt guy. Funny, the taxman has never exempted me from anything.", fecho: "I'm not on the fence. I'm on the problem, and the problem is a lot taller.", ref: "isentao" },
        { piada: "Bruce Banner looks like a fence-sitter too, quiet in the corner. He only turns into the Hulk when he sees the price of rice.", fecho: "What makes me angry isn't the other side. It's paying taxes and still waiting hours at the health clinic.", ref: "isentao" },
        { piada: "Shrek didn't want to get dragged into the kingdom's fights either. He just wanted his swamp back.", fecho: "And in the end, the one who sorted things out lived nowhere near the palace.", ref: "shrek" },
        { piada: "I'm not sitting on the fence. I just read the label before I take the medicine.", fecho: "Every proposal I make comes with its sources and the toughest criticism right next to it.", ref: "nazare" }
      ]
    },
    {
      id: "governo",
      rotulo: "Go on, say something bad about the government",
      saidas: [
        { piada: "Complaining about the government is like complaining about Señor Barriga: he collects the rent every month, and the building keeps falling apart.", fecho: "What I complain about is the tax hidden in the price of rice and the power bill. Every government has kept it.", ref: "chaves" },
        { piada: "Every government has a bit of Buzz Lightyear in it: to infinity and beyond, no date given.", fecho: "I want promises with a deadline and a number you can check later.", ref: "toy-story" },
        { piada: "Government is like the Wizard of Oz: great light show. I want to see who's pulling the levers behind the curtain.", fecho: "Public accounts open online, for anyone to check.", ref: "oz" },
        { piada: "I'll do it like the food critic in Ratatouille: taste the dish, then say what's missing.", fecho: "Criticism without a recipe for fixing it is just complaining.", ref: "ratatouille" }
      ]
    },
    {
      id: "outro-lado",
      rotulo: "So, do you defend the other guy?",
      saidas: [
        { piada: "You mean He-Who-Must-Not-Be-Named? Every family has one. They just disagree on who it is.", fecho: "I don't defend people. I defend rules that apply to whoever sits in the chair.", ref: "voldemort" },
        { piada: "He's today's villain. Tomorrow the telenovela will end on a freeze-frame of someone else.", fecho: "While we watch the soap opera, the real problem never gets an episode.", ref: "avenida-brasil" },
        { piada: "Say his name and he appears. Like Beetlejuice, but in the family group chat.", fecho: "I'd rather talk about what changes in your life than about whoever's in the meme.", ref: "voldemort" },
        { piada: "I'm not defending or attacking. Politics has turned into an eviction vote, and I don't want to get voted off Sunday lunch.", fecho: "What I want to vote off is the queues, the paperwork and the hidden taxes.", ref: "paredao" }
      ]
    },
    {
      id: "rico",
      rotulo: "And what about the finance crowd?",
      saidas: [
        { piada: "You mean Scrooge McDuck? He dives into his money bin, but not one coin ever leaves to build a factory.", fecho: "Money parked at high interest rates doesn't create jobs in Goiás. My proposal is a fund that invests in industry.", ref: "tio-patinhas" },
        { piada: "Scrooge still has his Number One Dime. Most Brazilians still have their first unpaid bill.", fecho: "Interest rates are high partly because nobody trusts the government to deliver what it promises.", ref: "tio-patinhas" },
        { piada: "I've got nothing against people with a money bin. I'm against rules that only let them dive in.", fecho: "Cheap credit for people who make things is about changing the rules, not the people.", ref: "tio-patinhas" }
      ]
    },
    {
      id: "salvador",
      rotulo: "Only so-and-so can save Brazil",
      saidas: [
        { piada: "The only savior I've seen fix everything with a snap was Thanos. Half the universe disappeared.", fecho: "A country doesn't get fixed with a snap. It gets fixed one law at a time, with results you can measure.", ref: "thanos" },
        { piada: "Every election, some Neo shows up saying he's the One. I'm with the crew keeping the ship running.", fecho: "What saves a country is a system that works even when the person in charge doesn't.", ref: "matrix" },
        { piada: "The Simpsons saw this coming. Every few episodes someone promises to fix Springfield, and the power plant never changes.", fecho: "Show me the plan, the cost and how we'll measure it. Then we can talk about who.", ref: "simpsons" }
      ]
    },
    {
      id: "familia",
      rotulo: "The family group chat is on fire",
      saidas: [
        { piada: "The family group chat is Brasília in miniature, a kingdom of Far Far Away where everyone shouts and nobody passes a bill.", fecho: "Post a proposal with a source instead. Fights with sources die down a lot faster.", ref: "shrek" },
        { piada: "I pulled a Chavo: it was an accident on purpose. All I said was good morning.", fecho: "If you want to talk politics, message me and tell me which problem is bugging you.", ref: "chaves" },
        { piada: "Before you forward it, do the Confused Math Lady face. If the numbers don't add up, don't hit send.", fecho: "A number with no source and no year is a rumor, whichever side it comes from.", ref: "nazare" },
        { piada: "This chat has turned into Pokémon: everyone's trying to catch 'em all for their side.", fecho: "I'm not trying to catch anyone. I want people to see how each party actually voted and decide for themselves.", ref: "pokemon" }
      ]
    }
  ],
  arquetipos: [
    { id: "robin-hood", nome: "Robin Hood", obra: "Medieval English legend, retold in films and cartoons", jeito: "Promises to take from those who have a lot and give to those who have little.", piada: "Takes from the rich, gives to the poor, and Sherwood Forest never publishes its accounts.", sistema: "Handing money out without saying what it costs or where it comes from ends up landing on the people who work." },
    { id: "tio-patinhas", nome: "Scrooge McDuck", obra: "Disney comics (since 1947) and the DuckTales cartoon (1987)", jeito: "Treats the country like a money bin: the best money is money that sits still.", piada: "He dives into a mountain of gold coins, and not one of them ever leaves the bin.", sistema: "Money parked at high interest rates doesn't build factories or create jobs." },
    { id: "voldemort", nome: "He-Who-Must-Not-Be-Named", obra: "Harry Potter (book 1997, film 2001)", jeito: "Any name that turns Sunday lunch into a shouting match.", piada: "Every family has one. They just disagree on who it is.", sistema: "When the conversation is about one person, nobody talks about the rules that apply to everyone." },
    { id: "harry-potter", nome: "The Sorting Hat", obra: "Harry Potter (book 1997, film 2001)", jeito: "Sorts you into a house before you've said a word.", piada: "I'd ask for Hufflepuff, the house that actually does the work.", sistema: "A label tells you nothing about what someone would do with your taxes." },
    { id: "thanos", nome: "Thanos", obra: "Avengers: Infinity War (2018)", jeito: "Promises to fix everything with a snap of his fingers.", piada: "It works. Half of all life disappears.", sistema: "A sweeping change with no trial run and no price tag is a snap in the dark." },
    { id: "oz", nome: "The Wizard of Oz", obra: "The Wonderful Wizard of Oz (book 1900, film 1939)", jeito: "Booming voice, giant floating head, colored smoke.", piada: "Pull back the curtain and there's an old man working the levers.", sistema: "Public accounts open to everyone are the curtain pulled back." },
    { id: "toy-story", nome: "Buzz Lightyear", obra: "Toy Story (1995)", jeito: "Promises to go to infinity and beyond.", piada: "He just never says when.", sistema: "A good promise comes with a deadline and a number you can check later." },
    { id: "chaves", nome: "Señor Barriga", obra: "El Chavo del Ocho (Mexican sitcom, 1973), on Brazilian TV since 1984 as \"Chaves\"", jeito: "Turns up at the building every month to collect the rent.", piada: "Don Ramón owes him 14 months, and he still comes back every month to ask.", sistema: "Taxes are hidden in the price of everything, even rice, so almost nobody knows how much they pay." },
    { id: "guerra-civil", nome: "Team Cap vs. Team Iron Man", obra: "Captain America: Civil War (2016)", jeito: "Two heroes, each right in his own way, wrecking the city between them.", piada: "I'm with the people who rebuild afterwards.", sistema: "The people who live in the city end up paying for the fight." },
    { id: "avenida-brasil", nome: "The Villain of the Week", obra: "Avenida Brasil (2012), a hit Brazilian telenovela", jeito: "Every day politics picks a new villain and ends the episode on a freeze-frame of their face.", piada: "The show famously ended each episode on a freeze-frame to the \"oi, oi, oi\" theme.", sistema: "The drama keeps you watching, and the real problem never gets an episode." },
    { id: "nazare", nome: "The Confused Math Lady", obra: "A meme from the Brazilian telenovela Senhora do Destino (2004)", jeito: "Drops a number in the group chat without saying where it came from.", piada: "Make her face. If the numbers don't add up, don't hit send.", sistema: "A number without an official source and a year is a rumor." },
    { id: "pokemon", nome: "The Pokémon Trainer", obra: "Pokémon (Japanese cartoon, 1997; on Brazilian TV since 1999)", jeito: "Wants to catch 'em all for their own team.", piada: "Then asks whether you're a fire type or a water type.", sistema: "Nobody needs a team. People need to know how each party actually voted." },
    { id: "matrix", nome: "The One", obra: "The Matrix (1999)", jeito: "Shows up every election claiming to be the only one who can save us.", piada: "I'm with the crew keeping the ship running.", sistema: "A good country works even when the person in charge doesn't." },
    { id: "paredao", nome: "The Eviction Vote", obra: "Big Brother Brasil (since 2002), Brazil's Big Brother", jeito: "Politics has turned into voting someone off.", piada: "And I'd rather not get voted off Sunday lunch.", sistema: "Voting a person off doesn't change the rules that caused the problem." }
  ]
};
