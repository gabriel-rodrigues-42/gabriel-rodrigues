# gabriel-rodrigues

Site gabriel-rodrigues.com, design system e vídeos do Gabriel Rodrigues, desenvolvedor que se prepara para disputar deputado federal por Goiás em 2030. Escreva tudo (código, textos, commits) em português do Brasil.

## Estrutura

- `site/`: tudo que é publicado. HTML, CSS e JS puros, sem build.
  - `design-system/`: `tokens.css` (cores, formas, tipografia) e `componentes.css`. Vitrine em `/design-system/`.
  - `design-system/moldura.js` + `moldura.css`: cabeçalho e rodapé com o Gabriel e a missão. Toda página nova carrega os dois no `<head>` e usa `<gr-cabecalho>` logo depois de `<body>` e `<gr-rodape>` no fim.
  - `privacidade/`: política de privacidade do formulário de apoio. Mudou o que o formulário guarda? Atualize a página e a versão em `functions/api/apoio.js`.
  - `ideias/`: portfólio de ideias lido em voz alta com legendas (Web Speech API). Conteúdo só em `ideias.js`; `leitor.js` monta a página e faz a leitura.
  - `caminho/`: questionário "Qual caminho faz sentido pra mim?". Dados em `dados.js`.
  - `projetos/`: páginas de projeto. Modelo em `projetos/_modelo/`.
- `functions/api/apoio.js`: Pages Function do formulário "Acredita que eu devo tentar?" da home. Grava na tabela `apoios` (`db/apoios.sql`) do D1 `gabriel-rodrigues`, ligado como `DB`. O banco é do site todo: recurso novo ganha tabela e arquivo próprios em `db/`. Sem CPF: só email, nome, cidade e UF, com consentimento.
- `videos/`: vídeos (não publicado). `blender/gabriel.py` tem o boneco do Gabriel, as cores e o cenário; `blender/cenas/` tem um script por plano; `roteiros/` guarda os roteiros. `out/` e `audio/` ficam fora do Git.
- `.claude/skills/blender-claymation/`: skill de stop motion no Blender (MIT, de angrypenguinpng/blender-claymation-skill).
- `.github/workflows/deploy.yml`: publica `site/` no Cloudflare Pages. Cada PR ganha prévia em `<branch>.gabriel-rodrigues.pages.dev`; a `main` vai para produção.

## Regras

- Cores, fontes e formas só por variáveis de `site/design-system/tokens.css`. Precisa de algo novo? Adicione lá primeiro.
- Páginas precisam funcionar em 390px de largura sem rolagem lateral.
- Números sempre com fonte oficial e ano.
- Pré-campanha: nada de pedido de voto, número de urna ou ataque a pessoas e partidos. Critique sistemas.
- Dados pessoais: colete o mínimo (LGPD). Nada de CPF, título de eleitor ou lista com cara de abaixo-assinado.

## Ideias

Para criar ou melhorar uma ideia, edite `site/ideias/ideias.js` (o formato está explicado no topo do arquivo). Cada ideia tem gancho, problema, proposta, críticas com resposta e uma pergunta para puxar conversa. Frases curtas: cada frase vira uma legenda.

## Skills

- `novo-video`: do tema ao MP4, usando `blender-claymation`.
- `pagina-de-projeto`: página de referência em `site/projetos/`.

## Conferir localmente

```bash
python3 -m http.server 8000 -d site
uv venv -p 3.13 .bpy && VIRTUAL_ENV=.bpy uv pip install bpy==5.2.4   # Blender como módulo, uma vez
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --still 60 --res 960 540 --samples 24 --out videos/out/renders/teste
```
