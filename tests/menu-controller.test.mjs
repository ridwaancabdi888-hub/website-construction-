import assert from 'node:assert/strict';
import test from 'node:test';

import { createMenuController } from '../menu-controller.mjs';

class FakeClassList {
  #values = new Set();

  contains(value) { return this.#values.has(value); }
  toggle(value, force) {
    const enabled = force ?? !this.#values.has(value);
    if (enabled) this.#values.add(value);
    else this.#values.delete(value);
    return enabled;
  }
}

class FakeElement {
  constructor(documentRef, { links = [], bars = [] } = {}) {
    this.documentRef = documentRef;
    this.links = links;
    this.bars = bars;
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.style = {};
  }

  addEventListener(type, listener) { this.listeners.set(type, listener); }
  dispatch(type) { this.listeners.get(type)?.({ type }); }
  focus() { this.documentRef.activeElement = this; }
  querySelectorAll(selector) { return selector === 'a' ? this.links : this.bars; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  toggleAttribute(name, force) {
    if (force) this.attributes.set(name, '');
    else this.attributes.delete(name);
  }
}

function setup() {
  const documentRef = {
    activeElement: null,
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
  };
  const mobileQuery = {
    matches: true,
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
  };
  const links = [new FakeElement(documentRef), new FakeElement(documentRef)];
  const bars = [{ style: {} }, { style: {} }, { style: {} }];
  const menu = new FakeElement(documentRef, { links });
  const toggle = new FakeElement(documentRef, { bars });
  const controller = createMenuController({ toggle, menu, mobileQuery, documentRef });
  return { controller, documentRef, links, menu, mobileQuery, toggle };
}

function keydown(documentRef, key, shiftKey = false) {
  let prevented = false;
  documentRef.listeners.get('keydown')({
    key,
    shiftKey,
    preventDefault() { prevented = true; },
  });
  return prevented;
}

test('closed mobile menu is removed from keyboard navigation', () => {
  const { menu } = setup();
  assert.ok(menu.attributes.has('inert'));
  assert.equal(menu.classList.contains('open'), false);
});

test('opening focuses the first link and exposes the menu', () => {
  const { controller, documentRef, links, menu, toggle } = setup();
  toggle.dispatch('click');

  assert.equal(controller.isOpen(), true);
  assert.equal(toggle.attributes.get('aria-expanded'), 'true');
  assert.equal(toggle.attributes.get('aria-label'), 'Close navigation menu');
  assert.equal(menu.attributes.has('inert'), false);
  assert.equal(documentRef.activeElement, links[0]);
});

test('Tab and Shift+Tab wrap focus inside the open menu', () => {
  const { documentRef, links, toggle } = setup();
  toggle.dispatch('click');

  links.at(-1).focus();
  assert.equal(keydown(documentRef, 'Tab'), true);
  assert.equal(documentRef.activeElement, toggle);

  toggle.focus();
  assert.equal(keydown(documentRef, 'Tab', true), true);
  assert.equal(documentRef.activeElement, links.at(-1));
});

test('Escape closes the menu and restores toggle focus', () => {
  const { controller, documentRef, menu, toggle } = setup();
  toggle.dispatch('click');

  assert.equal(keydown(documentRef, 'Escape'), true);
  assert.equal(controller.isOpen(), false);
  assert.ok(menu.attributes.has('inert'));
  assert.equal(documentRef.activeElement, toggle);
});

test('desktop viewport keeps navigation available and closes mobile state', () => {
  const { controller, menu, mobileQuery, toggle } = setup();
  toggle.dispatch('click');
  mobileQuery.matches = false;
  mobileQuery.listeners.get('change')();

  assert.equal(controller.isOpen(), false);
  assert.equal(menu.attributes.has('inert'), false);
});
