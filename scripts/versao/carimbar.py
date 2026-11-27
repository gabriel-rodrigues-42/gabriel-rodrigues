"""Carimba a versão dos CSS e JS do site no deploy (cache-busting automático).

Para cada <link href> e <script src> de arquivo local .css ou .js nas páginas de site/,
põe ?v=<8 letras do hash do conteúdo>. Assim o navegador baixa de novo só o que mudou,
e ninguém precisa trocar ?v= à mão.

Os módulos que o moldura.js carrega sob demanda (busca e modo leitura) ganham a versão
nas constantes VERSAO_BUSCA e VERSAO_LEITOR antes de o próprio moldura.js ser carimbado.

Roda no deploy (.github/workflows/deploy.yml), em cima da cópia do checkout. No Git os
arquivos ficam sem ?v=. Para ver localmente: python3 scripts/versao/carimbar.py
"""
import hashlib
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[2] / "site"
DS = SITE / "design-system"
REF = re.compile(r'(?P<attr>href|src)="(?P<url>[^"?#:]+\.(?:css|js))(?:\?v=[^"]*)?"')


def hash_de(*arquivos: Path) -> str:
    h = hashlib.sha256()
    for a in arquivos:
        h.update(a.read_bytes())
    return h.hexdigest()[:8]


def carimbar_moldura() -> None:
    moldura = DS / "moldura.js"
    texto = moldura.read_text(encoding="utf-8")
    for const, nome in (("VERSAO_BUSCA", "busca"), ("VERSAO_LEITOR", "leitor")):
        versao = hash_de(DS / f"{nome}.js", DS / f"{nome}.css")
        texto, n = re.subn(rf'const {const} = "[^"]*";', f'const {const} = "{versao}";', texto)
        if n != 1:
            raise SystemExit(f"moldura.js: não achei a constante {const}")
    moldura.write_text(texto, encoding="utf-8")


def carimbar_paginas() -> int:
    cache: dict[Path, str] = {}
    total = 0
    for pagina in SITE.rglob("*.html"):
        texto = pagina.read_text(encoding="utf-8")

        def trocar(m: re.Match) -> str:
            nonlocal total
            # Exemplo de código na página (&lt;link ...&gt;) fica como está.
            if texto.rfind("&lt;", 0, m.start()) > texto.rfind("<", 0, m.start()):
                return m[0]
            url = m["url"]
            arquivo = (SITE / url.lstrip("/")) if url.startswith("/") else (pagina.parent / url)
            arquivo = arquivo.resolve()
            if not arquivo.is_file():
                return m[0]
            if arquivo not in cache:
                cache[arquivo] = hash_de(arquivo)
            total += 1
            return f'{m["attr"]}="{url}?v={cache[arquivo]}"'

        novo = REF.sub(trocar, texto)
        if novo != texto:
            pagina.write_text(novo, encoding="utf-8")
    return total


if __name__ == "__main__":
    carimbar_moldura()
    print(f"{carimbar_paginas()} referências carimbadas.")
