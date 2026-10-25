'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Recipes = require('../js/recipes.js');

const { BASE_ELEMENTS, RECIPES, combine, allElements } = Recipes;

test('combine works regardless of argument order', () => {
  assert.equal(combine('Fire', 'Water'), 'Steam');
  assert.equal(combine('Water', 'Fire'), 'Steam');
});

test('an element can be combined with itself', () => {
  assert.equal(combine('Water', 'Water'), 'Sea');
  assert.equal(combine('Earth', 'Earth'), 'Mountain');
});

test('pairs with no recipe return null', () => {
  assert.equal(combine('Fire', 'Fire'), null);
  assert.equal(combine('Human', 'Sun'), null);
});

test('no two recipes share the same ingredients', () => {
  const keys = RECIPES.map(([a, b]) => [a, b].sort().join('+'));
  assert.equal(new Set(keys).size, keys.length);
});

test('every element is reachable from the base elements', () => {
  const known = new Set(BASE_ELEMENTS);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [a, b, result] of RECIPES) {
      if (known.has(a) && known.has(b) && !known.has(result)) {
        known.add(result);
        changed = true;
      }
    }
  }
  for (const name of allElements()) {
    assert.ok(known.has(name), `${name} cannot be created from the base elements`);
  }
});

test('allElements includes base elements and every recipe result', () => {
  const all = new Set(allElements());
  for (const base of BASE_ELEMENTS) assert.ok(all.has(base));
  for (const [, , result] of RECIPES) assert.ok(all.has(result));
});
