"""Baixa do OpenStreetMap as camadas de apoio do mapa da cidade esponja de Goiânia.

Roda no GitHub (workflow dados-cidade-esponja.yml), porque o Overpass e o Nominatim não abrem
daqui da nuvem. Grava em site/projetos/cidade-esponja/dados/:

- osm.geojson: limite de Goiânia, córregos e rios, Marginal Botafogo, avenidas principais e parques.
  Serve de mapa base reserva quando o mapa base on-line (OpenFreeMap) não carrega.
- posicoes.json: coordenadas dos pontos de areas.js achadas pelo Nominatim (campo "busca").
  O mapa usa a posição aproximada de areas.js quando a busca não acha nada.

Dados © colaboradores do OpenStreetMap, licença ODbL. Uso:
    python3 scripts/cidade-esponja/baixar_osm.py
"""
import json, os, re, time, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PASTA = os.path.join(RAIZ, "site", "projetos", "cidade-esponja")
SAIDA = os.path.join(PASTA, "dados")
AGENTE = "mapa-cidade-esponja/1.0 (script de dados abertos; GitHub Actions)"
OVERPASS = "https://overpass-api.de/api/interpreter"
NOMINATIM = "https://nominatim.openstreetmap.org/search"
# Caixa de Goiânia (oeste, sul, leste, norte), com folga.
CAIXA = (-49.55, -16.85, -49.05, -16.45)

PARQUES = "Jardim Botânico|Areião|Linear|Zoológico|Buritis|Botafogo|Mutirama|Flamboyant|Lago das Rosas|Vaca Brava|Cascavel|Macambira"


def pedir(url, dados=None, tentativas=4):
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, data=dados, headers={"User-Agent": AGENTE})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # rede instável: espera e tenta de novo
            print(f"  falhou ({e}); tentativa {i + 1}")
            time.sleep(10 * (i + 1))
    raise SystemExit(f"Não consegui baixar {url}")


def overpass(consulta):
    q = f"[out:json][timeout:170];area[\"name\"=\"Goiânia\"][\"admin_level\"=\"8\"]->.gyn;{consulta}"
    return pedir(OVERPASS, urllib.parse.urlencode({"data": q}).encode())["elements"]


def r5(p):
    return [round(p["lon"], 5), round(p["lat"], 5)]


def simplificar(pts, tol=0.00004):
    """Douglas-Peucker simples, para o arquivo ficar leve no celular."""
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    n = (dx * dx + dy * dy) ** 0.5 or 1e-12
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / n
        if d > dmax:
            dmax, idx = d, i
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return simplificar(pts[: idx + 1], tol)[:-1] + simplificar(pts[idx:], tol)


def linha(el, tol=0.00004):
    return simplificar([r5(p) for p in el.get("geometry", [])], tol)


def costurar(trechos):
    """Junta os trechos de uma relação em anéis fechados."""
    trechos = [t[:] for t in trechos if len(t) > 1]
    aneis = []
    while trechos:
        anel = trechos.pop(0)
        mudou = True
        while anel[0] != anel[-1] and mudou:
            mudou = False
            for i, t in enumerate(trechos):
                if t[0] == anel[-1]:
                    anel += t[1:]
                elif t[-1] == anel[-1]:
                    anel += t[::-1][1:]
                elif t[-1] == anel[0]:
                    anel = t[:-1] + anel
                elif t[0] == anel[0]:
                    anel = t[::-1][:-1] + anel
                else:
                    continue
                trechos.pop(i)
                mudou = True
                break
        if anel[0] == anel[-1] and len(anel) > 3:
            aneis.append(anel)
    return aneis


def feicao(tipo, geom, props):
    return {"type": "Feature", "properties": props, "geometry": {"type": tipo, "coordinates": geom}}


def camadas():
    feicoes = []

    print("Limite de Goiânia")
    for el in overpass('rel["name"="Goiânia"]["admin_level"="8"]["boundary"="administrative"];out geom;'):
        trechos = [[r5(p) for p in m.get("geometry", [])] for m in el.get("members", []) if m.get("role") == "outer"]
        for anel in costurar(trechos):
            feicoes.append(feicao("Polygon", [simplificar(anel, 0.0003)], {"camada": "limite"}))

    print("Córregos e rios")
    s, w, n, e = CAIXA[1], CAIXA[0], CAIXA[3], CAIXA[2]
    # Todos os córregos com nome em Goiânia e na região metropolitana (a análise de terreno usa esta camada).
    for el in overpass(f'way["waterway"~"^(river|stream|canal)$"]["name"]({s},{w},{n},{e});out geom;'):
        g = linha(el)
        if len(g) > 1:
            feicoes.append(feicao("LineString", g, {"camada": "corrego", "nome": el["tags"].get("name", "")}))

    print("Marginal Botafogo")
    for el in overpass('way["highway"]["name"~"Marginal Botafogo"](area.gyn);out geom;'):
        g = linha(el)
        if len(g) > 1:
            feicoes.append(feicao("LineString", g, {"camada": "marginal", "nome": el["tags"].get("name", "")}))

    print("Avenidas principais")
    for el in overpass('way["highway"~"^(motorway|trunk|primary)$"](area.gyn);out geom;'):
        g = linha(el, 0.0001)
        if len(g) > 1:
            feicoes.append(feicao("LineString", g, {"camada": "via"}))

    print("Parques")
    for el in overpass(f'(way["leisure"="park"]["name"~"{PARQUES}"](area.gyn);way["boundary"="protected_area"]["name"~"{PARQUES}"](area.gyn););out geom;'):
        g = [r5(p) for p in el.get("geometry", [])]
        if len(g) > 3 and g[0] == g[-1]:
            feicoes.append(feicao("Polygon", [simplificar(g, 0.00006)], {"camada": "parque", "nome": el["tags"].get("name", "")}))

    os.makedirs(SAIDA, exist_ok=True)
    destino = os.path.join(SAIDA, "osm.geojson")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "attribution": "© colaboradores do OpenStreetMap (ODbL)",
                   "features": feicoes}, f, ensure_ascii=False, separators=(",", ":"))
    contagem = {}
    for ft in feicoes:
        contagem[ft["properties"]["camada"]] = contagem.get(ft["properties"]["camada"], 0) + 1
    print(f"  {destino}: {contagem}, {os.path.getsize(destino) // 1024} KB")


def buscas():
    """Lê os campos busca de areas.js e acha as coordenadas no Nominatim."""
    texto = open(os.path.join(PASTA, "areas.js"), encoding="utf-8").read()
    pares = re.findall(r'id:\s*"([^"]+)"[^{}]*?busca:\s*"([^"]+)"', texto)
    posicoes = {}
    for ident, consulta in pares:
        params = urllib.parse.urlencode({
            "q": consulta, "format": "jsonv2", "limit": 1, "countrycodes": "br", "bounded": 1,
            "viewbox": ",".join(str(v) for v in CAIXA),
        })
        res = pedir(f"{NOMINATIM}?{params}")
        time.sleep(1.2)  # regra do Nominatim: no máximo um pedido por segundo
        if res:
            posicoes[ident] = [round(float(res[0]["lon"]), 5), round(float(res[0]["lat"]), 5)]
            print(f"  {ident}: {consulta} -> {posicoes[ident]}")
        else:
            print(f"  {ident}: {consulta} -> não achou (fica a posição aproximada)")
    with open(os.path.join(SAIDA, "posicoes.json"), "w", encoding="utf-8") as f:
        json.dump(posicoes, f, ensure_ascii=False, indent=1, sort_keys=True)


if __name__ == "__main__":
    camadas()
    buscas()
