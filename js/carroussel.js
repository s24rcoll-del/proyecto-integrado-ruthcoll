document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. CARRUSSEL D'ACTIVITATS (home)
     Desktop (≥1101px): grid estàtic de 4 ítems, sense paginació.
     Tablet (768–1100px): carousel de 2 ítems per pàgina, 2 dots.
     Mobile (<768px):  carousel d'1 ítem per pàgina, N dots.

     ============================================================ */
  ;(function initCarousel() {
  const container = document.getElementById('activities-container');
  const viewport  = document.querySelector('.carousel-viewport');
  const pages     = document.querySelectorAll('#pagination .page-num');

  /* Sortida ràpida si la pàgina no té el carrusel d'activitats */
  if (!container || !viewport) return;

  let currentIndex = 0;

  /* Nombre d'ítems visibles per mida de pantalla */
  function itemsPerPage() {
    if (window.innerWidth >= 1101) return 4;   // desktop: grid estàtic
    if (window.innerWidth >= 768)  return 2;   // tablet:  2 per pàgina
    return 1;                                   // mobile:  1 per pàgina
  }

  /* Nombre total de pàgines (0 en desktop = no carousel) */
  function totalPages() {
    const items = container.querySelectorAll('.activity-item');
    const ipp   = itemsPerPage();
    return ipp >= 4 ? 0 : Math.ceil(items.length / ipp);
  }

  function updateCarousel(index) {
    const tp  = totalPages();
    const ipp = itemsPerPage();

    /* En desktop el container no es mou — tots els ítems es veuen al grid */
    if (ipp >= 4) {
      container.style.transform = 'translateX(0)';
      pages.forEach(p => { p.style.display = 'none'; });
      return;
    }

    /* Límits */
    if (index >= tp) index = tp - 1;
    if (index < 0)   index = 0;
    currentIndex = index;

    /* Moviment: cada pàgina = amplada del viewport */
    const moveAmount = currentIndex * viewport.offsetWidth;
    container.style.transform = `translateX(-${moveAmount}px)`;

    /* Actualitza paginació: mostra/amaga dots i marca l'actiu */
    pages.forEach((p, i) => {
      const isVisible = i < tp;
      p.style.display  = isVisible ? 'inline-flex' : 'none';
      p.classList.toggle('active', i === currentIndex);
    });
  }

  /* Clics de paginació */
  pages.forEach((page, i) => {
    page.addEventListener('click', () => updateCarousel(i));
  });

  /* Actualitza en redimensionar — el debounce de 80ms evita moltes crides seguides */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      /* Evita que l'índex quedi fora de rang en canviar mida de pantalla */
      const tp = totalPages();
      if (tp > 0 && currentIndex >= tp) currentIndex = tp - 1;
      updateCarousel(currentIndex);
    }, 80);
  });

  /* ============================================================
     Touch / swipe
     Mínim 50px horitzontal i que predomini sobre el vertical
     per evitar conflictes amb el scroll natural de la pàgina.
     ============================================================ */
  let touchStartX  = 0;
  let touchStartY  = 0;
  let isDragging   = false;

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    isDragging  = true;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    /* Permet scroll vertical si el moviment és majoritàriament vertical;
       bloqueja scroll quan és clarament un swipe horitzontal */
    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) e.preventDefault();
  }, { passive: false });  /* passive: false perquè cridem preventDefault */

  viewport.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    /* Swipe horitzontal mínim 50px i predomina sobre vertical */
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      updateCarousel(currentIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  /* Inicialització */
  updateCarousel(0);
  }()); /* fi initCarousel — aïllat perquè el seu return no afecti la secció 2 */


  /* ============================================================
     2. FORMULARI DE CONTACTE I MODAL
     Validació client-side bàsica: nom ≥ 2 car., email vàlid,
     missatge ≥ 10 car.
     Si tot és correcte obre un modal de confirmació.
     ============================================================ */
  ;(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const modal     = document.getElementById('feedbackModal');
  const closeBtn  = document.getElementById('closeModal');
  const body      = document.body;
  let   _carrScrollY = 0;

  /* Sortida si el formulari de contacte no existeix a la pàgina */
  if (!form || !modal) return;

  function tancarModal() {
    modal.style.display = 'none';
    body.classList.remove('modal-open');
    /* Restaura posició de scroll — patró iOS */
    body.style.top = '';
    window.scrollTo(0, _carrScrollY);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');

    if (name && name.value.trim().length < 2) {
      showError('name', true); isValid = false;
    } else { showError('name', false); }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRx.test(email.value)) {
      showError('email', true); isValid = false;
    } else { showError('email', false); }

    if (message && message.value.trim().length < 10) {
      showError('message', true); isValid = false;
    } else { showError('message', false); }

    if (isValid) {
      /* Guarda scroll, fixa el body i obre el modal de confirmació */
      _carrScrollY = window.pageYOffset;
      body.style.top = '-' + _carrScrollY + 'px';
      modal.style.display = 'block';
      body.classList.add('modal-open');
      form.reset();
    }
  });

  if (closeBtn) closeBtn.onclick = tancarModal;

  /* Tancar si es clica fora del modal (al backdrop) */
  window.addEventListener('click', (e) => {
    if (e.target === modal) tancarModal();
  });

  /* Afegeix / treu la classe .invalid i mostra/amaga el missatge d'error */
  function showError(fieldId, isVisible) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const group = input.parentElement;
    const err   = document.getElementById(fieldId + 'Error');
    group.classList.toggle('invalid', isVisible);
    if (err) err.style.display = isVisible ? 'block' : 'none';
  }
  }()); /* fi initContactForm */

});
