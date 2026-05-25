document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     0. MODAL ACTIVITAT — Properes activitats (home)
     Mateix sistema que exp-act.js. Llegeix data-modal-* dels
     .activity-item per omplir el modal.
     ============================================================ */

  var modalOverlay  = document.getElementById('act-modal-overlay');
  var modalClose    = document.getElementById('act-modal-close');
  var modalInner    = document.getElementById('act-modal-inner');
  var modalProgress = document.getElementById('act-modal-progress');
  var modalImg      = document.getElementById('act-modal-img');
  var modalTitle    = document.getElementById('act-modal-title');
  var modalDate     = document.getElementById('act-modal-date');
  var modalType     = document.getElementById('act-modal-type');
  var modalLoc      = document.getElementById('act-modal-loc');
  var modalDesc     = document.getElementById('act-modal-desc');
  var modalDescFade = document.getElementById('act-modal-desc-fade');
  var modalCount    = document.getElementById('act-modal-count');
  var modalMinus    = document.getElementById('act-modal-minus');
  var modalPlus     = document.getElementById('act-modal-plus');
  var actForm       = document.getElementById('act-modal-form');
  var actConfirm    = document.getElementById('act-modal-confirm');

  var ticketCount = 1;
  var _modalScrollY = 0;   /* guarda la posició de scroll per restaurar-la en tancar */

  function openActivityModal(item) {
    /* La home usa .activity-img img; exp-act usa .inst-img-container img */
    var imgEl  = item.querySelector('.activity-img img') ||
                 item.querySelector('.inst-img-container img');
    var nameEl = item.querySelector('.item-name');
    var infoEl = item.querySelector('.item-info');

    if (modalImg)   { modalImg.src = imgEl ? imgEl.src : ''; modalImg.alt = imgEl ? imgEl.alt : ''; }
    if (modalTitle) modalTitle.textContent = nameEl ? nameEl.textContent : '';
    if (modalDate)  modalDate.textContent  = infoEl ? infoEl.textContent : '';
    if (modalType)  modalType.textContent  = item.dataset.modalType     || '—';
    if (modalLoc)   modalLoc.textContent   = item.dataset.modalLocation || '—';
    if (modalDesc)  modalDesc.textContent  = item.dataset.modalDesc     || '';

    /* Reset counter */
    ticketCount = 1;
    if (modalCount) modalCount.textContent = ticketCount;

    /* Reset formulari / confirmació */
    if (actConfirm) {
      actConfirm.classList.remove('is-visible');
      actConfirm.style.display = 'none';
    }
    if (actForm) {
      actForm.style.opacity = '';
      actForm.style.display = '';
      actForm.reset();
      ticketCount = 1;
      if (modalCount) modalCount.textContent = ticketCount;
    }

    /* Reset scroll descripció i progrés */
    if (modalDesc) modalDesc.scrollTop = 0;
    updateActivityProgress();

    /* Fixa el body per evitar scroll de fons — patró iOS: body.style.top = -scrollY */
    _modalScrollY = window.pageYOffset;
    document.body.style.top = '-' + _modalScrollY + 'px';
    if (modalOverlay) {
      modalOverlay.classList.add('is-open');
      modalOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open');
  }

  function closeActivityModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    /* Restaura posició de scroll — cal fer-ho DESPRÉS de treure modal-open */
    document.body.style.top = '';
    window.scrollTo(0, _modalScrollY);
    if (actConfirm) {
      actConfirm.classList.remove('is-visible');
      actConfirm.style.display = 'none';
    }
    if (actForm) {
      actForm.style.opacity = '';
      actForm.style.display = '';
    }
  }

  /* Barra de progrés + gradient fade: s'amaga quan la descripció arriba al final */
  function updateActivityProgress() {
    if (!modalProgress) return;
    if (!modalDesc) { modalProgress.style.width = '100%'; return; }
    var scrollable = modalDesc.scrollHeight - modalDesc.clientHeight;
    var pct = scrollable > 0
      ? Math.min(100, (modalDesc.scrollTop / scrollable) * 100)
      : 100;
    modalProgress.style.width = pct + '%';
    if (modalDescFade) {
      modalDescFade.style.opacity = (scrollable > 4 && pct < 97) ? '1' : '0';
    }
  }

  /* { passive: true } perquè no fem preventDefault aquí — millor rendiment de scroll */
  if (modalDesc) {
    modalDesc.addEventListener('scroll', updateActivityProgress, { passive: true });
  }

  /* Submit formulari: fade out del form → fade in de la confirmació */
  if (actForm) {
    actForm.addEventListener('submit', function (e) {
      e.preventDefault();
      actForm.style.transition = 'opacity 0.3s ease';
      actForm.style.opacity    = '0';
      setTimeout(function () {
        actForm.style.display = 'none';
        if (actConfirm) {
          actConfirm.style.display = 'block';
          /* Force reflow abans de la transició per garantir que el browser
             reconegui el canvi d'estat i apliqui l'animació correctament */
          void actConfirm.offsetHeight;
          actConfirm.classList.add('is-visible');
        }
      }, 300);
    });
  }

  /* Contador +/−: mínim 1, màxim 10 */
  if (modalMinus) {
    modalMinus.addEventListener('click', function () {
      if (ticketCount > 1) { ticketCount--; if (modalCount) modalCount.textContent = ticketCount; }
    });
  }
  if (modalPlus) {
    modalPlus.addEventListener('click', function () {
      if (ticketCount < 10) { ticketCount++; if (modalCount) modalCount.textContent = ticketCount; }
    });
  }

  /* Tancar: botó ×, clic al overlay, tecla Escape */
  if (modalClose) modalClose.addEventListener('click', closeActivityModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeActivityModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeActivityModal();
    }
  });

  /* Clic als ítems d'activitat */
  document.querySelectorAll('.activity-item').forEach(function (item) {
    item.addEventListener('click', function () { openActivityModal(this); });
  });




  /* ============================================================
     0b. VÍDEOS — Autoplay via JS per evitar Range-request 500s
     Alguns servidors de desenvolupament (Python http.server, Live Server)
     no suporten HTTP Range requests correctament. Moure l'autoplay
     a JS permet gestionar errors i evita que el servidor retorni 500
     durant la càrrega inicial de la pàgina.
     ============================================================ */
  document.querySelectorAll('video[data-autoplay]').forEach(function (video) {
    var promise = video.play();
    if (promise !== undefined) {
      promise.catch(function () {
        /* Autoplay bloquejat pel browser o error de xarxa — no fa res.
           El vídeo queda aturat; la pàgina continua funcionant. */
      });
    }
  });

  /* ============================================================
     1. NAV — Sticky amb fons en fer scroll
     Afegeix .nav--scrolled quan s'ha fet scroll > 60px.
     Les variables CSS --nav-scrolled-bg i --nav-scrolled-color
     fan el canvi visual per pàgina (veure pages.css i base.css).
     ============================================================ */
  var nav = document.querySelector('nav');
  if (nav) {
    function onNavScroll() {
      nav.classList.toggle('nav--scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onNavScroll, { passive: true });
    /* Crida inicial per si la pàgina es carrega ja amb scroll */
    onNavScroll();
  }

  /* ============================================================
     2. REVEAL — Animació d'entrada genèrica (.sm-reveal)
     Usem IntersectionObserver en lloc de scroll listener per
     performance — zero cost quan no hi ha elements al viewport.
     ============================================================ */
  var revealEls = document.querySelectorAll('.sm-reveal');
  if (revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          /* unobserve un cop activat — l'animació ja no necessita seguiment */
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ============================================================
     3. STAGGER — Aparició escalonada de grids (.sm-stagger)
     Threshold més baix (0.04) per activar abans, ja que els grids
     solen ser alts i el 10% pot quedar fora del viewport inicial.
     ============================================================ */
  var staggerEls = document.querySelectorAll('.sm-stagger');
  if (staggerEls.length) {
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          staggerObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -16px 0px' });
    staggerEls.forEach(function (el) { staggerObserver.observe(el); });
  }

  /* ============================================================
     4. ACCORDION — Sistema unificat (totes les pàgines)
     Gestiona .accordion-item amb header + contingut expandible.
     La rotació de la fletxa va per CSS (.accordion-item.is-open .arrow-up).
     Comportament: un sol ítem obert a la vegada (tanca els germans).
     ============================================================ */
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var header  = item.querySelector('.accordion-header');
    var content = item.querySelector('.accordion-content');
    if (!header || !content) return;
    header.addEventListener('click', function () {
      /* Tanca els altres del mateix contenidor (comportament accordion) */
      var siblings = item.parentElement
        ? item.parentElement.querySelectorAll('.accordion-item')
        : [];
      siblings.forEach(function (sib) {
        if (sib !== item && sib.classList.contains('is-open')) {
          sib.classList.remove('is-open');
          var sibContent = sib.querySelector('.accordion-content');
          /* Usem scrollHeight per l'animació CSS max-height, però el valor real
             el posem al JS perquè el contingut pot ser dinàmic */
          if (sibContent) sibContent.style.maxHeight = '0';
        }
      });
      /* Obre / tanca l'ítem actual */
      var isOpen = item.classList.toggle('is-open');
      content.style.maxHeight = isOpen ? content.scrollHeight + 'px' : '0';
    });
  });

  /* ============================================================
     6. MENÚ HAMBURGUESA — Mobile overlay
     Obre/tanca l'overlay de navegació mòbil.
     Anima les barres del toggle → X.
     Bloqueja el scroll del body quan és obert.

     NOTA: backdrop-filter crea un containing block per a
     position:fixed — per això la nav.nav-open fa
     backdrop-filter: none !important (veure base.css).
     Sense aquest trick l'overlay quedaria retallat a 60px.
     ============================================================ */
  var menuToggle = nav ? nav.querySelector('.menu-toggle') : null;

  if (menuToggle && nav) {
    var navLinks = nav.querySelector('.nav-links');

    /* Afegir data-num als links per a l'indicador monoespaciat */
    var links = nav.querySelectorAll('.nav-link');
    links.forEach(function (link, i) {
      link.setAttribute('data-num', String(i + 1).padStart(2, '0'));
    });

    function openMenu() {
      nav.classList.add('nav-open');
      document.body.classList.add('nav-menu-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Tancar menú');
    }

    function closeMenu() {
      nav.classList.remove('nav-open');
      document.body.classList.remove('nav-menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Obrir menú');
    }

    function toggleMenu() {
      if (nav.classList.contains('nav-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    menuToggle.addEventListener('click', toggleMenu);

    /* Tancar en fer clic en un link */
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    /* Tancar amb tecla Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        closeMenu();
      }
    });

    /* Tancar si canvia la mida de pantalla a desktop — evita l'overlay "penjat" */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 767 && nav.classList.contains('nav-open')) {
        closeMenu();
      }
    });

    /* Accessibilitat */
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Obrir menú');
    menuToggle.setAttribute('tabindex', '0');

    /* Suport teclat per al toggle */
    menuToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
  }

});
