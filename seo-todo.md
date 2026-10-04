# SEO – To-do Papo na Arena

Objetivo: ser encontrado quando pesquisarem por "Papo na Arena".

## 1. Fundamentos (index.html + arquivos estáticos)

- [ ] Trocar `<html lang="en">` por `lang="pt-BR"`
- [ ] Melhorar `<title>` e `description` da home (incluir "Papo na Arena", "produtos da semana", "episódios", "menções")
- [ ] Adicionar `<link rel="canonical">`
- [ ] Adicionar `og:site_name`, `og:locale=pt_BR`, `og:image:width/height/alt`
- [ ] Criar `client/public/robots.txt` (apontando para o sitemap)
- [ ] Criar `sitemap.xml` (estático ou gerado no build a partir de `client/src/lib/data.ts`: episódios, produtos, pessoas, categorias)
- [ ] Garantir que `/robots.txt` e `/sitemap.xml` não caiam no fallback `index.html` do Express (`server/static.ts`)
- [ ] Retornar status 404 real para rotas inexistentes

## 2. Meta tags por página

- [ ] Criar componente/hook `<Seo>` (title, description, canonical, og:*) — `react-helmet-async` ou `document.title` + manipulação de meta
- [ ] Aplicar em: Dashboard, Episódios (lista e detalhe), Produtos (lista e detalhe), Categorias, Pessoas
- [ ] Padrão de title: `Ep136 – <título> | Papo na Arena`, `<Produto> – menções no Papo na Arena`
- [ ] Description dinâmica por página (ex.: produtos citados no episódio)

## 3. Dados estruturados (JSON-LD)

- [ ] `WebSite` + `PodcastSeries` na home
- [ ] `PodcastEpisode` em cada episódio
- [ ] `sameAs` com links oficiais: YouTube (https://www.youtube.com/@PaponaArena) e Spotify (https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ)
- [ ] Validar no Rich Results Test

## 4. Renderização (prerender/SSG)

- [ ] Prerenderizar rotas no build, já que os dados são estáticos em `data.ts` (HTML com title/meta/conteúdo sem depender de JS)
- [ ] Conferir com `curl` que o HTML de `/episodes/136` já traz título e conteúdo
- [ ] Checar prévia de links (WhatsApp, LinkedIn, X) por página

## 5. Conteúdo

- [ ] Criar página `/sobre` explicando o que é o Papo na Arena (Arthur e Aíquis, tema, frequência), com o nome da marca em texto real
- [ ] Texto introdutório indexável na home
- [ ] Links internos entre episódio ↔ produto ↔ pessoa ↔ categoria (conferir que são `<a href>` reais)

## 6. Performance (Core Web Vitals)

- [ ] Reduzir Google Fonts (hoje ~25 famílias) para só as usadas
- [ ] Otimizar `og-image.png` e demais imagens
- [ ] Rodar Lighthouse/PageSpeed antes e depois

## 7. Fora do código (maior impacto para busca de marca)

- [x] ~~Domínio próprio~~ — decisão: **manter `paponaarena-produtosdasemana.replit.app`** (o site mostra que foi feito com Replit; Arthur é embaixador do Replit). Canonicals, sitemap e og:url usam essa URL.
- [ ] Reforçar a vinculação com o Replit no site (ex.: "Feito com Replit" no rodapé/sobre) — também vira conteúdo indexável
- [ ] Cadastrar no Google Search Console e Bing Webmaster Tools e enviar o sitemap
- [ ] Backlinks: descrição dos episódios no Spotify/YouTube, site oficial do podcast, LinkedIn, Instagram, bio dos hosts
- [ ] Monitorar posição para "Papo na Arena" no Search Console

## Decisões

- Sem domínio próprio: o site fica no `.replit.app` de propósito (vitrine do Replit).
- Como a autoridade do domínio é baixa, o peso da busca de marca vem de backlinks (YouTube, Spotify, redes) e de texto real com "Papo na Arena" nas páginas.
- `sameAs`: YouTube `@PaponaArena` e Spotify show `7lcBkPYn5HgEZjTkJhNUFJ`.

## Ordem sugerida

1. Bloco 1 → 2 → 3
2. Bloco 4 (prerender)
3. Bloco 7 (Search Console + backlinks) em paralelo
4. Blocos 5 e 6
