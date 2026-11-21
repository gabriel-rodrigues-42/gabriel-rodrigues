"""Monta um vídeo a partir de um roteiro (roteiros/<nome>.json).

Para cada bloco do roteiro, pega a melhor tomada tratada (maior nota) ou a animação,
junta tudo em ordem e salva em midia/final/<slug>-<formato>.mp4, com a legenda
em .srt ao lado e a transcrição em .txt (o YouTube sincroniza a transcrição sozinho).

    python3 videos/estudio/montar.py cartorio-digital
    python3 videos/estudio/montar.py cartorio-digital --rascunho          # põe um aviso no lugar do que falta
    python3 videos/estudio/montar.py cartorio-digital --legenda-no-video  # grava a legenda na imagem também
    python3 videos/estudio/montar.py cartorio-digital --falta             # só lista o que falta gravar

Antes, rode tratar.py (tomadas) e animar.py (animações). O montar.py chama os dois
sozinho se faltar alguma coisa.
"""

import argparse
import subprocess
import sys
from pathlib import Path

from comum import (
    ANIMACOES, ESTUDIO, FINAL, FPS, ROTEIROS, TAMANHOS, TRATADOS, biblioteca, criar_pastas,
    escrever_srt, etiquetas, legenda_srt, ler_json, melhor_tomada, precisa, rodar, sondar,
)


def ler_srt(caminho):
    itens = []
    if not caminho.exists():
        return itens
    for bloco in caminho.read_text(encoding="utf-8").strip().split("\n\n"):
        linhas = bloco.splitlines()
        if len(linhas) < 3:
            continue
        a, b = (parte.strip() for parte in linhas[1].split("-->"))
        itens.append((segundos(a), segundos(b), "\n".join(linhas[2:])))
    return itens


def segundos(t):
    h, m, resto = t.split(":")
    s, ms = resto.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def faltando(roteiro, blocos, formato, etq):
    falta = []
    for bid in roteiro["blocos"]:
        b = blocos.get(bid)
        if b and b["tipo"] == "fala" and not melhor_tomada(bid, formato, etq):
            falta.append(b)
    return falta


def lista_de_gravacao(falta, lugares):
    """Agrupa o que falta por lugar, para gravar tudo de um lugar de uma vez."""
    nomes = {l["id"]: l for l in lugares}
    grupos = {}
    for b in falta:
        grupos.setdefault((b.get("lugares") or ["qualquer"])[0], []).append(b)
    linhas = []
    for lugar, itens in grupos.items():
        info = nomes.get(lugar, {"nome": lugar, "dica": ""})
        linhas.append(f"\n## {info['nome']}\n{info.get('dica', '')}")
        for b in itens:
            outros = [nomes.get(x, {"nome": x})["nome"] for x in b.get("lugares", [])[1:]]
            linhas.append(f"- [{b['id']}] {b['texto']}" + (f"  (ou: {', '.join(outros)})" if outros else ""))
    return "\n".join(linhas)


