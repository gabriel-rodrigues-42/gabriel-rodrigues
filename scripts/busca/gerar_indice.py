"""Gera o índice da busca do site (a lupa do cabeçalho).

Lê cada site/**/index.html e as ideias de site/ideias/ideias.js (e ideias-en.js) e grava
site/busca/indice-pt.json e site/busca/indice-en.json. Os arquivos gerados ficam fora do Git:
o deploy (.github/workflows/deploy.yml) roda este script antes de publicar.
A busca em si roda no navegador (site/design-system/busca.js), sem servidor.

Uso: python3 scripts/busca/gerar_indice.py
"""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SITE = RAIZ / "site"
SAIDA = SITE / "busca"

# Páginas que não entram na busca: o modelo, os bastidores (noindex) e o design system.
PULAR = ("projetos/_modelo/", "bastidores/", "design-system/")
# Texto corrido guardado por página (o resto não ajuda a achar e pesa no celular).
INICIO = {"pt": "Página inicial", "en": "Home page"}
LIMITE_TEXTO = 5000
SUFIXO_TITULO = re.compile(r"\s*[·|–-]\s*Gabriel Rodrigues\s*$")
PREFIXO_TITULO = re.compile(r"^Gabriel Rodrigues\s*·\s*")
FERRAMENTAS = ("/caminho/", "/partidos/", "/projetos/reindustrializacao/simulador/")


class Leitor(HTMLParser):
    """Junta título, descrição, h1, seções (h2 com id) e o texto do <main>."""

    IGNORAR = {"script", "style", "noscript", "svg", "template", "form", "button", "select", "textarea", "nav"}
    # Fim de bloco vira espaço, para as palavras não grudarem ("Câmara" + "Programa").
    BLOCOS = {"p", "li", "h2", "h3", "h4", "dd", "dt", "td", "th", "br", "div", "section", "article",
              "header", "figcaption", "blockquote", "summary", "details", "tr", "span", "a", "strong", "em", "small"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titulo = ""
        self.descricao = ""
        self.h1 = ""
        self.secoes = []
        self.texto = []
        self.pilha_ignorar = 0
        self.no_main = 0
        self.em = None  # "title", "h1" ou "h2"
        self.buffer = []
        self.id_h2 = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and a.get("name") == "description":
            self.descricao = a.get("content", "").strip()
        if tag in self.IGNORAR:
            self.pilha_ignorar += 1
            return
        if self.pilha_ignorar:
            return
        if tag == "main":
            self.no_main += 1
        if tag == "title" or (tag in ("h1", "h2") and self.no_main):
            self.em, self.buffer, self.id_h2 = tag, [], a.get("id")
        if tag in self.BLOCOS and self.no_main:
            self.texto.append(" ")

    def handle_endtag(self, tag):
        if tag in self.IGNORAR:
            self.pilha_ignorar = max(0, self.pilha_ignorar - 1)
            return
        if tag == "main":
            self.no_main = max(0, self.no_main - 1)
        if tag in self.BLOCOS and self.no_main and not self.pilha_ignorar:
            self.texto.append(" ")
        if tag == self.em:
            frase = limpar("".join(self.buffer))
            if tag == "title" and not self.titulo:
                self.titulo = SUFIXO_TITULO.sub("", PREFIXO_TITULO.sub("", frase))
            elif tag == "h1" and not self.h1:
                self.h1 = frase
            elif tag == "h2" and frase:
                self.secoes.append([frase, self.id_h2 or ""])
            self.em = None

    def handle_data(self, data):
        if self.pilha_ignorar:
            return
        if self.em:
            self.buffer.append(data)
        if self.no_main and self.em != "h1":
            self.texto.append(data)


def limpar(s):
    return re.sub(r"\s+", " ", s).strip()


def tipo_de(url):
    sem_en = re.sub(r"^/en(?=/)", "", url)
    if any(sem_en.startswith(f) for f in FERRAMENTAS):
        return "ferramenta"
    if re.fullmatch(r"/projetos/[^/]+/", sem_en):
        return "proposta"
    return "pagina"


def miniaturas():
    """href -> miniatura, lidos de projetos/propostas.js."""
    js = (SITE / "projetos" / "propostas.js").read_text(encoding="utf-8")
    return dict(re.findall(r'href:\s*"([^"]+)",\s*img:\s*"([^"]+)"', js))


def ideias(arquivo):
    """Lê id, título e gancho de cada ideia. O formato está no topo de ideias.js."""
    js = arquivo.read_text(encoding="utf-8")
    blocos = re.split(r"\n  \{\n", js.split("window.IDEIAS", 1)[1])[1:]
    saida = []
    for b in blocos:
        b = "\n" + b
        campo = lambda nome: (re.search(rf'\n    {nome}:\s*"((?:[^"\\]|\\.)*)"', b) or [None, ""])[1]
        if campo("id"):
            saida.append({"id": campo("id"), "titulo": campo("titulo"), "gancho": campo("gancho")})
    return saida


def main():
    imgs = miniaturas()
    indice = {"pt": [], "en": []}
    for arq in sorted(SITE.rglob("index.html")):
        rel = arq.relative_to(SITE).as_posix()
        if rel.startswith(PULAR) or "/" + rel in ("/en/" + p for p in PULAR):
            continue
        if any(rel.startswith("en/" + p) for p in PULAR):
            continue
        url = "/" + rel[: -len("index.html")]
        html = arq.read_text(encoding="utf-8")
        if 'name="robots" content="noindex' in html:
            continue
        p = Leitor()
        p.feed(html)
        idioma = "en" if url.startswith("/en/") else "pt"
        texto = limpar("".join(p.texto))[:LIMITE_TEXTO]
        item = {
            "u": url,
            "t": INICIO[idioma] if url in ("/", "/en/") else (p.titulo or p.h1),
            "d": p.descricao,
            "k": tipo_de(url),
            "s": p.secoes,
            "x": texto,
        }
        img = imgs.get(re.sub(r"^/en(?=/)", "", url))
        if img:
            item["i"] = img
        indice[idioma].append(item)

    # Ideias que ainda não têm página própria entram como item de /ideias/#id.
    paginas = {re.sub(r"^/en(?=/)", "", i["u"]) for lista in indice.values() for i in lista}
    for idioma, arquivo, base in (("pt", "ideias.js", "/ideias/"), ("en", "ideias-en.js", "/en/ideias/")):
        for ideia in ideias(SITE / "ideias" / arquivo):
            if f"/projetos/{ideia['id']}/" in paginas or ideia["id"] == "qual-caminho":
                continue
            indice[idioma].append({
                "u": f"{base}#{ideia['id']}", "t": ideia["titulo"], "d": ideia["gancho"],
                "k": "ideia", "s": [], "x": "",
            })

    SAIDA.mkdir(exist_ok=True)
    for idioma, itens in indice.items():
        destino = SAIDA / f"indice-{idioma}.json"
        destino.write_text(json.dumps(itens, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        print(f"{destino.relative_to(RAIZ)}: {len(itens)} itens, {destino.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
