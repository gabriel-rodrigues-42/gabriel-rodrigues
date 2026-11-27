/*
  No names: English texts. Same ids and rules as saidas.js (Portuguese is the source).
  No real person's name. Mock the style and the system, never hint at a crime.
*/
window.SEM_NOMES = {
  situacoes: [
    {
      id: "lado",
      rotulo: "Are you left or right?",
      saidas: [
        { piada: "The Sorting Hat wanted to put me in a house. I asked for Hufflepuff, the house of people who work.", fecho: "Ask me what I'd do about the tax on your power bill. That one I'll answer.", ref: "harry-potter" },
        { piada: "That's Captain America against Iron Man. I'm with the crew that rebuilds the city after the fight.", fecho: "The broken city is the slow hospital and the expensive registry office.", ref: "guerra-civil" },
        { piada: "You want to know if I'm a fire or a water Pokémon. I want to know who puts out the fire.", fecho: "A side doesn't fix the public health queue. Measuring, testing and fixing does.", ref: "pokemon" },
        { piada: "If I pick a side now, I have to defend everything the team does, own goals included.", fecho: "I'd rather pick proposal by proposal and show the math for each one.", ref: "paredao" }
      ]
    },
    {
      id: "isentao",
      rotulo: "They called me a fence-sitter",
      saidas: [
        { piada: "The only exemption I want is on my income tax. Nobody gave me that one.", fecho: "I'm not on the fence. I'm on top of the problem, which is a lot higher.", ref: "isentao" },
        { piada: "Sam looked like a fence-sitter too. He held the Ring and gave it back.", fecho: "The problem isn't who holds the Ring. It's a system that gives too much power to anyone who holds it.", ref: "anel" },
        { piada: "Shrek didn't want to join the kingdom's fight either. He just wanted his swamp in peace.", fecho: "In the end, the one who fixed the story lived far from the court.", ref: "shrek" },
        { piada: "It's not sitting on the fence. I just read the label before taking the medicine.", fecho: "Every proposal I make comes with its source and the toughest criticism next to it.", ref: "nazare" }
      ]
    },
    {
      id: "governo",
      rotulo: "Come on, trash the government",
      saidas: [
        { piada: "Trashing is easy. Hard is being Señor Barriga, owed 14 months of rent while nobody leaves the vecindad.", fecho: "What I criticize is the tax hidden in the price of rice and the power bill. That comes from many governments.", ref: "chaves" },
        { piada: "Every government is a bit of Buzz Lightyear: it promises to go to infinity and beyond and forgets to say when.", fecho: "I want promises with a deadline and a number to check later.", ref: "toy-story" },
        { piada: "Government is like the Wizard of Oz: the big screen is pretty. I want to see who's pulling the levers.", fecho: "Open public accounts, online, for anyone to check.", ref: "oz" },
        { piada: "I talk like the critic in Ratatouille: I taste the dish and say what was missing.", fecho: "Criticism without a recipe to fix it is just complaining.", ref: "ratatouille" }
      ]
    },
    {
      id: "outro-lado",
      rotulo: "What about that other guy, do you defend him?",
      saidas: [
        { piada: "He-Who-Must-Not-Be-Named? Every family has one, and each one sits on a different side of the table.", fecho: "I don't defend people. I defend rules that apply to whoever sits in the chair.", ref: "voldemort" },
        { piada: "That's today's villain. Tomorrow the soap opera freezes on someone else's face, with the \"oi, oi, oi\" song playing.", fecho: "While we watch the soap opera, the real problem gets no episode.", ref: "avenida-brasil" },
        { piada: "Say his name and he shows up. Like Beetlejuice, but in the family group chat.", fecho: "I want to talk about what changes in your life, not about who's in the meme.", ref: "voldemort" },
        { piada: "I don't defend or attack. Politics became an eviction vote, and I don't want to be evicted from Sunday lunch.", fecho: "What I want to evict is queues, paperwork and hidden taxes.", ref: "paredao" }
      ]
    },
    {
      id: "rico",
      rotulo: "What about the financial market crowd?",
      saidas: [
        { piada: "You mean Scrooge McDuck? He swims in the money bin, but the coins never leave it to become a factory.", fecho: "Money sitting on high interest doesn't create jobs in Goiás. My proposal is a fund that invests in industry.", ref: "tio-patinhas" },
        { piada: "Scrooge still keeps his first dime. Brazilians still keep their first unpaid bill.", fecho: "Interest is high partly because nobody trusts the government to deliver what it promises.", ref: "tio-patinhas" },
        { piada: "I have nothing against people with a money bin. I'm against the rule that only lets them dive in.", fecho: "Cheap credit for people who produce is a change of rules, not of people.", ref: "tio-patinhas" }
      ]
    },
    {
      id: "salvador",
      rotulo: "Only so-and-so can save Brazil",
      saidas: [
        { piada: "The only snap-of-the-fingers savior I've seen is Thanos. And half the universe vanished.", fecho: "A country isn't fixed with a snap. It's fixed law by law, with measured results.", ref: "thanos" },
        { piada: "Every election a Neo shows up saying he's the chosen one. I'm with the crew fixing the ship.", fecho: "What saves a country is a system that works even when the leader is bad.", ref: "matrix" },
        { piada: "The Simpsons predicted this. Every episode someone promises to fix Springfield, and the power plant stays the same.", fecho: "Show me the plan, the cost and how to measure it. Then we can talk about who.", ref: "simpsons" }
      ]
    },
    {
      id: "familia",
      rotulo: "The family group chat is on fire",
      saidas: [
        { piada: "The family group is Brasília in miniature: a Far Far Away kingdom where everyone shouts and nobody votes on a bill.", fecho: "Post a proposal with a source in the group. Fights with sources last much less.", ref: "shrek" },
        { piada: "I did what El Chavo does: it was an accident on purpose, I only said good morning.", fecho: "If you want to talk politics, message me privately and tell me which problem bothers you.", ref: "chaves" },
        { piada: "Before forwarding, do the confused math lady face. If it doesn't add up, don't send it.", fecho: "A number without a source and a year is a rumor, whichever side it comes from.", ref: "nazare" },
        { piada: "This turned into Pokémon: everyone wants to catch 'em all for their side.", fecho: "I don't want to catch anyone. I want people to see how each party voted and decide on their own.", ref: "pokemon" }
      ]
    }
  ],
  arquetipos: [
    { id: "robin-hood", nome: "Robin Hood", obra: "Shrek (2001)", jeito: "Promises to take from those who have a lot and give to those who have little.", piada: "In Shrek he shows up singing to rescue the princess, and she handles it herself.", sistema: "Handing out without knowing the cost or where it comes from ends up weighing on people who work." },
    { id: "tio-patinhas", nome: "Scrooge McDuck", obra: "DuckTales (2017)", jeito: "Thinks the country is a money bin and that saved money is what really matters.", piada: "Swims in the coins, but the coins never leave.", sistema: "Money sitting on high interest doesn't become factories or jobs." },
    { id: "voldemort", nome: "He-Who-Must-Not-Be-Named", obra: "Harry Potter (book 1997, film 2001)", jeito: "Any name that sets Sunday lunch on fire just by being said.", piada: "Every family has one, and each one sits on a different side of the table.", sistema: "When the talk is about one person, nobody talks about the rule that applies to everyone." },
    { id: "harry-potter", nome: "The Sorting Hat", obra: "Harry Potter (book 1997, film 2001)", jeito: "Whoever wants to put you in a house before you open your mouth.", piada: "I ask for Hufflepuff, the house of people who work.", sistema: "A label doesn't tell you what someone would do with your taxes." },
    { id: "thanos", nome: "Thanos", obra: "Avengers: Infinity War (2018)", jeito: "Promises to fix everything with a snap of the fingers.", piada: "It works, but half of everything alive vanishes.", sistema: "A big change with no test and no cost estimate is a snap in the dark." },
    { id: "oz", nome: "The Great Oz", obra: "Oz the Great and Powerful (2013)", jeito: "Huge speeches, special effects, colored smoke.", piada: "Pull the curtain and there's a man working levers.", sistema: "Open public accounts are the curtain pulled back for everyone." },
    { id: "toy-story", nome: "Buzz Lightyear", obra: "Toy Story (1995)", jeito: "Promises to go to infinity and beyond.", piada: "He just forgets to say when.", sistema: "A good promise has a deadline and a number to check later." },
    { id: "chaves", nome: "Señor Barriga", obra: "El Chavo (on Brazilian TV since 1984, the childhood of anyone born in the 1990s)", jeito: "Always shows up at the vecindad to collect.", piada: "He's owed 14 months of rent and nobody moves out.", sistema: "Tax is hidden in the price of everything, even rice, and almost nobody knows how much they pay." },
    { id: "anel", nome: "The Ring", obra: "The Lord of the Rings: The Fellowship of the Ring (2001)", jeito: "The power that changes anyone who holds it.", piada: "Even the calmest hobbit gets weird.", sistema: "Instead of looking for the right person for the Ring, you can write rules that limit the Ring." },
    { id: "guerra-civil", nome: "Team Cap vs Team Iron Man", obra: "Captain America: Civil War (2016)", jeito: "Two heroes, each right in their own way, wrecking the city.", piada: "I'm with the crew that rebuilds afterwards.", sistema: "The people who live in the city pay for the fight." },
    { id: "avenida-brasil", nome: "The Villain of the Episode", obra: "Avenida Brasil (2012), a Brazilian soap opera", jeito: "Every day politics picks a new villain and freezes on their face at the end.", piada: "With the \"oi, oi, oi\" song playing.", sistema: "The soap opera holds your attention, and the real problem gets no episode." },
    { id: "nazare", nome: "The Confused Math Lady", obra: "Senhora do Destino (2004), a soap opera that became a meme", jeito: "Whoever drops a number in the group without saying where it came from.", piada: "Make her face: if the math doesn't add up, don't send it.", sistema: "A number without an official source and a year is a rumor." },
    { id: "pokemon", nome: "The Pokémon Trainer", obra: "Pokémon (on Brazilian TV since 1999)", jeito: "Wants to catch everyone for their team.", piada: "And asks whether you're fire or water.", sistema: "Nobody needs a team. People need to know how each party actually voted." },
    { id: "matrix", nome: "The Chosen One", obra: "The Matrix (1999)", jeito: "Shows up every election saying only he can save us.", piada: "I'm with the crew fixing the ship.", sistema: "A good country works even when the leader is bad." },
    { id: "paredao", nome: "The Eviction Vote", obra: "Big Brother Brasil (since 2002)", jeito: "Politics became voting to evict someone.", piada: "And I don't want to be evicted from Sunday lunch.", sistema: "Evicting a person doesn't change the rule that caused the problem." }
  ]
};
