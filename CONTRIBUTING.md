# Como contribuir

Este repositório é o site [gabriel-rodrigues.com](https://gabriel-rodrigues.com). Nele eu desenvolvo em público propostas para melhorar sistemas que todo mundo usa: cartório, indústria, carro, plataformas digitais. Toda proposta está em construção e aberta a crítica. A sua ideia, o seu dado ou a sua crítica podem entrar nela.

Não precisa saber programar. Precisa de uma conta gratuita no GitHub.

## Três jeitos de ajudar

| Você tem | Use | Link |
|---|---|---|
| Uma ideia nova para melhorar um sistema público | **Nova proposta** | [abrir formulário](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=1-nova-proposta.yml) |
| Um dado, uma correção ou uma crítica para uma proposta do site | **Melhorar uma proposta** | [abrir formulário](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=2-melhorar-proposta.yml) |
| Algo quebrado ou difícil de ler no site | **Erro no site** | [abrir formulário](https://github.com/gabriel-rodrigues-42/gabriel-rodrigues/issues/new?template=3-erro-no-site.yml) |

Cada página de proposta no site tem um botão que já abre o formulário certo, com o link da página preenchido.

## O que é inegociável

Estas regras valem para propostas, melhorias, comentários e pull requests. Os formulários pedem que você confirme cada uma.

1. **Cite a fonte e o ano de cada número.** Prefira fontes oficiais: IBGE, TSE, Banco Central, Tesouro Nacional, ministérios, tribunais, leis no [Planalto](https://www.planalto.gov.br). Estudos e reportagens valem com autor e data. Sem fonte, o número não entra.
2. **Busque solução, não culpado.** Critique o sistema, nunca pessoas, partidos, grupos ou profissões. "O registro exige sete etapas" ajuda. "Os cartorários são ladrões" não ajuda e não entra.
3. **Use dados e estime o impacto.** Quem ganha, quanto (tempo, dinheiro, pessoas atendidas) e quem precisa de transição. Mostre a conta, mesmo aproximada. Diga como medir se deu certo.
4. **Respeite a lei eleitoral.** Este é um site de pré-campanha. Nada de pedido de voto, número de urna, propaganda ou ataque a candidatos.
5. **Não exponha dados pessoais (LGPD).** Tudo aqui é público. Não escreva email, telefone, endereço, CPF, título de eleitor ou qualquer dado de outra pessoa, nem em prints. Nada de listas de assinaturas.
6. **Aceite a adaptação.** Ao enviar, você concorda que o texto seja editado e publicado no site, com crédito ao seu usuário do GitHub.

## Como escrever bem

- Frases curtas. Cada frase das propostas vira uma legenda quando o site lê em voz alta.
- Explique como quem fala com um vizinho. Termo técnico, só com explicação.
- Descreva o sistema como um fluxo: quem faz o quê, em que ordem, onde trava.
- Traga a crítica mais dura contra a sua ideia e a sua resposta. Proposta boa aguenta crítica.
- Se a ideia já funciona em outro lugar (outra cidade, outro estado, outro país), conte onde e com que resultado.

## Como eu reviso

1. Toda issue nova chega com o rótulo **para revisar**.
2. Eu leio, confiro as fontes e respondo na própria issue. Posso pedir um ajuste: uma fonte, um número, um jeito de dizer sem apontar o dedo.
3. Depois eu marco um destes rótulos:
   - **em estudo**: a ideia é boa e vou pesquisar mais.
   - **aceita**: vai entrar no site. A issue fica aberta até o pull request que a publica, que fecha a issue e dá crédito a você.
   - **fora do escopo**: não cabe aqui agora. Eu fecho explicando o porquê.
4. Issue que quebra uma regra inegociável é editada ou fechada. Ataque pessoal e dado pessoal são apagados.

Uma proposta aceita segue as fases que o site mostra: Ideia, Estudo, Proposta, No ar.

## Pull requests

Quer mexer direto no texto ou no código? Ótimo. Abra uma issue antes, para combinarmos, e depois o pull request ligado a ela.

- O site é HTML, CSS e JS puros, sem build. Para ver localmente: `python3 -m http.server 8000 -d site`.
- As regras do código (cores só pelos tokens, contraste AA, funcionar em 390 px sem rolagem lateral, versão em inglês em `/en/`, SEO) estão no [CLAUDE.md](CLAUDE.md).
- Ideias curtas ficam em `site/ideias/ideias.js` (formato explicado no topo do arquivo). Páginas de proposta ficam em `site/projetos/<slug>/`, a partir do modelo em `site/projetos/_modelo/`.
- Mudou um texto em português? Mude também a versão em inglês.
- Cada pull request ganha uma prévia em `<branch>.gabriel-rodrigues.pages.dev`.

## Em inglês

The forms are in Portuguese, but you can write in English. The same rules apply: cite sources with year, criticize systems not people, use data and estimate impact, no electoral campaigning, no personal data.
