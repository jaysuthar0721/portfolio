/* Decorative aerospace motion. CSS-driven; no continuous JavaScript render loop. */
(function () {
  'use strict';

  const root = document.documentElement;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'portfolio-motion-paused-v2';
  let paused = false;

  try {
    paused = localStorage.getItem(storageKey) === 'true';
  } catch (_) {}

  const backdrop = document.createElement('div');
  backdrop.className = 'aerospace-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = `
    <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g class="orbit-field">
        <circle class="orbit-line orbit-line--strong" cx="1130" cy="370" r="250"/>
        <circle class="orbit-line orbit-line--dash" cx="1130" cy="370" r="330"/>
        <circle class="orbit-line" cx="1130" cy="370" r="415"/>
        <circle class="orbit-line orbit-line--arc" cx="1130" cy="370" r="286"/>
        <path class="orbit-line orbit-line--dash" d="M-160 770 Q250 170 820 -60"/>
        <path class="orbit-line" d="M-140 830 Q270 230 880 0"/>
        <path class="orbit-crosshair" d="M1080 370h100M1130 320v100"/>
        <circle class="orbit-crosshair" cx="1130" cy="370" r="10"/>

        <g class="orbit-rotor orbit-rotor--inner">
          <g class="orbital-craft" transform="translate(880 370)">
            <circle class="craft-pulse" cx="0" cy="0" r="9"/>
            <rect class="craft-core" x="-4" y="-4" width="8" height="8" rx="1"/>
            <path class="craft-panel" d="M-8 0h-14M8 0h14M-22-5v10M22-5v10"/>
          </g>
        </g>

        <g class="orbit-rotor orbit-rotor--mid">
          <g class="orbital-craft" transform="translate(800 370)">
            <circle class="craft-pulse" cx="0" cy="0" r="7"/>
            <path class="craft-core" d="M0-7L5 4L0 2L-5 4Z"/>
          </g>
        </g>

        <g class="orbit-rotor orbit-rotor--outer">
          <g class="orbital-craft" transform="translate(715 370)">
            <circle class="craft-pulse" cx="0" cy="0" r="7"/>
            <circle class="craft-core" cx="0" cy="0" r="4"/>
          </g>
        </g>

        <circle class="telemetry-blip" cx="190" cy="715" r="3"/>
        <circle class="telemetry-blip telemetry-blip--delay" cx="435" cy="355" r="2.5"/>
      </g>
    </svg>`;
  document.body.prepend(backdrop);

  const ctas = document.querySelector('.hero-ctas');
  if (ctas) {
    const flight = document.createElement('div');
    flight.className = 'flight-accent';
    flight.setAttribute('aria-hidden', 'true');
    flight.innerHTML = `
      <svg viewBox="0 0 360 58" focusable="false">
        <path class="flight-track" d="M4 46 Q115 46 190 27 T352 7"/>
        <path class="flight-trail" d="M4 46 Q115 46 190 27 T352 7"/>
        <g class="flight-vehicle">
          <circle class="flight-vehicle-pulse" cx="0" cy="0" r="8"/>
          <path d="M-7-3L8 0-7 3-3 0Z"/>
        </g>
        <path class="flight-tick" d="M4 40v12m86-14v12m87-25v12m87-25v12m87-24v12"/>
      </svg>`;
    ctas.after(flight);
  }

  const footer = document.querySelector('.footer-inner');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'motion-toggle';
  if (footer) footer.append(button);

  function sync() {
    const systemReduced = preference.matches;
    const stopped = paused || systemReduced;

    root.classList.toggle('motion-paused', stopped);
    root.classList.toggle('motion-hidden', document.hidden);

    button.setAttribute('aria-pressed', String(stopped));
    button.disabled = systemReduced;

    if (systemReduced) {
      button.textContent = 'Motion off · system';
      button.setAttribute('aria-label', 'Decorative motion disabled by system setting');
    } else if (paused) {
      button.textContent = 'Resume motion';
      button.setAttribute('aria-label', 'Resume decorative motion');
    } else {
      button.textContent = 'Pause motion';
      button.setAttribute('aria-label', 'Pause decorative motion');
    }
  }

  button.addEventListener('click', function () {
    paused = !paused;
    try {
      localStorage.setItem(storageKey, String(paused));
    } catch (_) {}
    sync();
  });

  if (preference.addEventListener) preference.addEventListener('change', sync);
  else if (preference.addListener) preference.addListener(sync);

  document.addEventListener('visibilitychange', sync);
  sync();
})();
