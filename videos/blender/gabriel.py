"""Peças do canal em massinha: cores do design system, o boneco do Gabriel e blocos com texto.

Uso numa cena (veja cenas/como_nasce_uma_lei.py):
    from gabriel import *
    g = gabriel(x=-0.1, y=0.0)      # dict com os pivôs para animar
    bloco('Câmara', COR['verde'], COR['branco'], x=0.03)
"""
import bpy, os, sys, math
_AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(_AQUI, '..', '..', '.claude', 'skills', 'blender-claymation', 'scripts'))
from claylib import *  # noqa: E402,F401

# Cores de site/design-system/tokens.css em espaço linear, já compensadas para o render
# (o amarelo puro "lava" com a luz, por isso é um pouco mais saturado aqui).
COR = {
    'verde': (0.0, 0.33, 0.045),
    'amarelo': (1.0, 0.62, 0.0),
    'azul': (0.0, 0.02, 0.18),
    'branco': (0.85, 0.85, 0.82),
    'creme': (0.93, 0.88, 0.76),
    'areia': (0.78, 0.66, 0.45),
    'pele': (0.62, 0.33, 0.2),
    'cabelo': (0.06, 0.03, 0.015),
}

_FONTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def _parte(nome, loc, escala, mat, pai, lump=0.015, segs=48):
    o = sphere(nome, 1.0, loc, scale=escala, mat=mat, segs=segs, rings=segs // 2, lumpy=lump)
    o.parent = pai
    return o


def _curva(nome, pontos, mat, pai, espessura=0.0008):
    cd = bpy.data.curves.new(nome, 'CURVE'); cd.dimensions = '3D'
    cd.bevel_depth = espessura; cd.bevel_resolution = 3; cd.use_fill_caps = True
    sp = cd.splines.new('NURBS'); sp.points.add(len(pontos) - 1)
    for pt, co in zip(sp.points, pontos):
        pt.co = (*co, 1)
    sp.use_endpoint_u = True
    ob = bpy.data.objects.new(nome, cd); bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat); ob.parent = pai
    return ob


