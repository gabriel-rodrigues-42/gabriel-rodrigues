#!/usr/bin/env python3
"""Gera os dados do questionário "Qual caminho faz sentido pra mim?" (site/caminho/).

Baixa arquivos oficiais e grava JSONs pequenos em site/caminho/dados/:
  - brasil.json            cargos estaduais e federais de cada UF + metadados e fontes
  - municipios-XX.json     um arquivo por UF com vereador e prefeito de cada município

Fontes (todas públicas e oficiais):
  - TSE, Portal de Dados Abertos (https://dadosabertos.tse.jus.br/)
      consulta_vagas_ANO.zip              vagas por cargo
      detalhe_votacao_munzona_ANO.zip     eleitores aptos e votos válidos
      votacao_candidato_munzona_ANO.zip   votos de cada candidato e situação (eleito ou não)
  - IBGE, API de localidades (nomes e códigos dos 5.570 municípios)
  - IBGE, Censo 2022, tabela SIDRA 4709 (população residente)

Uso:
  python3 scripts/caminho/gerar_dados.py                # baixa (com cache em .cache/) e gera
  python3 scripts/caminho/gerar_dados.py --cache /tmp/x # outra pasta de cache

Só usa a biblioteca padrão do Python 3.10+. Roda no GitHub Actions
(.github/workflows/dados-caminho.yml), que publica o resultado neste repositório.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
import unicodedata
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from difflib import get_close_matches
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "site" / "caminho" / "dados"

TSE = "https://cdn.tse.jus.br/estatistica/sead/odsele"
IBGE_MUNICIPIOS = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
IBGE_POPULACAO = (
    "https://servicodados.ibge.gov.br/api/v3/agregados/4709/periodos/2022/variaveis/93"
    "?localidades=N6[all]"
)

ANO_MUNICIPAL = 2024
ANOS_GERAIS = [2026, 2022]  # usa o mais recente que já estiver publicado

UFS = ("AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO").split()

# Códigos de cargo do TSE
CARGOS = {
    "3": "governador",
    "5": "senador",
    "6": "deputado_federal",
    "7": "deputado_estadual",
    "8": "deputado_distrital",
    "11": "prefeito",
    "13": "vereador",
}
PROPORCIONAIS = {"deputado_federal", "deputado_estadual", "deputado_distrital", "vereador"}

csv.field_size_limit(10**9)


def log(*a):
    print(*a, file=sys.stderr, flush=True)


# ---------------------------------------------------------------- download

def baixar(url: str, destino: Path) -> Path | None:
    if destino.exists() and destino.stat().st_size > 0:
        return destino
    destino.parent.mkdir(parents=True, exist_ok=True)
    log(f"baixando {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "gerar-dados-caminho/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=600) as r, open(destino.with_suffix(".part"), "wb") as f:
            while bloco := r.read(1 << 20):
                f.write(bloco)
    except Exception as e:  # noqa: BLE001
        log(f"  não deu: {e}")
        return None
    destino.with_suffix(".part").rename(destino)
    return destino


def baixar_json(url: str, destino: Path):
    caminho = baixar(url, destino)
    if not caminho:
        raise SystemExit(f"Não consegui baixar {url}")
    return json.loads(caminho.read_text("utf-8"))


# ---------------------------------------------------------------- leitura dos CSV do TSE

def arquivos_uf(z: zipfile.ZipFile):
    """CSV por UF dentro do zip (ignora BRASIL, BR e ZZ, que repetem ou são do exterior)."""
    for nome in z.namelist():
        m = re.search(r"_([A-Z]{2})\.csv$", nome, re.I)
        if m and m.group(1).upper() in UFS:
            yield nome


def linhas(zip_path: Path):
    """Percorre todas as linhas de todos os CSV por UF do zip como dicionários."""
    with zipfile.ZipFile(zip_path) as z:
        nomes = list(arquivos_uf(z))
        if not nomes:
            log(f"  aviso: nenhum CSV por UF em {zip_path.name}: {z.namelist()[:5]}")
        for i, nome in enumerate(nomes):
            with z.open(nome) as bruto:
                texto = io.TextIOWrapper(bruto, encoding="latin-1", newline="")
                leitor = csv.DictReader(texto, delimiter=";", quotechar='"')
                if i == 0:
                    log(f"  colunas de {nome}: {leitor.fieldnames}")
                yield from leitor


def inteiro(v) -> int:
    try:
        return int(str(v).strip().replace(".", "") or 0)
    except ValueError:
        return 0


def ordinaria(l: dict) -> bool:
    tipo = (l.get("NM_TIPO_ELEICAO") or "").upper()
    return not tipo or "ORDIN" in tipo


def data_geracao(l: dict, atual: str) -> str:
    d = l.get("DT_GERACAO") or ""
    m = re.match(r"(\d{2})/(\d{2})/(\d{4})", d)
    if not m:
        return atual
    iso = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return max(atual, iso)


def cod_eleicao(l: dict) -> int:
    return inteiro(l.get("CD_ELEICAO"))


def mais_recente(por_eleicao: dict) -> dict:
    """(ue, cargo, eleição) -> valor  vira  (ue, cargo) -> valor da eleição mais recente.
    Onde a eleição de prefeito foi anulada e refeita (eleição suplementar), vale a nova."""
    out = {}
    for (ue, cargo, el) in sorted(por_eleicao, key=lambda k: k[2]):
        out[(ue, cargo)] = por_eleicao[(ue, cargo, el)]
    return out


def ler_vagas(zip_path: Path):
    vagas = {}
    gerado = ""
    for l in linhas(zip_path):
        cargo = CARGOS.get((l.get("CD_CARGO") or "").strip())
        if not cargo or not ordinaria(l):
            continue
        vagas[(l["SG_UE"].strip(), cargo)] = inteiro(l["QT_VAGA"])
        gerado = data_geracao(l, gerado)
    return vagas, gerado


def ler_detalhe(zip_path: Path):
    """Eleitores aptos e votos válidos no 1º turno, por (unidade eleitoral, cargo)."""
    soma = defaultdict(lambda: {"aptos": 0, "validos": 0})
    gerado = ""
    coluna = None
    for l in linhas(zip_path):
        cargo = CARGOS.get((l.get("CD_CARGO") or "").strip())
        if not cargo or not ordinaria(l) or (l.get("NR_TURNO") or "1").strip() != "1":
            continue
        if coluna is None:
            for c in ("QT_TOTAL_VOTOS_VALIDOS", "QT_VOTOS_VALIDOS"):
                if c in l:
                    coluna = (c,)
                    break
            else:
                if "QT_VOTOS_NOMINAIS_VALIDOS" in l:
                    leg = next((c for c in ("QT_TOTAL_VOTOS_LEG_VALIDOS", "QT_VOTOS_LEGENDA_VALIDOS", "QT_VOTOS_LEG_VALIDOS") if c in l), None)
                    coluna = ("QT_VOTOS_NOMINAIS_VALIDOS",) + ((leg,) if leg else ())
                else:
                    coluna = ("QT_VOTOS_NOMINAIS", "QT_VOTOS_LEGENDA")
            log(f"  votos válidos = soma de {coluna}")
        s = soma[(l["SG_UE"].strip(), cargo, cod_eleicao(l))]
        s["aptos"] += inteiro(l.get("QT_APTOS"))
        s["validos"] += sum(inteiro(l.get(c)) for c in coluna)
        gerado = data_geracao(l, gerado)
    return mais_recente(dict(soma)), gerado


def ler_candidatos(zip_path: Path):
    """Votos somados de cada candidato e se foi eleito, por (unidade eleitoral, cargo)."""
    votos = defaultdict(int)          # (ue, cargo, sq, turno) -> votos
    eleito = {}                       # (ue, cargo, sq) -> turno em que foi eleito
    gerado = ""
    coluna = None
    for l in linhas(zip_path):
        cargo = CARGOS.get((l.get("CD_CARGO") or "").strip())
        if not cargo or not ordinaria(l):
            continue
        if coluna is None:
            coluna = "QT_VOTOS_NOMINAIS_VALIDOS" if "QT_VOTOS_NOMINAIS_VALIDOS" in l else "QT_VOTOS_NOMINAIS"
            log(f"  votos do candidato = {coluna}")
        ue = l["SG_UE"].strip()
        sq = l["SQ_CANDIDATO"].strip()
        turno = inteiro(l.get("NR_TURNO") or 1)
        el = cod_eleicao(l)
        votos[(ue, cargo, el, sq, turno)] += inteiro(l.get(coluna))
        if (l.get("DS_SIT_TOT_TURNO") or "").upper().startswith("ELEITO"):
            eleito[(ue, cargo, el, sq)] = turno
        gerado = data_geracao(l, gerado)

    resultado = defaultdict(lambda: {"eleitos": 0, "menor_eleito": None, "maior_eleito": None, "segundo_turno": False})
    for (ue, cargo, el, sq), turno in eleito.items():
        v = votos[(ue, cargo, el, sq, turno)]
        r = resultado[(ue, cargo, el)]
        r["eleitos"] += 1
        r["menor_eleito"] = v if r["menor_eleito"] is None else min(r["menor_eleito"], v)
        r["maior_eleito"] = v if r["maior_eleito"] is None else max(r["maior_eleito"], v)
        if turno == 2:
            r["segundo_turno"] = True
    return mais_recente(dict(resultado)), gerado


# ---------------------------------------------------------------- regras

def quociente_eleitoral(validos: int, vagas: int) -> int | None:
    """Código Eleitoral, art. 106: despreza a fração se igual ou inferior a meio, arredonda para cima se superior."""
    if not vagas:
        return None
    inteiro_, resto = divmod(validos, vagas)
    return inteiro_ + (1 if resto * 2 > vagas else 0)


def cargo(ue: str, nome: str, vagas, detalhe, cand, ano: int):
    n = vagas.get((ue, nome))
    if not n:
        return None
    d = detalhe.get((ue, nome), {})
    c = cand.get((ue, nome), {})
    # Com uma vaga, o número que importa é o do vencedor. Com várias, o do eleito com menos votos.
    eleito = c.get("maior_eleito") if n == 1 else c.get("menor_eleito")
    out = {"ano": ano, "vagas": n, "validos": d.get("validos"), "menor_eleito": eleito}
    if nome in PROPORCIONAIS:
        out["qe"] = quociente_eleitoral(d.get("validos") or 0, n) if d.get("validos") else None
    else:
        out["segundo_turno"] = c.get("segundo_turno", False)
    if nome == "prefeito":
        out["eleitores"] = d.get("aptos")
    if c and c.get("eleitos") != n:
        out["eleitos"] = c.get("eleitos")  # aparece só quando difere das vagas (ex.: eleição anulada)
    return {k: v for k, v in out.items() if v is not None}


# ---------------------------------------------------------------- nomes (TSE x IBGE)

def chave(nome: str) -> str:
    s = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode().upper()
    s = re.sub(r"\b(D[AEO]S?|E)\b", " ", s)
    return re.sub(r"[^A-Z]", "", s)


def nomes_tse(zip_path: Path):
    """(UF, código TSE) -> nome do município, a partir do arquivo de vagas municipais."""
    out = {}
    for l in linhas(zip_path):
        if CARGOS.get((l.get("CD_CARGO") or "").strip()) == "vereador":
            out[(l["SG_UF"].strip(), l["SG_UE"].strip())] = l["NM_UE"].strip()
    return out


# Municípios com nome diferente no IBGE e no TSE, que nem a semelhança resolve.
APELIDOS_TSE = {
    ("RR", "São Luiz do Anauá"): "SÃO LUIZ",
    ("RN", "Januário Cicco"): "BOA SAÚDE",
}


def casar(ibge_por_uf, tse_nomes):
    """IBGE -> código TSE, por nome normalizado dentro da UF; o que sobrar vai por semelhança."""
    mapa = {}
    sobras = []
    por_uf = defaultdict(dict)
    for (uf, cod), nome in tse_nomes.items():
        por_uf[uf][chave(nome)] = cod
    for uf, muns in ibge_por_uf.items():
        livres = dict(por_uf.get(uf, {}))
        pendentes = []
        for m in muns:
            k = chave(APELIDOS_TSE.get((uf, m["nome"]), m["nome"]))
            if k in livres:
                mapa[m["id"]] = livres.pop(k)
            else:
                pendentes.append(m)
        for m in pendentes:
            perto = get_close_matches(chave(m["nome"]), list(livres), n=1, cutoff=0.8)
            if perto:
                mapa[m["id"]] = livres.pop(perto[0])
                log(f"  casado por semelhança: {m['nome']}/{uf} = {tse_nomes[(uf, mapa[m['id']])]}")
            else:
                sobras.append(f"{m['nome']}/{uf}")
    if sobras:
        log(f"  sem eleição municipal no TSE: {', '.join(sobras)}")
    return mapa


# ---------------------------------------------------------------- principal

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cache", type=Path, default=RAIZ / ".cache" / "caminho")
    args = ap.parse_args()
    cache = args.cache

    def zip_tse(pasta: str, ano: int):
        return baixar(f"{TSE}/{pasta}/{pasta}_{ano}.zip", cache / f"{pasta}_{ano}.zip")

    # Eleição geral mais recente já publicada
    for ano_geral in ANOS_GERAIS:
        zips_gerais = [zip_tse(p, ano_geral) for p in ("consulta_vagas", "detalhe_votacao_munzona", "votacao_candidato_munzona")]
        if all(zips_gerais):
            break
    else:
        raise SystemExit("Nenhuma eleição geral disponível no TSE")
    zips_mun = [zip_tse(p, ANO_MUNICIPAL) for p in ("consulta_vagas", "detalhe_votacao_munzona", "votacao_candidato_munzona")]
    if not all(zips_mun):
        raise SystemExit(f"Arquivos de {ANO_MUNICIPAL} indisponíveis no TSE")

    log(f"eleição geral: {ano_geral}")
    vg, g1 = ler_vagas(zips_gerais[0])
    dg, g2 = ler_detalhe(zips_gerais[1])
    cg, g3 = ler_candidatos(zips_gerais[2])
    log(f"eleição municipal: {ANO_MUNICIPAL}")
    vm, g4 = ler_vagas(zips_mun[0])
    dm, g5 = ler_detalhe(zips_mun[1])
    cm, g6 = ler_candidatos(zips_mun[2])

    ibge = baixar_json(IBGE_MUNICIPIOS, cache / "ibge_municipios.json")
    pop_raw = baixar_json(IBGE_POPULACAO, cache / "ibge_populacao_2022.json")
    populacao = {}
    for serie in pop_raw[0]["resultados"][0]["series"]:
        valor = serie["serie"].get("2022")
        if valor and valor.isdigit():
            populacao[int(serie["localidade"]["id"])] = int(valor)

    ibge_por_uf = defaultdict(list)
    nomes_uf = {}
    for m in ibge:
        uf = m["microrregiao"]["mesorregiao"]["UF"] if m.get("microrregiao") else m["regiao-imediata"]["regiao-intermediaria"]["UF"]
        ibge_por_uf[uf["sigla"]].append({"id": m["id"], "nome": m["nome"]})
        nomes_uf[uf["sigla"]] = uf["nome"]
    total_ibge = sum(len(v) for v in ibge_por_uf.values())
    log(f"IBGE: {total_ibge} municípios")

    mapa = casar(ibge_por_uf, nomes_tse(zips_mun[0]))

    SAIDA.mkdir(parents=True, exist_ok=True)
    resumo = {"municipios": 0, "com_eleicao": 0, "divergencias": []}
    for uf in UFS:
        muns = []
        for m in sorted(ibge_por_uf.get(uf, []), key=lambda m: chave(m["nome"])):
            cod = mapa.get(m["id"])
            item = {"ibge": m["id"], "nome": m["nome"], "pop": populacao.get(m["id"])}
            if cod:
                item["tse"] = cod
                for nome in ("vereador", "prefeito"):
                    c = cargo(cod, nome, vm, dm, cm, ANO_MUNICIPAL)
                    if c:
                        item[nome] = c
                        if "eleitos" in c:
                            resumo["divergencias"].append(f"{m['nome']}/{uf} {nome}: {c['eleitos']} eleitos para {c['vagas']} vagas")
                resumo["com_eleicao"] += 1
            muns.append({k: v for k, v in item.items() if v is not None})
            resumo["municipios"] += 1
        (SAIDA / f"municipios-{uf}.json").write_text(
            json.dumps(muns, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")

    estados = {}
    for uf in UFS:
        e = {"nome": nomes_uf.get(uf, uf)}
        for nome in ("governador", "senador", "deputado_federal", "deputado_estadual", "deputado_distrital"):
            c = cargo(uf, nome, vg, dg, cg, ano_geral)
            if c:
                e[nome] = c
        estados[uf] = e

    brasil = {
        "gerado_em": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "eleicao_municipal": ANO_MUNICIPAL,
        "eleicao_geral": ano_geral,
        "arquivos_tse_gerados_em": {
            f"{ano_geral}": max(g1, g2, g3),
            f"{ANO_MUNICIPAL}": max(g4, g5, g6),
        },
        "fontes": {
            "vagas": f"{TSE}/consulta_vagas/",
            "votos_validos": f"{TSE}/detalhe_votacao_munzona/",
            "votos_candidatos": f"{TSE}/votacao_candidato_munzona/",
            "municipios": IBGE_MUNICIPIOS,
            "populacao": "https://sidra.ibge.gov.br/tabela/4709",
        },
        "total_municipios": resumo["municipios"],
        "municipios_com_eleicao": resumo["com_eleicao"],
        "estados": estados,
    }
    (SAIDA / "brasil.json").write_text(json.dumps(brasil, ensure_ascii=False, indent=1) + "\n", "utf-8")

    # Conferência rápida no log
    log(f"municípios: {resumo['municipios']}, com eleição municipal casada: {resumo['com_eleicao']}")
    for d in resumo["divergencias"][:30]:
        log(f"  divergência: {d}")
    go = json.loads((SAIDA / "municipios-GO.json").read_text("utf-8"))
    goiania = next(m for m in go if m["nome"] == "Goiânia")
    log("Goiânia:", json.dumps(goiania, ensure_ascii=False))
    log("GO:", json.dumps(estados["GO"], ensure_ascii=False))
    log("DF:", json.dumps(estados["DF"], ensure_ascii=False))


if __name__ == "__main__":
    main()
