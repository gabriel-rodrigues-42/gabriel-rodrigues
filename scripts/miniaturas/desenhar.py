"""Desenha as miniaturas da galeria de propostas e a capa de /projetos/ em SVG.

Estilo: ilustração editorial plana. Formas geométricas simples, sem brilho, sem 3D, sem texto,
cores lidas direto de site/design-system/tokens.css (mudou o token, rode de novo).
Fundo transparente: o palco do cartão (galeria.css) dá a cor de fundo.

Uso:
    python3 scripts/miniaturas/desenhar.py            # todas
    python3 scripts/miniaturas/desenhar.py ideia      # só uma

Saída: site/projetos/img/<id>.svg (700x560). Proposta nova: escreva uma função aqui,
registre em DESENHOS e aponte o campo img de site/projetos/propostas.js para o SVG.
"""
import math, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TOKENS = open(os.path.join(RAIZ, "site", "design-system", "tokens.css"), encoding="utf-8").read()
C = {n: v for n, v in re.findall(r"--([a-z-]+):\s*(#[0-9a-fA-F]{6})", TOKENS)}
W, H = 700, 560


def svg(titulo, corpo):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'role="img"><title>{titulo}</title>{corpo}</svg>\n')


def ret(x, y, w, h, cor, r=0, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{C[cor]}"{extra}/>'


def circ(cx, cy, r, cor, extra=""):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{C[cor]}"{extra}/>'


def cam(d, cor, extra=""):
    return f'<path d="{d}" fill="{C[cor]}"{extra}/>'


def traco(d, cor, w, extra="", ponta="round"):
    return f'<path d="{d}" fill="none" stroke="{C[cor]}" stroke-width="{w}" stroke-linecap="{ponta}" stroke-linejoin="round"{extra}/>'


def linhas(x, y, larguras, cor, passo=18, alt=8):
    """Linhas de texto falsas, como num documento."""
    return "".join(ret(x, y + i * passo, w, alt, cor, alt / 2) for i, w in enumerate(larguras))


def engrenagem(cx, cy, r, dentes, cor, furo):
    pts = []
    for i in range(dentes * 2):
        a0 = math.pi * 2 * i / (dentes * 2)
        a1 = math.pi * 2 * (i + 1) / (dentes * 2)
        raio = r if i % 2 == 0 else r * .8
        for a in (a0 + .06, a1 - .06):
            pts.append(f"{cx + raio * math.cos(a):.1f},{cy + raio * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{C[cor]}"/>' + circ(cx, cy, r * .36, furo)


def estrela(cx, cy, r, cor):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + math.pi * i / 5
        rr = r if i % 2 == 0 else r * .45
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{C[cor]}"/>'


def chao(x, y, w, cor="azul"):
    return ret(x, y, w, 12, cor, 6)


def congresso(x, y, esc=1.0, cor="azul-medio", claro="branco"):
    """Silhueta do Congresso Nacional: duas torres, a cúpula do Senado e a cuba da Câmara. x, y = pé do centro."""
    s = esc
    return (f'<g transform="translate({x} {y}) scale({s})">'
            + ret(-150, -14, 300, 14, cor, 4)
            + ret(-22, -150, 18, 136, cor) + ret(4, -150, 18, 136, cor) + ret(-22, -100, 44, 8, cor)
            + cam("M-130,-14 Q-95,-62 -60,-14 Z", claro) + traco("M-130,-14 Q-95,-62 -60,-14", cor, 6)
            + cam("M55,-44 L145,-44 Q132,-14 100,-14 Q68,-14 55,-44 Z", cor)
            + "</g>")


def casa(x, y, w, corpo="azul-medio", telhado="verde", janela="amarelo"):
    h = w * .7
    return (cam(f"M{x - 8},{y - h} L{x + w / 2},{y - h - w * .45} L{x + w + 8},{y - h} Z", telhado)
            + ret(x, y - h, w, h, corpo) + ret(x + w * .38, y - h * .55, w * .24, h * .55, telhado)
            + ret(x + w * .12, y - h * .8, w * .18, w * .18, janela, 2) + ret(x + w * .7, y - h * .8, w * .18, w * .18, janela, 2))


def fabrica(x, y, w, h):
    dente = w / 3
    telhado = f"M{x},{y - h} " + " ".join(f"L{x + dente * i},{y - h - 50} L{x + dente * (i + 1)},{y - h}" for i in range(3)) + " Z"
    janelas = "".join(ret(x + 22 + i * (w - 44) / 3, y - h + 30, (w - 44) / 3 - 18, 36, "amarelo", 4) for i in range(3))
    return (ret(x + w - 70, y - h - 120, 36, 120, "azul") + ret(x + w - 70, y - h - 120, 36, 16, "verde")
            + cam(telhado, "azul") + ret(x, y - h, w, h, "azul-medio") + janelas
            + ret(x + w / 2 - 26, y - 64, 52, 64, "verde", 4))


def arvore(x, y, r, cor="verde-escuro"):
    return ret(x - 4, y - r * 1.4, 8, r * 1.4, "azul") + circ(x, y - r * 1.6, r, cor)


# ---------- Miniaturas ----------

def galera_club():
    tel = (ret(240, 50, 210, 420, "azul", 34) + ret(254, 72, 182, 376, "branco", 22)
           + circ(345, 140, 34, "verde-claro") + circ(345, 132, 12, "verde") + cam("M323,162 Q345,136 367,162 Z", "verde")
           + ret(295, 188, 100, 12, "azul", 6) + ret(312, 208, 66, 8, "areia", 4)
           + ret(274, 236, 142, 38, "amarelo", 19) + ret(300, 251, 90, 8, "azul", 4)
           + ret(274, 284, 142, 38, "azul-claro", 19) + ret(300, 299, 90, 8, "azul-medio", 4)
           + ret(274, 332, 142, 38, "azul-claro", 19) + ret(300, 347, 70, 8, "azul-medio", 4)
           + ret(274, 392, 142, 40, "verde", 20) + traco("M330,412 L341,423 L362,402", "branco", 6))
    balao = (cam("M462,120 h120 a24,24 0 0 1 24,24 v56 a24,24 0 0 1 -24,24 h-80 l-28,26 v-26 h-12 a24,24 0 0 1 -24,-24 v-56 a24,24 0 0 1 24,-24 Z", "verde")
             + circ(492, 172, 8, "branco") + circ(522, 172, 8, "branco") + circ(552, 172, 8, "branco"))
    moeda = circ(170, 330, 54, "amarelo-escuro") + circ(170, 324, 54, "amarelo") + circ(170, 324, 36, "amarelo-escuro") + circ(170, 324, 28, "amarelo")
    return svg("Celular com perfil, links, pagamento e conversa", moeda + tel + balao
               + estrela(560, 330, 14, "amarelo-escuro") + estrela(130, 180, 10, "azul-medio"))


def reindustrializacao():
    barras = (ret(505, 330, 34, 110, "verde", 6) + ret(551, 270, 34, 170, "verde", 6) + ret(597, 200, 34, 240, "amarelo-escuro", 6))
    seta = traco("M470,300 L540,240 L580,262 L640,170", "azul", 12) + cam("M650,152 L652,200 L612,176 Z", "azul")
    return svg("Fábrica com gráfico de crescimento", engrenagem(150, 170, 52, 10, "amarelo-escuro", "amarelo-claro")
               + engrenagem(220, 120, 32, 8, "verde", "verde-claro")
               + fabrica(110, 440, 360, 170) + barras + seta + chao(80, 440, 570))


def desafio_dumont():
    silhueta = "M140,330 L140,284 Q140,262 162,258 L252,248 L302,198 Q312,188 326,188 L432,188 Q446,188 456,198 L502,246 L560,256 Q578,260 578,280 L578,330 Z"
    fatias = [(140, 288, "verde", 0), (288, 470, "amarelo", -18), (470, 578, "azul-medio", 0)]
    defs, corpo = "", ""
    for i, (x0, x1, cor, dy) in enumerate(fatias):
        defs += f'<clipPath id="f{i}"><rect x="{x0 + (5 if i else 0)}" y="0" width="{x1 - x0 - (5 if i else 0) - (5 if i < 2 else 0)}" height="{H}"/></clipPath>'
        janelas = (cam("M300,246 L330,208 L376,208 L376,246 Z", "azul-claro") + cam("M388,208 L430,208 Q440,208 447,216 L474,246 L388,246 Z", "azul-claro")) if i == 1 else ""
        corpo += f'<g clip-path="url(#f{i})"><g transform="translate(0 {dy})">' + cam(silhueta, cor) + janelas + "</g></g>"
    setas = traco("M380,150 L380,118", "azul-medio", 6) + traco("M368,130 L380,118 L392,130", "azul-medio", 6)
    chassi = ret(130, 330, 458, 30, "azul", 15)
    rodas = "".join(circ(x, 368, 46, "texto") + circ(x, 368, 18, "areia") for x in (226, 492))
    chave = (f'<g transform="rotate(-35 600 140)">' + ret(586, 140, 28, 110, "azul", 14)
             + f'<circle cx="600" cy="128" r="30" fill="none" stroke="{C["azul"]}" stroke-width="22" stroke-dasharray="150 40" transform="rotate(-70 600 128)"/></g>')
    return svg("Carro modular com painéis de cores diferentes", f"<defs>{defs}</defs>" + chassi + corpo + rodas + setas + chave + chao(100, 414, 500))


def cartorio_digital():
    pilha = ""
    for i, ang in enumerate((-12, -6, 0, 6)):
        pilha += (f'<g transform="rotate({ang} 190 270)">' + ret(110, 150, 170, 220, "areia" if i < 3 else "branco", 12)
                  + (linhas(132, 182, [110, 126, 96, 120, 80, 110, 70], "azul-claro") + circ(240, 330, 20, "livre-coral") if i == 3 else "") + "</g>")
    seta = traco("M310,270 L380,270", "azul-medio", 14) + cam("M400,270 L372,248 L372,292 Z", "azul-medio")
    doc = (ret(420, 100, 210, 290, "branco", 16) + ret(420, 100, 210, 42, "azul", 16) + ret(420, 126, 210, 16, "azul")
           + casa(480, 250, 90) + linhas(450, 278, [150, 130, 150, 90], "azul-claro"))
    selo = circ(612, 380, 44, "verde") + traco("M592,380 L606,394 L634,366", "branco", 9)
    return svg("Pilha de papéis que vira um documento só, com a casa e um selo de aprovado", pilha + seta + doc + selo)


def qual_caminho():
    def estrada(d):
        return traco(d, "azul-medio", 36) + traco(d, "amarelo", 5, ' stroke-dasharray="14 14"')
    caminhos = ["M350,560 C350,470 350,420 350,370", "M350,370 C350,300 200,300 190,190",
                "M350,370 C350,300 350,240 350,160", "M350,370 C350,300 500,300 510,190"]

    def pino(x, y, cor):
        return cam(f"M{x},{y + 46} C{x - 34},{y + 6} {x - 32},{y - 34} {x},{y - 34} C{x + 32},{y - 34} {x + 34},{y + 6} {x},{y + 46} Z", cor) + circ(x, y - 4, 13, "branco")
    return svg("Estrada que se divide em três caminhos, cada um com um destino",
               "".join(estrada(d) for d in caminhos) + pino(190, 130, "verde") + pino(350, 100, "amarelo-escuro") + pino(510, 130, "azul")
               + arvore(110, 420, 26) + arvore(600, 400, 30) + arvore(560, 470, 20, "verde"))


def leis_software():
    doc = (ret(110, 90, 230, 320, "branco", 16) + ret(110, 90, 230, 46, "verde", 16) + ret(110, 120, 230, 16, "verde")
           + linhas(140, 166, [170, 150, 170, 110], "azul-claro")
           + traco("M180,290 L148,322 L180,354", "livre-roxo", 12) + traco("M270,290 L302,322 L270,354", "livre-roxo", 12)
           + traco("M238,282 L212,362", "livre-roxo", 12))
    cx, cy, r = 510, 330, 120

    def arco(a0, a1, cor):
        p = lambda a: (cx + r * math.cos(math.radians(a)), cy - r * math.sin(math.radians(a)))
        (x0, y0), (x1, y1) = p(a0), p(a1)
        return traco(f"M{x0:.1f},{y0:.1f} A{r},{r} 0 0 1 {x1:.1f},{y1:.1f}", cor, 34, ponta="butt")
    medidor = (arco(180, 122, "livre-coral") + arco(118, 62, "amarelo") + arco(58, 0, "verde")
               + traco(f"M{cx},{cy} L{cx + 80 * math.cos(math.radians(40)):.1f},{cy - 80 * math.sin(math.radians(40)):.1f}", "azul", 12)
               + circ(cx, cy, 18, "azul"))
    return svg("Documento de lei com sinais de código e um medidor de resultado", doc + medidor + chao(360, 352, 300))


def canal_do_youtube():
    tela = ret(110, 80, 480, 310, "azul", 26) + ret(130, 100, 440, 270, "azul-claro", 14)
    cena = f'<clipPath id="t"><rect x="130" y="100" width="440" height="270" rx="14"/></clipPath><g clip-path="url(#t)">' + circ(400, 210, 60, "amarelo") + ret(130, 330, 440, 40, "verde-claro") + congresso(350, 332, .95) + "</g>"
    pe = cam("M320,390 L380,390 L396,446 L304,446 Z", "azul-medio") + ret(250, 446, 200, 16, "azul", 8)
    play = circ(560, 380, 54, "amarelo-escuro") + circ(560, 374, 54, "amarelo") + cam("M543,346 L543,402 L590,374 Z", "azul")
    return svg("Tela com o Congresso Nacional e um botão de play", tela + cena + pe + play)


def ideia():
    raios = "".join(traco(f"M{350 + 150 * math.cos(math.radians(a)):.1f},{220 + 150 * math.sin(math.radians(a)):.1f} "
                          f"L{350 + 185 * math.cos(math.radians(a)):.1f},{220 + 185 * math.sin(math.radians(a)):.1f}", "amarelo-escuro", 14)
                    for a in (-180, -145, -110, -70, -35, 0))
    lampada = (circ(350, 220, 118, "amarelo") + cam("M290,300 L410,300 L396,350 L304,350 Z", "amarelo")
               + traco("M318,250 L334,200 L350,240 L366,200 L382,250", "amarelo-escuro", 8)
               + traco("M334,300 L334,252 M366,300 L366,252", "amarelo-escuro", 8)
               + ret(300, 352, 100, 22, "azul-medio", 11) + ret(306, 380, 88, 22, "azul-medio", 11) + ret(326, 408, 48, 20, "azul", 10))
    return svg("Lâmpada acesa", raios + lampada + estrela(160, 380, 16, "verde") + estrela(540, 400, 12, "azul-medio"))


def capa():
    fundo = cam("M90,250 C80,140 190,70 320,80 C450,90 520,60 600,130 C680,200 650,320 640,400 C630,480 560,500 350,500 C160,500 100,470 90,400 C84,350 96,300 90,250 Z", "verde-claro")
    return svg("O Congresso Nacional, uma fábrica, uma árvore e um carro sob o sol",
               fundo
               + circ(490, 190, 72, "amarelo")
               + fabrica(92, 410, 140, 130) + congresso(430, 410, 1.15) + arvore(258, 410, 20)
               + ret(76, 410, 568, 14, "azul", 7) + ret(110, 436, 500, 10, "areia", 5)
               + ret(330, 422, 92, 26, "livre-coral", 13) + ret(348, 412, 50, 18, "livre-coral", 9) + circ(350, 450, 9, "texto") + circ(402, 450, 9, "texto")
               + estrela(180, 140, 12, "amarelo-escuro") + estrela(590, 120, 10, "azul-medio"))


def brasil_responde():
    celular = ret(90, 70, 220, 400, "azul", 34) + ret(106, 104, 188, 330, "branco", 18) + ret(170, 84, 60, 8, "azul-medio", 4)
    perguntas = ""
    for i, marcada in enumerate((True, False, True)):
        y = 140 + i * 92
        perguntas += ret(126, y, 34, 34, "verde" if marcada else "areia", 8) + linhas(176, y + 4, [92, 64], "azul-claro", passo=18)
        if marcada:
            perguntas += traco(f"M134,{y + 17} L141,{y + 25} L153,{y + 10}", "branco", 6)
    balao = (cam("M240,330 h110 a22,22 0 0 1 22,22 v46 a22,22 0 0 1 -22,22 h-66 l-26,24 v-24 h-18 a22,22 0 0 1 -22,-22 v-46 a22,22 0 0 1 22,-22 Z", "livre-roxo")
             + cam("M290,354 L290,394 L322,374 Z", "branco"))
    seta = traco("M400,250 C440,250 450,250 470,250", "azul-medio", 14) + cam("M492,250 L464,228 L464,272 Z", "azul-medio")
    barras = ret(520, 160, 26, 70, "amarelo", 6) + ret(556, 120, 26, 110, "verde", 6) + ret(592, 180, 26, 50, "livre-roxo", 6)
    return svg("Celular com um questionário e um balão de vídeo, uma seta e o Congresso Nacional com um gráfico",
               celular + perguntas + balao + seta + barras + chao(470, 412, 200) + congresso(570, 412, .62))


def pena_do_tamanho_do_dano():
    """Balança: moedas de um lado, casas de famílias do outro; ao fundo, degraus que sobem."""
    degraus = "".join(ret(430 + i * 46, 412 - (i + 1) * 46, 46, (i + 1) * 46, "azul-claro", 6) for i in range(5))
    poste = ret(343, 150, 14, 262, "azul") + ret(290, 400, 120, 16, "azul", 8) + circ(350, 150, 16, "amarelo-escuro")
    braco = traco("M170,190 L530,140", "azul", 12)
    fio_e = traco("M170,190 L130,290 M170,190 L210,290", "azul-medio", 5)
    fio_d = traco("M530,140 L490,240 M530,140 L570,240", "azul-medio", 5)
    prato_e = cam("M110,290 h120 a60,26 0 0 1 -120,0 Z", "azul-medio")
    prato_d = cam("M470,240 h120 a60,26 0 0 1 -120,0 Z", "azul-medio")
    moedas = "".join(ret(132 + (i % 3) * 26, 276 - (i // 3) * 16, 24, 14, "amarelo" if i % 2 else "amarelo-escuro", 7) for i in range(9))
    casas = casa(482, 238, 36, corpo="verde", telhado="azul", janela="amarelo") + casa(530, 238, 36, corpo="livre-turquesa", telhado="azul", janela="amarelo")
    return svg("Balança com moedas de um lado e casas de famílias do outro, diante de degraus que sobem",
               degraus + chao(80, 412, 540) + poste + braco + fio_e + fio_d + moedas + prato_e + casas + prato_d)


def folha_canhamo(cx, cy, r, cor):
    """Folha de cânhamo estilizada: cinco folíolos em leque."""
    partes = ""
    for ang, esc in ((-70, .62), (-35, .85), (0, 1), (35, .85), (70, .62)):
        partes += (f'<ellipse cx="{cx}" cy="{cy - r * esc / 2:.1f}" rx="{r * .14:.1f}" ry="{r * esc / 2:.1f}" '
                   f'fill="{C[cor]}" transform="rotate({ang} {cx} {cy})"/>')
    return partes


def regulacao_da_cannabis():
    """Hastes de cânhamo no campo, uma seta para a fábrica de tecido e um pacote lacrado com selo."""
    hastes = ""
    for x, alt in ((120, 250), (175, 300), (230, 230)):
        hastes += traco(f"M{x},412 L{x},{412 - alt}", "verde-escuro", 8)
        for i, y in enumerate(range(412 - alt + 20, 400, 70)):
            hastes += folha_canhamo(x, y, 58 - i * 6, "verde" if i % 2 else "verde-escuro")
    seta = traco("M285,300 C320,300 330,300 350,300", "azul-medio", 14) + cam("M372,300 L344,278 L344,322 Z", "azul-medio")
    rolo = (ret(400, 300, 120, 112, "amarelo", 14) + circ(400, 356, 56, "amarelo-escuro") + circ(400, 356, 20, "amarelo-claro")
            + traco("M430,318 L510,318 M430,346 L510,346 M430,374 L510,374", "amarelo-escuro", 5))
    pacote = (ret(540, 250, 110, 162, "azul", 16) + ret(540, 250, 110, 26, "azul-medio", 12)
              + circ(595, 330, 32, "branco") + circ(595, 330, 32, "livre-coral", ' fill-opacity="0" stroke="#ff7a45" stroke-width="7"')
              + traco("M580,330 L591,341 L611,320", "verde-escuro", 7))
    return svg("Hastes de cânhamo, uma seta para um rolo de tecido e um pacote lacrado com selo",
               chao(70, 412, 600) + hastes + seta + rolo + pacote + estrela(470, 210, 14, "amarelo-escuro"))


def cidade_esponja():
    """Nuvem com chuva sobre um parque que vira rio: várzea com árvores, córrego ondulado e um pino de mapa."""
    nuvem = circ(250, 130, 46, "azul-claro") + circ(310, 110, 60, "azul-claro") + circ(375, 135, 42, "azul-claro") + ret(230, 130, 170, 48, "azul-claro", 24)
    gotas = "".join(traco(f"M{x},{y} L{x - 8},{y + 26}", "azul-medio", 7) for x, y in ((250, 200), (295, 225), (340, 200), (385, 225), (430, 205)))
    varzea = cam("M70,412 L70,330 Q200,300 350,330 T630,330 L630,412 Z", "verde-claro")
    rio = cam("M70,372 Q160,340 250,370 T430,370 T630,360 L630,404 Q540,420 430,404 T250,404 T70,404 Z", "azul-medio")
    brilho = traco("M120,376 Q160,362 200,376 M380,384 Q420,372 460,384", "branco", 5, ' stroke-opacity=".6"')
    arvores = arvore(120, 340, 26, "verde") + arvore(200, 330, 32) + arvore(500, 336, 28, "verde") + arvore(580, 338, 22)
    pino = (cam("M560,140 a46,46 0 1 1 92,0 c0,40 -46,86 -46,86 c0,0 -46,-46 -46,-86 Z", "livre-coral")
            + circ(606, 140, 18, "branco"))
    return svg("Nuvem com chuva sobre um parque que vira rio, com árvores na margem e um pino de mapa",
               nuvem + gotas + varzea + rio + brilho + arvores + chao(70, 412, 560) + pino)


def moradia_que_vira_sua():
    """Prédio baixo com lojas de toldo no térreo, jardim no telhado, árvores e um ônibus na frente; uma chave amarela no céu."""
    corpo = ret(150, 150, 400, 210, "areia") + ret(142, 142, 416, 12, "azul") + ret(142, 352, 416, 10, "azul")
    janelas = "".join(ret(178 + k * 92, 172 + a * 58, 46, 36, "azul-claro", 4) for a in range(3) for k in range(4))
    varandas = "".join(traco(f"M{172 + k * 92},{214 + a * 58} h58", "verde-escuro", 6) for a, k in ((0, 1), (1, 3), (2, 0), (1, 2)))
    telhado = ret(150, 124, 400, 18, "verde-claro") + arvore(200, 138, 16, "verde") + arvore(300, 138, 18) + arvore(400, 138, 16, "verde") + arvore(500, 138, 18)
    terreo = ret(150, 362, 400, 70, "azul")
    lojas = ""
    for i, cor in enumerate(("verde", "livre-coral", "amarelo-escuro")):
        x = 160 + i * 130
        lojas += ret(x, 370, 120, 14, cor, 4) + "".join(circ(x + 10 + j * 20, 384, 10, cor) for j in range(6)) + ret(x + 10, 396, 100, 36, "azul-claro", 3) + ret(x + 48, 400, 24, 32, "azul-medio")
    arvores = arvore(110, 432, 30) + arvore(600, 432, 26, "verde")
    onibus = ret(380, 440, 230, 60, "verde-fundo", 12) + "".join(ret(396 + k * 42, 450, 32, 22, "azul-claro", 4) for k in range(5)) + circ(420, 502, 12, "azul") + circ(570, 502, 12, "azul")
    chave = (circ(600, 96, 30, "amarelo") + circ(600, 96, 12, "branco") + ret(625, 90, 60, 12, "amarelo", 4) + ret(665, 100, 10, 18, "amarelo", 2) + ret(645, 100, 10, 14, "amarelo", 2))
    return svg("Prédio baixo com lojas de toldo colorido no térreo, jardim no telhado, árvores na calçada, um ônibus na frente e uma chave amarela",
               telhado + corpo + janelas + varandas + terreo + lojas + chao(70, 432, 560) + arvores + onibus + chave)


DESENHOS = {
    "galera-club": galera_club, "reindustrializacao": reindustrializacao, "desafio-dumont": desafio_dumont,
    "cartorio-digital": cartorio_digital, "qual-caminho": qual_caminho, "leis-com-mentalidade-de-software": leis_software,
    "canal-do-youtube": canal_do_youtube, "brasil-responde": brasil_responde, "pena-do-tamanho-do-dano": pena_do_tamanho_do_dano, "regulacao-da-cannabis": regulacao_da_cannabis, "cidade-esponja": cidade_esponja, "moradia-que-vira-sua": moradia_que_vira_sua, "ideia": ideia, "capa": capa,
}

if __name__ == "__main__":
    for pid in sys.argv[1:] or DESENHOS:
        saida = os.path.join(RAIZ, "site", "projetos", "img", f"{pid}.svg")
        with open(saida, "w", encoding="utf-8") as f:
            f.write(DESENHOS[pid]())
        print(saida)
