"""Trata as tomadas etiquetadas: corta, iguala o som e deixa no tamanho certo.

Para cada trecho etiquetado em midia/etiquetas.json (um vídeo bruto pode ter vários):
- corta do início ao fim marcados na etiqueta;
- converte vídeo HDR do iPhone para cor normal (sem isso fica lavado no YouTube);
- limpa chiado leve, corta o grave do vento e iguala o volume em -16 LUFS, o padrão de vídeo na internet;
- gera a versão horizontal (h, 1920x1080) e a vertical (v, 1080x1920), a 30 quadros por segundo;
- escreve a legenda do bloco em .srt, uma frase por vez.

O bruto nunca é alterado. Rodar de novo só refaz o que mudou.

    python3 videos/estudio/tratar.py              # todas as tomadas etiquetadas
    python3 videos/estudio/tratar.py --bloco cartorio-gancho
    python3 videos/estudio/tratar.py --formatos h # só horizontal
"""

import argparse
import json
import subprocess
import sys

from comum import (
    BRUTOS, FPS, TAMANHOS, TRATADOS, biblioteca, criar_pastas, escrever_srt, gravar_json,
    ler_json, legenda_srt, nome_tratado, precisa, rodar, sondar, trechos,
)

VERSAO = 1  # mude quando mudar o tratamento, para refazer tudo

HDR_PARA_SDR = (
    "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
    "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv"
)


def tem_zscale():
    r = subprocess.run(["ffmpeg", "-hide_banner", "-filters"], capture_output=True, text=True)
    return " zscale " in r.stdout


def filtro_video(info, formato, e, zscale):
    largura, altura = TAMANHOS[formato]
    partes = []
    if info["hdr"]:
        if zscale:
            partes.append(HDR_PARA_SDR)
        else:
            print("  aviso: vídeo HDR e este ffmpeg não tem zscale. A cor pode ficar lavada."
                  " No iPhone: Ajustes > Câmera > Gravar Vídeo > desligue Vídeo HDR.")
    partes.append(f"fps={FPS}")
    destino_vertical = altura > largura
    encaixe = e.get(f"encaixe_{formato}")
    if not encaixe:
        # Mesma orientação: corta a sobra. Horizontal virando vertical: corta no rosto.
        # Vertical virando horizontal: fundo desfocado, porque cortar perderia demais.
        encaixe = "desfocar" if (info["vertical"] and not destino_vertical) else "cortar"
    x = max(0, min(100, float(e.get("posicao_x", 50)))) / 100
    y = max(0, min(100, float(e.get("posicao_y", 50)))) / 100
    base = ",".join(partes)
    if encaixe == "desfocar":
        return (
            f"[0:v]{base},split[a][b];"
            f"[a]scale={largura}:{altura}:force_original_aspect_ratio=increase,"
            f"crop={largura}:{altura},boxblur=40:2,eq=brightness=-0.06[fundo];"
            f"[b]scale={largura}:{altura}:force_original_aspect_ratio=decrease[frente];"
            f"[fundo][frente]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[v]"
        )
    return (
        f"[0:v]{base},scale={largura}:{altura}:force_original_aspect_ratio=increase,"
        f"crop={largura}:{altura}:(iw-{largura})*{x}:(ih-{altura})*{y},setsar=1,format=yuv420p[v]"
    )


def medir_volume(bruto, inicio, duracao):
    """Primeira passada do loudnorm: mede o volume da tomada."""
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostats", "-ss", str(inicio), "-t", str(duracao), "-i", str(bruto),
         "-af", "highpass=f=80,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
         "-vn", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    texto = r.stderr
    try:
        return json.loads(texto[texto.rindex("{"): texto.rindex("}") + 1])
    except ValueError:
        return None