def gabriel(x=0.0, y=0.0, giro=12, camisa=None):
    """Monta o boneco (cerca de 9 cm) com os pés em (x, y, 0).

    Retorna os pivôs: raiz, corpo, cabeca, ombro_e, ombro_d,
    olhos_abertos e olhos_fechados (troque por escala: 1e-4 esconde).
    Braços giram no eixo Y do ombro. Esquerdo: -60 = para baixo. Direito: 60 = para baixo, -50 = para cima (acenando).
    """
    pele = clay('g_pele', COR['pele'], rough=0.55, sss=0.15, bump=0.35, thumb=0.35, scale=0.15, bumpdist=2.0)
    cab_m = clay('g_cabelo', COR['cabelo'], rough=0.6, sss=0.03, bump=0.6, thumb=0.5, scale=0.12, bumpdist=2.0)
    cam_m = clay('g_camisa', camisa or COR['verde'], rough=0.6, sss=0.06, bump=0.5, thumb=0.45, scale=0.15, bumpdist=2.0)
    calca = clay('g_calca', COR['azul'], rough=0.6, sss=0.04, bump=0.5, thumb=0.4, scale=0.15, bumpdist=2.0)
    rosa = clay('g_rosa', (0.8, 0.3, 0.32), rough=0.7, sss=0.1)
    preto = glossy_black()

    raiz = empty('g_raiz', (x, y, 0))
    corpo = empty('g_corpo', (0, 0, 0), raiz)
    corpo.rotation_euler = (0, 0, math.radians(giro))
    for s in (-1, 1):
        _parte(f'g_perna{s}', (s * 0.0085, 0, 0.014), (0.0075, 0.0075, 0.016), calca, corpo)
        _parte(f'g_sapato{s}', (s * 0.0085, -0.004, 0.003), (0.008, 0.011, 0.004), calca, corpo, lump=0.01)
    _parte('g_tronco', (0, 0, 0.042), (0.021, 0.016, 0.022), cam_m, corpo)
    _parte('g_pescoco', (0, 0, 0.063), (0.006, 0.006, 0.005), pele, corpo, lump=0)

    cabeca = empty('g_cabeca', (0, 0, 0.066), corpo)
    _parte('g_rosto', (0, 0, 0.02), (0.021, 0.019, 0.021), pele, cabeca)
    _parte('g_cabelo', (0, 0.003, 0.03), (0.0222, 0.0205, 0.016), cab_m, cabeca, lump=0.03)
    abertos, fechados = [], []
    for s in (-1, 1):
        _parte(f'g_orelha{s}', (s * 0.0205, 0.001, 0.018), (0.003, 0.002, 0.0045), pele, cabeca, lump=0)
        abertos.append(_parte(f'g_olho{s}', (s * 0.0072, -0.0183, 0.021), (0.0022, 0.0014, 0.0029), preto, cabeca, lump=0, segs=24))
        fechados.append(_curva(f'g_palpebra{s}', [(s * 0.0072 + (t - 0.5) * 0.005, -0.0188, 0.0205 - 0.0012 * math.sin(math.pi * t))
                                                for t in [i / 6 for i in range(7)]], preto, cabeca, 0.0005))
        _parte(f'g_bochecha{s}', (s * 0.012, -0.0168, 0.0135), (0.0033, 0.0014, 0.0022), rosa, cabeca, lump=0)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.0058, minor_radius=0.0007, major_segments=48, minor_segments=12,
                                         location=(s * 0.0075, -0.0195, 0.021), rotation=(math.pi / 2, 0, 0))
        aro = bpy.context.active_object; aro.scale = (1.1, 0.95, 1); smooth(aro); assign(aro, preto); aro.parent = cabeca
    for f in fechados:
        f.scale = (1e-4,) * 3
    cylinder('g_ponte', 0.0006, 0.004, (0, -0.0198, 0.022), verts=12, mat=preto, rot=(0, math.pi / 2, 0)).parent = cabeca
    _curva('g_sorriso', [((t - 0.5) * 0.009, -0.0192 + 0.0015 * abs(t - 0.5), 0.0105 - 0.0022 * math.sin(math.pi * t))
                         for t in [i / 6 for i in range(7)]], preto, cabeca)

    ombros = {}
    for s, nome in ((-1, 'ombro_e'), (1, 'ombro_d')):
        piv = empty(f'g_{nome}', (s * 0.019, 0, 0.055), corpo)
        piv.rotation_euler = (0, math.radians(-60), 0)
        _parte(f'g_braco{s}', (s * 0.012, 0, 0), (0.012, 0.0055, 0.0055), cam_m, piv)
        _parte(f'g_mao{s}', (s * 0.025, 0, 0), (0.0048, 0.0045, 0.005), pele, piv, lump=0.01)
        ombros[nome] = piv
    # os dois braços começam para baixo
    ombros['ombro_d'].rotation_euler = (0, math.radians(60), 0)
    return dict(raiz=raiz, corpo=corpo, cabeca=cabeca, olhos_abertos=abertos, olhos_fechados=fechados, **ombros)


def bloco(texto, cor, cor_texto, x=0.0, y=0.03, lado=0.046, giro=0.0, tamanho=0.0105):
    """Bloco de massinha com texto em relevo na frente. Retorna um empty-pivô na base para animar."""
    piv = empty(f'b_{texto}', (x, y, 0))
    m = clay(f'b_{texto}', cor, rough=0.6, sss=0.08, bump=0.45, thumb=0.4, scale=0.25, bumpdist=1.5)
    b = rounded_box(f'b_{texto}_caixa', (lado, lado * 0.8, lado), loc=(0, 0, lado / 2), bevel=0.009, mat=m,
                    rot=(0, 0, math.radians(giro)), lumpy=0.0015)
    b.parent = piv
    bpy.ops.object.text_add(location=(0, -lado * 0.4 - 0.0012, lado * 0.45), rotation=(math.pi / 2, 0, 0))
    t = bpy.context.active_object
    t.data.body = texto; t.data.align_x = 'CENTER'; t.data.align_y = 'CENTER'
    t.data.size = tamanho; t.data.extrude = 0.0008; t.data.bevel_depth = 0.0004
    if os.path.exists(_FONTE):
        t.data.font = bpy.data.fonts.load(_FONTE)
    t.data.materials.append(clay(f'b_{texto}_txt', cor_texto, rough=0.6, sss=0.05, bump=0.2, scale=0.1))
    t.parent = piv
    return piv


