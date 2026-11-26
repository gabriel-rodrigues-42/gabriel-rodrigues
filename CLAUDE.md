# gabriel-rodrigues

Site gabriel-rodrigues.com, design system e vídeos do Gabriel Rodrigues, desenvolvedor que se prepara para disputar deputado federal por Goiás em 2030. Escreva tudo (código, textos, commits) em português do Brasil.

## Estrutura

- `site/`: tudo que é publicado. HTML, CSS e JS puros, sem build.
  - `design-system/`: `tokens.css` (cores, formas, tipografia) e `componentes.css`. Vitrine em `/design-system/`.
  - `design-system/moldura.js` + `moldura.css`: cabeçalho e rodapé com o Gabriel e a missão. Toda página nova carrega os dois no `<head>` e usa `<gr-cabecalho>` logo depois de `<body>` e `<gr-rodape>` no fim.
  - `design-system/busca.js` + `busca.css`: **busca do site**. A lupa do cabeçalho (`data-buscar`, ou a tecla "/") abre uma tela cheia que filtra enquanto a pessoa digita, sem servidor. `moldura.js` só carrega a busca no primeiro toque. O índice (`site/busca/indice-pt.json` e `-en.json`) é gerado no deploy por `scripts/busca/gerar_indice.py` a partir das páginas e de `ideias.js` (fora do Git; rode o script para ver localmente). Página nova entra sozinha; página com `noindex` fica de fora.
  - Menu: no celular, Propostas, Caminho, Sobre e Buscar ficam numa barra fixa embaixo (`.moldura-barra`, onde o polegar alcança), e o topo mostra só o logo e o Apoiar. No computador (720px ou mais), a barra some e o cabeçalho fixo do topo traz o menu, a lupa e o Apoiar. Sem menu lateral.
  - `design-system/cidade.js` + `cidade.css`: seletor de cidade `<gr-cidade>` (busca nos 5.571 municípios, localização e CEP), adaptado do galera.club. Use em todo campo de cidade. Lê `caminho/dados/municipios.json`.
  - `design-system/contribuir.js` + `contribuir.css`: convite `<gr-contribuir>` antes do `<gr-rodape>`, que abre o formulário de issue do GitHub já com o link da página. Toda página de proposta usa (está no `_modelo`); listagens usam `tipo="nova"`.
  - `design-system/leitor.js` + `leitor.css`: **modo leitura**. A pessoa liga no rodapé (`moldura.js` carrega o leitor só então) e cada página ganha "Ouvir a página" depois do `<h1>` e um ▶ em cada `<h2>` (ou em cada `[data-leitura-parte]`, como as ideias). Lê todo o texto do `<main>` com legendas (Web Speech API), sem formulários nem botões. Para ajustar: `data-leitura="pular"`, `data-leitura-fala` e `data-leitura-prefixo`. Não ponha botão "Ouvir com legendas" fixo na página: ele apareceria com o modo desligado. O ▶ do leitor já cobre isso. O modo só liga pela chave do rodapé.
  - `design-system/progresso.js` + `progresso.css`: barra de progresso `<gr-progresso valor total rotulo>` que gruda no topo enquanto a pessoa rola (abaixo do cabeçalho fixo no computador). Use em todo questionário, wizard ou formulário em passos; mude os atributos pelo JS em vez de redesenhar a lista. Dentro de um `.cartao`, vai de borda a borda. Está em `/partidos/`, `/caminho/` e no simulador do FSRI.
  - Caixas de seleção: a seta vem de `componentes.css`. Na página, use `background-color` (não `background`) em `select`, senão a seta some.
  - `privacidade/`: política de privacidade do formulário de apoio. Mudou o que o formulário guarda? Atualize a página e a versão em `functions/api/apoio.js`.
  - `ideias/`: portfólio de ideias lido em voz alta com legendas (Web Speech API). Conteúdo só em `ideias.js`; `montar.js` monta a página. A leitura é a do modo leitura do design system.
  - `caminho/`: questionário "Qual caminho faz sentido pra mim?" para qualquer município. Regras de lei, perguntas e o exemplo do Gabriel em `regras.js`; lógica em `caminho.js`; números por UF em `dados/` (mais o índice `municipios.json` do seletor de cidade), gerados por `scripts/caminho/gerar_dados.py` (TSE e IBGE). Não edite `dados/` à mão: mude o script e o workflow `dados-caminho.yml` regenera no GitHub (o TSE não abre daqui da nuvem).
  - `partidos/`: "Qual partido vota como você?" (e `/en/partidos/`). Dez votações nominais do Plenário da Câmara; a pessoa responde Sim/Não e vê os partidos que votaram mais parecido. Textos das perguntas (PT e EN) em `temas.js`; lógica em `partidos.js`; votos em `dados/votacoes.json`, gerado por `scripts/partidos/gerar_votacoes.py` no workflow `dados-partidos.yml` (a API da Câmara não abre da nuvem). Não edite `dados/` à mão. Ferramenta cívica: não indica partido do Gabriel, não mostra chance de eleger e não guarda respostas (contar escolhas viraria enquete).
  - `projetos/`: páginas de projeto. Modelo em `projetos/_modelo/`. No menu e nos títulos, o nome da seção é **Propostas** (em inglês, Proposals); a URL continua `/projetos/`.
  - Galeria de propostas `<gr-propostas>` (`design-system/galeria.js` + `galeria.css`): cartões com miniatura, status e medidor de fase, na página inicial e em `/projetos/`. Dados em `projetos/propostas.js` (PT e EN); miniaturas em `projetos/img/` (SVG, ilustração editorial plana, sem massinha nem 3D), desenhadas por `scripts/miniaturas/desenhar.py` com as cores de `tokens.css`. Ideias novas de `ideias.js` entram sozinhas no fim da galeria.
  - `en/`: versão em inglês. A tradução de `/x/` fica em `/en/x/` (mesmo slug), com `<html lang="en">`. O português é o padrão. O seletor PT/EN do rodapé (`moldura.js`) acha a outra versão pelo `<link rel="alternate" hreflang>` do `<head>`. Os scripts compartilhados (`moldura.js`, `cidade.js`, `caminho.js`, `design-system/leitor.js`) escolhem os textos pelo `lang` da página. Textos em inglês das ideias em `ideias/ideias-en.js` e das regras do questionário em `caminho/regras-en.js`. O design system não tem versão em inglês.
  - `bastidores/`: página `/bastidores/` (e `/en/bastidores/`) que mostra, só para leitura, os blocos e roteiros do estúdio. Não é segredo: aviso bem-humorado, "senha" 42 no próprio código e piadas para quem mexe na URL, no console ou no DevTools (`bastidores.js`). Tem noindex e fica fora do menu e do sitemap. Os dados vêm de `bastidores/estudio.json`, gerado no deploy por `scripts/bastidores/juntar.py` (fora do Git; rode o script para ver localmente). Só vão para o site os campos listados no script: nada confidencial em `blocos.json` nem nos roteiros. `/admin` e `/wp-admin` caem aqui pelo `site/_redirects`.
