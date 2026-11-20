# gabriel-rodrigues

Site, propostas e vídeos de Gabriel Rodrigues: um desenvolvedor de software em Goiânia (GO) que estuda política para levar o jeito de trabalhar da engenharia de software para o governo. Medir, testar, corrigir e mostrar o código.

**[gabriel-rodrigues.com](https://gabriel-rodrigues.com)** · [Propostas](https://gabriel-rodrigues.com/projetos/) · [Ideias](https://gabriel-rodrigues.com/ideias/) · [Qual caminho faz sentido pra mim?](https://gabriel-rodrigues.com/caminho/) · [English](https://gabriel-rodrigues.com/en/)

## Mande a sua ideia

As propostas do site são construídas em público. Você pode trazer uma ideia nova, um dado mais recente, uma correção ou a crítica mais dura que encontrar.

- 💡 [Enviar uma proposta nova](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=1-nova-proposta.yml)
- 🔧 [Melhorar uma proposta que já está no site](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=2-melhorar-proposta.yml)
- 🐞 [Avisar de um erro no site](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=3-erro-no-site.yml)

O que é inegociável em toda contribuição:

1. **Fonte e ano** em todo número, de preferência oficial.
2. **Solução, não culpado**: critique sistemas, não pessoas nem partidos.
3. **Dados e impacto**: quem ganha, quanto, e como medir.
4. **Lei eleitoral**: nada de pedido de voto ou número de urna.
5. **LGPD**: nenhum dado pessoal, seu ou de outra pessoa.

Os detalhes e como eu reviso estão em **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## O que tem aqui

- **site/**: o site, publicado no Cloudflare Pages. HTML, CSS e JS puros, sem build.
  - **site/projetos/**: as propostas, uma página por sistema (cartório, reindustrialização, carro modular...).
  - **site/ideias/**: ideias curtas, lidas em voz alta com legendas.
  - **site/caminho/**: questionário para quem pensa em disputar uma eleição, com dados do TSE e do IBGE para qualquer município.
  - **site/design-system/**: o design system Brasil orgânico, com cores do Brasil e formas orgânicas ([vitrine](https://gabriel-rodrigues.com/design-system/)).
  - **site/en/**: a versão em inglês.
- **functions/** e **db/**: o formulário de apoio do site (Cloudflare Pages Functions e D1).
- **scripts/**: geração dos dados do questionário e das miniaturas das propostas.
- **videos/**: roteiros e cenas em stop motion de massinha, feitas no Blender por scripts Python.

## Ver o site localmente

```bash
python3 -m http.server 8000 -d site
```

Abra http://localhost:8000. As regras de código, texto e acessibilidade estão no [CLAUDE.md](CLAUDE.md).

## Fazer um vídeo

```bash
uv venv -p 3.13 .bpy && VIRTUAL_ENV=.bpy uv pip install bpy==5.2.4   # Blender como módulo Python, uma vez
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --still 60 --res 960 540 --samples 24   # um quadro
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --res 1920 1080 --samples 80 --out videos/out/renders/lei
.claude/skills/blender-claymation/scripts/encode.sh videos/out/renders/lei videos/out/lei.mp4
```

O passo a passo completo está em `.claude/skills/novo-video/SKILL.md`. As cenas usam a skill [blender-claymation](https://github.com/angrypenguinpng/blender-claymation-skill) (MIT).

## Em inglês

This is the repository of [gabriel-rodrigues.com](https://gabriel-rodrigues.com/en/), the personal site of a Brazilian software developer who writes public-policy proposals in the open. You are welcome to suggest ideas, data or criticism through the [issue forms](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new/choose). The forms are in Portuguese, but you can write in English.
