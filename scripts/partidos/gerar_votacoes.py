#!/usr/bin/env python3
"""Gera os dados da página "Qual partido vota como você?" (site/partidos/).

Para cada tema de TEMAS, acha a votação nominal no Plenário da Câmara dos
Deputados e conta como os deputados de cada partido votaram. Grava
site/partidos/dados/votacoes.json.

Fonte oficial: API de Dados Abertos da Câmara (https://dadosabertos.camara.leg.br/swagger/api.html)
  /proposicoes?siglaTipo=..&numero=..&ano=..   acha a proposição
  /proposicoes/{id}/votacoes                    lista as votações dela
  /votacoes/{id}                                detalhes (data, órgão, descrição)
  /votacoes/{id}/votos                          voto de cada deputado, com o partido do dia
  /votacoes/{id}/orientacoes                    orientação de cada partido ou bloco

Se um tema não tem "votacao" fixa, o script escolhe a votação do Plenário cuja
descrição bate com "busca" e imprime todas as candidatas no log, para conferir
e fixar o id. Só usa a biblioteca padrão. Roda no GitHub Actions
(.github/workflows/dados-partidos.yml), porque a API não abre da nuvem do Claude.
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "site" / "partidos" / "dados" / "votacoes.json"
API = "https://dadosabertos.camara.leg.br/api/v2"

# Cada tema: proposição, regex para achar a votação certa e, depois de conferida, o id fixo.
TEMAS = [
    {"id": "reforma-tributaria", "sigla": "PEC", "numero": 45, "ano": 2019, "busca": r"1º turno|primeiro turno", "data_min": "2023-07-01", "data_max": "2023-07-31", "votacao": None},
    {"id": "arcabouco-fiscal", "sigla": "PLP", "numero": 93, "ano": 2023, "busca": r"[Aa]provad[oa].*(Substitutivo|Projeto)", "data_min": "2023-05-01", "data_max": "2023-05-31", "votacao": None},
    {"id": "redes-sociais", "sigla": "PL", "numero": 2630, "ano": 2020, "busca": r"[Uu]rg[êe]ncia", "data_min": "2023-04-01", "data_max": "2023-04-30", "votacao": None},
    {"id": "marco-temporal", "sigla": "PL", "numero": 490, "ano": 2007, "busca": r"[Aa]provad[oa].*(Substitutivo|Projeto|Emenda)", "data_min": "2023-05-01", "data_max": "2023-05-31", "votacao": None},
    {"id": "saidinha", "sigla": "PL", "numero": 2253, "ano": 2022, "busca": r"[Aa]provad|[Ss]ubstitutivo|[Ee]menda", "data_min": "2024-03-01", "data_max": "2024-03-31", "votacao": None},
    {"id": "importacao-50", "sigla": "PL", "numero": 914, "ano": 2024, "busca": r"[Aa]provad|[Dd]estaque|[Ee]menda", "data_min": "2024-05-01", "data_max": "2024-06-30", "votacao": None},
    {"id": "licenciamento", "sigla": "PL", "numero": 2159, "ano": 2021, "busca": r"[Aa]provad|[Ss]ubstitutivo|[Ee]menda", "data_min": "2025-07-01", "data_max": "2025-07-31", "votacao": None},
    {"id": "blindagem", "sigla": "PEC", "numero": 3, "ano": 2021, "busca": r"1º turno|primeiro turno", "data_min": "2025-09-01", "data_max": "2025-09-30", "votacao": None},
    {"id": "anistia", "sigla": "PL", "numero": 2162, "ano": 2023, "busca": r"[Uu]rg[êe]ncia", "data_min": "2025-09-01", "data_max": "2025-09-30", "votacao": None},
    {"id": "ir-5-mil", "sigla": "PL", "numero": 1087, "ano": 2025, "busca": r"[Aa]provad|[Ss]ubstitutivo", "data_min": "2025-10-01", "data_max": "2025-10-31", "votacao": None},
]

# Partidos que mudaram de nome ou se juntaram, para somar com o nome atual.
APELIDOS = {"UNIÃO": "União", "PODE": "Podemos", "REPUBLICANOS": "Republicanos", "SOLIDARIEDADE": "Solidariedade", "CIDADANIA": "Cidadania", "PCdoB": "PCdoB", "NOVO": "Novo"}


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def get(caminho: str, **params):
    url = API + caminho
    if params:
        url += "?" + urllib.parse.urlencode(params)
    for tentativa in range(5):
        try:
            req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "gabriel-rodrigues.com dados abertos"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)["dados"]
        except Exception as e:  # noqa: BLE001
            log(f"  erro em {url}: {e} (tentativa {tentativa + 1})")
            time.sleep(2 * (tentativa + 1))
    raise SystemExit(f"Falhou: {url}")


def achar_votacao(t):
    props = get("/proposicoes", siglaTipo=t["sigla"], numero=t["numero"], ano=t["ano"])
    if not props:
        raise SystemExit(f"{t['id']}: proposição não encontrada")
    pid = props[0]["id"]
    votacoes = get(f"/proposicoes/{pid}/votacoes")
    cands = []
    log(f"\n== {t['id']} ({t['sigla']} {t['numero']}/{t['ano']}, proposição {pid}) ==")
    for v in sorted(votacoes, key=lambda v: v.get("dataHoraRegistro") or v.get("data") or ""):
        data = (v.get("data") or "")[:10]
        if v.get("siglaOrgao") != "PLEN":
            continue
        desc = (v.get("descricao") or "").replace("\n", " ")
        dentro = t["data_min"] <= data <= t["data_max"]
        bate = bool(re.search(t["busca"], desc))
        log(f"  {v['id']}  {data}  {'✓' if dentro and bate else ' '}  {desc[:220]}")
        if dentro and bate:
            cands.append(v["id"])
    return pid, cands


def contar(vid):
    votos = get(f"/votacoes/{vid}/votos")
    partidos = {}
    for v in votos:
        dep = v.get("deputado_") or {}
        sigla = APELIDOS.get(dep.get("siglaPartido"), dep.get("siglaPartido") or "?")
        tipo = v.get("tipoVoto")
        p = partidos.setdefault(sigla, {"sim": 0, "nao": 0, "outros": 0})
        if tipo == "Sim":
            p["sim"] += 1
        elif tipo == "Não":
            p["nao"] += 1
        else:
            p["outros"] += 1
    orient = {}
    try:
        for o in get(f"/votacoes/{vid}/orientacoes"):
            orient[APELIDOS.get(o.get("siglaPartidoBloco"), o.get("siglaPartidoBloco"))] = o.get("orientacaoVoto")
    except SystemExit:
        pass
    for s, p in partidos.items():
        p["orientacao"] = orient.get(s)
    return partidos


def main():
    saida = {"gerado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
             "fonte": "Câmara dos Deputados, API de Dados Abertos (dadosabertos.camara.leg.br)", "temas": []}
    for t in TEMAS:
        pid, cands = achar_votacao(t)
        vid = t["votacao"]
        if not vid:
            # entre as candidatas, a que teve mais votos nominais
            melhor, n = None, -1
            for c in cands:
                tot = sum(p["sim"] + p["nao"] for p in contar(c).values())
                log(f"  candidata {c}: {tot} votos Sim/Não")
                if tot > n:
                    melhor, n = c, tot
            vid = melhor
        if not vid:
            log(f"  !! {t['id']}: nenhuma votação escolhida")
            continue
        d = get(f"/votacoes/{vid}")
        partidos = contar(vid)
        sim = sum(p["sim"] for p in partidos.values())
        nao = sum(p["nao"] for p in partidos.values())
        log(f"  → escolhida {vid} ({(d.get('dataHoraRegistro') or '')[:10]}): Sim {sim} x Não {nao}")
        saida["temas"].append({
            "id": t["id"], "proposicao": f"{t['sigla']} {t['numero']}/{t['ano']}", "proposicao_id": pid,
            "votacao": vid, "data": (d.get("dataHoraRegistro") or d.get("data") or "")[:10],
            "descricao": d.get("descricao"), "aprovada": d.get("aprovacao"),
            "sim": sim, "nao": nao, "partidos": dict(sorted(partidos.items())),
            "link": f"https://www.camara.leg.br/presenca-comissoes/votacao-portal?reuniao=&itemVotacao={vid}",
            "link_proposicao": f"https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao={pid}",
        })
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    log(f"\nGravado {SAIDA.relative_to(RAIZ)} com {len(saida['temas'])} temas")


if __name__ == "__main__":
    main()
