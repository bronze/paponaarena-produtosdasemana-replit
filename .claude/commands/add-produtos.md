Adiciona novas menções de produtos da semana ao episódio mais recente em `client/src/lib/data.ts`.

## Como usar

Cole a lista de menções no seguinte formato (um por linha):

```
Nome da Pessoa - Nome do Produto
Nome da Pessoa - Nome do Produto (url: https://...)
Nome da Pessoa - Nome do Produto (categoria: AI Tools)
```

Se não informar URL ou categoria, use bom senso para inferir a categoria com base nos produtos já existentes no arquivo.

## O que fazer

1. **Leia o arquivo** `client/src/lib/data.ts` completo para entender o estado atual.

2. **Identifique o episódio mais recente**: é o último item do array `episodes` (maior `id`).

3. **Para cada entrada na lista fornecida:**

   a. **Pessoa** — procure no array `people` pelo nome usando correspondência exata e também por similaridade:
   - Normalize para comparação: remova acentos, converta para minúsculas, ignore espaços extras
   - Considere match se: nomes são idênticos após normalização, um contém o outro, ou diferem em apenas 1-2 caracteres (typo)
   - Exemplos de matches que devem ser detectados: "Joao" ↔ "João", "Ana Lu" ↔ "Ana Lú", "Carol" ↔ "Karol", "Beatriz" ↔ "Beatris"
   - **Se encontrar nome similar mas não idêntico**: pergunte ao usuário antes de prosseguir — "Encontrei '[nome existente]' (id: '...'). É a mesma pessoa ou uma nova?"
   - **Se não houver nenhum match**: crie uma entrada nova com:
     - `id`: slug em kebab-case do nome sem acentos (ex: "João Silva" → `"joao-silva"`)
     - `name`: nome como fornecido
     - Adicione no final do array `people`, antes do `];`

   b. **Produto** — procure no array `products` pelo nome usando correspondência exata e também por similaridade:
   - Normalize para comparação: remova acentos, converta para minúsculas, ignore espaços extras e pontuação
   - Considere match se: nomes são idênticos após normalização, um contém o outro, ou diferem em apenas 1-2 caracteres
   - Exemplos: "Chat GPT" ↔ "ChatGPT", "Notion AI" ↔ "Notion", "VS Code" ↔ "VSCode"
   - **Se encontrar produto similar**: pergunte ao usuário — "Encontrei '[produto existente]' (id: '...'). É o mesmo produto ou um novo?"
   - **Se não houver nenhum match**: crie uma entrada nova com:
     - `id`: slug em kebab-case do nome sem acentos (ex: "Linear App" → `"linear-app"`)
     - `name`: nome como fornecido
     - `category`: categoria inferida ou fornecida
     - `url`: URL se fornecida
     - Adicione no final do array `products`, antes do `];`

   c. **Menção** — adicione no final do array `mentions`, antes do `];`:
   - `id`: formato `"m{episodeId}-{N}"` onde N continua a sequência do episódio
   - `episodeId`: ID do episódio mais recente
   - `personId`: ID da pessoa
   - `productId`: ID do produto
   - `context`: inclua se houver contexto relevante mencionado

4. **Verifique tipos com** `npx tsc --noEmit` ao final e corrija erros se houver.

## Entradas

$ARGUMENTS
