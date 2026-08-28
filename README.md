# Novamed Sênior — Landing Page

Landing page da Novamed (plano de saúde sênior), traduzida a partir do design aprovado no Figma. HTML + CSS puro, com JavaScript apenas para pequenas interações (accordion, filtro, animações de scroll, slider) e para o formulário de captação de leads.

**Sem back-end.** O formulário envia os dados via `fetch()` (POST JSON) direto para um webhook externo — hoje configurado com uma URL placeholder. Ver seção [Integração com o CRM](#integração-com-o-crm-guia-para-o-felipe) abaixo.

## Rodando localmente

Não tem build step. Basta servir os arquivos estáticos:

```bash
python -m http.server 8080
# ou
npx serve .
```

Depois abra `http://localhost:8080`.

## Estrutura do projeto

```
index.html              Toda a estrutura HTML (uma página só)
css/
  reset.css              Reset básico
  variables.css           Design tokens (cores, tipografia, espaçamento — ver docs/design-tokens.md)
  style.css               Todo o resto do CSS, mobile-first
js/
  config.js               ⚠️ ÚNICO arquivo que precisa editar pra integrar o CRM
  form.js                  Validação e envio do formulário de leads
  main.js                  Menu mobile, scroll reveal, accordions, slider, filtro do FAQ, WhatsApp
assets/
  images/                 Fotos (webp otimizado) e logos de parceiros
  icons/                  Ícones e SVGs (Lucide + logos da marca)
docs/
  design-tokens.md        Tokens extraídos do Figma (cores, tipografia, raios, espaçamento)
```

## Integração com o CRM (guia para o Felipe)

Tudo que você precisa mexer está em **`js/config.js`**. Não deveria ser necessário tocar em `form.js`, `index.html` ou no CSS pra fazer a integração funcionar — mas se o CRM exigir algo que o formato atual não cobre (ex.: autenticação por header, um formato de payload bem diferente), me chama que a gente ajusta juntos.

### 1. Webhook do formulário

Abra `js/config.js` e preencha:

```js
window.NOVAMED_LEAD_FORM_CONFIG = {
  WEBHOOK_URL: 'https://SEU-ENDPOINT-AQUI',   // <- cole a URL do CRM aqui

  PAYLOAD_FIELDS: {
    name: 'nome',
    age: 'idade',
    lives: 'numero_vidas',
    phone: 'telefone',
    email: 'email',
    planType: 'tipo_plano',
  },
  ...
};
```

**Como funciona hoje:** ao submeter o formulário (já validado no client), o `js/form.js` monta um JSON com base no mapeamento de `PAYLOAD_FIELDS` e faz:

```js
fetch(config.WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
```

Exemplo de payload enviado (plano Individual):

```json
{
  "nome": "Maria Silva",
  "idade": "67",
  "numero_vidas": "",
  "telefone": "(62) 99999-8888",
  "email": "maria@email.com",
  "tipo_plano": "individual"
}
```

Se o plano selecionado for **Família**, `idade` vem vazio e `numero_vidas` vem preenchido (e vice-versa) — o campo que não se aplica ao tipo de plano escolhido fica desabilitado no form e por isso chega vazio no payload.

**Se o CRM esperar nomes de campo diferentes**, só troque o valor (lado direito) de cada linha em `PAYLOAD_FIELDS` — a chave (lado esquerdo) é interna do código e não deve mudar.

**Se o CRM esperar outro formato de payload** (ex.: `snake_case` diferente, campos aninhados, autenticação via header/token, ou o endpoint não aceitar CORS direto do browser), me avisa — provavelmente vamos precisar ajustar a função de envio em `form.js` (ou colocar um proxy no meio, tipo uma function serverless), não é só trocar `config.js`.

**Sucesso/erro esperado pelo código:** qualquer resposta HTTP `2xx` é tratada como sucesso (mostra feedback verde e redireciona pro WhatsApp). Qualquer erro de rede ou status não-2xx mostra feedback de erro pro usuário e permite tentar de novo.

### 2. Redirecionamento pós-conversão

```js
SUCCESS_REDIRECT_URL: 'https://wa.me/556236025293?text=...',
```

Pra onde o usuário vai depois que o lead é enviado com sucesso (hoje: WhatsApp com mensagem pré-preenchida, depois de ~1.2s mostrando a mensagem de sucesso). Pode trocar por outra URL (ex.: página de obrigado) ou deixar `null` pra não redirecionar.

### 3. Botão flutuante de WhatsApp + ícone do rodapé

```js
WHATSAPP_URL: 'https://wa.me/556236025293?text=...',
```

Um único lugar controla os dois botões de WhatsApp do site (o flutuante no canto inferior direito e o ícone no rodapé) — ambos são preenchidos dinamicamente via JS a partir dessa constante (ver `main.js`, busca por `data-whatsapp-link`).

### 4. Eventos / tracking (Analytics, GTM, Meta Pixel etc.)

**O projeto não tem nenhuma ferramenta de analytics instalada ainda** — isso fica por conta de quem for integrar. Pontos sugeridos pra instrumentar:

| Evento | Onde no código |
|---|---|
| Clique no CTA principal (header, hero, seções) | Todos os links `<a href="#contratar">` — têm a classe `.btn` |
| Envio do formulário (sucesso) | `js/form.js`, dentro do `.then()` do `fetch`, logo após `showFeedback('Recebemos seus dados!...', 'success')` |
| Envio do formulário (erro) | `js/form.js`, dentro do `.catch()` |
| Clique no botão de WhatsApp (flutuante ou rodapé) | Elementos com atributo `data-whatsapp-link` |
| Troca de tab Individual/Família | `js/form.js`, dentro do listener de `[data-plan-toggle]` |

Se for usar Google Tag Manager, o lugar natural pra colar o snippet é no `<head>` de `index.html` (antes do primeiro `<link rel="stylesheet">`) e o `<noscript>` logo após a abertura do `<body>`. Depois é só disparar `dataLayer.push(...)` nos pontos da tabela acima.

## O que **não** mudar sem necessidade

- O design já foi aprovado pelo cliente a partir do Figma — evite alterar cores, tipografia, espaçamento ou textos sem alinhar antes.
- `docs/design-tokens.md` documenta os tokens extraídos do Figma, caso precise consultar valores exatos.