def filtro_audio(medida, duracao):
    fade = max(0.0, duracao - 0.06)
    if medida and medida.get("input_i") not in (None, "-inf"):
        ln = (
            "loudnorm=I=-16:TP=-1.5:LRA=11:linear=true"
            f":measured_I={medida['input_i']}:measured_TP={medida['input_tp']}"
            f":measured_LRA={medida['input_lra']}:measured_thresh={medida['input_thresh']}"
            f":offset={medida['target_offset']}"
        )
    else:
        ln = "loudnorm=I=-16:TP=-1.5:LRA=11"
    return f"highpass=f=80,afftdn=nf=-25,{ln},aresample=48000,afade=t=in:d=0.05,afade=t=out:st={fade:.2f}:d=0.05"


def tratar(arquivo, indice, e, bloco, formatos, zscale, forcar):
    bruto = BRUTOS / arquivo
    if not bruto.exists():
        print(f"- {arquivo}: não está em brutos/, pulei")
        return
    info = sondar(bruto)
    if not info:
        print(f"- {arquivo}: não consegui ler o vídeo, pulei")
        return
    inicio = float(e.get("inicio") or 0)
    fim = float(e.get("fim") or info["duracao"])
    duracao = round(max(0.5, fim - inicio), 3)
    pasta = TRATADOS / e["bloco"]
    pasta.mkdir(parents=True, exist_ok=True)
    stem = nome_tratado(arquivo, indice)
    receita = {"versao": VERSAO, "etiqueta": {k: e.get(k) for k in sorted(e) if k not in ("nota", "obs")},
               "texto": bloco.get("texto", ""), "duracao_bruto": info["duracao"]}
    marca = pasta / f"{stem}.json"
    feito = ler_json(marca, {})
    pendentes = [f for f in formatos if forcar or feito.get(f) != receita or not (pasta / f"{stem}-{f}.mp4").exists()]
    if not pendentes:
        print(f"- {arquivo} #{indice + 1}: já tratado")
        return
    print(f"- {arquivo} #{indice + 1} -> {e['bloco']} ({duracao:.1f}s){' HDR' if info['hdr'] else ''}")
    medida = medir_volume(bruto, inicio, duracao) if info["tem_audio"] else None
    for formato in pendentes:
        saida = pasta / f"{stem}-{formato}.mp4"
        cmd = ["ffmpeg", "-hide_banner", "-y", "-ss", str(inicio), "-t", str(duracao), "-i", str(bruto)]
        if not info["tem_audio"]:
            cmd += ["-f", "lavfi", "-t", str(duracao), "-i", "anullsrc=r=48000:cl=stereo"]
        cmd += ["-filter_complex", filtro_video(info, formato, e, zscale), "-map", "[v]"]
        if info["tem_audio"]:
            cmd += ["-map", "0:a:0", "-af", filtro_audio(medida, duracao)]
        else:
            cmd += ["-map", "1:a"]
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-g", str(FPS * 2),
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                "-movflags", "+faststart", "-t", str(duracao), str(saida)]
        rodar(cmd)
        feito[formato] = receita
        print(f"    {formato}: {saida.relative_to(TRATADOS.parent)}")
    escrever_srt(pasta / f"{stem}.srt", legenda_srt(bloco.get("texto", ""), duracao))
    gravar_json(marca, feito)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--bloco", help="só as tomadas deste bloco")
    p.add_argument("--formatos", default="h,v", help="h, v ou h,v (padrão)")
    p.add_argument("--forcar", action="store_true", help="refaz mesmo o que já foi tratado")
    a = p.parse_args()
    precisa("ffmpeg")
    criar_pastas()
    _, blocos = biblioteca()
    formatos = [f for f in a.formatos.split(",") if f in TAMANHOS]
    zscale = tem_zscale()
    feitos = 0
    for arquivo, indice, e in trechos():
        if e.get("descartar"):
            continue
        if a.bloco and e["bloco"] != a.bloco:
            continue
        if e["bloco"] not in blocos:
            print(f"- {arquivo}: o bloco '{e['bloco']}' não existe em blocos.json, pulei")
            continue
        tratar(arquivo, indice, e, blocos[e["bloco"]], formatos, zscale, a.forcar)
        feitos += 1
    if not feitos:
        print("Nenhuma tomada etiquetada. Abra o estúdio (python3 videos/estudio/estudio.py) e etiquete os brutos.")


if __name__ == "__main__":
    sys.exit(main())
