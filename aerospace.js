/* Decorative aerospace motion. No network, canvas, or animation-frame loop. */
(function () {
  'use strict';
  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = localStorage.getItem('portfolio-motion-paused') === 'true'; } catch (_) {}

  const backdrop = document.createElement('div');
  backdrop.className = 'aerospace-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = '<svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="1130" cy="370" r="250"/><circle cx="1130" cy="370" r="330" stroke-dasharray="3 12"/><circle cx="1130" cy="370" r="415"/><path d="M-160 770 Q250 170 820 -60" stroke-dasharray="4 10"/><path d="M-140 830 Q270 230 880 0"/><path d="M1080 370h100m-50-50v100"/></g><g class="orbit-satellite" fill="currentColor"><circle cx="880" cy="370" r="4"/><path d="M865 370h-18m42 0h18" stroke="currentColor" stroke-width="3"/></g><g class="orbit-satellite orbit-satellite--outer" fill="currentColor"><circle cx="715" cy="370" r="3"/></g></svg>';
  document.body.prepend(backdrop);

  const ctas = document.querySelector('.hero-ctas');
  if (ctas) {
    const flight = document.createElement('div');
    flight.className = 'flight-accent';
    flight.setAttribute('aria-hidden', 'true');
    flight.innerHTML = '<svg viewBox="0 0 360 54" focusable="false"><path class="flight-track" d="M4 46 Q115 46 190 27 T352 7"/><path class="flight-trail" d="M4 46 Q115 46 190 27 T352 7"/><g class="flight-vehicle"><path d="M-7-3L8 0-7 3-3 0Z"/></g><path class="flight-tick" d="M4 40v12m86-14v12m87-25v12m87-25v12m87-24v12"/></svg>';
    ctas.after(flight);
  }

  const footer = document.querySelector('.footer-inner');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'motion-toggle';
  button.setAttribute('aria-label', 'Pause decorative motion');
  if (footer) footer.append(button);

  function sync() {
    const stopped = paused || preference.matches;
    root.classList.toggle('motion-paused', stopped);
    root.classList.toggle('motion-hidden', document.hidden);
    button.setAttribute('aria-pressed', String(stopped));
    button.disabled = preference.matches;
    button.textContent = preference.matches ? 'Motion off · system' : paused ? 'Motion paused' : 'Pause motion';
  }
  button.addEventListener('click', function () {
    paused = !paused;
    try { localStorage.setItem('portfolio-motion-paused', String(paused)); } catch (_) {}
    sync();
  });
  if (preference.addEventListener) preference.addEventListener('change', sync);
  else if (preference.addListener) preference.addListener(sync);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
