"""Junta os blocos e os roteiros do estúdio num arquivo só para a página /bastidores/.

Lê videos/estudio/blocos.json e videos/estudio/roteiros/*.json e grava
site/bastidores/estudio.json. O arquivo gerado fica fora do Git: o deploy
(.github/workflows/deploy.yml) roda este script antes de publicar.

Uso: python3 scripts/bastidores/juntar.py
"""
import json
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ESTUDIO = RAIZ / "videos" / "estudio"
SAIDA = RAIZ / "site" / "bastidores" / "estudio.json"

# Só o que a página mostra. Campo novo em blocos.json não vai para o site sem passar por aqui.
CAMPOS_BLOCO = ("id", "tipo", "titulo", "texto", "lugares", "tags", "origem", "duracao", "animacao")
CAMPOS_ROTEIRO = ("slug", "titulo", "pagina", "formatos", "blocos")


def filtrar(item, campos):
    return {c: item[c] for c in campos if c in item}


def main():
    biblioteca = json.loads((ESTUDIO / "blocos.json").read_text(encoding="utf-8"))
    roteiros = [
        filtrar(json.loads(p.read_text(encoding="utf-8")), CAMPOS_ROTEIRO)
        for p in sorted((ESTUDIO / "roteiros").glob("*.json"))
    ]
    dados = {
        "lugares": [filtrar(l, ("id", "nome")) for l in biblioteca.get("lugares", [])],
        "blocos": [filtrar(b, CAMPOS_BLOCO) for b in biblioteca.get("blocos", [])],
        "roteiros": roteiros,
    }
    SAIDA.write_text(json.dumps(dados, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{SAIDA.relative_to(RAIZ)}: {len(dados['blocos'])} blocos, {len(roteiros)} roteiros")


if __name__ == "__main__":
    main()
