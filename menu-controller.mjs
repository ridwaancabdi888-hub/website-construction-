export function createMenuController({ toggle, menu, mobileQuery, documentRef = document }) {
  const links = [...menu.querySelectorAll('a')];
  const iconBars = [...toggle.querySelectorAll('span')];

  const isOpen = () => menu.classList.contains('open');

  function syncAvailability() {
    menu.toggleAttribute('inert', mobileQuery.matches && !isOpen());
  }

  function setOpen(open, { focusFirst = false, restoreFocus = false } = {}) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');

    if (iconBars.length >= 3) {
      iconBars[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
      iconBars[1].style.opacity = open ? '0' : '1';
      iconBars[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    }

    syncAvailability();
    if (open && focusFirst && mobileQuery.matches) links[0]?.focus();
    if (!open && restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => {
    setOpen(!isOpen(), { focusFirst: true });
  });

  links.forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  documentRef.addEventListener('keydown', (event) => {
    if (!mobileQuery.matches || !isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, { restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [toggle, ...links];
    const currentIndex = focusable.indexOf(documentRef.activeElement);

    if (event.shiftKey && currentIndex === 0) {
      event.preventDefault();
      focusable.at(-1)?.focus();
    } else if (!event.shiftKey && currentIndex === focusable.length - 1) {
      event.preventDefault();
      focusable[0]?.focus();
    }
  });

  const handleViewportChange = () => {
    if (!mobileQuery.matches) setOpen(false);
    syncAvailability();
  };

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleViewportChange);
  } else {
    mobileQuery.addListener(handleViewportChange);
  }

  syncAvailability();
  return { isOpen, setOpen, syncAvailability };
}
