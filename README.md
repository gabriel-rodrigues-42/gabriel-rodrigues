# gabriel-rodrigues

Site, design system e projetos de Gabriel Rodrigues: um desenvolvedor de Inhumas (GO) que quer melhorar os sistemas do Brasil com mentalidade de engenharia de software.

Este repositório vai reunir:

- **site/**: o site [gabriel-rodrigues.com](https://gabriel-rodrigues.com), publicado no Cloudflare Pages
- **site/design-system/**: o design system Brasil orgânico, com cores do Brasil e formas orgânicas ([vitrine](https://gabriel-rodrigues.com/design-system/))
- **site/videos/**: kit de animação em massinha e as cenas de cada vídeo, editáveis no navegador
- **site/projetos/**: descrições de projetos em HTML para consulta e referência
- **videos/**: roteiros e o script que transforma uma cena em MP4

## Fazer um vídeo

```bash
cd videos
npm install && npx playwright install chromium
node render.js como-nasce-uma-lei            # gera videos/out/como-nasce-uma-lei.mp4
node render.js como-nasce-uma-lei --audio audio/narracao.mp3
```

O passo a passo completo está em `.claude/skills/novo-video/SKILL.md`.
