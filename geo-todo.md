# GEO – To-do Papo na Arena

GEO (Generative Engine Optimization): ser **citado como fonte** quando alguém pergunta a uma IA (ChatGPT, Perplexity, Claude, Gemini, AI Overviews do Google) coisas como:

- "Quais produtos foram recomendados no Papo na Arena?"
- "Qual o produto mais citado no podcast Papo na Arena?"
- "Em qual episódio do Papo na Arena falaram do Claude?"
- "O que o Arthur do Papo na Arena recomenda?"

Base já pronta (ver `seo-todo.md`): prerender no servidor, meta tags por rota, JSON-LD, sitemap, `robots.txt` liberado, página `/sobre` e links internos.

## Diagnóstico (4/out/2026)

### 🔴 Crítico: o prerender das páginas de detalhe quebrou com as URLs em português

O commit `e760120` (endereços em português) trocou as rotas para `/episodios`, `/produtos`, `/pessoas` e `/categorias`, mas dois arquivos ainda comparam com os nomes antigos em inglês (`"episodes"`, `"products"`, `"people"`, `"categories"`):

- `server/prerender.ts` → `bodyContent()`: nenhum `if (section === "episodes" | "products" | "people")` bate, então **toda página de detalhe cai no ramo de categoria**.
- `client/src/lib/seo.ts` → `getJsonLd()`: `sectionNames` e os `if` também usam os nomes em inglês.

Efeito em produção (conferido com `curl`):

| Página | HTML que crawlers e IAs recebem |
|---|---|
| `/episodios/136` | `<h1>136</h1>`, sem lista de produtos, sem links do YouTube/Spotify, **sem `PodcastEpisode`** |
| `/produtos/claude` | `<h1>claude</h1>`, sem episódios |
| `/pessoas/arthur` | `<h1>arthur</h1>`, sem produtos recomendados |
| Todas | Breadcrumb na posição 2 **sem `name`** (inválido no Rich Results) |

Na prática, as ~1.200 páginas de detalhe estão sem conteúdo para quem não executa JS. A maioria dos crawlers de IA (GPTBot, ClaudeBot, PerplexityBot) **não executa JavaScript**. Para eles, essas páginas hoje estão vazias. A validação do bloco 3 do SEO foi feita antes dessa mudança.

### 🟡 O que limita a citação mesmo com o bug corrigido

1. **O conteúdo prerenderizado é só lista de links.** Os LLMs citam frases que respondem perguntas, como "O Claude foi citado 42 vezes em 30 episódios; quem mais recomendou foi o Arthur". Listas soltas de `<a>` sem frases são difíceis de citar.
2. **A página de produto não diz quem recomendou.** O dado existe (`mention.personId`), mas o prerender só lista episódios. "Quem recomendou o quê" é justamente o diferencial do site.
3. **Não existe `llms.txt`** (`/llms.txt` retorna 404).
4. **Ambiguidade de entidade.** O `og:site_name` e o `SITE_NAME` são "Papo na Arena", o mesmo nome do podcast oficial, mas o site é um projeto de fã ("Papo na Arena Radar"). Uma IA pode confundir os dois ou desconfiar da fonte. O ideal é deixar explícito: *Papo na Arena Radar, índice não oficial dos produtos citados no podcast Papo na Arena*.
5. **Pouco dado estruturado além de episódio.** Produto, pessoa, categoria e rankings só têm breadcrumb. Não há `ItemList` nos rankings, nem `Person` ou `ProfilePage`, nem `dateModified`.
6. **Os dados são rasos em alguns pontos:** só 59 das 1.476 menções têm `context`, 339 dos 718 produtos têm `url`, 14 das 409 pessoas têm LinkedIn, e as descrições de episódio têm em média 71 caracteres.
7. **Não há medição.** Não sabemos se alguma IA já cita ou visita o site.

### ✅ O que já ajuda

- O HTML vem do servidor, com title, description e canonical por rota.
- O `robots.txt` libera todos os bots (inclusive os de IA) e aponta para o sitemap.
- `PodcastSeries` com `sameAs` para YouTube e Spotify, e `AboutPage` com autor.
- A página `/sobre` tem texto corrido, números e a explicação do projeto.
- O dado é original e estruturado: ninguém mais tem esse índice de produtos por episódio. É exatamente o tipo de fonte que as IAs gostam de citar.

