# Reformulação visual inspirada na Product Arena

Objetivo: aproximar o visual do site das cores da [Product Arena](https://productarena.io/) e da [página do podcast](https://productarena.io/podcast), como homenagem — sem parecer um site oficial.

Princípio: **acento, não clone.** Usar coral + preto + off-white como identidade; manter a densidade de app de consulta (não virar landing page).

Referências (prints na raiz):
- `Product-Arena-A-primeira-escola-de-produtos-do-Brasil-10-04-2026_02_41_PM.png`
- `Papo-na-Arena-Podcast-sobre-Produto-IA-e-Liderança-10-04-2026_02_43_PM.png`

## 1. Paleta

- [x] Extrair os hex exatos dos prints (ver `DESIGN.md`)
- [x] ~~Duas variantes de coral~~ → decidido: uma cor só (`#FF5757`) com texto preto em cima
- [x] Trocar `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring` em `client/src/index.css`
- [x] Trocar `--background` de branco puro para o off-white (`#FBFBFC`)
- [x] Ajustar `--card`, `--muted`, `--secondary`, `--accent`, `--border`, `--popover`
- [x] Tokens extras `--highlight` e `--brand-tint` (com classes `bg-highlight` e `bg-brand-tint` no Tailwind)
- [x] Raios do Tailwind para 12/8/4px
- [x] Cores fixas nas páginas trocadas por tokens (ícones dos cards em caixa `brand-tint`, tags do último episódio, página 404). Mantidas: cores das empresas de IA (são cores de marca) e o banner âmbar do marco #1000 (comentado no código)

## 2. Sidebar escura

- [x] Sidebar em preto (`#0E0E10`)
- [x] Ajustar `--sidebar-*` e ícone do item ativo em coral
- [x] Textos secundários da sidebar em `sidebar-foreground/70` (o `muted-foreground` não passava no escuro)
- [ ] Barra coral à esquerda do item ativo (opcional)

## 3. Remover dark mode

- [x] Remover `theme-provider.tsx` e seu uso no `App.tsx`
- [x] Remover o botão de alternar tema em `app-sidebar.tsx`
- [x] Remover os blocos `.dark` de `index.css` e as classes `dark:` do `dashboard.tsx`
- [x] ~~Limpar `localStorage`~~ → desnecessário: sem o provider, a chave `theme` é ignorada
- [ ] (opcional) Classes `dark:` restantes em `components/ui/*` são inofensivas; dá para limpar depois

## 4. Tipografia e espaçamento

- [x] Manter Plus Jakarta Sans (carregando também o peso 800)
- [x] Títulos de página maiores (classe `.page-title`: 30→36px) com ponto final coral; títulos de detalhe em `.detail-title` (24→30px)
- [x] Títulos em peso 800 com tracking negativo; títulos de card em negrito
- [x] Mais respiro: blocos da página com `space-y-8` e área principal com `md:p-8`
- [x] Tabelas, listas e ranking mantidos na densidade atual

## 5. Gráficos

- [x] Nova paleta `--chart-1..8` puxando do coral (6–8 só para a pizza de categorias)
- [x] Rótulos da pizza em `foreground` (antes herdavam a cor da fatia) e raio menor para não cortar os rótulos

## 6. Identidade fan-made

- [x] Não usar o logo/wordmark "Product Arena"
- [x] Aviso "Projeto de fã, não oficial" no rodapé da sidebar (link para /sobre) e na página Sobre (inclusive no HTML prerenderizado)

## 7. Verificação

- [x] Rodar o app e revisar todas as páginas (dashboard, episódios, produtos, pessoas, categorias, sobre, 404 e detalhes)
- [x] Checar contraste (AA) dos principais pares de cor (tabela no `DESIGN.md`)
- [x] Checar mobile (dashboard, produtos, episódio, sobre)
- [ ] Decidir: merge na `main` ou descartar a branch


## 8. Manual
Pontos que ainda destoam (já anotados no REDESIGN-TODO.md):
- Os ícones dos cards de números do dashboard continuam azul, verde, laranja e roxo, com cores fixas no código.
- O gráfico de pizza de categorias e o de "Menções por Empresa de AI" usam cores fixas próprias, além da nova paleta.
- O card "Último episódio" ficou coral com texto preto e funciona bem. As tags dentro dele aparecem num coral mais escuro, o que vale revisar.