- `functions/api/apoio.js`: Pages Function do formulário "Acredita que eu devo tentar?" da home. Grava na tabela `apoios` (`db/apoios.sql`) do D1 `gabriel-rodrigues`, ligado como `DB`. O banco é do site todo: recurso novo ganha tabela e arquivo próprios em `db/`. Sem CPF: só email, nome, cidade e UF, com consentimento.
- `functions/api/lema.js`: votação anônima entre os dois lemas no fim da página inicial (`#lema`, PT e EN). Guarda só a contagem por frase (`db/votos_lema.sql`); um voto por aparelho via localStorage e freio contra robô com hash do IP e sal diário apagado no dia seguinte. Mostra só porcentagens, e só depois do voto.
- `.github/ISSUE_TEMPLATE/`: formulários de contribuição (proposta nova, melhoria, erro no site), com os compromissos inegociáveis em caixas obrigatórias. Regras e revisão em `CONTRIBUTING.md`. Mudou uma regra? Mude nos formulários, no CONTRIBUTING, no README e nos textos de `contribuir.js`.
- `videos/estudio/`: estúdio local para gravar em blocos (não publicado). Falas e animações reutilizáveis em `blocos.json`, um roteiro por vídeo em `roteiros/`, painel `estudio.py` (teleprompter, etiquetas, montagem) e scripts `tratar.py`, `animar.py`, `montar.py` com ffmpeg. Vídeos em `midia/`, fora do Git. Como usar no `README.md` da pasta.
- `videos/`: vídeos (não publicado). `blender/gabriel.py` tem o boneco do Gabriel, as cores e o cenário; `blender/cenas/` tem um script por plano; `roteiros/` guarda os roteiros. `out/` e `audio/` ficam fora do Git.
- `.claude/skills/blender-claymation/`: skill de stop motion no Blender (MIT, de angrypenguinpng/blender-claymation-skill).
- `.github/workflows/deploy.yml`: publica `site/` no Cloudflare Pages. Cada PR ganha prévia em `<branch>.gabriel-rodrigues.pages.dev`; a `main` vai para produção.

