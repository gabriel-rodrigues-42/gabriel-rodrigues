---
name: pagina-de-projeto
description: Cria uma página de projeto em site/projetos/ explicando um sistema brasileiro, onde ele trava e a proposta de melhoria, com dados, fontes e o vídeo. Use quando o Gabriel pedir uma página de projeto ou depois de um vídeo novo.
---

# Página de projeto

Cada página é uma referência pública: alguém deve conseguir entender o problema e usar os dados sem ver o vídeo.

1. Copie `site/projetos/_modelo/` para `site/projetos/<slug>/` (o mesmo slug do vídeo, se houver).
2. Troque tudo que está entre `[colchetes]` e **apague** a linha `<meta name="robots" content="noindex">` e o comentário de MODELO.
3. Conteúdo:
   - **Como funciona hoje**: o sistema como fluxo (quem, o quê, em que ordem, onde trava).
   - **Os números**: no máximo 3, cada um com fonte oficial e ano.
   - **O que proponho**: a mudança em linguagem simples e quem é afetado.
   - **Como medir**: um indicador público para acompanhar.
   - **Fontes**: links oficiais completos.
   - Vídeo: troque `VIDEO_ID` pelo ID do YouTube; se ainda não houver vídeo, apague o bloco.
4. Mesmas regras de pré-campanha da skill `novo-video`: sem pedido de voto, sem ataques a pessoas ou partidos.
5. Adicione um cartão no topo da lista em `site/projetos/index.html` (e remova o cartão "Em breve" se ainda existir):
   ```html
   <a class="cartao" href="/projetos/<slug>/"><strong>Título</strong>Uma frase sobre o problema.</a>
   ```
6. Versão em inglês: crie `site/en/projetos/<slug>/index.html` com o mesmo HTML traduzido (`<html lang="en">`, canonical e `og:url` em `/en/`, `og:locale` `en_US` com `og:locale:alternate` `pt_BR`, links internos para `/en/...`). As duas páginas levam o bloco `hreflang` do modelo, e as duas URLs entram no `site/sitemap.xml` com os `xhtml:link`. Adicione também o cartão em `site/en/projetos/index.html` e, se for o caso, em `site/en/index.html`.
7. Confira no celular: `python3 -m http.server 8000 -d site` e abra com largura de 390px. Nada pode rolar para o lado.
8. Abra um PR; a prévia aparece no Cloudflare Pages.
