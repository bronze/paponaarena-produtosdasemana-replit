# Design System — Papo na Arena

Identidade visual do site, inspirada na [Product Arena](https://productarena.io/) e na [página do podcast](https://productarena.io/podcast) como **homenagem de fã**. **Fonte da verdade:** [`client/public/design-system.html`](client/public/design-system.html) (servido em `/design-system.html`). Cor ou componente muda primeiro lá; este arquivo, o `index.css` e a imagem OG seguem.

## Princípios

1. **Acento, não clone.** Usamos as cores deles (coral, preto, off-white), não o layout de landing page nem o logo.
2. **Uma cor de marca, em escala.** Coral `#FF5757` é a única cor de marca; os tons mais claros e mais escuros saem de uma escala fixa. Texto sempre no WCAG AA.
3. **App de consulta, não landing page.** Títulos ganham peso e respiro; tabelas, listas e ranking mantêm a densidade.
4. **Light only.** Não há dark mode.
5. **Fan-made visível.** Sempre há um aviso "Projeto de fã, não oficial".

## Cores

Paleta no método do *Refactoring UI*: em vez de cores soltas, **escalas fixas definidas de antemão**. Toda cor do site é um tom destas escalas (exceto as três cores exclusivas de gráfico e as cores de marca de terceiros, como YouTube e Anthropic). Nada de hex solto nem de clarear/escurecer com filtro (`brightness`).

### Escalas

| Escala | Papel | Tons |
|---|---|---|
| **Coral** (primária) | Ações principais, marca, item ativo | `50 #FFF5F5` · `100 #FFE9E9` · `200 #FFD1D1` · `300 #FFA8A8` · `400 #FF8080` · `500 #FF5757` · `600 #EA3E3E` · `700 #C72329` · `800 #9A1922` · `900 #6B0F18` |
| **Neutral** (cinzas a 240°) | Texto, fundos, bordas, superfícies escuras. Faz a maior parte do trabalho | `0 #FFFFFF` · `50 #FBFBFC` · `100 #F4F4F5` · `200 #E4E4E7` · `300 #D4D4D8` · `400 #A1A1AA` · `500 #71717A` · `600 #52525B` · `700 #3F3F46` · `800 #27272A` · `900 #19191B` · `950 #0E0E10` |
| **Âmbar** (destaque) | Só comemorações, como o callout de marco | `50 #FFFBEB` · `100 #FEF3C7` · `200 #FDE68A` · `300 #FCD34D` · `400 #FBBF24` · `500 #F59E0B` · `600 #D97706` · `700 #B45309` · `800 #92400E` · `900 #78350F` |

Os cinzas têm uma temperatura só (240°, neutro levemente frio, a mesma do preto da Product Arena). No Tailwind, as escalas viram classes `coral-*`, `neutral-*` e `amber-*` (substituem as do Tailwind com o mesmo nome).

### Tokens de uso

Cada token aponta para um tom da escala. Em código, prefira o token ao tom.

| Token | Tom | Uso |
|---|---|---|
| `coral` | coral-500 | Cor de marca: botões primários, faixa CTA, item ativo da sidebar, barras de gráfico |
| `coral-hover` | coral-600 | Hover do botão primário (`hover:bg-primary-hover`) |
| `coral-text` | coral-700 | Texto e links coral sobre fundo claro |
| `destructive` | coral-700 | Erro e ação destrutiva (texto branco por cima) |
| `coral-tint` | coral-100 | Fundo suave de tags e caixas de ícone |
| `ink` | neutral-950 | Texto principal; sidebar; texto sobre coral |
| `ink-2` | neutral-900 | Hover e item ativo sobre superfície escura |
| `ink-3` | neutral-800 | Bordas sobre superfície escura |
| `page` | neutral-50 | Fundo do app (off-white) |
| `highlight` | neutral-100 | **Só** seções/blocos de destaque, cabeçalho de tabela, trilho de barras |
| `surface` | neutral-0 | Cards e popovers |
| `border` | neutral-200 | Bordas no claro |
| `input` | neutral-300 | Borda de campos |
| `muted` | neutral-600 | Texto secundário no claro |
| `on-dark` | neutral-100 | Texto sobre `ink` |
| `on-dark-muted` | neutral-400 | Texto secundário sobre `ink` |

### Onde o cinza entra

No site deles o fundo é claro e o cinza de destaque aparece só em algumas seções ("Agenda da Arena", "Você aprende com quem lidera", "A Arena para cada momento"). Aqui é igual: o fundo é `page` (off-white) e o `highlight` marca blocos pontuais, como o destaque do último episódio no dashboard.

### Contraste (WCAG AA)

Texto normal exige 4,5:1; texto grande (≥ 24px, ou ≥ 19px em negrito) exige 3:1.

| Par | Razão | Resultado |
|---|---|---|
| `ink` sobre coral-500 | 6,2:1 | ✅ tudo |
| `ink` sobre coral-600 (hover) | 4,8:1 | ✅ tudo |
| coral-500 sobre `ink` | 6,2:1 | ✅ tudo |
| coral-500 sobre `ink-2` (ícone ativo da sidebar) | 5,6:1 | ✅ tudo |
| coral-700 sobre `surface` | 5,7:1 | ✅ tudo |
| coral-700 sobre `highlight` | 5,2:1 | ✅ tudo |
| `ink` sobre `page` | 18,7:1 | ✅ tudo |
| `muted` sobre `page` | 7,5:1 | ✅ tudo |
| `muted` sobre `highlight` | 7,0:1 | ✅ tudo |
| `on-dark-muted` sobre `ink` | 7,5:1 | ✅ tudo |
| amber-800 sobre amber-50 | 6,8:1 | ✅ tudo |
| coral-500 sobre `surface` | 3,1:1 | ⚠️ só título grande e ícone |
| coral-500 sobre `highlight` | 2,8:1 | ❌ não usar como texto/ícone |
| branco sobre coral-500 | 3,1:1 | ❌ não usar (o site deles usa; nós não) |

**Elementos não textuais** (barras, fatias, ícones, bordas que identificam um controle) exigem 3:1 contra o fundo (WCAG 1.4.11). As oito cores de gráfico passam sobre branco (de 3,1:1 a 19,3:1). Duas bordas ficam abaixo, de propósito: `input` sobre branco (1,5:1), então o campo precisa de outro sinal, como fundo ou rótulo; e `ink-3` sobre `ink` (1,3:1), decorativa, porque o texto já identifica o botão.

## Regras de uso da cor

**Fazer**
- Coral como **fundo** (botão primário, faixa CTA, marca) com **texto preto**.
- coral-500 como texto ou ícone **só sobre preto** (sidebar, painéis escuros); no claro, texto coral é coral-700.
- Ponto final coral em títulos grandes: "Papo na Arena Radar**.**"
- Links e rótulos pequenos em `ink` ou `muted`.
- Cor nova sempre como um tom das escalas, nunca hex solto ou filtro de brilho.

**Evitar**
- Texto branco sobre coral-500.
- coral-500 em texto pequeno no claro; coral-500 sobre `highlight`.
- Usar a cor como único sinal: sempre junto com texto, ícone ou valor.

## Tipografia

Fonte: **Plus Jakarta Sans** (400, 500, 600, 700, 800).

| Estilo | Tamanho / peso / tracking | Uso |
|---|---|---|
| Display | 64px (clamp 36–64) / 800 / -0.035em | Só capa/hero, se houver |
| Page title (`.page-title`) | 56px (40px no mobile) / 800 / -0.035em / line-height 1.05 | Título das páginas principais, com ponto final coral — igual aos títulos de seção da Product Arena |
| Page lead (`.page-lead`) | 18px / 400 / `muted` | Frase logo abaixo do título da página — igual à abertura de seção deles |
| Detail title (`.detail-title`) | 36px (30px no mobile) / 800 / -0.03em | Título de episódio, produto, pessoa, categoria |
| H2 | 24px / 700 / -0.02em | Cabeçalho de seção |
| H3 | 18px / 700 / -0.01em | Título de card |
| Body | 16px / 400 / line-height 1.55 | Texto corrido |
| Small (`text-sm`) | **15px** / line-height 22px | Tabelas, listas, cards, metadados — na faixa dos cards deles (14,5–15,5px) |
| XS | 12px | Legendas |
| Eyebrow | 12px / 700 / +0.12em / caixa alta | Rótulo acima do título; ponto coral no claro, texto coral no escuro |

## Forma e espaçamento

- **Raio:** 12px em cards e blocos (`--radius: .75rem`); 8px em itens de navegação; botões e tags em pílula (`999px`).
- **Sombras:** nenhuma. Separação por borda `border` ou mudança de fundo.
- **Espaçamento:** seções com 64px vertical; gap de 16px entre cards; padding interno de card 24px; página do app com 32px (20px/16px no mobile).
- **Alvos de toque:** todo botão e controle tem no mínimo **48×48px** (recomendação do Google/Material; cobre o 44px da Apple e o AAA do WCAG). Vale para o componente `Button` em todos os tamanhos, botões de voltar, botão do menu no mobile, cabeçalhos ordenáveis de tabela, pílulas de links externos e itens da sidebar. Links dentro de texto corrido (nomes de produto numa frase) ficam de fora, como prevê o WCAG.
- **Foco:** contorno de 2px em `ink` com offset de 3px (em `on-dark` sobre superfícies escuras).

## Componentes

- **Botão primário:** fundo `coral`, hover `coral-hover`, texto `ink`, pílula, 15px/600.
- **Botão secundário:** fundo `surface`, borda `border`, texto `ink`; hover em `highlight`.
- **Botão escuro:** fundo `ink`, texto `on-dark`.
- **Tag:** pílula 24px, 11px/700 caixa alta; `coral-tint` + `ink` no claro; borda coral-800 + texto `coral` no escuro; variante outline com `border` + `muted`.
- **Caixa de ícone:** 40px, fundo `coral-tint`, ícone em `ink`.
- **Card:** `surface`, borda `border`, raio 12px, padding 24px.
- **Bloco de destaque:** fundo `highlight`, sem borda.
- **Faixa de números (`StatBand`, `client/src/components/stat-band.tsx`):** padrão da Product Arena para números-resumo. Números 36→48px peso 800 (formatados em pt-BR), rótulo 12px em caixa alta com tracking 0.12em em `muted`, divisórias de 1px e linhas finas em cima e embaixo, sem cards nem ícones. Cada item pode ser link (hover em `highlight`). Usada na home e nas páginas de episódio, pessoa, produto e categoria.
- **Ordem fixa das métricas:** sempre **Menções · Episódios · Produtos · Pessoas**, pulando as que não se aplicam à página. Vale para a faixa de números e para os botões de ordenação (Menções / Episódios / A–Z). Hoje: home = Menções · Episódios · Produtos · Pessoas; episódio = Menções · Produtos · Pessoas; pessoa = Menções · Episódios · Produtos; produto = Menções · Episódios · Pessoas; categoria = Menções · Episódios · Produtos. Página nova segue a mesma ordem.
- **Linha de ranking (`RankRow`, `client/src/components/ranking.tsx`, junto com `ShareBar`, `SortButtons`, `LoadMore` e `ShowAllButton`):** listas (episódios, pessoas, produtos, categorias, produtos da categoria) são linhas entre divisórias finas, não grades de cards: posição (ou `#número` do episódio) em número grande, 24→30px peso 800 em `muted`, como na lista de episódios; nome 18px negrito com o link cobrindo a linha toda, detalhe em 15px e contagem à direita. Hover em `highlight`. **A contagem da direita (e a barra) é sempre o critério da ordenação atual:** ordenando por episódios, a direita mostra episódios e a posição segue essa ordem; a outra métrica vai para o texto da linha. Em A–Z, vale a ordem por menções.
- **Barra de proporção:** barra de 6px em `coral` sobre `highlight`, sob a contagem, com o peso do item em relação ao primeiro do ranking. Só no desktop; no celular a contagem vai em texto.
- **Faixa CTA:** fundo `coral`, texto `ink`, botão escuro.
- **Sidebar:** fundo `ink`; itens em `on-dark-muted`; ativo com fundo `ink-2`, texto `on-dark`, ícone coral e barra coral de 3px à esquerda.
- **Aviso de fã:** card com borda esquerda coral de 4px — "**Projeto de fã, não oficial.** Este site não é afiliado à Product Arena."

### Destaque de episódio (3 variantes)

Componente `LatestEpisode` em `client/src/components/latest-episode.tsx`, com a prop `variant`. Serve para destacar um episódio (hoje, o último, na home). As três variantes compartilham o conteúdo: título do episódio como link, data por extenso, quem participou e os produtos citados como links (até 5, depois "+N"). Nenhuma usa rótulo pequeno acima do título nem pílulas; "Último episódio" fica na linha de metadados, abaixo do título.

| Variante | Visual | Quando usar |
|---|---|---|
| `cinza` | Bloco `highlight`, título 24→30px, metadados em `muted`, botão primário coral "Ver episódio" à direita | Integra com a página, coral só na ação |
| `escuro` | Fundo `ink`, título branco 30→36px, número do episódio gigante em coral cortado no canto, botão coral + links YouTube/Spotify | **Em uso na home.** Quando o episódio deve ser o destaque principal da tela; ecoa o card do podcast da Product Arena |
| `editorial` | Sem caixa, entre linhas finas (como a faixa de números); "#136." grande à esquerda com a data, título com seta à direita | Quando a página já tem blocos pesados e o destaque deve ser discreto |

Prévia visual: seção "Destaque de episódio" do `design-system.html`.

### Marcos

- **Marco na página Sobre (em uso):** seção "O produto nº 1.000." com "#1000." gigante (96→144px, peso 800, ponto coral) à esquerda e a história à direita, com links para produto, pessoa e episódio. O marco é achado pela anotação "#1000" no comentário da menção (`getThousandthMention` em `client/src/lib/about.ts`), não pela contagem.
- **Callout de marco (arquivado):** card âmbar com troféu e confete caindo, que ficou na home quando o marco aconteceu. Guardado só no `design-system.html` (seção "Callout de marco") para reaproveitar num próximo marco. Usa a escala âmbar, a cor de destaque da paleta, reservada para comemorações pontuais; o confete respeita `prefers-reduced-motion`.

## Gráficos

| Token | Tom | Hex |
|---|---|---|
| `chart-1` | coral-500 | `#FF5757` |
| `chart-2` | neutral-950 | `#0E0E10` |
| `chart-3` | amber-600 | `#D97706` |
| `chart-4` | azul (só gráfico) | `#5B7DB1` |
| `chart-5` | neutral-500 | `#71717A` |
| `chart-6` | verde-azulado (só gráfico) | `#3E9C8F` |
| `chart-7` | roxo (só gráfico) | `#9B5DA5` |
| `chart-8` | coral-800 | `#9A1922` |

Todas com pelo menos 3:1 sobre branco. Série única (ex.: ranking de menções) usa só `chart-1`. `chart-6..8` só entram quando há mais de 5 séries (pizza de categorias). Rótulos de gráfico sempre em `foreground`, nunca na cor da fatia. Cores de empresas (Anthropic, OpenAI, Google…) no gráfico de empresas de IA são cores das marcas e ficam como estão.

## Imagem OpenGraph

A prévia de link (WhatsApp, LinkedIn, X, Slack) é gerada por `npm run og`: o template `script/og/og-image.html` é preenchido com dados de `data.ts` por `script/og-image.ts` e exportado para `client/public/og-image.jpg` (1200×630) com Chrome headless.

- **Escura de propósito.** É a única peça em fundo `ink`, a exceção ao "light only": nos feeds, quase sempre claros, o card escuro se destaca. Segue as regras de cor sobre preto (coral como texto só sobre `ink`/`ink-2`).
- **"Radar." é o herói.** "Papo na Arena" vem menor, em `on-dark-muted`, acima; o ponto final coral fica depois de "Radar". Assim o card não se passa pelo podcast.
- **Aviso de fã sempre legível.** Texto simples em `on-dark-muted`, 28px, logo abaixo dos totais (sem pílula): "Projeto de fã, não oficial".
- **Onda sonora = dados, como efeito de fundo.** Uma barra por episódio ocupando a imagem inteira, com altura proporcional às menções (a mais alta tem 90% da altura); acima de 150 episódios, vizinhos são agrupados pela média. Tem uma camada desfocada atrás para dar brilho, e um degradê escuro na esquerda garante a leitura do texto.
- **Só tons de coral.** A onda usa um gradiente da escala coral, do 900 ao 300 (`#6B0F18` → `#C72329` → `#FF5757` → `#FFA8A8`), sem outras cores, mantendo a regra de uma cor de marca só.
- **Sem ranking.** A imagem fala do podcast, não de quais produtos lideram.
- **Totais numa frase**, em 34px ("629 produtos · 1.476 menções · 103 episódios"), não como números gigantes de painel.
- O script para com erro se a Plus Jakarta Sans não carregar, em vez de gerar a imagem com fonte substituta. Depois de publicar, peça um novo scrape no Post Inspector do LinkedIn e no Sharing Debugger do Facebook.

## Mapeamento para `client/src/index.css` (shadcn)

O bloco `:root` declara as três escalas (`--coral-*`, `--neutral-*`, `--amber-*`, em HSL com uma casa decimal para bater com o hex exato) e os tokens do shadcn só apontam para elas. O bloco `.dark` não existe.

```css
--background: var(--neutral-50);
--foreground: var(--neutral-950);
--border: var(--neutral-200);
--card: var(--neutral-0);
--card-foreground: var(--neutral-950);
--card-border: var(--neutral-200);
--popover: var(--neutral-0);
--popover-foreground: var(--neutral-950);
--popover-border: var(--neutral-200);
--primary: var(--coral-500);
--primary-foreground: var(--neutral-950);
--primary-hover: var(--coral-600);
--secondary: var(--neutral-100);
--secondary-foreground: var(--neutral-950);
--muted: var(--neutral-100);
--muted-foreground: var(--neutral-600);
--accent: var(--neutral-100);
--accent-foreground: var(--neutral-950);
--destructive: var(--coral-700);
--destructive-foreground: var(--neutral-0);
--input: var(--neutral-300);
--ring: var(--neutral-950);

--sidebar: var(--neutral-950);
--sidebar-foreground: var(--neutral-100);
--sidebar-border: var(--neutral-800);
--sidebar-primary: var(--coral-500);
--sidebar-primary-foreground: var(--neutral-950);
--sidebar-accent: var(--neutral-900);
--sidebar-accent-foreground: var(--neutral-100);
--sidebar-ring: var(--coral-500);

--chart-1: var(--coral-500);
--chart-2: var(--neutral-950);
--chart-3: var(--amber-600);
--chart-4: 216.3 35.5% 52.5%;
--chart-5: var(--neutral-500);
--chart-6: 171.7 43.1% 42.7%;
--chart-7: 291.7 28.6% 50.6%;
--chart-8: var(--coral-800);

--radius: .75rem;
```

Tokens extras (fora do padrão shadcn): `--brand-tint: var(--coral-100)` (coral-tint) e `--highlight: var(--neutral-100)`.
