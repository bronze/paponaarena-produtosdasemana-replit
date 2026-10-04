# Reformulação visual inspirada na Product Arena

Objetivo: aproximar o visual do site das cores da [Product Arena](https://productarena.io/) e da [página do podcast](https://productarena.io/podcast), como homenagem — sem parecer um site oficial.

Princípio: **acento, não clone.** Usar coral + preto + off-white como identidade; manter a densidade de app de consulta (não virar landing page).

Referências (prints na raiz):
- `Product-Arena-A-primeira-escola-de-produtos-do-Brasil-10-04-2026_02_41_PM.png`
- `Papo-na-Arena-Podcast-sobre-Produto-IA-e-Liderança-10-04-2026_02_43_PM.png`

## 1. Paleta

- [ ] Extrair os hex exatos dos prints (coral, preto do hero, off-white das seções claras, cinza dos textos secundários)
- [ ] Definir duas variantes de coral:
  - coral vivo (decorativo: ícones, detalhes, títulos grandes)
  - coral escuro acessível (botões/links com texto — contraste AA ≥ 4.5:1 com branco)
- [ ] Trocar `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring` em `client/src/index.css`
- [ ] Trocar `--background` de branco puro para o off-white deles
- [ ] Ajustar `--card`, `--muted`, `--secondary`, `--accent`, `--border`, `--popover` para harmonizar com o off-white
- [ ] Revisar as cores fixas nas páginas (`text-blue-500`, `text-red-500`, `text-orange-500`, `text-gray-*`, `bg-gray-50`) e trocar por tokens

## 2. Sidebar escura

- [ ] Sidebar em preto/grafite (lembrando o hero e as seções escuras deles)
- [ ] Ajustar `--sidebar-*` (foreground, accent, border) e item ativo em coral
- [ ] Conferir contraste dos textos e ícones da sidebar

## 3. Remover dark mode

- [ ] Remover `client/src/components/theme-provider.tsx` e seu uso no `App.tsx`
- [ ] Remover o botão de alternar tema em `app-sidebar.tsx`
- [ ] Remover o bloco `.dark` de `index.css` e classes `dark:` em páginas/componentes (`dashboard.tsx`, `ui/*`)
- [ ] Limpar preferência de tema salva no `localStorage`, se houver

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
