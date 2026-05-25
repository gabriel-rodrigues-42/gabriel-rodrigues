import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const headerPath = resolve(process.cwd(), 'src/components/Header.astro');
const enJsonPath = resolve(process.cwd(), 'src/i18n/en.json');
const ptJsonPath = resolve(process.cwd(), 'src/i18n/pt.json');

const headerSource = readFileSync(headerPath, 'utf8');
const en = JSON.parse(readFileSync(enJsonPath, 'utf8'));
const pt = JSON.parse(readFileSync(ptJsonPath, 'utf8'));

test('nav labels contract: header uses GitHub and removes Projects link', () => {
  assert.match(headerSource, /t\('nav\.github'\)/);
  assert.doesNotMatch(headerSource, /t\('nav\.projects'\)/);
  assert.ok(headerSource.includes('href="https://github.com/gabriel-rodrigues-42"'));
});

test('active-state contract: active states are evaluated properly', () => {
  assert.doesNotMatch(headerSource, /isProjectsSurface/);
  assert.doesNotMatch(headerSource, /currentPath\.includes\('\/projects'\)/);
});

test('i18n parity: nav labels and primitives exist in EN/PT with matching keys', () => {
  const primitiveKeys = ['nav.home', 'nav.resume', 'nav.blog', 'nav.github', 'lang.switch'];

  for (const key of primitiveKeys) {
    assert.equal(typeof en[key], 'string', `EN missing key: ${key}`);
    assert.equal(typeof pt[key], 'string', `PT missing key: ${key}`);
    assert.ok(en[key].trim().length > 0, `EN empty value: ${key}`);
    assert.ok(pt[key].trim().length > 0, `PT empty value: ${key}`);
  }
});
