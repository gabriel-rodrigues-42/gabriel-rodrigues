// Monta a página de ideias a partir de window.IDEIAS. Para editar o conteúdo, mexa só em ideias.js.
// A leitura em voz alta com legendas é do modo leitura do site (design-system/leitor.js), ligado no rodapé:
// cada ideia é uma parte (data-leitura-parte) e ganha um ▶ no título.

(function () {
  "use strict";

  const IDEIAS = window.IDEIAS || [];
  // Idioma: inglês na versão /en/ideias/ (<html lang="en">), que carrega ideias-en.js no lugar de ideias.js.
  const EN = /^en\b/i.test(document.documentElement.lang);
  const ESTADOS = { "rascunho": "", "em teste": "azul", "pronta para postar": "amarelo", "no ar": "" };
  // Nome do estado como aparece no selo (em ideias-en.js o estado continua em português).
  const NOME_ESTADO = EN ? { "rascunho": "draft", "em teste": "testing", "pronta para postar": "ready to post", "no ar": "live" } : {};
  const T = EN ? {
    parte: "Idea", problema: "The problem", proposta: "The proposal", criticas: "Criticism and answers",
    critica: "Criticism", resposta: "Answer", emConstrucao: "Answer under construction.", conversar: "Let's talk",
    copiar: "Copy to post", copiado: "Copied!", copie: "Copy the text:", hashtag: "To talk about it online, use the hashtag ",
  } : {
    parte: "Ideia", problema: "O problema", proposta: "A proposta", criticas: "Críticas e respostas",
    critica: "Crítica", resposta: "Resposta", emConstrucao: "Resposta em construção.", conversar: "Pra conversar",
    copiar: "Copiar para postar", copiado: "Copiado!", copie: "Copie o texto:", hashtag: "Pra conversar nas redes, use a hashtag ",
  };

  const $ = (id) => document.getElementById(id);

  // ---------- Montagem da página ----------

  function criar(tag, classe, pai) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (classe === "rotulo") el.dataset.leitura = "pular"; // o leitor fala o rótulo como prefixo da frase
    if (pai) pai.appendChild(el);
    return el;
  }

  // Coloca o texto em `pai`. `prefixo` é dito pelo leitor antes da primeira frase (ex.: "Crítica:"), sem aparecer.
  function escrever(pai, texto, prefixo) {
    pai.textContent = String(texto).trim();
    if (prefixo) pai.dataset.leituraPrefixo = prefixo;
  }

  function montar() {
    const lista = $("ideias");
    const indice = $("indice");

    IDEIAS.forEach((ideia) => {
      const art = criar("article", "cartao ideia", lista);
      art.id = ideia.id;
      art.dataset.leituraParte = T.parte;

      const li = criar("li", "", indice);
      const a = criar("a", "", li);
      a.href = "#" + ideia.id;
      a.textContent = ideia.titulo;

      const selo = criar("span", "selo " + (ESTADOS[ideia.estado] || ""), art);
      selo.textContent = NOME_ESTADO[ideia.estado || "rascunho"] || ideia.estado || "rascunho";
      criar("h2", "", art).textContent = ideia.titulo;

      if (ideia.gancho) escrever(criar("p", "gancho", art), ideia.gancho);

      secao(art, T.problema);
      (ideia.problema || []).forEach((p) => escrever(criar("p", "", art), p));

      secao(art, T.proposta);
      (ideia.proposta || []).forEach((p) => escrever(criar("p", "", art), p));

      if (ideia.criticas && ideia.criticas.length) {
        secao(art, T.criticas);
        ideia.criticas.forEach((c) => {
          const box = criar("div", "critica", art);
          criar("span", "rotulo", box).textContent = T.critica;
          escrever(criar("p", "pergunta-critica", box), c.critica, T.critica + ":");
          criar("span", "rotulo", box).textContent = T.resposta;
          if (c.resposta) escrever(criar("p", "", box), c.resposta, T.resposta + ":");
          else escrever(criar("p", "pendente", box), T.emConstrucao);
        });
      }

      if (ideia.pergunta) {
        const conversa = criar("div", "conversa", art);
        const h3 = criar("h3", "", conversa);
        h3.textContent = T.conversar;
        h3.style.marginTop = "0";
        escrever(criar("p", "", conversa), ideia.pergunta);
        if (ideia.hashtag) {
          const tags = criar("div", "hashtags", conversa);
          tags.dataset.leituraFala = T.hashtag + falarHashtag(ideia.hashtag) + ".";
          [ideia.hashtag, window.HASHTAG_GERAL].filter(Boolean).forEach((t) => {
            criar("span", "hashtag", tags).textContent = t;
          });
          const copiar = criar("button", "botao secundario copiar", tags);
          copiar.type = "button";
          copiar.textContent = T.copiar;
          copiar.addEventListener("click", () => copiarPost(ideia, copiar));
        }
      }

      if (ideia.links && ideia.links.length) {
        const links = criar("div", "links", art);
        links.dataset.leitura = "pular";
        ideia.links.forEach((l) => {
          const link = criar("a", "", links);
          link.href = l.url;
          link.textContent = l.texto + " →";
        });
      }
    });
  }

  // "#ReindustrializaBrasil" vira "Reindustrializa Brasil" para a voz não soletrar.
  function falarHashtag(t) {
    return t.replace(/^#/, "").replace(/([a-zà-ú])([A-ZÀ-Ú0-9])/g, "$1 $2");
  }

  function textoDoPost(ideia) {
    const url = location.origin + (EN ? "/en" : "") + "/ideias/#" + ideia.id;
    const tags = [ideia.hashtag, window.HASHTAG_GERAL].filter(Boolean).join(" ");
    return ideia.titulo + "\n\n" + ideia.pergunta + "\n\n" + url + "\n\n" + tags;
  }

  function copiarPost(ideia, botao) {
    const texto = textoDoPost(ideia);
    const pronto = () => {
      botao.textContent = T.copiado;
      setTimeout(() => (botao.textContent = T.copiar), 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(pronto, () => copiarAntigo(texto, pronto));
    } else {
      copiarAntigo(texto, pronto);
    }
  }

  function copiarAntigo(texto, pronto) {
    const area = criar("textarea", "", document.body);
    area.value = texto;
    area.style.position = "fixed";
    area.style.opacity = "0";
    area.select();
    try { document.execCommand("copy"); pronto(); } catch (e) { window.prompt(T.copie, texto); }
    area.remove();
  }

  function secao(art, titulo) {
    criar("h3", "", art).textContent = titulo;
  }

  montar();
})();
