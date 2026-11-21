"""Estúdio de gravação do canal. Roda só no seu computador, fora do site.

    python3 videos/estudio/estudio.py          # abre http://localhost:8010
    python3 videos/estudio/estudio.py --porta 8020

Abas: Blocos (o que já foi gravado), Gravar (teleprompter com a webcam), Etiquetar
(dizer qual bloco cada vídeo bruto grava, dar nota e marcar o corte) e Montar
(tratar, animar e montar um roteiro). Só aceita conexão do próprio computador.
"""

import argparse
import json
import re
import subprocess
import sys
import threading
import time
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

from comum import (
    ANIMACOES, BRUTOS, DESIGN_SYSTEM, ESTUDIO, ETIQUETAS, EXTENSOES_VIDEO, FINAL, MIDIA, ROTEIROS,
    TRATADOS, biblioteca, criar_pastas, etiquetas, gravar_json, ler_json, sondar,
)

_cache_sonda = {}
_trava_etq = threading.Lock()
_tarefa = {"processo": None, "acao": None, "log": MIDIA / "tarefa.log"}


def sonda_cacheada(caminho):
    chave = (caminho.name, caminho.stat().st_mtime, caminho.stat().st_size)
    if chave not in _cache_sonda:
        _cache_sonda[chave] = sondar(caminho)
    return _cache_sonda[chave]


