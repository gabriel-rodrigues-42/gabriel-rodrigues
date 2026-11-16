---
name: novo-video
description: Produz um vídeo explicativo em massinha para o canal do Gabriel, do tema ao MP4 (roteiro, cena animada, narração e renderização). Use quando ele pedir um vídeo novo, um roteiro ou uma cena animada.
---

# Novo vídeo em massinha

Objetivo: explicar um sistema brasileiro (leis, impostos, serviços públicos) de forma descomplicada, com a mentalidade de um desenvolvedor e a didática de um professor. Todo vídeo vira também uma página de projeto no site.

## 1. Roteiro

1. Combine com o Gabriel o tema e a **pergunta central** (uma só).
2. Copie `videos/roteiros/_modelo.md` para `videos/roteiros/<slug>.md` e preencha.
   - 60 a 120 segundos. Gancho nos primeiros 5 segundos.
   - Frases curtas, que uma pessoa de 14 anos entende. Explique o sistema como fluxo: entrada, etapas, saída, onde trava.
   - Todo número precisa de fonte oficial (gov.br, Câmara, Senado, IBGE, TSE, TCU). Sem fonte, não entra.
3. **Regras de pré-campanha** (Lei 9.504/97, art. 36-A): pode falar de ideias e projetos; **não pode** pedir voto, dizer que é candidato nem usar número de urna. Critique sistemas, nunca pessoas ou partidos. Se tiver dúvida, marque no roteiro e pergunte ao Gabriel.
4. Mostre o roteiro ao Gabriel e espere aprovação antes de animar.

## 2. Cena animada

1. Copie `site/videos/cenas/como-nasce-uma-lei/` para `site/videos/cenas/<slug>/` e use como base.
2. Mantenha no topo do `<style>` o comentário com a **linha do tempo** (segundo → o que acontece). Ele é o mapa para editar depois.
3. Use o kit (`site/videos/kit/`):
   - `Clay.personagem({ id, x, y, escala })` é o Gabriel em massinha. Partes animáveis: `#<id>-corpo`, `-olhos`, `-boca`, `-braco-d`, `-braco-e`.
   - `Clay.balao({ x, y, largura, texto, tamanho })` cria um balão de fala.
   - `filter="url(#clay)"` em qualquer forma dá volume de massinha; `url(#clay-plano)` serve para fundos.
   - Movimentos prontos em `clay.css`: `surgir`, `brotar`, `sumir`, `respirar`, `flutuar`, `piscar`, `falar`, `acenar`, `balancar`, `desenhar` (setas com `pathLength="1"` e classe `desenhavel`).
   - O atraso da animação CSS é o segundo do vídeo em que ela começa. Ex.: `animation: surgir .8s 5s both`.
   - Para animar um elemento que tem `transform` no SVG, ponha a posição num `<g>` externo e anime o `<g>` de dentro.
4. Só cores e formas de `site/design-system/tokens.css`. Fundo creme, chão `--areia`.
5. Termine com `Clay.iniciar({ duracao: <segundos> })`.

## 3. Conferir

```bash
python3 -m http.server 8000 -d site   # abra http://localhost:8000/videos/cenas/<slug>/
cd videos && node render.js <slug> --quadro 3.5   # PNG de um instante, em videos/out/
```

Confira alguns quadros (início, meio, fim de cada cena): nada cortado, texto legível, nada sobreposto.

## 4. Narração e render

1. O Gabriel grava a narração e salva em `videos/audio/<slug>.mp3` (a pasta não vai para o Git).
2. Meça a duração: `ffprobe -v error -show_entries format=duration -of csv=p=0 videos/audio/<slug>.mp3`.
3. Ajuste `duracao` e os atrasos da linha do tempo para bater com a fala.
4. Renderize:

```bash
cd videos
npm install && npx playwright install chromium   # só na primeira vez
node render.js <slug> --audio audio/<slug>.mp3   # gera videos/out/<slug>.mp4
node render.js <slug> --quadro 2 --saida out/<slug>-thumb.png   # miniatura
```

O render é quadro a quadro e pode levar alguns minutos. O MP4 sai em 1920x1080, 30 fps.

## 5. Publicar

1. Crie a página de projeto com a skill `pagina-de-projeto`.
2. Abra um PR com o roteiro, a cena e a página. O PR gera uma prévia no Cloudflare Pages.
