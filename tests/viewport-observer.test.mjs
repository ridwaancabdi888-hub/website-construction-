import assert from 'node:assert/strict';
import test from 'node:test';

import { activateWhenVisible } from '../viewport-observer.mjs';

class FakeObserver {
  static instances = [];

  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observed = [];
    this.unobserved = [];
    FakeObserver.instances.push(this);
  }

  observe(target) { this.observed.push(target); }
  unobserve(target) { this.unobserved.push(target); }
  emit(entries) { this.callback(entries); }
}

test('activates every target immediately when IntersectionObserver is unavailable', () => {
  const targets = [{ id: 1 }, { id: 2 }];
  const activated = [];

  const observer = activateWhenVisible({
    elements: targets,
    onVisible: target => activated.push(target.id),
    Observer: undefined,
  });

  assert.equal(observer, null);
  assert.deepEqual(activated, [1, 2]);
});

test('observes targets and activates only intersecting entries once', () => {
  FakeObserver.instances.length = 0;
  const first = { id: 1 };
  const second = { id: 2 };
  const activated = [];

  const observer = activateWhenVisible({
    elements: [first, second],
    onVisible: target => activated.push(target.id),
    Observer: FakeObserver,
    options: { threshold: 0.5 },
  });

  assert.deepEqual(observer.observed, [first, second]);
  assert.deepEqual(observer.options, { threshold: 0.5 });

  observer.emit([
    { target: first, isIntersecting: false },
    { target: second, isIntersecting: true },
  ]);

  assert.deepEqual(activated, [2]);
  assert.deepEqual(observer.unobserved, [second]);
});

test('does not create an observer when there are no targets', () => {
  FakeObserver.instances.length = 0;
  const observer = activateWhenVisible({
    elements: [],
    onVisible() {},
    Observer: FakeObserver,
  });

  assert.equal(observer, null);
  assert.equal(FakeObserver.instances.length, 0);
});
