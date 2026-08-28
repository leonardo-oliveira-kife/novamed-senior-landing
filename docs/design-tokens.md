# Design Tokens — Novamed Sênior

Extraídos do arquivo Figma "Novamed" (node `4143:80`, frame desktop 1440px). Fonte de verdade: variáveis do Figma + inspeção visual do protótipo.

## Cores

| Token Figma | Hex | Uso |
|---|---|---|
| `01` | `#00909A` | Teal escuro — footer, CTA secundário (seção "Reforço de conversão"), highlight do wordmark da logo |
| `04` | `#1AB9AA` | Teal principal — CTAs, links ativos, ícones de destaque, bordas de foco |
| `05` | `#F19E04` | Dourado/laranja — títulos de destaque (Antonio), badges, ícones "Diferenciais" |
| `03` | `#FFE39E` | Dourado claro — decorações (anéis/swirls), gradientes sutis |
| `06` | `#50505A` | Texto principal (headings e parágrafos) |
| `White` | `#FFFFFF` | Fundos, texto sobre fundo escuro |
| — | `#797979` | Texto secundário em cards de benefícios (não estava nas variáveis nomeadas, aparece direto no fill) |

Opacidades usadas com frequência sobre `#50505A`: `0.75` (subtítulos), `0.5` (itens inativos do accordion "Diferenciais"), `0.25` (bordas sutis, separadores).

## Tipografia

- **Display / headings** — `Antonio`, peso Regular, sempre `uppercase`, `line-height: 1.2`, `letter-spacing` negativo (~ -3% do tamanho). Tamanhos observados: 72px (H1 hero), 44px (H2 seções).
- **Corpo / UI** — `Inter`, pesos Regular / Medium / Semibold.
  - Corpo grande (hero subtítulo): 20px, line-height 32px
  - Corpo padrão: 16px, line-height 25px
  - Corpo pequeno (cards, tags): 14px, line-height 21–25px
  - Micro (legal/disclaimer): 12px

Ambas as famílias usam `letter-spacing` levemente negativo em quase todos os tamanhos (entre -0.28px e -2.88px conforme o tamanho da fonte).

Fallback stacks recomendados (fontes não hospedadas localmente pelo Figma):
- Antonio → `'Antonio', 'Oswald', sans-serif` (condensed display)
- Inter → `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif`

## Raios de borda

| Valor | Uso |
|---|---|
| `100px` (pill) | Botões CTA, badges/pills, tags de filtro |
| `24px` | Containers de imagem grandes (hero, diferenciais, história, reforço) |
| `16px` | Cards (FAQ, benefícios, formulário, prova social) |
| `8px` | Inputs, botões pequenos de seleção (Individual/Família) |
| `6px` | Tags pequenas, botão do formulário |

## Espaçamento

Unidade base: `8px`. Paddings de seção no desktop: `64px` (topo/laterais). Gaps mais comuns: `8px, 16px, 24px, 32px, 64px`.

## Sombras

Design é essencialmente flat — não há `box-shadow` perceptível em nenhum componente. Profundidade é criada com cor de fundo (branco sobre gradientes sutis) e bordas de 1px em `rgba(26,185,170,0.25)`.

## Estados de hover/interação

O arquivo Figma **não possui uma seção oculta dedicada a variantes de hover** (diferente do projeto Auris). Os únicos estados documentados via Code Connect foram:
- Botão do formulário: `Size=Large, Type=Filled, State=Enabled` — nota do designer: "Use filled button for primary actions".

Padrões de interação inferidos pela própria estrutura do protótipo (não por variantes explícitas):
- **Accordion "Diferenciais"** (seção 3): apenas o item 1 vem expandido (opacidade 100%, descrição visível); itens 2–4 vêm com opacidade 50% e descrição com `hidden=true` no Figma — indicando um accordion que expande ao clique/hover.
- **FAQ**: cada card tem um ícone `lucide/plus` — indica accordion expansível (implementado com todas as respostas abertas por padrão no design, mas com toggle funcional no código).
- **Tags de filtro do FAQ**: uma tag "Todas as perguntas" vem preenchida (ativa) e as demais com borda e opacidade 50% — indica estado ativo/inativo de filtro.

Para links do header e demais elementos interativos sem variante documentada, os estados de hover foram extrapolados com bom senso (leve mudança de opacidade/cor, mantendo a paleta acima).

## Ícones

Todos os ícones usados são do set **Lucide** (`lucide/heart-plus`, `lucide/check`, `lucide/user`, `lucide/users`, `lucide/clipboard-plus`, `lucide/square-activity`, `lucide/heart-handshake`, `lucide/circle-play`, `lucide/plus`, `lucide/arrow-up-right`, `lucide/hospital`, `lucide/ambulance`, `lucide/activity`, `lucide/calendar-plus-2`), exportados como SVG do próprio Figma e salvos em `assets/icons/`.

## Assets baixados

Todas as imagens usadas no site foram baixadas do Figma e otimizadas localmente (convertidas para WebP, redimensionadas) em `assets/images/` — nenhuma URL temporária do Figma é referenciada no código (essas expiram em ~7 dias).