## 1. Corrigir o prerender (fazer primeiro)

- [x] Trocar `"episodes" | "products" | "people"` por `"episodios" | "produtos" | "pessoas"` em `bodyContent()` (`server/prerender.ts`)
- [x] Mesmo ajuste em `getJsonLd()` (`client/src/lib/seo.ts`): `sectionNames`, `if (section === …)` e `names`
- [x] Categoria: o endereço traz o slug (`ferramentas-de-ia`) e os dados usam o nome original (`AI Tools`). Prerender e breadcrumb agora resolvem com `getCategoryBySlug`
- [ ] (opcional) Usar a mesma união de tipos de seção nos dois arquivos (ou constantes compartilhadas), para que o TypeScript acuse se uma rota mudar de nome de novo. A checagem abaixo já cobre o risco
- [x] `checkPrerender()` em `script/check-data.ts` (roda no `npm run check:data` e no build): prerenderiza todas as páginas de detalhe e confere `<h1>`, `PodcastEpisode` e `name` em todos os breadcrumbs. Com o código antigo, acusa 2.484 problemas
- [x] Conferido com `curl` no build de produção local
- [ ] Publicar e conferir com `curl` `/episodios/136`, `/produtos/claude`, `/pessoas/arthur` e `/categorias/<slug>`
- [ ] Revalidar no Schema Markup Validator e no Rich Results Test (breadcrumb com `name` em todas as posições)

## 2. Conteúdo citável no HTML do servidor

Ideia: cada página abre com 1 ou 2 frases que respondem à pergunta principal sobre ela, com números, e depois vêm os detalhes. A IA cita essa frase.

- [ ] **Produto**: "*X* (categoria) foi citado N vezes em M episódios do Papo na Arena, a primeira vez no Ep A (data) e a mais recente no Ep B. Quem mais recomendou: Fulano (k vezes), Beltrano…" + tabela de episódio → pessoa → contexto + link oficial do produto (`product.url`)
- [ ] **Episódio**: "No Ep136 (data), com Arthur, Aíquis… foram citados N produtos da semana: X (por Fulano), Y (por Beltrano)…" (agrupar por pessoa e não só listar produtos)
- [ ] **Pessoa**: "Fulano participou de N episódios e recomendou M produtos. Os mais frequentes são…" + lista produto → episódio
- [ ] **Categoria**: "Os produtos de *Categoria* mais citados no Papo na Arena são X (n), Y (n) e Z (n)."
- [ ] **Home**: bloco de "fatos-chave" em texto (total de episódios, menções, produto mais citado, pessoa que mais recomendou, último episódio com data)
- [ ] Mostrar "Atualizado em <data do último episódio>" no HTML e usar `dateModified` no JSON-LD (as IAs dão peso a conteúdo recente)
- [ ] Avaliar tirar o fallback do `left:-9999px` e servir o mesmo texto **visível** no React (as frases de resumo valem para quem lê também; conteúdo oculto pode ser visto como cloaking)

## 3. Páginas de resposta (perguntas que as pessoas fazem às IAs)

- [ ] `/sobre` ou nova `/perguntas`: seção de perguntas frequentes em texto real, gerada a partir dos dados (`FAQPage` no JSON-LD):
  - Qual o produto mais citado no Papo na Arena?
  - Quem são os hosts do Papo na Arena?
  - Quantos episódios e produtos da semana já foram registrados?
  - O que é o "produto da semana" no Papo na Arena?
  - Este site é oficial? (não, é projeto de fã)
- [ ] Rankings por ano (`/produtos/2025`? ou seção na página de produtos): "Produtos mais citados no Papo na Arena em 2025". Esse é um formato que as IAs adoram citar
- [ ] Ranking de pessoas ("quem mais recomendou produtos")

## 4. Arquivos para LLMs

