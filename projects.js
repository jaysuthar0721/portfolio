(() => {
  const dialog = document.querySelector('#project-dialog');
  const content = document.querySelector('#project-dialog-content');
  const closeButton = dialog?.querySelector('[data-project-close]');
  const cards = [...document.querySelectorAll('[data-project]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let trigger = null;

  if (!dialog || !content || !cards.length) return;

  const openProject = (slug, sourceButton = null) => {
    const template = document.querySelector('#project-' + slug);
    if (!template) return;

    trigger = sourceButton || document.querySelector('[data-project="' + slug + '"]');
    content.replaceChildren(template.content.cloneNode(true));

    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('project-modal-open');

    const title = content.querySelector('.project-title');
    if (title) title.id = 'project-dialog-title';

    if (history.replaceState) {
      history.replaceState(null, '', '#' + slug);
    }
  };

  const closeProject = () => {
    if (!dialog.open) return;
    dialog.close();
    document.documentElement.classList.remove('project-modal-open');

    if (history.replaceState && location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }

    if (trigger) {
      requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
    }
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => openProject(card.dataset.project, card));

    if (!reduceMotion) {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        card.style.setProperty('--card-x', x.toFixed(2) + 'px');
        card.style.setProperty('--card-y', y.toFixed(2) + 'px');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--card-x', '0px');
        card.style.setProperty('--card-y', '0px');
      });
    }
  });

  closeButton?.addEventListener('click', closeProject);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeProject();
  });

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('project-modal-open');
  });

  const initialSlug = location.hash.slice(1);
  if (initialSlug && document.querySelector('#project-' + initialSlug)) {
    requestAnimationFrame(() => openProject(initialSlug));
  }
})();