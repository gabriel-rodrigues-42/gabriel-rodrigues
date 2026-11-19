"""Como nasce uma lei: Gabriel acena e as etapas surgem uma a uma (10 s, 12 fps).
python como_nasce_uma_lei.py -- [--still F] [--range A B] [--res W H] [--samples N] [--out DIR]

Linha do tempo (quadros a 12 fps):
  1-18    plano aberto, Gabriel parado
  18-42   Gabriel acena, pisca no 30
  44-100  Ideia, Câmara, Senado e Sanção surgem a cada 14 quadros, com setas
  100-120 Gabriel dá um pulinho e fica olhando para a câmera
"""
import bpy, os, sys, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from gabriel import *

OPTS = cli('como_nasce_uma_lei')
reset()
sc = setup_render(res=OPTS['res'], samples=OPTS['samples'], frames=120)
world((0.95, 0.92, 0.85), 0.3)
sc.view_settings.exposure = -1.15
rnd = random.Random(4)

cenario_brasil(rnd)
g = gabriel(x=-0.1, y=0.0)
ETAPAS = [('Ideia', COR['amarelo'], COR['azul']), ('Câmara', COR['verde'], COR['branco']),
          ('Senado', COR['azul'], COR['branco']), ('Sanção', COR['branco'], COR['azul'])]
X0, DX = -0.025, 0.06
blocos = [bloco(n, c, t, x=X0 + i * DX, giro=rnd.uniform(-6, 6)) for i, (n, c, t) in enumerate(ETAPAS)]
setas = [seta(X0 + i * DX + DX / 2) for i in range(3)]
luz = luzes_e_camera() and bpy.data.objects['key']
E0 = luz.data.energy

INVIS = (1e-4,) * 3
boil = Boil(7)
base_raiz = g['raiz'].location.copy()

for f in range(1, 121):
    # Gabriel: boil sempre, pulinho no fim
    hop = 0.0
    sq = 1.0
    if 100 <= f <= 112:
        t = seg(f, 100, 112)
        hop = 0.012 * math.sin(math.pi * t)
        sq = 1.0 + 0.12 * math.sin(math.pi * t) if 102 <= f <= 110 else (0.86 if f in (100, 101, 111, 112) else 1.0)
    key(g['raiz'], f, loc=base_raiz + boil.v() + Vector((0, 0, hop)), rot=boil.e())
    key(g['corpo'], f, scale=(1 / math.sqrt(sq), 1 / math.sqrt(sq), sq))

    # aceno: muda de pose a cada 3 quadros
    if 18 <= f <= 42:
        ang = -40 if (f // 3) % 2 else -75
    else:
        ang = 60
    key(g['ombro_d'], f, rot=(0, math.radians(ang), 0))
    key(g['ombro_e'], f, rot=(0, math.radians(-60), 0))

    # cabeça acompanha os blocos
    olhar = 0.0 if f < 44 else -0.12 * ease(seg(f, 44, 60)) if f < 100 else -0.12 * (1 - ease(seg(f, 100, 108)))
    key(g['cabeca'], f, rot=(0, 0, olhar))

    # piscadas de 2 quadros
    fechado = f in (30, 31, 76, 77, 114, 115)
    for o in g['olhos_abertos']:
        key(o, f, scale=(0.0022, 0.0014, 0.0029) if not fechado else INVIS)
    for o in g['olhos_fechados']:
        key(o, f, scale=INVIS if not fechado else (1, 1, 1))

    # blocos surgindo com squash & stretch
    for i, b in enumerate(blocos):
        ini = 44 + i * 14
        t = seg(f, ini, ini + 8)
        if f < ini:
            key(b, f, scale=INVIS)
        else:
            s = ease_out_back(t)
            esm = 1 + 0.15 * math.sin(math.pi * t) * (1 - t)
            key(b, f, scale=(max(s * esm, 1e-4), max(s * esm, 1e-4), max(s / esm, 1e-4)))
    for i, st in enumerate(setas):
        ini = 44 + i * 14 + 9
        s = 0 if f < ini else ease_out_back(seg(f, ini, ini + 4))
        key(st, f, scale=(max(s, 1e-4),) * 3)

    # luz piscando de leve, como num set real
    luz.data.energy = E0 * (1 + rnd.uniform(-0.012, 0.012))
    luz.data.keyframe_insert('energy', frame=f)

constant_interp()
run(sc, OPTS)
