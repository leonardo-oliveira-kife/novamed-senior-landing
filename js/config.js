/**
 * Configuração do formulário de captação de leads e dos links de WhatsApp do site.
 *
 * QUEM FOR INTEGRAR O CRM: troque apenas os valores abaixo.
 *
 * - WEBHOOK_URL: endpoint do CRM que vai receber o POST (JSON) com os dados do lead.
 * - PAYLOAD_FIELDS: nomes dos campos esperados pelo CRM no corpo da requisição.
 *   A chave (esquerda) é o campo interno do form, o valor (direita) é o nome
 *   que vai no JSON enviado — mude só o valor se o CRM esperar outro nome.
 * - SUCCESS_REDIRECT_URL: para onde o usuário vai depois do envio com sucesso
 *   (ex.: link de WhatsApp com mensagem pré-preenchida). Deixe null para não redirecionar.
 * - WHATSAPP_URL: link usado no botão flutuante e no ícone do rodapé (contato geral,
 *   sem mensagem pré-preenchida do formulário).
 */
window.NOVAMED_LEAD_FORM_CONFIG = {
  // TODO: preencher com a URL real do webhook do CRM.
  WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/28005204/4hmg1m8/',

  PAYLOAD_FIELDS: {
    name: 'nome',
    age: 'idade',
    lives: 'numero_vidas',
    phone: 'telefone',
    email: 'email',
    planType: 'tipo_plano',
    //novos campos de utm's
    utm_source: 'utm_source',
    utm_medium: 'utm_medium',
    utm_campaign: 'utm_campaign',
    utm_content: 'utm_content',
    utm_term: 'utm_term',
  },

  // Ajuste a mensagem se quiser, ou troque por outra URL de pós-conversão.
  SUCCESS_REDIRECT_URL:
    'https://wa.me/556236025293?text=Ol%C3%A1%2C%20preenchi%20o%20formul%C3%A1rio%20do%20site%20e%20quero%20saber%20mais%20sobre%20o%20plano%20Novamed%20S%C3%AAnior.',

  // Botão flutuante + ícone do rodapé. Número: (62) 3602-5293.
  WHATSAPP_URL:
    'https://wa.me/556236025293?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20plano%20Novamed%20S%C3%AAnior',
};
