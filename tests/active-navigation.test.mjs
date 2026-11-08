import assert from 'node:assert/strict';
import test from 'node:test';

import { createActiveNavigation } from '../active-navigation.mjs';

class FakeLink {
  constructor(href) {
    this.href = href;
    this.style = {};
    this.attributes = new Map();
  }

  getAttribute(name) { return name === 'href' ? this.href : this.attributes.get(name); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  removeAttribute(name) { this.attributes.delete(name); }
}

function setup({ scrollY = 0 } = {}) {
  const listeners = new Map();
  const frames = [];
  const windowRef = {
    scrollY,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {},
  };
  const sections = [
    { id: 'home', offsetTop: 0 },
    { id: 'services', offsetTop: 500 },
    { id: 'contact', offsetTop: 1000 },
  ];
  const links = sections.map(({ id }) => new FakeLink(`#${id}`));
  const controller = createActiveNavigation({ sections, links, windowRef });
  return { controller, frames, links, listeners, windowRef };
}

test('marks the current section on initial page load', () => {
  const { links } = setup({ scrollY: 520 });

  assert.equal(links[1].attributes.get('aria-current'), 'location');
  assert.equal(links[1].style.color, 'var(--blue)');
  assert.equal(links[0].attributes.has('aria-current'), false);
});

test('uses the first section when the page is above its offset', () => {
  const { links } = setup({ scrollY: 0 });

  assert.equal(links[0].attributes.get('aria-current'), 'location');
});

test('coalesces repeated scroll events into one animation frame', () => {
  const { frames, links, listeners, windowRef } = setup();
  windowRef.scrollY = 950;

  listeners.get('scroll')();
  listeners.get('scroll')();
  assert.equal(frames.length, 1);

  frames.shift()();
  assert.equal(links[2].attributes.get('aria-current'), 'location');
  assert.equal(links[0].attributes.has('aria-current'), false);
});

test('refreshes section positions after resize and load', () => {
  const { frames, links, listeners, windowRef } = setup({ scrollY: 450 });
  assert.equal(links[1].attributes.get('aria-current'), 'location');

  windowRef.scrollY = 0;
  listeners.get('resize')();
  frames.shift()();
  assert.equal(links[0].attributes.get('aria-current'), 'location');

  windowRef.scrollY = 950;
  listeners.get('load')();
  frames.shift()();
  assert.equal(links[2].attributes.get('aria-current'), 'location');
});

test('ignores unmatched links and removes listeners on cleanup', () => {
  const { controller, links, listeners } = setup();
  links.push(new FakeLink('https://example.com'));

  controller.destroy();
  assert.equal(listeners.size, 0);
});
