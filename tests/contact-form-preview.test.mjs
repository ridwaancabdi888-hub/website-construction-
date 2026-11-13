import assert from 'node:assert/strict';
import test from 'node:test';

import { formatContactPreview, hasContactMethod } from '../contact-form-preview.mjs';

test('formats supplied contact details in a readable order', () => {
  assert.equal(
    formatContactPreview({
      name: '  Amina Ali ',
      phone: '+252 63 0000000',
      email: 'amina@example.com',
      service: 'Architectural Design',
      message: 'A two-storey family home',
    }),
    [
      'Full Name: Amina Ali',
      'Phone: +252 63 0000000',
      'Email: amina@example.com',
      'Service: Architectural Design',
      'Message: A two-storey family home',
    ].join('\n'),
  );
});

test('omits empty optional fields without adding undefined values', () => {
  assert.equal(
    formatContactPreview({ name: 'Amina Ali', phone: ' ', message: '' }),
    'Full Name: Amina Ali',
  );
});

test('keeps user text as plain preview content', () => {
  assert.equal(
    formatContactPreview({ name: '<img src=x onerror=alert(1)>', message: 'Use A & B' }),
    'Full Name: <img src=x onerror=alert(1)>\nMessage: Use A & B',
  );
});

test('requires at least one usable contact method', () => {
  assert.equal(hasContactMethod({ phone: '  ', email: '' }), false);
  assert.equal(hasContactMethod({ phone: '+252 63 0000000', email: '' }), true);
  assert.equal(hasContactMethod({ phone: '', email: ' amina@example.com ' }), true);
  assert.equal(hasContactMethod({}), false);
});
