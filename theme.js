/* Persistent light / AMOLED theme switcher. */
(() => {
  'use strict';

  const KEY = 'portfolio-theme-v1';
  const root = document.documentElement;

  function readTheme() {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (_) {}
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');

    document.querySelectorAll('.theme-toggle').forEach((button) => {
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to AMOLED dark mode');
      button.setAttribute('title', dark ? 'Light mode' : 'AMOLED dark mode');
      const label = button.querySelector('.theme-toggle-label');
      if (label) label.textContent = dark ? 'Light' : 'AMOLED';
    });
  }

  applyTheme(readTheme());

  function mountToggle() {
    const nav = document.querySelector('.nav-inner');
    if (!nav || nav.querySelector('.theme-toggle')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = `
      <span class="theme-toggle-orbit" aria-hidden="true">
        <span class="theme-toggle-body"></span>
        <span class="theme-toggle-satellite"></span>
      </span>
      <span class="theme-toggle-label"></span>
    `;

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      writeTheme(next);
      button.classList.remove('theme-toggle--fired');
      void button.offsetWidth;
      button.classList.add('theme-toggle--fired');
    });

    nav.append(button);
    applyTheme(root.dataset.theme || 'light');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountToggle, { once: true });
  } else {
    mountToggle();
  }
})();