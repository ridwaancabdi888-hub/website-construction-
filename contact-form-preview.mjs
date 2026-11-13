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

export function hasContactMethod(values) {
  return Boolean(String(values.phone ?? '').trim() || String(values.email ?? '').trim());
}

export function createContactFormPreview({
  form,
  preview,
  previewText,
  status,
  clearButton,
  contactError,
}) {
  const phone = form.elements.namedItem('phone');
  const email = form.elements.namedItem('email');

  const updateContactMethodState = (isValid) => {
    contactError.hidden = isValid;
    for (const field of [phone, email]) {
      if (!field) continue;
      if (isValid) field.removeAttribute('aria-invalid');
      else field.setAttribute('aria-invalid', 'true');
    }
  };

  const clearContactErrorWhenComplete = () => {
    if (hasContactMethod({ phone: phone?.value, email: email?.value })) {
      updateContactMethodState(true);
    }
  };

  phone?.addEventListener('input', clearContactErrorWhenComplete);
  email?.addEventListener('input', clearContactErrorWhenComplete);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const values = Object.fromEntries(new FormData(form).entries());
    if (!hasContactMethod(values)) {
      updateContactMethodState(false);
      status.textContent = 'Add a phone number or email address before previewing.';
      phone?.focus();
      return;
    }

    updateContactMethodState(true);
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
    updateContactMethodState(true);
    form.elements.namedItem('name')?.focus();
  });
}
