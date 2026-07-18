# Ideias de Gamificação — Produtos da Semana

Baseado no framework do curso "Psicologia e Gamificação aplicada a UX Design" (ver `gamification.md`).

---

## 1. Streak de episódios
**Frameworks:** Modelo Hook + DC8 Aversão à Perda

Salvar no `localStorage` quais episódios o usuário visitou. Mostrar um contador tipo "você explorou 7 eps seguidos 🔥". O medo de quebrar o streak puxa o usuário de volta na semana seguinte — exatamente o que o Duolingo usa. Não precisa de login.

---

## 2. Biblioteca pessoal de produtos
**Frameworks:** DC4 Propriedade + investimento do Modelo Hook

Botão "Salvar produto" em cada card. O usuário constrói uma lista "quero conhecer" / "já uso" / "favoritos". Quanto mais salva, mais difícil é abandonar o site — o efeito IKEA em forma de lista de produtos. Não precisa de backend — localStorage resolve.

---

## 3. Níveis de Explorer
**Frameworks:** DC2 Desenvolvimento e Realização

Baseado em quantos produtos/episódios o usuário explorou, dar um título crescente:
- `Ouvinte Curioso` → `Product Observer` → `Produto Nerd` → `Arena MVP`

Mostrar progresso estilo barra: *"Você conheceu 34/120 produtos — Nível: Product Observer"*. Não precisa de backend — localStorage resolve.

---

## 4. Produto Surpresa
**Frameworks:** DC7 Curiosidade + Imprevisibilidade

Um botão bem visível: **"Me surpreende"** → abre um produto aleatório de qualquer episódio. Recompensa variável (slot machine de descoberta). Baixíssimo custo de implementação, alto engajamento.

---

## 5. Card de compartilhamento
**Frameworks:** DC5 Influência Social — "botão de ostentação"

Ao salvar ou visitar um produto, gerar um card visual estilo Spotify Wrapped: *"Descobri [Produto X] no Ep. 117 do Papo na Arena 🎙️"* pronto pra colar no LinkedIn/Twitter. O usuário faz marketing do podcast de graça.

---

## 6. Stats de Descoberta semanais
**Frameworks:** DC5 Influência Social + DC2 Desenvolvimento

Na dashboard, mostrar dados tipo: *"Esta semana: 3 novos produtos adicionados · Ep. mais visitado: #117 · Produto mais salvo: Notion"*. Cria sensação de movimento e comunidade mesmo sem usuários visíveis.

---

## 7. Bingo de Categorias
**Frameworks:** DC3 Criatividade + DC7 Curiosidade

Um bingo sazonal: grid de categorias (Produtividade, IA, Design, Analytics…). O usuário "risca" uma categoria ao explorar um produto daquela área. Terminou o bingo? Badge especial. Funciona bem para campanhas sazonais ou aniversário do podcast.

---

## Priorização

| Ideia | Esforço | Impacto |
|---|---|---|
| Produto Surpresa | Baixíssimo | Alto (recompensa variável) |
| Biblioteca pessoal (localStorage) | Baixo | Alto (investimento/lock-in) |
| Card de compartilhamento | Médio | Alto (growth orgânico) |
| Streak de episódios | Médio | Médio (retenção semanal) |
| Níveis de Explorer | Médio | Médio |
| Stats de Descoberta | Médio | Médio |
| Bingo de Categorias | Alto | Baixo/Médio (sazonal) |