def estado():
    dados, _ = biblioteca()
    brutos = []
    for f in sorted(BRUTOS.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if f.suffix.lower() in EXTENSOES_VIDEO and not f.name.startswith("."):
            brutos.append({"arquivo": f.name, "tamanho": f.stat().st_size, "info": sonda_cacheada(f)})
    tratados = {}
    if TRATADOS.exists():
        for pasta in TRATADOS.iterdir():
            if pasta.is_dir():
                tratados[pasta.name] = sorted(p.name for p in pasta.glob("*.mp4"))
    roteiros = []
    for r in sorted(ROTEIROS.glob("*.json")):
        conteudo = ler_json(r, {})
        conteudo["arquivo"] = r.name
        roteiros.append(conteudo)
    return {
        "lugares": dados["lugares"],
        "blocos": dados["blocos"],
        "roteiros": roteiros,
        "etiquetas": etiquetas(),
        "brutos": brutos,
        "tratados": tratados,
        "animacoes": sorted(p.name for p in ANIMACOES.glob("*.mp4")),
        "finais": sorted(p.name for p in FINAL.glob("*") if p.suffix in (".mp4", ".srt")),
        "tarefa": tarefa(),
    }


def tarefa():
    p = _tarefa["processo"]
    rodando = p is not None and p.poll() is None
    log = ""
    if _tarefa["log"].exists():
        log = _tarefa["log"].read_text(encoding="utf-8", errors="replace")[-6000:]
    return {"acao": _tarefa["acao"], "rodando": rodando, "codigo": None if rodando or not p else p.returncode, "log": log}


ACOES = {
    "tratar": lambda d: ["tratar.py"] + (["--bloco", d["bloco"]] if d.get("bloco") else []),
    "animar": lambda d: ["animar.py"] + (["--roteiro", d["roteiro"]] if d.get("roteiro") else []),
    "montar": lambda d: ["montar.py", d["roteiro"]] + (["--rascunho"] if d.get("rascunho") else [])
    + (["--legenda-no-video"] if d.get("legenda_no_video") else []),
}


def rodar_acao(dados):
    p = _tarefa["processo"]
    if p is not None and p.poll() is None:
        return False, "Já tem uma tarefa rodando. Espere ela terminar."
    acao = dados.get("acao")
    if acao not in ACOES or (acao == "montar" and not dados.get("roteiro")):
        return False, "Ação desconhecida."
    for campo in ("roteiro", "bloco"):
        if dados.get(campo) and not re.fullmatch(r"[a-z0-9-]+", dados[campo]):
            return False, f"{campo} inválido."
    cmd = [sys.executable, "-u"] + ACOES[acao](dados)
    log = open(_tarefa["log"], "w", encoding="utf-8")
    log.write("$ " + " ".join(cmd[2:]) + "\n")
    log.flush()
    _tarefa["processo"] = subprocess.Popen(cmd, cwd=ESTUDIO, stdout=log, stderr=subprocess.STDOUT)
    _tarefa["acao"] = acao
    return True, "ok"


def nome_seguro(nome):
    nome = Path(unquote(nome)).name
    nome = re.sub(r"[^A-Za-z0-9._-]+", "-", nome).strip(".-")
    return nome or f"gravacao-{int(time.time())}.webm"


class Estudio(SimpleHTTPRequestHandler):
    silencioso = False

    def log_message(self, formato, *args):
        if self.silencioso:
            return
        if args and "/api/" in str(args[0]):
            return  # o painel consulta a API o tempo todo; não polui o terminal
        super().log_message(formato, *args)

    # ---- arquivos -----------------------------------------------------------
    def translate_path(self, path):
        caminho = unquote(urlparse(path).path)
        if caminho in ("/", ""):
            return str(ESTUDIO / "app" / "index.html")
        for prefixo, raiz in (("/design-system/", DESIGN_SYSTEM), ("/midia/", MIDIA)):
            if caminho.startswith(prefixo):
                return self._dentro(raiz, caminho[len(prefixo):])
        if caminho.startswith(("/app/", "/animacoes/", "/roteiros/")) or caminho == "/blocos.json":
            return self._dentro(ESTUDIO, caminho.lstrip("/"))
        return str(ESTUDIO / "nao-existe")

    @staticmethod
    def _dentro(raiz, resto):
        alvo = (raiz / resto).resolve()
        if alvo != raiz.resolve() and not alvo.is_relative_to(raiz.resolve()):
            return str(ESTUDIO / "nao-existe")
        if alvo.is_dir():
            alvo = alvo / "index.html"
        return str(alvo)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        # Suporte a Range, para o vídeo poder pular para qualquer ponto no navegador.
        intervalo = self.headers.get("Range")
        caminho = Path(self.translate_path(self.path))
        if not intervalo or not caminho.is_file():
            return super().send_head()
        m = re.match(r"bytes=(\d*)-(\d*)", intervalo)
        tamanho = caminho.stat().st_size
        if not m:
            return super().send_head()
        inicio = int(m.group(1)) if m.group(1) else max(0, tamanho - int(m.group(2) or 0))
        fim = int(m.group(2)) if m.group(1) and m.group(2) else tamanho - 1
        fim = min(fim, tamanho - 1)
        if inicio > fim:
            self.send_error(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
            return None
        f = open(caminho, "rb")
        f.seek(inicio)
        self.send_response(HTTPStatus.PARTIAL_CONTENT)
        self.send_header("Content-Type", self.guess_type(str(caminho)))
        self.send_header("Content-Range", f"bytes {inicio}-{fim}/{tamanho}")
        self.send_header("Content-Length", str(fim - inicio + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self._restante = fim - inicio + 1
        return f

    def copyfile(self, origem, destino):
        restante = getattr(self, "_restante", None)
        if restante is None:
            return super().copyfile(origem, destino)
        while restante > 0:
            pedaco = origem.read(min(1 << 20, restante))
            if not pedaco:
                break
            destino.write(pedaco)
            restante -= len(pedaco)
        self._restante = None

    # ---- API ----------------------------------------------------------------
    def do_GET(self):
        rota = urlparse(self.path).path
        if rota == "/api/estado":
            return self._json(estado())
        if rota == "/api/tarefa":
            return self._json(tarefa())
        return super().do_GET()

    def do_POST(self):
        url = urlparse(self.path)
        tamanho = int(self.headers.get("Content-Length") or 0)
        if url.path == "/api/gravar":
            q = parse_qs(url.query)
            nome = nome_seguro(q.get("nome", [""])[0])
            destino = BRUTOS / nome
            with open(destino, "wb") as f:
                restante = tamanho
                while restante > 0:
                    pedaco = self.rfile.read(min(1 << 20, restante))
                    if not pedaco:
                        break
                    f.write(pedaco)
                    restante -= len(pedaco)
            bloco, lugar = q.get("bloco", [""])[0], q.get("lugar", [""])[0]
            if bloco:
                with _trava_etq:
                    etq = etiquetas()
                    etq[nome] = {"lugar": lugar, "camera": "webcam", "trechos": [{"bloco": bloco, "nota": 0}]}
                    gravar_json(ETIQUETAS, etq)
            return self._json({"arquivo": nome})
        dados = json.loads(self.rfile.read(tamanho) or b"{}")
        if url.path == "/api/etiqueta":
            arquivo = nome_seguro(dados.get("arquivo", ""))
            with _trava_etq:
                etq = etiquetas()
                if dados.get("etiqueta") is None:
                    etq.pop(arquivo, None)
                else:
                    etq[arquivo] = dados["etiqueta"]
                gravar_json(ETIQUETAS, etq)
            return self._json({"ok": True})
        if url.path == "/api/rodar":
            ok, msg = rodar_acao(dados)
            return self._json({"ok": ok, "mensagem": msg}, HTTPStatus.OK if ok else HTTPStatus.CONFLICT)
        self.send_error(HTTPStatus.NOT_FOUND)

    def _json(self, dados, status=HTTPStatus.OK):
        corpo = json.dumps(dados, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)


Estudio.extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".mov": "video/quicktime", ".webm": "video/webm",
                          ".mp4": "video/mp4", ".srt": "text/plain; charset=utf-8", ".json": "application/json"}


def servidor(porta=0, silencioso=False):
    """Servidor do estúdio. porta=0 escolhe uma livre (usado pelo animar.py)."""
    criar_pastas()
    classe = type("EstudioSilencioso", (Estudio,), {"silencioso": True}) if silencioso else Estudio
    return ThreadingHTTPServer(("127.0.0.1", porta), classe)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--porta", type=int, default=8010)
    p.add_argument("--sem-navegador", action="store_true")
    a = p.parse_args()
    s = servidor(a.porta)
    url = f"http://localhost:{a.porta}/"
    print(f"Estúdio aberto em {url}\nVídeos em {MIDIA}\nCtrl+C para fechar.")
    if not a.sem_navegador:
        threading.Timer(0.5, webbrowser.open, [url]).start()
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        print("\nEstúdio fechado.")


if __name__ == "__main__":
    main()
