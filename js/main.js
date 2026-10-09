// Loads HTML partials (needs a local server, e.g. `python3 -m http.server`)
const load = async el => { const r = await fetch(el.dataset.include); el.outerHTML = await r.text() };
Promise.all([...document.querySelectorAll('[data-include]')].map(load)).then(() => {
  if (window.lucide) lucide.createIcons();
  const $ = s => document.querySelector(s), menu = $('#mobile-menu');
  $('#menu-open')?.addEventListener('click', () => menu.classList.remove('translate-x-full'));
  $('#menu-close')?.addEventListener('click', () => menu.classList.add('translate-x-full'));

  // Cart drawer: open/close, tabs, order-note/shipping panels
  (function () {
    const drawer = document.getElementById('cart-drawer'), overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    const open = () => {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('pointer-events-none', 'opacity-0');
      drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.add('translate-x-full');
      overlay.classList.add('pointer-events-none', 'opacity-0');
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
    };
    document.querySelectorAll('[data-cart-open]').forEach(b => b.addEventListener('click', open));
    document.querySelectorAll('[data-cart-close]').forEach(b => b.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    const showTab = name => {
      document.getElementById('tab-cart')?.classList.toggle('hidden', name !== 'cart');
      document.getElementById('tab-recent')?.classList.toggle('hidden', name !== 'recent');
      document.querySelectorAll('[data-tab]').forEach(b => {
        const on = b.dataset.tab === name;
        b.classList.toggle('text-neutral-950', on);
        b.classList.toggle('text-neutral-300', !on);
      });
    };
    document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

    const togglePanel = (show, hide) => {
      document.getElementById(hide)?.classList.add('hidden');
      document.getElementById(show)?.classList.toggle('hidden');
    };
    document.getElementById('btn-note')?.addEventListener('click', () => togglePanel('panel-note', 'panel-ship'));
    document.getElementById('btn-ship')?.addEventListener('click', () => togglePanel('panel-ship', 'panel-note'));
  })();

  // Static-demo toast: [data-static-note] buttons show it on click,
  // [data-static-form] forms show it on submit (and never navigate).
  function showToast(msg) {
    let t = document.getElementById('static-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'static-toast';
      t.setAttribute('role', 'status');
      t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] bg-neutral-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-2xl opacity-0 translate-y-3 transition-all duration-300 pointer-events-none text-center';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.remove('opacity-0', 'translate-y-3'));
    clearTimeout(t._hide);
    t._hide = setTimeout(() => t.classList.add('opacity-0', 'translate-y-3'), 2600);
  }
  document.querySelectorAll('[data-static-note]').forEach(el => {
    el.addEventListener('click', () => showToast(el.getAttribute('data-static-note')));
  });
  document.querySelectorAll('[data-static-form]').forEach(f => {
    f.addEventListener('submit', e => { e.preventDefault(); showToast(f.getAttribute('data-static-form')); });
  });
  window.showStaticToast = showToast;

  // Footer mobile accordion (injected via outerHTML, so its old inline script never ran)
  document.querySelectorAll('[data-acc]').forEach(item => {
    const btn = item.querySelector('button');
    btn?.addEventListener('click', () => {
      const open = item.dataset.open === 'true';
      item.dataset.open = String(!open);
      btn.setAttribute('aria-expanded', String(!open));
    });
  });

  // SuperZoom lens tabs: filter cards by focal length
  (function () {
    const tabs = [...document.querySelectorAll('[data-zoom-tab]')];
    if (!tabs.length) return;
    const cards = [...document.querySelectorAll('[data-zoom]')];
    const active = ['bg-[#e8702a]', 'text-white'];
    const idle = ['border', 'border-white/80', 'text-white'];
    function select(tab) {
      tabs.forEach(t => {
        const on = t === tab;
        t.classList.remove(...(on ? idle : active));
        t.classList.add(...(on ? active : idle));
      });
      cards.forEach(c => c.classList.toggle('hidden', c.dataset.zoom !== tab.dataset.zoomTab));
    }
    tabs.forEach(t => t.addEventListener('click', () => select(t)));
    select(tabs[0]);
  })();
  document.querySelectorAll('[data-slider]').forEach(s => {
    const t = s.querySelector('[data-track]');
    if (!t) return;
    const cards = [...t.querySelectorAll('.snap-start')];
    // Exact scroll position where each card aligns to the start of the track.
    // Positions past the max scroll clamp to it, so drop duplicates.
    const stops = () => {
      const max = Math.max(0, t.scrollWidth - t.clientWidth);
      const raw = cards.map(c => Math.round(Math.min(c.offsetLeft - t.offsetLeft, max)));
      return raw.filter((p, i) => i === 0 || p - raw[i - 1] > 2);
    };
    const go = dir => {
      if (cards.length > 1) {
        const list = stops();
        let cur = 0;
        list.forEach((p, k) => { if (p <= t.scrollLeft + 2) cur = k; });
        if (dir < 0 && t.scrollLeft + 2 < list[0]) return; // already before first card
        if (dir > 0 && t.scrollLeft > list[list.length - 1] - 2) return; // already at end
        const n = Math.min(list.length - 1, Math.max(0, cur + dir));
        t.scrollTo({ left: list[n], behavior: 'smooth' });
      } else {
        const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
        const step = cards.length ? cards[0].offsetWidth + gap : t.clientWidth * .8;
        t.scrollBy({ left: dir * step, behavior: 'smooth' });
      }
    };
    s.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
    s.querySelector('[data-next]')?.addEventListener('click', () => go(1));
  });
  document.querySelectorAll('.faq-item button').forEach(b => b.addEventListener('click', () => {
    const it = b.parentElement, o = it.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open'));
    if (!o) it.classList.add('open');
  }));

  // Hero carousel
  const hero = document.getElementById('hero');
  if (hero) {
    const slides = [...hero.querySelectorAll('.hero-slide')];
    const dots = [...hero.querySelectorAll('.hero-dot')];
    let h = 0, timer;

    function go(n) {
      h = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === h));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === h));
    }
    function restart() {
      clearInterval(timer);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        timer = setInterval(() => go(h + 1), 5500);
    }

    hero.querySelector('[data-hero="prev"]')?.addEventListener('click', () => { go(h - 1); restart(); });
    hero.querySelector('[data-hero="next"]')?.addEventListener('click', () => { go(h + 1); restart(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); restart(); }));
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { go(h - 1); restart(); }
      if (e.key === 'ArrowRight') { go(h + 1); restart(); }
    });

    go(0); restart();
  }

  // Announcement slider
  const annRoot = document.getElementById('ann-slider');
  if (annRoot) {
    const annSlides = [...annRoot.querySelectorAll('[data-ann-slide]')];
    let annIndex = 0, annTimer = null;
    const annDelay = 4000;

    function showAnn(n) {
      annSlides[annIndex].classList.replace('opacity-100', 'opacity-0');
      annSlides[annIndex].classList.add('pointer-events-none');
      annSlides[annIndex].setAttribute('aria-hidden', 'true');
      annIndex = (n + annSlides.length) % annSlides.length;
      annSlides[annIndex].classList.replace('opacity-0', 'opacity-100');
      annSlides[annIndex].classList.remove('pointer-events-none');
      annSlides[annIndex].removeAttribute('aria-hidden');
    }
    function annStart() { annStop(); annTimer = setInterval(() => showAnn(annIndex + 1), annDelay); }
    function annStop() { if (annTimer) { clearInterval(annTimer); annTimer = null; } }

    annRoot.querySelector('[data-ann-prev]')?.addEventListener('click', () => { showAnn(annIndex - 1); annStart(); });
    annRoot.querySelector('[data-ann-next]')?.addEventListener('click', () => { showAnn(annIndex + 1); annStart(); });
    annRoot.addEventListener('mouseenter', annStop);
    annRoot.addEventListener('mouseleave', annStart);
    annStart();
  }

  // Hide scrollbars on scrollable tracks
  document.querySelectorAll('[data-track]').forEach(track => {
    track.style.setProperty('scrollbar-width', 'none');
    track.style.setProperty('-ms-overflow-style', 'none');
  });
  const style = document.createElement('style');
  style.textContent = '[data-track]::-webkit-scrollbar { display: none; }';
  document.head.appendChild(style);

  // Testimonial slider
  const testimonialTrack = document.getElementById('testimonial-track');
  const testimonialDots = [...document.querySelectorAll('.testimonial-dot')];
  const testimonialSlides = [...document.querySelectorAll('.testimonial-slide')];
  let testimonialIndex = 0;
  let testimonialTimer = null;
  const testimonialDelay = 5000;

  function goToTestimonial(index) {
    testimonialIndex = (index + testimonialSlides.length) % testimonialSlides.length;
    if (testimonialTrack) {
      testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
    }
    testimonialDots.forEach((dot, i) => {
      dot.classList.toggle('bg-[#111]', i === testimonialIndex);
      dot.classList.toggle('bg-neutral-300', i !== testimonialIndex);
    });
  }

  function nextTestimonial() {
    goToTestimonial(testimonialIndex + 1);
  }

  function prevTestimonial() {
    goToTestimonial(testimonialIndex - 1);
  }

  function startTestimonialAuto() {
    stopTestimonialAuto();
    testimonialTimer = setInterval(nextTestimonial, testimonialDelay);
  }

  function stopTestimonialAuto() {
    if (testimonialTimer) {
      clearInterval(testimonialTimer);
      testimonialTimer = null;
    }
  }

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToTestimonial(index);
      startTestimonialAuto();
    });
  });

  const testimonialSlider = document.getElementById('testimonial-slider');
  if (testimonialSlider) {
    testimonialSlider.addEventListener('mouseenter', stopTestimonialAuto);
    testimonialSlider.addEventListener('mouseleave', startTestimonialAuto);
  }

  // Touch/swipe for testimonials
  let testimonialTouchX = 0;
  if (testimonialTrack) {
    testimonialTrack.addEventListener('touchstart', (e) => {
      testimonialTouchX = e.touches[0].clientX;
      stopTestimonialAuto();
    }, { passive: true });
    testimonialTrack.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = testimonialTouchX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextTestimonial() : prevTestimonial();
      }
      startTestimonialAuto();
    }, { passive: true });
  }

  // Initialize testimonial slider (only when slides exist)
  if (testimonialSlides.length) {
    goToTestimonial(0);
    startTestimonialAuto();
  }

  // Gallery arrow visibility (section script never runs when injected, so it lives here)
  (function () {
    const section = document.getElementById('creators');
    if (!section) return;
    const track = section.querySelector('[data-track]');
    const prev = section.querySelector('[data-prev]');
    const next = section.querySelector('[data-next]');
    if (!track || !prev || !next) return;
    const wrapper = track.parentElement;
    const cards = [...track.querySelectorAll('.snap-start')];

    let hovered = false;
    [prev, next].forEach(b => { b.style.transition = 'opacity 250ms ease, visibility 250ms ease'; });

    function setArrow(btn, show) {
      btn.style.opacity = show ? '1' : '0';
      btn.style.visibility = show ? 'visible' : 'hidden';
      btn.style.pointerEvents = show ? 'auto' : 'none';
    }

    // Same card-stop positions the click handler scrolls to (deduped after clamping)
    function stops() {
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      const raw = cards.map(c => Math.round(Math.min(c.offsetLeft - track.offsetLeft, max)));
      return raw.filter((p, i) => i === 0 || p - raw[i - 1] > 2);
    }

    function updateArrows() {
      const scrollable = cards.length > 1 && track.scrollWidth - track.clientWidth > 2;
      const list = stops();
      let cur = 0;
      list.forEach((p, k) => { if (p <= track.scrollLeft + 2) cur = k; });
      const atStart = cur === 0; // no complete previous card
      const atEnd = cur === list.length - 1; // no complete next card
      setArrow(prev, hovered && scrollable && !atStart);
      setArrow(next, hovered && scrollable && !atEnd);
    }

    wrapper.addEventListener('mouseenter', () => { hovered = true; updateArrows(); });
    wrapper.addEventListener('mouseleave', () => { hovered = false; updateArrows(); });
    track.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    window.addEventListener('load', updateArrows);
    if ('ResizeObserver' in window) new ResizeObserver(updateArrows).observe(track);
    updateArrows();
  })();

  // Features slider (section script never runs when injected, so it lives here)
  (function () {
    const track = document.getElementById('features-track');
    const prev = document.getElementById('features-prev');
    const next = document.getElementById('features-next');
    const dotsContainer = document.getElementById('features-dots');
    if (!track || !prev || !next || !dotsContainer) return;

    const slides = [...track.querySelectorAll('.features-slide')];
    const dots = [...dotsContainer.querySelectorAll('.features-dot')];
    let index = 0;
    let timer = null;
    const delay = 5000;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, k) => {
        dot.classList.toggle('bg-white', k === index);
        dot.classList.toggle('bg-white/30', k !== index);
      });
    }

    function nextSlide() { goTo(index + 1); }
    function prevSlide() { goTo(index - 1); }

    function startAuto() {
      stopAuto();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        timer = setInterval(nextSlide, delay);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

    prev.addEventListener('click', () => { prevSlide(); startAuto(); });
    next.addEventListener('click', () => { nextSlide(); startAuto(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

    const slider = document.getElementById('features-slider');
    if (slider) {
      slider.addEventListener('mouseenter', stopAuto);
      slider.addEventListener('mouseleave', startAuto);
    }

    let touchX = 0;
    track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stopAuto(); }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); }
      startAuto();
    }, { passive: true });

    goTo(0);
    startAuto();
  })();

  // Awards carousel auto-scroll
  const awardsTrack = document.getElementById('awards-track');
  const awardsCarousel = document.getElementById('awards-carousel');

  if (awardsTrack && awardsCarousel) {
    const itemWidth = 160 + 24; // min-w-[160px] + gap-x-6 (1.5rem = 24px)
    let position = 0;
    let isHovered = false;
    const speed = 0.5; // pixels per frame

    function animate() {
      if (!isHovered) {
        position -= speed;
        // Reset when we've scrolled one full set of original items (8 items)
        const resetPoint = 8 * itemWidth;
        if (Math.abs(position) >= resetPoint) {
          position += resetPoint;
        }
        awardsTrack.style.transform = `translateX(${position}px)`;
      }
      requestAnimationFrame(animate);
    }

    awardsCarousel.addEventListener('mouseenter', () => { isHovered = true; });
    awardsCarousel.addEventListener('mouseleave', () => { isHovered = false; });

    animate();
  }

  // Scroll-aware navbar: #navbar-wrapper is a pure CSS `sticky` shell (never
  // transformed, so pinning always stays flush with the viewport top). JS only
  // slides the inner #navbar-bar up while scrolling down once the shell is
  // pinned, and back down on scroll up — the bar is never transformed while in
  // normal flow, so no gap can appear above it.
  (function () {
    const wrap = document.getElementById('navbar-wrapper');
    const bar = document.getElementById('navbar-bar');
    if (!wrap || !bar) return;
    let lastY = window.scrollY;
    addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y === lastY) return;
      if (y > lastY) {
        // Only hide once pinned; a single layout read, no cached measurements.
        if (wrap.getBoundingClientRect().top <= 0) bar.classList.add('-translate-y-full');
      } else {
        bar.classList.remove('-translate-y-full');
      }
      lastY = y;
    }, { passive: true });
  })();
});