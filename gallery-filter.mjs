export function createGalleryFilter({ buttons, cards, status }) {
  const filterButtons = [...buttons];
  const galleryCards = [...cards];

  function applyFilter(filter, label) {
    let visibleCount = 0;

    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    galleryCards.forEach((card) => {
      const matchesFilter = filter === 'all' || card.dataset.cat === filter;
      card.hidden = !matchesFilter;
      card.classList.toggle('hidden', !matchesFilter);

      if (matchesFilter) {
        visibleCount += 1;
        card.style.animation = 'fadeInUp 0.5s ease both';
      }
    });

    const itemLabel = visibleCount === 1 ? 'item' : 'items';
    status.textContent = filter === 'all'
      ? `Showing all ${visibleCount} concept gallery ${itemLabel}.`
      : `Showing ${visibleCount} ${label.toLowerCase()} concept gallery ${itemLabel}.`;
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyFilter(button.dataset.filter, button.textContent.trim());
    });
  });

  return { applyFilter };
}