def seta(x, y=0.025, z=0.02):
    m = clay('seta', COR['azul'], rough=0.6, sss=0.05, bump=0.3, scale=0.15)
    piv = empty(f'seta{x:.3f}', (x, y, z))
    cylinder(f'haste{x:.3f}', 0.0018, 0.008, (-0.002, 0, 0), verts=16, mat=m, rot=(0, math.pi / 2, 0)).parent = piv
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.004, radius2=0.0003, depth=0.006, location=(0.004, 0, 0), rotation=(0, math.pi / 2, 0))
    c = bpy.context.active_object; smooth(c); assign(c, m); c.parent = piv
    return piv


def cenario_brasil(rnd):
    """Mesa de areia, fundo creme, sol amarelo, morros verdes e uma nuvem."""
    mesa = clay('mesa', COR['areia'], rough=0.75, sss=0.05, bump=0.5, thumb=0.3, scale=0.5, bumpdist=1.5)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=200, y_subdivisions=200, size=1.6, location=(0, 0.3, 0))
    chao = bpy.context.active_object; smooth(chao)
    tex = bpy.data.textures.new('ondas', 'CLOUDS'); tex.noise_scale = 0.1
    md = chao.modifiers.new('ondas', 'DISPLACE'); md.texture = tex; md.strength = 0.004; md.mid_level = 0.5
    assign(chao, mesa)
    fundo = clay('fundo', COR['creme'], rough=0.95, sss=0.0, bump=0.15, thumb=0.1, scale=0.2)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.6, 0.4), rotation=(math.pi / 2, 0, 0))
    bd = bpy.context.active_object; bd.scale = (3, 1.2, 1); assign(bd, fundo)
    sphere('sol', 0.07, (0.16, 0.58, 0.2), scale=(1, 0.25, 1), mat=clay('sol', COR['amarelo'], rough=0.6, sss=0.1, bump=0.4, scale=0.3), lumpy=0.004)
    morro = clay('morro', (0.05, 0.42, 0.12), rough=0.7, sss=0.05, bump=0.45, scale=0.3)
    for i, (mx, r) in enumerate([(-0.3, 0.16), (-0.08, 0.12), (0.3, 0.15)]):
        sphere(f'morro{i}', r, (mx, 0.5, 0.0), scale=(1.4, 0.3, 0.55), mat=morro, lumpy=0.006, seed=i)
    nuvem = clay('nuvem', COR['branco'], rough=0.8, sss=0.1, bump=0.3, scale=0.4)
    for k in range(5):
        sphere(f'nuvem{k}', 0.02 * rnd.uniform(0.8, 1.2), (-0.17 + k * 0.02, 0.56, 0.24 + rnd.uniform(-0.005, 0.008)),
               scale=(1.3, 0.35, 0.9), mat=nuvem, segs=24, rings=12)


def luzes_e_camera():
    area_light('key', (-0.35, -0.4, 0.45), (0.0, 0.0, 0.04), 20, 0.4, (1.0, 0.95, 0.88))
    area_light('fill', (0.5, -0.35, 0.2), (0.0, 0.0, 0.04), 4, 0.6, (0.8, 0.88, 1.0))
    area_light('rim', (-0.1, 0.5, 0.4), (0.0, 0.0, 0.05), 5, 0.4, (1.0, 0.97, 0.9))
    return camera((0.0, -0.5, 0.1), (0.0, 0.02, 0.042), lens=50, fstop=4.0, focus=0.48)
