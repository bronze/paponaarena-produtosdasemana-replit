# Papo na Arena Radar

Radar dos **produtos da semana** citados no podcast **Papo na Arena**: ranking dos mais mencionados, episódios, categorias e o que cada pessoa recomendou.

**Acesse:** https://paponaarena-produtosdasemana.replit.app

Ouça o podcast: [Spotify](https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ) · [YouTube](https://www.youtube.com/@PaponaArena)

Este site foi feito com [Replit](https://replit.com).

---

## O que dá para fazer no site

- **Dashboard:** números gerais, produtos mais citados, categorias, evolução de menções por episódio e último episódio.
- **Episódios:** lista por ano e página de cada episódio, com quem apresentou (hosts e cohosts), os produtos citados e links para YouTube e Spotify.
- **Produtos:** ranking com busca e ordenação; a página do produto mostra quem citou e em quais episódios.
- **Categorias:** produtos agrupados por tipo.
- **Pessoas:** hosts, convidados e quem enviou produtos, com tudo o que cada um recomendou.
- Visual inspirado na Product Arena, só com tema claro (paleta, tipografia e regras em [`DESIGN.md`](DESIGN.md)).

## Stack

| Camada | Tecnologias |
|---|---|
| Front-end | React 18, TypeScript, Vite, [wouter](https://github.com/molefrog/wouter) (rotas) |
| UI | Tailwind CSS, [shadcn/ui](https://ui.shadcn.com) (Radix UI), Recharts, Lucide |
| Servidor | Node.js, Express 5 (serve o app e gera `sitemap.xml` e o HTML de cada rota) |
| Analytics | [PostHog](https://posthog.com) (opcional) |

Os dados do podcast ficam **no próprio código** (`client/src/lib/data.ts`). Não há banco de dados nem chamadas de API para o conteúdo. O esquema de banco em `shared/schema.ts` existe, mas não é usado pelo app.

## Rodando localmente

Requisitos: **Node.js 20 ou superior** e npm.

```bash
git clone https://github.com/bronze/paponaarena-produtosdasemana-replit.git
cd paponaarena-produtosdasemana-replit
npm install
npm run dev
```

O app abre em http://localhost:5000 (use a variável `PORT` para trocar a porta).

### Variáveis de ambiente (opcionais)

Crie um arquivo `.env` na raiz para ativar o PostHog:

```
VITE_POSTHOG_KEY=...
VITE_POSTHOG_HOST=...
```

Sem elas, o app funciona normalmente e o PostHog simplesmente não é iniciado. O `.env` está no `.gitignore`.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Express + Vite com HMR) |
| `npm run build` | Valida os dados e gera o build de produção em `dist/` |
| `npm start` | Roda o build de produção (`dist/index.cjs`) |
| `npm run check` | Checagem de tipos (`tsc`) |
| `npm run check:data` | Valida a consistência de `data.ts` (ids, menções, hosts/cohosts) |

## Estrutura do projeto

```
client/
  index.html          # metadados padrão do site
  public/             # robots.txt, imagens e arquivos estáticos
  src/
    pages/            # dashboard, episódios, produtos, categorias, pessoas, sobre
    components/       # UI (shadcn/ui), sidebar, SEO por rota
    lib/
      data.ts         # TODOS os dados: episódios, produtos, pessoas, menções
      data-utils.ts   # agregações e rankings
      seo.ts          # title, description, canonical e JSON-LD por rota
server/
  index.ts            # Express
  seo.ts              # sitemap.xml e validação de rotas (404 real)
  prerender.ts        # injeta head e conteúdo de cada rota no HTML
script/
  build.ts            # build do cliente (Vite) e do servidor (esbuild)
  check-data.ts       # validação dos dados
attached_assets/      # avatares e áudios usados nas páginas de pessoa
```

## Modelo de dados

Tudo vive em `client/src/lib/data.ts`, em quatro listas:

| Entidade | Campos principais |
|---|---|
| `Episode` | `id`, `title`, `date`, `description`, `hosts`, `cohosts?`, `youtubeLink?`, `spotifyLink?` |
| `Product` | `id`, `name`, `category`, `url?`, `parentId?`, `alsoCredits?` |
| `Person` | `id`, `name`, `linkedinUrl?` |
| `Mention` | `id`, `episodeId`, `personId`, `productId`, `context?` |

**Papéis nos episódios**

- `hosts`: quem apresenta o episódio (normalmente Arthur e Aíquis, mas é preenchido a cada episódio, sem padrão implícito).
- `cohosts`: convidados que participam ao vivo, no palco ou em call.
- Quem apenas envia o produto por rede social ou comentário **não** entra em `hosts` nem em `cohosts`: aparece só nas menções, como "Comunidade".

**Regras de contagem** (em `data-utils.ts`)

- Produto com `parentId` é uma variação: as menções contam para o produto pai, e a variação não aparece nos rankings.
- Produto com `alsoCredits` é um combo: uma menção credita todos os produtos listados.
- Rankings e totais de categoria consideram só produtos "raiz".

## Como adicionar um episódio

1. Em `client/src/lib/data.ts`, adicione o episódio ao final de `episodes`, **com `hosts`** (e `cohosts`, se houver).
2. Cadastre em `people` e `products` quem ou o que ainda não existir (ids em kebab-case, sem acento).
3. Adicione as menções ao final de `mentions`, com ids no formato `m{episodio}-{n}` (ex.: `m137-1`).
4. Valide:

   ```bash
   npx tsc && npm run check:data
   ```

Quem usa o [Claude Code](https://claude.com/claude-code) pode automatizar as menções com o comando `/add-produtos`, definido em [`.claude/commands/add-produtos.md`](.claude/commands/add-produtos.md).

## SEO

O site é uma SPA, mas cada rota sai do servidor com HTML pronto para buscadores e prévias de link:

- `<head>` por página (title, description, canonical, Open Graph, Twitter Card);
- dados estruturados JSON-LD (`WebSite`, `PodcastSeries`, `PodcastEpisode`, `BreadcrumbList`);
- `sitemap.xml` gerado a partir dos dados e `robots.txt`;
- rotas inexistentes devolvem status 404 de verdade.

O plano e o que já foi feito estão em [`seo-todo.md`](seo-todo.md).

## Deploy

O deploy é feito no Replit (autoscale):

- build: `npm run build`
- execução: `node ./dist/index.cjs`

O sitemap e o HTML das rotas são gerados quando o servidor sobe, então basta republicar depois de alterar os dados.

## Documentação extra

- [`replit.md`](replit.md): visão geral da arquitetura do projeto.
- [`posthog-setup-report.md`](posthog-setup-report.md): eventos de analytics instrumentados.

## Contribuindo

Sugestões e correções são bem-vindas. Se encontrou uma menção errada, um produto faltando ou uma pessoa duplicada, abra uma *issue* ou um *pull request* alterando `client/src/lib/data.ts`. Rode `npx tsc && npm run check:data` antes de enviar.

## Licença

MIT, conforme o campo `license` do `package.json`.
