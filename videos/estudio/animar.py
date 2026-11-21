"""Gera os blocos animados (tipo "animacao" em blocos.json) como MP4.

Abre animacoes/index.html no Chromium, para a animação em cada quadro, tira um print
e manda para o ffmpeg. O resultado é igual toda vez, sem pulo de quadro.

    python3 videos/estudio/animar.py                         # todos os blocos animados, h e v
    python3 videos/estudio/animar.py --roteiro cartorio-digital
    python3 videos/estudio/animar.py --bloco cartorio-fundos --formatos v

Precisa do Playwright (uma vez):
    python3 -m pip install playwright && python3 -m playwright install chromium
Se já tiver um Chromium, aponte com CHROMIUM=/caminho/do/chrome.
"""

import argparse
import contextlib
import json
import os
import subprocess
import sys
import threading
from pathlib import Path
from urllib.parse import quote

from comum import ANIMACOES, FPS, ROTEIROS, TAMANHOS, biblioteca, criar_pastas, ler_json, gravar_json, precisa

VERSAO = 1  # mude quando mudar animacoes/index.html, para refazer tudo


@contextlib.contextmanager
def navegador():
    """Sobe o servidor do estúdio numa porta livre e abre o Chromium."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Falta o Playwright: python3 -m pip install playwright && python3 -m playwright install chromium")
    from estudio import servidor

    s = servidor(0, silencioso=True)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{s.server_address[1]}"
    with sync_playwright() as p:
        opcoes = {"executable_path": os.environ["CHROMIUM"]} if os.environ.get("CHROMIUM") else {}
        b = p.chromium.launch(**opcoes)
        try:
            yield b, base
        finally:
            b.close()
            s.shutdown()


def renderizar(b, base, dados, duracao, formato, saida):
    largura, altura = TAMANHOS[formato]
    pagina = b.new_page(viewport={"width": largura, "height": altura}, device_scale_factor=1)
    try:
        dados = {**dados, "formato": formato}
        pagina.goto(f"{base}/animacoes/index.html#{quote(json.dumps(dados, ensure_ascii=False))}")
        pagina.evaluate("pronto()")
        quadros = int(round(duracao * FPS))
        ff = subprocess.Popen(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
             "-f", "lavfi", "-t", f"{quadros / FPS:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
             "-map", "0:v", "-map", "1:a", "-shortest",
             "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-g", str(FPS * 2),
             "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(saida)],
            stdin=subprocess.PIPE,
        )
        for i in range(quadros):
            pagina.evaluate(f"quadro({i / FPS})")
            ff.stdin.write(pagina.screenshot(type="png"))
        ff.stdin.close()
        if ff.wait() != 0:
            sys.exit(f"O ffmpeg falhou ao gerar {saida.name}")
    finally:
        pagina.close()


def blocos_animados(roteiro=None, so_bloco=None):
    _, blocos = biblioteca()
    if so_bloco:
        ids = [so_bloco]
    elif roteiro:
        r = ler_json(ROTEIROS / f"{roteiro}.json")
        if not r:
            sys.exit(f"Não achei roteiros/{roteiro}.json")
        ids = list(dict.fromkeys(r["blocos"]))
    else:
        ids = list(blocos)
    return [blocos[i] for i in ids if i in blocos and blocos[i]["tipo"] == "animacao"]


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--roteiro", help="só os blocos animados deste roteiro (nome do arquivo sem .json)")
    p.add_argument("--bloco", help="só este bloco")
    p.add_argument("--formatos", help="h, v ou h,v (padrão: os do roteiro, ou os dois)")
    p.add_argument("--forcar", action="store_true", help="refaz mesmo o que já existe")
    a = p.parse_args()
    precisa("ffmpeg")
    criar_pastas()
    if a.formatos:
        formatos = a.formatos.split(",")
    elif a.roteiro:
        formatos = (ler_json(ROTEIROS / f"{a.roteiro}.json") or {}).get("formatos", ["h", "v"])
    else:
        formatos = ["h", "v"]
    lista = blocos_animados(a.roteiro, a.bloco)
    marcas = ler_json(ANIMACOES / "feitos.json", {})
    pendentes = []
    for bloco in lista:
        for f in formatos:
            receita = {"versao": VERSAO, "animacao": bloco["animacao"], "duracao": bloco.get("duracao", 5)}
            saida = ANIMACOES / f"{bloco['id']}-{f}.mp4"
            if a.forcar or not saida.exists() or marcas.get(saida.name) != receita:
                pendentes.append((bloco, f, saida, receita))
    if not pendentes:
        print("Animações em dia.")
        return
    with navegador() as (b, base):
        for bloco, f, saida, receita in pendentes:
            print(f"- {bloco['id']} ({f}, {receita['duracao']}s)")
            renderizar(b, base, bloco["animacao"], receita["duracao"], f, saida)
            marcas[saida.name] = receita
            gravar_json(ANIMACOES / "feitos.json", marcas)
    print(f"Pronto: {len(pendentes)} animação(ões) em {ANIMACOES}")


if __name__ == "__main__":
    main()
