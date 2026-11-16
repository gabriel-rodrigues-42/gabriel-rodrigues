# gabriel-rodrigues

Site gabriel-rodrigues.com, design system e vídeos do Gabriel Rodrigues, desenvolvedor que se prepara para disputar deputado federal por Goiás em 2030. Escreva tudo (código, textos, commits) em português do Brasil.

## Estrutura

- `site/`: tudo que é publicado. HTML, CSS e JS puros, sem build.
  - `design-system/`: `tokens.css` (cores, formas, tipografia) e `componentes.css`. Vitrine em `/design-system/`.
  - `caminho/`: questionário "Qual caminho faz sentido pra mim?". Dados em `dados.js`.
  - `projetos/`: páginas de projeto. Modelo em `projetos/_modelo/`.
  - `videos/kit/`: kit de animação em massinha (`clay.css`, `clay.js`). `videos/cenas/<slug>/`: uma cena por vídeo.
- `videos/`: ferramentas de vídeo (não publicado). `render.js` gera MP4, `roteiros/` guarda os roteiros. `out/` e `audio/` ficam fora do Git.
- `.github/workflows/deploy.yml`: publica `site/` no Cloudflare Pages. Cada PR ganha prévia em `<branch>.gabriel-rodrigues.pages.dev`; a `main` vai para produção.

## Regras

- Cores, fontes e formas só por variáveis de `site/design-system/tokens.css`. Precisa de algo novo? Adicione lá primeiro.
- Páginas precisam funcionar em 390px de largura sem rolagem lateral.
- Números sempre com fonte oficial e ano.
- Pré-campanha: nada de pedido de voto, número de urna ou ataque a pessoas e partidos. Critique sistemas.

## Skills

- `novo-video`: do tema ao MP4.
- `pagina-de-projeto`: página de referência em `site/projetos/`.

## Conferir localmente

```bash
python3 -m http.server 8000 -d site
cd videos && node render.js como-nasce-uma-lei --quadro 6
```
