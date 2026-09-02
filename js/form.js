(function () {
  'use strict';

  var form = document.getElementById('lead-form');
  if (!form) return;

  // Captura UTMs da URL e preenche os hidden inputs correspondentes
  (function captureUtms() {
    var params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (utm) {
      var value = params.get(utm);
      var input = form.querySelector('[name="' + utm + '"]');
      if (value && input) input.value = value;
    });
  })();

  var config = window.NOVAMED_LEAD_FORM_CONFIG || {};
  var submitButton = form.querySelector('[data-form-submit]');
  var feedbackEl = form.querySelector('[data-form-feedback]');
  var planTypeInput = form.querySelector('[data-plan-type]');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/;

  function setFieldError(field, message) {
    var wrapper = field.closest('.field');
    if (!wrapper) return;
    var errorEl = wrapper.querySelector('.field__error');
    wrapper.classList.toggle('field--invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(field) {
    var value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
      setFieldError(field, 'Preencha este campo.');
      return false;
    }

    if (field.type === 'email' && value && !EMAIL_RE.test(value)) {
      setFieldError(field, 'Informe um e-mail válido.');
      return false;
    }

    if (field.dataset.validate === 'phone' && value && !PHONE_RE.test(value)) {
      setFieldError(field, 'Informe um telefone válido, com DDD.');
      return false;
    }

    if (field.dataset.validate === 'age' && value) {
      var age = Number(value);
      if (!Number.isInteger(age) || age < 0 || age > 120) {
        setFieldError(field, 'Informe uma idade válida.');
        return false;
      }
    }

    if (field.dataset.validate === 'lives' && value) {
      var lives = Number(value);
      if (!Number.isInteger(lives) || lives < 2 || lives > 20) {
        setFieldError(field, 'Informe uma quantidade válida (mínimo 2).');
        return false;
      }
    }

    setFieldError(field, '');
    return true;
  }

  function validateForm() {
    var fields = form.querySelectorAll('input[required], input[type=email]');
    var isValid = true;
    fields.forEach(function (field) {
      if (field.disabled) return;
      if (!validateField(field)) isValid = false;
    });
    return isValid;
  }

  form.querySelectorAll('input').forEach(function (field) {
    field.addEventListener('blur', function () {
      validateField(field);
    });
    field.addEventListener('input', function () {
      var wrapper = field.closest('.field');
      if (wrapper && wrapper.classList.contains('field--invalid')) {
        validateField(field);
      }
    });
  });

  var individualField = form.querySelector('[data-field-individual]');
  var familiaField = form.querySelector('[data-field-familia]');
  var ageInput = document.getElementById('lead-age');
  var livesInput = document.getElementById('lead-lives');

  function setPlanType(type) {
    var isFamilia = type === 'familia';

    if (individualField) individualField.hidden = isFamilia;
    if (familiaField) familiaField.hidden = !isFamilia;

    if (ageInput) {
      ageInput.disabled = isFamilia;
      ageInput.required = !isFamilia;
      if (isFamilia) setFieldError(ageInput, '');
    }
    if (livesInput) {
      livesInput.disabled = !isFamilia;
      livesInput.required = isFamilia;
      if (!isFamilia) setFieldError(livesInput, '');
    }
  }

  form.querySelectorAll('[data-plan-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      form.querySelectorAll('[data-plan-toggle]').forEach(function (btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      if (planTypeInput) planTypeInput.value = button.dataset.planToggle;
      setPlanType(button.dataset.planToggle);
    });
  });

  setPlanType(planTypeInput ? planTypeInput.value : 'individual');

  function showFeedback(message, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = 'form-feedback form-feedback--' + type;
    feedbackEl.hidden = false;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (feedbackEl) {
      feedbackEl.hidden = true;
      feedbackEl.textContent = '';
    }

    if (!validateForm()) {
      showFeedback('Verifique os campos destacados e tente novamente.', 'error');
      return;
    }

    if (!config.WEBHOOK_URL) {
      // eslint-disable-next-line no-console
      console.warn(
        'NOVAMED_LEAD_FORM_CONFIG.WEBHOOK_URL não está configurada. Defina a URL do CRM em js/config.js.'
      );
      showFeedback(
        'Formulário validado, mas o envio ainda não foi configurado (falta a URL do webhook).',
        'error'
      );
      return;
    }

    var formData = new FormData(form);
    var fields = config.PAYLOAD_FIELDS || {};
    var payload = {};

    Object.keys(fields).forEach(function (key) {
      payload[fields[key]] = (formData.get(key) || '').toString().trim();
    });

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');

    fetch(config.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // alterei de application/json para text/plain 
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Request failed with status ' + response.status);
        showFeedback('Recebemos seus dados! Redirecionando...', 'success');
        form.reset();
        var firstToggle = form.querySelector('[data-plan-toggle]');
        if (firstToggle) firstToggle.click();

        if (config.SUCCESS_REDIRECT_URL) {
          setTimeout(function () {
            window.location.href = config.SUCCESS_REDIRECT_URL;
          }, 1200);
        }
      })
      .catch(function () {
        showFeedback(
          'Não foi possível enviar seus dados agora. Tente novamente em instantes.',
          'error'
        );
      })
      .finally(function () {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      });
  });
})();
