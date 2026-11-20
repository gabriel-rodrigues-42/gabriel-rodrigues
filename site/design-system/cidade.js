// Seletor de cidade do site: busca entre os 5.571 municípios do Brasil, com localização e CEP.
// Adaptado do seletor do galera.club (busca sem acento, teclado, CEP pelo ViaCEP com BrasilAPI de reserva).
//
// Uso (carregue cidade.css e este arquivo no <head>):
//   <label for="minha-cidade">Cidade</label>
//   <gr-cidade id-campo="minha-cidade" nome-cidade="cidade" nome-uf="uf" exterior></gr-cidade>
//
// Atributos
//   id-campo      id do campo de texto, para o <label for> funcionar
//   nome-cidade   nome do <input hidden> com o nome da cidade (para formulários)
//   nome-uf       nome do <input hidden> com a UF ("EX" para quem mora fora, se tiver `exterior`)
//   ibge          código IBGE já escolhido (ex.: vindo do endereço da página)
//   exterior      mostra a opção "Moro fora do Brasil"
//   placeholder   texto de exemplo do campo
//
// Avisa a página com o evento "gr-cidade" (detail = { ibge, nome, uf, pop } ou null).
// O valor inicial (atributo ibge) e o reset do formulário não disparam o evento.
// O valor atual fica em elemento.valor.
//
// Dados: /caminho/dados/municipios.json, gerado por scripts/caminho/gerar_dados.py (IBGE, Censo 2022).
// Privacidade: localização e CEP só são consultados quando a pessoa clica. As coordenadas vão
// para o OpenStreetMap (Nominatim) e o CEP para o ViaCEP ou a BrasilAPI, só para descobrir a cidade.
// Nada disso é guardado. Veja /privacidade/#cidade.

