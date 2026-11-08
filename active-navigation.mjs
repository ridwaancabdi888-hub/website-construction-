export function createActiveNavigation({
  sections,
  links,
  windowRef = window,
  offset = 100,
}) {
  const navigationLinks = [...links];
  const linksBySection = new Map(
    navigationLinks.flatMap((link) => {
      const href = link.getAttribute('href');
      return href?.startsWith('#') ? [[href.slice(1), link]] : [];
    }),
  );
  const entries = [...sections]
    .map((section) => ({ section, link: linksBySection.get(section.id) }))
    .filter(({ link }) => link);

  let scheduledFrame = null;

  function sync() {
    scheduledFrame = null;
    if (entries.length === 0) return;

    const position = (windowRef.scrollY ?? windowRef.pageYOffset ?? 0) + offset;
    const activeEntry = entries.reduce((current, entry) => (
      entry.section.offsetTop <= position ? entry : current
    ), entries[0]);

    navigationLinks.forEach((link) => {
      const active = link === activeEntry.link;
      link.style.color = active ? 'var(--blue)' : '';
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function scheduleSync() {
    if (scheduledFrame !== null) return;
    scheduledFrame = windowRef.requestAnimationFrame(sync);
  }

  windowRef.addEventListener('scroll', scheduleSync, { passive: true });
  windowRef.addEventListener('resize', scheduleSync);
  windowRef.addEventListener('load', scheduleSync);
  sync();

  return {
    sync,
    destroy() {
      windowRef.removeEventListener('scroll', scheduleSync);
      windowRef.removeEventListener('resize', scheduleSync);
      windowRef.removeEventListener('load', scheduleSync);
      if (scheduledFrame !== null) windowRef.cancelAnimationFrame(scheduledFrame);
    },
  };
}
