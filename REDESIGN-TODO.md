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
- [ ] Revisar as cores fixas nas páginas (ícones coloridos dos cards do dashboard, `text-blue-500`, `text-gray-*`, `bg-gray-50`, card âmbar) e trocar por tokens

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

- [ ] Manter Plus Jakarta Sans (já é próxima da fonte deles)
- [ ] Aumentar títulos de página (hoje `text-2xl`) e cabeçalhos de seção
- [ ] Títulos mais pesados/apertados (tracking negativo leve), no estilo deles
- [ ] Aumentar respiro entre blocos/seções
- [ ] **Não** aumentar tabelas, listas e ranking — manter densidade

## 5. Gráficos

- [ ] Nova paleta `--chart-1..5` puxando do coral, com cores secundárias distinguíveis
- [ ] Conferir legibilidade dos gráficos em `dashboard-charts.tsx`

## 6. Identidade fan-made

- [ ] Não usar o logo/wordmark "Product Arena"
- [ ] Aviso visível "Projeto de fã, não oficial" (rodapé da sidebar e/ou página Sobre)

## 7. Verificação

- [ ] Rodar o app e revisar todas as páginas (dashboard, episódios, produtos, pessoas, categorias, sobre, 404)
- [ ] Checar contraste (AA) dos principais pares de cor
- [ ] Checar mobile
- [ ] Decidir: merge na `main` ou descartar a branch
