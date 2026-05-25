document.addEventListener('DOMContentLoaded', function () {

  /* ============================================================
     BREAKPOINTS
     Funcions helpers per evitar repetir els mateixos valors
     en tots els punts de lògica responsive.
     ============================================================ */
  function isMobile()  { return window.innerWidth <= 767; }
  function isTablet()  { return window.innerWidth >= 768 && window.innerWidth <= 1100; }
  function isDesktop() { return window.innerWidth > 1100; }

  /* ============================================================
     1. ACTIVITATS — PANELS INDEPENDENTS (dimarts / dimecres / dijous)
     Desktop:  graella 4×2, sense paginació
     Tablet:   4 ítems visibles, 2 pàgines (dots 1/2)
     Mobile:   carousel 1 ítem a la vegada, 8 dots
     ============================================================ */

  var TABLET_PAGE_SIZE = 4;
  var panelKeys        = ['dimarts', 'dimecres', 'dijous'];
  var currentPanel     = 'dimarts';

  /* Construeix objecte de configuració per a cada panel.
     Busquem #panel-X, #acts-viewport-X, #inst-grid-X i #pagination-X al DOM. */
  var panels = {};
  panelKeys.forEach(function (key) {
    var pagination = document.getElementById('pagination-' + key);
    panels[key] = {
      panel:      document.getElementById('panel-' + key),
      viewport:   document.getElementById('acts-viewport-' + key),
      grid:       document.getElementById('inst-grid-' + key),
      pagination: pagination,
      dots:       pagination ? Array.from(pagination.querySelectorAll('.page-num')) : [],
      currentIdx:         0,
      currentTabletPage:  0
    };
  });

  /* ── Mostra el panel indicat i inicialitza el seu carousel ──────── */
  function showPanel(key) {
    /* Treu .active de tots i posa'l només al seleccionat */
    panelKeys.forEach(function (k) {
      if (panels[k].panel) panels[k].panel.classList.remove('active');
    });
    if (panels[key] && panels[key].panel) {
      panels[key].panel.classList.add('active');
    }
    currentPanel = key;
    setupPanel(key);
  }

  /* ── Configura el carousel del panel segons breakpoint ─────────── */
  function setupPanel(key) {
    var p = panels[key];
    if (!p || !p.grid) return;
    var items = Array.from(p.grid.querySelectorAll('.inst-item'));

    if (isDesktop()) {
      /* Tots els ítems visibles, sense paginació */
      items.forEach(function (item) { item.style.display = ''; });
      p.grid.style.transition = 'none';
      p.grid.style.transform  = 'translateX(0)';
      if (p.pagination) p.pagination.style.display = 'none';

    } else if (isTablet()) {
      /* 4 ítems per pàgina: show/hide via display */
      p.grid.style.transition = 'none';
      p.grid.style.transform  = 'translateX(0)';
      p.currentTabletPage     = 0;
      moveTabletPage(key, 0);

    } else {
      /* Mobile: carousel translateX — desactivem la transició durant el setup
         per evitar animació "d'anada i tornada" en canviar breakpoint */
      items.forEach(function (item) { item.style.display = ''; });
      p.grid.style.transition = 'none';
      p.currentIdx = 0;
      moveCarousel(key, 0);
      /* Reactivem la transició al frame següent, quan el layout ja és estable */
      requestAnimationFrame(function () {
        if (p.grid) p.grid.style.transition = '';
      });
    }
  }

  /* ── Tablet: mostra 4 ítems per pàgina ─────────────────────────── */
  function moveTabletPage(key, page) {
    var p     = panels[key];
    if (!p || !p.grid) return;
    var items = Array.from(p.grid.querySelectorAll('.inst-item'));
    var totalPages = Math.ceil(items.length / TABLET_PAGE_SIZE);
    page = Math.max(0, Math.min(page, totalPages - 1));
    p.currentTabletPage = page;

    var start = page * TABLET_PAGE_SIZE;
    var end   = start + TABLET_PAGE_SIZE;
    /* Amaga els que no pertanyen a la pàgina actual */
    items.forEach(function (item, i) {
      item.style.display = (i >= start && i < end) ? '' : 'none';
    });

    p.dots.forEach(function (dot, i) {
      dot.style.display = (i < totalPages) ? 'inline-flex' : 'none';
      dot.classList.toggle('active', i === page);
    });
    if (p.pagination) p.pagination.style.display = 'flex';
  }

  /* ── Mobile: carousel translateX ───────────────────────────────── */
  function moveCarousel(key, idx) {
    var p = panels[key];
    if (!p || !p.viewport || !p.grid) return;
    var items = p.grid.querySelectorAll('.inst-item');
    idx = Math.max(0, Math.min(idx, items.length - 1));
    p.currentIdx = idx;

    /* Cada ítem ocupa el 100% del viewport, el desplaçament és idx × amplada */
    p.grid.style.transform =
      'translateX(-' + (idx * p.viewport.offsetWidth) + 'px)';

    p.dots.forEach(function (dot, i) {
      dot.style.display = (i < items.length) ? 'inline-flex' : 'none';
      dot.classList.toggle('active', i === idx);
    });
    if (p.pagination) p.pagination.style.display = 'flex';
  }

  /* ── Dots click per a cada panel ────────────────────────────────── */
  panelKeys.forEach(function (key) {
    panels[key].dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (isTablet()) {
          moveTabletPage(key, i);
        } else if (isMobile()) {
          moveCarousel(key, i);
        }
      });
    });
  });

  /* ── Swipe tàctil per a cada panel ──────────────────────────────── */
  panelKeys.forEach(function (key) {
    var p = panels[key];
    if (!p.viewport) return;
    var touchX = 0, touchY = 0;
    p.viewport.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].clientX;
      touchY = e.changedTouches[0].clientY;
    }, { passive: true });
    p.viewport.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      /* Swipe horitzontal mínim 50px i que predomini sobre el vertical */
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (isTablet()) {
          moveTabletPage(key, p.currentTabletPage + (dx < 0 ? 1 : -1));
        } else if (isMobile()) {
          moveCarousel(key, p.currentIdx + (dx < 0 ? 1 : -1));
        }
      }
    }, { passive: true });
  });

  /* ── Filtres (pestanyes) ─────────────────────────────────────────── */
  var filterLinks      = document.querySelectorAll('.filter-link[data-filter]');
  var filtersContainer = document.querySelector('.activities-filters');

  function collapseFiltersDropdown() {
    if (filtersContainer) filtersContainer.classList.remove('filters-open');
  }

  filterLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      if (isMobile()) {
        /* Mobile: el filtre actiu actua com a toggle del dropdown;
           clic a un altre filtre el selecciona i tanca el dropdown */
        if (this.classList.contains('active')) {
          if (filtersContainer) filtersContainer.classList.toggle('filters-open');
          return;
        }
        filterLinks.forEach(function (f) { f.classList.remove('active'); });
        link.classList.add('active');
        collapseFiltersDropdown();
        showPanel(link.dataset.filter);
      } else {
        /* Desktop / tablet: comportament pestanya clàssic */
        filterLinks.forEach(function (f) { f.classList.remove('active'); });
        this.classList.add('active');
        showPanel(this.dataset.filter);
      }
    });
  });

  /* Tanca el dropdown si es fa clic fora del contenidor de filtres */
  document.addEventListener('click', function (e) {
    if (filtersContainer && !filtersContainer.contains(e.target)) {
      collapseFiltersDropdown();
    }
  });


  /* ============================================================
     2. EXPOSICIONS — CAROUSEL DESKTOP / TABLET
     Pàgines completes (desktop-page) que es desplacen en bloc.
     ============================================================ */
  var expoDesktopViewport = document.getElementById('expo-desktop-viewport');
  var expoDesktopTrack    = document.getElementById('expo-desktop-track');
  var expoDesktopPageEl   = document.getElementById('pagination-expo-desktop');
  var expoDesktopDots     = expoDesktopPageEl ? expoDesktopPageEl.querySelectorAll('.page-num') : [];
  var expoDesktopPages    = expoDesktopTrack  ? expoDesktopTrack.querySelectorAll('.expo-desktop-page') : [];

  var currentExpoDesktopIdx = 0;

  function moveExpoDesktopCarousel(idx) {
    if (!expoDesktopViewport || !expoDesktopTrack) return;
    if (idx < 0) idx = 0;
    if (idx >= expoDesktopPages.length) idx = expoDesktopPages.length - 1;
    currentExpoDesktopIdx = idx;

    expoDesktopTrack.style.transform =
      'translateX(-' + (idx * expoDesktopViewport.offsetWidth) + 'px)';

    expoDesktopDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
    });
  }

  expoDesktopDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { moveExpoDesktopCarousel(i); });
  });

  if (expoDesktopViewport) {
    var touchExpoDskX = 0, touchExpoDskY = 0;
    expoDesktopViewport.addEventListener('touchstart', function (e) {
      touchExpoDskX = e.changedTouches[0].clientX;
      touchExpoDskY = e.changedTouches[0].clientY;
    }, { passive: true });
    expoDesktopViewport.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchExpoDskX;
      var dy = e.changedTouches[0].clientY - touchExpoDskY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        moveExpoDesktopCarousel(currentExpoDesktopIdx + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }


  /* ============================================================
     3. EXPOSICIONS — CAROUSEL MOBILE (8 cards)
     Una card per pàgina, dots individuals per a cada exposició.
     ============================================================ */
  var expoViewport = document.getElementById('expo-mobile-viewport');
  var expoTrack    = document.getElementById('expo-mobile-track');
  var expoPageEl   = document.getElementById('pagination-expo-mobile');
  var expoDots     = expoPageEl ? expoPageEl.querySelectorAll('.page-num') : [];
  var expoCards    = expoTrack  ? expoTrack.querySelectorAll('.expo-card-mobile') : [];

  var currentExpoIdx = 0;

  function moveExpoCarousel(idx) {
    if (!expoViewport || !expoTrack) return;
    if (idx < 0) idx = 0;
    if (idx >= expoCards.length) idx = expoCards.length - 1;
    currentExpoIdx = idx;

    expoTrack.style.transform =
      'translateX(-' + (idx * expoViewport.offsetWidth) + 'px)';

    expoDots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === idx);
    });
  }

  expoDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { moveExpoCarousel(i); });
  });

  if (expoViewport) {
    var touchExpoX = 0, touchExpoY = 0;
    expoViewport.addEventListener('touchstart', function (e) {
      touchExpoX = e.changedTouches[0].clientX;
      touchExpoY = e.changedTouches[0].clientY;
    }, { passive: true });
    expoViewport.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchExpoX;
      var dy = e.changedTouches[0].clientY - touchExpoY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        moveExpoCarousel(currentExpoIdx + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }


  /* ============================================================
     4. RESIZE — reinicialitza tots els carousels
     El debounce de 80ms evita crides múltiples en redimensionar.
     ============================================================ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setupPanel(currentPanel);
      moveExpoCarousel(currentExpoIdx);
      moveExpoDesktopCarousel(currentExpoDesktopIdx);
    }, 80);
  });


  /* ============================================================
     5. MODAL ACTIVITAT
     Llegeix data-modal-* de l'ítem clicat i omple el modal.
     Composició editorial: imatge protagonista + jerarquia
     tipogràfica, barra de progrés de scroll, fade al peu.
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
  var modalCount    = document.getElementById('act-modal-count');
  var modalMinus    = document.getElementById('act-modal-minus');
  var modalPlus     = document.getElementById('act-modal-plus');
  var modalDescFade = document.getElementById('act-modal-desc-fade');
  var actForm       = document.getElementById('act-modal-form');
  var actConfirm    = document.getElementById('act-modal-confirm');

  var ticketCount  = 1;
  var _modalScrollY = 0;   /* guarda la posició de scroll per restaurar-la en tancar */

  /* ── Obre el modal amb les dades de l'ítem ──────────────────── */
  function openModal(item) {
    var imgEl   = item.querySelector('.inst-img-container img');
    var nameEl  = item.querySelector('.item-name');
    var infoEl  = item.querySelector('.item-info');

    /* Null-checks per a cada element del modal — evita crashes si el DOM
       no té algun element per qualsevol motiu (render parcial, ID canviat…) */
    if (modalImg)   { modalImg.src = imgEl ? imgEl.src : ''; modalImg.alt = imgEl ? imgEl.alt : ''; }
    if (modalTitle) modalTitle.textContent = nameEl  ? nameEl.textContent  : '';
    if (modalDate)  modalDate.textContent  = infoEl  ? infoEl.textContent  : '';
    if (modalType)  modalType.textContent  = item.dataset.modalType     || '—';
    if (modalLoc)   modalLoc.textContent   = item.dataset.modalLocation || '—';
    if (modalDesc)  modalDesc.textContent  = item.dataset.modalDesc     || '';

    /* Reset counter */
    ticketCount = 1;
    if (modalCount) modalCount.textContent = ticketCount;

    /* Neteja formulari i confirmació per si el modal ja havia estat obert */
    if (actConfirm) {
      actConfirm.classList.remove('is-visible');
      actConfirm.style.display = 'none';
    }
    if (actForm) {
      actForm.style.opacity  = '';
      actForm.style.display  = '';
      actForm.reset();
      ticketCount = 1;
      if (modalCount) modalCount.textContent = ticketCount;
    }

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

  /* ── Tanca el modal ─────────────────────────────────────────── */
  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-open');
      modalOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    /* Restaura posició de scroll — cal fer-ho DESPRÉS de treure modal-open */
    document.body.style.top = '';
    window.scrollTo(0, _modalScrollY);

    /* Reset formulari / confirmació (per si es torna a obrir) */
    if (actConfirm) {
      actConfirm.classList.remove('is-visible');
      actConfirm.style.display = 'none';
    }
    if (actForm) {
      actForm.style.opacity = '';
      actForm.style.display = '';
    }
  }

  /* ── Barra de progrés + fade: es vinculen al scroll de la descripció ── */
  function updateProgress() {
    if (!modalProgress) return;
    if (!modalDesc) { modalProgress.style.width = '100%'; return; }
    var scrollable = modalDesc.scrollHeight - modalDesc.clientHeight;
    var pct = scrollable > 0
      ? Math.min(100, (modalDesc.scrollTop / scrollable) * 100)
      : 100;
    modalProgress.style.width = pct + '%';

    /* Fade: s'amaga quan s'arriba pràcticament al final (97% per evitar
       que el gradient mai desaparegui per textos curts) */
    if (modalDescFade) {
      modalDescFade.style.opacity = (scrollable > 4 && pct < 97) ? '1' : '0';
    }
  }

  if (modalDesc) {
    modalDesc.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ── Formulari: submit → fade out form, fade in confirmació ─── */
  if (actForm) {
    actForm.addEventListener('submit', function (e) {
      e.preventDefault();

      actForm.style.transition = 'opacity 0.3s ease';
      actForm.style.opacity    = '0';

      setTimeout(function () {
        actForm.style.display = 'none';

        if (actConfirm) {
          actConfirm.style.display = 'block';
          /* Force reflow abans de la transició CSS */
          void actConfirm.offsetHeight;
          actConfirm.classList.add('is-visible');
        }
      }, 300);
    });
  }

  /* ── Contador d'entrades (+/−) ───────────────────────────────── */
  if (modalMinus) {
    modalMinus.addEventListener('click', function () {
      if (ticketCount > 1) {
        ticketCount--;
        if (modalCount) modalCount.textContent = ticketCount;
      }
    });
  }

  if (modalPlus) {
    modalPlus.addEventListener('click', function () {
      if (ticketCount < 10) {
        ticketCount++;
        if (modalCount) modalCount.textContent = ticketCount;
      }
    });
  }

  /* ── Tancar: botó ×, clic a overlay, tecla Escape ────────────── */
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    /* Comprova que el modal sigui obert abans de tancar-lo — evita
       que Escape interfereixi amb d'altres elements de la pàgina */
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ── Clic a qualsevol ítem d'activitat ───────────────────────── */
  document.querySelectorAll('.inst-item').forEach(function (item) {
    item.addEventListener('click', function () {
      openModal(this);
    });
  });


  /* ============================================================
     6. BUSCADOR D'EXPOSICIONS
     Filtra en temps real per títol. Mostra un grid pla de resultats
     i amaga els carousels (desktop + mobile) mentre s'escriu.

     La font de dades és el DOM: llegim les .expo-card-mobile que
     sempre estan presents a la pàgina (a diferència del carousel
     desktop que pot estar amagat per CSS).
     ============================================================ */

  var expoSearchInput   = document.getElementById('expo-search-input');
  var expoSearchResults = document.getElementById('expo-search-results');
  var expoSearchWrap    = document.querySelector('.expo-search-wrap');
  var expoDesktopWrap   = document.querySelector('.expo-desktop-carousel-wrap');
  var expoMobileWrap    = document.getElementById('expo-mobile-carousel');

  /* Recull les dades de totes les exposicions del DOM.
     Les .expo-card-mobile són la font de veritat: 1 element per exposició. */
  var expoData = [];
  document.querySelectorAll('.expo-card-mobile').forEach(function (card) {
    var nameEl  = card.querySelector('.item-name');
    var dateEl  = card.querySelector('.item-info');
    var imgEl   = card.querySelector('img');
    var linkEl  = card.querySelector('a');
    expoData.push({
      title : nameEl ? nameEl.textContent.trim() : '',
      date  : dateEl ? dateEl.textContent.trim() : '',
      img   : imgEl  ? imgEl.src   : '',
      alt   : imgEl  ? imgEl.alt   : '',
      href  : linkEl ? linkEl.href  : null
    });
  });

  /* Construeix una card de resultat (<a> si té href, <div> si no) */
  function buildResultCard(item) {
    var tag = item.href ? 'a' : 'div';
    var card = document.createElement(tag);
    card.className = 'expo-result-card';
    if (item.href) {
      card.href = item.href;
      card.style.textDecoration = 'none';
    }

    var imgWrap = document.createElement('div');
    imgWrap.className = 'expo-result-img';
    if (item.img) {
      var img = document.createElement('img');
      img.src = item.img;
      img.alt = item.alt;
      img.loading = 'lazy';
      imgWrap.appendChild(img);
    }

    var title = document.createElement('h3');
    title.className = 'expo-result-title';
    title.textContent = item.title;

    var date = document.createElement('p');
    date.className = 'expo-result-date';
    date.textContent = item.date;

    card.appendChild(imgWrap);
    card.appendChild(title);
    card.appendChild(date);
    return card;
  }

  /* Activa / desactiva mode cerca: amaga/mostra els carousels */
  function setSearchMode(active) {
    if (expoDesktopWrap) expoDesktopWrap.style.display = active ? 'none' : '';
    if (expoMobileWrap)  expoMobileWrap.style.display  = active ? 'none' : '';
    if (!active && expoSearchResults) {
      expoSearchResults.classList.remove('is-visible');
      expoSearchResults.innerHTML = '';
    }
  }

  /* Renderitza els resultats filtrats per la query */
  function renderResults(query) {
    if (!expoSearchResults) return;
    var q = query.trim().toLowerCase();

    if (!q) {
      setSearchMode(false);
      return;
    }

    setSearchMode(true);

    var matches = expoData.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) !== -1;
    });

    expoSearchResults.innerHTML = '';

    if (matches.length === 0) {
      var empty = document.createElement('p');
      empty.className = 'expo-no-results';
      empty.textContent = 'Cap exposició coincideix amb "' + query.trim() + '"';
      expoSearchResults.appendChild(empty);
    } else {
      matches.forEach(function (item) {
        expoSearchResults.appendChild(buildResultCard(item));
      });
    }

    /* Treu i torna a posar .is-visible per forçar el re-trigger de l'animació CSS */
    expoSearchResults.classList.remove('is-visible');
    void expoSearchResults.offsetHeight;
    expoSearchResults.classList.add('is-visible');
  }

  /* ── Obre / tanca el buscador (icona → input expandible) ──────── */
  function openExpoSearch() {
    if (!expoSearchWrap) return;
    expoSearchWrap.classList.add('is-open');
    /* El delay de 60ms deixa que l'animació d'amplada comenci abans
       que el focus mogui el cursor — en alguns browsers el focus
       tallava l'animació si era sincroni */
    setTimeout(function () {
      if (expoSearchInput) expoSearchInput.focus();
    }, 60);
  }

  function closeExpoSearch() {
    if (!expoSearchWrap) return;
    if (expoSearchInput) {
      expoSearchInput.value = '';
      expoSearchInput.blur();
    }
    setSearchMode(false);
    expoSearchWrap.classList.remove('is-open');
  }

  /* Click a la icona / wrap → obre si no estava obert */
  if (expoSearchWrap) {
    expoSearchWrap.addEventListener('click', function (e) {
      if (!this.classList.contains('is-open')) {
        openExpoSearch();
      }
    });
  }

  /* Click fora → tanca si l'input és buit */
  document.addEventListener('click', function (e) {
    if (expoSearchWrap && !expoSearchWrap.contains(e.target)) {
      if (expoSearchInput && !expoSearchInput.value.trim()) {
        closeExpoSearch();
      }
    }
  });

  if (expoSearchInput) {
    expoSearchInput.addEventListener('input', function () {
      renderResults(this.value);
    });

    /* Escape → tanca i neteja */
    expoSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeExpoSearch();
      }
    });
  }


  /* ============================================================
     7. INICIALITZACIÓ
     ============================================================ */
  showPanel('dimarts');
  moveExpoCarousel(0);
  moveExpoDesktopCarousel(0);

});
