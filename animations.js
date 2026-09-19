/* ============================================================
   ANIMATIONS - Jay Suthar Portfolio (Swiss redesign)
   Progressive enhancement. Site works without JS; this layer
   adds entrance animations and scroll reveals.
   Respects prefers-reduced-motion (including runtime changes).
   ============================================================ */

(function () {
  'use strict';

  // ---------- REDUCED-MOTION (reactive) ----------
  const motionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  let reducedMotion = motionQuery ? motionQuery.matches : false;

  if (motionQuery) {
    const handler = function (e) { reducedMotion = e.matches; };
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handler);
    } else if (motionQuery.addListener) {
      motionQuery.addListener(handler);
    }
  }

  // ---------- HERO ENTRANCE ----------
  // Waits for fonts before revealing so words don't reflow mid-animation.
  function animateHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) return;

    if (reducedMotion) {
      hero.classList.add('revealed');
      return;
    }

    const reveal = function () { hero.classList.add('revealed'); };

    if (document.fonts && document.fonts.ready) {
      let done = false;
      const fire = function () {
        if (done) return;
        done = true;
        requestAnimationFrame(reveal);
      };
      document.fonts.ready.then(fire);
      setTimeout(fire, 800);
    } else {
      requestAnimationFrame(function () {
        setTimeout(reveal, 60);
      });
    }
  }

  // ---------- SCROLL REVEALS ----------
  function initScrollReveals() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -60px 0px'
    });

    targets.forEach(function (el) {
      observer.observe(el);
      el.classList.add('reveal-pending');
    });
  }

  // ---------- INIT ----------
  function init() {
    animateHero();
    initScrollReveals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
