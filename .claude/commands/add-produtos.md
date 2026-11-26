Adiciona um episódio e as menções de produtos da semana aos dados em `client/src/lib/data/`.

## Onde ficam os dados

Os dados são divididos por tipo, um arquivo por array (cada um termina em `];`):

| Arquivo | Conteúdo |
|---|---|
| `client/src/lib/data/episodes.ts` | `episodes` |
| `client/src/lib/data/products.ts` | `products` |
| `client/src/lib/data/people.ts` | `people` |
| `client/src/lib/data/mentions.ts` | `mentions` |
| `client/src/lib/data/index.ts` | reexporta tudo e `dataRevisedAt` |

Esses arquivos são a única fonte de verdade. Qualquer JSON de dados gerado pelo build é derivado deles e **nunca** deve ser editado à mão.

**Não leia os arquivos inteiros.** Eles crescem a cada episódio. Use buscas (`grep`) para encontrar o que precisa, como descrito abaixo.

## Como usar

Cole o episódio e a lista de menções. Formato comum:

```
Ep 144: Título do episódio
2026-11-25
https://www.youtube.com/watch?v=...
https://open.spotify.com/episode/...

Nome da Pessoa: Nome do Produto. Contexto opcional.
Nome da Pessoa - Nome do Produto (url: https://...)
Nome da Pessoa - Nome do Produto (categoria: AI Tools)
```

Opcionalmente, pode indicar quem apresentou o episódio:

```
Hosts: Arthur, Aíquis
Cohosts: Nome do Convidado
```

- `hosts` = quem apresenta (normalmente Arthur e Aíquis, mas pode ser só um).
- `cohosts` = convidados que participam ao vivo, no palco ou em call.
- Quem apenas envia o produto por rede social/comentário **não** entra em `hosts` nem `cohosts`: só aparece nas menções (é a "Comunidade").

Se não informar URL ou categoria, use bom senso para inferir a categoria com base nos produtos já existentes (`grep -o 'category: "[^"]*"' client/src/lib/data/products.ts | sort | uniq -c`).

## O que fazer

1. **Episódio** — veja os últimos episódios com `tail -3 client/src/lib/data/episodes.ts`.
   - Se o episódio informado ainda não existe, adicione-o no final de `episodes.ts`, antes do `];`, seguindo o formato das linhas anteriores (`id`, `title`, `date`, `description`, `youtubeLink`, `spotifyLink`, `hosts`, `cohosts?`).
   - Se nenhum episódio foi informado, use o último (maior `id`).
   - **Hosts/cohosts**: `hosts` é obrigatório, sem padrão implícito. Se foram informados `Hosts:`/`Cohosts:`, use-os (ids de `people`; crie a pessoa se não existir, como abaixo). Se não foram informados e o episódio não tiver `hosts`, pergunte quem apresentou.

2. **Para cada entrada na lista fornecida:**

   a. **Pessoa** — busque em `people.ts` com `grep -i`, tentando variações do nome (sem acento, primeiro nome, sobrenome, apelido):
   - Normalize para comparação: remova acentos, converta para minúsculas, ignore espaços extras
   - Considere match se: nomes são idênticos após normalização, um contém o outro, ou diferem em apenas 1-2 caracteres (typo)
   - Exemplos de matches que devem ser detectados: "Joao" ↔ "João", "Ana Lu" ↔ "Ana Lú", "Carol" ↔ "Karol", "Beatriz" ↔ "Beatris"
   - **Se encontrar nome similar mas não idêntico**: pergunte ao usuário antes de prosseguir — "Encontrei '[nome existente]' (id: '...'). É a mesma pessoa ou uma nova?"
   - **Se não houver nenhum match**: crie uma entrada nova no final de `people.ts`, antes do `];`:
     - `id`: slug em kebab-case do nome sem acentos (ex: "João Silva" → `"joao-silva"`)
     - `name`: nome como fornecido

   b. **Produto** — busque em `products.ts` com `grep -i`, tentando variações do nome (com e sem espaço, pontuação, partes do nome):
   - Normalize para comparação: remova acentos, converta para minúsculas, ignore espaços extras e pontuação
   - Considere match se: nomes são idênticos após normalização, um contém o outro, ou diferem em apenas 1-2 caracteres
   - Exemplos: "Chat GPT" ↔ "ChatGPT", "Notion AI" ↔ "Notion", "VS Code" ↔ "VSCode"
   - **Se encontrar produto similar**: pergunte ao usuário — "Encontrei '[produto existente]' (id: '...'). É o mesmo produto ou um novo?"
   - Variação de um produto existente (ex.: "Claude Code no celular") → produto novo com `parentId` do produto pai.
   - Combo ("A + B") → produto `combo-a-b` com `alsoCredits: ["a", "b"]`, cadastrando A e B se não existirem.
   - **Se não houver nenhum match**: crie uma entrada nova no final de `products.ts`, antes do `];`:
     - `id`: slug em kebab-case do nome sem acentos (ex: "Linear App" → `"linear-app"`)
     - `name`: nome como fornecido
     - `category`: categoria inferida ou fornecida
     - `url`: URL se fornecida ou óbvia

   c. **Menção** — adicione no final de `mentions.ts`, antes do `];`:
   - `id`: formato `"m{episodeId}-{N}"` onde N continua a sequência do episódio (`grep -c 'episodeId: {id},' client/src/lib/data/mentions.ts` dá quantas já existem)
   - `episodeId`: ID do episódio
   - `personId`: ID da pessoa
   - `productId`: ID do produto
   - `context`: inclua se houver contexto relevante mencionado

3. **Verifique tipos e dados com** `npx tsc --noEmit` e `npm run check:data` ao final e corrija erros se houver.

4. **Regere a imagem OG com** `npm run og`. Ela mostra os totais de produtos, menções e episódios e a onda sonora de menções por episódio, num arquivo fixo (`client/public/og-image.jpg`) que não se atualiza sozinho. Abra a imagem gerada para conferir os números e inclua o arquivo no mesmo commit do episódio.

## Entradas

$ARGUMENTS
