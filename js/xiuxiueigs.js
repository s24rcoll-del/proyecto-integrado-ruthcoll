document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     0. MODAL ACTIVITAT — Activitats de l'exposició
     Mateix sistema visual que exp-act.html i index.html.
     Llegeix data-modal-* dels .inst-item per omplir el modal.
     ============================================================ */

  var modalOverlay  = document.getElementById('act-modal-overlay');
  var modalClose    = document.getElementById('act-modal-close');
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

  var ticketCount   = 1;
  var _modalScrollY = 0;   /* guarda la posició de scroll per restaurar-la en tancar */

  function openModal(item) {
    /* Els ítems d'aquesta pàgina usen .inst-img-container img */
    var imgEl  = item.querySelector('.inst-img-container img');
    var nameEl = item.querySelector('.item-name');
    var infoEl = item.querySelector('.item-info');

    if (modalImg)   { modalImg.src = imgEl ? imgEl.src : ''; modalImg.alt = imgEl ? imgEl.alt : ''; }
    if (modalTitle) modalTitle.textContent = nameEl ? nameEl.textContent : '';
    if (modalDate)  modalDate.textContent  = infoEl ? infoEl.textContent : '';
    if (modalType)  modalType.textContent  = item.dataset.modalType     || '—';
    if (modalLoc)   modalLoc.textContent   = item.dataset.modalLocation || '—';
    if (modalDesc)  modalDesc.textContent  = item.dataset.modalDesc     || '';

    /* Reset contador d'entrades */
    ticketCount = 1;
    if (modalCount) modalCount.textContent = ticketCount;

    /* Neteja formulari i confirmació per si el modal ja havia estat obert */
    if (actConfirm) { actConfirm.classList.remove('is-visible'); actConfirm.style.display = 'none'; }
    if (actForm)    { actForm.style.opacity = ''; actForm.style.display = ''; actForm.reset();
                      ticketCount = 1; if (modalCount) modalCount.textContent = ticketCount; }

    /* Reset scroll descripció i barra de progrés */
    if (modalDesc) modalDesc.scrollTop = 0;
    updateProgress();

    /* Fixa el body per evitar scroll de fons — patró iOS: body.style.top = -scrollY */
    _modalScrollY = window.pageYOffset;
    document.body.style.top = '-' + _modalScrollY + 'px';
    if (modalOverlay) {
      modalOverlay.classList.add('is-open');
      modalOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    /* Restaura posició de scroll — cal fer-ho DESPRÉS de treure modal-open */
    document.body.style.top = '';
    window.scrollTo(0, _modalScrollY);
    if (actConfirm) { actConfirm.classList.remove('is-visible'); actConfirm.style.display = 'none'; }
    if (actForm)    { actForm.style.opacity = ''; actForm.style.display = ''; }
  }

  /* Barra de progrés + gradient fade: s'amaga quan la descripció arriba al final */
  function updateProgress() {
    if (!modalProgress || !modalDesc) return;
    var scrollable = modalDesc.scrollHeight - modalDesc.clientHeight;
    var pct = scrollable > 0 ? Math.min(100, (modalDesc.scrollTop / scrollable) * 100) : 100;
    modalProgress.style.width = pct + '%';
    if (modalDescFade) {
      modalDescFade.style.opacity = (scrollable > 4 && pct < 97) ? '1' : '0';
    }
  }

  /* { passive: true } perquè no fem preventDefault aquí — millor rendiment de scroll */
  if (modalDesc) modalDesc.addEventListener('scroll', updateProgress, { passive: true });

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
  if (modalMinus) modalMinus.addEventListener('click', function () {
    if (ticketCount > 1) { ticketCount--; if (modalCount) modalCount.textContent = ticketCount; }
  });
  if (modalPlus) modalPlus.addEventListener('click', function () {
    if (ticketCount < 10) { ticketCount++; if (modalCount) modalCount.textContent = ticketCount; }
  });

  /* Tancar: botó ×, clic al overlay, tecla Escape */
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* Clic a qualsevol ítem d'activitat */
  document.querySelectorAll('.inst-item').forEach(function (item) {
    item.addEventListener('click', function () { openModal(this); });
  });


  /* ============================================================
     1. SECCIONS CURATORIALS — REVEAL EN SCROLL
     Usem IntersectionObserver en lloc de scroll listener per
     performance — zero cost quan no hi ha elements al viewport.
     ============================================================ */
  var sections = document.querySelectorAll('.curatorial-section');
  if (sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          /* unobserve un cop activat — l'animació ja no necessita seguiment */
          sectionObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ============================================================
     2. CRÈDITS — REVEAL I BARRA DE PROGRÉS
     La secció de crèdits fa stagger en entrar al viewport, i té
     una barra de progrés vinculada al scroll intern del contenidor.
     ============================================================ */
  var creditsSection      = document.getElementById('credits-section');
  var creditsScroll       = document.getElementById('creditsScroll');
  var creditsProgressFill = document.getElementById('creditsProgressFill');
  var creditsFade         = document.getElementById('creditsFade');

  if (creditsSection && creditsScroll) {
    /* Activa la classe in-view una sola vegada quan la secció entra al viewport */
    var creditsObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        creditsSection.classList.add('in-view');
        creditsObserver.disconnect();
      }
    }, { threshold: 0.1 });
    creditsObserver.observe(creditsSection);

    /* Barra de progrés del scroll intern dels crèdits */
    creditsScroll.addEventListener('scroll', function () {
      var maxScroll = creditsScroll.scrollHeight - creditsScroll.clientHeight;
      var pct = maxScroll > 0 ? (creditsScroll.scrollTop / maxScroll) * 100 : 100;
      if (creditsProgressFill) creditsProgressFill.style.width = pct + '%';
      /* Amaga el gradient quan s'arriba pràcticament al final */
      if (creditsFade) creditsFade.style.opacity = pct > 90 ? '0' : '1';
    }, { passive: true });
  }

  /* ============================================================
     3. SECCIONS CURATORIALS — SCROLL INTERN I BARRA DE PROGRÉS
     Cada .curatorial-content té el seu propi scroll i barra.
     Si el contingut no desborda (max <= 0), la barra s'omple
     immediatament i el fade desapareix.
     ============================================================ */
  document.querySelectorAll('.curatorial-content').forEach(function (content) {
    var wrap = content.closest('.curatorial-scroll-wrap');
    if (!wrap) return;
    var fill = wrap.querySelector('.curatorial-progress-fill');
    var fade = wrap.querySelector('.curatorial-fade');

    function updateCuratorial() {
      var max = content.scrollHeight - content.clientHeight;
      if (max <= 0) {
        /* El text cap sense scroll: barra plena, sense gradient */
        if (fill) fill.style.width = '100%';
        if (fade) fade.style.opacity = '0';
        return;
      }
      var pct = (content.scrollTop / max) * 100;
      if (fill) fill.style.width = pct + '%';
      if (fade) fade.style.opacity = pct > 90 ? '0' : '1';
    }

    content.addEventListener('scroll', updateCuratorial, { passive: true });
    /* Petit delay per assegurar que el layout ja s'ha calculat
       (evita que scrollHeight torni 0 per renderitzar fora de pantalla) */
    setTimeout(updateCuratorial, 150);
  });

});
