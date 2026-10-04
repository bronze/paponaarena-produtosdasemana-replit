# SEO – To-do Papo na Arena

Objetivo: ser encontrado quando pesquisarem por "Papo na Arena".

## 1. Fundamentos (index.html + arquivos estáticos)

- [x] Trocar `<html lang="en">` por `lang="pt-BR"`
- [x] Melhorar `<title>` e `description` da home (incluir "Papo na Arena", "produtos da semana", "episódios", "menções")
- [x] Adicionar `<link rel="canonical">`
- [x] Adicionar `og:site_name`, `og:locale=pt_BR`, `og:image:width/height/alt`
- [x] Criar `client/public/robots.txt` (apontando para o sitemap)
- [x] Criar `sitemap.xml` (estático ou gerado no build a partir de `client/src/lib/data.ts`: episódios, produtos, pessoas, categorias)
- [x] Garantir que `/robots.txt` e `/sitemap.xml` não caiam no fallback `index.html` do Express (`server/static.ts`)
- [x] Retornar status 404 real para rotas inexistentes

## 2. Meta tags por página

- [x] Criar componente/hook `<Seo>` (title, description, canonical, og:*) — `react-helmet-async` ou `document.title` + manipulação de meta
- [x] Aplicar em: Dashboard, Episódios (lista e detalhe), Produtos (lista e detalhe), Categorias, Pessoas
- [x] Padrão de title: `Ep136 – <título> | Papo na Arena`, `<Produto> – menções no Papo na Arena`
- [x] Description dinâmica por página (ex.: produtos citados no episódio)

## 3. Dados estruturados (JSON-LD)

- [x] `WebSite` + `PodcastSeries` na home
- [x] `PodcastEpisode` em cada episódio
- [x] `sameAs` com links oficiais: YouTube (https://www.youtube.com/@PaponaArena) e Spotify (https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ)
- [ ] Validar no Rich Results Test (https://search.google.com/test/rich-results) — só depois de publicar

## 4. Renderização (prerender/SSG)

- [x] Prerenderizar rotas, já que os dados são estáticos em `data.ts` (HTML com title/meta/JSON-LD/conteúdo sem depender de JS). Feito no servidor (`server/prerender.ts`), sem Chrome no build
- [x] Conferir com `curl` que o HTML de `/episodes/136` já traz título e conteúdo (1197 URLs do sitemap verificadas)
- [ ] Checar prévia de links (WhatsApp, LinkedIn, X) por página

## 5. Conteúdo

- [ ] Criar página `/sobre` explicando o que é o Papo na Arena (Arthur e Aíquis, tema, frequência), com o nome da marca em texto real
- [ ] Texto introdutório indexável na home
- [ ] Links internos entre episódio ↔ produto ↔ pessoa ↔ categoria (o prerender já inclui `<a href>` reais; conferir também no app renderizado)

## 6. Performance (Core Web Vitals)

- [x] Reduzir Google Fonts (de ~25 famílias para só Open Sans 400/500/600/700 + itálico 400, as únicas usadas)
- [x] Otimizar imagens: avatares de Arthur e Aíquis de PNG 800×800 (~1 MB) para WebP 256×256 (~14 KB); `og-image.png` era um JPEG com extensão errada, agora `og-image.jpg` (+ `og:image:type`)
- [x] Code-splitting por rota (`React.lazy`); o gráfico (recharts, 377 KB) só carrega na home
- [x] Rodar Lighthouse antes e depois (mobile, build de produção local)

Lighthouse (performance / LCP), antes → depois:

| Página | Performance | LCP | Peso |
|---|---|---|---|
| `/episodes/136` | 56 → 64 | 8,2 s → 6,2 s | 1329 → 881 KiB |
| `/people/arthur` | 52 → 61 | 8,9 s → 7,0 s | 1809 → 951 KiB |
| `/` (home) | 44 → 39–55* | 8,4 s → 8,6 s | 1330 → 1288 KiB |

\* A variância entre rodadas é grande (mesma build: 39, 45, 45, 55, quase só por TBT). A home ficou estável, sem ganho real. Nota SEO continua 100.

Ideias futuras (não feitas; mexem em analytics ou arquitetura):

- [ ] Carregar o PostHog (259 KB sem gzip, ~35% do bundle principal) após o load/idle. Custo: pageviews de visitas muito curtas podem se perder
- [ ] Separar os dados (`data.ts`, ~200 KB no bundle principal) do código das páginas
- [ ] Carregar o gráfico da home depois do restante do dashboard

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


## Pendencias

Escolhas que você pode querer rever
- Em PodcastSeries, o url aponta para o Spotify, já que este site é um complemento e não o site oficial do podcast. O WebSite representa o nosso .replit.app.
- Não coloquei pessoas por episódio. O campo hosts existe só em 9 de 103 episódios e mistura convidados com hosts, então o dado seria impreciso.

Pendente no bloco 4: checar as prévias de link no WhatsApp, LinkedIn e X. Só dá para fazer depois de publicar.