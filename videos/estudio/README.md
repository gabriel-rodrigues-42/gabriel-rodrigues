# Estúdio de gravação

Ferramenta local para gravar os vídeos do canal em blocos. Fica fora do site: só `site/` é publicado, e os vídeos em `midia/` não vão para o Git.

Os textos de `blocos.json` e dos roteiros aparecem, só para leitura, em [gabriel-rodrigues.com/bastidores/](https://gabriel-rodrigues.com/bastidores/). A dica de cada lugar não vai para o site.

> **Atenção: isso é público.** A "senha" 42 dos bastidores é de brincadeira e está no código. Não escreva em `blocos.json` nem nos roteiros nada confidencial ou que precisaria de login: dado pessoal, telefone, endereço, rotina, estratégia, rascunho que não pode vazar, chave ou senha. Na dúvida, deixe fora daqui.

A ideia: um vídeo é uma lista de blocos. Alguns blocos são falas que voltam em vários vídeos (a apresentação, o encerramento, "código bom não vence regra ruim"). Outros são animações geradas com as cores do site. Você grava cada fala uma vez, em lugares diferentes, e a montagem junta tudo.

## O fluxo

1. **Escolha o roteiro.** `roteiros/<nome>.json` é a lista de blocos, na ordem. Os blocos ficam em `blocos.json`.
2. **Veja o que falta.** `python3 videos/estudio/montar.py cartorio-digital --falta` mostra as falas que faltam, agrupadas por lugar. Grave tudo de um lugar de uma vez.
3. **Grave.**
   - No computador, com a webcam: aba **Gravar** do estúdio. O texto aparece em cima, perto da câmera, e rola sozinho. Espaço grava e para, seta para a direita vai para o próximo bloco. A tomada já sai com o nome do bloco e do lugar.
   - No iPhone: grave do jeito normal e passe os vídeos (AirDrop ou cabo) para `videos/estudio/midia/brutos/`. Dá para falar vários blocos num vídeo só.
4. **Etiquete.** Aba **Etiquetar**: para cada vídeo, diga qual bloco ele grava, onde começa e termina, e dê a nota (a melhor tomada ganha "A melhor"). Num vídeo com várias falas, use "+ Trecho". Em vídeo horizontal, escolha onde fica o corte do Shorts (aparece um retângulo amarelo).
5. **Monte.** Aba **Montar**, ou pelo terminal:

```bash
python3 videos/estudio/montar.py cartorio-digital              # trata, anima e monta
python3 videos/estudio/montar.py cartorio-digital --rascunho   # aviso na tela no lugar do que falta
python3 videos/estudio/montar.py cartorio-digital --legenda-no-video
```

O vídeo sai em `midia/final/<nome>-h.mp4` (horizontal) ou `-v.mp4` (vertical), com a legenda `.srt` e a transcrição `.txt` ao lado. Para o acabamento, abra o MP4 no DaVinci Resolve ou no CapCut; as tomadas tratadas soltas ficam em `midia/tratados/<bloco>/`.

## Abrir o estúdio

```bash
python3 videos/estudio/estudio.py      # abre http://localhost:8010
```

Precisa do Python 3.10 ou mais novo e do ffmpeg (`brew install ffmpeg` no Mac, `winget install ffmpeg` no Windows). Para as animações, uma vez:

```bash
python3 -m pip install playwright && python3 -m playwright install chromium
```

Use o Chrome para gravar. O estúdio só aceita conexão do próprio computador.

## O que cada script faz

| Script | O que faz |
|---|---|
| `estudio.py` | O painel no navegador (Blocos, Gravar, Etiquetar, Montar). |
| `tratar.py` | Corta cada trecho, converte o HDR do iPhone, limpa chiado, iguala o volume (-16 LUFS) e gera 1920x1080 e 1080x1920 a 30 quadros. Vídeo em pé virando deitado ganha fundo desfocado. |
| `animar.py` | Gera os blocos animados a partir de `animacoes/index.html`, quadro a quadro. |
| `montar.py` | Escolhe a melhor tomada de cada bloco, junta com as animações e escreve a legenda. |

Nenhum script mexe no vídeo bruto. Rodar de novo só refaz o que mudou.

## Pastas

```
videos/estudio/
  blocos.json        biblioteca de blocos e de lugares
  roteiros/          um JSON por vídeo
  animacoes/         modelos de animação (titulo, fim, frase, numero, fluxo, comparar)
  app/               o painel
  midia/             fora do Git
    brutos/          o que sai da câmera
    etiquetas.json   qual bloco cada vídeo grava, nota e corte
    tratados/        tomadas prontas, por bloco
    animacoes/       animações em MP4
    final/           vídeos montados
```

## Como criar um bloco

Abra `blocos.json` e copie um bloco parecido.

- **Fala:** `id`, `titulo`, `texto` (o que você fala), `lugares` (o primeiro é o sugerido) e `tags`. Frases curtas, de 8 a 20 palavras: cada frase vira uma legenda. Revise com a skill `escrita-pt-br`.
- **Animação:** `id`, `titulo`, `duracao` em segundos e `animacao` com o `modelo` e os textos. Modelos:
  - `titulo` e `fim`: `titulo`, `subtitulo`.
  - `frase`: `frase`. A última palavra ganha o grifo amarelo; para grifar outra, ponha entre asteriscos (`"Código *bom* não vence regra ruim."`).
  - `numero`: `valor`, `texto`, `fonte`.
  - `fluxo`: `titulo`, `etapas` (lista), `trava` (número da etapa que trava), `texto_trava`, `fonte`.
  - `comparar`: `titulo`, `itens` (`nome`, `valor`, `rotulo`), `fonte`.

Para ver uma animação sem gerar o MP4, use "Ver animação" na aba Blocos.

## Regras que valem aqui também

- Todo número com fonte oficial e ano, na tela e na descrição.
- Pré-campanha: nada de pedido de voto, número de urna ou ataque a pessoas e partidos. Os blocos de "frase de político" criticam a frase e o sistema, nunca quem falou.
- Filmando na rua ou na frente de um órgão público, não mostre o rosto de quem está sendo atendido.

## Dicas de gravação

- iPhone: grave em 4K a 30 quadros. Se o vídeo ficar com a cor lavada, desligue o HDR em Ajustes > Câmera > Gravar Vídeo > Vídeo HDR (o `tratar.py` já converte, mas sem HDR é mais rápido).
- Mic DJI: no iPhone, o receptor entra pelo USB-C. No computador, escolha o DJI em "Câmera e microfone" na aba Gravar.
- Grave cada fala duas ou três vezes seguidas. Na etiqueta, marque só a melhor como "A melhor".
- Deixe um segundo de silêncio antes e depois de falar. O corte fica mais limpo.
