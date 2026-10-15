import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const index = readFileSync(resolve(root, 'index.html'), 'utf8');
const notFound = readFileSync(resolve(root, '404.html'), 'utf8');
const robots = readFileSync(resolve(root, 'robots.txt'), 'utf8');
const script = readFileSync(resolve(root, 'script.js'), 'utf8');
const menuController = readFileSync(resolve(root, 'menu-controller.mjs'), 'utf8');

const attrValues = (html, attribute) => [
  ...html.matchAll(new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'gi')),
].map((match) => match[1]);

test('all local HTML assets exist', () => {
  for (const html of [index, notFound]) {
    for (const value of [...attrValues(html, 'src'), ...attrValues(html, 'href')]) {
      if (/^(?:[a-z]+:|#|\/\/|data:)/i.test(value)) continue;
      const assetPath = value.split(/[?#]/, 1)[0];
      assert.ok(existsSync(resolve(root, assetPath)), `Missing local asset: ${assetPath}`);
    }
  }
});

test('every internal fragment link targets an existing id', () => {
  const ids = new Set(attrValues(index, 'id'));
  const fragments = attrValues(index, 'href')
    .filter((href) => href.startsWith('#') && href.length > 1)
    .map((href) => decodeURIComponent(href.slice(1)));

  assert.ok(fragments.length > 0, 'Expected internal navigation links');
  for (const fragment of fragments) {
    assert.ok(ids.has(fragment), `Missing target id for #${fragment}`);
  }
});

test('hard-coded JavaScript id lookups exist in the page', () => {
  const ids = new Set(attrValues(index, 'id'));
  const selectors = [...script.matchAll(/getElementById\(["']([^"']+)["']\)/g)]
    .map((match) => match[1]);

  assert.ok(selectors.length > 0, 'Expected JavaScript id lookups');
  for (const selector of selectors) {
    assert.ok(ids.has(selector), `JavaScript references missing id: ${selector}`);
  }
});

test('legacy pages remain non-indexed and point to the canonical site', () => {
  const canonical = 'https://ramad-construction-real-estate.vercel.app/';

  assert.match(index, /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i);
  assert.match(index, new RegExp(`<link\\s+rel=["']canonical["'][^>]*href=["']${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i'));
  assert.match(notFound, /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i);
  assert.match(notFound, new RegExp(canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.doesNotMatch(robots, /Disallow:\s*\//i);
});

test('unverified content and the demo form remain clearly disclosed', () => {
  assert.match(index, /stock images are design references, not verified RAMAD client projects/i);
  assert.match(index, /Verified company statistics have not been supplied/i);
  assert.match(index, /Demo only: no message was sent or stored/i);
  assert.doesNotMatch(index, /<form[^>]+action=/i);
});

test('menu and contact form retain accessible semantics', () => {
  assert.match(index, /<a[^>]+class=["']skip-link["'][^>]+href=["']#main-content["']/i);
  assert.match(index, /id=["']menuToggle["'][^>]+aria-controls=["']navLinks["'][^>]+aria-expanded=["']false["']/i);
  assert.match(menuController, /event\.key === 'Escape'/);
  assert.match(menuController, /event\.key !== 'Tab'/);
  assert.match(menuController, /toggleAttribute\('inert'/);
  assert.match(script, /setAttribute\('aria-pressed', 'true'\)/);

  for (const id of ['contact-name', 'contact-phone', 'contact-email', 'contact-service', 'contact-message']) {
    assert.match(index, new RegExp(`<label\\s+for=["']${id}["']`, 'i'));
    assert.match(index, new RegExp(`<(?:input|select|textarea)[^>]+id=["']${id}["']`, 'i'));
  }
  assert.match(index, /id=["']formSuccess["'][^>]+role=["']status["'][^>]+aria-live=["']polite["']/i);
});

test('new-tab links prevent opener access', () => {
  const openingTags = [...index.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)]
    .map((match) => match[0]);

  assert.ok(openingTags.length > 0, 'Expected at least one new-tab link');
  for (const tag of openingTags) {
    assert.match(tag, /rel=["'][^"']*noopener[^"']*["']/i, `Unsafe new-tab link: ${tag}`);
  }
});