(function () {
  "use strict";

  const DADOS = "/caminho/dados/municipios.json";
  const MAX_RESULTADOS = 8;
  const UFS = new Set("AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split(" "));
  const EXTERIOR = { ibge: null, nome: "Fora do Brasil", uf: "EX", pop: 0 };

  const chave = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ").trim();
  const num = (n) => Number(n).toLocaleString("pt-BR");

  // Uma lista para todas as instâncias da página, baixada só quando alguém usa o campo.
  let promessa = null;
  function municipios() {
    if (!promessa) {
      promessa = fetch(DADOS)
        .then((r) => { if (!r.ok) throw new Error(DADOS); return r.json(); })
        .then((lista) => lista.map(([ibge, nome, uf, pop]) => ({ ibge, nome, uf, pop, k: chave(nome) })))
        .catch((e) => { promessa = null; throw e; });
    }
    return promessa;
  }

  // Mais populosas primeiro (a lista já vem nessa ordem). Começo do nome vale mais que começo
  // de palavra, que vale mais que qualquer trecho. "goiania go" ou "Goiânia - GO" filtram pela UF.
  function buscar(lista, texto) {
    let k = chave(texto);
    if (!k) return [];
    let uf = null;
    const partes = k.split(" ");
    if (partes.length > 1 && UFS.has(partes[partes.length - 1].toUpperCase())) {
      uf = partes.pop().toUpperCase();
      k = partes.join(" ");
    }
    const inicio = [], palavra = [], meio = [];
    for (const m of lista) {
      if (uf && m.uf !== uf) continue;
      if (m.k.startsWith(k)) inicio.push(m);
      else if (m.k.includes(" " + k)) palavra.push(m);
      else if (k.length > 2 && m.k.includes(k)) meio.push(m);
      if (inicio.length >= MAX_RESULTADOS) break;
    }
    return inicio.concat(palavra, meio).slice(0, MAX_RESULTADOS);
  }

  const ICONE_BUSCA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const ICONE_LOCAL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const ICONE_CEP = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h4M7 14h7"/></svg>';
  const ICONE_MUNDO = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';

  let contador = 0;

  class SeletorCidade extends HTMLElement {
    connectedCallback() {
      if (this.dataset.pronto) return;
      this.dataset.pronto = "1";
      const id = this.getAttribute("id-campo") || `gr-cidade-${++contador}`;
      const lista = `${id}-lista`;
      this.valor = null;
      this.resultados = [];
      this.foco = -1;

      this.innerHTML = `
        <div class="gr-cidade">
          <div class="gr-cidade-busca">
            ${ICONE_BUSCA}
            <input id="${id}" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false"
              aria-controls="${lista}" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done"
              maxlength="80" placeholder="${this.getAttribute("placeholder") || "Digite o nome da sua cidade"}">
            <button type="button" class="gr-cidade-limpar" aria-label="Apagar a cidade" hidden>×</button>
            <ul class="gr-cidade-lista" id="${lista}" role="listbox" aria-label="Cidades encontradas" hidden></ul>
          </div>
          <div class="gr-cidade-cep" hidden>
            <label for="${id}-cep">CEP</label>
            <div class="gr-cidade-cep-linha">
              <input id="${id}-cep" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="00000-000">
              <button type="button" class="gr-cidade-voltar">Buscar pelo nome</button>
            </div>
          </div>
          <div class="gr-cidade-atalhos">
            <button type="button" data-acao="local">${ICONE_LOCAL}<span>Usar minha localização</span></button>
            <button type="button" data-acao="cep">${ICONE_CEP}<span>Buscar pelo CEP</span></button>
            ${this.hasAttribute("exterior") ? `<button type="button" data-acao="exterior">${ICONE_MUNDO}<span>Moro fora do Brasil</span></button>` : ""}
          </div>
          <p class="gr-cidade-status" role="status" aria-live="polite"></p>
        </div>`;

      const q = (s) => this.querySelector(s);
      this.campo = q(".gr-cidade-busca input");
      this.limpar = q(".gr-cidade-limpar");
      this.listaEl = q(".gr-cidade-lista");
      this.cepCaixa = q(".gr-cidade-cep");
      this.cep = q(".gr-cidade-cep input");
      this.atalhos = q(".gr-cidade-atalhos");
      this.status = q(".gr-cidade-status");

      for (const [atributo, chaveValor] of [["nome-cidade", "nome"], ["nome-uf", "uf"]]) {
        const nome = this.getAttribute(atributo);
        if (!nome) continue;
        const oculto = document.createElement("input");
        oculto.type = "hidden";
        oculto.name = nome;
        oculto.dataset.chave = chaveValor;
        this.append(oculto);
      }

      this.campo.addEventListener("focus", () => this.abrir());
      this.campo.addEventListener("input", () => {
        if (this.valor) this.definir(null, { manterTexto: true });
        this.abrir();
      });
      this.campo.addEventListener("keydown", (e) => this.teclado(e));
      this.campo.addEventListener("blur", () => setTimeout(() => this.sair(), 150));
      // mousedown, não click: escolhe antes de o campo perder o foco.
      this.listaEl.addEventListener("mousedown", (e) => {
        const li = e.target.closest("[data-i]");
        if (!li) return;
        e.preventDefault();
        this.definir(this.resultados[Number(li.dataset.i)]);
      });
      this.limpar.addEventListener("click", () => { this.definir(null); this.campo.focus(); });
      this.atalhos.addEventListener("click", (e) => {
        const b = e.target.closest("[data-acao]");
        if (!b) return;
        if (b.dataset.acao === "local") this.localizar(b);
        else if (b.dataset.acao === "cep") this.modoCep(true);
        else if (b.dataset.acao === "exterior") this.definir(EXTERIOR);
      });
      this.cep.addEventListener("input", () => this.digitarCep());
      q(".gr-cidade-voltar").addEventListener("click", () => this.modoCep(false));
      const form = this.closest("form");
      if (form) form.addEventListener("reset", () => setTimeout(() => this.definir(null, { silencioso: true })));

      const ibge = Number(this.getAttribute("ibge"));
      if (ibge) this.escolherIbge(ibge, { silencioso: true });
    }

    // ------------------------------------------------------------ valor
    definir(m, { manterTexto = false, silencioso = false } = {}) {
      this.valor = m || null;
      if (!manterTexto) this.campo.value = m ? (m.uf === "EX" ? m.nome : `${m.nome} (${m.uf})`) : "";
      this.limpar.hidden = !m;
      this.atalhos.hidden = !!m; // já tem cidade: os atalhos voltam quando ela for apagada
      this.campo.classList.toggle("gr-cidade-escolhida", !!m);
      this.querySelectorAll("input[type=hidden]").forEach((o) => {
        o.value = !m ? "" : o.dataset.chave === "nome" ? (m.uf === "EX" ? "" : m.nome) : m.uf;
      });
      this.fechar();
      if (m) this.avisar(m.uf === "EX" ? "Fora do Brasil." :
        `${m.nome} (${m.uf})` + (m.pop ? `, ${num(m.pop)} habitantes (IBGE, Censo 2022).` : "."), true);
      else if (!manterTexto) this.avisar("");
      if (!silencioso) this.dispatchEvent(new CustomEvent("gr-cidade", { bubbles: true, detail: this.valor }));
    }

    async escolherIbge(ibge, opcoes) {
      try {
        const m = (await municipios()).find((x) => x.ibge === Number(ibge));
        if (m) this.definir(m, opcoes);
        return m || null;
      } catch { return null; }
    }

    avisar(texto, ok) {
      this.status.textContent = texto;
      this.status.classList.toggle("ok", !!ok);
    }

    // ------------------------------------------------------------ lista
    // A lista só abre com texto digitado: com o campo vazio, os atalhos (localização, CEP)
    // ficam à vista em vez de cobertos por uma lista de capitais.
    async abrir() {
      if (this.valor) return;
      if (!chave(this.campo.value)) { this.fechar(); return; }
      let lista;
      try { lista = await municipios(); }
      catch { this.avisar("Não consegui carregar a lista de cidades. Tente de novo em instantes."); return; }
      if (document.activeElement !== this.campo || this.valor) return;
      this.resultados = buscar(lista, this.campo.value);
      this.foco = this.resultados.length ? 0 : -1;
      this.desenhar();
    }

    desenhar() {
      const id = this.listaEl.id;
      const vazio = chave(this.campo.value);
      this.listaEl.replaceChildren(...this.resultados.map((m, i) => {
        const li = document.createElement("li");
        li.id = `${id}-${i}`;
        li.dataset.i = i;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", String(i === this.foco));
        const nome = document.createElement("span");
        nome.textContent = m.nome;
        const uf = document.createElement("small");
        uf.textContent = m.uf;
        li.append(nome, uf);
        return li;
      }));
      if (vazio && !this.resultados.length) {
        const nada = document.createElement("li");
        nada.className = "gr-cidade-dica";
        nada.setAttribute("role", "presentation");
        nada.textContent = "Nenhuma cidade com esse nome. Tente pelo CEP.";
        this.listaEl.append(nada);
      }
      const aberto = this.listaEl.children.length > 0;
      this.listaEl.hidden = !aberto;
      this.campo.setAttribute("aria-expanded", String(aberto));
      if (this.foco >= 0) {
        this.campo.setAttribute("aria-activedescendant", `${id}-${this.foco}`);
        this.listaEl.querySelector(`#${CSS.escape(id)}-${this.foco}`)?.scrollIntoView({ block: "nearest" });
      } else this.campo.removeAttribute("aria-activedescendant");
    }

    fechar() {
      this.listaEl.hidden = true;
      this.campo.setAttribute("aria-expanded", "false");
      this.campo.removeAttribute("aria-activedescendant");
      this.foco = -1;
    }

    teclado(e) {
      const aberto = !this.listaEl.hidden;
      const n = this.resultados.length;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!aberto) { this.abrir(); return; }
        if (!n) return;
        this.foco = e.key === "ArrowDown" ? (this.foco + 1) % n : (this.foco - 1 + n) % n;
        this.desenhar();
      } else if (e.key === "Enter" && aberto) {
        // Enter com a lista aberta escolhe a cidade; não envia o formulário.
        e.preventDefault();
        if (this.foco >= 0 && this.resultados[this.foco]) this.definir(this.resultados[this.foco]);
      } else if (e.key === "Enter" && !this.valor && chave(this.campo.value)) {
        // Lista ainda carregando: espera e escolhe a primeira, sem enviar o formulário.
        e.preventDefault();
        this.abrir().then(() => { if (this.resultados[0]) this.definir(this.resultados[0]); });
      } else if (e.key === "Escape" && aberto) {
        e.preventDefault();
        this.fechar();
      }
    }

    // Saiu do campo sem escolher: se o texto aponta para uma cidade só, escolhe ela.
    async sair() {
      if (this.contains(document.activeElement) && document.activeElement === this.campo) return;
      this.fechar();
      if (this.valor || !this.cepCaixa.hidden || !chave(this.campo.value)) return;
      let lista;
      try { lista = await municipios(); } catch { return; }
      const achadas = buscar(lista, this.campo.value);
      const k = chave(this.campo.value.replace(/\s*[-(,/]\s*[a-z]{2}\)?\s*$/i, ""));
      const exatas = achadas.filter((m) => m.k === k);
      const unica = exatas.length === 1 ? exatas[0] : achadas.length === 1 ? achadas[0] : null;
      if (unica) this.definir(unica);
      else this.avisar(exatas.length > 1 ? "Tem mais de uma cidade com esse nome. Escolha a sua na lista." : "Escolha sua cidade na lista.");
    }

    // ------------------------------------------------------------ localização
    localizar(botao) {
      if (!navigator.geolocation) { this.avisar("Este navegador não informa a localização. Digite o nome ou use o CEP."); return; }
      botao.disabled = true;
      this.avisar("Procurando sua cidade…");
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const m = await this.cidadeDasCoordenadas(coords.latitude, coords.longitude);
            if (m) this.definir(m);
            else this.avisar("Não reconheci uma cidade do Brasil aí. Digite o nome ou use o CEP.");
          } catch {
            this.avisar("Não consegui descobrir a cidade agora. Digite o nome ou use o CEP.");
          } finally { botao.disabled = false; }
        },
        (erro) => {
          botao.disabled = false;
          this.avisar(erro && erro.code === 1
            ? "Tudo bem. Digite o nome da cidade ou use o CEP."
            : "Não consegui pegar a localização deste aparelho. Digite o nome ou use o CEP.");
        },
        // Precisão de cidade basta: sem GPS fino, aceita posição de até 10 minutos.
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
      );
    }

    async cidadeDasCoordenadas(lat, lon) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&accept-language=pt-BR&lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("nominatim");
      const { address: a = {} } = await r.json();
      if (a.country_code !== "br") return null;
      const uf = String(a["ISO3166-2-lvl4"] || "").replace("BR-", "");
      const nomes = [a.city, a.town, a.village, a.municipality, a.city_district].filter(Boolean);
      return this.acharPorNome(nomes, uf);
    }

    async acharPorNome(nomes, uf) {
      const lista = await municipios();
      for (const nome of nomes) {
        const k = chave(nome);
        const m = lista.find((x) => x.k === k && (!UFS.has(uf) || x.uf === uf));
        if (m) return m;
      }
      return null;
    }

    // ------------------------------------------------------------ CEP
    modoCep(ligar) {
      this.cepCaixa.hidden = !ligar;
      this.campo.closest(".gr-cidade-busca").hidden = ligar;
      this.atalhos.hidden = ligar;
      this.fechar();
      this.avisar(ligar ? "Digite os 8 números do CEP." : "");
      (ligar ? this.cep : this.campo).focus();
      if (!ligar) this.cep.value = "";
    }

    async digitarCep() {
      let d = this.cep.value.replace(/\D/g, "").slice(0, 8);
      this.cep.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
      if (d.length !== 8) return;
      this.avisar("Buscando o CEP…");
      try {
        const m = await this.cidadeDoCep(d);
        if (m) { this.modoCep(false); this.definir(m); }
        else this.avisar("Não achei esse CEP. Confira os números.");
      } catch {
        this.avisar("Não consegui buscar o CEP agora. Digite o nome da cidade.");
      }
    }

    async cidadeDoCep(cep) {
      // ViaCEP traz o código IBGE, que casa exato com a lista. BrasilAPI fica de reserva.
      try {
        const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (r.ok) {
          const d = await r.json();
          if (d && !d.erro) {
            const lista = await municipios();
            return lista.find((m) => m.ibge === Number(d.ibge)) || this.acharPorNome([d.localidade], d.uf);
          }
          if (d && d.erro) return null;
        }
      } catch { /* tenta a BrasilAPI */ }
      const r = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("cep");
      const d = await r.json();
      return this.acharPorNome([d.city], d.state);
    }
  }

  customElements.define("gr-cidade", SeletorCidade);
})();
