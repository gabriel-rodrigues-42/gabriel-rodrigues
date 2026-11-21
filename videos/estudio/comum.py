"""Caminhos e funções usadas por todos os scripts do estúdio.

Tudo o que é vídeo fica em videos/estudio/midia/, que não vai para o Git:
- brutos/      o que sai da câmera (iPhone, webcam). Nunca é alterado.
- etiquetas.json  qual bloco cada vídeo bruto grava, a nota da tomada e o corte.
- tratados/    as tomadas boas, cortadas, com som igualado, em 1920x1080 (h) e 1080x1920 (v).
- animacoes/   os blocos animados, gerados por animar.py.
- final/       os vídeos montados por montar.py, com a legenda em .srt ao lado.
"""

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ESTUDIO = Path(__file__).resolve().parent
RAIZ = ESTUDIO.parent.parent
DESIGN_SYSTEM = RAIZ / "site" / "design-system"
MIDIA = ESTUDIO / "midia"
BRUTOS = MIDIA / "brutos"
TRATADOS = MIDIA / "tratados"
ANIMACOES = MIDIA / "animacoes"
FINAL = MIDIA / "final"
ETIQUETAS = MIDIA / "etiquetas.json"
BLOCOS = ESTUDIO / "blocos.json"
ROTEIROS = ESTUDIO / "roteiros"

EXTENSOES_VIDEO = {".mov", ".mp4", ".m4v", ".webm", ".mkv"}

# Saída padrão: 30 quadros por segundo, H.264 e AAC, que o YouTube e qualquer editor abrem.
FPS = 30
TAMANHOS = {"h": (1920, 1080), "v": (1080, 1920)}


def criar_pastas():
    for pasta in (BRUTOS, TRATADOS, ANIMACOES, FINAL):
        pasta.mkdir(parents=True, exist_ok=True)


def ler_json(caminho, padrao=None):
    try:
        return json.loads(Path(caminho).read_text(encoding="utf-8"))
    except FileNotFoundError:
        return padrao


def gravar_json(caminho, dados):
    caminho = Path(caminho)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    tmp = caminho.with_suffix(".tmp")
    tmp.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(caminho)


def biblioteca():
    dados = ler_json(BLOCOS)
    return dados, {b["id"]: b for b in dados["blocos"]}


def etiquetas():
    return ler_json(ETIQUETAS, {})


def precisa(programa):
    if not shutil.which(programa):
        sys.exit(f"Falta o {programa}. No Mac: brew install ffmpeg. No Windows: winget install ffmpeg.")


def rodar(cmd):
    """Roda um comando e para tudo se ele falhar, mostrando o fim do erro."""
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(str(c) for c in cmd), file=sys.stderr)
        print(r.stderr[-3000:], file=sys.stderr)
        sys.exit(f"O comando falhou ({cmd[0]}).")
    return r


def sondar(arquivo):
    """Lê duração, tamanho, rotação e cor de um vídeo com o ffprobe."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(arquivo)],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        return None
    info = json.loads(r.stdout)
    video = next((s for s in info.get("streams", []) if s.get("codec_type") == "video"), None)
    audio = next((s for s in info.get("streams", []) if s.get("codec_type") == "audio"), None)
    if not video:
        return None
    largura, altura = int(video.get("width", 0)), int(video.get("height", 0))
    rotacao = 0
    for lado in video.get("side_data_list", []) or []:
        if "rotation" in lado:
            rotacao = int(lado["rotation"])
    rotacao = int(video.get("tags", {}).get("rotate", rotacao))
    if abs(rotacao) % 180 == 90:
        largura, altura = altura, largura
    duracao = float(info.get("format", {}).get("duration") or video.get("duration") or 0)
    transfer = video.get("color_transfer", "")
    return {
        "duracao": round(duracao, 2),
        "largura": largura,
        "altura": altura,
        "vertical": altura > largura,
        "hdr": transfer in ("arib-std-b67", "smpte2084"),
        "tem_audio": audio is not None,
    }


def legenda_srt(texto, duracao, inicio=0.0):
    """Monta uma legenda a partir do texto do bloco: uma frase por vez, com tempo
    proporcional ao tamanho da frase. É um rascunho bom; o YouTube acerta o tempo
    fino se você subir o .srt ou o .txt como transcrição."""
    frases = [f.strip() for f in re.split(r"(?<=[.!?:])\s+", texto.strip()) if f.strip()]
    if not frases or duracao <= 0:
        return []
    total = sum(len(f) for f in frases)
    itens, t = [], inicio
    for f in frases:
        d = duracao * len(f) / total
        itens.append((t, t + d, f))
        t += d
    return itens


def tempo_srt(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def escrever_srt(caminho, itens):
    linhas = []
    for i, (a, b, texto) in enumerate(itens, 1):
        linhas += [str(i), f"{tempo_srt(a)} --> {tempo_srt(b)}", texto, ""]
    Path(caminho).write_text("\n".join(linhas), encoding="utf-8")


def trechos(etq=None):
    """Cada vídeo bruto pode ter um ou mais trechos, cada um gravando um bloco.
    Devolve (arquivo, índice, trecho) com o lugar e a câmera do vídeo já dentro do trecho."""
    etq = etiquetas() if etq is None else etq
    for arquivo, e in sorted(etq.items()):
        lista = e.get("trechos")
        if lista is None and e.get("bloco"):  # formato antigo: um bloco por vídeo
            lista = [e]
        for i, t in enumerate(lista or []):
            if t.get("bloco"):
                yield arquivo, i, {"lugar": e.get("lugar"), "camera": e.get("camera"), **t}


def nome_tratado(arquivo, indice, formato=None):
    base = f"{Path(arquivo).stem}-{indice + 1}"
    return f"{base}-{formato}.mp4" if formato else base


def melhor_tomada(bloco_id, formato, etq=None):
    """A tomada tratada de maior nota para o bloco. Empate: a mais recente.
    Devolve (vídeo tratado, legenda .srt) ou None."""
    candidatos = []
    for arquivo, i, t in trechos(etq):
        if t["bloco"] != bloco_id or t.get("descartar"):
            continue
        tratado = TRATADOS / bloco_id / nome_tratado(arquivo, i, formato)
        if tratado.exists():
            srt = TRATADOS / bloco_id / f"{nome_tratado(arquivo, i)}.srt"
            candidatos.append((int(t.get("nota") or 0), tratado.stat().st_mtime, str(tratado), str(srt)))
    if not candidatos:
        return None
    candidatos.sort(reverse=True)
    return Path(candidatos[0][2]), Path(candidatos[0][3])
