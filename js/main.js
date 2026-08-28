(function () {
  'use strict';

  /* ---------- Links de WhatsApp (botão flutuante + rodapé) ---------- */
  var whatsappConfig = window.NOVAMED_LEAD_FORM_CONFIG || {};
  if (whatsappConfig.WHATSAPP_URL) {
    document.querySelectorAll('[data-whatsapp-link]').forEach(function (link) {
      link.href = whatsappConfig.WHATSAPP_URL;
    });
  }

  /* ---------- Header: sombra sutil ao rolar a página ---------- */
  var siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    var updateHeaderShadow = function () {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });
  }

  /* ---------- Header: menu mobile ---------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        var target = href && href.charAt(0) === '#' ? document.querySelector(href) : null;
        var wasMobileMenuOpen =
          siteNav.classList.contains('is-open') && window.getComputedStyle(navToggle).display !== 'none';

        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');

        // Só assume a rolagem na mão quando o menu mobile estava de fato
        // aberto e cobrindo a tela — espera o painel fechar antes de rolar,
        // pra não disputar com a animação de fechamento (e o scroll "sumir").
        if (target && wasMobileMenuOpen) {
          event.preventDefault();
          window.setTimeout(function () {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 320);
        }
      });
    });
  }

  /* ---------- Header ativo conforme a seção visível ----------
     Em vez de observar cada seção isoladamente (o que deixa "zonas mortas"
     sem nenhum link ativo entre seções sem âncora, tipo Preço+Formulário ou
     Prova social), calculamos qual é a última seção com link cujo topo já
     passou da linha de referência — sempre exatamente um link ativo. */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('[data-site-nav] a[href^="#"]:not(.site-nav__cta)')
  );
  var navSections = navLinks
    .map(function (link) {
      var el = document.querySelector(link.getAttribute('href'));
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top;
    });

  if (navSections.length) {
    var updateActiveNav = function () {
      var threshold = (siteHeader ? siteHeader.getBoundingClientRect().height : 0) + 24;
      var current = navSections[0];
      for (var i = 0; i < navSections.length; i++) {
        if (navSections[i].el.getBoundingClientRect().top <= threshold) {
          current = navSections[i];
        } else {
          break;
        }
      }
      navLinks.forEach(function (l) {
        l.classList.remove('is-active');
      });
      current.link.classList.add('is-active');
    };

    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    window.addEventListener('resize', updateActiveNav);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    document.documentElement.classList.add('js-reveal');
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el, index) {
      el.style.setProperty('--reveal-delay', Math.min(index % 4, 3) * 80 + 'ms');
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Accordion "Diferenciais" com autoplay + barra de progresso ---------- */
  (function () {
    var ITEM_DURATION = 5000;
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-differential]'));
    var mediaImg = document.querySelector('[data-differentials-image]');
    if (!items.length) return;

    var activeIndex = -1;
    var timerId = null;
    var remaining = ITEM_DURATION;
    var runningSince = 0;
    var paused = false;

    // No mobile a imagem entra logo abaixo da tab aberta; no desktop ela
    // volta pro lugar original (ao lado da lista inteira).
    var mediaWrap = mediaImg ? mediaImg.closest('.differentials__media') : null;
    var mediaHomeParent = mediaWrap ? mediaWrap.parentNode : null;
    var mediaHomeNext = mediaWrap ? mediaWrap.nextSibling : null;
    var mobileMql = window.matchMedia('(max-width: 899px)');

    function positionMedia(item) {
      if (!mediaWrap || !item) return;
      if (mobileMql.matches) {
        if (item.nextSibling !== mediaWrap) {
          item.parentNode.insertBefore(mediaWrap, item.nextSibling);
        }
      } else if (mediaWrap.parentNode !== mediaHomeParent || mediaWrap.nextSibling !== mediaHomeNext) {
        mediaHomeParent.insertBefore(mediaWrap, mediaHomeNext);
      }
    }

    function restartBarAnimation(item) {
      var bar = item.querySelector('[data-differential-bar]');
      if (!bar) return;
      // Força reflow para garantir que a animação reinicie mesmo se o item já
      // tiver sido ativado antes (loop voltando ao primeiro item, por exemplo).
      bar.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      bar.offsetHeight;
      bar.style.animation = '';
      bar.style.animationPlayState = 'running';
    }

    function setImage(item) {
      if (!mediaImg) return;
      var src = item.getAttribute('data-image');
      var alt = item.getAttribute('data-image-alt');
      if (!src || mediaImg.getAttribute('data-current-src') === src) return;
      mediaImg.style.opacity = '0';
      window.setTimeout(function () {
        mediaImg.src = src;
        if (alt) mediaImg.alt = alt;
        mediaImg.setAttribute('data-current-src', src);
        mediaImg.style.opacity = '1';
      }, 220);
    }

    function clearTimer() {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    }

    function scheduleAdvance(duration) {
      clearTimer();
      runningSince = Date.now();
      remaining = duration;
      timerId = window.setTimeout(function () {
        activate((activeIndex + 1) % items.length, ITEM_DURATION);
      }, duration);
    }

    function activate(index, duration) {
      var previous = items[activeIndex];
      if (previous) {
        previous.classList.remove('is-open');
        var previousTrigger = previous.querySelector('[data-differential-trigger]');
        if (previousTrigger) previousTrigger.setAttribute('aria-expanded', 'false');
        var previousBar = previous.querySelector('[data-differential-bar]');
        if (previousBar) previousBar.style.animation = 'none';
      }

      activeIndex = index;
      var item = items[activeIndex];
      item.classList.add('is-open');
      var trigger = item.querySelector('[data-differential-trigger]');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');

      restartBarAnimation(item);
      setImage(item);
      positionMedia(item);
      scheduleAdvance(duration || ITEM_DURATION);
    }

    mobileMql.addEventListener('change', function () {
      positionMedia(items[activeIndex]);
    });

    function pause() {
      if (paused || activeIndex === -1) return;
      paused = true;
      clearTimer();
      remaining -= Date.now() - runningSince;
      if (remaining < 0) remaining = 0;
      var bar = items[activeIndex].querySelector('[data-differential-bar]');
      if (bar) bar.style.animationPlayState = 'paused';
    }

    function resume() {
      if (!paused || activeIndex === -1) return;
      paused = false;
      var bar = items[activeIndex].querySelector('[data-differential-bar]');
      if (bar) bar.style.animationPlayState = 'running';
      scheduleAdvance(remaining);
    }

    items.forEach(function (item, index) {
      var trigger = item.querySelector('[data-differential-trigger]');
      if (trigger) {
        trigger.addEventListener('click', function () {
          activate(index, ITEM_DURATION);
        });
      }

      item.addEventListener('mouseenter', function () {
        if (index === activeIndex) pause();
      });
      item.addEventListener('mouseleave', function () {
        if (index === activeIndex) resume();
      });
    });

    activate(0, ITEM_DURATION);
  })();

  /* ---------- FAQ: colunas independentes + filtro por categoria ----------
     As duas colunas são reconstruídas sempre a partir do conjunto de cards
     visíveis no momento (respeitando o filtro ativo), para que:
     - os cards visíveis sempre alternem esquerda/direita em pares corretos;
     - com 0 ou 1 resultado, o layout vira uma coluna única (sem "hug" de
       largura), em vez de deixar uma coluna vazia ocupando metade do grid. */
  (function () {
    var faqGrid = document.querySelector('[data-faq-grid]');
    if (!faqGrid) return;
    var cardsInOrder = Array.prototype.slice.call(faqGrid.querySelectorAll('[data-faq-card]'));
    var faqTags = document.querySelectorAll('[data-faq-tag]');
    var mql = window.matchMedia('(min-width: 640px)');

    cardsInOrder.forEach(function (card) {
      var trigger = card.querySelector('[data-faq-trigger]');
      if (!trigger) return;
      card.addEventListener('click', function () {
        var isOpen = card.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
      });
    });

    function currentCategory() {
      var activeTag = document.querySelector('[data-faq-tag].is-active');
      return activeTag ? activeTag.dataset.faqTag : 'all';
    }

    function layout() {
      var category = currentCategory();
      var visible = cardsInOrder.filter(function (card) {
        return category === 'all' || card.dataset.faqCategory === category;
      });
      cardsInOrder.forEach(function (card) {
        card.hidden = visible.indexOf(card) === -1;
      });

      if (mql.matches) {
        var left = document.createElement('div');
        left.className = 'faq__column';
        var right = document.createElement('div');
        right.className = 'faq__column';
        visible.forEach(function (card, index) {
          (index % 2 === 0 ? left : right).appendChild(card);
        });
        faqGrid.replaceChildren(left, right);
      } else {
        faqGrid.replaceChildren.apply(faqGrid, visible);
      }
    }

    layout();
    mql.addEventListener('change', layout);

    faqTags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        faqTags.forEach(function (t) {
          t.classList.remove('is-active');
        });
        tag.classList.add('is-active');
        layout();
      });
    });
  })();

  /* ---------- Ano dinâmico no rodapé (mantendo texto base do design) ---------- */
  var yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
