# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuário principal é o **curioso que explora tendências**: alguém do universo de produto e tecnologia (normalmente ouvinte do Papo na Arena) que navega pelo site para ver o que está em alta, quais produtos e ferramentas de IA mais aparecem no podcast, como isso muda ao longo dos episódios e o que cada pessoa recomenda. A navegação é exploratória, não uma tarefa com começo e fim.

Também usam o site, sem prioridade sobre o curioso:
- o ouvinte que lembra de um produto citado num episódio e quer achar o nome ou o link;
- quem chega pelo Google procurando "Papo na Arena" ou um produto citado.

## Product Purpose

O Papo na Arena Radar reúne em um só lugar os "produtos da semana" citados no podcast Papo na Arena (de Arthur e Aíquis): ranking dos mais mencionados, episódios, categorias e o que cada pessoa recomendou.

Sucesso significa:
1. **Ser encontrado no Google** quando alguém pesquisa "Papo na Arena" ou um produto citado no podcast.
2. **Ser reconhecido como homenagem** pelos hosts e pela comunidade do podcast.
3. **Achar um produto rápido**: quem procura algo específico chega nele em poucos segundos (busca, episódio ou pessoa).

## Positioning

É o único lugar que transforma o quadro de produtos da semana do Papo na Arena em dados navegáveis: cada menção é registrada à mão, episódio a episódio, com quem citou, e agregada em rankings, categorias e séries ao longo do tempo. Nem o podcast nem a Product Arena oferecem essa visão.

## Operating Context

- Projeto de fã independente, sem vínculo formal com o podcast nem com a Product Arena.
- O mantenedor (Carlos Bronze) adiciona as menções manualmente a cada episódio novo, em `client/src/lib/data.ts` (há uma skill `add-produtos` para isso).
- O site vive em https://paponaarena-produtosdasemana.replit.app e é feito com Replit.
- O podcast está no YouTube (`@PaponaArena`) e no Spotify; cada episódio no site aponta para os dois.

## Capabilities and Constraints

- Dados ficam no próprio código (`client/src/lib/data.ts`); não há banco de dados nem API para o conteúdo. O schema em `shared/schema.ts` não é usado.
- Regras de agregação: produtos com `parentId` somam no produto-pai; produtos combo (`alsoCredits`) creditam vários produtos com uma única menção; rankings e categorias contam só produtos-raiz.
- Páginas: Dashboard, Episódios (lista por ano e detalhe), Produtos (ranking com busca e detalhe), Categorias, Pessoas e Sobre.
- O servidor Express pré-renderiza o HTML de cada rota e gera `sitemap.xml` para SEO; títulos e descrições por rota ficam em `client/src/lib/seo.ts`.
- Analytics via PostHog (eventos de clique em cards, links do podcast etc.).
- Termos do produto: "produtos da semana", "menções", "hosts" e "cohosts", "Radar".
- Em aberto: as ideias de gamificação em `gamification-ideias.md` (streaks, biblioteca pessoal, níveis) não foram decididas.

## Brand Commitments

- Nome: **Papo na Arena Radar**.
- Homenagem de fã, **nunca** apresentada como site oficial: o aviso "Projeto de fã, não oficial" fica sempre visível, e o site não usa o logo nem o wordmark da Product Arena.
- Crédito ao Replit ("Feito com Replit") faz parte do site.
- Textos em português do Brasil, linguagem simples e direta.

## Evidence on Hand

- Dados reais de todos os episódios registrados em `client/src/lib/data.ts` (episódios, produtos, pessoas, menções); os totais crescem a cada episódio.
- Fotos dos hosts em `attached_assets/`.
- Não existem depoimentos, números de audiência, endosso dos hosts ou parcerias; nada disso deve ser inventado.

## Product Principles

1. **Os dados são o produto.** Cada número precisa bater com as menções registradas; agregação correta vale mais que qualquer efeito visual.
2. **Explorar é o caso principal, achar é obrigatório.** O site convida a navegar por tendências, mas nunca atrapalha quem quer um produto específico.
3. **Homenagem, não imitação.** Conversa com a identidade do podcast e da Product Arena sem se passar por eles.
4. **Encontrável por padrão.** Toda página relevante tem URL própria, HTML pré-renderizado e título/descrição em português.

## Accessibility & Inclusion

O site segue o WCAG AA (contraste, zoom, alvos de toque e rótulos para leitores de tela foram revisados), e mudanças futuras devem manter esse nível.
