# Design System — Papo na Arena

Identidade visual do site, inspirada na [Product Arena](https://productarena.io/) e na [página do podcast](https://productarena.io/podcast) como **homenagem de fã**. Referência visual interativa: [`client/public/design-system.html`](client/public/design-system.html) (servido em `/design-system.html`).

## Princípios

1. **Acento, não clone.** Usamos as cores deles (coral, preto, off-white), não o layout de landing page nem o logo.
2. **Uma cor de marca só.** Coral `#FF5757`, sem variantes. Tudo passa no WCAG AA.
3. **App de consulta, não landing page.** Títulos ganham peso e respiro; tabelas, listas e ranking mantêm a densidade.
4. **Light only.** Não há dark mode.
5. **Fan-made visível.** Sempre há um aviso "Projeto de fã, não oficial".

## Cores

Hex extraídos dos prints de productarena.io.

| Token | Hex | HSL | Uso |
|---|---|---|---|
| `coral` | `#FF5757` | `0 100% 67%` | Cor de marca: botões primários, faixa CTA, item ativo da sidebar, barras de gráfico |
| `coral-tint` | `#FFE9E9` | `0 100% 96%` | Fundo suave de tags e caixas de ícone |
| `ink` | `#0E0E10` | `240 7% 6%` | Texto principal; sidebar; texto sobre coral |
| `ink-2` | `#19191B` | `240 4% 10%` | Hover/ativo e cards sobre superfície escura |
| `ink-3` | `#27272A` | `240 4% 16%` | Bordas sobre superfície escura |
| `page` | `#FBFBFC` | `240 14% 99%` | Fundo do app (off-white) |
| `highlight` | `#F3F4F6` | `220 14% 96%` | **Só** seções/blocos de destaque, cabeçalho de tabela, trilho de barras |
| `surface` | `#FFFFFF` | `0 0% 100%` | Cards e popovers |
| `border` | `#E5E7EB` | `220 13% 91%` | Bordas no claro |
| `muted` | `#4B5563` | `215 14% 34%` | Texto secundário no claro |
| `on-dark` | `#F3F4F6` | `220 14% 96%` | Texto sobre `ink` |
| `on-dark-muted` | `#A1A1AA` | `240 5% 65%` | Texto secundário sobre `ink` |

### Onde o cinza entra

No site deles o fundo é claro e o cinza `#F3F4F6` aparece só em algumas seções ("Agenda da Arena", "Você aprende com quem lidera", "A Arena para cada momento"). Aqui é igual: o fundo é `page` (off-white) e o `highlight` marca blocos pontuais, como o destaque do último episódio no dashboard.

### Contraste (WCAG AA)

Texto normal exige 4,5:1; texto grande (≥ 24px, ou ≥ 19px em negrito) e ícones exigem 3:1.

| Par | Razão | Resultado |
|---|---|---|
| `ink` sobre `coral` | 6,2:1 | ✅ tudo |
| `coral` sobre `ink` | 6,2:1 | ✅ tudo |
| `coral` sobre `ink-2` | 5,6:1 | ✅ tudo |
| `ink` sobre `page` | 18,6:1 | ✅ tudo |
| `muted` sobre `page` | 7,3:1 | ✅ tudo |
| `muted` sobre `highlight` | 6,9:1 | ✅ tudo |
| `on-dark-muted` sobre `ink` | 7,5:1 | ✅ tudo |
| `coral` sobre `surface` | 3,1:1 | ⚠️ só título grande e ícone |
| `coral` sobre `page` | 3,0:1 | ⚠️ só título grande e ícone |
| `coral` sobre `highlight` | 2,8:1 | ❌ não usar como texto/ícone |
| branco sobre `coral` | 3,1:1 | ❌ não usar (o site deles usa; nós não) |

## Regras de uso da cor

**Fazer**
- Coral como **fundo** (botão primário, faixa CTA, marca) com **texto preto**.
- Coral como texto ou ícone **só sobre preto** (sidebar, painéis escuros).
- Ponto final coral em títulos grandes: "Produtos da semana**.**"
- Links e rótulos pequenos em `ink` ou `muted`.

**Evitar**
- Texto branco sobre coral.
- Texto pequeno coral em fundo claro; qualquer coral (texto ou ícone) sobre `highlight`.
- Usar o vermelho de erro parecido com o coral — `destructive` é um vermelho mais fechado (`#B91C1C`).

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
- **Alvos de toque:** botões com altura mínima de 44px; itens da sidebar 48px.
- **Foco:** contorno de 2px em `ink` com offset de 3px (em `on-dark` sobre superfícies escuras).

## Componentes

- **Botão primário:** fundo `coral`, texto `ink`, pílula, 15px/600.
- **Botão secundário:** fundo `surface`, borda `border`, texto `ink`; hover em `highlight`.
- **Botão escuro:** fundo `ink`, texto `on-dark`.
- **Tag:** pílula 24px, 11px/700 caixa alta; `coral-tint` + `ink` no claro; borda coral translúcida + texto `coral` no escuro; variante outline com `border` + `muted`.
- **Caixa de ícone:** 40px, fundo `coral-tint`, ícone em `ink`.
- **Card:** `surface`, borda `border`, raio 12px, padding 24px.
- **Bloco de destaque:** fundo `highlight`, sem borda.
- **Faixa CTA:** fundo `coral`, texto `ink`, botão escuro.
- **Sidebar:** fundo `ink`; itens em `on-dark-muted`; ativo com fundo `ink-2`, texto `on-dark`, ícone coral e barra coral de 3px à esquerda.
- **Aviso de fã:** card com borda esquerda coral de 4px — "**Projeto de fã, não oficial.** Este site não é afiliado à Product Arena."

## Gráficos

| Token | Hex | HSL |
|---|---|---|
| `chart-1` | `#FF5757` | `0 100% 67%` |
| `chart-2` | `#0E0E10` | `240 7% 6%` |
| `chart-3` | `#F2A65A` | `30 85% 65%` |
| `chart-4` | `#5B7DB1` | `216 36% 53%` |
| `chart-5` | `#A1A1AA` | `240 5% 65%` |
| `chart-6` | `#3E9C8F` | `172 43% 43%` |
| `chart-7` | `#9B5DA5` | `292 29% 51%` |
| `chart-8` | `#8C2F39` | `354 50% 37%` |

Série única (ex.: ranking de menções) usa só `chart-1`. `chart-6..8` só entram quando há mais de 5 séries (pizza de categorias). Rótulos de gráfico sempre em `foreground`, nunca na cor da fatia. Cores de empresas (Anthropic, OpenAI, Google…) no gráfico de empresas de IA são cores das marcas e ficam como estão.

## Mapeamento para `client/src/index.css` (shadcn)

Valores para o bloco `:root`. O bloco `.dark` deve ser removido.

```css
--background: 240 14% 99%;
--foreground: 240 7% 6%;
--border: 220 13% 91%;
--card: 0 0% 100%;
--card-foreground: 240 7% 6%;
--card-border: 220 13% 91%;
--popover: 0 0% 100%;
--popover-foreground: 240 7% 6%;
--popover-border: 220 13% 91%;
--primary: 0 100% 67%;
--primary-foreground: 240 7% 6%;
--secondary: 220 14% 96%;
--secondary-foreground: 240 7% 6%;
--muted: 220 14% 96%;
--muted-foreground: 215 14% 34%;
--accent: 220 14% 96%;
--accent-foreground: 240 7% 6%;
--destructive: 0 74% 42%;
--destructive-foreground: 0 0% 100%;
--input: 220 13% 83%;
--ring: 240 7% 6%;

--sidebar: 240 7% 6%;
--sidebar-foreground: 220 14% 96%;
--sidebar-border: 240 4% 16%;
--sidebar-primary: 0 100% 67%;
--sidebar-primary-foreground: 240 7% 6%;
--sidebar-accent: 240 4% 10%;
--sidebar-accent-foreground: 220 14% 96%;
--sidebar-ring: 0 100% 67%;

--chart-1: 0 100% 67%;
--chart-2: 240 7% 6%;
--chart-3: 30 85% 65%;
--chart-4: 216 36% 53%;
--chart-5: 240 5% 65%;
--chart-6: 172 43% 43%;
--chart-7: 292 29% 51%;
--chart-8: 354 50% 37%;

--radius: .75rem;
```

Tokens extras (fora do padrão shadcn): `--brand-tint: 0 100% 96%` (coral-tint) e `--highlight: 220 14% 96%`.
