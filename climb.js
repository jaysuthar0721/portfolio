/* Decorative aerospace story. Plain SVG; one scheduled frame per scroll burst. */
(() => {
  'use strict';
  if (document.querySelector('.climb')) return;

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('has-climb');
  const layer = document.createElement('div');
  layer.className = 'climb';
  layer.setAttribute('aria-hidden', 'true');
  const readout = document.createElement('div');
  readout.className = 'climb-readout';
  // This is illustrative scroll progress, not real telemetry or a live region.
  readout.setAttribute('aria-hidden', 'true');
  readout.textContent = 'ALT 000 KM';

  // Deterministic, sparse stars: no twinkling, randomness, filters, or timers.
  const stars = Array.from({ length: 32 }, (_, i) =>
    `<circle class="${i % 3 ? 'climb-detail' : ''}" cx="${(i * 193 + 47) % 1280}" cy="${(i * 127 + 39) % 720}" r="${i % 5 === 0 ? 1.3 : .7}"/>`
  ).join('');
  layer.innerHTML = `<svg class="climb-orbit" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" focusable="false">
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
    const angle = (-145 + progress * 150) * Math.PI / 180;
    craft.setAttribute('transform', `translate(${(990 + 305 * Math.cos(angle)).toFixed(2)} ${(365 + 178 * Math.sin(angle)).toFixed(2)}) rotate(${(Math.atan2(178 * Math.cos(angle), -305 * Math.sin(angle)) * 180 / Math.PI).toFixed(2)})`);
    const altitude = Math.round(progress * 100);
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

/* Horizon flare: a grainy sunrise on the climb layer's planet limb. It drifts
   toward the pointer and casts lens ghosts along the sun-to-pointer axis.
   Frames run only while the pointer moves and the easing settles. */
(() => {
  'use strict';
  const layer = document.querySelector('.climb');
  if (!layer || !window.CanvasRenderingContext2D) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'climb-flare';
  layer.querySelector('.climb-veil').before(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Planet from the SVG (1280x720 viewBox, xMidYMid slice) and the sun's limb angle.
  const PLANET = { x: 1050, y: 810, r: 370 };
  const SUN_ANGLE = -140 * Math.PI / 180;
  const GHOSTS = [
    { t: .34, r: 9, c: [180, 156, 255], a: .5 },
    { t: .58, r: 26, c: [123, 156, 255], a: .16 },
    { t: .8, r: 5, c: [255, 190, 140], a: .55 },
    { t: 1.18, r: 44, c: [105, 184, 125], a: .09 },
    { t: 1.42, r: 14, c: [255, 138, 69], a: .22 }
  ];

  let W = 0, H = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
  let sun = { x: 0, y: 0 }, planet = { x: 0, y: 0, r: 0 };
  let rim, glow, rays, noise, dark = false;
  let frame = 0;
  const target = { x: 0, y: 0, on: 0 };
  const eased = { x: 0, y: 0, on: 0 };

  // Seeded PRNG keeps the grain and ray pattern identical on every visit.
  function rng(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  }
  function makeNoise() {
    const c = makeCanvas(160, 160), g = c.getContext('2d'), img = g.createImageData(160, 160), rand = rng(7);
    for (let i = 0; i < img.data.length; i += 4) img.data[i + 3] = rand() * 255 * (rand() < .5 ? .35 : 1);
    g.putImageData(img, 0, 0);
    return c;
  }
  // Punch fine speckles out of a sprite for the film-grain look.
  function grain(c, amount) {
    const g = c.getContext('2d');
    g.save();
    g.globalCompositeOperation = 'destination-out';
    g.globalAlpha = amount;
    g.fillStyle = g.createPattern(noise, 'repeat');
    g.fillRect(0, 0, c.width, c.height);
    g.restore();
  }
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function palette() {
    return dark
      ? { core: [255, 255, 255], warm: [255, 150, 80], hot: [255, 214, 170], haze: [123, 120, 255], line: [236, 232, 255], strength: 1 }
      : { core: [255, 196, 120], warm: [214, 100, 30], hot: [240, 150, 70], haze: [113, 87, 184], line: [120, 90, 200], strength: 1 };
  }

  function build() {
    dark = root.dataset.theme === 'dark';
    W = innerWidth; H = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    scale = Math.max(W / 1280, H / 720);
    ox = (W - 1280 * scale) / 2; oy = (H - 720 * scale) / 2;
    planet = { x: ox + PLANET.x * scale, y: oy + PLANET.y * scale, r: PLANET.r * scale };
    sun = { x: planet.x + planet.r * Math.cos(SUN_ANGLE), y: planet.y + planet.r * Math.sin(SUN_ANGLE) };
    noise = noise || makeNoise();
    const p = palette();
    const unit = Math.max(.75, Math.min(1.3, scale));

    // Atmosphere rim: layered strokes, brightest beside the sun, fading around the limb.
    rim = makeCanvas(W * dpr, H * dpr);
    const g = rim.getContext('2d');
    g.scale(dpr, dpr);
    g.lineCap = 'round';
    const layers = [
      { w: 70, c: p.haze, a: .07 }, { w: 34, c: p.haze, a: .14 }, { w: 14, c: p.warm, a: .22 },
      { w: 5, c: p.hot, a: .45 }, { w: 1.6, c: p.line, a: .9 }
    ];
    const steps = 180;
    for (const l of layers) {
      g.lineWidth = l.w * unit;
      for (let i = 0; i < steps; i++) {
        const a0 = -Math.PI + i * Math.PI / steps, a1 = a0 + Math.PI / steps + .004;
        const d = Math.abs(a0 - SUN_ANGLE);
        const k = .18 + .82 * Math.exp(-(d * d) / .35);
        g.strokeStyle = rgba(l.c, l.a * k * p.strength);
        g.beginPath();
        // Offset the softer layers outward so the haze sits above the limb.
        g.arc(planet.x, planet.y, planet.r + l.w * unit * .28, a0, a1);
        g.stroke();
      }
    }
    grain(rim, .55);

    // Sun glow sprite.
    const gr = 260 * unit;
    glow = makeCanvas(gr * 2 * dpr, gr * 2 * dpr);
    const gg = glow.getContext('2d');
    gg.scale(dpr, dpr);
    const rad = gg.createRadialGradient(gr, gr, 0, gr, gr, gr);
    rad.addColorStop(0, rgba(p.core, 1 * p.strength));
    rad.addColorStop(.05, rgba(p.core, .95 * p.strength));
    rad.addColorStop(.14, rgba(p.hot, .6 * p.strength));
    rad.addColorStop(.38, rgba(p.warm, .2 * p.strength));
    rad.addColorStop(1, rgba(p.warm, 0));
    gg.fillStyle = rad;
    gg.fillRect(0, 0, gr * 2, gr * 2);
    grain(glow, .5);

    // Starburst rays: thin tapered wedges of varying length.
    const rr = 230 * unit, rand = rng(42);
    rays = makeCanvas(rr * 2 * dpr, rr * 2 * dpr);
    const rg = rays.getContext('2d');
    rg.scale(dpr, dpr);
    rg.translate(rr, rr);
    for (let i = 0; i < 46; i++) {
      const ang = i / 46 * Math.PI * 2 + rand() * .08;
      const len = rr * (.35 + rand() * .65), wid = .018 + rand() * .03;
      const lg = rg.createRadialGradient(0, 0, 0, 0, 0, len);
      const c = i % 3 ? p.warm : p.hot;
      lg.addColorStop(0, rgba(c, .5 * p.strength));
      lg.addColorStop(.5, rgba(c, .14 * p.strength));
      lg.addColorStop(1, rgba(c, 0));
      rg.fillStyle = lg;
      rg.beginPath();
      rg.moveTo(0, 0);
      rg.arc(0, 0, len, ang - wid, ang + wid);
      rg.closePath();
      rg.fill();
    }
    grain(rays, .6);
    if (!target.on) { target.x = eased.x = W / 2; target.y = eased.y = H / 2; }
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // Sun drifts slightly toward the pointer; the rim follows at half the rate.
    const dx = (eased.x - W / 2) * eased.on, dy = (eased.y - H / 2) * eased.on;
    const sx = sun.x + dx * .045, sy = sun.y + dy * .03;
    const near = Math.exp(-Math.hypot(eased.x - sx, eased.y - sy) / (W * .5)) * eased.on;
    ctx.drawImage(rim, dx * .02, dy * .015, W, H);

    ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over';
    const rs = (rays.width / dpr) * (1 + near * .25 + eased.on * .05);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate((eased.x / W - .5) * .5 * eased.on + (eased.y / H - .5) * .2 * eased.on);
    ctx.globalAlpha = .75 + near * .25;
    ctx.drawImage(rays, -rs / 2, -rs / 2, rs, rs);
    ctx.restore();
    const gs = (glow.width / dpr) * (1 + near * .15);
    ctx.globalAlpha = .9 + near * .1;
    ctx.drawImage(glow, sx - gs / 2, sy - gs / 2, gs, gs);

    // Lens ghosts along the sun-to-pointer axis.
    if (eased.on > .01) {
      const unit = Math.max(.75, Math.min(1.3, scale));
      for (const gh of GHOSTS) {
        const x = sx + (eased.x - sx) * gh.t, y = sy + (eased.y - sy) * gh.t, r = gh.r * unit;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(gh.c, gh.a * eased.on * (dark ? 1 : .7)));
        g.addColorStop(.7, rgba(gh.c, gh.a * .55 * eased.on * (dark ? 1 : .7)));
        g.addColorStop(1, rgba(gh.c, 0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function tick() {
    frame = 0;
    const k = .09;
    eased.x += (target.x - eased.x) * k;
    eased.y += (target.y - eased.y) * k;
    eased.on += (target.on - eased.on) * .07;
    const settled = Math.abs(target.x - eased.x) < .3 && Math.abs(target.y - eased.y) < .3 && Math.abs(target.on - eased.on) < .004;
    if (settled) { eased.x = target.x; eased.y = target.y; eased.on = target.on; }
    draw();
    if (!settled) schedule();
  }
  function schedule() {
    if (!frame && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  }
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch' || reduced.matches) return;
    target.x = e.clientX; target.y = e.clientY; target.on = 1;
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { target.on = 0; schedule(); });
  window.addEventListener('blur', () => { target.on = 0; schedule(); });

  let resizeFrame = 0;
  const rebuild = () => {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; build(); });
  };
  window.addEventListener('resize', rebuild, { passive: true });
  reduced.addEventListener('change', () => {
    target.on = eased.on = 0; target.x = eased.x = W / 2; target.y = eased.y = H / 2;
    cancelAnimationFrame(frame); frame = 0; draw();
  });
  new MutationObserver(rebuild).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  build();
})();
