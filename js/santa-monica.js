document.addEventListener('DOMContentLoaded', function () {

  /* Scroll position compartit per tots els modals d'aquesta pàgina.
     Es guarda un sol valor perquè els modals no s'obren mai simultàniament. */
  var _modalScrollY = 0;

  /* ============================================================
     0. MODAL ACTUALITAT — Notícies
     Llegeix data-modal-* dels .inst-news-item per omplir el modal.
     Sense formulari: el cos de la notícia ocupa tot l'espai restant
     amb scroll intern i barra de progrés.
     ============================================================ */

  var newsModalOverlay  = document.getElementById('news-modal-overlay');
  var newsModalClose    = document.getElementById('news-modal-close');
  var newsModalProgress = document.getElementById('news-modal-progress');
  var newsModalImg      = document.getElementById('news-modal-img');
  var newsModalTitle    = document.getElementById('news-modal-title');
  var newsModalDate     = document.getElementById('news-modal-date');
  var newsModalBody     = document.getElementById('news-modal-body');
  var newsModalBodyFade = document.getElementById('news-modal-body-fade');

  function openNewsModal(item) {
    /* Imatge: prefereix data-modal-img, si no busca un <img> dins l'ítem */
    var imgSrc = item.dataset.modalImg || '';
    if (!imgSrc) {
      var imgEl = item.querySelector('.inst-img-placeholder img');
      if (imgEl) imgSrc = imgEl.src;
    }

    /* Títol: data-modal-title o el text del .item-name */
    var titleEl = item.querySelector('.item-name');
    var title   = item.dataset.modalTitle || (titleEl ? titleEl.textContent : '');

    if (newsModalImg)   { newsModalImg.src = imgSrc; newsModalImg.alt = title; }
    if (newsModalTitle) newsModalTitle.textContent = title;
    if (newsModalDate)  newsModalDate.textContent  = item.dataset.modalDate || '';
    if (newsModalBody)  newsModalBody.textContent  = item.dataset.modalDesc || '';

    /* Reset scroll i barra de progrés */
    if (newsModalBody) newsModalBody.scrollTop = 0;
    updateNewsProgress();

    /* Fixa el body per evitar scroll de fons — patró iOS: body.style.top = -scrollY */
    _modalScrollY = window.pageYOffset;
    document.body.style.top = '-' + _modalScrollY + 'px';
    if (newsModalOverlay) {
      newsModalOverlay.classList.add('is-open');
      newsModalOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open');
  }

  function closeNewsModal() {
    if (newsModalOverlay) {
      newsModalOverlay.classList.remove('is-open');
      newsModalOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    /* Restaura posició de scroll — cal fer-ho DESPRÉS de treure modal-open */
    document.body.style.top = '';
    window.scrollTo(0, _modalScrollY);
  }

  /* Barra de progrés + gradient fade de text */
  function updateNewsProgress() {
    if (!newsModalProgress || !newsModalBody) return;
    var scrollable = newsModalBody.scrollHeight - newsModalBody.clientHeight;
    var pct = scrollable > 0
      ? Math.min(100, (newsModalBody.scrollTop / scrollable) * 100)
      : 100;
    newsModalProgress.style.width = pct + '%';
    if (newsModalBodyFade) {
      newsModalBodyFade.style.opacity = (scrollable > 4 && pct < 97) ? '1' : '0';
    }
  }

  if (newsModalBody) {
    newsModalBody.addEventListener('scroll', updateNewsProgress, { passive: true });
  }

  /* Tancar: botó ×, clic al overlay, tecla Escape */
  if (newsModalClose) newsModalClose.addEventListener('click', closeNewsModal);
  if (newsModalOverlay) {
    newsModalOverlay.addEventListener('click', function (e) {
      if (e.target === newsModalOverlay) closeNewsModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && newsModalOverlay && newsModalOverlay.classList.contains('is-open')) {
      closeNewsModal();
    }
  });

  /* Clic als ítems de notícia */
  document.querySelectorAll('.inst-news-item').forEach(function (item) {
    item.addEventListener('click', function () { openNewsModal(this); });
  });


  /* ============================================================
     1. MODAL ESPAIS
     Llegeix data-modal-* dels .inst-item dins #inst-grid-espais.
     Composició editorial: imatge protagonista + nombre tipogràfic
     gran (.espai-modal-num-bg) com a element decoratiu.
     ============================================================ */

  var espaiOverlay   = document.getElementById('espai-modal-overlay');
  var espaiClose     = document.getElementById('espai-modal-close');
  var espaiImg       = document.getElementById('espai-modal-img');
  var espaiNumBadge  = document.getElementById('espai-modal-num-badge');
  var espaiNumBg     = document.getElementById('espai-modal-num-bg');
  var espaiNumLabel  = document.getElementById('espai-modal-num-label');
  var espaiTitle     = document.getElementById('espai-modal-title');
  var espaiType      = document.getElementById('espai-modal-type');
  var espaiFloor     = document.getElementById('espai-modal-floor');
  var espaiCapacity  = document.getElementById('espai-modal-capacity');
  var espaiDesc      = document.getElementById('espai-modal-desc');

  function openEspaiModal(item) {
    var imgEl   = item.querySelector('.inst-img-placeholder img');
    var numEl   = item.querySelector('.espai-num');
    var titleEl = item.querySelector('.inst-item-title');

    var num   = numEl   ? numEl.textContent.trim()   : '';
    var title = titleEl ? titleEl.textContent.trim() : '';

    if (espaiImg)      { espaiImg.src = imgEl ? imgEl.src : ''; espaiImg.alt = title; }
    /* El nombre es mostra en dos llocs: la xifra gran decorativa i el badge petit */
    if (espaiNumBadge) espaiNumBadge.textContent = num;
    if (espaiNumBg)    espaiNumBg.textContent    = num;
    if (espaiNumLabel) espaiNumLabel.textContent = 'Espai ' + num;
    if (espaiTitle)    espaiTitle.textContent    = title;
    if (espaiType)     espaiType.textContent     = item.dataset.modalType     || '—';
    if (espaiFloor)    espaiFloor.textContent    = item.dataset.modalFloor    || '—';
    if (espaiCapacity) espaiCapacity.textContent = item.dataset.modalCapacity || '—';
    if (espaiDesc)     espaiDesc.textContent     = item.dataset.modalDesc     || '';

    _modalScrollY = window.pageYOffset;
    document.body.style.top = '-' + _modalScrollY + 'px';
    if (espaiOverlay) {
      espaiOverlay.classList.add('is-open');
      espaiOverlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('modal-open');
  }

  function closeEspaiModal() {
    if (espaiOverlay) {
      espaiOverlay.classList.remove('is-open');
      espaiOverlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, _modalScrollY);
  }

  if (espaiClose) espaiClose.addEventListener('click', closeEspaiModal);
  if (espaiOverlay) {
    espaiOverlay.addEventListener('click', function (e) {
      if (e.target === espaiOverlay) closeEspaiModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && espaiOverlay && espaiOverlay.classList.contains('is-open')) {
      closeEspaiModal();
    }
  });

  /* Limitem els clics a #inst-grid-espais per evitar conflicte
     amb d'altres .inst-item que puguin existir a la pàgina */
  var espaisItemsGrid = document.getElementById('inst-grid-espais');
  if (espaisItemsGrid) {
    espaisItemsGrid.querySelectorAll('.inst-item').forEach(function (item) {
      item.addEventListener('click', function () { openEspaiModal(this); });
    });
  }


  /* ============================================================
     BREAKPOINTS
     ============================================================ */
  function isMobile()  { return window.innerWidth <= 767; }
  function isTablet()  { return window.innerWidth >= 768 && window.innerWidth <= 1100; }
  function isDesktop() { return window.innerWidth > 1100; }

  /* ============================================================
     2. ACTUALITAT (NEWS) CAROUSEL
     Desktop:  grid 4 col, sense carousel
     Tablet:   carousel 2 ítems/pàgina → 2 pàgines
     Mobile:   carousel 1 ítem/pàgina  → 4 pàgines
     ============================================================ */
  var newsViewport   = document.getElementById('news-viewport');
  var newsGrid       = document.getElementById('inst-grid-news');
  var newsPagination = document.getElementById('pagination-news');
  var newsDots       = newsPagination ? newsPagination.querySelectorAll('.page-num') : [];
  var allNewsItems   = newsGrid ? newsGrid.querySelectorAll('.inst-news-item') : [];
  var currentNewsIdx = 0;

  function setupNews() {
    if (!newsGrid) return;
    if (isDesktop()) {
      newsGrid.style.transition = 'none';
      newsGrid.style.transform  = 'translateX(0)';
      if (newsPagination) newsPagination.style.display = 'none';
    } else {
      /* Desactivem la transició durant el setup per evitar animació espúria */
      newsGrid.style.transition = 'none';
      currentNewsIdx = 0;
      moveNewsCarousel(0);
      requestAnimationFrame(function () { newsGrid.style.transition = ''; });
    }
  }

  function moveNewsCarousel(idx) {
    if (!newsViewport || !newsGrid) return;
    /* Tablet: 2 ítems per pàgina; mobile: 1 ítem per pàgina */
    var perPage    = isTablet() ? 2 : 1;
    var totalPages = Math.ceil(allNewsItems.length / perPage);
    idx = Math.max(0, Math.min(idx, totalPages - 1));
    currentNewsIdx = idx;
    /* Cada "pàgina" = amplada del viewport (funciona per 1 i 2 ítems
       perquè amb 2 ítems cada ítem és 50% i el viewport és ample complet) */
    newsGrid.style.transform = 'translateX(-' + (idx * newsViewport.offsetWidth) + 'px)';
    newsDots.forEach(function (dot, i) {
      dot.style.display = (i < totalPages) ? 'inline-flex' : 'none';
      dot.classList.toggle('active', i === idx);
    });
    if (newsPagination) newsPagination.style.display = 'flex';
  }

  newsDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (!isDesktop()) moveNewsCarousel(i);
    });
  });

  if (newsViewport) {
    var tnX = 0, tnY = 0;
    newsViewport.addEventListener('touchstart', function (e) {
      tnX = e.changedTouches[0].clientX;
      tnY = e.changedTouches[0].clientY;
    }, { passive: true });
    newsViewport.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tnX;
      var dy = e.changedTouches[0].clientY - tnY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        moveNewsCarousel(currentNewsIdx + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }


  /* ============================================================
     3. ESPAIS CAROUSEL
     Desktop: tots 6 en grid 3×2, sense paginació
     Tablet:  carousel 2 ítems per pàgina (3 pàgines), dots 1/2/3
     Mobile:  carousel 1 ítem a la vegada, dots 1–6
     En tots dos casos mòbils el desplaçament és idx × viewportWidth,
     perquè els ítems ocupen 50% (tablet) o 100% (mobile) de l'amplada.
     ============================================================ */
  var espaisViewport   = document.getElementById('espais-viewport');
  var espaisGrid       = document.getElementById('inst-grid-espais');
  var espaisPagination = document.getElementById('pagination-espais');
  var espaisDots       = espaisPagination ? espaisPagination.querySelectorAll('.page-num') : [];
  var allEspaisItems   = espaisGrid ? espaisGrid.querySelectorAll('.inst-item') : [];
  var currentEspaisPage = 0;
  var TABLET_PER_PAGE   = 2;

  function setupEspais() {
    if (!espaisGrid) return;
    currentEspaisPage = 0;

    if (isDesktop()) {
      espaisGrid.style.transition = 'none';
      espaisGrid.style.transform  = 'translateX(0)';
      if (espaisPagination) espaisPagination.style.display = 'none';
    } else {
      espaisGrid.style.transition = 'none';
      moveEspaisCarousel(0);
      requestAnimationFrame(function () { espaisGrid.style.transition = ''; });
    }
  }

  function moveEspaisCarousel(idx) {
    if (!espaisViewport || !espaisGrid) return;
    var perPage    = isTablet() ? TABLET_PER_PAGE : 1;
    var totalPages = Math.ceil(allEspaisItems.length / perPage);
    idx = Math.max(0, Math.min(idx, totalPages - 1));
    currentEspaisPage = idx;

    espaisGrid.style.transform =
      'translateX(-' + (idx * espaisViewport.offsetWidth) + 'px)';

    espaisDots.forEach(function (dot, i) {
      dot.style.display = (i < totalPages) ? 'inline-flex' : 'none';
      dot.classList.toggle('active', i === idx);
    });
    if (espaisPagination) espaisPagination.style.display = 'flex';
  }

  espaisDots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (!isDesktop()) moveEspaisCarousel(i);
    });
  });

  if (espaisViewport) {
    var teX = 0, teY = 0;
    espaisViewport.addEventListener('touchstart', function (e) {
      teX = e.changedTouches[0].clientX;
      teY = e.changedTouches[0].clientY;
    }, { passive: true });
    espaisViewport.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - teX;
      var dy = e.changedTouches[0].clientY - teY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        moveEspaisCarousel(currentEspaisPage + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });
  }


  /* ============================================================
     4. RESIZE
     Debounce de 80ms per evitar moltes crides seguides.
     ============================================================ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      setupNews();
      setupEspais();
    }, 80);
  });


  /* ============================================================
     5. INICIALITZACIÓ
     ============================================================ */
  setupNews();
  setupEspais();

});