- [ ] `/llms.txt` gerado no servidor (como o `sitemap.xml`): o que é o site, que não é oficial, os links principais (episódios, produtos, pessoas, categorias, sobre), os números atuais e o top 20 de produtos
- [ ] `/llms-full.txt`: dump em Markdown de todos os episódios com data, participantes e produtos citados por pessoa. Com os dados em `data.ts` isso sai quase de graça, e assim um agente lê o acervo inteiro em uma única requisição
- [ ] Garantir que os dois não caiam no fallback do SPA (`server/static.ts`) e saiam como `text/plain; charset=utf-8`
- [ ] Linkar o `llms.txt` no `robots.txt` como comentário, e no rodapé da página `/sobre`

## 5. Dados estruturados para entidades

- [ ] Renomear a entidade do site: `WebSite.name` = "Papo na Arena Radar", com `about` → `PodcastSeries` "Papo na Arena". Revisar `og:site_name` e o sufixo `| Papo na Arena` nos titles (talvez "| Papo na Arena Radar")
- [ ] `ItemList` em `/produtos`, `/episodios`, `/categorias/<x>` e no top 15 da home (posição, nome, url)
- [ ] Página de pessoa: `ProfilePage` + `Person` (`sameAs` LinkedIn quando houver)
- [ ] Página de produto: `Thing`/`SoftwareApplication` (quando for app) com `name`, `url` oficial e `subjectOf` → episódios
- [ ] `PodcastEpisode.mentions` → produtos citados (liga episódio ↔ produto no grafo)
- [ ] Hosts com `@id` estável (`/pessoas/arthur#person`) reutilizado em série, episódio e página de pessoa

## 6. Enriquecer os dados (`data.ts`)

Cada item melhora o texto gerado em todas as páginas.

- [ ] `context` nas menções (hoje são 59 de 1.476): uma frase do porquê de a pessoa ter recomendado. **Este é o conteúdo de maior valor para GEO**, por ser único e citável. Começar pelos episódios mais recentes e pelos produtos do top 30
- [ ] `url` oficial nos produtos (hoje são 339 de 718), começando pelos mais citados
- [ ] Descrições de episódio mais longas (média de 71 caracteres hoje). 2 ou 3 frases sobre o tema
- [ ] LinkedIn dos convidados recorrentes (hoje são 14 de 409)
- [ ] Atualizar o comando `/add-produtos` para pedir `context` e `url` ao adicionar menções

## 7. Fora do código (as IAs usam índices de busca)

- [ ] **Bing Webmaster Tools** (já está no `seo-todo.md`): o ChatGPT search e o Copilot usam o índice do Bing. Para GEO, essa é a prioridade fora do código
- [ ] IndexNow (Bing, Yandex): pingar as URLs novas a cada episódio adicionado
- [ ] Conferir o sitemap no Search Console (pendente no `seo-todo.md`)
- [ ] Menções em fontes que as IAs leem: link na descrição dos episódios no YouTube e no Spotify, post no LinkedIn, Reddit/comunidades de produto, bio dos hosts
- [ ] Pedir aos hosts uma menção no podcast ou um link no site oficial (é o sinal de autoridade mais forte para a entidade "Papo na Arena")

## 8. Medir

- [ ] PostHog: insight de visitas com `$referring_domain` em `chatgpt.com`, `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com`, `copilot.microsoft.com`
- [ ] Logs do servidor: contar acessos de `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `PerplexityBot`, `Google-Extended` (middleware simples no Express registrando o user-agent)
- [ ] Bateria de prompts mensal (as 4 perguntas do topo + "quem recomendou X no Papo na Arena?") no ChatGPT, Perplexity, Claude e Gemini; anotar aqui se o site é citado
- [ ] Linha de base antes do bloco 1 (provavelmente zero) para comparar

## Ordem sugerida

1. **Bloco 1** (bug do prerender): sem isso, nada do resto chega aos crawlers
2. Bloco 4 (`llms.txt` / `llms-full.txt`) + bloco 2 (frases de resumo): muito impacto por pouco código
3. Bloco 7 (Bing) e bloco 8 (medição) em paralelo
4. Blocos 5 e 3
5. Bloco 6 continuamente, a cada episódio novo
