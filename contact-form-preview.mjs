const FIELD_LABELS = [
  ['name', 'Full Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['service', 'Service'],
  ['message', 'Message'],
];

export function formatContactPreview(values) {
  return FIELD_LABELS.flatMap(([key, label]) => {
    const value = String(values[key] ?? '').trim();
    return value ? [`${label}: ${value}`] : [];
  }).join('\n');
}

export function createContactFormPreview({
  form,
  preview,
  previewText,
  status,
  clearButton,
}) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form).entries());
    previewText.textContent = formatContactPreview(values);
    preview.hidden = false;
    status.textContent = 'Message preview ready. Review it below; nothing was sent or stored.';
    preview.focus();
  });

  clearButton.addEventListener('click', () => {
    form.reset();
    preview.hidden = true;
    previewText.textContent = '';
    status.textContent = 'Preview cleared. Nothing was sent or stored.';
    form.elements.namedItem('name')?.focus();
  });
}
