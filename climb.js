/* Decorative aerospace story. Plain SVG; one scheduled frame per scroll burst. */
(() => {
  'use strict';
  if (document.querySelector('.climb')) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 700px)');
  root.classList.add('has-climb');
  const layer = document.createElement('div');
  layer.className = 'climb';
  layer.setAttribute('aria-hidden', 'true');
  const readout = document.createElement('div');
  readout.className = 'climb-readout';
  // This is illustrative scroll progress, not real telemetry or a live region.
  readout.setAttribute('aria-hidden', 'true');
  readout.textContent = 'ALT 000 KM';

  const paths = [90, 150, 205, 255, 300, 340, 440, 490, 545, 605, 670].map((y, i) => {
    const bend = [-2, -5, -9, -14, -20, -26, 18, 13, 9, 5, 2][i];
    const d = `M -40 ${y} C 450 ${y} 690 ${y + bend} 860 ${y + bend} C 1030 ${y + bend} 1130 ${y + 8} 1320 ${y + 8}`;
    const detail = i % 2 ? ' climb-detail' : '';
    return `<g class="${detail}"><path class="climb-stream" d="${d}"/><path class="climb-particle${i === 4 || i === 5 ? ' climb-particle--fast' : ''}" d="${d}"/></g>`;
  }).join('');
  // Deterministic, sparse stars: no twinkling, randomness, filters, or timers.
  const stars = Array.from({ length: 32 }, (_, i) =>
    `<circle class="${i % 3 ? 'climb-detail' : ''}" cx="${(i * 193 + 47) % 1280}" cy="${(i * 127 + 39) % 720}" r="${i % 5 === 0 ? 1.3 : .7}"/>`
  ).join('');
  layer.innerHTML = `<div class="climb-sky"></div>
    <svg class="climb-flow" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" focusable="false">
      ${paths}
      <path class="climb-guide" d="M 660 404 H 1100"/>
      <path class="climb-airfoil" d="M 700 400 C 720 355 830 350 1020 408 C 860 420 740 420 700 400 Z"/>
    </svg>
    <svg class="climb-orbit" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" focusable="false">
      <g class="climb-stars">${stars}</g>
      <g class="climb-horizon">
        <circle cx="1050" cy="810" r="370"/>
        <path class="climb-detail" d="M 704 680 Q 1050 550 1396 680 M 840 510 Q 740 700 840 1030 M 1050 440 V 1180 M 1260 510 Q 1360 700 1260 1030"/>
      </g>
      <g transform="rotate(-24 990 365)">
        <ellipse class="climb-ring" cx="990" cy="365" rx="305" ry="178"/>
        <ellipse class="climb-guide climb-detail" cx="990" cy="365" rx="344" ry="205"/>
        <path class="climb-guide" d="M 625 365 H 1355 M 990 137 V 593"/>
        <g class="climb-craft" data-climb-craft>
          <path d="M -5 -5 H 5 V 5 H -5 Z M -17 -7 H -8 V 7 H -17 Z M 8 -7 H 17 V 7 H 8 Z M -8 0 H -5 M 5 0 H 8"/>
        </g>
      </g>
    </svg><div class="climb-veil"></div>`;
  document.body.prepend(layer);
  document.body.append(readout);
  const craft = layer.querySelector('[data-climb-craft]');
  let frame = 0;
  let needsMeasure = true;
  let distance = 0;
  let lastAltitude = -1;

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);

  function render() {
    frame = 0;
    // Read layout only after resize/content changes, before writing any styles.
    if (needsMeasure) {
      distance = Math.max(0, root.scrollHeight - root.clientHeight);
      const navHeight = document.querySelector('.nav')?.getBoundingClientRect().height || 64;
      readout.style.setProperty('--climb-top', `${navHeight - 26}px`);
      needsMeasure = false;
    }
    const progress = reduced.matches ? 0 : clamp(window.scrollY / (distance || 1));
    const orbit = smooth(clamp((progress - .18) / .62));
    layer.style.setProperty('--orbit', orbit.toFixed(4));
    layer.style.setProperty('--flow', (1 - orbit).toFixed(4));
    layer.style.setProperty('--descent', `${(orbit * (compact.matches ? 18 : 48)).toFixed(2)}px`);
    layer.style.setProperty('--dash', (-progress * 240).toFixed(2));
    const angle = (-145 + progress * 150) * Math.PI / 180;
    craft.setAttribute('transform', `translate(${(990 + 305 * Math.cos(angle)).toFixed(2)} ${(365 + 178 * Math.sin(angle)).toFixed(2)}) rotate(${(Math.atan2(178 * Math.cos(angle), -305 * Math.sin(angle)) * 180 / Math.PI).toFixed(2)})`);
    const altitude = Math.round(progress * 400);
    if (altitude !== lastAltitude) {
      readout.textContent = `ALT ${String(altitude).padStart(3, '0')} KM`;
      lastAltitude = altitude;
    }
  }
  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(render);
  }
  function measure() { needsMeasure = true; schedule(); }
  function onScroll() { if (!reduced.matches) schedule(); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else measure();
  });
  reduced.addEventListener('change', measure);
  compact.addEventListener('change', measure);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    observer.observe(root);
    const nav = document.querySelector('.nav');
    if (nav) observer.observe(nav);
  }
  window.addEventListener('load', measure, { once: true });
  document.fonts?.ready.then(measure);
  render();
})();
