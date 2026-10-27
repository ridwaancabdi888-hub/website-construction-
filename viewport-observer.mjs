export function activateWhenVisible({ elements, onVisible, Observer, options }) {
  const targets = [...elements].filter(Boolean);
  if (!targets.length) return null;

  if (typeof Observer !== 'function') {
    targets.forEach((target) => onVisible(target));
    return null;
  }

  const observer = new Observer((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      onVisible(entry.target);
      observer.unobserve(entry.target);
    });
  }, options);

  targets.forEach((target) => observer.observe(target));
  return observer;
}
