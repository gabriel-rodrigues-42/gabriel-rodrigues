"""Análise própria de risco do mapa da cidade esponja: onde a água chega primeiro numa cheia.

Método (publicado na página, seção "Como fizemos a análise própria"):
1. Modelo de terreno: Copernicus GLO-30 (Agência Espacial Europeia, 30 m, licença aberta), baixado
   do repositório público da AWS. É um modelo de superfície: prédios e árvores somam altura, então o
   resultado serve para triagem, não para dizer que uma rua alaga.
2. Córregos: os cursos d'água com nome do OpenStreetMap (dados/osm.geojson, camada "corrego").
3. Para cada ponto do terreno, calculamos a altura acima do córrego mais próximo (uma versão simples
   do índice HAND, "altura acima da drenagem mais próxima"). Usamos a distância em linha reta, não o
   caminho da água, o que simplifica a conta.
4. Classes: até 2 m acima do córrego = fundo de vale (a água chega primeiro numa cheia);
   de 2 a 5 m = beira de vale. Só dentro de 500 m de um córrego.
5. Limpeza: tira manchas menores que 1 hectare e simplifica as bordas para o arquivo ficar leve.

Saída: site/projetos/cidade-esponja/dados/analise.geojson. Uso:
    pip install rasterio scipy numpy shapely
    python3 scripts/cidade-esponja/analise_terreno.py
"""
import json, os, urllib.request

import numpy as np
import rasterio
from rasterio import features, windows
from rasterio.transform import rowcol
from scipy import ndimage
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DADOS = os.path.join(RAIZ, "site", "projetos", "cidade-esponja", "dados")
CACHE = os.path.join(RAIZ, ".cache", "cidade-esponja")
TILE = "Copernicus_DSM_COG_10_S17_00_W050_00_DEM"
URL = f"https://copernicus-dem-30m.s3.amazonaws.com/{TILE}/{TILE}.tif"
# Goiânia e região metropolitana (oeste, sul, leste, norte).
CAIXA = (-49.55, -16.85, -49.05, -16.45)
LIMITES = [(2, "fundo"), (5, "beira")]
DIST_MAX_M = 500
AREA_MIN_HA = 1.0


def baixar():
    os.makedirs(CACHE, exist_ok=True)
    destino = os.path.join(CACHE, f"{TILE}.tif")
    if not os.path.exists(destino):
        print(f"Baixando {URL}")
        urllib.request.urlretrieve(URL, destino)
    return destino


def main():
    with rasterio.open(baixar()) as src:
        jan = windows.from_bounds(*CAIXA, transform=src.transform).round_offsets().round_lengths()
        dem = src.read(1, window=jan).astype("float32")
        tr = src.window_transform(jan)
    print(f"Terreno: {dem.shape[1]} x {dem.shape[0]} células")

    osm = json.load(open(os.path.join(DADOS, "osm.geojson"), encoding="utf-8"))
    linhas = [f["geometry"] for f in osm["features"] if f["properties"]["camada"] == "corrego"]
    corrego = features.rasterize(((g, 1) for g in linhas), out_shape=dem.shape, transform=tr, all_touched=True, dtype="uint8").astype(bool)
    print(f"Células de córrego: {corrego.sum()}")

    # O leito no modelo de superfície tem ruído (pontes, árvores): usamos o mínimo da vizinhança 3x3.
    leito = ndimage.minimum_filter(dem, size=3)
    dist, (ii, jj) = ndimage.distance_transform_edt(~corrego, return_indices=True)
    altura = dem - leito[ii, jj]
    # Tamanho da célula em metros (latitude de Goiânia).
    lat = CAIXA[1] + (CAIXA[3] - CAIXA[1]) / 2
    celula_m = abs(tr.a) * 111320 * np.cos(np.radians(lat))
    perto = dist * celula_m <= DIST_MAX_M

    classe = np.zeros(dem.shape, dtype="uint8")
    classe[perto & (altura <= LIMITES[1][0])] = 2
    classe[perto & (altura <= LIMITES[0][0])] = 1
    classe = ndimage.median_filter(classe, size=3)

    area_min = AREA_MIN_HA * 10000
    m2_por_grau2 = (111320 * np.cos(np.radians(lat))) * 110574
    saida = []
    for valor, nome in ((1, "fundo"), (2, "beira")):
        geoms = [shape(g) for g, v in features.shapes(classe, mask=classe == valor, transform=tr) if v == valor]
        uniao = unary_union(geoms).simplify(0.00012, preserve_topology=True)
        partes = getattr(uniao, "geoms", [uniao])
        mantidas = [p for p in partes if p.area * m2_por_grau2 >= area_min]
        for p in mantidas:
            g = json.loads(json.dumps(mapping(p)))
            g["coordinates"] = [[[round(x, 5), round(y, 5)] for x, y in anel] for anel in g["coordinates"]]
            saida.append({"type": "Feature", "properties": {"camada": "analise", "classe": nome}, "geometry": g})
        print(f"  {nome}: {len(mantidas)} manchas")

    destino = os.path.join(DADOS, "analise.geojson")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection",
                   "metodo": "Altura acima do córrego mais próximo (HAND simplificado). Terreno: Copernicus GLO-30 (ESA). Córregos: OpenStreetMap (ODbL). Triagem, não laudo.",
                   "features": saida}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"{destino}: {os.path.getsize(destino) // 1024} KB")


if __name__ == "__main__":
    main()