def montar(roteiro, formato, rascunho, legenda_no_video):
    dados, blocos = biblioteca()
    etq = etiquetas()
    slug = roteiro["slug"]
    partes, legendas, transcricao, t = [], [], [], 0.0
    falta = []
    for bid in roteiro["blocos"]:
        b = blocos.get(bid)
        if not b:
            sys.exit(f"O bloco '{bid}' do roteiro não existe em blocos.json")
        if b["tipo"] == "animacao":
            arquivo = ANIMACOES / f"{bid}-{formato}.mp4"
            if not arquivo.exists():
                sys.exit(f"Falta a animação {arquivo.name}. Rode: python3 videos/estudio/animar.py --roteiro {slug}")
            srt = []
        else:
            achado = melhor_tomada(bid, formato, etq)
            if achado:
                arquivo = achado[0]
                srt = ler_srt(achado[1])
            elif rascunho:
                arquivo = aviso_falta(b, formato)
                srt = []
            else:
                falta.append(b)
                continue
            transcricao.append(b["texto"])
        info = sondar(arquivo)
        partes.append(arquivo)
        legendas += [(t + a, t + c, txt) for a, c, txt in srt]
        t += info["duracao"]
    if falta:
        print(f"Faltam {len(falta)} fala(s) para {slug} ({formato}):" + lista_de_gravacao(falta, dados["lugares"]))
        print("\nGrave, etiquete e rode de novo. Ou use --rascunho para ver o vídeo com avisos no lugar.")
        return False

    saida = FINAL / f"{slug}-{formato}.mp4"
    srt_final = FINAL / f"{slug}-{formato}.srt"
    escrever_srt(srt_final, legendas)
    (FINAL / f"{slug}.txt").write_text("\n".join(transcricao) + "\n", encoding="utf-8")

    largura, altura = TAMANHOS[formato]
    cmd = ["ffmpeg", "-hide_banner", "-y"]
    for p in partes:
        cmd += ["-i", str(p)]
    entradas = "".join(
        f"[{i}:v]scale={largura}:{altura},fps={FPS},setsar=1,format=yuv420p[v{i}];[{i}:a]aresample=48000[a{i}];"
        for i in range(len(partes))
    )
    juntar = "".join(f"[v{i}][a{i}]" for i in range(len(partes))) + f"concat=n={len(partes)}:v=1:a=1[vc][a]"
    filtro = entradas + juntar
    if legenda_no_video:
        caminho = str(srt_final).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
        tamanho = 13 if formato == "h" else 11
        estilo = (f"FontName=Nunito,FontSize={tamanho},Bold=1,PrimaryColour=&H00FFFFFF,OutlineColour=&H00762700,"
                  f"BorderStyle=1,Outline=2,Shadow=0,MarginV={40 if formato == 'h' else 140}")
        filtro += f";[vc]subtitles='{caminho}':force_style='{estilo}'[v]"
    else:
        filtro += ";[vc]null[v]"
    cmd += ["-filter_complex", filtro, "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(saida)]
    print(f"Montando {saida.name}: {len(partes)} blocos, {t:.1f}s")
    rodar(cmd)
    print(f"Pronto: {saida}\nLegenda: {srt_final}")
    return True


def aviso_falta(b, formato):
    from animar import navegador, renderizar

    saida = ANIMACOES / f"falta-{b['id']}-{formato}.mp4"
    if not saida.exists():
        with navegador() as (nav, base):
            duracao = max(2.5, len(b["texto"]) / 15)  # uns 15 caracteres por segundo de fala
            renderizar(nav, base, {"modelo": "falta", "bloco": b["titulo"], "texto": b["texto"]}, duracao, formato, saida)
    return saida


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("roteiro", help="nome do roteiro, sem .json (ex.: cartorio-digital)")
    p.add_argument("--formatos", help="h, v ou h,v (padrão: os do roteiro)")
    p.add_argument("--rascunho", action="store_true", help="aviso na tela no lugar das falas que faltam")
    p.add_argument("--legenda-no-video", action="store_true", help="grava a legenda na imagem (além do .srt)")
    p.add_argument("--falta", action="store_true", help="só mostra a lista do que falta gravar")
    a = p.parse_args()
    precisa("ffmpeg")
    criar_pastas()
    roteiro = ler_json(ROTEIROS / f"{a.roteiro}.json")
    if not roteiro:
        sys.exit(f"Não achei roteiros/{a.roteiro}.json")
    formatos = a.formatos.split(",") if a.formatos else roteiro.get("formatos", ["h"])
    dados, blocos = biblioteca()

    if a.falta:
        etq = etiquetas()
        for f in formatos:
            falta = faltando(roteiro, blocos, f, etq)
            print(f"{roteiro['slug']} ({f}): " + ("tudo gravado." if not falta else
                                                   f"faltam {len(falta)}" + lista_de_gravacao(falta, dados["lugares"])))
        return

    # Garante tomadas tratadas e animações em dia antes de montar.
    subprocess.run([sys.executable, str(ESTUDIO / "tratar.py"), "--formatos", ",".join(formatos)], check=True)
    subprocess.run([sys.executable, str(ESTUDIO / "animar.py"), "--roteiro", a.roteiro,
                    "--formatos", ",".join(formatos)], check=True)
    ok = all([montar(roteiro, f, a.rascunho, a.legenda_no_video) for f in formatos])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
