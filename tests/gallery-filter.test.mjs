import assert from 'node:assert/strict';
import test from 'node:test';

import { createGalleryFilter } from '../gallery-filter.mjs';

class FakeClassList {
  #values = new Set();

  contains(value) { return this.#values.has(value); }
  toggle(value, force) {
    const enabled = force ?? !this.#values.has(value);
    if (enabled) this.#values.add(value);
    else this.#values.delete(value);
  }
}

class FakeElement {
  constructor({ filter, category, text = '' } = {}) {
    this.dataset = {};
    if (filter) this.dataset.filter = filter;
    if (category) this.dataset.cat = category;
    this.textContent = text;
    this.hidden = false;
    this.style = {};
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
  }

  addEventListener(type, listener) { this.listeners.set(type, listener); }
  click() { this.listeners.get('click')?.(); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

function setup() {
  const buttons = [
    new FakeElement({ filter: 'all', text: 'All' }),
    new FakeElement({ filter: 'villa', text: 'Villas' }),
    new FakeElement({ filter: 'commercial', text: 'Commercial' }),
  ];
  const cards = [
    new FakeElement({ category: 'villa' }),
    new FakeElement({ category: 'villa' }),
    new FakeElement({ category: 'commercial' }),
  ];
  const status = new FakeElement();
  const controller = createGalleryFilter({ buttons, cards, status });
  return { buttons, cards, controller, status };
}

test('selecting a category updates button state and visible cards', () => {
  const { buttons, cards } = setup();
  buttons[1].click();

  assert.equal(buttons[0].attributes.get('aria-pressed'), 'false');
  assert.equal(buttons[1].attributes.get('aria-pressed'), 'true');
  assert.equal(buttons[1].classList.contains('active'), true);
  assert.deepEqual(cards.map((card) => card.hidden), [false, false, true]);
  assert.equal(cards[2].classList.contains('hidden'), true);
});

test('filter changes announce the category and result count', () => {
  const { buttons, status } = setup();
  buttons[1].click();
  assert.equal(status.textContent, 'Showing 2 villas concept gallery items.');

  buttons[2].click();
  assert.equal(status.textContent, 'Showing 1 commercial concept gallery item.');
});

test('all restores every gallery item', () => {
  const { buttons, cards, status } = setup();
  buttons[1].click();
  buttons[0].click();

  assert.ok(cards.every((card) => !card.hidden));
  assert.equal(status.textContent, 'Showing all 3 concept gallery items.');
});
