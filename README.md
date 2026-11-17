# gabriel-rodrigues

Site, design system e projetos de Gabriel Rodrigues: um desenvolvedor de Inhumas (GO) que quer melhorar os sistemas do Brasil com mentalidade de engenharia de software.

Este repositório vai reunir:

- **site/**: o site [gabriel-rodrigues.com](https://gabriel-rodrigues.com), publicado no Cloudflare Pages
- **site/design-system/**: o design system Brasil orgânico, com cores do Brasil e formas orgânicas ([vitrine](https://gabriel-rodrigues.com/design-system/))
- **site/projetos/**: descrições de projetos em HTML para consulta e referência
- **videos/**: roteiros e as cenas em stop motion de massinha, feitas no Blender por scripts Python

## Fazer um vídeo

```bash
uv venv -p 3.13 .bpy && VIRTUAL_ENV=.bpy uv pip install bpy==5.2.4   # Blender como módulo Python, uma vez
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --still 60 --res 960 540 --samples 24   # um quadro
.bpy/bin/python videos/blender/cenas/como_nasce_uma_lei.py -- --res 1920 1080 --samples 80 --out videos/out/renders/lei
.claude/skills/blender-claymation/scripts/encode.sh videos/out/renders/lei videos/out/lei.mp4
```

O passo a passo completo está em `.claude/skills/novo-video/SKILL.md`. As cenas usam a skill [blender-claymation](https://github.com/angrypenguinpng/blender-claymation-skill) (MIT).