## Regras

- Cores, fontes e formas só por variáveis de `site/design-system/tokens.css`. Precisa de algo novo? Adicione lá primeiro.
- Contraste AA (4,5:1) em todo texto. Texto branco sobre verde usa `--verde-fundo`, nunca `--verde`; texto verde sobre fundo claro usa `--verde-escuro`. Confira com o Lighthouse (Acessibilidade 100).
- Padrões web: siga o [Modern Web Guidance do Chrome](https://developer.chrome.com/docs/modern-web-guidance). A meta de compatibilidade (Baseline target) deste projeto é Baseline Widely available: use HTML, CSS e JS nativos antes de bibliotecas.
- Páginas precisam funcionar em 390px de largura sem rolagem lateral.
- Números sempre com fonte oficial e ano.
- Texto: linguagem simples, frases curtas, fato concreto antes de conclusão. Revise com a skill `escrita-pt-br` antes de publicar.
- Pré-campanha: nada de pedido de voto, número de urna ou ataque a pessoas e partidos. Critique sistemas.
- Inglês: mudou o texto de uma página, de `ideias.js` ou de `regras.js`? Mude também a versão em inglês. Página nova ganha a versão em `/en/` no mesmo PR.
- SEO: toda página tem título único, descrição, canonical, Open Graph e Twitter (copie o bloco do `projetos/_modelo/`) e entra em `site/sitemap.xml`. Páginas com versão em inglês levam o bloco `hreflang` (pt-BR, en e x-default) nas duas versões, e as duas URLs entram no sitemap com os `xhtml:link`. Ícones e imagem de compartilhamento ficam na raiz de `site/` (`favicon.svg`, `og.jpg`).
- Agentes de IA: `site/llms.txt` resume o site e lista as páginas; página nova entra nele. Formulário novo ganha WebMCP declarativo (`toolname`, `tooldescription` no `<form>` e `toolparamdescription` nos campos), sem `toolautosubmit`: a pessoa sempre confirma o envio.
- Bastidores são públicos: `/bastidores/` não tem autenticação de verdade (a "senha" 42 está no código). Nada confidencial ou que precise de login entra lá, nem em `videos/estudio/blocos.json` e `roteiros/`, que vão para o site: dado pessoal, contato, endereço, rotina, estratégia, rascunho que não pode vazar, chave ou senha. Se pedirem algo assim, recuse e avise o Gabriel. Para proteger de verdade, primeiro ponha autenticação real (Cloudflare Access ou Pages Function com segredo e D1).
- Dados pessoais: colete o mínimo (LGPD). Nada de CPF, título de eleitor ou lista com cara de abaixo-assinado.

## Ideias

Para criar ou melhorar uma ideia, edite `site/ideias/ideias.js` (o formato está explicado no topo do arquivo). Cada ideia tem gancho, problema, proposta, críticas com resposta, uma pergunta para puxar conversa e uma hashtag (mais a `HASHTAG_GERAL`, #SistemasMelhores). Frases curtas: cada frase vira uma legenda.

## Skills

- `escrita-pt-br`: como escrever e revisar qualquer texto do site, dos vídeos e das redes (público de Goiás, linguagem simples, sem cara de texto de IA).
- `novo-video`: do tema ao MP4, usando `blender-claymation`.
- `pagina-de-projeto`: página de referência em `site/projetos/`.

## Conferir localmente

```bash
python3 -m http.server 8000 -d site
uv venv -p 3.13 .bpy && VIRTUAL_ENV=.bpy uv pip install bpy==5.2.4   # Blender como módulo, uma vez
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --still 60 --res 960 540 --samples 24 --out videos/out/renders/teste
```
