"""Gera a miniatura de uma proposta no Recraft, no estilo da galeria, e salva em site/projetos/img/<id>.webp.

Uso (a chave fica só na variável de ambiente, nunca no Git):
    RECRAFT_API_KEY=... python3 scripts/miniaturas/gerar.py <id> "o que aparece na cena, em inglês"

Exemplo:
    python3 scripts/miniaturas/gerar.py desafio-dumont "A small modular electric car with swappable colorful body panels, a wrench and a charging plug"

Precisa de Pillow. Na nuvem do Claude, libere o host external.api.recraft.ai na rede do ambiente.
O resultado vem em base64 (o host das imagens, img.recraft.ai, não precisa ser liberado).
"""
import base64, io, json, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFilter

ESTILO = ("Centered small toy diorama on a round blue base, whole scene visible with margin around it. "
          "Warm cream paper background, soft rounded organic shapes, Brazilian palette of flag green, "
          "sunny yellow and deep blue, no text, no letters, no words.")
# Cores de site/design-system/tokens.css: --verde, --amarelo, --azul, --azul-medio, --livre-coral.
CORES = [[0, 156, 59], [255, 223, 0], [0, 39, 118], [47, 91, 183], [255, 122, 69]]


def gerar(cena):
    corpo = {"prompt": f"{cena}. {ESTILO}", "style": "digital_illustration", "substyle": "plastic",
             "model": "recraftv3", "size": "1365x1024", "n": 1, "response_format": "b64_json",
             "controls": {"colors": [{"rgb": c} for c in CORES], "background_color": {"rgb": [251, 248, 239]}}}
    req = urllib.request.Request("https://external.api.recraft.ai/v1/images/generations", data=json.dumps(corpo).encode(),
                                 headers={"Authorization": "Bearer " + os.environ["RECRAFT_API_KEY"], "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=180))
    return Image.open(io.BytesIO(base64.b64decode(r["data"][0]["b64_json"]))).convert("RGB")


def recortar(im):
    """Tira o fundo claro que encosta nas bordas e corta com uma margem."""
    w, h = im.size
    m = im.copy()
    for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        ImageDraw.floodfill(m, p, (255, 0, 255), thresh=28)
    alfa = Image.new("L", (w, h), 255)
    alfa.putdata([0 if px == (255, 0, 255) else 255 for px in m.getdata()])
    alfa = alfa.filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(alfa)
    x0, y0, x1, y1 = alfa.point(lambda v: 255 if v > 20 else 0).getbbox()
    im = im.crop((max(x0 - 40, 0), max(y0 - 40, 0), min(x1 + 40, w), min(y1 + 40, h)))
    im.thumbnail((720, 560), Image.LANCZOS)
    return im


if __name__ == "__main__":
    pid, cena = sys.argv[1], sys.argv[2]
    raiz = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    saida = os.path.join(raiz, "site", "projetos", "img", f"{pid}.webp")
    recortar(gerar(cena)).save(saida, "WEBP", quality=82, method=6)
    print(saida)
