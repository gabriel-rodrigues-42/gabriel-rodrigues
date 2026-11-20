---
name: novo-video
description: Produz um vídeo explicativo em massinha (stop motion no Blender) para o canal do Gabriel, do tema ao MP4 (roteiro, cena, narração e renderização). Use quando ele pedir um vídeo novo, um roteiro ou uma cena animada.
---

# Novo vídeo em massinha

Objetivo: explicar um sistema brasileiro (leis, impostos, serviços públicos) de forma descomplicada, com a mentalidade de um desenvolvedor e a didática de um professor. Todo vídeo vira também uma página de projeto no site.

As cenas são feitas no **Blender**, com a skill `blender-claymation` (em `.claude/skills/blender-claymation/`). Leia o `SKILL.md` e o `references/look-guide.md` dela antes de montar uma cena.

## 1. Roteiro

1. Combine com o Gabriel o tema e a **pergunta central** (uma só).
2. Copie `videos/roteiros/_modelo.md` para `videos/roteiros/<slug>.md` e preencha.
   - 60 a 120 segundos. Gancho nos primeiros 5 segundos.
   - Frases curtas, que uma pessoa de 14 anos entende. Revise com a skill `escrita-pt-br`. Explique o sistema como fluxo: entrada, etapas, saída, onde trava.
   - Todo número precisa de fonte oficial (gov.br, Câmara, Senado, IBGE, TSE, TCU). Sem fonte, não entra.
3. **Regras de pré-campanha** (Lei 9.504/97, art. 36-A): pode falar de ideias e projetos; **não pode** pedir voto, dizer que é candidato nem usar número de urna. Critique sistemas, nunca pessoas ou partidos. Se tiver dúvida, marque no roteiro e pergunte ao Gabriel.
4. Mostre o roteiro ao Gabriel e espere aprovação antes de animar.

## 2. Cena no Blender

1. Divida o roteiro em planos de 5 a 20 segundos. Cada plano é um script em `videos/blender/cenas/<slug>_<n>.py`.
2. Copie `videos/blender/cenas/como_nasce_uma_lei.py` como base. Ele usa `videos/blender/gabriel.py`, que tem:
   - `COR`: as cores do design system, ajustadas para o render.
   - `gabriel(x, y)`: o boneco do Gabriel. Retorna os pivôs `raiz`, `corpo`, `cabeca`, `ombro_e`, `ombro_d`, `olhos_abertos`, `olhos_fechados`.
   - `bloco(texto, cor, cor_texto, x)`: bloco de massinha com texto em relevo. `seta(x)`: seta azul.
   - `cenario_brasil(rnd)` e `luzes_e_camera()`: a mesa, o fundo creme, o sol e os morros, e a câmera padrão.
3. Escreva a **linha do tempo em quadros** (12 fps) no topo do script. 10 s = 120 quadros.
4. Siga o look-guide: tudo "em dois" com `constant_interp()`, `Boil` no boneco, poses seguradas por 4 a 8 quadros, squash & stretch, piscadas de 2 quadros.
5. Texto na tela: no máximo 2 ou 3 palavras por bloco. Frases longas vão na narração ou na legenda.

## 3. Conferir com quadros baratos

Se o Blender não estiver instalado, use-o como módulo Python (uma vez):

```bash
uv venv -p 3.13 .bpy && VIRTUAL_ENV=.bpy uv pip install bpy==5.2.4
```

Depois, para cada momento importante da linha do tempo:

```bash
.bpy/bin/python videos/blender/cenas/<cena>.py -- --still 60 --res 960 540 --samples 24 --out videos/out/renders/<cena>_teste
```

Olhe os quadros: exposição (cor desbotada = luz demais), pés tocando a mesa, olhos legíveis, texto legível, nada atravessando nada.

## 4. Narração e render final

1. O Gabriel grava a narração e salva em `videos/audio/<slug>.mp3` (a pasta não vai para o Git).
2. Meça a duração: `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/audio/<slug>.mp3`. Ajuste o número de quadros de cada plano (duração × 12).
3. Renderize em segundo plano e acompanhe:

```bash
nohup .bpy/bin/python videos/blender/cenas/<cena>.py -- --res 1920 1080 --samples 80 --out videos/out/renders/<cena> > videos/out/<cena>.log 2>&1 &
ls videos/out/renders/<cena> | wc -l
```

Num Mac com chip M, cerca de 6 s por quadro em 1600x900. Na CPU da nuvem, cerca de 2 min por quadro em 1280x720.

4. Junte os quadros e o áudio:

```bash
.claude/skills/blender-claymation/scripts/encode.sh videos/out/renders/<cena> videos/out/<cena>.mp4
ffmpeg -i videos/out/<cena>.mp4 -i videos/audio/<slug>.mp3 -c:v copy -c:a aac -shortest videos/out/<slug>-final.mp4
.claude/skills/blender-claymation/scripts/contact_sheet.sh videos/out/renders/<cena> videos/out/<cena>_folha.jpg 20
```

Confira a folha de contato antes de entregar.

## 5. Publicar

1. Crie a página de projeto com a skill `pagina-de-projeto`.
2. Abra um PR com o roteiro, os scripts das cenas e a página. O PR gera uma prévia no Cloudflare Pages. MP4 e quadros não vão para o Git.
